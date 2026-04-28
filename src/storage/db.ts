import { Pool } from "pg";
import { readdirSync, readFileSync } from "fs";
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
  // Enumerate every *.sql file and run them in lexicographic order. The
  // file names are zero-padded (`001_…`, `024_…`) so sort() matches the
  // intended sequence, and every migration in this tree uses
  // CREATE TABLE / ADD COLUMN IF NOT EXISTS so re-running on an existing
  // DB is a no-op.
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    try {
      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      await db.query(sql);
    } catch (err) {
      console.error(`Migration ${file} failed:`, err);
      throw err;
    }
  }
  console.log(`Database migrations applied (${files.length} files).`);
}
