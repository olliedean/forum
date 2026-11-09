import { NextResponse, type NextRequest } from "next/server";
import { parseDatabaseSettings } from "@/lib/database/database-settings";
import { getMigrationStatusForDatabase } from "@/lib/database/migrator";
import { authorizeSetupRequest } from "../../setup-api";

export async function POST(request: NextRequest) {
  const authorizationError = await authorizeSetupRequest(request);
  if (authorizationError) return authorizationError;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Could not read forum migration status.", error);
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let databaseSettings;
  try {
    if (typeof payload !== "object" || payload === null || !("database" in payload)) {
      throw new Error("Database settings are required.");
    }
    databaseSettings = parseDatabaseSettings(payload.database);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Database settings are invalid.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const status = await getMigrationStatusForDatabase(databaseSettings);
    return NextResponse.json(status, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not read the migration status from the database." },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }
}
