/**
 * localStorage helpers.
 *
 * Every read and write is wrapped in try/catch, matching the legacy app. Storage
 * genuinely throws in the wild: Safari private browsing, a full quota, and
 * embedded webviews all reject access, and an uncaught throw here would take the
 * whole render down over a saved preference.
 *
 * SHARED-ORIGIN NOTE, worth knowing before you rename a key: once deployed, the
 * React app and the legacy page at /legacy are served from the SAME origin, so
 * they share one localStorage. That is a feature -- favorites starred on the
 * legacy page show up in a ported module, which makes the tab-by-tab migration
 * invisible to a user. It also means renaming a key silently orphans data the
 * legacy page is still writing. Use the migration pattern below instead.
 */

export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Read `key`, falling back to `legacyKey` and copying it forward on first run.
 *
 * The old key is left in place as a backup rather than deleted -- the same call
 * Mark made for the Fretwork -> Versetile rename ("migrate, don't orphan"). It
 * costs nothing and means a botched migration is recoverable.
 */
export function readJsonWithLegacyFallback<T>(key: string, legacyKey: string): T | null {
  const current = readJson<T>(key);
  if (current !== null) return current;

  const legacy = readJson<T>(legacyKey);
  if (legacy === null) return null;

  writeJson(key, legacy);
  return legacy;
}

/**
 * Storage keys in use. Centralised so the set is greppable and so nothing
 * invents a colliding name. The `fretwork_*` entries are read-only migration
 * sources from the pre-rename era -- never write to them.
 */
export const STORAGE_KEYS = {
  favoriteProgressions: "versetile_favoriteProgressions",
  customProgressions: "versetile_customProgressions",
  songProject: "versetile_songProject",
} as const;

export const LEGACY_STORAGE_KEYS = {
  favoriteProgressions: "fretwork_favoriteProgressions",
  customProgressions: "fretwork_customProgressions",
} as const;
