# EVO_AUTO_025 Dependency Map

## Priority

- ID: `evo-auto-025-task-assessment`
- Title: `Task Assessment System`

## Upstream dependencies

- `src/cli/commands/task_assessment.js`
- `src/cli/validate.js`
- `src/cli/ui.js`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/reports/KVDF_PIPELINE_SPEC.md`
- `docs/reports/KVDF_PIPELINE_ENFORCEMENT_MATRIX.md`

## Downstream dependents

- task packet
- task executor contract
- task batch-run
- traceability
- quality gates

## Notes

- Task assessment should remain the structured readiness input for larger task flows.
- Later governance layers should read the assessment instead of rebuilding it.
- Blockers, readiness, and next actions are part of the contract, not extra commentary.
