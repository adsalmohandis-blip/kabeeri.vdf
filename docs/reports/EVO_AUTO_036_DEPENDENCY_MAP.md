# EVO_AUTO_036 Dependency Map

## Priority

- ID: `evo-auto-036-capability-doc-matrix`
- Title: `Capability-to-Documentation Matrix`

## Upstream dependencies

- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/reports/KVDF_CAPABILITY_DOC_MATRIX.json`
- `docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json`
- `docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md`
- `docs/reports/KVDF_CAPABILITY_SEARCH_INDEX.json`
- `docs/reports/KVDF_CAPABILITY_DOC_MATRIX.json`

## Downstream dependents

- source normalization
- full task coverage
- blocked scenarios
- searchable reference

## Notes

- The matrix is the durable coverage contract for the repo.
- Later docs and CLI work should reuse the same capability rows rather than inventing a new map.
- Complete coverage is the goal, so any future partial row should be treated as a regression.
