# Versetile Roadmap — Summary

Renamed from **Fretwork** to **Versetile** on 2026-08-14, in three passes the same day (see "Brand: Fretwork → Versetile" below, and `versetile-logo.md` for the full design history). This doc keeps its original filename/path for continuity with existing links; the app itself — title, favicon, header, file name, database, storage keys, and now the repo folder too — fully says Versetile.

Full working document: "Fretwork Product Roadmap" (working doc in Mark's Documents panel; created 2026-08-13, expanded 2026-08-14).
Companion: "Fretwork Looper — Build Spec" (working doc, created 2026-08-14).

## Vision
Versetile (formerly Fretwork) starts as a guitar-focused chord/progression/scale tool and expands into an all-in-one songwriter's workstation, built one feature at a time with a small group of testers trying each new piece as it ships. Mark's primary motivation: he wants to use this himself.

## Confirmed context (as of 2026-08-14)
- Mark has no coding background — Claude does the hands-on coding; Mark drives product/ideas and assembles it.
- Current Versetile is a single HTML file (plain web app) — nothing native yet.
- Beta testers will access via a browser link for now.
- Pace: semi-serious side project alongside college, not full-time.
- Canonical source: `Documents/Claude Projects/Versetile/versetile.html` on Mark's Mac (reached via the desktop-app device bridge). Everything is fully renamed — file, database (`versetileLooperDB`), storage keys (`versetile_favoriteProgressions`/`versetile_customProgressions`), and as of the third rename pass, the repo folder itself (`Fretwork` → `Versetile`) — see "Brand" below for how that last one needed a separate permission grant. `CLAUDE.md` in that folder documents file structure/conventions and the re-sync steps for the two downstream copies (Cowork sidebar artifact `versetile-chord-scale-explorer`, and claude.ai project knowledge — the latter re-uploaded manually by Mark).
- **Concurrent-session hazard, seen for real on 2026-08-14 (twice)**: multiple chats edited the app file from the same baseline within the same session window (bar grid + pause/resume, and again around the rebrand). Each time, the later one to finish had to re-stage and diff against its own starting baseline before writing, and merge rather than overwrite. Keep doing this before every write.

## Brand: Fretwork → Versetile (2026-08-14)
Mark supplied finished logo assets (a hand-drawn/marker-style "Versetile" wordmark and a standalone repeat-sign symbol mark — full design history in `versetile-logo.md`) and asked for the app to be renamed and the assets worked into the UI. This happened in three passes.

**Pass 1 — header + branding only** (scope confirmed with Mark): chord diagrams, the Looper wheel, buttons, and tabs kept their existing look.
- `<title>` changed to "Versetile — Chord & Scale Explorer".
- Browser tab favicon: the standalone symbol, inlined as a base64 `data:image/svg+xml` URI.
- Header brand lockup: both SVGs inlined directly into the HTML (no linked assets — the file has to stay single-file), using `fill="currentColor"` so they pick up the app's existing CSS colors (`--accent` gold for the symbol, `--text` for the wordmark) instead of their traced-black source fill.
- Below 520px width — the app's first-ever `@media` query — the wordmark hides and the symbol alone stands for the brand, so it doesn't force the mode tabs onto their own wrapped line on a phone.
- `role="img" aria-label="Versetile"` / `aria-hidden` on the SVGs for accessibility.
- Verified: syntax-checked the script, re-ran both existing headless test suites (118 tests, all still passing — the rebrand only touched the header/CSS/title, nothing the Looper tests exercise), and screenshotted the header at both a wide and a narrow (390px) viewport to confirm the responsive swap.

**Pass 2 — full content rename** (same day, follow-up ask: "go through all of the files and everything and change every part that says fretwork to now say versetile"). This one touched things a straight find-and-replace would have broken:
- File renamed `fretwork.html` → `versetile.html`.
- IndexedDB database renamed `fretworkLooperDB` → `versetileLooperDB`, and the two localStorage keys renamed to `versetile_favoriteProgressions`/`versetile_customProgressions`. IndexedDB has no rename operation, so a bare constant swap would have made Mark's existing saved loops and favorites invisible (not deleted, just unreachable under the new names). Built a one-time migration instead: on first load under the new names, the app checks for the old database/keys, copies everything over (tracks, saved projects, metronome settings, favorites, custom progressions), and leaves the old data in place untouched as a backup rather than deleting it. Confirmed with Mark up front that this (migrate, not just rename) was the approach he wanted, over the alternative of accepting the data loss or leaving the identifiers alone.
- Added a dedicated test section (`tests/test-legacy.js`, "Fretwork -> Versetile") that seeds data under the old names in an isolated browser context, reloads, and verifies it lands correctly in the new database/keys, that reloading again doesn't duplicate anything, and that the old locations are left alone. 128 tests total now pass (91 + 37, up from 118 — 10 new checks for this migration).
- Downstream copies re-synced: pushed `versetile.html` and the updated `CLAUDE.md` to Mark's Mac; moved the stale `fretwork.html` into a `_to_delete/` folder there (Claude's device access can move files but not delete them — Mark can delete that folder whenever). Created a fresh Cowork artifact `versetile-chord-scale-explorer` with the renamed content, since an artifact's `id` can't be changed after creation — the old `fretwork-chord-scale-explorer` artifact is superseded and safe for Mark to delete from the desktop sidebar (no tool available here can delete an artifact for him). claude.ai project knowledge still needs Mark's manual re-upload of `versetile.html` when he wants those chats reading current code.

**Pass 3 — the repo folder itself.** `Documents/Claude Projects/Fretwork` was still called `Fretwork` after pass 2 — the device bridge only grants read/write access to a folder's *contents*, not to its parent directory, and renaming a folder requires write access to the parent (to change the directory entry). Mark chose to grant Claude access to the parent folder (`Documents/Claude Projects`) rather than rename it himself; once granted, Claude renamed it directly. Canonical path is now `Documents/Claude Projects/Versetile/versetile.html`. The original `Fretwork`-scoped grant is still listed as connected alongside the new parent grant, but that specific old path no longer exists on disk — harmless, just a stale label.

Not done / open: no color exploration beyond the traced near-black source art (it rides on existing CSS variables instead); no padded app-icon frame for the symbol (only the bare mark, used as a favicon and header mark); whether the hand-drawn style should ever spread beyond the header into chord diagrams / the Looper wheel is an open question for Mark, not decided either way.

## Key architectural decision
Every module should read/write a shared **Song Project** object (title, key, progression, lyric sections, audio/loop references, tab/notation reference) rather than being separate silos. (Not yet wired up — the Looper still stores its own state independently.)

## Full feature backlog (Mark's stated order)
1. **Now — Looper**: multi-layer overdub recorder. Design decided 2026-08-14 — see below. **In progress**, see "Looper build order" for status.
2. **Next — Rhyme-assisting lyric notes**: notepad with rhyme suggestions (Rhymer's Block-style); hub tying chords/loops/lyrics together. Candidate data source: Datamuse API or bundled CMUdict for offline.
3. Deeper chord-progression builder (more chord types, voicings, key/mode awareness).
4. New instrument modules — piano first, then others.
5. Sheet music / DAW export — split visual notation (alphaTab/VexFlow) vs. DAW-importable data (MIDI preferred over MusicXML for a first pass).
6. Audio "listen and figure it out" (automatic transcription) — hardest item; recommended to integrate an existing engine rather than build from scratch, tackle last.
7. Later — unification pass across modules.

## Looper design decisions (2026-08-14)
- **Timing model**: ~~free-form capture in v1 (first take sets loop length), with tempo derived afterward by asking "how many bars was that?"~~ — **superseded the same day by the bar grid (step 3b)**. You now set BPM, time signature and bar count up front; layer 1 records exactly that many bars, and everything after is quantized to bar lines. Mark's call when asked, over keeping free-form as an alternate mode.
- **Track model**: separate tracks, each with mute / volume / delete / per-track timing nudge. Not a single stacked buffer. Since 3b, tracks also carry their own bar length and need not span the whole cycle.
- **Scope**: a first draft that can later be professionally produced in a DAW — stems, not a finished mix.
- **Defining UX rule**: the app opens armed. No project picker or menu; the screen loads with the mic live and one big record button. Two features follow — a rolling 30-second retro-capture buffer (drag the start point backwards into what you already played), and a non-destructive takes bin.
- **Known iOS landmines** (must be handled from day one): disable echoCancellation / autoGainControl / noiseSuppression on the mic stream; expect the audio session to change when the mic opens (no live headphone monitoring in v1); build one-time latency calibration plus per-track nudge; request a screen wake lock while recording; start the audio engine inside a user tap; store audio in IndexedDB.
- **Deferred on purpose**: track-count limits, live monitoring, mid-song tempo changes, effects, time-stretching.

## Looper build order
1. ✅ **Done (2026-08-14)** — Prove the audio path: one track, record/stop/play/loop. Built as the Looper tab in the app. Mic constraints (AGC/NS/EC off), wake lock, audio engine started inside the tap, and IndexedDB persistence are all in. Tested headlessly (Playwright + fake mic); not yet tested on a real iPhone.
2. ✅ **Done (2026-08-14)** — Multi-track overdub: one big button walks record → loop → overdub → loop (like a hardware loop pedal); each layer after the first is fit (truncated/silence-padded, phase-rotated for mid-loop overdub starts) so playback stays in lockstep; per-track mute, volume slider, and delete; all layers persist to IndexedDB and restore on reload. Also shipped in this pass, beyond the original scope: **named saved projects** (Save / Save As / Projects list / New, each project remembering its own tempo/time-signature/count-in/bar-count settings) and **quantized overdub start** (waiting for the loop to wrap back to phase 0 — narrowed to the next bar line in 3b). **Still not built**: the non-destructive takes bin (re-recording/deleting a layer is still destructive — no take history per track yet).
2b. ✅ **Done (2026-08-14)** — GarageBand-style Looper UI rewrite. Large loop wheel (ring = one loop cycle, playhead sweeping clockwise, whole disc is the record/overdub/stop button, distinct armed/first-take/playing/overdubbing states), per-track lanes with real canvas waveforms, single synced playhead, live waveform drawing while recording. All animation driven from `AudioContext.currentTime` via rAF, never a timer.
3. ✅ **Done (2026-08-14)** — Tempo: metronome (toggle, BPM slider, tap-tempo, time-signature dropdown covering simple and compound meters), a 1-or-2-bar count-in before every record/overdub start, and an optional max-length (bars) auto-stop for layer 1. The click was independent of the loop boundary at this point by design; **that changed in 3b**, where the loop became an actual grid to lock to. Haptics not built (no clear use case yet on web).
3b. ✅ **Done (2026-08-14)** — **Bar grid.** Mark's request: "I want the circle split up into how many measures I say the recording should be," recording that doesn't start until it reaches the next measure, and overdubs where some are one measure repeating under an eight-measure one. Delivered:
   - The wheel divides into one segment per bar, live from a **Bars** slider (1–24), before anything is recorded. Center label reads "BAR 3/8"; lanes show a short layer tiled across the cycle with a per-repeat divider and a "1 bar ×8" label.
   - Bars **replaced** the optional "Max Len" cap — always on now, since a quantized looper has to know its own length up front. Layer 1 auto-stops at exactly that many bars.
   - Overdubs wait silently for the next **bar line** (was: the next full loop wrap, i.e. up to a whole cycle of dead air). **Strictly** the next bar — a slightly-late tap waits out the rest of that bar rather than snapping backwards. Mark's choice over a ~1/8-note grace window.
   - **Per-layer lengths.** A take is measured and snapped to a bar count that *tiles* the cycle: shorter → a whole divisor (1/2/4/8 against 8 bars), longer → a whole multiple, which **grows** the cycle. Mark's choice over keeping odd lengths and chopping the leftovers. Because every layer's bar count divides the cycle, each is a plain looping buffer of its own length — a 1-bar part comes round 8 times while an 8-bar part comes round once, with no per-repeat scheduling and nothing to re-sync.
   - Tempo / signature / bars **lock** while a loop has layers or a take is in flight; deleting every layer (or New) unlocks them. The metronome now locks to the loop's grid too — beat 1 is bar 1.
   - Deleting the longest layer deliberately does **not** shrink the cycle (a shorter cycle could strand a surviving layer whose bar count no longer divides it), and that width is persisted so a reload can't silently undo it.
   - 118 headless tests across `tests/test-bargrid.js` and `tests/test-legacy.js` (new files in the repo), covering all three generations of saved data. An adversarial review pass found 7 defects that were fixed before shipping — the worst being that genuinely free-form pre-grid loops would have drifted about a second per cycle on the first overdub.
   - **Merge note**: a parallel session added the pause/play button to the app from the same baseline while this was being built. It was merged in rather than overwritten; its resume path was adapted to wrap the paused position into each layer's own buffer, and it now re-anchors the click on resume. The pre-merge state is kept at `versions/fretwork_2026-08-14_pre-bar-grid-with-pause.html`.
   - Still not tested on a real iPhone.
3c. ✅ **Done (2026-08-14)** — Rebrand to Versetile, pass 1 (header + branding only). Pre-pass-1 snapshot kept at `versions/fretwork_2026-08-14_pre-versetile-rebrand.html`.
3d. ✅ **Done (2026-08-14)** — Rebrand to Versetile, pass 2 (full content rename — file, database, storage keys, comments, with a safe data migration). Pre-pass-2 snapshot kept at `versions/fretwork_2026-08-14_pre-full-rename.html`.
3e. ✅ **Done (2026-08-14)** — Rebrand to Versetile, pass 3 (the repo folder itself, `Fretwork` → `Versetile`, after Mark granted parent-folder access). See "Brand: Fretwork → Versetile" above for the full account of all three passes.
4. Export — stems + rough mixdown, tempo/key in filenames, zipped to the iOS share sheet. Not started.
5. Song Project hookup. Not started.
6. Section labels (verse/chorus/bridge). Not started — though the bar grid now gives these something concrete to attach to (bar ranges), which it didn't before.
7. 🟡 **In progress (2026-08-14)** — Latency calibration + per-track nudge. **Step 0 done and verified**: the recording pipeline was refactored from `MediaRecorder` to raw `Float32Array` capture via `AudioWorkletNode` (`ScriptProcessorNode` fallback), which puts recording and playback in the same `AudioContext.currentTime` clock domain — the precondition the calibration measurement needs. As a side effect, fixed a pre-existing bug where an overdub's phase correction was silently lost on reload. **Steps 1–4 (the loopback calibration routine, per-output-device storage, automatic rotate-based correction on overdubs only, and the manual ±250ms nudge sliders) are designed and ready to build, pending Mark's go-ahead** — this genuinely needs a real iPhone (headless/fake-mic testing can't validate hardware latency). Note 3b makes this *more* worth doing: a quantized start now lands within ~one animation frame of the bar line, so what's left is mostly device latency.

## UI notes
- Mark asked for the Looper UI to stay very simple/approachable ("for people," not just himself) — hence the single-button record/overdub cycle rather than separate record/overdub/play controls. The bar grid kept that: the only control it added is one slider.
- Phone-friendly responsive layout was explicitly deferred (2026-08-14) for the app as a whole — **but the Looper rewrite (2b) is phone-first**, so the Looper led and the rest of the app stays desktop-oriented until its own pass. The rebrand (3c) added the app's second `@media` breakpoint, scoped only to the header.

## Build workflow decided
Non-coder-friendly pipeline: GitHub for code/version history → connected to a host for auto-publish on every save → testers use the resulting browser link. (Settled 2026-08-15: the host is Cloudflare Workers, not Netlify or Vercel — see "Hosting" above. The auto-publish half is still to be connected.) Native iOS/Android via Capacitor-style wrapping once web version is validated. Mark has a Mac, which covers the Xcode requirement for eventual iOS builds via TestFlight. Note: if browser audio quality proves to be a hard ceiling, Capacitor native-audio/audio-recorder plugins are the escape hatch.

**Testing constraint**: mic access requires a secure context (https:// or localhost) — opening `versetile.html` directly as a local file won't prompt for the microphone. Real device testing needs it hosted (now Cloudflare — see "Hosting" above) or served from localhost. Note this rules out the LAN address `npm run dev` prints: `http://192.168.x.x` is neither https nor localhost, so the Looper loads there but cannot record.

## Hosting: live on Cloudflare (2026-08-15)
The hosting bottleneck below is **cleared** — the React app is deployed and reachable over https, so the real-iPhone Looper work that was waiting on a secure context can start.

- **Host**: Cloudflare Workers static assets, not Netlify and not Pages. Workers is where Cloudflare is putting new work (Pages is in maintenance for new features), and an assets-only Worker can grow an API route later — relevant if the Song Project ever syncs across devices — without a migration. `netlify.toml` was deliberately **kept and left working**: the same SPA/legacy/header rules now exist for both hosts, so there is a fallback if Cloudflare misbehaves.
- **Config**: `wrangler.jsonc` (assets-only — no `main`, so no server code and no Worker invocation on a normal page load) plus `public/_headers`. Vite copies `public/` into `dist/` verbatim, which is how `_headers` reaches the asset directory Cloudflare parses it from.
- **The `/legacy` question, settled by measurement**: the worry was that the SPA fallback would swallow the legacy app. It does not. Cloudflare matches real assets *before* falling back, and `dist/legacy/index.html` is a real file. Verified on the deployed URL: `/legacy` → 307 → `/legacy/` → the 250 KB legacy app, while `/looper` and any unknown path → the React `index.html`. No redirect rule was needed, so there is no Cloudflare equivalent of netlify.toml's `/legacy` rule.
- **Build was broken and had never succeeded.** `tsconfig.node.json` was a `composite` referenced project with `noEmit: true`, which TypeScript rejects (TS6310), so `npm run build` failed at the `tsc` step — meaning the Netlify build in the plan below would have failed too. Fixed by giving that project `emitDeclarationOnly` and a temp `outDir` under `node_modules/.tmp/`.
- **Open**: `versetile.app` is registered on Cloudflare but still carries an old proxied DNS record pointing at a dead origin (it answers 522). Cloudflare refuses to attach a custom domain over externally-managed records, so that record has to be deleted in the dashboard first. Until then the app lives at its `workers.dev` URL.
- **Open**: push-to-deploy. `npm run deploy` works from a checkout today; connecting the GitHub repo to Workers Builds needs a one-time browser authorization, and is what restores the "Mark pushes, testers get it" pipeline below.

## Release & distribution plan
- Now: web app, **Cloudflare Workers** hosting (Netlify config retained as a fallback), browser link for testers.
- Later iOS: TestFlight via Apple Developer Program ($99/yr).
- Later Android: Google Play Console ($25 one-time; note the 12-testers/14-days closed-test requirement before going fully public).
- Public launch reuses the same beta pipeline — no separate infra needed.

## Immediate next steps (as of 2026-08-14)
1. ~~Mark to share the current Fretwork HTML file~~ — done; Claude reaches it via the connected `Documents` folder on Mark's Mac.
2. ~~Set up free GitHub + Netlify accounts~~ — **done, and the bottleneck is cleared** (2026-08-15). The repo is on GitHub and the app is deployed to Cloudflare Workers over https, so the Looper can now be opened on a real iPhone with a working microphone. See "Hosting" above; two follow-ups remain there (the `versetile.app` DNS record, and connecting push-to-deploy).
3. ~~Build looper phase 1~~ — done. Multi-track overdub, saved projects, tempo/count-in, the UI rewrite, and the bar grid are all done.
4. ~~Run the Looper UI rewrite (2b)~~ — done.
5. ~~Publish once there's something to show~~ — published to Cloudflare; no longer blocked. Sending testers the link is worth holding until `versetile.app` resolves, so the link they bookmark is the permanent one rather than a `workers.dev` URL that later moves.
6. **Latency calibration + per-track nudge** — Steps 1–4 designed and ready, waiting on Mark to say go; needs a real-iPhone pass once built. The takes bin is still separately deferred.
7. Phone-friendly responsive layout pass for the rest of the app — still deferred; the Looper got its phone layout as part of 2b.
8. **Play the bar grid on a real instrument.** The one thing headless tests can't judge is whether strictly-next-bar quantization feels right to play against, and whether auto-rounding an overdub's length ever picks the number you didn't want. Both are single-constant changes if they're wrong.
9. ~~Rename Fretwork to Versetile~~ — done, all three passes (3c, 3d, 3e above). Nothing left outstanding from the rename.
