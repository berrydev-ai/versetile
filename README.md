# Versetile

A songwriter's workstation. Chords, scales and progressions across the whole
neck, plus a bar-grid multi-track looper.

Built as a web app first, with native iOS/Android wrapping later once the web
version is validated.

## Status

Mid-migration. The app began as one self-contained 4,164-line HTML file; this
repo is the React project it is moving into.

| Module | Where it runs |
|---|---|
| Chords | Classic app |
| Scales | Classic app |
| Progressions | Classic app |
| Looper | Classic app |
| Lyrics | Not built |

"Classic app" means the original single file, preserved **unchanged** at
`public/legacy/index.html` and served at `/legacy/`. It works exactly as it
always has. Modules move into the React app one at a time; see
[docs/migration.md](docs/migration.md) for the order and
[docs/architecture.md](docs/architecture.md) for why the code is laid out the
way it is.

## Running it locally

You need Node.js. If `node --version` doesn't work, install the **LTS** macOS
installer from [nodejs.org](https://nodejs.org) — it's a normal double-click
installer, no terminal required. Then restart your terminal.

```bash
npm install
```

```bash
npm run dev
```

That prints a `http://localhost:5173` URL. Open it.

> **The microphone will not work over your local network.** `npm run dev` also
> prints a `http://192.168.x.x` address you can open on a phone, and the Looper
> will load there but cannot record. Browsers only grant microphone access in a
> *secure context* — https, or localhost specifically. Real on-device Looper
> testing goes through the deployed URL below, not the LAN address.

Other commands:

```bash
npm run build
```

```bash
npm run typecheck
```

## Deploying

Push to GitHub, then connect the repo to [Netlify](https://netlify.com). The
settings are already in `netlify.toml`, so Netlify reads them and needs no
manual configuration:

- build command `npm run build`
- publish directory `dist`
- SPA fallback, so `/looper` survives a refresh
- `/legacy/` served directly, outside the fallback

Every push to `main` republishes. Netlify serves https, which is what makes the
microphone work on a real iPhone — the thing local files could never do.

## Layout

```
src/
  theory/     Pure music theory — no DOM, no React, no audio
  audio/      Imperative audio engines — no React, owns the clock
  song/       The shared Song Project every module reads and writes
  modules/    One folder per feature; registry.ts is the table of contents
  components/ Shared presentational React
  lib/        Small utilities
  styles/     Design tokens + app shell
public/legacy/  The original single-file app, byte-for-byte
docs/           Roadmap, architecture, migration, brand, legacy notes
```

Two rules matter more than the rest:

1. **React never owns the audio clock.** Audio engines are plain TypeScript
   classes; React renders the controls around them and hands them a canvas.
2. **Never hardcode a hex value.** All colour comes from
   `src/styles/tokens.css`.

Both are explained in [docs/architecture.md](docs/architecture.md).

## Docs

- [docs/roadmap.md](docs/roadmap.md) — vision, feature backlog, build order,
  release plan. The doc that lets a fresh session pick up where the last stopped.
- [docs/architecture.md](docs/architecture.md) — why the code looks like this.
- [docs/migration.md](docs/migration.md) — port order and the Looper's traps.
- [docs/brand.md](docs/brand.md) — logo and brand design history.
- [docs/legacy-app-notes.md](docs/legacy-app-notes.md) — the original single-file
  app's full documentation, preserved verbatim. The Looper section is essential
  reading before porting it.
- [docs/looper-outline-original.md](docs/looper-outline-original.md) — the first
  Looper spec. Largely superseded; kept as history.
