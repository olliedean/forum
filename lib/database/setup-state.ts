import { access } from "node:fs/promises";
import { join } from "node:path";

export async function isForumConfigPresent(): Promise<boolean> {
  try {
    await access(join(process.cwd(), "config.json"));
    return true;
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
