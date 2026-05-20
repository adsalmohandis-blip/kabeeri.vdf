# Source Of Truth And Workspace Boundary Policy

## Purpose

KVDF must not plan or write from stale snapshots alone. Before planning,
materializing, or generating reports, it should know the current repo,
workspace, track, source-of-truth order, and safe write boundary.

## Source Of Truth Order

When planning or writing, KVDF should prefer:

1. Target repo latest `main`
2. Merged PR history for the target repo
3. `package.json` and current scripts
4. `README.md` and current repo docs
5. `docs/roadmap` and planning files
6. Runtime state under `.kabeeri/`
7. Generated reports
8. Chat or manual plans

Rules:

- latest `main` beats stale roadmap text
- merged PR history beats old reports
- package and scripts beat old command docs
- runtime state is operational evidence, not implementation truth
- generated reports are snapshots unless a document explicitly marks them canonical
- chat history is supporting context only

## Workspace Boundary Rules

KVDF Core work:

- may write only to KVDF Core allowed paths
- must not write to KVDOS
- must not write app workspace files

Viber/App work:

- writes inside `workspaces/apps/<app-slug>/`
- must not write KVDF Core source unless the Owner explicitly asks
- keeps KVDOS separate from core unless the workspace itself is KVDOS

Plugin work:

- writes only the selected plugin folder
- must not touch unrelated plugins
- protects `.kabeeri/plugin-links/` runtime state

## Current State Report

Use `kvdf planner current-state --json` to rebuild the current state from the
live repository and workspace. The report should identify:

- current repo
- current workspace
- active track
- target track
- allowed write paths
- forbidden write paths
- stale roadmap files
- stale reports
- stale runtime items
- next safe action

The current-state report is the file-first gate that should be read before any
new write-capable planning action. If the report or the companion truth audit
shows a stale recommendation, the planner should stop and reconcile first.

## Stale State Classification

KVDF should classify stale items as:

- active
- historical
- superseded
- stale
- next_approved_evolution
- unknown

Rules:

- if runtime recommends something already implemented in source, mark it stale
- if a roadmap item already exists in source, mark it superseded
- if a generated report is older than the current source state, mark it historical
- do not delete stale files in this Evolution
- only report and warn

## Stop Rule

Stop and ask the Owner if the repo identity or workspace boundary is ambiguous.
Do not plan or write until the boundary is clear.
