# Implementation Plan

This plan is intentionally non-mutating. It defines the recommended order for future implementation after the current reports are reviewed.

## Guiding Rules

- `.kabeeri/` remains source of truth.
- CLI is an engine, not the only user experience.
- VS Code, Dashboard, Docs Site, and future UI layers are views or interaction surfaces.
- No GitHub mutation without explicit Owner approval.
- No implementation from raw design image/PDF/link without approved text specs.
- Every phase ends with a report and test/validation summary.

## Recommended Branch and Safety Step

Before implementation:

1. Create or switch to a feature branch such as `chore/deep-production-readiness`.
2. Preserve current dirty working tree.
3. Create:
   - `docs/reports/EXECUTION_SESSION_LOG.md`
   - `docs/reports/REPO_MUTATION_POLICY.md`
   - `docs/reports/SAFE_RUN_DECISION.md`

## Phase Plan

### Phase 00: Safety and Baseline

Goal: prevent accidental overwrites.

Tasks:

- Record git status.
- Confirm branch policy.
- Record mutation policy.
- Run baseline validation and tests if Owner approves.

Outputs:

- execution session log
- mutation policy
- baseline test report

### Phase 01: v1 Stabilization Audit and Fix Plan

Goal: make v1 public foundation coherent before layering more concepts.

Tasks:

- Audit README/README_AR.
- Compare `docs/ar` and `docs/en` parity.
- Audit prompt packs and generator docs.
- Audit questionnaire examples.
- Audit examples and acceptance checklists.

Outputs:

- `V1_STABLE_FOUNDATION_AUDIT.md`
- `V1_FIX_PLAN.md`

### Phase 02: v1 Safe Fixes

Goal: apply only safe documentation/index fixes.

Tasks:

- Fix broken/outdated references.
- Add missing indexes.
- Add cross-links without changing philosophy.

Outputs:

- `V1_STABILIZATION_REPORT.md`

### Phase 03: v2 Foundations Completion

Goal: complete delivery modes, intake, task governance, Agile templates, and AI usage foundations.

Tasks:

- Reconcile `task_tracking/` and `task_governance/`.
- Add missing Agile templates.
- Add missing AI usage schemas/examples.
- Ensure task provenance docs match runtime.

Outputs:

- v2 implementation report
- updated traceability rows

### Phase 04: v3 Platform Spec Completion

Goal: align runtime CLI with formal platform specs.

Tasks:

- Add `.kabeeri/*.example` files.
- Add `github_sync/`, `dashboard/`, and `vscode_extension/` docs if required.
- Confirm dashboard is derived state.
- Confirm Owner verify policy docs match runtime.

Outputs:

- v3 implementation report

### Phase 05: v4 Governance Spec Completion

Goal: complete Multi-AI governance docs/examples around existing runtime.

Tasks:

- Decide whether to create `governance/` mirror folder or keep `multi_ai_governance/`.
- Add missing examples for developers, agents, locks, and access tokens.
- Document reviewer independence, token budgets, and verify/revocation audit.

Outputs:

- v4 implementation report

### Phase 06: v5 Trust Layer Completion

Goal: finish v5 beyond the implemented questionnaire/capability/memory slice.

Tasks:

- Add ADR template.
- Add AI run history docs and runtime plan.
- Add policy examples and policy evaluation plan.
- Add security/secrets/privacy docs.
- Add handoff templates.
- Add migration/rollback templates.

Outputs:

- v5 implementation report

### Phase 07: AI Cost Control Layer

Goal: reduce AI/Codex cost and prevent waste.

Tasks:

- Add `ai_cost_control/`.
- Define low-cost mode, task context packs, preflight estimates, model routing, random usage reports.
- Add schemas/examples under `.kabeeri/ai_usage`.

Outputs:

- cost control implementation report

### Phase 08: v6 Vibe-First UX

Goal: make Kabeeri usable through human-friendly surfaces.

Tasks:

- Create `vibe_ux/`.
- Define interaction surfaces and chat model.
- Define natural-language task cards, vague request detection, post-work capture.
- Add `.kabeeri/interactions` examples.

Outputs:

- v6 implementation report

### Phase 09: v7 Design Source Governance

Goal: prevent unsafe frontend execution from unapproved design sources.

Tasks:

- Create `design_sources/`, `design_system/`, `frontend_specs/`.
- Add design source intake, snapshot, extraction modes, page spec, component contract, design tokens, UI acceptance checklist.
- Add Codex frontend task prompt template.

Outputs:

- v7 implementation report

### Phase 10: Static Documentation Site

Goal: create local bilingual docs website.

Tasks:

- Build `docs_site/` with HTML/CSS/JS only.
- Add AR/EN pages.
- Add responsive sidebar, language switcher, local filter/search.

Outputs:

- docs site report

### Phase 11: GitHub Import and Release Readiness

Goal: prepare GitHub without mutating it.

Tasks:

- Create `github/labels.json`.
- Create milestones and issues backlog markdown.
- Create import instructions.
- Create final release preparation checklist and publishing guide.

Outputs:

- GitHub import package
- final validation report

### Phase 12: Final QA and Publish Decision

Goal: decide readiness.

Tasks:

- Verify all required folders exist or are intentionally deferred.
- Run tests/validation.
- Check docs links.
- Check no secrets in examples.
- Confirm Owner-only verification and design governance.

Outputs:

- `FINAL_DEEP_QA_REPORT.md`
- `OPEN_BLOCKERS.md`
- `PUBLISH_DECISION.md`

## Immediate Next Recommended Action

Do not implement code yet. Review these reports, then approve Phase 00 safety/session setup.

