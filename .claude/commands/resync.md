---
description: Get the current code in front of Mark and his testers
---

**This command used to mean "re-push the app file to the copies that go
stale."** That was the single-file era: a Cowork sidebar artifact and claude.ai
project knowledge both derived from `versetile.html` and silently went stale
after every edit.

Once this repo is deployed, that whole problem is gone — the deployed URL *is*
the current app, for Mark and for testers, with no push step.

## The path now

```bash
git push
```

Netlify rebuilds on every push to `main` and republishes. `netlify.toml` already
carries the build settings, so nothing needs configuring by hand.

Then send Mark the URL. Two things worth saying with it:

- Which modules are actually live in the React app, and which still open the
  classic app at `/legacy/`. Check `src/modules/registry.ts` rather than
  guessing — it is the source of truth.
- If the Looper changed: it needs a real iPhone, over https. That is the one
  thing headless tests can't judge.

## Still stale, if they exist

- The **Cowork sidebar artifact** `versetile-chord-scale-explorer` and
  **claude.ai project knowledge** both still hold pre-migration copies of
  `versetile.html`. Neither updates itself. Prefer sending the deployed link
  over refreshing them; if Mark wants them current, he re-uploads the project
  knowledge himself.
- Note for the artifact copy specifically: localStorage is unavailable inside
  claude.ai artifacts, so favorites and custom progressions never persisted
  there. Expected, not a bug.
