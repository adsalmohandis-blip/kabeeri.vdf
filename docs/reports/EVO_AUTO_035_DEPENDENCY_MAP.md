# EVO_AUTO_035 Dependency Map

## Priority

- ID: `evo-auto-035-governance-expansion`
- Title: `Governance Expansion`

## Upstream dependencies

- `kvdf governance report`
- `kvdf governance report --target workspace`
- `kvdf governance report --target publish --strict`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/workflows/VIBER_APP_DELIVERY_PIPELINE.md`
- `src/cli/ui.js`
- `src/cli/validate.js`
- `.kabeeri/reports/governance_report.md`
- `.kabeeri/reports/live_reports_state.json`

## Downstream dependents

- capability-to-documentation matrix
- docs-to-CLI synchronization
- release and handoff governance checks
- future publish-time governance review

## Notes

- The governance report is the durable contract for this slice.
- Warning signals stay visible so the report remains honest about missing owner/security inputs.
- Later docs or CLI work should reuse this report shape instead of restating the governance model from memory.
