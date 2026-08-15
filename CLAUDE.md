# Versetile

A songwriter's workstation: chords, scales, progressions, and a bar-grid
multi-track looper. React + TypeScript + Vite, deployed on Netlify.

This file merges what used to be two: the product/knowledge home (`Songwriter
Central/CLAUDE.md`) and the code home (`_Versetile/CLAUDE.md`). One repo, one
source of truth. The old single-file app's full documentation is preserved
verbatim at `docs/legacy-app-notes.md` — it is still the authority on how the
Looper works.

## How Mark works

- **No coding background.** He drives product and ideas; Claude does the
  hands-on coding. Explain trade-offs in plain terms and **ask before picking
  between real alternatives** — his past calls (migrate-don't-orphan the saved
  data, strict next-bar quantization, tile-don't-chop layer lengths) were all
  made that way and all shaped the app.
- Semi-serious side project alongside college. Not full-time.
- The motivation is that he wants to use it himself, with a small group of
  testers trying each piece as it ships.

## Where things stand

Mid-migration from a single 4,164-line HTML file into this React project. Every
feature module still runs in the legacy app, served unchanged at `/legacy/`;
they move across one at a time.

Read `docs/architecture.md` before adding a module and `docs/migration.md`
before porting one. Keep `docs/roadmap.md` current — that doc is the reason a
fresh session can pick up where the last one stopped.

## The rules that matter

**1. React never owns the audio clock.**

The Looper is driven from `AudioContext.currentTime` inside one
`requestAnimationFrame` loop — never a timer, never an accumulated delta — so
the picture can't drift from the audio. Audio engines are plain TypeScript
classes under `src/audio/`, with no React import. React renders the chrome
around them and hands them a `<canvas>` ref. Per-frame values never become React
state.

**2. Never hardcode a hex value.** All colour comes from CSS custom properties
in `src/styles/tokens.css`.

**3. Theory stays pure.** `src/theory/` imports nothing outside itself — no DOM,
no React, no audio, no storage. That is what makes it testable without a browser
and reusable when the piano module lands.

**4. Adding a feature is adding a folder.** `src/modules/<name>/` plus one entry
in `src/modules/registry.ts`. The tab and route follow automatically.

**5. Pitch classes are integers 0–11 (C = 0).** Variables ending in `Pc`/`Pcs`
are pitch classes, not MIDI numbers.

**6. Left-handed mode mirrors x-coordinates** through `mirrorX()` / the local
`mx()` helper. Any new diagram drawing MUST route x-coordinates through it or
lefty mode silently breaks — no error, just a wrong diagram.

## Layout

```
src/theory/     Pure music theory. Ported and done.
src/audio/      Imperative engines. Empty until the Looper port.
src/song/       The shared Song Project object.
src/modules/    One folder per feature. registry.ts is the table of contents.
src/components/ Shared presentational React.
src/lib/        Small utilities (storage).
src/styles/     Design tokens + app shell.
public/legacy/  The original single-file app, byte-for-byte unchanged.
docs/           Roadmap, architecture, migration, brand, legacy notes.
```

## The Song Project

`src/song/types.ts`. From the roadmap's key architectural decision: every module
reads and writes one shared object rather than being a silo. Two rules keep it
honest — a module never puts module-only state there, and heavy binary data is
*referenced* (an IndexedDB id), never embedded.

The legacy app never did this. Doing it before the second module is written is
the cheapest this decision will ever be.

## Commands

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run typecheck
```

Node.js is required and was **not** installed on Mark's Mac as of the migration
— the LTS installer from nodejs.org is a double-click, no terminal needed.

## Working on this

- **Snapshot before anything risky.** The legacy app's dated snapshots live in
  the old `_Versetile/versions/` folder. In this repo, git is the snapshot
  mechanism — branch before a large change rather than copying files.
- **The concurrent-session hazard is gone.** It bit twice for real: multiple
  chats edited `versetile.html` from the same baseline and clobbered each other.
  Git makes that a merge instead of a silent overwrite. Still: `git pull` before
  starting, and don't work on `main` for anything substantial.
- **Downstream copies.** The Cowork sidebar artifact and claude.ai project
  knowledge both derive from the old single file and go stale. Once this repo is
  deployed, the Netlify URL replaces both — prefer sending Mark the link over
  re-pushing artifacts.
- Prefer porting a module completely over half-porting several. A module that is
  `"legacy"` in the registry works today; a half-ported one works nowhere.

## Loose ends on disk

These sit next to this repo in `Documents/Claude Projects/` and are safe to
delete once this repo is on GitHub and deploying:

- `_Versetile/` — the old code home. `versetile.html` is preserved here at
  `public/legacy/index.html`; `CLAUDE.md` at `docs/legacy-app-notes.md`. Its
  `tests/` and `versions/` folders have **not** been copied — see
  `docs/migration.md` on when to bring the tests across.
- `Songwriter Central/` — the old knowledge home. All three docs are copied into
  `docs/`, and its slash commands into `.claude/commands/`.
- `Fretwork/` — an empty leftover directory from the rename.
