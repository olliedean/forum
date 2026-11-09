import type { NextRequest } from "next/server";
import {
  authorizeAuthMutation,
  clearSessionCookie,
  noStoreJson,
} from "@/lib/auth/auth-api";
import { deleteSession, sessionCookieName } from "@/lib/auth/session";
import { isForumConfigReady } from "@/lib/database/setup-state";
import { readForumConfig } from "@/lib/database/config";
import { createKnexClient } from "@/lib/database/connection";

export async function POST(request: NextRequest) {
  const authorizationError = authorizeAuthMutation(request);
  if (authorizationError) return authorizationError;

  const token = request.cookies.get(sessionCookieName)?.value;
  if (!token) return noStoreJson({ ok: true });

  if (!(await isForumConfigReady())) {
    const response = noStoreJson({ ok: true });
    clearSessionCookie(response);
    return response;
  }

  try {
    const config = await readForumConfig();
    const database = createKnexClient(config.database, config.migrationTableName);
    try {
      await deleteSession(database, token);
    } finally {
      await database.destroy();
    }
    const response = noStoreJson({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Forum account logout failed.", error);
    const response = noStoreJson(
      { error: "Could not end the session. Please try again." },
      { status: 503 },
    );
    clearSessionCookie(response);
    return response;
  }
}
