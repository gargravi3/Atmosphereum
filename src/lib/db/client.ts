import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";
import type { DB } from "./types";

const globalForDb = globalThis as unknown as {
  atmosphereumDb?: Kysely<DB>;
  atmosphereumPg?: ReturnType<typeof postgres>;
};

function createDb(): Kysely<DB> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to web/.env.local or the Vercel env vars.",
    );
  }

  const client =
    globalForDb.atmosphereumPg ??
    postgres(url, {
      ssl: "require",
      max: 10,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  if (!globalForDb.atmosphereumPg) globalForDb.atmosphereumPg = client;

  return new Kysely<DB>({
    dialect: new PostgresJSDialect({ postgres: client }),
  });
}

export const db: Kysely<DB> = globalForDb.atmosphereumDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.atmosphereumDb = db;

export { sql } from "kysely";
export type { DB };
