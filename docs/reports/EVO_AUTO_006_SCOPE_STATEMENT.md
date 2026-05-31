# evo-auto-006: Reference design duplicate analysis

**Priority ID:** `evo-auto-006`  
**Title:** Reference design duplicate analysis  
**Status:** `done`  
**Date:** 2026-05-12

---

## Executive Summary

This priority analyzed the Software Design System material from
`KVDF_New_Features_Docs/` against the central capability map so we could avoid
recreating existing Kabeeri capabilities under new names. The source package is
now decommissioned, and the duplicate-analysis outcome is retained in the
permanent reports.

## Exact Scope

### What This Priority Covered

1. **Duplicate Analysis**
   - Compare the reference software-design content against the canonical
     capability map.
   - Identify overlap risk before any new capability naming is introduced.

2. **Source-Package Protection**
   - Keep the source package manual-only while the analysis runs.
   - Avoid automatic scans or new runtime behavior that would treat it as a
     generic inbox.

3. **Report Preservation**
   - Keep the duplicate-analysis report available as the permanent record of
     the comparison.
   - Preserve the reasoning that leads into the documentation-generator import
     work.

## Expected Outcomes

- The overlap analysis exists and is readable without chat history.
- Existing capability names are preferred over duplicate naming.
- The source package is still represented through reports and audit history.

## What Must NOT Change

1. Do not invent new capability names to make the overlap easier.
2. Do not treat the source package as a normal runtime source tree.
3. Do not skip the follow-up import and cleanup priorities.

## Success Criteria

1. The source-package duplicate analysis report is present.
2. The capability map can be reused without adding duplicate surfaces.
3. The owner can resume from the report trail without extra context.

## Files That Move Together

| Tier | Files | Reason |
| --- | --- | --- |
| Implementation | `src/cli/commands/source_package.js`, `docs/reports/KVDF_NEW_FEATURES_DOCS_DUPLICATE_ANALYSIS.md` | These surfaces produce and preserve the analysis. |
| Governance | `src/cli/services/manual_feature_docs.js`, `src/cli/services/task_memory.js` | These keep the source package protected while analysis is being recorded. |
| Reports | `docs/reports/EVO_AUTO_006_SCOPE_STATEMENT.md`, `docs/reports/EVO_AUTO_006_DEPENDENCY_MAP.md` | These keep the priority resumable. |
| Summary | `docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md`, `docs/reports/EVO_AUTO_041_EXECUTION_REPORT.md` | These keep the queue aligned. |

## Slice Handoff Notes

This scope statement closes the duplicate-analysis slice for `evo-auto-006`.
The next step is the project documentation generator import, which reuses the
same source-package boundary and avoids duplicating capability names.
