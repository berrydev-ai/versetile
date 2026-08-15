import { ModulePlaceholder } from "@/components/ModulePlaceholder";

/**
 * Lyrics — next on the roadmap after the Looper.
 *
 * Scaffolded empty on purpose: it is the first module that will be BUILT here
 * rather than ported, and having its folder and tab exist from day one is what
 * makes the shape of the finished app visible.
 *
 * From the roadmap: "Rhyme-assisting lyric notes — notepad with rhyme
 * suggestions (Rhymer's Block-style); hub tying chords/loops/lyrics together.
 * Candidate data source: Datamuse API or bundled CMUdict for offline."
 *
 * This is the module that should prove the Song Project is real. Lyrics belong
 * to a `SongSection` (src/song/types.ts), which is the same object the Looper
 * will eventually attach bar ranges to — so writing a chorus here and recording
 * one there end up describing the same thing. Resist giving this module its own
 * private store; that is exactly how the legacy app ended up with a Looper that
 * knew nothing about the rest of it.
 *
 * Note on the rhyme data source: Datamuse is a network call, which makes it the
 * first thing in the project to break the legacy app's "no fetch()" rule. That
 * is fine for a hosted app, but the offline path (bundled CMUdict) is what makes
 * it usable on a phone with no signal — worth deciding before building, not
 * after.
 */
export function LyricsModule() {
  return (
    <ModulePlaceholder
      title="Lyrics"
      description="Notepad with rhyme suggestions, tied to the song's sections."
      status="planned"
    />
  );
}
