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
- allowed and forbidden file lists
- acceptance criteria
- validation commands
- a stop condition

## KVDF Core Behavior

For KVDF Core work, the planner defaults to:

- `track: framework_owner`
- `delivery_mode: direct_main`

Branch and PR are not the default path in KVDF Core. They remain optional only
for team, protected-repo, or risky work.

## Vibe / App Track Behavior

The same planning idea can be used for vibe-app work, but the track stays
separate from KVDF Core.

For app-track planning:

- the planner should keep app work inside the app workspace
- the planner should not mix owner-track and app-track analysis
- GitHub sync remains optional and local-first remains valid

## Plugins Behavior

Plugins are discovered separately from core planning. A plugin may contribute
capabilities, but the planner should still keep:

- plugin runtime behavior
- plugin install state
- plugin removal rules

separate from core planning unless the requested Evolution explicitly concerns
plugin development.

## Runtime-State Rules

The planner may read runtime state, but in the MVP it should not write runtime
state under `.kabeeri/` unless the Owner explicitly requests that behavior in a
separate Evolution.

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
Owner explicitly requests a branch or PR flow.
