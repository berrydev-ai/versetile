import type { ChordTypeName } from "@/theory/chords";
import type { PitchClass } from "@/theory/notes";
import type { KeyMode } from "@/theory/roman";
import type { TuningSelection } from "@/theory/tunings";

/**
 * THE SONG PROJECT.
 *
 * From the roadmap's key architectural decision:
 *
 *   "Every module should read/write a shared Song Project object (title, key,
 *    progression, lyric sections, audio/loop references, tab/notation
 *    reference) rather than being separate silos."
 *
 * In the legacy single-file app this never happened -- the Looper kept its own
 * state in IndexedDB and the explorer kept its own in a module-level `state`
 * object, and the two knew nothing about each other. Defining the shape now,
 * before the second module is written, is the cheapest this decision will ever
 * be to honour.
 *
 * Two rules keep it from rotting:
 *
 *   1. A module NEVER stores something here that only it cares about. Transient
 *      UI state (which accordion is open, a slider mid-drag) belongs in the
 *      module's own component state. This object is only for what another module
 *      could legitimately want to read.
 *
 *   2. Heavy binary data is REFERENCED, never embedded. Loop audio lives in
 *      IndexedDB; the project holds an id. A Song Project must stay small enough
 *      to serialize to JSON cheaply, because that is what makes export, sharing,
 *      and eventual sync possible later.
 */

/** Concert key of the song. Drives roman-numeral resolution everywhere. */
export interface SongKey {
  readonly rootPc: PitchClass;
  readonly mode: KeyMode;
}

/** One chord in a progression, already resolved to a concrete root and quality. */
export interface SongChord {
  readonly rootPc: PitchClass;
  readonly chordType: ChordTypeName;
  /** The roman numeral it came from, when it came from one — for display. */
  readonly numeral?: string;
  /** How many beats this chord is held. Defaults to one bar's worth when absent. */
  readonly beats?: number;
}

/**
 * A named span of the song. Sections are the join between modules: the lyric
 * module writes words into one, the Looper will eventually attach bar ranges to
 * the same one, and an arrangement view reads both.
 */
export interface SongSection {
  readonly id: string;
  /** "Verse 1", "Chorus", "Bridge" — free text, not an enum. */
  readonly name: string;
  readonly chords: readonly SongChord[];
  readonly lyrics: string;
  /** Bar range within the Looper's grid, once the Looper is wired up. */
  readonly barRange?: { readonly start: number; readonly end: number };
}

/**
 * A pointer to audio held in IndexedDB by the Looper, never the audio itself.
 * `projectId` is the Looper's own project record id.
 */
export interface LoopReference {
  readonly projectId: string;
  readonly name: string;
  readonly bars: number;
  readonly bpm: number;
  readonly timeSignature: string;
}

/**
 * Instrument context. Guitar-specific for now; when the piano module lands this
 * grows a discriminated union rather than the piano inventing its own store.
 */
export interface InstrumentSettings {
  readonly tuning: TuningSelection;
  readonly customTuningPcs: readonly PitchClass[];
  readonly lefty: boolean;
  readonly maxFret: number;
}

export interface SongProject {
  readonly id: string;
  readonly title: string;
  readonly key: SongKey;
  readonly tempo: number;
  readonly timeSignature: string;
  readonly sections: readonly SongSection[];
  readonly loops: readonly LoopReference[];
  readonly instrument: InstrumentSettings;
  readonly createdAt: number;
  readonly updatedAt: number;
  /**
   * Bumped whenever the shape below changes incompatibly. The legacy app's
   * IndexedDB migration is the precedent worth copying: never rename or drop a
   * field without a path that carries old data forward.
   */
  readonly schemaVersion: 1;
}

export const SONG_SCHEMA_VERSION = 1 as const;

export function createEmptySongProject(now = Date.now()): SongProject {
  return {
    id: `song-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: "Untitled Song",
    key: { rootPc: 0, mode: "major" },
    tempo: 120,
    timeSignature: "4/4",
    sections: [],
    loops: [],
    instrument: {
      tuning: "Standard (E A D G B E)",
      customTuningPcs: [4, 9, 2, 7, 11, 4],
      lefty: false,
      maxFret: 15,
    },
    createdAt: now,
    updatedAt: now,
    schemaVersion: SONG_SCHEMA_VERSION,
  };
}
