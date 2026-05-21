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
- a planning method recommendation
- a Current-State Report
- a workspace boundary report
- a stale-state report
- a self-planning auto plan with docs, review, and visual context
- a planner review report
- a planner resume report
- draft documentation files from the planner pipeline
- a shared Roadmap Train / Evo Sprint Queue for owner and Viber tracks
- a Codex-ready execution prompt
- a visual planning model with Mermaid, planning board JSON, scope map, and
  markdown report output
- a Viber Planning-to-Task Execution Pipeline with execution gating,
  state-freshness, and source-control posture
- allowed and forbidden file lists
- acceptance criteria
- validation commands
- a stop condition

## Planner Method And Self-Planning Engine

Supported methods:

- `auto`
- `structured`
- `agile`
- `hybrid`

Method guidance:

- `structured` for architecture-heavy, database-heavy, security-sensitive,
  integration-heavy, enterprise, framework/core/plugin, and release-critical
  work
- `agile` for UI iteration, content, prototype, MVP discovery, unclear
  requirements, and small iterative app work
- `hybrid` for full app, product, or system builds
- `auto` when KVDF should choose the method and explain why

The self-planning engine should also:

- review plan quality before execution
- resume from planner, evolution, task, runtime, dashboard, and source-control
  state
- generate strong Codex-ready prompts automatically
- materialize draft Markdown documentation files from the planner pipeline
- keep Owner approval as the governance gate
- keep Codex as the executor, not the planner
- persist train, version, evolution, and task state as JSON so the next session can resume FIFO progress without reconstructing the queue from chat

Planner docs materialization must remain draft-only unless the command
explicitly asks for file writes. It must not execute code changes or
materialize an Evolution automatically.

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
2. planner method or planner auto
3. planner current-state
4. planner boundary
5. planner truth audit or planner truth
6. planner review
7. planner docs
8. planner propose
9. Owner approve or reject
10. planner current
11. planner materialize
12. planner prompt --from-current
13. planner visual --from-current
14. Codex execution
15. validation
16. planner complete

Rules:

- proposed plans are not executable
- approved plans become the current planner source of truth
- rejected plans remain historical and do not become the current plan
- approved plans can be materialized into Evolution and Task Punch runtime records without executing the tasks yet
- approved plans remain current until they are completed or explicitly rejected
- completed plans close out the shared runtime approval gate and clear the current plan id when they match the current slice
- direct-to-main remains the default for KVDF Core Owner Track work
- current-state and boundary reports should be read before any write-capable planner action
- truth reconciliation should be read whenever runtime or generated reports may
  be stale
- planner docs catalog/plan/status/review output should carry the foldered app documentation model forward
- `.kabeeri/planner.json` is runtime state and must not be committed unless a separate Evolution explicitly requires it
- `.kabeeri/tasks.json` is supporting state, not final truth
- chat history is supporting context only
- GitHub is optional secondary evidence, not the primary source of truth
- current-state reports must be rebuilt from the live repo/workspace before
  recommending the next Evolution
- the shared Roadmap Train / Evo Sprint Queue should resume FIFO state instead
  of being rebuilt from chat or generated snapshots

## Planner Review And Resume

`kvdf planner review` checks:

- track correctness
- Owner, Vibe, or Plugin boundary fit
- source-control mode fit
- security gate state when available
- docs status
- task punch quality
- visual planning output
- Codex prompt strength

`kvdf planner resume` restores the current planner context from runtime state
and should explain the next recommended action even when some runtime files are
missing.

## Planner Docs Materialization

`kvdf planner docs catalog|plan|materialize|status|apply-stage|review` creates
and governs foldered draft Markdown documentation from the planner pipeline.

Rules:

- Owner track writes only to owner/core documentation surfaces.
- Vibe track writes only to app workspace documentation surfaces.
- Plugin track writes only to the selected plugin documentation surfaces.
- Existing files are skipped unless `--force` is passed.
- `--dry-run` reports proposed docs without writing files.
- The command must not execute or materialize Evolutions automatically.
- docs status is planned/generated/applied_to_stage/reviewed/approved/not_applicable/missing

## Planner Materialization Stage

Materialization bridges the approved plan into governed KVDF runtime records:

- it creates or updates the Evolution record for the approved plan
- it creates or updates the Task Punch task records for the approved plan
- it records a planner-to-evolution trace link in runtime state
- it writes a materialization report under `.kabeeri/reports/`
- it does not execute tasks
- it does not commit files
- it does not make branch/PR mandatory

## Planner Dashboard Sync Stage

The dashboard and live-report layers are derived consumers of Planner runtime
state. They do not decide the next Evolution, but they do expose enough of the
approved plan to keep the workspace readable without opening the planner files
manually.

The dashboard sync layer should expose:

- the current planner state
- the current approved plan
- the current pipeline summary when present
- version plan summary
- visual planning summary
- source control state
- materialization status
- next evolution guidance
- task punch summary
- track-specific guidance for owner, vibe, and plugin modes

The planner dashboard view must remain safe when `.kabeeri/planner.json` is
missing, when no current plan is approved, or when the current plan has not yet
been materialized. In those cases the dashboard should show empty or missing
states rather than throwing.

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
- Viber/App planning must also expose the Viber Planning-to-Task Execution
  Pipeline summary so the prompt and dashboard layers can keep execution
  blocked until the plan is approved and materialized.

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
