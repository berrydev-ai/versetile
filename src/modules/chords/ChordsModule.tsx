import { ModulePlaceholder } from "@/components/ModulePlaceholder";

/**
 * Chords.
 *
 * PORTING NOTES (legacy versetile.html line numbers, as of the migration):
 *   - Data is already ported: `CHORD_TYPES` in src/theory/chords.ts.
 *   - `generateChordVoicings()` ~line 866 — pure, no DOM. Move to
 *     src/theory/voicings.ts next; it is the last purely-logical piece.
 *   - `renderChordDiagram()` ~line 945 — builds SVG via `svgEl(tag, attrs)`.
 *     Those calls map 1:1 onto JSX; the only thing to watch is `mirrorX()` /
 *     the local `mx()` helper, which is what makes left-handed mode work. Every
 *     x-coordinate must route through it or lefty silently draws wrong.
 *   - Audio is `playChord()` in the Karplus-Strong section ~line 731. It should
 *     become src/audio/synth.ts as an imperative module, NOT React state.
 */
export function ChordsModule() {
  return (
    <ModulePlaceholder
      title="Chords"
      description="Every voicing of every chord type, across the neck, in any tuning."
      status="legacy"
    />
  );
}
