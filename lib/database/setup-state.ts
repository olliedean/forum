import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function isForumConfigReady(): Promise<boolean> {
  try {
    const contents = await readFile(join(process.cwd(), "config.json"), "utf8");
    return contents.trim().length > 0;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}
