# EVO_AUTO_026 Dependency Map

## Priority

- ID: `evo-auto-026-traceability-layer`
- Title: `Traceability Layer`

## Upstream dependencies

- `src/cli/commands/traceability.js`
- `src/cli/validate.js`
- `src/cli/ui.js`
- `docs/internal/LIVE_JSON_REPORTS.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/reports/KVDF_PIPELINE_SPEC.md`

## Downstream dependents

- change control
- docs source-of-truth checks
- risk/change reporting
- release evidence

## Notes

- Traceability should stay the canonical end-to-end evidence layer.
- Later governance should read the trace report rather than reconstructing evidence.
- An empty gap set is still useful because it proves the chain is visible and queryable.
