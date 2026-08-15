import type { PitchClass } from "./notes";

/**
 * Guitar tunings as pitch classes, ordered LOW string to HIGH string.
 *
 * "Custom" is deliberately absent from this table. The legacy app modelled it as
 * a `null` entry plus a module-level mutable `customTuningPcs`, which meant every
 * consumer had to remember to branch. Here the custom tuning is just application
 * state (see `src/song/types.ts`), and `resolveTuning()` below is the single
 * place that decides which array to use.
 */
export const TUNINGS = {
  "Standard (E A D G B E)": [4, 9, 2, 7, 11, 4],
  "Drop D (D A D G B E)": [2, 9, 2, 7, 11, 4],
  DADGAD: [2, 9, 2, 7, 9, 2],
  "Open G (D G D G B D)": [2, 7, 2, 7, 11, 2],
  "Open D (D A D F# A D)": [2, 9, 2, 6, 9, 2],
  "Open E (E B E G# B E)": [4, 11, 4, 8, 11, 4],
  "Open C (C G C G C E)": [0, 7, 0, 7, 0, 4],
  "Half-Step Down": [3, 8, 1, 6, 10, 3],
  "Full-Step Down (D Std.)": [2, 7, 0, 5, 9, 2],
} as const satisfies Record<string, readonly PitchClass[]>;

export type TuningName = keyof typeof TUNINGS;

/** The sentinel a tuning selector uses for "user-defined open strings". */
export const CUSTOM_TUNING = "Custom" as const;

export type TuningSelection = TuningName | typeof CUSTOM_TUNING;

export const DEFAULT_TUNING: TuningName = "Standard (E A D G B E)";

export const TUNING_NAMES = Object.keys(TUNINGS) as TuningName[];

/** Every selectable option, named tunings plus the Custom sentinel. */
export const TUNING_OPTIONS: TuningSelection[] = [...TUNING_NAMES, CUSTOM_TUNING];

/**
 * The one place that resolves a selection to actual strings. Pass the user's
 * custom array; it is only consulted when the selection is "Custom".
 */
export function resolveTuning(
  selection: TuningSelection,
  customPcs: readonly PitchClass[],
): readonly PitchClass[] {
  return selection === CUSTOM_TUNING ? customPcs : TUNINGS[selection];
}
