# Migration: single file → React

Where the port stands, and the order to do the rest in.

## Where it came from

One self-contained file, `versetile.html`, 4,164 lines: one `<style>` block, one
`<script>` block wrapped in an IIFE. No build step, no dependencies, no network
calls. It is preserved unchanged at `public/legacy/index.html` and served at
`/legacy/`.

| Legacy section | Lines | Status |
|---|---|---|
| `:root` design tokens | ~10 | ✅ Ported → `src/styles/tokens.css` |
| CSS | ~290 | ⬜ Ported per module as each module lands |
| Body markup | ~195 | ⬜ Per module |
| `MUSIC THEORY DATA` | 497–560 | ✅ Ported → `src/theory/{notes,chords,scales,tunings}.ts` |
| `CHORD PROGRESSIONS` | 561–703 | ✅ Ported → `src/theory/{roman,progressions}.ts` |
| `STATE` | 704–730 | ✅ Superseded by `src/song/types.ts` |
| `AUDIO ENGINE` (Karplus-Strong) | 731–865 | ⬜ → `src/audio/synth.ts` |
| `VOICING / BOX GENERATORS` | 866–944 | ⬜ → `src/theory/voicings.ts` |
| `DIAGRAM RENDERING (SVG)` | 945–1124 | ⬜ → `src/components/FretDiagram.tsx` |
| `FULL INTERACTIVE FRETBOARD` | 1125–1224 | ⬜ → `src/components/Fretboard.tsx` |
| `UI WIRING` / `RENDER` | 1225–1397, 3823–3935 | ⬜ Replaced by React, not ported |
| `LOOPER` | 1398–3822 | ⬜ → `src/audio/looper/` + thin React shell |
| `PROGRESSIONS RENDER` | 3936–4162 | ⬜ → `src/modules/progressions/` |

## Order to port in

Deliberately easiest-first, so the structure is proven on low-risk code before
the Looper goes anywhere near it.

**1. Progressions.** No canvas, no audio clock, and the hard part
(roman-numeral parsing) is already ported and testable. Favorites and custom
progressions come across via `readJsonWithLegacyFallback` — same origin, same
keys, so a user's existing stars survive with no migration step.

**2. Voicings + diagrams.** `generateChordVoicings()` and `generateScaleBoxes()`
are pure — move them to `src/theory/voicings.ts` first, on their own. Then the
SVG: `svgEl(tag, attrs)` calls map 1:1 onto JSX.

> **The one real trap.** Left-handed mode works by mirroring x-coordinates
> through `mirrorX()` / the local `mx()` helper. Every x-coordinate in a diagram
> must route through it. Miss one and lefty mode silently draws wrong — no
> error, no crash, just a wrong diagram. Port `mx()` first and make it the only
> way a coordinate reaches the DOM.

**3. Chords and Scales together.** They share nearly all their rendering. Factor
the shared part into one `<FretDiagram>` that takes a set of highlighted notes,
rather than porting one and copying it.

**4. The Looper. Last, and read the notes first.**

## The Looper port

The Looper is ~2,400 lines and the most carefully tuned code in the project. It
is also the easiest thing here to ruin, and the failure mode isn't a crash — it
is audio that drifts, clicks late, or crackles, which no type checker catches.

The port is **not** "rewrite the Looper in React":

1. Lift the existing code out of the IIFE into framework-agnostic TypeScript
   under `src/audio/looper/` — engine, metronome, recorder, grid math,
   IndexedDB. Plain classes and functions, no React import anywhere. **This step
   should change zero behaviour**, and the existing Playwright suites are what
   prove it.
2. Give the engine a coarse subscribe/emit surface: `onPhaseChange`,
   `onTracksChange`. User-paced events only.
3. React renders the chrome: project bar, metronome controls, bar slider, track
   list. Ordinary forms, which is what React is good at.
4. The wheel canvas and waveform lanes are handed to the engine as refs. The rAF
   loop keeps drawing to them directly. React renders the `<canvas>` element; it
   must not render its contents.

### Things to preserve verbatim

Each of these exists because something broke:

- **`looperSnapBarSecToSamples`** — bar length snapped to a whole sample count.
  Without it `round(8 bars) != 8 * round(1 bar)`, and layers drift a few samples
  per cycle, forever.
- **`looperSnapTakeBars`** — a layer's bar count must always *tile* the cycle (a
  whole divisor or a whole multiple). That single constraint is why a plain
  looping `AudioBufferSourceNode` can never fall out of phase, with no
  per-repeat scheduling and nothing to re-sync.
- **The AudioWorklet recorder's pre-allocated buffers.** The first version
  allocated a `Float32Array` per 128-sample render quantum on the realtime audio
  thread. It passed every headless test and audibly crackled on a real device.
  Never allocate in `process()`.
- **`looperMetroCancelPending()`** — `osc.start(atTime)` commits a click the
  instant it is called, so clearing a scheduler timeout does not unschedule it.
  This is the fix for the "extra click throwing off the accent" bug.
- **The three generations of saved-data restore**, including
  `looperDeriveLegacyGrid()`. Real recordings depend on it.

Full detail is in `docs/legacy-app-notes.md` (the legacy `CLAUDE.md`, preserved
verbatim). Read the LOOPER section before touching any of the above.

## Tests

The legacy Playwright suites (`test-bargrid.js`, `test-legacy.js`, 128 checks)
live in the old `_Versetile/tests/` folder and still test the legacy file. They
have not been brought into this repo yet, because they load `versetile.html`
from their own directory and inject a `window.__T` hook just before the IIFE
closes — that mechanism doesn't survive the port as-is.

Bring them across as part of step 1 of the Looper port, when the engine becomes
an importable module and can be tested directly rather than through an injected
global. That is a strictly better position than the current one.
