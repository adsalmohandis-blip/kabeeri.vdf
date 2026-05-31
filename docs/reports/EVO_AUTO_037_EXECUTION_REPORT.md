# EVO_AUTO_037 Execution Report

## Priority

- ID: `evo-auto-037-source-normalization`
- Title: `Source Folder Normalization`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Source normalization preserves safe lowercase aliases and stable mappings for the imported source package so the historical source structure can still be understood after decommissioning. The repo already exposes the normalize report, so this priority keeps that mapping explicit and reloadable.

The key idea is traceable normalization:

- the source package can be represented without the original folder still being present
- lowercase aliases are preserved for roots and sections
- the mapping report remains the durable record
- the next session can reconstruct the relationship without relying on memory

## Detailed checklist

1. Keep the normalization map available as a distinct report.
2. Preserve lowercase aliases for the imported roots and section slugs.
3. Preserve the source-class to destination mapping.
4. Keep the decommissioned source package represented honestly as historical.
5. Avoid inventing a new source tree when the normalized mapping already exists.

## Preconditions

- `kvdf source-package normalize` exists.
- `docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md` exists.
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md` documents Source Folder Normalization.

## Guardrails

- Do not remove the preserved mappings from the report.
- Do not treat an absent source folder as a failure when the historical mapping is intact.
- Do not lose the relationship between the source package and the canonical destination folders.

## Validation flow

```bash
node bin/kvdf.js source-package normalize --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The normalization map stays available and reloadable.
- The preserved mappings stay readable.
- The next session can reconstruct the lowercase aliases and destination paths.

## Summary

`evo-auto-037` is complete because the normalization report already exists and cleanly captures the lowercase aliases and preserved mappings for the historical source package. The next session can move on to the full task coverage workflow with the same mapping contract.
