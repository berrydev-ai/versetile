---
description: Check for concurrent work before editing — merge, never overwrite
---

**The hazard this guards against is real and has bitten twice.** Multiple
chats edited the app from the same baseline in the same window (the bar grid
vs. pause/resume, and again around the rebrand). Both times the later session
had to merge instead of overwrite.

Git makes this a merge rather than a silent clobber, but only if you use it:

1. `git status` and `git pull` before starting. If the working tree is dirty,
   find out why before touching anything — another session may be mid-change.
2. For anything substantial, branch: `git switch -c <short-description>`.
   Don't work directly on `main`.
3. If a pull brings in changes that overlap yours, **read what changed and why**
   before resolving. Integrate your work around it rather than picking your own
   side wholesale.

If a merge is not obviously safe, stop and describe the conflict to Mark
rather than guessing which version he wants.

**Editing `public/legacy/index.html` is a special case: don't.** It is the
original single-file app, byte-for-byte, and its value is that it is verifiably
the artifact the 128 Playwright checks passed against. Fixes belong in the
ported React module. If something genuinely must change there, say so
explicitly first — it invalidates that guarantee.

After writing: `npm run typecheck`, then `npm run build`.
