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
4. planner current
5. planner materialize
6. planner prompt --from-current
7. planner visual --from-current
8. Codex execution
9. validation
10. planner complete

Rules:

- proposed plans are not executable
- approved plans become the current planner source of truth
- rejected plans remain historical and do not become the current plan
- approved plans can be materialized into Evolution and Task Punch runtime records without executing the tasks yet
- approved plans remain current until they are completed or explicitly rejected
- completed plans close out the shared runtime approval gate and clear the current plan id when they match the current slice
- direct-to-main remains the default for KVDF Core Owner Track work
- `.kabeeri/planner.json` is runtime state and must not be committed unless a separate Evolution explicitly requires it

## Planner Materialization Stage

Materialization bridges the approved plan into governed KVDF runtime records:

- it creates or updates the Evolution record for the approved plan
- it creates or updates the Task Punch task records for the approved plan
- it records a planner-to-evolution trace link in runtime state
- it writes a materialization report under `.kabeeri/reports/`
- it does not execute tasks
- it does not commit files
- it does not make branch/PR mandatory

## Idea to Evolution Pipeline Stage

The Idea to Evolution Pipeline sits above the shared approval gate and turns a
raw idea into a structured planning package before the first Evolution is
approved or materialized.

The pipeline output can include:

- documentation file maps
- system design
- database design
- UI/UX design
- visual planning output
- version plan
- evolutions
- task punches
- visual roadmap
- next evolution
- source control plan
- next approval or materialization action

Track behavior:

- Owner Track keeps KVDF Core source, docs, schemas, and tests in scope and
  defaults to direct-to-main when Git is available.
- Vibe/App Track keeps app workspace planning local-first by default and keeps
  KVDF Core edits out of scope unless the Owner explicitly approves them.
- Plugin Track keeps plugin manifest, runtime, docs, schemas, and tests in
  parity while protecting unrelated plugins and plugin-link runtime state.

The pipeline is still governed by the same approval gate:

Idea -> pipeline report -> Owner review -> approve/materialize first Evolution
-> Codex execution -> validation -> complete

## Source Control Provider Model

The planner also carries an explicit source-control contract so KVDF does not
hardcode GitHub as the only delivery shape.

Supported planning modes include:

- no source control
- local-only delivery
- Git direct-to-main
- Git branch without PR
- Git branch with PR
- GitHub as an optional remote/provider plugin
- future replaceable providers such as GitLab, Bitbucket, or custom adapters

Rules:

- Git is the default source-control provider only when a Git repository is
  detected.
- GitHub is an optional remote/provider layer, not the same thing as Git.
- Branch and PR are optional delivery modes, not the default shape.
- Owner Track defaults to direct-to-main when Git is available.
- Vibe/App Track defaults to local-first and only uses source control when it
  is explicitly enabled.
- Plugin Track follows the selected plugin repository or parent provider
  contract and must keep plugin mount/runtime state protected.
- Planner outputs should expose the `source_control` object so prompts, visual
  reports, materialization, and documentation all agree on the same delivery
  mode.

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
