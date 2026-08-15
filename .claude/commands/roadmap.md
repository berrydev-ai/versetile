---
description: Update the roadmap after a build step lands or a decision is made
---

Update `docs/roadmap.md` so the next session can pick up cleanly.

What to write:

- Mark the build step ✅ **Done (date)** with what actually shipped —
  including anything delivered beyond the original scope.
- Record decisions **and what they were chosen over.** "Strictly the next
  bar — Mark's choice over a ~1/8-note grace window" is useful; "quantized
  to the bar" is not.
- Note what is explicitly *not* built yet, so it doesn't read as complete.
- Update the "Immediate next steps" list at the bottom — strike through what
  is done, and be honest about what is blocked and on what.
- Keep the file's existing voice: prose over bullets-of-bullets, specific,
  no hedging.

Route to the right doc:

- Brand or design work → `docs/brand.md`.
- A structural decision about how the code is organised → `docs/architecture.md`.
- A module moving from the legacy app into React → `docs/migration.md`, and
  flip that module's `status` in `src/modules/registry.ts` in the same pass.
  A registry that lies about what is ported is worse than no registry.

The roadmap was renamed from `fretwork-roadmap.md` during the migration into
this repo. Links from older chats to the old path will not resolve.
