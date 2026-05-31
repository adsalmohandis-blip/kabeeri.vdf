# EVO_AUTO_028 Dependency Map

## Priority

- ID: `evo-auto-028-docs-site-publishing`
- Title: `Docs Site Deep Publishing`

## Upstream dependencies

- `kvdf docs coverage`
- `kvdf docs validate`
- `docs/reports/DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json`
- `docs/site/`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/internal/AI_DEVELOPMENT_WORKFLOW.md`

## Downstream dependents

- documentation generation
- docs/site synchronization
- developer onboarding
- capability documentation matrix

## Notes

- The deep-publishing report is the current source of truth for docs-site completeness.
- Later docs-generation work should preserve this family coverage instead of replacing it.
- Completeness is meaningful because it proves the site can cover the whole developer journey.
