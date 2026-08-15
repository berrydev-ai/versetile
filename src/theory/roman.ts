import { normalizePc, type PitchClass } from "./notes";
import type { ChordTypeName } from "./chords";

/**
 * Roman-numeral harmony parsing.
 *
 * Scale-degree semitone offsets (1st..7th degree) for each key mode. The
 * numeral's ROOT is always looked up from these tables; the chord's QUALITY
 * comes from the numeral's case plus its suffix, independent of the "default
 * diatonic" quality. That matches how roman-numeral harmony is actually written
 * -- "V" in a minor key deliberately raises the third via the numeral's
 * uppercase case, without needing to change key or scale.
 */
export const MAJOR_DEGREE_OFFSETS = [0, 2, 4, 5, 7, 9, 11] as const;
export const MINOR_DEGREE_OFFSETS = [0, 2, 3, 5, 7, 8, 10] as const;

export type KeyMode = "major" | "minor";

const NUMERAL_TO_DEGREE: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

/** Longest numerals first, so "VII" isn't mis-parsed as "V" plus a leftover "II". */
const NUMERAL_ORDER = ["VII", "III", "II", "IV", "VI", "I", "V"] as const;

export interface ParsedNumeral {
  readonly rootPc: PitchClass;
  readonly chordTypeKey: ChordTypeName;
  /** 1-7, the scale degree the numeral names before any accidental. */
  readonly degree: number;
  /** The original token, trimmed -- kept so the UI can display what was written. */
  readonly raw: string;
}

/**
 * Map a numeral's suffix to a chord type.
 *
 * Split out of the parser so the suffix vocabulary is readable as a list and can
 * grow without touching the parsing logic. `isUpper` only matters for the two
 * ambiguous cases: a bare numeral, and a bare "7".
 */
function chordTypeForSuffix(suffix: string, isUpper: boolean): ChordTypeName {
  const lower = suffix.toLowerCase();

  if (suffix === "°7" || lower === "dim7") return "Diminished 7";
  if (suffix === "ø" || lower === "m7b5" || lower === "7b5") return "Minor 7b5";
  if (suffix === "°" || lower === "dim") return "Diminished";
  if (suffix === "+" || lower === "aug") return "Augmented";
  if (lower === "maj7") return "Major 7";
  if (lower === "m7") return "Minor 7";
  if (suffix === "7") return isUpper ? "Dominant 7" : "Minor 7";
  if (lower === "sus2") return "Sus2";
  if (lower === "sus4") return "Sus4";
  if (lower === "6") return "6";

  // Bare numeral, and also the catch-all: an unrecognized suffix falls back to a
  // plain triad rather than failing the whole progression.
  return isUpper ? "Major" : "Minor";
}

/**
 * Parse one token -- "V", "vi", "bVII", "ii7", "vii°", "Imaj7", "iiØ", "iim7b5"
 * -- into a concrete chord in the given key. Returns null if it can't be parsed.
 */
export function parseRomanToken(
  raw: string,
  keyRootPc: PitchClass,
  mode: KeyMode,
): ParsedNumeral | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;

  let accidental = 0;
  if (s[0] === "b") {
    accidental = -1;
    s = s.slice(1);
  } else if (s[0] === "#") {
    accidental = 1;
    s = s.slice(1);
  }

  const upper = s.toUpperCase();
  const matched = NUMERAL_ORDER.find((tok) => upper.startsWith(tok));
  if (!matched) return null;

  const consumed = s.slice(0, matched.length);
  const isUpper = consumed === consumed.toUpperCase();
  const degree = NUMERAL_TO_DEGREE[matched]!;
  const offsets = mode === "minor" ? MINOR_DEGREE_OFFSETS : MAJOR_DEGREE_OFFSETS;
  const rootPc = normalizePc(keyRootPc + offsets[degree - 1]! + accidental);

  const chordTypeKey = chordTypeForSuffix(s.slice(matched.length).trim(), isUpper);
  return { rootPc, chordTypeKey, degree, raw: raw.trim() };
}
