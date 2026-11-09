export type DatabaseSettings = {
  type: "postgresql" | "mysql";
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseDatabaseSettings(value: unknown): DatabaseSettings {
  if (!isRecord(value)) {
    throw new Error("Database settings must be an object.");
  }

  if (value.type !== "postgresql" && value.type !== "mysql") {
    throw new Error('Database type must be "postgresql" or "mysql".');
  }

  if (
    typeof value.host !== "string" ||
    value.host.trim().length === 0 ||
    value.host.length > 255 ||
    typeof value.port !== "number" ||
    !Number.isInteger(value.port) ||
    value.port < 1 ||
    value.port > 65535 ||
    typeof value.database !== "string" ||
    value.database.trim().length === 0 ||
    value.database.length > 128 ||
    typeof value.username !== "string" ||
    value.username.trim().length === 0 ||
    value.username.length > 128 ||
    typeof value.password !== "string" ||
    value.password.length > 1024
  ) {
    throw new Error("Database connection settings are incomplete or invalid.");
  }

  return {
    type: value.type,
    host: value.host.trim(),
    port: value.port,
    database: value.database.trim(),
    username: value.username.trim(),
    password: value.password,
  };
}
