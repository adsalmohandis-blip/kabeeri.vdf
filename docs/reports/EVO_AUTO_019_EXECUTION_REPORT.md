# EVO_AUTO_019 Execution Report

## Priority

- ID: `evo-auto-019-source-capability-mapping`
- Title: `Source-to-Capability Mapping`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

The imported source study needs a durable bridge from source files to capability surfaces, runtime targets, docs pages, and CLI commands. The capability registry tells us what the canonical units are; this priority tells us where each study branch lands inside the repo.

The key idea is redistribution with traceability:

- every source-study branch has a destination
- capability surfaces stay tied to docs and runtime targets
- the source package can be retired only after the destinations are mapped
- the mapping stays readable in both CLI and report form

## Detailed checklist

1. Confirm the source-package destination map is generated.
2. Confirm both source-study branches have permanent destination homes.
3. Keep traceability from the source package to the canonical capability registry.
4. Keep CLI access aligned with the documented destination map.
5. Preserve the map as the operational bridge before source-package retirement.

## Preconditions

- `kvdf source-package map` exists.
- `docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md` exists.
- The source package study and inventory already exist as supporting reports.

## Guardrails

- Do not remove the source folder before the destination map is complete.
- Do not invent alternate destinations that bypass the canonical docs and knowledge folders.
- Do not lose the relationship between the source study and the capability registry.
- Do not treat the destination map as the only evidence; keep the study and inventory alongside it.

## Validation flow

```bash
node bin/kvdf.js source-package map --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The destination map returns the permanent homes for each source-study branch.
- The destination map stays linked to the supporting study and inventory reports.
- Evolution status advances to the next source-package follow-on slice.

## Summary

`evo-auto-019` is complete because the source-package destination map already exists and provides the redistribution contract for the imported study. The next session can move on to the follow-on source-package cleanup or the next planned evolution slice without losing traceability.
