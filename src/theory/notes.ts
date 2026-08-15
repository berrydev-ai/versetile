/**
 * Pitch classes and note naming.
 *
 * The convention from the legacy app carries over unchanged and is worth stating
 * once, loudly, because breaking it produces silently wrong diagrams rather than
 * an error:
 *
 *   A PITCH CLASS is an integer 0-11 where C = 0. It is NOT a MIDI number and
 *   NOT a frequency. Any variable holding one ends in `Pc` (or `Pcs` for a list).
 *
 * Everything in this folder is pure: no DOM, no React, no audio. That is the
 * point -- when the piano module lands it imports these same functions, and they
 * can be unit-tested without a browser.
 */

/** An integer 0-11. C = 0, C# = 1, ... B = 11. */
export type PitchClass = number;

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

/**
 * An interval within a chord or scale, as `[semitones from root, degree label]`.
 *
 * Kept as a labelled tuple rather than an object so the shape matches the legacy
 * data exactly -- the voicing and diagram generators destructure it positionally
 * (`([semitones, degree]) => ...`), which makes porting them a straight lift.
 */
export type ToneSpec = readonly [semitones: number, degree: string];

/**
 * Wrap any integer into 0-11. JavaScript's % keeps the sign of the dividend, so
 * `-1 % 12` is `-1`, not `11` -- every pitch-class arithmetic site must go
 * through this rather than a bare %.
 */
export function normalizePc(n: number): PitchClass {
  return ((n % 12) + 12) % 12;
}

/** Name a pitch class. Always sharps -- the legacy app has no flat spelling. */
export function noteName(pc: PitchClass): NoteName {
  return NOTE_NAMES[normalizePc(pc)]!;
}

/** Semitone distance from `fromPc` up to `toPc`, always 0-11. */
export function intervalBetween(fromPc: PitchClass, toPc: PitchClass): number {
  return normalizePc(toPc - fromPc);
}

/**
 * Equal-tempered frequency for a pitch class at a given octave, A4 = 440Hz.
 * Octave numbering is scientific pitch notation, so middle C is C4.
 */
export function frequencyOf(pc: PitchClass, octave: number): number {
  const midi = normalizePc(pc) + 12 * (octave + 1);
  return 440 * Math.pow(2, (midi - 69) / 12);
}
