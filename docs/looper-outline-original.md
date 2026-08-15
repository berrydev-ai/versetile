Looper design decisions (2026-08-14)
- **Timing model**: free-form capture in v1 (first take sets loop length), with tempo derived afterward by asking "how many bars was that?" rather than running beat detection. Click/count-in unlock once BPM is known.
- **Track model**: separate tracks, each with mute / volume / delete / per-track timing nudge. Not a single stacked buffer.
- **Scope**: a first draft that can later be professionally produced in a DAW — stems, not a finished mix.
- **Defining UX rule**: the app opens armed. No project picker or menu; the screen loads with the mic live and one big record button. Two features follow — a rolling 30-second retro-capture buffer (drag the start point backwards into what you already played), and a non-destructive takes bin.
- **Known iOS landmines** (must be handled from day one): disable echoCancellation / autoGainControl / noiseSuppression on the mic stream; expect the audio session to change when the mic opens (no live headphone monitoring in v1); build one-time latency calibration plus per-track nudge; request a screen wake lock while recording; start the audio engine inside a user tap; store audio in IndexedDB.
- **Deferred on purpose**: track-count and loop-length limits, live monitoring, mid-song tempo changes, effects, time-stretching.

## Looper build order
1. Prove the audio path — one track, record/stop/play/loop, tested on a real iPhone.
2. Multi-track overdub + latency calibration + takes bin.
3. Tempo — bars question, BPM, click, count-in with haptics.
4. Export — stems + rough mixdown, tempo/key in filenames, zipped to the iOS share sheet.
5. Song Project hookup.
6. Section labels (verse/chorus/bridge).