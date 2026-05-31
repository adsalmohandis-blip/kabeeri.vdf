# EVO_AUTO_037 Dependency Map

## Priority

- ID: `evo-auto-037-source-normalization`
- Title: `Source Folder Normalization`

## Upstream dependencies

- `kvdf source-package normalize`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_MIGRATION_STATE.md`
- `docs/reports/KVDF_NEW_FEATURES_DOCS_RELOCATION_MANIFEST.json`

## Downstream dependents

- full task coverage workflow
- blocked scenario reporting
- searchable reference surface

## Notes

- The normalization map is the durable source of truth for lowercase aliases.
- The source package being absent is fine as long as the preserved mapping remains intact.
- Later source-handling work should reuse this mapping rather than generating a conflicting alias set.
