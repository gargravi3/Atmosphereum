/**
 * Wipes all Atmosphereum schemas and recreates them from schema.sql.
 * Safe to re-run — idempotent: drops everything first, rebuilds.
 * Requires DATABASE_URL in env (.env.local).
 */
import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: path.resolve(__dirname, "..", ".env.local") });
loadEnv();

const SCHEMAS = [
  "task",
  "netzero",
  "dq",
  "ai",
  "govern",
  "report",
  "reduce",
  "supplier",
  "record",
  "master",
  "core",
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to web/.env.local (or export it) then rerun.",
    );
  }

  const schemaPath = path.resolve(__dirname, "schema.sql");
  const ddl = fs.readFileSync(schemaPath, "utf8");

  const sql = postgres(url, {
    ssl: "require",
    max: 1,
    connect_timeout: 30,
    idle_timeout: 5,
  });

  console.log("[migrate] connecting ...");
  try {
    await sql.unsafe("SELECT 1");
    console.log("[migrate] connected.");

    console.log("[migrate] dropping schemas ...");
    for (const s of SCHEMAS) {
      console.log(`[migrate]   DROP SCHEMA IF EXISTS ${s} CASCADE`);
      await sql.unsafe(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    }

    console.log("[migrate] applying schema.sql ...");
    await sql.unsafe(ddl);
    console.log("[migrate] schema applied.");

    const { count: tableCount } = (
      await sql<
        { count: number }[]
      >`SELECT COUNT(*)::int AS count FROM pg_tables WHERE schemaname IN ('core','master','record','supplier','reduce','report','govern','ai','dq','netzero','task')`
    )[0];
    console.log(`[migrate] tables in target schemas: ${tableCount}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().then(
  () => {
    console.log("[migrate] done.");
    process.exit(0);
  },
  (err) => {
    console.error("[migrate] failed:", err);
    process.exit(1);
  },
);
