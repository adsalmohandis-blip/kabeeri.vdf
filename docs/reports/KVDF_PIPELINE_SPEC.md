# KVDF Pipeline Spec

This page is the strict source-of-truth for the app-building pipeline.
It defines the required order, the state files that must exist, and the
transitions that are allowed or blocked.

## Purpose

The pipeline is intentionally fail-closed:

- later stages cannot run until earlier stages have written state
- shared state must be explicit, not inferred from chat memory
- `task packet` must have complete upstream traceability
- `task complete` must have a matching verification and archive trail

## Stage Order

```text
1. resume
2. project profile route
3. delivery choose
4. questionnaire plan
5. blueprint select
6. data-design context
7. task assessment
8. task packet
9. task executor-contract
10. task batch-run
11. task start
12. task verify
13. task complete
```

## Required State By Stage

| Stage | Required state files | Required condition |
| --- | --- | --- |
| `resume` | `.kabeeri/session_track.json`, workspace state | Session and track context can be resolved. |
| `project profile route` | `.kabeeri/project_profile.json` | A project profile can be routed and persisted. |
| `delivery choose` | `.kabeeri/delivery_decisions.json` | A delivery mode is selected and stored. |
| `questionnaire plan` | `.kabeeri/questionnaires/adaptive_intake_plan.json`, `.kabeeri/questionnaires/answers.json` | A delivery mode and blueprint context exist before planning. |
| `blueprint select` | `.kabeeri/product_blueprints.json` | A product blueprint can be selected. |
| `data-design context` | `.kabeeri/data_design.json` | A selected blueprint exists so data design can be derived. |
| `task assessment` | `.kabeeri/task_assessments.json` | Delivery mode and questionnaire plan are present. |
| `task packet` | `docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json`, `.kabeeri/interactions/context_briefs.json`, `.kabeeri/questionnaires/answers.json`, `.kabeeri/questionnaires/adaptive_intake_plan.json`, `.kabeeri/product_blueprints.json`, `.kabeeri/data_design.json`, `.kabeeri/delivery_decisions.json` | The traceability chain is complete and approved/ready tasks exist. |
| `task executor-contract` | `docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json` | A control-plane packet already exists. |
| `task batch-run` | `.kabeeri/reports/task_batch_run.json` | Packet + executor contract exist before execution. |
| `task start` | `.kabeeri/tasks.json`, `.kabeeri/tokens.json`, `.kabeeri/locks.json` | The task has an assignee, an active token, and an active lock. |
| `task verify` | `.kabeeri/acceptance.json` | Reviewed acceptance evidence exists for every criterion. |
| `task complete` | `.kabeeri/reports/<task-id>.verification.md`, `.kabeeri/task_trash.json`, `.kabeeri/task_scheduler.json` | The task is owner-verified and the archive trail matches the task. |

## Allowed Transitions

- `resume` may run first in any workspace session.
- `project profile route` may run after workspace context exists.
- `delivery choose` may run after a profile exists.
- `questionnaire plan` may run after delivery mode selection.
- `blueprint select` may run after a catalog exists.
- `data-design context` may run after blueprint selection.
- `task assessment` may run after delivery and questionnaire context exist.
- `task packet` may run only when upstream traceability is complete.
- `task executor-contract` may run only after the packet exists.
- `task batch-run` may run only after packet + contract exist.
- `task start` may run only when task access is governed by assignee, token, and lock.
- `task verify` may run only after reviewed acceptance evidence exists.
- `task complete` may run only after owner verification plus archive trail checks.

## Blocked Transitions

- No packet without traceability completeness.
- No executor contract without a packet.
- No batch execution without packet + contract.
- No task start without assignee + active token + active lock.
- No verification without acceptance evidence.
- No completion without verification report, trash record, and scheduler route.

## Output Artifacts

- `docs/reports/KVDF_PIPELINE_ENFORCEMENT_MATRIX.md`
- `.kabeeri/reports/pipeline_enforcement.json`
- `docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json`
- `docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json`
- `.kabeeri/reports/task_batch_run.json`

## Related Commands

```bash
kvdf pipeline matrix
kvdf pipeline strict [--task <task-id>]
kvdf pipeline check <command-key> [--task <task-id>]
```

## Notes

- The pipeline spec describes the strict contract.
- The enforcement matrix shows the current runtime status of that contract.
- If the matrix and the spec diverge, the matrix should be treated as the current runtime signal and the spec should be updated to match the enforced behavior.
