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
- the planner must expose `kvdf planner guard --json` as the explicit drift gate
- the planner must output a Current-State Report first
- the planner must confirm the workspace boundary before any write-capable
  action
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
- treat `kvdf planner current-state --json` as the file-first rebuild of the
  live repo/workspace summary
- treat `kvdf planner boundary --json` as the write-boundary check for the
  selected track
- treat KVDOS and other app workspaces as app/product boundaries, not KVDF
  Core
- treat stale roadmap/report snapshots as lower priority than the live repo
  source tree and merged history

The planner can only recommend the next Evolution after the Current-State
Report shows that the repo reality matches the proposed ledger.

For Viber/App Track, the planner also emits a Viber Planning-to-Task
Execution Pipeline. That pipeline stays file-first and local-first by default
and must stay blocked until the current-state evidence, documentation map,
docs/design gates, visual planning, version plan, evolutions, task punches, and
approval/materialization gates are complete. The planner prompt must switch to
the next planning stage only whenever `execution_allowed` is false, and it
must surface `docs_design_gates` when docs or design readiness is the blocker.
It must also surface `version_evolution_gates` so version-plan approval,
evolution approval, order validation, task punch generation, and task punch
review stay ordered before materialization.
Before `kvdf questionnaire generate-tasks --app <app-name>` can create app
task punches, KVDF must also pass `kvdf evolution validate-order --app
<app-name>`, which enforces category-based Viber evolution ordering and blocks
draft, misordered, or future-only slices from becoming executable work. The
planner pipeline must also surface the Viber stage-order contract so Codex only
executes after the questionnaire, brief, state resync, docs/design, version,
evolution, approval, materialization, and safety gates are ready.

## Self-Planning Engine

The planner should use the self-planning sequence before it recommends the next
Evolution:

1. `kvdf planner method`
2. `kvdf planner auto`
3. `kvdf planner review`
4. `kvdf state resync --track owner --json`
5. `kvdf planner guard --json`
6. `kvdf planner current-state`
7. `kvdf planner boundary`
8. `kvdf planner docs catalog|plan|materialize|status|apply-stage|review`
9. `kvdf planner resume`
10. `kvdf planner propose`
11. `kvdf planner approve`
12. `kvdf planner current`
13. `kvdf planner materialize`
14. `kvdf planner prompt --from-current`
15. `kvdf planner visual --from-current`

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
- current-state summary
- write boundary summary
- docs status
- review warnings
- source-control mode
- security gate state when available
- execution gate state when available
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
as Git. The canonical GitHub provider plugin is `github_provider`; legacy
`github` and `github_sync` bundles are compatibility wrappers only.

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

For Viber/App Track, the planner pipeline also exposes a stage-transition
report so prompt generation can stop at the current blocked stage instead of
jumping forward to task execution. The transition view is how the Planner Layer
keeps the idea -> questionnaire -> brief -> docs/design -> version/evolution ->
task punch -> execution chain honest.

## Prompt Output

The Codex-ready prompt must explicitly state:

- repository context
- track
- delivery mode
- current stage / next stage transition
- blocked-by evidence when the transition is not allowed
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
