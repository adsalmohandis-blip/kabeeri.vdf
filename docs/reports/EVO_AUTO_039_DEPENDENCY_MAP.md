# EVO_AUTO_039 Dependency Map

## Priority

- ID: `evo-auto-039-blocked-scenarios`
- Title: `Blocked Scenario Reporting`

## Upstream dependencies

- `kvdf reports blocked --json`
- `node bin/kvdf.js readiness report --json`
- `node bin/kvdf.js governance report --json`
- `.kabeeri/reports/blocked_scenarios_report.json`
- `schemas/runtime/schema_registry.json`
- `schemas/runtime/generic-report-state.schema.json`

## Downstream dependents

- searchable reference surface
- readiness workflow
- release and handoff review

## Notes

- The blocked report is the durable contract for this slice.
- The report should remain explicit about blockers even when the workspace is otherwise valid.
- Later reporting work should reuse this artifact rather than inventing a second blocked-state report.
