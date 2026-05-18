# KVDF Planner Layer

## Purpose

The KVDF Planner Layer is the deterministic layer that reads the current
repository, workspace, runtime state, and governance docs to recommend the next
approved Evolution, generate a Task Punch, and prepare a Codex-ready execution
prompt.

The planner does not replace the Owner. It turns the current governed context
into the next executable slice.

## Roles

### Owner

- Decides the product direction.
- Approves or rejects the planner recommendation.
- Accepts final delivery on KVDF Core direct-to-main work.

### Planner

- Reads repo and runtime context.
- Recommends the next governed Evolution.
- Produces a Task Punch with scoped tasks.
- Produces a Codex-ready prompt with allowed files, forbidden files, checks,
  and stop conditions.

### Governor

- Enforces track rules, file boundaries, and runtime-state safety.
- Prevents planner output from becoming an out-of-scope edit plan.

### Codex

- Executes approved task slices.
- Is the executor, not the planner.
- Must follow the approved files, stop conditions, and validation commands.

### Reviewer

- Verifies the output against the planner plan and acceptance criteria.
- Confirms the work matches the intended Evolution slice.

## Inputs

The planner reads:

- the repository layout
- the current CLI and docs surfaces
- `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `.kabeeri/evolution.json` when present
- `.kabeeri/tasks.json` when present
- capability and plugin context when available

## Outputs

The planner can emit:

- a recommended next Evolution
- a Task Punch
- a Codex-ready execution prompt
- a visual planning model with Mermaid, planning board JSON, scope map, and
  markdown report output
- allowed and forbidden file lists
- acceptance criteria
- validation commands
- a stop condition

## Planner Modes

The planner is a shared native capability with three deterministic modes:

### Owner Track Planner

- `planner_mode: owner`
- `track: framework_owner`
- `delivery_mode: direct_main`

This mode is for KVDF Core and framework-owner work. Branch and PR are not the
default path. They remain optional only for team, protected-repo, or risky
work.

### Vibe / App Track Planner

- `planner_mode: vibe`
- `track: vibe_app_developer`
- `delivery_mode: local_first`

This mode is for application delivery work. The planner should keep app work
inside the app workspace, keep GitHub optional, and never mix owner-track and
app-track analysis by default.

### Plugin Track Planner

- `planner_mode: plugin`
- `track: plugin`
- `delivery_mode: direct_main`

This mode is for plugin development and plugin lifecycle work. The planner
should read the plugin manifest and keep plugin runtime mount state protected
unless the requested Evolution explicitly concerns plugin operations.

## Visual Planner Model

The visual planner model is a data and report layer, not a dashboard UI.

It should reuse the deterministic planner outputs and reshape them into:

- a Mermaid planning graph
- a planning board JSON model
- a scope map
- a readable markdown visual planning report

Responsibilities:

- show the proposed Evolution
- show the task punch for the slice
- show what Codex may edit
- show what Codex must not edit
- show runtime-state boundaries
- show generated artifacts that may refresh during validation
- show the validation commands
- show the stop condition

Track behavior:

- Owner visuals should center on direct-to-main KVDF Core planning.
- Vibe visuals should center on local-first app delivery planning.
- Plugin visuals should center on manifest, runtime, docs, schema, and test
  parity.

## Planner Runtime State and Owner Approval Gate

The Planner Layer is durable, not conversational only.

The runtime state file is:

- `.kabeeri/planner.json`

This file stores:

- proposed plans
- approved plans
- rejected plans
- the current approved plan id
- planner mode and track metadata
- allowed and forbidden file boundaries
- validation commands
- stop conditions
- approval and rejection metadata

Planner output becomes executable only after Owner approval.

Required progression:

1. Owner direction
2. planner propose
3. Owner approve or reject
4. planner prompt --from-current
5. Codex execution
6. validation

Rules:

- proposed plans are not executable
- approved plans become the current planner source of truth
- rejected plans remain historical and do not become the current plan
- direct-to-main remains the default for KVDF Core Owner Track work
- `.kabeeri/planner.json` is runtime state and must not be committed unless a separate Evolution explicitly requires it

## Track Rules

- Owner Track owns KVDF Core and its governance.
- Vibe/App Track owns product/workspace delivery.
- Plugin Track owns plugin bundle development and lifecycle parity.
- The planner should not silently mix one track into another.
- The planner should use the selected or auto-detected track to shape the
  allowed files, forbidden files, stop conditions, and prompt heading.

## Runtime-State Rules

The planner may read runtime state, and the planner runtime ledger stores
proposed and approved plans under `.kabeeri/planner.json`, but it should not
commit that runtime state unless the Owner explicitly requests that behavior in
a separate Evolution.

Planner output should stay deterministic and reproducible from the current
context.

## Future-Only Track Rules

The planner should not pretend future work is already implemented.

If a capability, workflow, or file family is missing, the planner should label
it as:

- planned
- recommended
- or out of scope

rather than silently treating it as already available.

## Direct-To-Main Default

KVDF Core delivery is direct-to-main by default for the solo Owner workflow.
The planner should reflect that in every KVDF Core recommendation unless the
Owner explicitly requests a branch or PR flow. Vibe/App delivery remains
local-first by default, and plugin delivery should keep plugin mount/runtime
state in scope when relevant.
