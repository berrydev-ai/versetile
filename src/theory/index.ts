/**
 * The music theory layer.
 *
 * Pure data and pure functions: no DOM, no React, no Web Audio, no storage.
 * Import from here rather than reaching into individual files, so the surface
 * stays deliberate.
 *
 * This folder is instrument-agnostic on purpose. Chords, scales and roman
 * numerals know nothing about guitars -- only `tunings.ts` does. When the piano
 * module arrives it reuses everything here untouched and simply doesn't import
 * tunings.
 */

export * from "./notes";
export * from "./chords";
export * from "./scales";
export * from "./tunings";
export * from "./roman";
export * from "./progressions";
