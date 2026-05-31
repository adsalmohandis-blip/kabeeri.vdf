# EVO_AUTO_027 Dependency Map

## Priority

- ID: `evo-auto-027-risk-change-control`
- Title: `Risk and Change Management`

## Upstream dependencies

- `src/cli/commands/change_control.js`
- `src/cli/commands/traceability.js`
- `src/cli/ui.js`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/reports/KVDF_COMMAND_DEPRECATION_LEDGER.md`

## Downstream dependents

- docs-site publishing
- release evidence
- handoff review
- governance reports

## Notes

- Risk/change control should remain the visible accountability layer for big shifts.
- Later governance layers should read the report instead of rebuilding the risk model.
- An empty report is still meaningful because it proves the control surface is healthy and queryable.
