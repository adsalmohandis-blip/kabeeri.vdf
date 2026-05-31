# EVO_AUTO_023 Dependency Map

## Priority

- ID: `evo-auto-023-lifecycle-engine`
- Title: `Lifecycle Engine`

## Upstream dependencies

- `src/cli/commands/task_lifecycle.js`
- `src/cli/commands/task_scheduler.js`
- `.kabeeri/tasks.json`
- `knowledge/task_tracking/TASK_GOVERNANCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`

## Downstream dependents

- quality gates
- task assessment
- traceability
- risk/change control

## Notes

- The lifecycle board should stay the canonical stage view for task progression.
- Later governance layers should read from this lifecycle rather than recreating it.
- Archived and blocked states are part of the lifecycle, not an edge case.
