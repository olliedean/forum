import { createHash, randomBytes } from "node:crypto";
import type { Knex } from "knex";
import type { NextRequest } from "next/server";

export const sessionCookieName = "forum_session";
export const sessionDurationSeconds = 24 * 60 * 60;
export const rememberedSessionDurationSeconds = 30 * 24 * 60 * 60;

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  ranks: string[];
};

export type AccountUser = Pick<AuthenticatedUser, "id" | "username" | "email">;

function parseUserRanks(value: unknown): string[] {
  let ranks: unknown;
  try {
    ranks = typeof value === "string" ? JSON.parse(value) : value;
  } catch (error) {
    throw new Error("Stored user ranks are not valid JSON.", { cause: error });
  }
  if (!Array.isArray(ranks) || !ranks.every((rank) => typeof rank === "string")) {
    throw new Error("Stored user ranks must be an array of strings.");
  }
  return ranks;
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getRequestMetadata(request: NextRequest) {
  const forwardedAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedAddress ?? request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");

  return {
    ip_address: address && address.length <= 45 ? address : null,
    user_agent: userAgent?.slice(0, 2048) ?? null,
  };
}

export async function createSession(
  transaction: Knex.Transaction,
  userId: string | number,
  request: NextRequest,
  remember: boolean,
) {
  await transaction("sessions").where("expires_at", "<=", new Date()).delete();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() +
      (remember ? rememberedSessionDurationSeconds : sessionDurationSeconds) * 1000,
  );

  await transaction("sessions").insert({
    user_id: userId,
    token_hash: hashSessionToken(token),
    ...getRequestMetadata(request),
    last_seen_at: new Date(),
    expires_at: expiresAt,
  });

  return { token, expiresAt, remember };
}

export function getSessionTokenHash(token: string): string | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return hashSessionToken(token);
}

export async function getSessionUser(
  database: Knex,
  token: string,
): Promise<AuthenticatedUser | null> {
  const tokenHash = getSessionTokenHash(token);
  if (!tokenHash) return null;

  const session = await database("sessions")
    .join("users", "sessions.user_id", "users.id")
    .select(
      "sessions.id as session_id",
      "users.id as user_id",
      "users.username",
      "users.email",
      "users.ranks",
    )
    .where("sessions.token_hash", tokenHash)
    .andWhere("sessions.expires_at", ">", new Date())
    .first();
  if (!session) return null;

  await database("sessions")
    .where({ id: session.session_id })
    .update({ last_seen_at: new Date() });

  return {
    id: String(session.user_id),
    username: session.username,
    email: session.email,
    ranks: parseUserRanks(session.ranks),
  };
}

export async function deleteSession(database: Knex, token: string): Promise<void> {
  const tokenHash = getSessionTokenHash(token);
  if (!tokenHash) return;
  await database("sessions").where({ token_hash: tokenHash }).delete();
}
