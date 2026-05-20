# Planner Self-Planning Engine

## Purpose

The Planner Self-Planning Engine makes KVDF Planner the planning authority
without making it autonomous.

It can choose the right planning method, generate the full planning package,
review the plan, resume state, and materialize draft documentation files. It
does not execute code changes automatically, and it never bypasses Owner
approval.

## Planning Methods

Supported methods:

- `auto`
- `structured`
- `agile`
- `hybrid`

Method guidance:

- `structured` for architecture-heavy, security-sensitive, database-heavy,
  integration-heavy, plugin/core, and release-critical work
- `agile` for UI iteration, content, MVP discovery, and small iterative app work
- `hybrid` for full app, product, or system builds
- `auto` when KVDF should select the best method and explain why

## Self-Planning Sequence

Recommended sequence:

1. `kvdf planner method`
2. `kvdf planner auto`
3. `kvdf planner review`
4. `kvdf planner docs catalog|plan|materialize|status|apply-stage|review`
5. `kvdf planner resume`
6. `kvdf planner prompt --from-current`
7. `kvdf planner visual --from-current`
8. `kvdf planner propose`
9. `kvdf planner approve`
10. `kvdf planner materialize`

The planner should not recommend the next Evolution until State Resync is
complete and the current state is explained in a Current-State Report.

## Documentation Materialization

`kvdf planner docs catalog|plan|materialize|status|apply-stage|review` creates
and governs foldered draft Markdown documentation from the planner pipeline.

Rules:

- Owner track writes only to owner/core documentation surfaces.
- Vibe/app track writes only to app workspace documentation surfaces.
- Plugin track writes only to the selected plugin documentation surfaces.
- Existing files are skipped unless `--force` is passed.
- `--dry-run` reports proposed docs without writing files.
- The command must not materialize Evolutions or execute code changes.
- docs status is tracked as planned, generated, applied_to_stage, reviewed,
  approved, not_applicable, or missing

## Planner Review

`kvdf planner review` checks:

- track correctness
- boundary fit for owner, vibe, or plugin work
- source-control mode fit
- docs status
- security gate state if available
- task punch quality
- visual planning output
- Codex prompt strength

If the review is blocked or ambiguous, KVDF must stop and ask the Owner before
continuing.

## Resume

`kvdf planner resume` restores planner context from runtime state and reports
the next recommended action.

It should be safe when runtime state is partially missing, and it should never
crash because the planner files are absent.

## Owner Gate

The Owner approval gate remains mandatory.

Planner may recommend, review, prepare, and materialize draft docs.
Codex executes approved slices.
Owner approves the path forward.
