---
description: Check the app builds, and run the legacy Looper suites if the Looper changed
---

Two separate things, because the app is mid-migration.

## The React app

```bash
npm run typecheck
```

```bash
npm run build
```

Both must pass. There is no unit-test suite in this repo yet — when the first
module is ported, `src/theory/` is the place to start, since it is pure
functions with no browser dependency.

## The legacy Looper suites

These have **not** been brought into this repo yet. They live in the previous
`_Versetile/tests/` folder and test `versetile.html` directly:

```bash
node tests/test-bargrid.js
```

```bash
node tests/test-legacy.js
```

Expect **128 checks** total (91 + 37). Anything less than all-passing is a
regression — do not ship past it.

They serve the file over `http://127.0.0.1` with Chromium's fake mic (mic
access needs a secure context) and inject one `window.__T` line before the IIFE
closes to reach internals. Both scripts read `versetile.html` from the SAME
directory they live in (`tests/`), not the repo root — so a stale copy there
means the suites silently test old code.

That injected-global mechanism is exactly what the Looper port removes: once the
engine is an importable module under `src/audio/looper/`, these become ordinary
tests against real imports. Bring them across at that point, not before. See
`docs/migration.md`.

Neither suite can validate real-device latency. That still needs an iPhone, and
an iPhone still needs the app deployed — `/deploy`.
