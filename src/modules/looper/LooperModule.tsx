import { ModulePlaceholder } from "@/components/ModulePlaceholder";

/**
 * Looper.
 *
 * ============================================================================
 * READ THIS BEFORE PORTING. The Looper is ~2,400 lines and by far the most
 * carefully-tuned code in the project. It is also the easiest thing here to
 * ruin, and the failure mode is not a crash -- it is audio that drifts, clicks
 * late, or crackles, which no type checker will catch.
 * ============================================================================
 *
 * THE RULE: React must never own the audio clock.
 *
 * Everything in the Looper is driven from `AudioContext.currentTime` inside one
 * `requestAnimationFrame` loop -- never a timer, never an accumulated delta --
 * so the picture on screen cannot drift from the audio. Re-expressing that as
 * React state would put a reconciler between the clock and the canvas and give
 * up the guarantee. The legacy app already knew this: its shared `render()` pass
 * explicitly skips the Looper (`if (state.mode === "looper") return;`) and the
 * Looper owns its DOM directly.
 *
 * So the port is NOT "rewrite the Looper in React". It is:
 *
 *   1. Lift the existing code out of the IIFE into framework-agnostic TypeScript
 *      modules under src/audio/looper/ — engine, metronome, recorder, grid math,
 *      IndexedDB. Plain classes and functions. No React import anywhere in them.
 *      This step should change zero behaviour, and the existing Playwright
 *      suites are what prove it.
 *
 *   2. Give the engine a small subscribe/emit surface: `onPhaseChange`,
 *      `onTracksChange`, and so on — coarse, user-paced events only.
 *
 *   3. Let React render the CHROME and nothing else: the project bar, the
 *      metronome controls, the bar slider, the track list. These are ordinary
 *      forms and they benefit from React.
 *
 *   4. Hand the wheel canvas and the waveform lanes to the engine as refs. The
 *      rAF loop keeps drawing to them directly, exactly as it does now. React
 *      renders the <canvas> element; it must not render its contents.
 *
 * Per-frame values (the sweep position, the "BAR 3/8" readout, the elapsed
 * time) must NOT become React state. A `setState` at 60fps re-renders the tree
 * 60 times a second to update a number. Write those into the DOM from inside the
 * rAF loop.
 *
 * PIECES WORTH PRESERVING VERBATIM — each one exists because something broke:
 *   - `looperSnapBarSecToSamples` — bar length snapped to a whole sample count.
 *     Without it, round(8 bars) != 8 * round(1 bar) and layers drift a few
 *     samples per cycle, forever.
 *   - `looperSnapTakeBars` — a layer's bar count must always TILE the cycle
 *     (a whole divisor or a whole multiple). That single constraint is why a
 *     plain looping AudioBufferSourceNode can never fall out of phase.
 *   - The AudioWorklet recorder's pre-allocated buffers. The first version
 *     allocated a Float32Array per 128-sample render quantum on the realtime
 *     audio thread; it passed every headless test and audibly crackled on a real
 *     device. Never allocate in `process()`.
 *   - `looperMetroCancelPending()` — `osc.start(atTime)` commits a click the
 *     instant it is called, so clearing a scheduler timeout does not unschedule
 *     it. This is the fix for the "extra click throwing off the accent" bug.
 *   - The three generations of saved-data restore, including
 *     `looperDeriveLegacyGrid()`. Real recordings of Mark's depend on it.
 *
 * Full detail lives in the legacy CLAUDE.md's LOOPER section, preserved at
 * docs/legacy-app-notes.md. Read it before touching any of the above.
 *
 * WHY THIS TAB STILL POINTS AT /legacy/: the Looper is the one module that has
 * never been tested on a real iPhone, because mic access needs a secure context
 * and the app has only ever run as a local file. Getting the unchanged,
 * fully-tested legacy app onto https is worth more right now than a port of it.
 */
export function LooperModule() {
  return (
    <ModulePlaceholder
      title="Looper"
      description="Bar-grid multi-track looper. Set a tempo, a time signature and a bar count; one button walks record, overdub, stop, forever."
      status="legacy"
    />
  );
}
