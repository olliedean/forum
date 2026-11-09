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
  forum?: ForumDetails;
};

export type { DatabaseSettings };

export type ForumDetails = {
  name: string;
  url: string;
  contactEmail: string;
  timezone: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseForumDetails(value: unknown): ForumDetails {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    value.name.length > 100 ||
    /[\u0000-\u001f\u007f]/.test(value.name) ||
    typeof value.url !== "string" ||
    value.url.length > 2048 ||
    typeof value.contactEmail !== "string" ||
    value.contactEmail.length > 254 ||
    typeof value.timezone !== "string"
  ) {
    throw new Error("Forum config forum details are invalid.");
  }

  let url: URL;
  try {
    url = new URL(value.url);
  } catch {
    throw new Error("Forum config forum URL is invalid.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Forum config forum URL must use HTTP or HTTPS.");
  }
  if (url.username || url.password) {
    throw new Error("Forum config forum URL cannot include credentials.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contactEmail)) {
    throw new Error("Forum config contact email is invalid.");
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value.timezone });
  } catch {
    throw new Error("Forum config timezone is invalid.");
  }

  return {
    name: value.name.trim(),
    url: url.toString().replace(/\/$/, ""),
    contactEmail: value.contactEmail.trim().toLowerCase(),
    timezone: value.timezone,
  };
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
    ...(value.forum === undefined ? {} : { forum: parseForumDetails(value.forum) }),
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
