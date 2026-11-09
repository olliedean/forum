import type { ForumConfig } from "./config";
import { readForumConfig } from "./config";
import { createKnexClient, testDatabaseSettings } from "./connection";

function migrationNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      typeof item.name === "string"
    ) {
      return [item.name];
    }
    return [];
  });
}

export type MigrationStatus = {
  currentVersion: string;
  completed: string[];
  pending: string[];
};

export async function testDatabaseConnection(config: ForumConfig): Promise<void> {
  await testDatabaseSettings(config.database);
}

export async function getMigrationStatus(config: ForumConfig): Promise<MigrationStatus> {
  const database = createKnexClient(config.database, config.migrationTableName);
  try {
    const result: unknown = await database.migrate.list();
    if (!Array.isArray(result) || result.length !== 2) {
      throw new Error("Knex returned an invalid migration status result.");
    }
    const [completed, pending] = result;
    const version = await database.migrate.currentVersion();

    return {
      currentVersion: version,
      completed: migrationNames(completed),
      pending: migrationNames(pending),
    };
  } finally {
    await database.destroy();
  }
}

export async function runMigrations(config: ForumConfig): Promise<{
  batch: number;
  migrations: string[];
}> {
  const database = createKnexClient(config.database, config.migrationTableName);
  try {
    const [batch, migrations] = await database.migrate.latest();
    return {
      batch,
      migrations: migrationNames(migrations),
    };
  } finally {
    await database.destroy();
  }
}

export async function runConfiguredMigrations(): Promise<{
  batch: number;
  migrations: string[];
} | null> {
  const config = await readForumConfig();
  if (!config.autoMigrateOnStartup) return null;
  return runMigrations(config);
}
