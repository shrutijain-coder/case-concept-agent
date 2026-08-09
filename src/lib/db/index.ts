import "server-only";

import { SqliteRepository } from "./sqlite";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./types";

/**
 * Backend selection. `sqlite` is the default so the app runs with no external
 * services; set DATA_BACKEND=supabase once a Supabase project exists.
 *
 * Deliberately NOT cached as a singleton instance. The expensive, stateful
 * resource — the sqlite `DatabaseSync` handle, or the Supabase client — is
 * cached on `globalThis` right next to where it's created (see
 * `openDatabase()` in sqlite.ts and the client cache in supabase.ts). This
 * wrapper class is cheap to construct and holds no state of its own, so it is
 * built fresh on every call. Caching the wrapper instance itself previously
 * caused a real bug: Fast Refresh replaces the SqliteRepository/
 * SupabaseRepository class definition when either file changes, but an
 * already-constructed instance keeps its old prototype — so a cached
 * instance would silently miss any method added or changed after the dev
 * server first built one, throwing "is not a function" until a full restart.
 */
export function getRepository(): Repository {
  const backend = (process.env.DATA_BACKEND || "sqlite").toLowerCase();
  if (backend === "supabase") return new SupabaseRepository();
  if (backend !== "sqlite") {
    throw new Error(`Unknown DATA_BACKEND "${backend}". Use "sqlite" or "supabase".`);
  }
  return new SqliteRepository();
}

export type { Repository };
