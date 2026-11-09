import { NextResponse, type NextRequest } from "next/server";
import {
  AuthRequestError,
  authorizeAuthMutation,
  getPayloadRecord,
  noStoreJson,
  readAuthJson,
  setSessionCookie,
} from "@/lib/auth/auth-api";
import {
  DuplicateAccountError,
  registerWithPassword,
} from "@/lib/auth/accounts";
import { readForumConfig } from "@/lib/database/config";
import { createKnexClient } from "@/lib/database/connection";

function parseRegistration(value: unknown) {
  const body = getPayloadRecord(value);
  if (
    typeof body.username !== "string" ||
    !body.username.trim() ||
    body.username.trim().length > 32 ||
    /[\u0000-\u001f\u007f]/.test(body.username) ||
    typeof body.email !== "string" ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
    typeof body.password !== "string" ||
    body.password.length < 8 ||
    body.password.length > 1024 ||
    typeof body.confirmPassword !== "string" ||
    body.password !== body.confirmPassword
  ) {
    throw new AuthRequestError(
      "Enter a username, valid email, and matching passwords of at least 8 characters.",
      400,
    );
  }
  return {
    username: body.username.trim(),
    email: body.email.trim().toLowerCase(),
    password: body.password,
  };
}

export async function POST(request: NextRequest) {
  const authorizationError = authorizeAuthMutation(request);
  if (authorizationError) return authorizationError;

  try {
    const registration = parseRegistration(await readAuthJson(request));
    const config = await readForumConfig();
    const database = createKnexClient(config.database, config.migrationTableName);
    try {
      const result = await registerWithPassword(database, registration, request);
      const response = NextResponse.json(
        { user: result.user },
        { headers: { "Cache-Control": "no-store" }, status: 201 },
      );
      setSessionCookie(response, result.session);
      return response;
    } finally {
      await database.destroy();
    }
  } catch (error) {
    if (error instanceof AuthRequestError) {
      return noStoreJson({ error: error.message }, { status: error.status });
    }
    if (error instanceof DuplicateAccountError) {
      return noStoreJson(
        { error: "That username or email address is already in use." },
        { status: 409 },
      );
    }
    console.error("Forum account registration failed.", error);
    return noStoreJson(
      { error: "Could not create your account. Please try again later." },
      { status: 503 },
    );
  }
}
