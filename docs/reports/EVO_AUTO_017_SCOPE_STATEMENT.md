# evo-auto-017-multi-ai-governance: Scope Statement

**Priority ID:** `evo-auto-017-multi-ai-governance`  
**Title:** Multi-AI governance with Leader orchestration and Merger layer  
**Status:** `in_progress`  
**Date:** 2026-05-11

---

## Executive Summary

This priority enhances Kabeeri's Multi-AI Governance system to ensure multiple AI tools can work safely on the framework without file conflicts, priority chaos, or lost session state across devices. Evolution remains the priority governor, the first AI becomes the Leader, and execution is delegated only when the Owner approves.

---

## Exact Scope

### What This Priority Delivers

1. **Multi-AI Governance Runtime is Complete**
   - `.kabeeri/multi_ai_governance.json` records and validates all Leader sessions, Worker queues, and Merge bundles
   - `kvdf multi-ai` commands (status, leader, queue, merge, sync) implement the full governance surface
   - Schema covers all runtime state requirements

2. **Leader Orchestration is Wired**
   - The first AI that enters a session becomes the Leader automatically
   - Leader coordinates per-AI temporary queues tied to the current Evolution priority
   - Leader can distribute slices to Worker AIs when Owner approves
   - Leader status report shows the current Evolution temporary slice so Worker AIs know what to do

3. **Merger Layer Ensures Safety**
   - Worker AIs can commit patch bundles or semantic file sections
   - Merge bundles are previewed before commit (no blind paste)
   - Each bundle records provenance: source AI ids, contributor overlaps, target files, semantic surface plan
   - Merge is validated before the result is considered usable

4. **Cross-Device Continuity is Enforced**
   - State is repo-backed, not chat-memory-dependent
   - Another AI or another machine can resume from `.kabeeri/multi_ai_governance.json` without losing priority, queue, or merge history
   - Session transfer is explicit, not automatic

5. **Integration with Evolution is Complete**
   - Multi-AI governance respects Evolution as the priority governor
   - When Evolution moves to a new priority, Worker queues and temporary slices expire automatically
   - Current temporary slice is always visible to all participants

---

## Expected Outcomes

After this priority is done:

- [ ] Owner can run `kvdf multi-ai status` and see the active Leader, current queues, and merge bundles
- [ ] Owner can read a short summary of the current Evolution temporary slice instead of guessing what AI work is active
- [ ] Worker AI tools can pull queued slices and work safely without coordination overhead
- [ ] Merge bundles can be previewed, validated, and committed with auditable provenance
- [ ] Cross-device work is possible: stop on Device A, continue on Device B using the same `.kabeeri/multi_ai_governance.json`
- [ ] All impacted surfaces are updated: runtime, CLI, schemas, docs, capabilities reference, tests, changelog
- [ ] `npm test` passes and `kvdf conflict scan` shows no drift

---

## What Must NOT Change

1. **Evolution remains the global priority governor**
   - Multi-AI governance does NOT override Evolution priorities
   - Multi-AI work is always tied to the current Evolution priority
   - Worker queues expire when Evolution moves, not preserved across priorities

2. **Owner remains the final authority**
   - Execution delegation requires explicit Owner approval
   - Risky or high-impact work requires Owner verification
   - Leader cannot auto-escalate or auto-delegate

3. **Task governance is not bypassed**
   - Multi-AI work must still create or reference tasks in `.kabeeri/tasks.json`
   - Task provenance, acceptance criteria, and scope are not overridden
   - Worker queues are operational slices, not task replacements

4. **Framework boundaries are maintained**
   - User app workspaces cannot accidentally record framework-internal work as app work
   - Multi-AI governance scope enforcement is applied to workspace boundaries

5. **Existing CLI and runtime are not refactored**
   - This priority does not trigger broad CLI modularization
   - This priority does not rename or move existing `kvdf` commands
   - This priority builds on the existing multi_ai_governance command module

---

## Success Criteria

The Owner can confirm this priority is done when:

1. **Runtime**: `kvdf multi-ai status` shows all active Leader and Worker sessions with current Evolution slice
2. **CLI Surface**: All commands are documented in `cli/CLI_COMMAND_REFERENCE.md` with examples
3. **Schemas**: `.kabeeri/multi_ai_governance.json` validates against the schema
4. **Docs**: `knowledge/governance/MULTI_AI_GOVERNANCE.md` fully describes the system, rules, and workflows
5. **Capabilities**: `docs/SYSTEM_CAPABILITIES_REFERENCE.md` lists Multi-AI governance with accurate coverage
6. **Tests**: `npm test` passes with integration coverage for Leader, queue, and merge operations
7. **Integration**: `kvdf evolution temp` correctly shows the current slice to inform Worker queue work
8. **Changelog**: `CHANGELOG.md` records the enhancements and wiring improvements
9. **Owner State**: `OWNER_DEVELOPMENT_STATE.md` is updated with notes for next session continuation

---

## Files That Must Move Together

| Tier | Files | Reason |
|------|-------|--------|
| **Runtime** | `.kabeeri/multi_ai_governance.json` | Source of truth for all Multi-AI state |
| **Implementation** | `src/cli/commands/multi_ai_governance.js` | Command handler for all `kvdf multi-ai` operations |
| **Validation** | `schemas/runtime/multi-ai-governance-state.schema.json` | Schema coverage for runtime state |
| **Docs** | `knowledge/governance/MULTI_AI_GOVERNANCE.md` | Canonical governance specification |
| **CLI Reference** | `cli/CLI_COMMAND_REFERENCE.md` | Command documentation and examples |
| **Capabilities** | `docs/SYSTEM_CAPABILITIES_REFERENCE.md` | Capability map listing |
| **Tests** | `tests/cli.integration.test.js` | Integration coverage for new/changed behavior |
| **Changelog** | `CHANGELOG.md` | Change history for release notes |
| **Owner State** | `OWNER_DEVELOPMENT_STATE.md` | Continuation checkpoint for next session |
| **Evolution State** | `.kabeeri/evolution.json` | Priority tracking and temporary queue wiring |

---

## Do Not Start Implementation Until

1. Owner confirms this scope statement is complete and correct
2. Evo temp slice guidance is clear: what slices depend on which changed files
3. Integration points with Evolution are verified (no circular dependencies)
4. Test strategy for merge preview/validation is defined

---

## Slice Handoff Notes

This Scope Statement completes **Slice 1: Lock scope**. 

**Next Slice (Slice 2): Map dependent surfaces** will:
- Identify which files must change to deliver this scope
- Document file dependencies to prevent partial updates
- Create a checklist of surfaces that must move together

**Slice 3: Implement** will:
- Make the smallest coherent code changes to deliver the scope
- Wire up Evolution integration points
- Ensure state is repo-backed and cross-device safe

