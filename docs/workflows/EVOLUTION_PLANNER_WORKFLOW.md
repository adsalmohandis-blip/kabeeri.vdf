# Evolution Planner Workflow

## Overview

The KVDF Planner Layer turns governed repository context into the next
approved Evolution, a Task Punch, a materialized runtime record, and a
Codex-ready prompt.

This workflow is deterministic and local-first. It does not replace the Owner.
It supports owner, vibe/app, and plugin planner modes.

The Idea to Evolution Pipeline is the upstream planning surface that turns a
raw idea into the file map, design artifacts, version slices, evolutions, task
punches, visual roadmap, and source control plan that the approval gate can
review.

Planner dashboard sync sits alongside the approval gate so dashboard state can
show the current approved plan, visual summary, source control state,
materialization status, and next action without becoming the source of truth.

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
- validation fails
