# GitHub Issues Backlog

This backlog is safe to import manually or through `gh` after explicit Owner approval. It does not mutate GitHub.

## Issue Body Template

```markdown
## Source / Version

Source:
Version:

## Scope

- 

## Acceptance Criteria

- 

## Owner Verify

Required before closing: yes/no

## Cost / Design / Security Notes

- Cost:
- Design:
- Security:
```

## Import Batches

### Batch 1: v3 Platform Integration

Source: `platform_integration/milestones_and_issues.v3.0.0.json`

For each issue in this JSON source:

- title: use the issue `title`
- labels: use issue `labels` plus `github` when importing
- milestone: nearest v3 milestone title
- source/version: `v3 platform integration`
- scope: use milestone goal and issue title
- acceptance criteria: issue must have docs/spec/example/code path in repo and pass `node bin/kvdf.js validate`
- owner verify: required before milestone closure
- cost/design/security notes: include AI token cost notes for dashboard/cost issues, security notes for Owner verify and GitHub mutation issues

### Batch 2: v4 Multi-AI Governance

Source: `multi_ai_governance/milestones_and_issues.v4.0.0.json`

For each issue in this JSON source:

- title: use the issue `title`
- labels: use issue `labels`
- milestone: nearest v4 milestone title
- source/version: `v4 multi-AI governance`
- scope: roles, permissions, tokens, locks, assignment, sessions, budgets, or verify/audit as applicable
- acceptance criteria: matching governance spec exists and local tests pass
- owner verify: required for role, token, lock, budget, transfer, and verify issues
- cost/design/security notes: task access tokens are permission tokens; AI usage tokens are cost records; real secrets must not be committed

### Batch 3: v5 Project Intelligence And Trust Layer

Source: `project_intelligence/milestones_and_issues.v5.0.0.json`

For each issue in this JSON source:

- title: use the issue `title`
- labels: use issue `labels` or add `docs`, `ai-usage`, `security`, `acceptance`, or `task-governance` as appropriate
- milestone: nearest v5 milestone title
- source/version: `v5 project intelligence`
- scope: questionnaire, capability map, memory, AI run history, policy, migration, security, or handoff
- acceptance criteria: spec/template/example exists and is linked to `.kabeeri` source-of-truth model
- owner verify: required before release closure and for high-impact policy/security/migration work
- cost/design/security notes: include AI run waste visibility, secrets/privacy rules, and handoff readiness where applicable

## Phase Completion Issues

### Issue: Complete v6 Vibe-First Interaction Layer

Labels: `vibe-ux`, `natural-language`, `post-work-capture`, `docs`, `priority-high`

Milestone: `v6.0.0 - Vibe-First Interaction Layer`

Source/version: v6 roadmap source and `docs/reports/V6_VIBE_UX_IMPLEMENTATION_REPORT.md`

Scope:

- Create `vibe_ux/` as the human-first interaction layer.
- Add CLI-as-engine, interaction surfaces, chat model, natural-language task creation, suggested task cards, vague request detection, workstream detection, post-work capture, command abstraction, interaction modes, and UX friction rules.
- Add `.kabeeri/interactions` examples.

Acceptance criteria:

- Required v6 files exist.
- Interaction JSON/JSONL examples validate.
- `node bin/kvdf.js validate` passes.
- `npm test` passes.

Owner verify: required before claiming v6 complete.

Cost/design/security notes:

- Budget warnings and cost-aware flows must remain visible.
- UI surfaces must not bypass Owner verification.

### Issue: Complete v7 Design Source Governance

Labels: `design-governance`, `frontend`, `acceptance`, `docs`, `priority-high`

Milestone: `v7.0.0 - Design Source Governance`

Source/version: v7 roadmap source and `docs/reports/V7_DESIGN_SOURCE_GOVERNANCE_IMPLEMENTATION_REPORT.md`

Scope:

- Create `design_sources/`, `design_system/`, and `frontend_specs/`.
- Add design source intake, snapshot, extraction modes, no-copy rules, reference website inspiration rules, design tokens, brand template, component rules, UI acceptance, page spec, and component contract templates.
- Add Codex frontend prompt template.

Acceptance criteria:

- Required v7 files exist.
- `design_system/DESIGN_TOKENS_TEMPLATE.json` validates.
- `node bin/kvdf.js validate` passes.
- `npm test` passes.

Owner verify: required before frontend implementation from design sources is allowed.

Cost/design/security notes:

- Raw images, PDFs, links, and reference websites are not implementation specs.
- Reference websites are inspiration only and must not be copied.

### Issue: Complete Bilingual Static Documentation Site

Labels: `docs`, `dashboard`, `acceptance`, `priority-high`

Milestone: `v1.0.0 - Production Documentation and Publish Readiness`

Source/version: docs-site phase and `docs/reports/DOCS_SITE_IMPLEMENTATION_REPORT.md`

Scope:

- Create static `docs_site/` with HTML, CSS, and JavaScript only.
- Add Arabic and English pages for onboarding, delivery modes, questionnaires, task governance, dashboard, Owner verify, cost control, Multi-AI, Vibe UX, design governance, production/publish, and troubleshooting.

Acceptance criteria:

- 16 English and 16 Arabic page files exist.
- Language switcher, sidebar navigation, local filter, responsive layout, and RTL support exist.
- JavaScript syntax check passes.
- `node bin/kvdf.js validate` passes.
- `npm test` passes.

Owner verify: required before public documentation release.

Cost/design/security notes:

- Documentation site is static and has no backend.
- Publish requires Owner approval.

