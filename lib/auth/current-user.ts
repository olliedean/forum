import "server-only";

import { cookies } from "next/headers";
import { readForumConfig } from "@/lib/database/config";
import { createKnexClient } from "@/lib/database/connection";
import {
  getSessionUser,
  sessionCookieName,
  type AuthenticatedUser,
} from "./session";

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  const config = await readForumConfig();
  const database = createKnexClient(config.database, config.migrationTableName);
  try {
    return await getSessionUser(database, token);
  } finally {
    await database.destroy();
  }
}
