# evo-auto-007: Project documentation generator import

**Priority ID:** `evo-auto-007`  
**Title:** Project documentation generator import  
**Status:** `done`  
**Date:** 2026-05-12

---

## Executive Summary

This priority imported the reusable project documentation generator flow,
templates, and catalog entries into the permanent Kabeeri documentation
generator reference. The source package is already decommissioned, and the
permanent reference home now carries the lifecycle rules that future work should
reuse instead of recreating.

## Exact Scope

### What This Priority Covered

1. **Reusable Docs Flow**
   - Preserve the lifecycle of generating project documentation as a reusable
     reference.
   - Keep the docs generator behavior separate from the old source package.

2. **Templates and Catalog Entries**
   - Move the reusable templates, sections, and catalog metadata into the
     permanent reference home.
   - Keep the catalog readable from CLI and docs without the source folder.

3. **Duplicate-Analysis Guardrails**
   - Preserve the overlap analysis so the docs-generator vocabulary does not
     drift away from the capability map.
   - Reuse existing capability names instead of inventing a second docs
     lifecycle vocabulary.

## Expected Outcomes

- The permanent `knowledge/documentation_generator/` folder exists and is
  discoverable from CLI.
- The docs-generator reference can be inspected and compared without the source
  package.
- The owner can resume from the report trail without chat history.

## What Must NOT Change

1. Do not recreate the old `KVDF_New_Features_Docs/` folder as a live source tree.
2. Do not invent a second docs-generator vocabulary that duplicates existing
   capability names.
3. Do not make the permanent reference depend on the removed source folder.

## Success Criteria

1. The permanent docs-generator reference folder exists.
2. The CLI can list, inspect, and compare the reference.
3. The duplicate-analysis report is preserved in the permanent reference home.

## Files That Move Together

| Tier | Files | Reason |
| --- | --- | --- |
| Implementation | `src/cli/commands/reference_folders.js`, `src/cli/commands/source_package.js` | These surfaces expose the docs-generator reference and its compare path. |
| Permanent reference | `knowledge/documentation_generator/` | This is the durable home for the reusable docs flow. |
| Governance | `knowledge/governance/EVOLUTION_STEWARD.md`, `knowledge/task_tracking/TASK_GOVERNANCE.md` | These explain the import boundary. |
| Reports | `docs/reports/EVO_AUTO_007_SCOPE_STATEMENT.md`, `docs/reports/EVO_AUTO_007_DEPENDENCY_MAP.md` | These keep the priority resumable. |
| Summary | `docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md`, `docs/reports/EVO_AUTO_041_EXECUTION_REPORT.md` | These keep the queue aligned. |

## Slice Handoff Notes

This scope statement closes the docs-generator import slice for `evo-auto-007`.
The next step is source-package cleanup and removal, which is only safe because
the reusable docs flow and reference folder are already permanent.
