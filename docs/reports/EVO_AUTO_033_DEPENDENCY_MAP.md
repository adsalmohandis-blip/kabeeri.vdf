# EVO_AUTO_033 Dependency Map

## Priority

- ID: `evo-auto-033-doc-generation`
- Title: `Documentation Generation Flow`

## Upstream dependencies

- `kvdf docs generate`
- `kvdf docs workflow`
- `kvdf docs validate`
- `docs/site/generate-pages.js`
- `docs/site/site-manifest.json`
- `docs/site/page-contracts.json`
- `docs/reports/DOCS_SITE_GENERATION_WORKFLOW.json`

## Downstream dependents

- docs site synchronization
- docs site deep publishing
- docs site validation
- developer onboarding

## Notes

- The workflow report is the durable state for docs generation.
- Later docs work should reuse the same template/manifest/page contract chain.
- Regeneration is meaningful because it proves the docs surface is still derived from source truth.
