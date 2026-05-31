# EVO_AUTO_040 Dependency Map

## Priority

- ID: `evo-auto-040-searchable-reference`
- Title: `Searchable Reference Surface`

## Upstream dependencies

- `kvdf capability search --json`
- `docs/reports/KVDF_CAPABILITY_SEARCH_INDEX.json`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/reports/KVDF_CAPABILITY_DOC_MATRIX.json`
- `docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json`
- `docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md`

## Downstream dependents

- capability search follow-up lookup
- future docs surfacing
- reference-driven onboarding and support flows

## Notes

- The search index is the durable cross-reference for capabilities, commands, phases, and report types.
- Later docs or CLI changes should keep the same facet names so searches remain stable.
- This is the last open framework-owner evo in the current ledger.
