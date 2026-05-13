# evo-auto-005: Manual source package intake

**Priority ID:** `evo-auto-005`  
**Title:** Manual source package intake  
**Status:** `in_progress`  
**Date:** 2026-05-12

---

## Executive Summary

This priority keeps `KVDF_New_Features_Docs/` as a manually requested source
package, not a normal runtime source tree. The package contains both a
reference software-design system and a project-documentation generator system.
The remaining work is to keep that manual-only import contract visible in the
priority system, owner checkpoint, and dependency report surfaces so future
sessions do not treat the folder like a generic inbox.

## Exact Scope

### What This Priority Covers

1. **Manual Intake Contract**
   - Treat the folder as an explicitly requested source package only.
   - Preserve the rule that import starts only when the Owner asks for it.

2. **Scan Exclusion Visibility**
   - Keep the folder excluded from automatic validation scans until import is complete.
   - Make the exclusion easy to find in runtime and docs references.

3. **Import Lifecycle Contract**
   - Record that selected content is imported through Evolution Steward.
   - Preserve the source package until its content has been redistributed to Kabeeri folders.

4. **Documentation Sync**
   - Synchronize the owner checkpoint and report surfaces so the source-package
     behavior is obvious from session resume.

## Expected Outcomes

- `KVDF_New_Features_Docs/` remains a protected source package.
- The active priority documents the source-package contract clearly.
- The owner can resume without guessing whether the folder is a generic inbox.
- Related reports and state files agree about the manual-only import behavior.

## What Must NOT Change

1. Do not move, rename, delete, or recreate `KVDF_New_Features_Docs/` until the
   imported content has been redistributed into Kabeeri folders and validated.
2. Do not add automatic import behavior for the folder.
3. Do not treat the source package as a normal runtime source tree.

## Success Criteria

1. The manual-only source-package rule is documented in the active priority.
2. The dependency map names the runtime and docs surfaces that enforce it.
3. The owner checkpoint points to the active manual source-package priority.
4. Validation continues to exclude the source package from automatic scans.

## Files That Must Move Together

| Tier | Files | Reason |
| --- | --- | --- |
| Implementation | `src/cli/validate.js`, `src/cli/services/task_memory.js` | These already enforce the protection rules. |
| Governance | `knowledge/governance/EVOLUTION_STEWARD.md`, `knowledge/task_tracking/TASK_GOVERNANCE.md` | These explain the source-package contract. |
| Reports | `docs/reports/EVO_AUTO_005_SCOPE_STATEMENT.md`, `docs/reports/EVO_AUTO_005_DEPENDENCY_MAP.md` | These keep the priority resumable. |
| Owner State | `OWNER_DEVELOPMENT_STATE.md` | This keeps the resume checkpoint current. |
| Summary | `docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md` | This keeps the top-level priority view aligned. |

## Slice Handoff Notes

This scope statement completes the first slice for `evo-auto-005`.
The next step is to map every dependent surface and confirm that the source
package behavior is visible in the docs/state/report layer.
