import type { ToneSpec } from "./notes";

/**
 * Chord definitions, keyed by display name.
 *
 * To add a chord type, add an entry here -- nothing else. The UI builds its
 * dropdowns by iterating this object, exactly as the legacy app did, so a new
 * entry appears everywhere automatically.
 *
 * `suffix` is what gets appended to the root when naming the chord ("C" + "m7").
 * `tones` are semitone offsets from the root paired with the degree label shown
 * on a diagram.
 */
export interface ChordType {
  readonly suffix: string;
  readonly tones: readonly ToneSpec[];
}

export const CHORD_TYPES = {
  Major: { suffix: "", tones: [[0, "R"], [4, "3"], [7, "5"]] },
  Minor: { suffix: "m", tones: [[0, "R"], [3, "b3"], [7, "5"]] },
  "Power (5)": { suffix: "5", tones: [[0, "R"], [7, "5"]] },
  Sus2: { suffix: "sus2", tones: [[0, "R"], [2, "2"], [7, "5"]] },
  Sus4: { suffix: "sus4", tones: [[0, "R"], [5, "4"], [7, "5"]] },
  Diminished: { suffix: "dim", tones: [[0, "R"], [3, "b3"], [6, "b5"]] },
  Augmented: { suffix: "aug", tones: [[0, "R"], [4, "3"], [8, "#5"]] },
  "6": { suffix: "6", tones: [[0, "R"], [4, "3"], [7, "5"], [9, "6"]] },
  "Minor 6": { suffix: "m6", tones: [[0, "R"], [3, "b3"], [7, "5"], [9, "6"]] },
  "Dominant 7": { suffix: "7", tones: [[0, "R"], [4, "3"], [7, "5"], [10, "b7"]] },
  "Major 7": { suffix: "maj7", tones: [[0, "R"], [4, "3"], [7, "5"], [11, "7"]] },
  "Minor 7": { suffix: "m7", tones: [[0, "R"], [3, "b3"], [7, "5"], [10, "b7"]] },
  "Minor 7b5": { suffix: "m7b5", tones: [[0, "R"], [3, "b3"], [6, "b5"], [10, "b7"]] },
  "Diminished 7": { suffix: "dim7", tones: [[0, "R"], [3, "b3"], [6, "b5"], [9, "bb7"]] },
  "Dominant 9": { suffix: "9", tones: [[0, "R"], [4, "3"], [7, "5"], [10, "b7"], [2, "9"]] },
  "Major 9": { suffix: "maj9", tones: [[0, "R"], [4, "3"], [7, "5"], [11, "7"], [2, "9"]] },
  "Minor 9": { suffix: "m9", tones: [[0, "R"], [3, "b3"], [7, "5"], [10, "b7"], [2, "9"]] },
  Add9: { suffix: "add9", tones: [[0, "R"], [4, "3"], [7, "5"], [2, "9"]] },
  "7sus4": { suffix: "7sus4", tones: [[0, "R"], [5, "4"], [7, "5"], [10, "b7"]] },
  "6/9": { suffix: "6/9", tones: [[0, "R"], [4, "3"], [7, "5"], [9, "6"], [2, "9"]] },
  "Dominant 11": {
    suffix: "11",
    tones: [[0, "R"], [4, "3"], [7, "5"], [10, "b7"], [2, "9"], [5, "11"]],
  },
  "Dominant 13": {
    suffix: "13",
    tones: [[0, "R"], [4, "3"], [7, "5"], [10, "b7"], [2, "9"], [9, "13"]],
  },
  "7#9": { suffix: "7#9", tones: [[0, "R"], [4, "3"], [7, "5"], [10, "b7"], [3, "#9"]] },
  "7b9": { suffix: "7b9", tones: [[0, "R"], [4, "3"], [7, "5"], [10, "b7"], [1, "b9"]] },
} as const satisfies Record<string, ChordType>;

export type ChordTypeName = keyof typeof CHORD_TYPES;

export const CHORD_TYPE_NAMES = Object.keys(CHORD_TYPES) as ChordTypeName[];

export function isChordTypeName(name: string): name is ChordTypeName {
  return Object.prototype.hasOwnProperty.call(CHORD_TYPES, name);
}
