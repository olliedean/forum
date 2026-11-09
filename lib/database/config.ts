import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseDatabaseSettings,
  type DatabaseSettings,
} from "./database-settings";

export type ForumConfig = {
  database: DatabaseSettings;
  autoMigrateOnStartup: boolean;
  migrationTableName?: string;
};

export type { DatabaseSettings };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseForumConfig(value: unknown): ForumConfig {
  if (!isRecord(value)) {
    throw new Error("Forum config must contain a database object.");
  }

  const database = parseDatabaseSettings(value.database);

  if (
    value.autoMigrateOnStartup !== undefined &&
    typeof value.autoMigrateOnStartup !== "boolean"
  ) {
    throw new Error("Forum config autoMigrateOnStartup must be a boolean.");
  }

  if (
    value.migrationTableName !== undefined &&
    (typeof value.migrationTableName !== "string" ||
      !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.migrationTableName))
  ) {
    throw new Error("Forum config migrationTableName is invalid.");
  }

  return {
    database: {
      type: database.type,
      host: database.host,
      port: database.port,
      database: database.database,
      username: database.username,
      password: database.password,
    },
    autoMigrateOnStartup: value.autoMigrateOnStartup ?? false,
    ...(typeof value.migrationTableName === "string"
      ? { migrationTableName: value.migrationTableName }
      : {}),
  };
}

export async function readForumConfig(
  configPath = join(process.cwd(), "config.json"),
): Promise<ForumConfig> {
  let contents: string;
  try {
    contents = await readFile(configPath, "utf8");
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") {
      throw new Error(`Forum config was not found at ${configPath}.`, { cause: error });
    }
    throw new Error(`Could not read forum config at ${configPath}.`, { cause: error });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Forum config at ${configPath} is not valid JSON.`, { cause: error });
  }

  return parseForumConfig(parsed);
}
