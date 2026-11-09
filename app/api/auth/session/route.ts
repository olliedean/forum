import type { NextRequest } from "next/server";
import { clearSessionCookie, noStoreJson } from "@/lib/auth/auth-api";
import {
  getSessionUser,
  sessionCookieName,
} from "@/lib/auth/session";
import { readForumConfig } from "@/lib/database/config";
import { createKnexClient } from "@/lib/database/connection";
import { isForumConfigReady } from "@/lib/database/setup-state";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  if (!token || !(await isForumConfigReady())) {
    return noStoreJson({ user: null });
  }

  try {
    const config = await readForumConfig();
    const database = createKnexClient(config.database, config.migrationTableName);
    try {
      const user = await getSessionUser(database, token);
      const response = noStoreJson({ user });
      if (!user) clearSessionCookie(response);
      return response;
    } finally {
      await database.destroy();
    }
  } catch (error) {
    console.error("Could not load the current forum session.", error);
    return noStoreJson(
      { error: "Could not check the current session." },
      { status: 503 },
    );
  }
}
