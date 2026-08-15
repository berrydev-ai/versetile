import { ModulePlaceholder } from "@/components/ModulePlaceholder";

/**
 * Progressions.
 *
 * PORTING NOTES (legacy versetile.html line numbers, as of the migration):
 *   - Data and parsing are already ported: src/theory/progressions.ts and
 *     src/theory/roman.ts.
 *   - The render pass is `PROGRESSIONS RENDER` ~line 3936.
 *   - Favorites and custom progressions are localStorage-backed. Use
 *     `readJsonWithLegacyFallback` from src/lib/storage.ts with the keys in
 *     STORAGE_KEYS / LEGACY_STORAGE_KEYS — the legacy page writes the same keys
 *     on the same origin, so a ported module inherits the user's existing stars
 *     with no migration step.
 *
 * This is the natural FIRST module to port: no canvas, no audio clock, and the
 * hard part (roman-numeral parsing) is already done and testable.
 */
export function ProgressionsModule() {
  return (
    <ModulePlaceholder
      title="Progressions"
      description="Curated chord progressions by mood and genre, in any key, with favorites and your own custom entries."
      status="legacy"
    />
  );
}
