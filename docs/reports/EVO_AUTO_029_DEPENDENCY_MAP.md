# EVO_AUTO_029 Dependency Map

## Priority

- ID: `evo-auto-029-cli-surface`
- Title: `CLI Capability Surface`

## Upstream dependencies

- `kvdf capability surface`
- `kvdf capability matrix`
- `docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json`
- `docs/reports/KVDF_CAPABILITY_DOC_MATRIX.json`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/site/`

## Downstream dependents

- docs-generator reference
- source-to-capability mapping
- docs site synchronization
- capability search surface

## Notes

- The CLI surface is the discoverability layer for the capability map.
- Later docs and report work should preserve the same 53-capability structure.
- A complete matrix is still valuable because it proves the surface contract is stable.
