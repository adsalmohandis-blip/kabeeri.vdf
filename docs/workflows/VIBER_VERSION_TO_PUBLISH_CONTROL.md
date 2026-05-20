# Viber Version To Publish Control

KVDF Planner controls Viber/App versions from planning through publish readiness, but it does not publish externally on its own. Publishing remains explicit and gated.

## Purpose

This workflow links the planner, docs system, evolution plan, task punches, validation, security, handoff, and publish readiness into one read-only governance loop.

The shared Roadmap Train feeds this workflow with ordered version stages, Evo Sprints, evolutions, and task punches so the next publish step stays FIFO and resumable.

## Version State

Each version tracks:

- `version_id`
- `title`
- `app`
- `track`
- `planning_method`
- `status`
- `source_control_mode`
- `included_evolutions`
- `task_ids`
- `docs_gate`
- `evolution_gate`
- `task_gate`
- `validation_gate`
- `security_gate`
- `handoff_gate`
- `publish_gate`
- `blockers`
- `warnings`
- `next_action`

## Gate Order

1. Version plan
2. Docs gate
3. Evolution gate
4. Task gate
5. Validation gate
6. Security gate
7. Handoff gate
8. Publish gate
9. Version status update
10. Dashboard and visual roadmap readiness

## Readiness Rules

- Docs must exist and be applied to the relevant stage before the version can move forward.
- Evolutions must be planned and materialized before the version can be considered active.
- Task punches must be present for the required work slices.
- Validation evidence must exist before validation can pass.
- Security and handoff gates may be required or not applicable depending on the version scope.
- Publish readiness is only a readiness state. It never triggers an actual release.
- `published` is recorded only when the Owner explicitly marks it.

## Source Control

Git is historical evidence, not the only source of truth. GitHub is optional secondary provider evidence. KVDF Core stays direct-to-main by default, while Viber/app work can remain local-first or provider-driven depending on the configured source-control mode.

## Safe Use

- Do not auto-publish.
- Do not create a GitHub release here.
- Do not tag or push here.
- Do not mutate runtime state outside the planner/state control loop.
- Stop and ask the Owner when blockers or source-of-truth conflicts are ambiguous.
