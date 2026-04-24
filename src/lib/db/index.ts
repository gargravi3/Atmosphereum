// Public re-exports for the DB query layer.
// Import from `@/lib/db` everywhere in the app; concrete query files live in
// `src/lib/db/queries/*`.

export { db, sql } from "./client";
export { loadContext, type AtmContext } from "./context";

export * from "./queries/org";
export * from "./queries/factors";
export * from "./queries/emissions";
export * from "./queries/suppliers";
export * from "./queries/reduce";
export * from "./queries/reports";
export * from "./queries/govern";
export * from "./queries/sources";
export * from "./queries/netzero";
export * from "./queries/dq";
export * from "./queries/ai";
export * from "./queries/tasks";
