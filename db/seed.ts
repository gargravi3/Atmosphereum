/**
 * Loads Brentford FC synthetic data into the current schema.
 * Reads seed/00_load_all.sql, inlines every `\i file.sql` with file contents,
 * then executes the combined script in a single transaction.
 * Safe to re-run only AFTER a fresh db:migrate (tables will be empty).
 */
import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: path.resolve(__dirname, "..", ".env.local") });
loadEnv();

const SEED_DIR = path.resolve(__dirname, "seed");
const ENTRYPOINT = path.join(SEED_DIR, "00_load_all.sql");

function resolveSeed(): string {
  const loader = fs.readFileSync(ENTRYPOINT, "utf8");
  const lines = loader.split(/\r?\n/);
  const parts: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("--")) continue;
    const m = line.match(/^\\i\s+(.+?)(?:;)?$/);
    if (!m) {
      parts.push(raw);
      continue;
    }
    const name = m[1].trim();
    const filePath = path.join(SEED_DIR, name);
    if (!fs.existsSync(filePath)) {
      throw new Error(`[seed] referenced file not found: ${filePath}`);
    }
    parts.push(`-- <<< ${name} >>>`);
    parts.push(fs.readFileSync(filePath, "utf8"));
    parts.push("-- <<< end " + name + " >>>");
  }

  return parts.join("\n");
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to web/.env.local (or export it) then rerun.",
    );
  }

  console.log("[seed] resolving include tree ...");
  const combined = resolveSeed();
  const byteKb = (Buffer.byteLength(combined) / 1024).toFixed(1);
  console.log(`[seed] resolved script size: ${byteKb} KB`);

  const sql = postgres(url, {
    ssl: "require",
    max: 1,
    connect_timeout: 30,
    idle_timeout: 5,
  });

  try {
    console.log("[seed] applying in transaction ...");
    await sql.begin(async (tx) => {
      await tx.unsafe(combined);
    });
    console.log("[seed] data loaded.");

    const counts = await sql<{ schemaname: string; tablename: string; n: number }[]>`
      SELECT schemaname, tablename,
             (xpath('/row/c/text()',
                    query_to_xml(format('SELECT COUNT(*) AS c FROM %I.%I', schemaname, tablename), false, true, '')
             ))[1]::text::int AS n
      FROM pg_tables
      WHERE schemaname IN ('core','master','record','supplier','reduce','report','govern','ai','dq','netzero','task')
      ORDER BY schemaname, tablename
    `;
    const total = counts.reduce((sum, r) => sum + (r.n || 0), 0);
    const nonEmpty = counts.filter((r) => r.n > 0);
    console.log(`[seed] total rows: ${total} across ${nonEmpty.length} populated tables`);
    for (const row of nonEmpty) {
      console.log(`[seed]   ${row.schemaname}.${row.tablename}: ${row.n}`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().then(
  () => {
    console.log("[seed] done.");
    process.exit(0);
  },
  (err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  },
);
