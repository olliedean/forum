import { NextResponse, type NextRequest } from "next/server";
import { parseDatabaseSettings } from "@/lib/database/database-settings";
import {
  getMigrationStatusForDatabase,
  runMigrationsForDatabase,
} from "@/lib/database/migrator";
import { authorizeSetupRequest } from "../../setup-api";

type MigrationEvent =
  | { type: "start"; completed: string[]; pending: string[] }
  | { type: "migration-complete"; name: string }
  | { type: "complete"; batch: number; completed: string[] }
  | { type: "error"; message: string };

function encodeEvent(event: MigrationEvent) {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: NextRequest) {
  const authorizationError = await authorizeSetupRequest(request);
  if (authorizationError) return authorizationError;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Could not read forum migration status before running.", error);
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

  let initialStatus;
  try {
    initialStatus = await getMigrationStatusForDatabase(databaseSettings);
  } catch {
    return NextResponse.json(
      { error: "Could not read the migration status from the database." },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }

  let connected = true;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: MigrationEvent) => {
        if (connected) controller.enqueue(encodeEvent(event));
      };

      send({
        type: "start",
        completed: initialStatus.completed,
        pending: initialStatus.pending,
      });

      try {
        const result = await runMigrationsForDatabase(
          databaseSettings,
          undefined,
          (name) => send({ type: "migration-complete", name }),
        );
        const status = await getMigrationStatusForDatabase(databaseSettings);
        send({
          type: "complete",
          batch: result.batch,
          completed: status.completed,
        });
      } catch (error) {
        console.error("Forum database migration failed.", error);
        send({
          type: "error",
          message: "A migration failed. Check the server logs and database before retrying.",
        });
      } finally {
        if (connected) controller.close();
      }
    },
    cancel() {
      connected = false;
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
