import type { NextRequest } from "next/server";
import {
  AuthRequestError,
  authorizeAuthMutation,
  getPayloadRecord,
  noStoreJson,
  readAuthJson,
  setSessionCookie,
} from "@/lib/auth/auth-api";
import { loginWithPassword } from "@/lib/auth/accounts";
import { readForumConfig } from "@/lib/database/config";
import { createKnexClient } from "@/lib/database/connection";

function parseCredentials(value: unknown) {
  const body = getPayloadRecord(value);
  if (
    typeof body.email !== "string" ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
    typeof body.password !== "string" ||
    body.password.length === 0 ||
    body.password.length > 1024 ||
    (body.remember !== undefined && typeof body.remember !== "boolean")
  ) {
    throw new AuthRequestError("Enter a valid email address and password.", 400);
  }
  return {
    email: body.email,
    password: body.password,
    remember: body.remember === true,
  };
}

export async function POST(request: NextRequest) {
  const authorizationError = authorizeAuthMutation(request);
  if (authorizationError) return authorizationError;

  try {
    const credentials = parseCredentials(await readAuthJson(request));
    const config = await readForumConfig();
    const database = createKnexClient(config.database, config.migrationTableName);
    try {
      const result = await loginWithPassword(
        database,
        credentials.email,
        credentials.password,
        credentials.remember,
        request,
      );
      if (!result) {
        return noStoreJson(
          { error: "Email or password is incorrect." },
          { status: 401 },
        );
      }

      const response = noStoreJson({ user: result.user });
      setSessionCookie(response, result.session);
      return response;
    } finally {
      await database.destroy();
    }
  } catch (error) {
    if (error instanceof AuthRequestError) {
      return noStoreJson({ error: error.message }, { status: error.status });
    }
    console.error("Forum account login failed.", error);
    return noStoreJson(
      { error: "Could not sign in. Please try again later." },
      { status: 503 },
    );
  }
}
