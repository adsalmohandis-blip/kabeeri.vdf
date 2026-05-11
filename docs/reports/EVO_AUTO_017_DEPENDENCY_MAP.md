# evo-auto-017: Dependent Surfaces Map

**Slice:** 2 of 5 - Map dependent surfaces  
**Status:** `active`  
**Created:** 2026-05-11

---

## Overview

This slice identifies all files, runtime state, schemas, docs, tests, and reports that must move together to deliver Multi-AI governance enhancements. Each surface is mapped to verify nothing is forgotten and to detect premature partial changes.

---

## Dependency Matrix

### Tier 1: Foundation (Must Change)

| Surface | Files | Current Status | Change Required | Why |
|---------|-------|-----------------|-----------------|-----|
| **Runtime State** | `.kabeeri/multi_ai_governance.json` | ✅ Exists | Validate structure, add schema coverage note | Source of truth for all Leader/Worker/Merge data |
| **Evolution Wiring** | `.kabeeri/evolution.json` | ✅ Exists | Link to temp queue, current slice visibility | Evolution temporary queue must be accessible from Multi-AI context |
| **Master Schema** | `schemas/runtime/multi-ai-governance-state.schema.json` | ✅ Exists | Verify coverage, add missing properties | Validates all runtime state changes |
| **Implementation** | `src/cli/commands/multi_ai_governance.js` | ✅ Exists, 1391 LOC | Audit exports, verify all command handlers | Command routing for `kvdf multi-ai *` |

### Tier 2: CLI Integration (Must Change)

| Surface | Files | Current Status | Change Required | Why |
|---------|-------|-----------------|-----------------|-----|
| **CLI Router** | `src/cli/index.js` | ✅ Routed | Verify multi_ai_governance module is wired | Main entry point must route to multi-ai handlers |
| **CLI Help** | `src/cli/ui.js` | ✅ Exists | Add help text for multi-ai commands | User-facing documentation in CLI |
| **CLI Reference Docs** | `cli/CLI_COMMAND_REFERENCE.md` | ⚠️ Partial | Complete all multi-ai commands with examples | Canonical CLI reference for developers |

### Tier 3: Governance & Documentation (Must Change)

| Surface | Files | Current Status | Change Required | Why |
|---------|-------|-----------------|-----------------|-----|
| **Governance Spec** | `knowledge/governance/MULTI_AI_GOVERNANCE.md` | ✅ Exists | Cross-check with runtime, add session rules | Canonical governance specification |
| **Governance README** | `knowledge/governance/README.md` | ⚠️ Outdated | Mention Multi-AI governance as key system | Overview of all governance layers |
| **Evolution Steward** | `knowledge/governance/EVOLUTION_STEWARD.md` | ⚠️ Needs update | Link Multi-AI governance to Evolution rules | Shows how Multi-AI respects Evolution |

### Tier 4: Capability Map (Must Change)

| Surface | Files | Current Status | Change Required | Why |
|---------|-------|-----------------|-----------------|-----|
| **Capabilities Reference** | `docs/SYSTEM_CAPABILITIES_REFERENCE.md` | ⚠️ Partial | Update Multi-AI entry, verify accuracy | Central map of all framework capabilities |
| **Docs Site App JS** | `docs/site/assets/js/app.js` | ⚠️ Possible | Check if Multi-AI is listed in capability pages | Web-based capability browser |

### Tier 5: Validation & Tests (Must Change)

| Surface | Files | Current Status | Change Required | Why |
|---------|-------|-----------------|-----------------|-----|
| **Runtime Schema Registry** | `schemas/runtime/schema_registry.json` | ⚠️ May need update | Verify multi-ai-governance-state is registered | Schema coverage tracking |
| **Schema Validation** | `src/cli/validate.js` | ⚠️ Needs audit | Ensure `kvdf validate runtime-schemas` covers Multi-AI state | Validation coverage |
| **Integration Tests** | `tests/cli.integration.test.js` | ⚠️ Partial | Add tests for Leader election, queue ops, merge preview | Automated coverage for new/changed behavior |
| **Test Smoke Commands** | `package.json` scripts | ✅ Exists | Verify test suite still passes | Regression detection |

### Tier 6: Release & Handoff (Should Change)

| Surface | Files | Current Status | Change Required | Why |
|---------|-------|-----------------|-----------------|-----|
| **Changelog** | `CHANGELOG.md` | ✅ Exists | Add entry for Multi-AI enhancement | Release notes and version history |
| **Owner State** | `OWNER_DEVELOPMENT_STATE.md` | ✅ Exists | Update Last Session Notes for next resume | Continuation checkpoint |
| **Release Checklist** | `docs/production/RELEASE_CHECKLIST.md` | ⚠️ May need update | Verify Multi-AI governance is release-ready | Pre-publication gate |

---

## File Dependencies Visualization

```
Evolution (.kabeeri/evolution.json)
    ↓ sync ↓ temporary queue visible to Multi-AI
Multi-AI Runtime (.kabeeri/multi_ai_governance.json)
    ↓
CLI Implementation (src/cli/commands/multi_ai_governance.js)
    ↓ routes via ↓
CLI Router (src/cli/index.js) 
    ↓
CLI Help (src/cli/ui.js) → CLI Reference (cli/CLI_COMMAND_REFERENCE.md)

Schema Validation:
    schemas/runtime/multi-ai-governance-state.schema.json
    ↓ registered in ↓
    schemas/runtime/schema_registry.json
    ↓ enforced by ↓
    src/cli/validate.js (kvdf validate runtime-schemas)

Documentation:
    knowledge/governance/MULTI_AI_GOVERNANCE.md
    ↓ referenced by ↓
    knowledge/governance/EVOLUTION_STEWARD.md
    ↓ linked from ↓
    knowledge/governance/README.md
    ↓ summarized in ↓
    docs/SYSTEM_CAPABILITIES_REFERENCE.md

Testing:
    tests/cli.integration.test.js
    ↓ calls ↓
    npm test (all tests must pass)

Handoff:
    CHANGELOG.md
    + OWNER_DEVELOPMENT_STATE.md
    = Session continuation ready
```

---

## Checklist: No Partial Updates

Before implementation (Slice 3) starts, **confirm all these are true**:

### Foundation
- [ ] `.kabeeri/multi_ai_governance.json` schema is verified as complete
- [ ] `.kabeeri/evolution.json` has the current temporary queue visible
- [ ] `schemas/runtime/multi-ai-governance-state.schema.json` covers all properties
- [ ] `src/cli/commands/multi_ai_governance.js` exports are clean

### CLI
- [ ] `src/cli/index.js` routes `multi-ai` to the command handler
- [ ] `src/cli/ui.js` has help strings for all multi-ai subcommands
- [ ] `cli/CLI_COMMAND_REFERENCE.md` has entry stubs for all commands

### Governance
- [ ] `knowledge/governance/MULTI_AI_GOVERNANCE.md` matches runtime behavior
- [ ] `knowledge/governance/EVOLUTION_STEWARD.md` explains Multi-AI + Evolution relationship
- [ ] `knowledge/governance/README.md` mentions Multi-AI governance

### Capabilities
- [ ] `docs/SYSTEM_CAPABILITIES_REFERENCE.md` Multi-AI entry is accurate
- [ ] Docs site (if auto-generated) can list the capability

### Validation
- [ ] `schemas/runtime/schema_registry.json` includes multi-ai-governance-state entry
- [ ] `src/cli/validate.js` can validate Multi-AI state
- [ ] `tests/cli.integration.test.js` has test stubs for new commands

### Release
- [ ] `CHANGELOG.md` will be updated when Slice 3 completes
- [ ] `OWNER_DEVELOPMENT_STATE.md` will be updated at session end

---

## Files to Review & Audit

**Do this now (Slice 2 work)**:

1. Open `src/cli/commands/multi_ai_governance.js` (1391 LOC)
   - Verify all exported functions match command handlers
   - Check for orphaned or incomplete handlers

2. Check `cli/CLI_COMMAND_REFERENCE.md`
   - Look for Multi-AI command stubs
   - Verify examples are accurate

3. Scan `schemas/runtime/schema_registry.json`
   - Confirm multi-ai-governance-state is registered
   - Check for missing schema mappings

4. Verify `.kabeeri/multi_ai_governance.json` runtime state
   - Run `kvdf multi-ai status` and check output format
   - Confirm all required fields are present

---

## Slice 2 Completion Criteria

**This slice is done when:**

- [ ] All files above are audited for gaps or outdated sections
- [ ] No contradictions exist between runtime, CLI, docs, schemas, and tests
- [ ] A clear list of "must change" files is created for Slice 3
- [ ] Owner agrees this map is complete and accurate
- [ ] Next slice (Implementation) has a clear target set

---

## Notes for Slice 3 (Implementation)

Based on this map, Slice 3 must ensure:

1. All files in **Tier 1 & 2** are updated together (blocking)
2. All files in **Tier 3 & 4** are updated before release (high priority)
3. All files in **Tier 5** are audited and tested (quality gate)
4. All files in **Tier 6** are updated at session end (housekeeping)

No implementation should proceed until this map is reviewed and Owner-confirmed.

