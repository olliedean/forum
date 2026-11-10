export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runConfiguredMigrations } = await import("./lib/database/migrator");
    const result = await runConfiguredMigrations();
    if (result && result.migrations.length > 0) {
      console.info("Applied forum database migrations.", result.migrations);
    }
  }
}
