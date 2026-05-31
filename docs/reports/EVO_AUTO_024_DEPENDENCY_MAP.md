# EVO_AUTO_024 Dependency Map

## Priority

- ID: `evo-auto-024-quality-gates`
- Title: `Quality Gates`

## Upstream dependencies

- `src/cli/validate.js`
- `src/cli/ui.js`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/workflows/VIBER_APP_DELIVERY_PIPELINE.md`
- `docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md`
- `kvdf task assessment`
- `kvdf task lifecycle`

## Downstream dependents

- task assessment
- traceability
- risk/change control
- docs/source-of-truth checks

## Notes

- Quality gates should stay visible in assessment and lifecycle output.
- Later governance layers should rely on the existing gate model rather than inventing a second one.
- Blocked, ready, and done are separate states, not synonyms.
