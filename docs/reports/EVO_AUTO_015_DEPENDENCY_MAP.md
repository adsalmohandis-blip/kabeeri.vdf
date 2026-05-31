# EVO_AUTO_015 Dependency Map

## Priority

- ID: `evo-auto-015`
- Title: `Fast test layers`

## Upstream dependencies

- `tests/service.unit.test.js`
- `tests/cli.integration.test.js`
- `src/cli/ui.js`
- `src/cli/commands/resume.js`
- `docs/reports/KVDF_FULL_REPOSITORY_AUDIT.md`

## Downstream dependents

- developer onboarding guidance
- resume and validation guidance
- runtime extraction work
- future service-level refactors

## Notes

- This priority depends on the repo already keeping unit/service and integration concerns distinct.
- The slow integration suite can still surface unrelated issues without invalidating the fast-layer split.
- Once closed, it becomes the reference point for future fast-path test extraction work.
