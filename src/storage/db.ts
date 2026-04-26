import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "../config";

export const db = new Pool({
  connectionString: config.databaseUrl,
});

db.on("error", (err) => {
  console.error("Unexpected database error:", err);
  process.exit(1);
});

export async function runMigrations(): Promise<void> {
  const migrationsDir = join(__dirname, "migrations");
  const files = [
    "001_hub.sql",
    "002_dms.sql",
    "003_user_data.sql",
    "004_channels.sql",
    "005_bookmarks.sql",
    "006_polls.sql",
    "007_events.sql",
    "008_tasks.sql",
    "009_crowdfunds.sql",
  ];
  for (const file of files) {
    try {
      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      await db.query(sql);
    } catch (err) {
      console.error(`Migration ${file} failed:`, err);
      throw err;
    }
  }
  console.log("Database migrations applied.");
}
