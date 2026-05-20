# Evolution Planner Workflow

## Overview

The KVDF Planner Layer turns governed repository context into the next
approved Evolution, a Task Punch, a materialized runtime record, and a
Codex-ready prompt.

This workflow is deterministic and local-first. It does not replace the Owner.
It supports owner, vibe/app, and plugin planner modes.

No Planning Without State Resync:

- the planner must complete a State Resync before recommending the next
  Evolution
- the planner must output a Current-State Report first
- the planner must not trust `.kabeeri/tasks.json` as the only source of
  current progress
- the planner must identify stale files before naming the next Evolution
- the planner must include evidence for the recommended next Evolution
- the planner must not use chat history as the final source of truth
- GitHub must not be required for planning
- app files, docs, specs, source, and tests outrank remote-provider state

The Idea to Evolution Pipeline is the upstream planning surface that turns a
raw idea into the file map, design artifacts, version slices, evolutions, task
punches, visual roadmap, and source control plan that the approval gate can
review.

Planner dashboard sync sits alongside the approval gate so dashboard state can
show the current approved plan, visual summary, source control state,
materialization status, and next action without becoming the source of truth.

## State Resync Gate

Before any next-Evolution recommendation, the planner must:

- resync the current repository state
- compare the current branch with `main`
- inspect merged history, release tags, and roadmap/docs
- rebuild the Evolution ledger with completed, active, planned, blocked, and
  future-only states
- flag stale docs when they claim an old Evolution is next
- stop and ask the Owner when the source-of-truth order is ambiguous
- treat `.kabeeri/tasks.json` as supporting state, not final truth
- treat chat history as supporting context only
- treat GitHub as optional secondary evidence only

The planner can only recommend the next Evolution after the Current-State
Report shows that the repo reality matches the proposed ledger.

## Self-Planning Engine

The planner should use the self-planning sequence before it recommends the next
Evolution:

1. `kvdf planner method`
2. `kvdf planner auto`
3. `kvdf planner review`
4. `kvdf planner docs catalog|plan|materialize|status|apply-stage|review`
5. `kvdf planner resume`
6. `kvdf planner propose`
7. `kvdf planner approve`
8. `kvdf planner current`
9. `kvdf planner materialize`
10. `kvdf planner prompt --from-current`
11. `kvdf planner visual --from-current`

The planner remains the planning authority, but it does not execute code
changes automatically. Owner approval still gates execution, and draft docs
remain draft-only until the Owner approves the path forward. The planner must
surface docs plan, docs status, and missing docs before it recommends the next
Evolution.

When available, planner output should also surface the shared Roadmap Train so
the next session can resume FIFO state instead of rebuilding the queue from
chat or generated snapshots.

## Workflow

```text
Idea
-> planner pipeline
-> pipeline review
-> approve / materialize first Evolution
-> planner current
-> planner prompt --from-current
-> planner visual --from-current
-> dashboard/live-state sync
-> Codex execution
-> validation
-> planner complete

Then, for lower-level gated planning:

Owner direction
-> planner propose
-> planner approve
-> planner current
-> planner source_control selection
-> planner materialize
-> planner prompt --from-current
-> planner visual
-> Codex execution
-> validation
-> planner complete
-> direct-to-main commit for KVDF Core
```

Track-aware variants:

```text
Owner direction -> planner (owner mode) -> propose -> approve -> current -> materialize -> prompt from current -> visual -> dashboard/live-state sync -> Codex -> validation -> complete -> direct-to-main KVDF Core delivery
Owner direction -> planner (vibe mode) -> propose -> approve -> current -> materialize -> prompt from current -> visual -> dashboard/live-state sync -> Codex -> validation -> complete -> local-first app delivery and optional GitHub handoff
Owner direction -> planner (plugin mode) -> propose -> approve -> current -> materialize -> prompt from current -> visual -> dashboard/live-state sync -> Codex -> validation -> complete -> plugin manifest/runtime/docs parity and direct-to-main delivery
```

## Required Checks

Before execution, the planner should surface:

- allowed files
- forbidden files
- acceptance criteria
- validation commands
- stop condition

The planner should also surface:

- planning method
- method reason
- docs status
- review warnings
- source-control mode
- security gate state when available
- visual planning summary
- next approved action

## Source Control Selection

The planner carries an explicit `source_control` object in its proposal,
current-plan, prompt, visual, and materialization outputs. That object makes
source control a provider-driven choice instead of an assumed GitHub branch/PR
workflow.

Accepted modes include:

- no source control
- local-only
- Git direct-to-main
- Git branch
- Git branch + PR

GitHub is treated as an optional remote/provider plugin, not as the same thing
as Git.

The Idea to Evolution Pipeline also carries the same source control object so
version slices, evolutions, and task punches can stay aligned with the selected
delivery mode.

## KVDF Core Policy

For KVDF Core Owner Track work:

- direct-to-main is the default
- branch and PR are optional only for team, protected-repo, or risky work
- `.kabeeri/` runtime state is not part of the normal delivery commit
- the Planner Layer is an owner-facing planning helper, not an autonomous
  planner
- current KVDF source files and docs outrank older planning drafts
- current branch and latest main outrank stale local runtime state

For Vibe/App Track work:

- local-first is the default
- current app files, docs, specs, source, and tests are the primary source of truth
- GitHub handoff is optional and never assumed
- app workspace files and app-facing docs stay separate from KVDF Core by default
- remote-provider history is secondary evidence only unless the Owner says otherwise

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
- mark approved work as completed and clear the current plan when a slice is closed out
- generate Codex prompts from approved runtime state with `kvdf planner prompt --from-current`
- materialize approved plans into Evolution and Task Punch runtime records with `kvdf planner materialize --from-current`
- generate visual planner models with `kvdf planner visual --from-current`
- surface planner, pipeline, visual, materialization, and source-control state
  in dashboard live JSON and exported dashboard HTML

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
- the planner state is still stale or ambiguous
- validation fails
