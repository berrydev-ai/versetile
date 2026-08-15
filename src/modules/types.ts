import type { ComponentType } from "react";

/**
 * The module contract.
 *
 * A "module" is one top-level area of the app -- Chords, Scales, Progressions,
 * Looper, and everything on the roadmap after them (lyrics with rhyme
 * suggestions, piano, export, notation).
 *
 * The whole point of this file is that ADDING A MODULE IS ADDING A FOLDER. You
 * write the component, add one entry to `registry.ts`, and the tab, the route,
 * the lazy-loaded chunk and the "not built yet" affordance all follow. Nothing
 * else in the app has to learn the module exists. That is the difference between
 * this and the legacy single file, where a new feature meant editing a shared
 * 4,000-line script and a shared `render()`.
 */

export type ModuleStatus =
  /** Ported to React and working. */
  | "live"
  /** Still served by the legacy single-file app; see `externalPath`. */
  | "legacy"
  /** On the roadmap, scaffolded, not built. Shows as a dimmed tab. */
  | "planned";

export interface VersetileModule {
  /** Stable id. Used as a React key and in analytics later; don't rename casually. */
  readonly id: string;
  /** Tab label. Keep it one word where possible — the tab strip is tight on a phone. */
  readonly label: string;
  /** Route path, without a leading slash. "" is the index route. */
  readonly path: string;
  readonly status: ModuleStatus;
  /** One line, shown on placeholder screens and in the README's module table. */
  readonly description: string;
  /**
   * When set, the tab is a plain link OUT of the single-page app instead of a
   * route. Used for the legacy bridge: the Looper opens the original
   * self-contained page at /legacy/ rather than being embedded.
   *
   * Deliberately not an iframe. The Looper needs microphone access, a wake lock,
   * and an AudioContext started inside a real user gesture; a nested browsing
   * context adds failure modes to all three, and the Looper is precisely the
   * thing that has to work on a real iPhone. Porting the module means deleting
   * this one field.
   */
  readonly externalPath?: string;
  /** The screen. Omitted for `externalPath` modules, which never render one. */
  readonly Component?: ComponentType;
}
