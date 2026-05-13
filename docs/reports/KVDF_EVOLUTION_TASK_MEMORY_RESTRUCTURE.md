# KVDF Evolution And Task Memory Restructure

## Goal

Make the next development cycle execute in a strict and resumable order:

1. Capability Registry and Source Mapping
2. Entry / Track / Role Enforcement
3. Pack Router and Project Profile System
4. Lifecycle Engine and Quality Gates
5. Traceability, Risk, and Change Control
6. Docs Site Deep Publishing
7. Source Folder Normalization and Preservation

At the same time, give every task a durable memory block so the next session can resume with less repeated explanation.

## What Changed

### Evolution

- Added `kvdf evolution roadmap`
- Added a canonical seven-step KVDF restructure roadmap to the Evolution report layer
- Exposed the roadmap inside `kvdf evolution priorities`
- Included roadmap summary information in `kvdf evolution status`
- Documented the new order in the CLI help and capabilities reference

### Tasks

- Added durable task memory generation when tasks are created
- Added `kvdf task memory <task-id>`
- Stored the memory object in `.kabeeri/tasks.json` with:
  - purpose
  - scope
  - source of truth
  - acceptance criteria
  - required inputs
  - expected outputs
  - do-not-change rules
  - resume steps
  - verification commands
- Updated the task temporary queue to build slices from the task memory block instead of the title alone

## Why This Helps

- The next session does not need to infer the plan from chat history.
- `evolution` now presents the work order explicitly instead of relying on a remembered priority order.
- `task temp` can resume from durable task context, which reduces re-reading, re-explaining, and token waste.
- The docs site and CLI reference now expose the same behavior to humans and AI tools.

## Files Touched

- `src/cli/services/evolution.js`
- `src/cli/commands/evolution.js`
- `src/cli/services/task_memory.js`
- `src/cli/index.js`
- `src/cli/commands/temp.js`
- `src/cli/ui.js`
- `cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/site/assets/js/app.js`
- `tests/cli.integration.test.js`
- `OWNER_DEVELOPMENT_STATE.md`

## Validation

Run after implementation:

- `npm test`

## Notes

- The roadmap is intentionally ordered to support a full restart from source-study extraction through docs-site publishing and source normalization.
- Task memory is intentionally stored in the task record so future sessions can recover context without chat memory.
