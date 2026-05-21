# KVDOS Local Runtime Boundary

Updated: 2026-05-21

This document captures the `e2-p1` local runtime boundary at the app-doc level.
It is planning and boundary definition only.
It does not implement SQLite, `.kvdos` runtime files, or execution behavior.

## Boundary Purpose

The local runtime layer makes KVDOS durable and resumable while keeping private
workspace data local-first.

## Included

- SQLite-backed runtime model as a planning boundary
- `.kvdos` workspace state area
- workspace records
- project records
- task records
- report records
- approval records
- audit records
- local state notes

## Excluded

- runtime implementation code
- SQLite schema implementation
- `.kvdos` runtime file creation
- cloud login
- subscription API code
- device activation implementation
- license enforcement implementation
- execution runner work
- packaging work
- repo-root KVDF core edits

## Privacy Boundary

Protected local content remains local:

- private code
- secrets
- customer data
- sensitive reports
- local runtime state

## Source Of Truth

This boundary follows the app-local KVDOS docs:

- `docs/roadmap/KVDOS_VERSION_PLAN.md`
- `docs/roadmap/KVDOS_EVOLUTION_PLAN.md`
- `docs/roadmap/KVDOS_EVOLUTION_TASK_PUNCH.md`
- `docs/roadmap/KVDOS_IMPLEMENTATION_READINESS_QUEUE.md`
- `docs/roadmap/E2_P1_LOCAL_RUNTIME_STATE_TASKS.md`
- `docs/reports/e2-p1-local-runtime-state-build-ready-report.md`

## Keep-Out List

Do not expand this boundary into:

- runtime code
- SQLite implementation
- cloud/license/execution/packaging work
- repo-root KVDF files
- `.vscode/settings.json`

## Boundary Note

The local runtime boundary is a planning artifact for `e2-p1` and should be
used to guide later scoped work only after owner approval.
