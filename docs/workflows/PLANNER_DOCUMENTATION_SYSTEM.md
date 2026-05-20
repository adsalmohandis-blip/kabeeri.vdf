# Planner Documentation System

KVDF documentation is native to planning, not an afterthought. The Planner owns
documentation lifecycle orchestration, while the Viber Dev Pipeline consumes the
docs at each stage and the app workspace stores the actual product docs.

## Purpose

- Make PRD, BRD, SRS, FRD, architecture, database, UI/UX, API, security,
  delivery, dependency, QA, DevOps, and handoff docs explicit.
- Reuse the existing portable app-doc templates instead of recreating content
  from scratch.
- Keep app docs inside the app workspace and keep KVDF Core docs inside KVDF
  Core docs.
- Make docs status visible in planner, review, resume, prompt, visual, and
  pipeline output.

## Foldered App Docs

App docs live under `workspaces/apps/<app-slug>/docs/` and are grouped by:

- `product/`
- `architecture/`
- `database/`
- `ui-ux/`
- `api/`
- `security/`
- `delivery/`
- `dependencies/`

Planner-generated docs are draft files only until the Owner approves the path
forward.

## Docs Status Model

Every required doc can be tracked as:

- `planned`
- `generated`
- `applied_to_stage`
- `reviewed`
- `approved`
- `not_applicable`
- `missing`

## Planner Commands

- `kvdf planner docs catalog`
- `kvdf planner docs plan`
- `kvdf planner docs materialize`
- `kvdf planner docs status`
- `kvdf planner docs apply-stage`
- `kvdf planner docs review`

The planner also carries docs status through `kvdf planner method`, `auto`,
`review`, `resume`, `prompt`, `visual`, and `pipeline`.

## Source Priority

For app repositories, current app files/docs/specs/source/tests outrank old
planning drafts, `.kabeeri/tasks.json`, chat history, and remote provider
history. GitHub is optional secondary evidence only.

For KVDF Core, current KVDF source/docs and the current branch stay primary,
with Git history, tags, and local runtime state as supporting evidence.

## Materialization

`kvdf planner docs materialize` writes draft docs into the app workspace or the
selected plugin workspace. It must not execute Evolutions or mutate unrelated
repos.

