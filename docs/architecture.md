# Architecture

Why the code is laid out the way it is. Read this before adding a module.

## The shape

```
src/
  theory/     Pure music theory. No DOM, no React, no audio, no storage.
  audio/      Imperative engines. No React. Owns the AudioContext clock.
  song/       The shared Song Project object every module reads and writes.
  modules/    One folder per feature. The app's table of contents.
  components/ Shared presentational React. Nothing feature-specific.
  lib/        Small utilities (storage).
  styles/     Design tokens + the app shell. Module CSS lives with the module.
public/
  legacy/     The original single-file app, served verbatim at /legacy/.
  brand/      Source SVGs, and the favicon.
docs/         Roadmap, brand history, legacy app notes.
```

## Four rules

### 1. Theory is pure

`src/theory/` has no imports outside itself. It is data and functions: chords,
scales, tunings, roman numerals, progressions. It knows nothing about React,
rendering, audio or persistence.

That is what makes it testable without a browser, and what means the piano
module (roadmap item 4) reuses all of it untouched — only `tunings.ts` is
guitar-specific.

### 2. React never owns the audio clock

This is the load-bearing rule of the whole project.

The Looper is driven from `AudioContext.currentTime` inside a single
`requestAnimationFrame` loop — never a timer, never an accumulated delta — so
the picture on screen cannot drift from the audio. Audio engines are therefore
plain TypeScript classes in `src/audio/`, and React only:

- renders the chrome around them (buttons, sliders, lists), and
- hands them a `<canvas>` ref to draw into.

Per-frame values never become React state. A `setState` at 60fps re-renders the
tree sixty times a second to update a number.

The legacy app already worked this way: its shared `render()` pass explicitly
skips the Looper, which owns its DOM directly. Porting preserves that, it
doesn't undo it.

### 3. Modules are folders

Adding a feature is:

1. `src/modules/<name>/<Name>Module.tsx`
2. one entry in `src/modules/registry.ts`

The tab, the route and the placeholder behaviour all follow from the registry.
Nothing else in the app learns the module exists. Compare this to the legacy
single file, where a new feature meant editing a shared 4,000-line script and a
shared `render()` — that coupling is the thing this structure exists to prevent.

A module owns its own CSS (`<Name>.module.css` next to the component), so
deleting a module leaves nothing behind.

### 4. The Song Project is the spine

From the roadmap's key architectural decision:

> Every module should read/write a shared Song Project object rather than being
> separate silos.

`src/song/types.ts` defines it. Two rules keep it honest:

- A module never stores something there that only it cares about. Transient UI
  state belongs in the component.
- Heavy binary data is **referenced, never embedded**. Loop audio lives in
  IndexedDB; the project holds an id. The project must stay cheap to serialize
  to JSON, because that is what makes export and sharing possible later.

The legacy app never did this — the Looper kept its own IndexedDB state and the
explorer kept its own module-level object, and neither knew the other existed.
Defining the shape before the second module is written is the cheapest this
decision will ever be.

## Styling

All colour comes from CSS custom properties in `src/styles/tokens.css`, lifted
verbatim from the legacy `:root` block so ported modules look identical with no
re-tuning.

**Never hardcode a hex value in a component.** That single rule is what lets the
app be re-themed — a light mode, a per-module accent — by editing one file.

## What is deliberately not here

- **No state management library.** The Song Project is small and updates are
  user-paced. React context is enough. If that changes, `SongProjectContext.tsx`
  is the only file that has to.
- **No component library.** The app has a strong existing visual identity worth
  keeping; a component kit would fight it.
- **No CSS framework.** The legacy `:root` block is already a design system.
- **No backend, no auth.** Everything is local-first: localStorage and
  IndexedDB. Adding a backend later does not require restructuring any of the
  above, because nothing assumes a server exists.

## The legacy bridge

`public/legacy/index.html` is the original single-file app, **byte-for-byte
unchanged**. Vite copies `public/` to `dist/` without processing, so it deploys
as-is and is served at `/legacy/`.

The SPA fallback does not swallow it, and this is worth not re-deriving. Both
hosts resolve real files before falling back to `index.html`, and
`dist/legacy/index.html` is a real file — so it wins on its own, with no rule
protecting it. Verified against the Cloudflare deploy on 2026-08-15: `/legacy`
returns 307 to `/legacy/`, `/legacy/` returns the legacy app, and an unknown
path like `/some-deep-link` returns the React shell. The corollary is the thing
to actually watch: because ordering is what protects it, deleting
`public/legacy/index.html` would not 404: the path would quietly start serving
the React app instead.

It is not an iframe. The Looper needs microphone access, a wake lock, and an
`AudioContext` started inside a real user gesture; a nested browsing context adds
failure modes to all three, and the Looper is precisely the thing that has to
work on a real iPhone.

One useful consequence of same-origin serving: the React app and the legacy page
share one `localStorage`. Favorites starred on the legacy page show up in a
ported module with no migration step. It also means renaming a storage key
silently orphans data the legacy page is still writing — use
`readJsonWithLegacyFallback` in `src/lib/storage.ts` instead.

The bridge disappears one module at a time. Porting a module means deleting its
`externalPath` from the registry and flipping its status to `"live"`. When the
last one flips, delete `public/legacy/`.
