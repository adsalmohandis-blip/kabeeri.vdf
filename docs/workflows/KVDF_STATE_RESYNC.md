# KVDF State Resync

## Purpose

KVDF State Resync rebuilds the current repository truth before any next
Evolution is planned. It exists to prevent stale planning drafts, outdated
`.kabeeri/` runtime state, or old chat context from being treated as the latest
project state.

State Resync is file-first, not GitHub-first.

## When To Run

Run State Resync before:

- recommending the next Evolution
- starting a planning session from a stale report
- comparing roadmap claims against repository reality
- deciding whether a planned Evolution is already complete
- resolving conflicts between local runtime state and git history

## Required Commands

Use the current repo root and confirm the active branch before reading any
planning state:

```bash
git rev-parse --show-toplevel
git remote -v
git branch --show-current
git status --short
git checkout main
git pull origin main
git log --oneline -30
git tag --sort=-creatordate
```

If source control is disabled or local-only, record that mode and skip remote
sync safely.

If GitHub merged PR history is available, inspect it as an additional input for
ledger rebuild, but do not let it override the current repository reality.

Git vs GitHub vs provider:

- Git is local historical evidence.
- GitHub is an optional secondary provider/plugin when enabled.
- Remote provider history is only authoritative when the Owner explicitly
  chooses it over current files.

## Source-Of-Truth Priority

For application repositories / Vibe track:

1. Current app docs and requirements files
2. Current app manifests/specs/configs
3. Current app source structure
4. Current app tests
5. Local Git history if available
6. Release/tag history if available
7. Remote provider history such as GitHub only if enabled
8. `.kabeeri/` runtime state as supporting state only
9. Chat history as supporting context only

For KVDF Core repository work:

1. Current KVDF source files and docs
2. Current branch and latest main
3. Git commit history
4. Release/tag history if available
5. Current roadmap/docs
6. Current manifests/specs/configs
7. `.kabeeri/` runtime state as supporting state only
8. GitHub only if enabled as remote/provider plugin
9. Chat history as supporting context only

`.kabeeri/tasks.json` must never be treated as the only source of current
progress when git history, tags, releases, or roadmap docs show a later state.

## How To Rebuild The Current Evolution Ledger

1. Identify the confirmed repository root and active branch.
2. Pull the latest `main`.
3. Read commit history, merge history, release notes, and tags.
4. Read current roadmap and product docs.
5. Read app manifests and specs if the repo has them.
6. Read `.kabeeri/` runtime state only as supporting evidence.
7. Rebuild the Evolution map into:
   - completed
   - active
   - planned
   - blocked
   - future-only
8. Compare the rebuilt ledger with any stale planner file or old report.

If source control is enabled and safe, read or sync the latest `main` first.

## How To Detect Stale Roadmap Docs

Flag a roadmap or planner doc as stale when it:

- names an Evolution that has already been completed and merged
- suggests restarting a slice that the commit history already closed
- contradicts release tags or published version history
- repeats a task pack that the current repo state has already superseded
- conflicts with the current main branch or merged PR record

## Current-State Report

After the ledger rebuild, output a Current-State Report that includes:

- repo
- remote
- branch
- latest main commit
- latest release/tag
- completed Evolutions
- active Evolution, if any
- planned next Evolution
- stale docs detected
- conflicting state sources
- owner decisions needed
- recommended action
- do-not-proceed flag if ambiguous

## How To Decide The Next Evolution Safely

- recommend only Evolutions that match the rebuilt ledger
- name the evidence for the recommendation
- avoid restarting completed work
- prefer current main and merged history over old drafts
- treat `.kabeeri/` state as a clue, not the final authority
- if GitHub or remote provider history conflicts with current files, prefer the
  current files unless the Owner explicitly chooses remote history as
  authoritative
- stop if the sources do not agree on the next step

## How To Handle Conflicting Sources

When sources disagree:

- report the conflict explicitly
- identify which source is older or weaker
- explain why the conflict matters
- do not guess a resolution
- stop and ask the Owner for the deciding direction

## Stop Rule

Stop and ask the Owner when:

- the repo root is unclear
- the current branch or latest `main` cannot be confirmed
- merged history or tags are missing and the next Evolution is ambiguous
- roadmap docs and runtime state disagree
- the planner would otherwise restart completed work
- the source-control mode is disabled and a remote sync would be unsafe

## Local-Only Mode

When Git is disabled or the workspace is intentionally local-only:

- do not require remote sync
- use current files, docs, specs, tests, and local runtime evidence as the safe
  evidence set
- keep GitHub optional and off the critical path

## Source Control Provider Modes

Different provider modes affect resync:

- local-only mode uses current files and local runtime evidence only
- Git mode can add local history as supporting evidence
- GitHub or another remote provider remains optional secondary evidence only
- KVDF Core defaults to direct-to-main when source control is enabled and safe
