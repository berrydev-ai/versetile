# src/audio

Imperative audio engines. **No React imports in this folder, ever.**

Empty until the ports land. Two things go here:

- `synth.ts` — the Karplus-Strong pluck synthesis that plays chords and scales
  (legacy `versetile.html`, `AUDIO ENGINE` section, ~line 731).
- `looper/` — the bar-grid looper: engine, metronome, recorder (AudioWorklet with
  a ScriptProcessorNode fallback), grid math, IndexedDB persistence (legacy
  `LOOPER` section, ~lines 1398–3822).

## Why this folder is walled off from React

Everything in the Looper is driven from `AudioContext.currentTime` inside one
`requestAnimationFrame` loop — never a timer, never an accumulated delta — so
the picture on screen cannot drift from the audio actually playing.

Putting a reconciler between the clock and the canvas gives that up. So: engines
are plain classes with a coarse subscribe/emit surface, React renders the
controls around them, and the rAF loop draws to a `<canvas>` handed over as a
ref. Per-frame values (sweep position, the "BAR 3/8" readout, elapsed time) are
written to the DOM from inside the loop — never through `setState`.

Grid math (`snapBarSecToSamples`, `snapTakeBars`) should land here as pure
functions with no `AudioContext` dependency, so it can be unit-tested directly.
That is most of what the 128 existing Playwright checks currently reach through
an injected global to test.

See `docs/migration.md` for the port sequence and the list of things that must
survive verbatim.
