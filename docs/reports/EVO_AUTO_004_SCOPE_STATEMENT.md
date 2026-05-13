# evo-auto-004-runtime-services-layer: Scope Statement

**Priority ID:** `evo-auto-004`  
**Title:** Runtime services layer  
**Status:** `in_progress`  
**Date:** 2026-05-12

---

## Executive Summary

This priority focuses on moving reusable runtime logic, state management, and report generation out of CLI command facade handlers (`src/cli/commands/`) and `src/cli/index.js` into a dedicated runtime services layer (`src/cli/services/`). This separation of concerns ensures that the command modules act strictly as CLI routing and formatting facades, while core business logic is testable, reusable across features (e.g., dashboard, API, and different commands), and decoupled.

---

## Exact Scope

### What This Priority Delivers

1. **Service Layer Extraction**
   - Identify modules in `src/cli/commands/` and `src/cli/index.js` that contain heavy business logic, state mutation, or complex aggregation.
   - Extract these operations into specialized service modules within `src/cli/services/`.

2. **Thin Command Facades**
   - Refactor command handlers to depend on the newly created runtime services.
   - Command handlers should only be responsible for: reading arguments/flags, calling the appropriate service, and formatting the output (text or JSON) for the user.

3. **Direct Service Integration Tests**
   - Ensure integration tests exercise both the CLI facades and the underlying services directly to guarantee stability and prevent regressions.

---

## Expected Outcomes

After this priority is done:

- [ ] `src/cli/commands/*.js` files are lean and contain mostly argument parsing and output formatting.
- [ ] `src/cli/services/*.js` contains reusable logic that does not depend on CLI printing (`console.log`) or raw argument arrays.
- [ ] Other internal components (like the Dashboard API) can safely import and use the services without invoking the CLI router.
- [ ] All impacted surfaces are updated: runtime state files remain consistent, CLI behavior is untouched.
- [ ] `npm test` passes completely and `kvdf conflict scan` shows no drift.

---

## What Must NOT Change

1. **CLI Command Signatures and Output**
   - User-facing commands, flags, and text/JSON outputs must remain perfectly backward compatible.
   
2. **Schema and Runtime State Shapes**
   - This is purely an architectural refactoring of the TypeScript/JavaScript logic. The structure of `.kabeeri/*.json` state files and their schemas must not change.

3. **Evolution Priorities and Task Scope**
   - The refactoring must remain strictly within the boundaries of existing capabilities; no new product features should be introduced during this migration.

---

## Success Criteria

The Owner can confirm this priority is done when:

1. **Codebase**: Reusable logic currently mixed in `src/cli/commands/` is successfully relocated to `src/cli/services/`.
2. **CLI Surface**: CLI commands function exactly as before.
3. **Tests**: `npm test` passes completely, maintaining existing coverage.
4. **Integration**: No cyclic dependencies are introduced between commands and services.

---

## Files That Must Move Together

| Tier | Files | Reason |
|------|-------|--------|
| **Implementation** | `src/cli/commands/*.js` | Command handlers acting as facades |
| **Services** | `src/cli/services/*.js` | New home for reusable business logic |
| **Routing** | `src/cli/index.js` | Main CLI router adjusting to new facade signatures |
| **Tests** | `tests/cli.integration.test.js` | Integration coverage for CLI and services |
| **Reports** | `docs/reports/EVO_AUTO_004_DEPENDENCY_MAP.md` | Dependency tracking for the migration |

---

## Slice Handoff Notes

This Scope Statement completes **Slice 1: Lock full task coverage for Runtime services layer**. 

**Next Slice (Slice 2): Map every dependent surface** will:
- Complete the detailed file mapping in `EVO_AUTO_004_DEPENDENCY_MAP.md`.
- Identify the exact list of command handlers slated for extraction.

## Sync Checkpoint

The sync slice for `evo-auto-004` now has a visible documentation trail in the
owner checkpoint, capability reference, and command reference. The shared
runtime services layer is the active implementation target, and the next step is
validation before the queue is closed.
