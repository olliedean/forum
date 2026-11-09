import knex, { type Knex } from "knex";
import type { DatabaseSettings } from "./database-settings";

export function createKnexClient(
  settings: DatabaseSettings,
  migrationTableName?: string,
): Knex {
  return knex({
    client: settings.type === "postgresql" ? "pg" : "mysql2",
    connection: {
      host: settings.host,
      port: settings.port,
      user: settings.username,
      password: settings.password,
      database: settings.database,
      ...(settings.type === "postgresql"
        ? { connectionTimeoutMillis: 10_000 }
        : { connectTimeout: 10_000 }),
    },
    pool: { min: 0, max: 5 },
    acquireConnectionTimeout: 10_000,
    migrations: {
      tableName: migrationTableName ?? "forum_migrations",
      directory: "lib/database/migrations",
    },
  });
}

export async function testDatabaseSettings(settings: DatabaseSettings): Promise<void> {
  const database = createKnexClient(settings);
  try {
    await database.raw("select 1");
  } finally {
    await database.destroy();
  }
}
