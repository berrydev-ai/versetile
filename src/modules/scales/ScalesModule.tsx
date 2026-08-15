import { ModulePlaceholder } from "@/components/ModulePlaceholder";

/**
 * Scales.
 *
 * PORTING NOTES (legacy versetile.html line numbers, as of the migration):
 *   - Data is already ported: `SCALE_TYPES` in src/theory/scales.ts.
 *   - `generateScaleBoxes()` ~line 866 and `renderScaleDiagram()` ~line 945.
 *   - `renderFullFretboard()` ~line 1125 is the bigger piece — the whole-neck
 *     interactive view. Same `mx()` left-handed caveat as the chord diagrams.
 *
 * Chords and Scales share nearly all of their rendering. Port them together and
 * factor the shared parts into src/components/ (a `<FretDiagram>` taking a set
 * of highlighted notes) rather than porting one and copying it.
 */
export function ScalesModule() {
  return (
    <ModulePlaceholder
      title="Scales"
      description="Scale boxes and the full interactive fretboard, in any tuning, left- or right-handed."
      status="legacy"
    />
  );
}
