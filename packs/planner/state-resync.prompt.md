# KVDF State Resync Prompt

You are KVDF/Codex working in the KVDF Core repository.

No Planning Without State Resync.

Before you recommend or start the next Evolution, you must resync the current
repository reality and produce a Current-State Report.

Produce a File-first State Summary before any recommendation.

## Confirm Repository

Run:

```bash
git rev-parse --show-toplevel
git remote -v
git branch --show-current
git status --short
```

## Mode Check

- If this is KVDF Core work, confirm the current branch is `main`, avoid
  creating a branch unless the Owner explicitly asks, and use direct-to-main as
  the default delivery mode.
- If this is general app-track work, inspect current app files first and follow
  the app repository source-control provider mode.
- If source control is disabled or local-only, record that mode and skip remote
  sync safely.

## Sync Latest Main

If and only if source control is enabled and safe:

- for KVDF Core, sync or read the latest `main`
- for app-track work, follow the app repo source-control provider mode and use
  local files first
- if the repo is local-only, do not attempt remote sync
- if GitHub or another remote provider is enabled, treat it as optional
  secondary evidence only

Run:

```bash
git checkout main
git pull origin main
```

## Inspect Recent History

Run:

```bash
git log --oneline -30
git tag --sort=-creatordate
```

## Inspect Roadmap And Docs

Read:

- `docs/roadmap/`
- current app or product docs if present
- desktop docs if present
- `README.md`
- app manifests/specs if present
- current app tests if present
- app source tree

For app-track work, current app docs, requirements files, manifests, specs,
source, and tests are the primary source of truth. Git history is supporting
evidence. GitHub is an optional secondary provider/plugin only.

For KVDF Core work, current KVDF source files and docs, current branch, latest
main, git history, release tags, roadmap/docs, and manifests/specs are the
required evidence set. GitHub remains optional and secondary.

GitHub is an optional secondary provider/plugin. `.kabeeri/` runtime state is
supporting state only. Chat history is supporting context only.

## Rebuild The Evolution Ledger

Classify all visible work into:

- completed
- active
- planned
- blocked
- future-only

Treat newer repository evidence as higher priority than stale planner files or
old `.kabeeri/` runtime records.

Treat `.kabeeri/tasks.json` as supporting state, not final truth.

## Detect Stale References

Flag any source that:

- claims an old Evolution is next when newer work is already merged
- contradicts current `main`, merged history, release/tag history, or roadmap
  docs
- conflicts with current manifests/specs
- uses `.kabeeri/tasks.json` as the only source of current progress
- treats chat history as final truth

## Output

Return these sections:

- Current-State Report
- File-first State Summary
- Source-of-Truth Conflicts
- Stale Docs Detected
- Completed Evolutions
- Active Evolution
- Planned/Future Evolutions
- Recommended Next Evolution
- Evidence for recommended next Evolution
- Owner Approval Questions
- Do-not-proceed flag if ambiguous

## Local-Only Mode

If Git is disabled or the workspace is intentionally local-only:

- do not require remote sync
- use current files and local runtime evidence only
- still rebuild the ledger and detect stale docs
- keep GitHub out of the critical path

## Source Control Provider Modes

- Git mode can use local history as supporting evidence
- GitHub or remote provider mode stays secondary unless the Owner says it is
  authoritative
- source-control provider mode changes what evidence is available, but never
  changes the rule that current files outrank stale planning drafts
- KVDF Core stays direct-to-main by default when source control is enabled and
  safe

## Stop Rule

Stop and ask the Owner if the source-of-truth order is ambiguous or if the
ledger rebuild does not clearly show the next safe Evolution.
