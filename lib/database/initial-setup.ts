import { link, open, readFile, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { join } from "node:path";
import { hashPassword } from "@/lib/auth/password";
import { parseForumConfig, type ForumConfig, type ForumDetails } from "./config";
import { createKnexClient } from "./connection";
import type { DatabaseSettings } from "./database-settings";
import { getMigrationStatusForDatabase } from "./migrator";

export type InitialAdministrator = {
  username: string;
  email: string;
  password: string;
};

export class SetupNotReadyError extends Error {}

type SavedSetup = {
  forum: ForumDetails;
  autoMigrateOnStartup: boolean;
};

export type SetupCompletionInput = {
  database: DatabaseSettings;
  forum: ForumDetails;
  administrator: InitialAdministrator;
  autoMigrateOnStartup: boolean;
};

const setupSettingKeys = [
  "forum_name",
  "forum_url",
  "contact_email",
  "timezone",
  "auto_migrate_on_startup",
] as const;

function readSavedSetup(settings: Array<{ key: string; value: string }>): SavedSetup {
  const values = new Map(settings.map(({ key, value }) => [key, value]));
  const name = values.get("forum_name");
  const url = values.get("forum_url");
  const contactEmail = values.get("contact_email");
  const timezone = values.get("timezone");
  const autoMigrate = values.get("auto_migrate_on_startup");
  if (
    name === undefined ||
    url === undefined ||
    contactEmail === undefined ||
    timezone === undefined ||
    autoMigrate === undefined
  ) {
    throw new Error("The existing setup record is incomplete.");
  }
  if (autoMigrate !== "true" && autoMigrate !== "false") {
    throw new Error("The existing auto-migration setting is invalid.");
  }

  return {
    forum: { name, url, contactEmail, timezone },
    autoMigrateOnStartup: autoMigrate === "true",
  };
}

async function saveInitialSetup(
  databaseSettings: DatabaseSettings,
  forum: ForumDetails,
  administrator: InitialAdministrator,
  autoMigrateOnStartup: boolean,
): Promise<SavedSetup> {
  const migrationStatus = await getMigrationStatusForDatabase(databaseSettings);
  if (migrationStatus.pending.length > 0) {
    throw new SetupNotReadyError("Apply all pending database migrations before finishing setup.");
  }

  const database = createKnexClient(databaseSettings);
  try {
    return await database.transaction(async (transaction) => {
      const marker = await transaction("forum_settings")
        .where({ key: "setup_complete" })
        .first();
      if (marker) {
        const settings = await transaction("forum_settings")
          .whereIn("key", setupSettingKeys)
          .select("key", "value");
        return readSavedSetup(settings);
      }

      const users = await transaction("users").count({ count: "id" }).first();
      if (Number(users?.count ?? 0) > 0) {
        throw new SetupNotReadyError(
          "This database already contains users and cannot be initialized as a new forum.",
        );
      }

      const passwordHash = await hashPassword(administrator.password);
      await transaction("users").insert({
        username: administrator.username,
        email: administrator.email,
        password_hash: passwordHash,
        ranks: JSON.stringify(["admin"]),
      });
      const administratorRecord = await transaction("users")
        .where({ email: administrator.email })
        .first("id");
      if (!administratorRecord) {
        throw new Error("Could not find the administrator after creating the account.");
      }

      const defaultCategory = await transaction("categories")
        .where({ name: "General" })
        .whereExists(function () {
          this.select("*")
            .from("threads")
            .whereRaw("threads.category_id = categories.id")
            .where({ title: "Welcome to the forum" });
        })
        .orderBy("id", "desc")
        .first("id");

      if (defaultCategory) {
        const defaultThreads = transaction("threads")
          .where({ category_id: defaultCategory.id, title: "Welcome to the forum" })
          .whereNull("user_id")
          .update({ user_id: administratorRecord.id });
        const threadIds = transaction("threads")
          .select("id")
          .where({ category_id: defaultCategory.id, title: "Welcome to the forum" });
        await defaultThreads;
        await transaction("posts")
          .whereIn("thread_id", threadIds)
          .whereNull("user_id")
          .update({ user_id: administratorRecord.id });
      }

      await transaction("forum_settings").insert([
        { key: "forum_name", value: forum.name },
        { key: "forum_url", value: forum.url },
        { key: "contact_email", value: forum.contactEmail },
        { key: "timezone", value: forum.timezone },
        {
          key: "auto_migrate_on_startup",
          value: String(autoMigrateOnStartup),
        },
        { key: "setup_complete", value: "true" },
      ]);

      return { forum, autoMigrateOnStartup };
    });
  } finally {
    await database.destroy();
  }
}

async function writeConfigExclusively(config: ForumConfig): Promise<void> {
  const configPath = join(process.cwd(), "config.json");
  const temporaryPath = join(
    process.cwd(),
    `.config-${randomBytes(12).toString("hex")}.tmp`,
  );
  const file = await open(temporaryPath, "wx", 0o600);
  try {
    try {
      await file.writeFile(`${JSON.stringify(config, null, 2)}\n`, "utf8");
      await file.sync();
    } finally {
      await file.close();
    }

    await link(temporaryPath, configPath);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "EEXIST"
    ) {
      const existing = parseForumConfig(JSON.parse(await readFile(configPath, "utf8")));
      if (isDeepStrictEqual(existing, config)) return;
      throw new Error("A different forum configuration already exists.");
    }
    throw error;
  } finally {
    await unlink(temporaryPath);
  }
}

export async function completeInitialSetup(input: SetupCompletionInput): Promise<void> {
  const saved = await saveInitialSetup(
    input.database,
    input.forum,
    input.administrator,
    input.autoMigrateOnStartup,
  );
  await writeConfigExclusively({
    database: input.database,
    autoMigrateOnStartup: saved.autoMigrateOnStartup,
    forum: saved.forum,
  });
}
