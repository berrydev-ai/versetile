import type { VersetileModule } from "./types";
import { ChordsModule } from "./chords/ChordsModule";
import { ScalesModule } from "./scales/ScalesModule";
import { ProgressionsModule } from "./progressions/ProgressionsModule";
import { LooperModule } from "./looper/LooperModule";
import { LyricsModule } from "./lyrics/LyricsModule";

/**
 * Every module in the app, in tab order.
 *
 * THIS LIST IS THE APP'S TABLE OF CONTENTS. Adding a feature is adding an entry
 * here plus a folder under src/modules/. Nothing else needs to know about it.
 *
 * Statuses are kept honest on purpose: a dimmed tab that admits it isn't built
 * is better than one that looks finished and isn't. During the migration most
 * entries carry both an `externalPath` (so the TAB is one tap to the working
 * legacy app) and a `Component` (so a direct link or a refresh on /chords still
 * resolves to an explanatory screen instead of a 404). Porting a module means
 * deleting its `externalPath` and flipping its status to "live".
 */
export const MODULES: readonly VersetileModule[] = [
  {
    id: "chords",
    label: "Chords",
    path: "chords",
    status: "legacy",
    description:
      "Every voicing of every chord type, across the neck, in any tuning. Click a shape to hear it.",
    externalPath: "/legacy/",
    Component: ChordsModule,
  },
  {
    id: "scales",
    label: "Scales",
    path: "scales",
    status: "legacy",
    description:
      "Scale boxes and the full interactive fretboard, in any tuning, left- or right-handed.",
    externalPath: "/legacy/",
    Component: ScalesModule,
  },
  {
    id: "progressions",
    label: "Progressions",
    path: "progressions",
    status: "legacy",
    description:
      "Curated chord progressions by mood and genre, in any key, with favorites and your own custom entries.",
    externalPath: "/legacy/",
    Component: ProgressionsModule,
  },
  {
    id: "looper",
    label: "Looper",
    path: "looper",
    status: "legacy",
    description:
      "Bar-grid multi-track looper. Set a tempo, a time signature and a bar count; one button walks record, overdub, stop, forever.",
    externalPath: "/legacy/",
    Component: LooperModule,
  },
  {
    id: "lyrics",
    label: "Lyrics",
    path: "lyrics",
    status: "planned",
    description:
      "Notepad with rhyme suggestions, tied to the song's sections. Next on the roadmap after the Looper.",
    Component: LyricsModule,
  },
];

/** Modules that render a screen inside the app, i.e. everything the router needs. */
export const ROUTED_MODULES = MODULES.filter(
  (m): m is VersetileModule & { Component: NonNullable<VersetileModule["Component"]> } =>
    Boolean(m.Component),
);

/** Where "/" redirects. The first module that is genuinely built, else the first tab. */
export const DEFAULT_MODULE_PATH =
  MODULES.find((m) => m.status === "live")?.path ?? MODULES[0]?.path ?? "chords";

/** The legacy single-file app. One constant, so the bridge has a single source of truth. */
export const LEGACY_APP_PATH = "/legacy/";
