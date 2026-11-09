import { NextResponse, type NextRequest } from "next/server";
import { parseForumDetails } from "@/lib/database/config";
import { parseDatabaseSettings } from "@/lib/database/database-settings";
import {
  completeInitialSetup,
  SetupNotReadyError,
  type InitialAdministrator,
  type SetupCompletionInput,
} from "@/lib/database/initial-setup";
import { authorizeSetupRequest } from "../setup-api";

function parseAdministrator(value: unknown): InitialAdministrator {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Administrator details are required.");
  }
  if (
    !("username" in value) ||
    typeof value.username !== "string" ||
    !("email" in value) ||
    typeof value.email !== "string" ||
    !("password" in value) ||
    typeof value.password !== "string"
  ) {
    throw new Error("Administrator details are incomplete.");
  }

  const username = value.username.trim();
  const email = value.email.trim().toLowerCase();
  if (!username || username.length > 32 || /[\u0000-\u001f\u007f]/.test(username)) {
    throw new Error("Administrator username must be between 1 and 32 characters.");
  }
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Enter a valid administrator email address.");
  }
  if (value.password.length < 8 || value.password.length > 1024) {
    throw new Error("Administrator password must be between 8 and 1024 characters.");
  }

  return { username, email, password: value.password };
}

export async function POST(request: NextRequest) {
  const authorizationError = await authorizeSetupRequest(request);
  if (authorizationError) return authorizationError;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let input: SetupCompletionInput;
  try {
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      throw new Error("Setup details are required.");
    }
    if (!("database" in payload) || !("forum" in payload) || !("administrator" in payload)) {
      throw new Error("Setup details are incomplete.");
    }
    if (
      !("autoMigrateOnStartup" in payload) ||
      typeof payload.autoMigrateOnStartup !== "boolean"
    ) {
      throw new Error("Auto-migrate setting must be a boolean.");
    }

    input = {
      database: parseDatabaseSettings(payload.database),
      forum: parseForumDetails(payload.forum),
      administrator: parseAdministrator(payload.administrator),
      autoMigrateOnStartup: payload.autoMigrateOnStartup,
    };
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Setup details are invalid.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    await completeInitialSetup(input);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SetupNotReadyError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }
    console.error("Could not complete forum setup.", error);
    return NextResponse.json(
      { error: "Could not finish forum setup. Check the server logs and try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
