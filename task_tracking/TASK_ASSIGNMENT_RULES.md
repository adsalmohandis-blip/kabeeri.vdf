# Task Assignment Rules

## Roles

| Role | Can Be Assignee | Can Review Own Work |
| --- | --- | --- |
| Human developer | yes | no |
| AI developer | yes | no |
| Reviewer | yes, if not reviewer for same task | no |
| Owner | yes, but avoid unless necessary | no |

## Rules

- A task must be approved or ready before assignment.
- Assignee must match the workstream or have explicit approval.
- Backend, public frontend, admin frontend, database, docs, and QA tasks should stay separate unless the task is explicitly marked as integration work.
- Assignment must record assignee, reviewer, timestamp, and reason.
- Reassignment must preserve audit history.
