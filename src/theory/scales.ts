import type { ToneSpec } from "./notes";

/**
 * Scale definitions, keyed by display name. Same rule as CHORD_TYPES: add an
 * entry and the UI picks it up on its own.
 */
export const SCALE_TYPES = {
  "Major (Ionian)": [[0, "R"], [2, "2"], [4, "3"], [5, "4"], [7, "5"], [9, "6"], [11, "7"]],
  Dorian: [[0, "R"], [2, "2"], [3, "b3"], [5, "4"], [7, "5"], [9, "6"], [10, "b7"]],
  Phrygian: [[0, "R"], [1, "b2"], [3, "b3"], [5, "4"], [7, "5"], [8, "b6"], [10, "b7"]],
  Lydian: [[0, "R"], [2, "2"], [4, "3"], [6, "#4"], [7, "5"], [9, "6"], [11, "7"]],
  Mixolydian: [[0, "R"], [2, "2"], [4, "3"], [5, "4"], [7, "5"], [9, "6"], [10, "b7"]],
  "Aeolian (Nat. Minor)": [[0, "R"], [2, "2"], [3, "b3"], [5, "4"], [7, "5"], [8, "b6"], [10, "b7"]],
  Locrian: [[0, "R"], [1, "b2"], [3, "b3"], [5, "4"], [6, "b5"], [8, "b6"], [10, "b7"]],
  "Major Pentatonic": [[0, "R"], [2, "2"], [4, "3"], [7, "5"], [9, "6"]],
  "Minor Pentatonic": [[0, "R"], [3, "b3"], [5, "4"], [7, "5"], [10, "b7"]],
  Blues: [[0, "R"], [3, "b3"], [5, "4"], [6, "b5"], [7, "5"], [10, "b7"]],
  "Harmonic Minor": [[0, "R"], [2, "2"], [3, "b3"], [5, "4"], [7, "5"], [8, "b6"], [11, "7"]],
  "Melodic Minor": [[0, "R"], [2, "2"], [3, "b3"], [5, "4"], [7, "5"], [9, "6"], [11, "7"]],
  "Whole Tone": [[0, "R"], [2, "2"], [4, "3"], [6, "#4"], [8, "#5"], [10, "b7"]],
  Chromatic: [
    [0, "R"], [1, "b2"], [2, "2"], [3, "b3"], [4, "3"], [5, "4"],
    [6, "b5"], [7, "5"], [8, "b6"], [9, "6"], [10, "b7"], [11, "7"],
  ],
} as const satisfies Record<string, readonly ToneSpec[]>;

export type ScaleTypeName = keyof typeof SCALE_TYPES;

export const SCALE_TYPE_NAMES = Object.keys(SCALE_TYPES) as ScaleTypeName[];

export function isScaleTypeName(name: string): name is ScaleTypeName {
  return Object.prototype.hasOwnProperty.call(SCALE_TYPES, name);
}
