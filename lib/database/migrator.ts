import type { ForumConfig } from "./config";
import { readForumConfig } from "./config";
import { createKnexClient } from "./connection";

export type MigrationStatus = {
  completed: string[];
  pending: string[];
};

function getMigrationNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("Knex returned an invalid migration list.");
  }
  return value.map((item) => {
    if (typeof item === "string") {
      return item;
    }
    if (typeof item === "object" && item !== null) {
      if ("name" in item && typeof item.name === "string") return item.name;
      if ("file" in item && typeof item.file === "string") return item.file;
    }
    throw new Error("Knex returned a migration without a usable name.");
  });
}

async function listMigrationNames(database: ReturnType<typeof createKnexClient>) {
  const result: unknown = await database.migrate.list();
  if (!Array.isArray(result) || result.length !== 2) {
    throw new Error("Knex returned an invalid migration status result.");
  }

  return {
    completed: getMigrationNames(result[0]),
    pending: getMigrationNames(result[1]),
  };
}

export async function getMigrationStatusForDatabase(
  settings: ForumConfig["database"],
  migrationTableName?: string,
): Promise<MigrationStatus> {
  const database = createKnexClient(settings, migrationTableName);
  try {
    const { completed, pending } = await listMigrationNames(database);
    return {
      completed,
      pending,
    };
  } finally {
    await database.destroy();
  }
}

export async function runMigrationsForDatabase(
  settings: ForumConfig["database"],
  migrationTableName?: string,
  onMigrationComplete?: (name: string) => void,
): Promise<{
  migrations: string[];
}> {
  const database = createKnexClient(settings, migrationTableName);
  try {
    const migrations: string[] = [];

    while (true) {
      const { pending } = await listMigrationNames(database);
      if (pending.length === 0) break;

      const [, completed] = await database.migrate.up();
      const completedNames = getMigrationNames(completed);
      if (completedNames.length === 0) {
        const { pending: remaining } = await listMigrationNames(database);
        if (remaining.length === 0) break;
        throw new Error("Knex did not apply the next pending migration.");
      }

      for (const name of completedNames) {
        migrations.push(name);
        onMigrationComplete?.(name);
      }
    }

    return {
      migrations: getMigrationNames(migrations),
    };
  } finally {
    await database.destroy();
  }
}

export async function runMigrations(config: ForumConfig): Promise<{
  migrations: string[];
}> {
  return runMigrationsForDatabase(config.database, config.migrationTableName);
}

export async function runConfiguredMigrations(): Promise<{
  migrations: string[];
} | null> {
  const config = await readForumConfig();
  if (!config.autoMigrateOnStartup) return null;
  return runMigrations(config);
}
