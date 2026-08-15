# Versetile — Chord & Scale Explorer

Single-file guitar theory web app. Interactive chord/scale diagrams, an
audio engine, and a chord-progression library.

Renamed from **Fretwork** to **Versetile** on 2026-08-14, in two passes
(see "Brand" below): header/branding first, then a full pass through the
file name, internal storage keys, and comments. A handful of legacy
constants still literally contain the string `fretwork` on purpose — they
exist only to migrate a pre-rename user's saved data forward, and are
explained in "Brand".

## Files

- `versetile.html` — THE app. Single self-contained file. Edit this.
  Renamed from `fretwork.html` on 2026-08-14 — see "Brand".
- `versions/` — dated snapshots. Copy the current file in here before any
  large or risky change.

No build step, no dependencies, no network calls. Open it in a browser and
it runs.

## Structure of versetile.html

One `<style>` block, one `<script>` block (everything wrapped in a single
IIFE, so nothing is global), ~3600 lines total. The script is
divided by banner comments — search for `/* ===` to jump between sections:

| Section | What lives there |
|---|---|
| MUSIC THEORY DATA | `NOTE_NAMES`, `CHORD_TYPES`, `SCALE_TYPES`, `TUNINGS` |
| CHORD PROGRESSIONS | `PROGRESSIONS`, roman-numeral parsing |
| STATE | app state object, `currentTuningPcs()` |
| AUDIO ENGINE | Karplus-Strong pluck synthesis via Web Audio |
| VOICING / BOX GENERATORS | `generateChordVoicings()`, `generateScaleBoxes()` |
| DIAGRAM RENDERING (SVG) | `renderChordDiagram()`, `renderScaleDiagram()` |
| FULL INTERACTIVE FRETBOARD | `renderFullFretboard()` |
| UI WIRING | event listeners, `render()` |
| LOOPER | GarageBand-style loop wheel + waveform lanes (own section, below) |

`render()` (in UI WIRING) explicitly skips the Looper: `if(state.mode==="looper")
return;` — the Looper owns its DOM directly instead of going through the
shared `render()` pass. `setMode()` calls `looperOnEnterTab()` /
`looperOnLeaveTab()` at the Looper's tab-switch boundary; those two
functions are the hooks into the rest of the app.

### LOOPER section

A "hardware pedal" looper, **built on a bar grid** (rewritten 2026-08-14 —
see "Bar grid" below; it used to be free-form, with the loop being however
long layer 1 happened to be). Mic access is requested once when the Looper
tab is first opened and kept open for the session. One tap on the big
circular wheel walks record → overdub → stop → ... forever, with a count-in
in front of layer 1 and a silent wait for the next bar line in front of
every overdub. The ring, the per-track waveform lanes, and the shared
playhead line are all driven from `AudioContext.currentTime` inside one
`requestAnimationFrame` loop (`looperTick`) — never a timer, never an
accumulated delta, so the picture can't drift from the audio. Persists to
IndexedDB (`versetileLooperDB`, `tracks` store — additive schema only, so old
recordings still load; see "Restoring older data"). A metronome (toggle +
BPM slider + tap-tempo + time-signature dropdown) runs as a click saved to
the same DB's `meta` store under the `"metronome"` key. It **is** locked to
the loop now: `looperMetroAnchor` starts it on the loop's own beat grid so
beat 1 is bar 1, and `looperMetroRealignToGrid` (called from
`looperLaunchLoop`) moves an already-running click onto the grid the instant
layer 1 establishes one. Without that second call the click keeps the phase
it picked up when the count-in started, which is 60–120ms off
`gridStartCtxTime` — that anchor isn't chosen until the take has been
captured, drained and scheduled 0.06s out — and a player following the click
would bake that offset into every overdub. With no loop yet it still
free-runs, as it always did.
The time-signature dropdown (2/4 through 12/8, `LOOPER_TIME_SIGS`)
picks how many clicks make up one measure, which is what the accent (a
higher-pitched click on beat 1) cycles against; the BPM slider always means
"clicks per minute," whatever a click represents for that signature. Every
signature, including the compound ones (6/8, 9/8, 12/8), clicks each
literal beat with the accent on beat 1 — 12/8 counts all the way through
"one two three ... twelve" before the accent comes back around. (An earlier
version had the compound meters click only their 2/3/4 main pulses instead;
that was tried and dropped for just counting every beat.)

Every record/overdub start is preceded by a count-in of 1 or 2 measures,
Mark's choice via a "1 Bar / 2 Bars" toggle next to the time-signature
dropdown (phase `"countin"`,
`looperStartCountin`/`looperCancelCountin`/`looperFinishCountin`;
`looperState.metro.countinMeasures`, persisted alongside bpm/sig/enabled)
— however many clicks the current time signature/measure count works out
to, at the current tempo. The accent resets every measure, not just once
at the very start of a 2-bar count-in — "ONE two three four, ONE two three
four," same as a real count-off, not one number slowly draining from 8
down to 1. The metronome always clicks through a count-in even if the
metronome toggle is off; `wasMetroEnabled` (captured when the count-in
starts) decides whether it goes silent again (`looperMetroStopSilent` — same
as a real stop, minus the DB write) or keeps going once actual recording
begins. The click grid always restarts fresh at beat 1 for a count-in,
whether or not the metronome happened to already be running mid-measure.
Tapping the wheel again during the countdown cancels it (no recording
happens); leaving the Looper tab mid-count-in also cancels it, since the
`requestAnimationFrame` loop that would otherwise notice the countdown
finished is paused. The wheel shows the count descending each measure (3,
2, 1 for 3/4, repeating each bar) with a red ring sweep that also resets
every measure, a blinking dot, and — once there's more than one bar to
count in — a "COUNT-IN 1/2" style sub-label so it's clear which bar you're
on when the numbers repeat. All of it still driven from `ctx.currentTime`,
not a timer.

The count-in's own clicks are scheduled as one exact, upfront batch of
`beatsPerMeasure * countinMeasures` clicks (`looperMetroScheduleClick`
calls in a plain `for` loop), not the metronome's normal open-ended
lookahead scheduler
(`looperMetroSchedulerTick`) — that loop schedules up to
`LOOPER_METRO_LOOKAHEAD` seconds ahead of whenever it happens to tick,
which could commit an extra click beyond the count-in's intended length
before the count-in even noticed it should stop, or leave a click from
whatever grid was running *before* the count-in started still armed and
ready to fire on top of the fresh one — `osc.start(atTime)` commits a
click the instant it's called; clearing the scheduler's `setTimeout`
does nothing to a click already queued up. That combination was the
"extra click throwing off the accent" bug Mark reported. Fixed with
`looperMetroCancelPending()`, which walks `looperState.metro.pendingClicks`
(every click's `{osc, atTime}`, appended in `looperMetroScheduleClick`)
and calls `osc.stop(now)` on anything not yet played, then clears the
list — called whenever the beat grid resets: starting a count-in,
cancelling one, and every real stop (folded into `looperMetroStopSilent`).
`looperState.metro.beatIndex`/`nextBeatTime` are left positioned exactly
where the count-in's batch leaves off, so if the metronome carries on
into the actual recording, resuming the open-ended scheduler
(`looperMetroSchedulerTick`) from there is a seamless continuation, not a
restart — its very next click is correctly accented, landing right as
recording begins.

#### Bar grid (2026-08-14)

The loop is a grid of bars, not a free-running length. Three numbers define
it, and once layer 1 exists none of them move:

| | |
|---|---|
| `looperState.loopBarSec` | seconds per bar, frozen from the tempo/signature in force when layer 1 finished, snapped to a whole sample count (`looperSnapBarSecToSamples`) |
| `looperState.loopBars` | bars in one full cycle. Starts as the Bars slider's value; only ever **grows** |
| `looperState.gridStartCtxTime` | the `AudioContext` time that is permanently bar 0 / loop phase 0 |

`loopLength` is just `loopBars * loopBarSec`, kept in state because so much
of the drawing and phase math reads it. `looperBarSec()` returns the frozen
value if there is a loop and the controls' value otherwise, so pre-loop code
paths work unchanged; never read `looperState.loopBarSec` directly.

**The Bars control.** Always on, 1–24, `looperBarsSlider` /
`looperBarsValue` / `looperMetroApplyLoopBars` / `looperMetroSetLoopBars`,
sitting below the count-in row. It replaced the old optional "Max Len" cap
(a toggle plus slider, off by default) — a grid-quantized looper has to know
its own length up front, so there is no off state. The wheel divides into
that many segments immediately, before anything is recorded.

**Layer 1** count-ins as before, then auto-stops after exactly `loopBars`
bars. `looperState.maxRecordSec` is `takeTargetBars * takeBarSec`, both
snapshotted in `looperBeginRecording`; `looperTick` compares it against
`ctx.currentTime - recordStartCtxTime` every frame and calls the ordinary
`looperStopRecording()` once reached (no timer, and safe to call repeatedly
since that function no-ops once stopped). It also sets
`looperState.autoStopped`, which is what `looperFinalizeRecording` keys off
to use `takeTargetBars` verbatim — **not** `round(measured/barSec)`, because
rAF is paused while the page is hidden, so backgrounding the app mid-take
means the frame that notices runs minutes later and "measures" a
multi-minute take. Tapping stop early instead gives however many bars were
actually played, rounded and clamped to 1–24, with the Bars slider following
so the UI never claims a length the loop doesn't have.

**Per-layer bar lengths.** A layer is not necessarily one full cycle. Every
take is measured off the audio clock, divided by `loopBarSec`, and snapped
by `looperSnapTakeBars()` to a bar count that TILES the cycle: shorter takes
snap to a whole divisor of `loopBars` (1, 2, 4 or 8 against an 8-bar loop),
longer ones to a whole multiple (16, 24), which grows the cycle to match.
Ties resolve to the longer option — 3 bars against an 8-bar loop becomes 4,
keeping everything played rather than truncating a third of it. Mark's call
when asked, over "keep whatever you played and chop the leftovers," which
would audibly stutter at every cycle boundary.

That constraint is the whole trick: because `track.bars` always divides
`loopBars`, a plain looping `AudioBufferSourceNode` holding one layer's own
length repeats an exact whole number of times per cycle and can never drift.
A 1-bar layer under an 8-bar loop is simply a 1-bar buffer on repeat; it
comes round 8 times while the 8-bar layer comes round once, with no
per-repeat scheduling and nothing to re-sync. `looperJoinNewTrackIntoLoop`
moduloes the start offset against **the layer's own** buffer duration, not
the master length. (Snapping `loopBarSec` to whole samples is what makes
this exact rather than merely close: `looperFitBufferToLength` sizes buffers
with `Math.round(sec*sampleRate)`, so without it `round(8 bars)` can differ
from `8*round(1 bar)` by a few samples, which accumulates every cycle.)

**Growth** is safe to do without touching a single already-playing source:
the new length is a whole multiple of the old, so every existing layer still
tiles it, and every old cycle boundary (`gridStartCtxTime` included) is
still a boundary of the bigger one. Growth is capped at the largest whole
multiple of the current cycle that fits in 24 bars — clamping straight to 24
would break tiling (a 16-bar loop clamped to 24 leaves its layers repeating
one and a half times).

**Deleting the longest layer deliberately does NOT shrink the cycle.** A
shorter master could leave a survivor's bar count no longer dividing it —
delete the 24-bar layer that grew an 8-bar loop and a 3-bar layer recorded
against 24 is stranded — and that tiling property is the one thing the whole
scheme relies on. This is also why `cycleBars` is persisted explicitly
rather than re-derived as "the longest layer" on reload, which would undo it
silently. Deleting *every* layer tears the grid down (`loopBars`,
`loopBarSec`, `hasLoop` all cleared) and unlocks the controls.

**Tempo, signature and bar count lock** (`looperGridLocked` /
`looperUpdateGridUI`) while a loop has layers **and** during a take —
`looperSetPhase` refreshes the lock, so it covers `countin`, `recording1`,
`queued` and `overdub` too. Layer 1 is the take that defines the grid, so
leaving tempo live while it records means the auto-stop point (frozen at the
start of the take) and the bar length used to interpret it can disagree:
dragging BPM 120→100 four bars into an 8-bar take used to end with a 7-bar
loop at a tempo nothing was played at. `looperBeginRecording` snapshots
`takeBarSec`/`takeTargetBars` so that guarantee holds structurally rather
than depending on the lock. A `#looperGridHint` line under the slider says
why they're greyed out.

**Quantized starts.** Tapping to start an overdub (phase `"playing"` → tap)
never begins recording right away. It arms `"queued"`
(`looperStartQueuedOverdub`/`looperCancelQueuedOverdub`) and waits —
silently, no click; the loop already playing is the cue — for the next BAR
line (`looperNextBarCtxTime`, checked in `looperTick` the same
audio-clock-driven way as everything else), then calls
`looperBeginRecording(true)` that exact instant. It used to wait for the
whole loop to come back round to phase 0, which meant up to a full cycle of
dead air; waiting only for the next bar is the same guarantee at up to
`loopBars` times less waiting. **Strictly** the next bar — a tap landing a
hair late waits out the rest of that bar rather than snapping backwards to
the line it just missed (Mark's choice when asked; the alternative offered
was a ~1/8-note grace window). Where in the cycle that start bar falls is
baked into the layer's buffer as a phase offset (`(takeStartBar %
track.bars) * loopBarSec`, via `looperFitBufferToLength`), so the buffer's
own sample 0 always means "the top of this layer's own cycle, aligned to bar
0 of the master" — a layer only ever needs *starting* at the right offset,
never rebuilding, however many layers join later. The ring during `"queued"`
reuses the `"playing"`/`"overdub"` draw path in rec-red and outlines the bar
the take will land on; the center label reads "WAITING" / "STARTS BAR N" (a
seconds countdown would just read 0:00, since the wait is under one bar by
definition). Tapping again cancels it, as does leaving the tab
(`looperOnLeaveTab`), since the rAF loop that would notice the bar line is
paused. Layer 1 is untouched by any of this — there's no loop yet to wait
on, so it still goes through the ordinary click count-in above.

**Deleting a layer is refused mid-take** (`LOOPER_BUSY_PHASES`, same as
opening a project or starting a new one). Deleting the last layer during an
overdub used to force the phase straight to `"armed"` while capture carried
on with nothing left able to stop it — a growing buffer, a stranded red
"Recording…" lane, and a wheel whose next tap started an unrelated layer 1.

**The wheel** draws `looperDisplayBars()` segments — the real cycle if there
is one, else the slider's value — as separate arcs with a gap between them
(`looperDrawBarRing`), so a sweep landing on a gap is visibly ON a bar line.
Progress fills segment by segment in every phase; the old open-ended
orbiting dot is gone along with the unlimited-length recording it
represented. Center labels read "BAR n/N" while recording and playing. Lanes
show a short layer's waveform tiled across the cycle with a divider per
repeat and a "1 bar ×8" style label; `looperLaneReps` measures off the
buffer duration rather than `track.bars`, so it always describes what you
can actually hear.

#### Restoring older data

Three generations of saved data have to load:

1. **Current** — `track.bars` present, `meta.loopBarSec`/`cycleBars`
   present. Read straight back.
2. **Bar-grid-era records missing the newer fields** — bar counts derived by
   rounding each buffer's duration against the saved tempo; the cycle falls
   back to the longest layer, and is never allowed to come out shorter than
   the longest layer whatever the stored value says.
3. **Genuinely free-form (pre-bar-grid)** — no `track.bars` at all. These
   came from the era when the loop was however long layer 1 happened to be,
   so their duration is almost never a whole number of bars at the saved
   tempo. `looperDeriveLegacyGrid()` takes the bar **count** from the tempo
   (the closest plausible whole number) but the bar **length** from the
   audio itself, so the reconstructed cycle is exactly as long as what's
   actually stored. Deriving both from the tempo would state a length the
   audio doesn't have — a 7.0s legacy loop at 120bpm 4/4 rounds to 4 bars
   and would claim 8.0s, so the wheel sweeps a second of nothing and the
   very next overdub is built 8.0s long against 7.0s layers: a second of
   drift per cycle.

`looperRestoreOnLoad` re-reads the `meta` record itself rather than waiting
on `looperMetroRestoreOnLoad` — both are async IIFEs that run at load with
no ordering between them, so depending on that one's state would be a race.

#### Recording pipeline: raw Float32 capture (AudioWorklet + ScriptProcessorNode fallback)

Every take (layer 1, every overdub) is captured as raw `Float32Array` audio
via an `AudioWorkletNode`, not `MediaRecorder`. This replaced the original
`MediaRecorder`-based pipeline (webm/opus on Chrome/Firefox, mp4 on Safari)
because a latency-calibration feature is coming next, and calibration needs
to know exactly when a captured sample corresponds to on
`AudioContext.currentTime` — `MediaRecorder` encodes through an opaque,
codec-dependent buffer with no such guarantee. Recording and playback now
live in the same clock domain, which is the precondition that feature needs.
This refactor by itself is pure plumbing — every existing Looper behavior
(count-in, layer-1 auto-stop, quantized overdub start, Projects) works
identically to before; the full pre-existing test suite passes unchanged,
plus a new `test-audioworklet.js` covering the new pipeline specifically.

**How it works:** `looperSetupRecorderCapture(ctx, src)` runs once, the
first time the mic is opened (`looperRequestMic`), and wires up whichever
capture path is available:

- **Normal path — AudioWorkletNode.** `LOOPER_RECORDER_WORKLET_SRC` (a
  processor class as a template-literal string) is registered via
  `ctx.audioWorklet.addModule()` on a `Blob`/`URL.createObjectURL` module —
  no separate `.js` file, so the app stays one self-contained HTML file. The
  processor gates on a simple `active` flag toggled by `"start"`/`"stop"`
  messages. **Important perf detail, fixed after it shipped:** the first
  version posted one message per 128-sample render quantum (~344/sec at
  44.1kHz), allocating a fresh `Float32Array` on every single `process()`
  call. That's a known AudioWorklet anti-pattern — `process()` runs on the
  realtime audio thread, and allocating there creates GC pressure that can
  stall it past its deadline, which surfaces as audible crackle/distortion
  baked permanently into the recording. It didn't show up in headless
  testing (an idle sandboxed browser recording a 1-2s clip never gets close
  to real deadline pressure) but was audible on a real device the first time
  Mark tried it. Fixed by accumulating samples into pre-allocated
  per-channel buffers inside the processor (`ensureBufs`/`flush`, no
  allocation on the per-block hot path) and only posting a message —
  transferring the accumulated buffer — every `capacity` (4096) samples per
  channel, roughly every 93ms / ~11 messages/sec instead of ~344. `"stop"`
  always flushes whatever's left in the accumulator immediately before
  replying, so the batching only changes steady-state message frequency, not
  which audio makes it into the take or how promptly a stop resolves. On
  `"stop"`, the processor posts back a `"stopped"` confirmation *from the
  same message handler that called flush()*, which — because a
  `MessagePort` delivers in strict send order and the handler runs on the
  same audio-rendering thread as `process()` — is guaranteed to arrive on
  the main thread after every data chunk this take will ever produce. That
  confirmation is what actually triggers `looperFinalizeRecording()`;
  nothing is read out early.
- **Fallback path — ScriptProcessorNode.** Only used if the worklet path
  itself throws during setup (observed on some iOS Safari versions). Runs on
  the main thread instead of the audio thread; `onaudioprocess` appends
  directly to the capture buffers whenever `looperState.capturing` is true.
  Deprecated but universally supported, and functionally identical from
  everything downstream's point of view.
- Both paths feed `looperOnCaptureFrames(channels)`, which appends onto
  `looperState.captureChunks` (one growing array of `Float32Array` blocks
  per channel). Either node is connected through a zero-gain "muted sink"
  `GainNode` to `ctx.destination` — the same trick used elsewhere in
  Versetile to keep a node actively processed by the engine without it being
  audible (no live monitoring, unchanged from before).

**Starting/stopping a take** (`looperBeginRecording`/`looperStopRecording`)
kept its exact previous timing semantics on purpose: `recordStartCtxTime` is
still `ctx.currentTime` read synchronously the instant recording is
requested, and the take's measured length is still `ctx.currentTime` read
synchronously whenever the stop actually resolves (immediately for the
ScriptProcessorNode path; on the worklet's `"stopped"` message for the
worklet path) minus `recordStartCtxTime` — identical to how the old
`MediaRecorder.onstop` handler measured it. This means every downstream
consumer of that timing (layer-1 auto-stop, the quantized-overdub phase
offset, the wheel's live elapsed-time label) needed zero changes. The
worklet's own per-sample timestamping is *not* used for this general
recording flow — it's kept in reserve for the calibration feature itself,
which needs a tighter guarantee than "how long was the user recording for."

**`looperFinalizeRecording(isOverdub)`** (renamed from
`looperHandleRecordingStop`) concatenates the captured chunks into one
`AudioBuffer` directly (`looperConcatCapturedAudio()` — `ctx.createBuffer()`
+ `copyToChannel`-equivalent per-channel `set()` calls), with **no decode
step at all** now, since the samples are already raw PCM — a full round
trip faster and more reliable than the old encode-then-`decodeAudioData()`
path. Everything after that is unchanged: `looperFitBufferToLength()` still
trims/pads (layer 1) or rotates into phase (overdubs) exactly as before.

**Storage changed, and fixed a real bug in passing.** Every layer is now
persisted to IndexedDB as a hand-rolled 16-bit PCM WAV
(`looperEncodeWav()` — 44-byte RIFF/WAVE/fmt/data header, no external
library), not a `MediaRecorder` blob — lossless, and `decodeAudioData()`
reads WAV back universally so `looperRestoreOnLoad`/`looperOpenProject`
needed no changes. More importantly: the stored blob is now built from the
**fitted** buffer (post length-fit/phase-rotation), whereas the old code
stored the **raw, unfitted** `MediaRecorder` capture while using the fitted
buffer only for the live `AudioBuffer` — meaning an overdub's phase
correction was silently lost on reload before this refactor. That bug is
fixed as a side effect of the storage change; it was never fixed
retroactively for tracks a session already had saved before this refactor
shipped (those keep loading exactly as they did previously — old webm blobs
still decode fine, just without the phase fix applied to that old data).
`track.mimeType` is still stored per-track (now always `"audio/wav"` for
anything recorded from here on); it was never actually used to decode
(`decodeAudioData` sniffs the container from the bytes), so this didn't
require touching any restore code.

`looperPickMimeType()` (the old Safari-mp4-vs-Chrome-webm codec picker) is
gone — there's no codec to pick anymore.

#### Pause/resume

A small round button (`#looperPauseBtn`, `⏸`/`▶`) sits right below the
center label, inside the wheel's own circle — visible only during ordinary
playback (phase `"playing"`, the state where the wheel's own label reads
"OVERDUB"). Hidden the rest of the time: there's nothing to freeze before a
loop exists, and pausing mid-recording/overdub isn't offered at all, since
there's no sensible way to "freeze" halfway through a take on the input
side. Tapping it doesn't go through the wheel's own click handler — it's
`pointer-events:auto` inside the otherwise-`pointer-events:none`
`.looper-wheel-center`, with `stopPropagation()` in its own listener, so it
can be tapped without also triggering `looperOnWheelActivate`.

`looperPausePlayback()` captures the loop's current position
(`pausedOffsetSec`, seconds from phase 0) and calls `looperStopTrackSource()`
on every track — muted or not, since mute is just a gain fader on top and
keeping every source in lockstep means unmuting later is still in sync.
`looperResumePlayback()` restarts every track's source at that position
wrapped into its OWN buffer (`pausedOffsetSec % track.buffer.duration` —
since the bar grid, a layer can be shorter than the cycle, so the raw offset
is often several multiples of that layer's length, and an out-of-range
`start()` offset isn't handled consistently across browsers) and re-anchors
`gridStartCtxTime = startAt - pausedOffsetSec`, so
every downstream consumer of `gridStartCtxTime` (the ring sweep, the shared
playhead, a future overdub's bar-line quantization) lines up with the new
start point instead of the paused gap looking like the loop silently skipped
ahead. Because the re-anchor keeps `gridStartCtxTime` a whole
`pausedOffsetSec` behind the restart, the bar grid stays exactly where it
was relative to the audio, so a quantized overdub started after a pause
lands where it would have without one. `looperMetroRealignToGrid()` is
called on resume for the same reason: `gridStartCtxTime` moved, so a running
click has to move with it. `looperLoopPhase01()` freezes at
`pausedOffsetSec/loopLength` while
paused rather than recomputing from `ctx.currentTime` (which keeps
advancing even though nothing is actually playing) — since the ring draw,
center overlay, and playhead position all read that one function, freezing
it there was enough to freeze all three without touching each separately.

**Resume latency, tuned down after Mark noticed a lag.** The first version
scheduled every track's restart at `ctx.currentTime + 0.06` (60ms) — the
same lead used for launching layer 1 and joining an overdub elsewhere in
the file, copied over without reconsidering it. Those other two spots don't
read as laggy because something else is already happening around them (a
take being fit/encoded, a layer being added to the mix); resume has nothing
else going on, so the full 60ms silence between tapping play and hearing
anything read as a distinct, noticeable lag. Reduced to `+0.01` (10ms) — the
lead still exists and still matters (every track's `start()` call is issued
in its own iteration of a `forEach`, and each one takes some nonzero sliver
of time to execute; without *any* lead, a later track's start time can
already be in the past by the time its `start()` call runs, making it begin
audibly late relative to the others), just cut down to roughly the minimum
that's still safe. Also added explicit `touch-action:manipulation` to the
pause button's CSS (the wheel itself already had it) so a touch device
can't add its own tap-recognition delay on top. If pause specifically still
feels laggy after this, that's more likely the output device's own
hardware latency (Bluetooth headphones commonly run 100ms+) than anything
in this code — the same category of problem the calibration feature
(queued, not yet built) is meant to eventually measure and correct for.

While paused, the wheel's own tap is a deliberate no-op
(`looperOnWheelActivate`'s `"playing"` branch now also checks
`!looperState.paused`) — otherwise a tap would queue an overdub against a
silent loop, which is exactly the confusing state the dedicated button
exists to avoid. The center label swaps to "PAUSED" (instead of "OVERDUB")
for the same reason: tapping the big wheel shouldn't look like it would
start an overdub when it won't. The "BAR n/N" sub-label stays, since the
frozen bar position is exactly what you want to read while paused. The ring itself dims to
`LOOPER_COLORS.muted` (new — `--muted` added alongside the other themed
colors `looperReadColors()` already reads) instead of its normal
teal/red, a visual cue that the frozen position is a pause, not a live
sweep, even though it's the exact same draw path.

`looperSetPhase()` resets `paused` to `false` on any transition away from
`"playing"` — pause only ever means something inside that phase. The one
place that *doesn't* naturally go through that reset is switching to a
freshly playing loop while phase was already `"playing"` (e.g. opening a
different saved project while paused) — `looperLaunchLoop()` explicitly
clears `paused` itself for that reason, since otherwise a stale pause from
the loop you just left could carry over and freeze the new one's ring at
the wrong position while it's actually playing normally.

#### Projects: saving and loading named loops

Everything above describes the *working loop* — whatever's currently in
`looperState.tracks`, auto-persisted to IndexedDB (`tracks`/`meta` stores)
exactly as it always has been, with no name attached. Projects are a
separate, opt-in layer on top: an explicit "save this as something I can
come back to" snapshot, stored in a new `projects` object store (DB version
bumped 3→4, additive only — `onupgradeneeded` guards every store creation
with `objectStoreNames.contains`, so existing `tracks`/`meta` data reads
back untouched). A project record is `{id, name, createdAt, updatedAt,
loopLength, nextTrackNum, nextColorIdx, tracks:[{id,order,name,bars,blob,
mimeType,volume,muted}], metro:{bpm,sig,countinMeasures,loopBars,loopBarSec,
cycleBars}}`. Records written before the bar grid have no `track.bars` and
no `loopBars`/`loopBarSec`/`cycleBars`; `looperOpenProject` reconstructs all
of them rather than rejecting the project — see "Restoring older data".

A project bar sits above the wheel (`#looperProjectBar`) showing the open
project's name (`looperState.currentProjectName`, "Untitled Loop" when
`currentProjectId` is null) plus an "Unsaved changes" flag
(`looperState.projectDirty`), with four buttons: **Save**, **Save As**,
**Projects**, **New**. Each saved project remembers its own tempo/time-
signature/count-in-length/bar-count settings, plus the grid it was actually
recorded on (`loopBarSec`/`cycleBars`) (Mark's choice when asked) —
opening a project restores those via the same `looperMetroApplyX` functions
the restore-on-load path uses, then a single `looperSaveMetroSettings()`
syncs the change into the *working* settings record too. The metronome's
on/off click state is deliberately **not** part of a project (left as a
session-level preference) — otherwise every tempo/signature tweak would
also be flipping the click on/off from underneath you, and toggling the
click for practice shouldn't itself count as "unsaved changes."

- **Save** (`looperSaveProject`) overwrites the open project in place. If
  nothing's open yet (Untitled), it falls through to Save As instead, since
  there's nothing to overwrite.
- **Save As** (`looperSaveProjectAs`) always creates a new project — `window.
  prompt()` for a name — and switches to it. This is how you branch off a
  take you like without touching the earlier version: open a project, keep
  building, Save As under a new name.
- **Projects** (`looperOpenProjectModal`) opens a bottom-sheet listing every
  saved project (name, length, layer count, last-saved date, a teal border +
  "Current ·" prefix on whichever one is open), each with **Rename** and
  **Delete** buttons plus a tap-to-open row.
- **New** (`looperNewProject`) clears the working loop back to a blank
  Untitled slate. Deliberately leaves the metronome settings alone rather
  than resetting them — starting a fresh idea usually means staying in
  whatever tempo you were already in.
- Opening a different project, or New, while there are unsaved changes
  (`projectDirty`) prompts `window.confirm()` first; dismissing leaves
  everything exactly as it was. Both also refuse outright (with a message
  in the usual error slot) while a recording/count-in/queued-wait is
  actually in progress (`LOOPER_BUSY_PHASES`), rather than pulling the rug
  out from under an in-flight take.
- Deleting the project that's currently open doesn't touch the working
  loop's audio at all (still playing, nothing audibly changes) — it just
  detaches from the now-gone project, reverting to Untitled/dirty, since
  there's no longer anything to fall back to.

`projectDirty` (and which project, if any, is open) is set by
`looperMarkProjectDirty()`, called from every place that already persists a
working-loop change: the four track-mutation spots (finish a recording,
mute, volume, delete) and the five metro "Set" functions (bpm, sig,
count-in measures, max bars, max-bars-enabled). It always refreshes the bar
UI — Save/Save As only enable once `tracks.length>0`, independent of the
dirty flag itself — but only re-persists the `"currentProject"` meta
pointer record on the actual clean→dirty transition, to avoid a DB write on
every slider tick. (An earlier version of this skipped the UI refresh too
whenever already dirty, as a bundled optimization — that meant recording a
layer right after any other dirtying change, like nudging the tempo, left
Save wrongly disabled since the enabled-state refresh got skipped along
with it. Caught by `test-projects.js`, fixed by separating "always update
the UI" from "only re-persist on the transition.")

Opening a project decodes every layer fresh (same approach as
`looperRestoreOnLoad`), stops whatever's currently playing, and re-points
the *working* tracks store at the new set (`looperReplaceWorkingTracksInDb`
— clear then re-save each) so reload continuity keeps working without that
code needing to know projects exist at all. That sync is best-effort
(wrapped in try/catch): the project itself is already safely saved in the
`projects` store either way, so a hiccup there just risks forgetting
today's in-session pointer on the next reload, not losing anything already
saved.

Deliberately out of scope for this pass: export, a takes bin, and
multi-cycle latency calibration — see the comment at the top of the LOOPER
section for the reasoning. Also out of scope, left for whatever Mark builds
on top of this next (per his "eventually I'm gonna build something off of
that"): reordering/browsing projects any way other than most-recently-saved
first, project thumbnails/audio previews from the list without fully
opening one, and any kind of tagging or folders.

## Brand

The app was renamed from Fretwork to Versetile on 2026-08-14 (a pun on
"verse"), in two passes the same day.

**Pass 1 — header + branding only.** Chord diagrams, the Looper wheel,
buttons, and tabs all kept their original look. The header's old
`<div class="title">Fret<span>work</span></div>` was replaced with a
`.brand` lockup that inlines two hand-drawn/marker-style SVGs traced from
Mark's artwork:

- **Symbol** — a standalone repeat-sign glyph (dot, pill, thin bar, thick
  bar), `viewBox="-1.8 -1.9 180.6 311.2"`. Doubles as the browser tab
  favicon (`<link rel="icon" type="image/svg+xml" href="data:...base64,...">`
  in `<head>`, keeping its original black fill since favicon chrome is
  usually a neutral light color) and, on narrow screens, stands in alone
  for the wordmark.
- **Wordmark** — the full "Versetile" word, `viewBox="69.0 129.0 1619.2
  338.8"`. The same repeat-sign glyph already does double duty as the
  word's `i` and `l`, which is why the symbol and wordmark visually match.

Both SVGs ship from their source files with a hardcoded `fill="#000000"`;
that's stripped in the inlined `<path>` elements in favor of
`fill="currentColor"`, so their color is driven by ordinary CSS through
the `color` property — `.brand-symbol` uses `var(--accent)` (the app's
gold, echoing the old title's accent-colored "work" suffix) and
`.brand-wordmark` uses `var(--text)`. The wrapping `.brand` div carries
`role="img" aria-label="Versetile"` for accessibility, with
`aria-hidden="true"` on both child `<svg>`s so screen readers see one
accessible name instead of two decorative children.

Below 520px width (the file's first-ever `@media` query — everything else
achieves responsiveness via `flex-wrap`) `.brand-wordmark` hides and
`.brand-symbol` grows slightly, so the symbol alone stands for the brand
instead of a ~140px-wide wordmark forcing the mode-tabs onto their own
line.

**Pass 2 — full rename, same day.** Mark asked for every remaining
"fretwork" to become "versetile": the file name (`fretwork.html` →
`versetile.html`), the IndexedDB database name, the two localStorage keys,
and the remaining prose comments. The risk with the three storage
identifiers is real — IndexedDB has no rename operation, so a straight
constant swap would make a returning user's existing saved loops and
favorites invisible (not deleted, just unreachable under the new names).
That's handled with a one-time migration instead of a bare rename:

- `LOOPER_DB_NAME` is now `"versetileLooperDB"`. `LOOPER_DB_NAME_LEGACY`
  ("fretworkLooperDB") is kept purely as a migration source.
  `looperMigrateLegacyDbIfNeeded()`, wired into `looperOpenDb()`, runs
  once: it checks a `"migratedFromFretwork"` flag in the new DB's `meta`
  store, and if unset, uses `indexedDB.databases()` to check whether the
  legacy database exists at all (avoiding the side effect of creating it
  if it doesn't), opens it read-only, copies every track, every saved
  project, and the metronome/currentProject meta records into the new DB,
  and sets the flag. Cached as a promise, not a boolean, so the several
  near-simultaneous `looperOpenDb()` callers at page load all await the
  same attempt rather than racing separate ones. The legacy database
  itself is never deleted — it's just no longer opened once migrated.
- `LS_FAV_KEY`/`LS_CUSTOM_KEY` are now `"versetile_favoriteProgressions"`/
  `"versetile_customProgressions"`. `LS_FAV_KEY_LEGACY`/
  `LS_CUSTOM_KEY_LEGACY` (the old `fretwork_*` names) are read once inside
  `loadFavoriteIds()`/`loadCustomProgressions()` — if the new key is empty
  but the old one has data, it's copied forward and the old key is left
  alone as a backup.
- Covered by `tests/test-legacy.js`'s "Fretwork -> Versetile" section: a
  dedicated isolated browser context seeds data under the old names only
  (including a genuinely pre-bar-grid track shape, to prove the rename
  migration and the older schema-derivation logic compose correctly),
  reloads, and checks the data lands in the new database/keys, that a
  second reload doesn't duplicate anything, and that the old locations are
  left untouched.

The repo folder itself (`Documents/Claude Projects/Fretwork` on Mark's
Mac) needed a separate step: the device bridge only grants write access to
a folder's contents, not to its parent, so renaming it in place wasn't
possible with just the original grant. Mark approved a follow-up grant to
the parent folder (`Documents/Claude Projects`), and the folder was
renamed to **`Versetile`** — canonical path is now
`Documents/Claude Projects/Versetile/versetile.html`.

## Tests

`tests/test-bargrid.js` and `tests/test-legacy.js` are headless Playwright
suites covering the Looper's bar grid: snapping, quantized bar-line starts,
tiling playback, cycle growth, the tempo lock, persistence, projects, all
three generations of saved data, and (as of the full rename) the
Fretwork→Versetile storage migration. 91 + 37 = 128 checks. Run them from
the repo root:

```
npm install playwright        # once
node tests/test-bargrid.js
node tests/test-legacy.js
```

Both scripts read `versetile.html` from the SAME directory they live in
(`tests/`), not from the repo root — keep a copy there in sync, or point
`FILE` at `../versetile.html` if you'd rather not duplicate it.

They serve the real `versetile.html` over `http://127.0.0.1` (mic access
needs a secure context) with Chromium's fake mic, and inject one `window.__T`
line just before the IIFE closes to reach internals — the file under test is
otherwise byte-for-byte the shipped one, and nothing is added to it. Neither
suite can validate real-device latency; that still needs an iPhone.

## Conventions

- Pitch classes are integers 0–11 (C = 0). Variables ending in `Pc` / `Pcs`
  are pitch classes, not MIDI numbers.
- Colors come from CSS custom properties in `:root` — use `var(--accent)`,
  `var(--tone)`, etc. Never hardcode a hex value.
- Diagrams are built with `svgEl(tag, attrs)`, not innerHTML strings.
- Left-handed mode works by mirroring x-coordinates through `mirrorX()`.
  Any new diagram drawing MUST route x-coordinates through the local `mx()`
  helper or lefty mode silently breaks.
- Keep the file self-contained. No CDNs, no external fonts, no fetch().

## Known constraint: localStorage

`loadFavoriteIds()` / `loadCustomProgressions()` use localStorage, wrapped in
try/catch. This works when the file is opened locally, but **localStorage is
not available inside claude.ai artifacts** — favorites and custom
progressions silently do not persist there. This is expected, not a bug.
Local file is the real environment.

## Working on this

Prefer surgical edits to one section over rewriting the file. When adding a
chord type, scale, or tuning, add it to the data object at the top — the UI
builds its dropdowns from those objects automatically.

## Downstream copies — re-sync after every change

`versetile.html` is canonical. Two snapshots derive from it and go stale
unless refreshed:

1. **Live artifact** `versetile-chord-scale-explorer` (Cowork sidebar).
   After editing, re-push it: SendUserFile on `versetile.html`, then
   `update_artifact` with the returned file_uuid. Each push is a new
   version, so earlier ones stay restorable. This replaced the original
   `fretwork-chord-scale-explorer` artifact on 2026-08-14, once the app
   was fully renamed and an artifact's `id` can't be changed after
   creation via `update_artifact` (only its content and `description`
   can). The old `fretwork-chord-scale-explorer` artifact is superseded —
   Mark can delete it from the desktop sidebar UI whenever he wants (no
   tool available here can delete an artifact).
2. **claude.ai project knowledge** — Mark re-uploads `versetile.html` to the
   project manually when he wants those chats reading current code.

If you finish an edit in this folder, offer to re-push the artifact before
wrapping up.
