# Task Scheduler Governance

Task Scheduler is the orchestration layer that decides how approved work moves
between KVDF surfaces without duplicating each surface's own logic.

## Scope

Task Scheduler coordinates movement across:

- active tasks in `.kabeeri/tasks.json`
- the temporary execution queue created by `kvdf temp`
- the recoverable trash bucket in `.kabeeri/task_trash.json`
- deferred routing decisions and follow-up ideas
- AI agent handoffs and schedule records

It does not replace task, temp, trash, evolution, or multi-ai commands. It
routes work into them and records the route history so the next session can
resume the same movement plan.

## Core Rules

- A route must always name a single source task and a single destination.
- A route into `trash` must use the trash service and keep retention metadata.
- A route into `temp` must materialize the current task into the temporary
  execution queue and preserve the full task memory.
- A route into `agent` must record the target agent and preserve handoff
  provenance.
- A route into `deferred` must preserve the task record and mark the route as a
  deferred scheduling decision.
- Route history is durable and should survive a restart or a new chat session.
- `kvdf schedule status --json` should explain each routed task's lineage,
  current destination, last routing reason, and restore hint when a task is in
  trash.
- Trash recovery should remain explicit: `kvdf task trash restore <task-id>`
  and `kvdf schedule route <task-id> --to restore` are both valid recovery
  surfaces, and the scheduler keeps the route history that led there.

## CLI Surface

- `kvdf schedule status`
- `kvdf schedule route <task-id> --to temp`
- `kvdf schedule route <task-id> --to trash`
- `kvdf schedule route <task-id> --to restore`
- `kvdf schedule route <task-id> --to agent --agent <agent-id>`
- `kvdf schedule route <task-id> --to deferred`
- `kvdf schedule history`

## Runtime State

The durable route history lives in `.kabeeri/task_scheduler.json`.

## Validation Expectations

- The scheduler should never mutate a task silently without recording a route
  entry.
- The scheduler should reuse the task trash and task temp runtime structures
  rather than inventing parallel copies of them.
- The scheduler should keep route history understandable enough to resume from
  a later session without chat memory.
