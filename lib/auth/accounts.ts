import type { Knex } from "knex";
import type { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "./password";
import { createSession, type AccountUser } from "./session";

export class DuplicateAccountError extends Error {}

const dummyPasswordHash = hashPassword(randomBytes(32).toString("base64url"));

export type IssuedUserSession = {
  user: AccountUser;
  session: Awaited<ReturnType<typeof createSession>>;
};

export async function loginWithPassword(
  database: Knex,
  email: string,
  password: string,
  remember: boolean,
  request: NextRequest,
): Promise<IssuedUserSession | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const account = await database("users")
    .select("id", "username", "email", "password_hash")
    .whereRaw("LOWER(??) = ?", ["email", normalizedEmail])
    .first();
  const passwordHash = account?.password_hash ?? (await dummyPasswordHash);
  const passwordMatches = await verifyPassword(password, passwordHash);
  if (!account || !passwordMatches) {
    return null;
  }

  const session = await database.transaction((transaction) =>
    createSession(transaction, account.id, request, remember),
  );
  return {
    user: {
      id: String(account.id),
      username: account.username,
      email: account.email,
    },
    session,
  };
}

export async function registerWithPassword(
  database: Knex,
  input: { username: string; email: string; password: string },
  request: NextRequest,
): Promise<IssuedUserSession> {
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);

  try {
    return await database.transaction(async (transaction) => {
      const existing = await transaction("users")
        .select("id")
        .whereRaw("LOWER(??) = ?", ["username", username])
        .orWhereRaw("LOWER(??) = ?", ["email", email])
        .first();
      if (existing) throw new DuplicateAccountError();

      await transaction("users").insert({
        username,
        email,
        password_hash: passwordHash,
      });

      const account = await transaction("users")
        .select("id", "username", "email")
        .where({ username })
        .first();
      if (!account) throw new Error("Created forum account could not be loaded.");

      const session = await createSession(transaction, account.id, request, false);
      return {
        user: {
          id: String(account.id),
          username: account.username,
          email: account.email,
        },
        session,
      };
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error.code === "23505" || error.code === "ER_DUP_ENTRY")
    ) {
      throw new DuplicateAccountError();
    }
    throw error;
  }
}
