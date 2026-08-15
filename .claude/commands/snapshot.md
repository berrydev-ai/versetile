---
description: Commit a checkpoint before a risky change
---

Before any large or risky edit, make sure there's a clean point to come back to.

In the single-file era this meant copying the app into `versions/` with a dated
filename. Git replaces that:

```bash
git switch -c pre-<short-description>
```

Commit whatever is already working first, so the branch point is meaningful:

```bash
git add -A && git commit -m "Checkpoint before <description>"
```

Then confirm to Mark what was committed and on what branch before starting.

The old dated snapshots (`versions/fretwork_2026-08-14_*.html`) live in the
previous `_Versetile/` folder. They're accurate history for the pre-React app —
leave them alone, and don't recreate that pattern here.
