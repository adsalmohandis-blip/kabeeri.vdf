# Evolution Planner Workflow

## Overview

The KVDF Planner Layer turns governed repository context into the next
approved Evolution, a Task Punch, and a Codex-ready prompt.

This workflow is deterministic and local-first. It does not replace the Owner.
It supports owner, vibe/app, and plugin planner modes.

## Workflow

```text
Owner direction
-> planner propose
-> planner approve
-> planner visual
-> planner prompt --from-current
-> Codex execution
-> validation
-> review
-> direct-to-main commit for KVDF Core
```

Track-aware variants:

```text
Owner direction -> planner (owner mode) -> propose -> approve -> visual -> prompt from current -> direct-to-main KVDF Core delivery
Owner direction -> planner (vibe mode) -> propose -> approve -> visual -> prompt from current -> local-first app delivery and optional GitHub handoff
Owner direction -> planner (plugin mode) -> propose -> approve -> visual -> prompt from current -> plugin manifest/runtime/docs parity and direct-to-main delivery
```

## Required Checks

Before execution, the planner should surface:

- allowed files
- forbidden files
- acceptance criteria
- validation commands
- stop condition

## KVDF Core Policy

For KVDF Core Owner Track work:

- direct-to-main is the default
- branch and PR are optional only for team, protected-repo, or risky work
- `.kabeeri/` runtime state is not part of the normal delivery commit
- the Planner Layer is an owner-facing planning helper, not an autonomous
  planner

For Vibe/App Track work:

- local-first is the default
- GitHub handoff is optional and never assumed
- app workspace files and app-facing docs stay separate from KVDF Core by default

For Plugin Track work:

- plugin manifest, docs, runtime, and tests should stay in parity
- plugin mount and plugin-link runtime state remain protected
- unrelated plugins stay out of scope unless the Evolution explicitly asks for them

## Task Punch

A Task Punch is the grouped set of implementation tasks generated for one
Evolution slice.

Each task in the punch should include:

- task id
- title
- status
- allowed files
- forbidden files
- acceptance criteria
- validation commands
- stop condition

## Planner State

The Planner Layer persists proposed plans in `.kabeeri/planner.json`.

Planner state is used to:

- store proposed planner outputs
- mark approved plans as the current plan
- keep rejected plans as historical records
- generate Codex prompts from approved runtime state with `kvdf planner prompt --from-current`
- generate visual planner models with `kvdf planner visual --from-current`

Planner state is runtime-only and is not part of the normal commit set.

## Prompt Output

The Codex-ready prompt must explicitly state:

- repository context
- track
- delivery mode
- allowed files
- forbidden files
- implementation tasks
- validation commands
- commit instructions
- stop condition

## Stop Rule

Stop if:

- the requested change would touch KVDOS
- the requested change would require runtime writes under `.kabeeri/`
- the requested change would make branch/PR the default KVDF Core path
- the requested change is outside the allowed planner files
- validation fails
