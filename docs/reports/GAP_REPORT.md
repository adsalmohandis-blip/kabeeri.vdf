# Gap Report

This report identifies gaps between roadmap sources v1-v7 and the current repository state. It does not apply fixes.

## Executive Summary

The repository has a strong foundation for v1-v5 and a working CLI engine, but it is not yet complete against the full DEEP roadmap.

Primary gaps:

1. v6 vibe-first interaction layer is not implemented as its own documented layer.
2. v7 design source governance is missing.
3. Static bilingual documentation website is missing.
4. GitHub import/backlog files are missing.
5. Some existing areas are partial and need consolidation, especially task governance and docs.
6. v5 policy/security/handoff/ADR details are only partially present.

## Critical Gaps

| Gap ID | Area | Source | Current State | Risk | Recommended Action |
| --- | --- | --- | --- | --- | --- |
| GAP-001 | Dirty working tree | Cross-cutting | Many modified/untracked files exist. | High risk of overwriting prior work. | Create safe branch/session policy before implementation. |
| GAP-002 | v6 Vibe UX | v6 | No `vibe_ux/` folder found. | CLI remains primary interface, contrary to v6. | Create v6 docs/spec layer before code changes. |
| GAP-003 | v7 Design Governance | v7 | No `design_sources/`, `design_system/`, or `frontend_specs/`. | Frontend work may be driven from raw images/PDFs/links. | Implement design source governance docs/templates. |
| GAP-004 | Docs website | v1/v6/v7 cross-cutting | No `docs_site/`. | Project is harder to onboard and publish. | Build static AR/EN docs site after reports. |
| GAP-005 | GitHub import package | Phase 13 | No `github/labels.json`, `github/issues_backlog.md`, import guide. | Manual GitHub setup likely inconsistent. | Prepare import files, do not mutate GitHub without Owner approval. |

## Major Partial Areas

| Gap ID | Area | Current Assets | Missing or Partial |
| --- | --- | --- | --- |
| GAP-006 | v1 docs parity | `docs/ar` has 20 files; `docs/en` has 5 files. | English coverage appears much smaller than Arabic. |
| GAP-007 | Task governance duplication | `task_tracking/` and `task_governance/` both exist. | Need source-of-truth consolidation and cross-links. |
| GAP-008 | Agile delivery | `agile_delivery/README.md`, `SPRINT_AND_BACKLOG_CORE.md`. | Specific backlog/epic/story/sprint planning/review templates requested by v2 are not obvious. |
| GAP-009 | v3 specs | `platform_integration/` exists; runtime CLI exists. | Separate `github_sync/`, `dashboard/`, `vscode_extension/` spec folders from DEEP commands are not present. |
| GAP-010 | v4 governance | `multi_ai_governance/` exists; CLI supports many flows. | DEEP command expects `governance/` folder and `.kabeeri/*.example` files. |
| GAP-011 | v5 policy engine | `.kabeeri/policies` is runtime-created by init; docs minimal. | Policy evaluation commands and example policies are missing. |
| GAP-012 | v5 security | No committed `.kabeeri/security` docs/templates in repo. | Secrets/privacy/security readiness docs missing. |
| GAP-013 | v5 handoff | No committed handoff templates found. | Client handoff package template missing. |
| GAP-014 | v5 ADR | Runtime init creates ADR folder in workspaces. | Repo-level ADR template is missing. |
| GAP-015 | AI cost control layer | AI usage runtime exists. | Dedicated `ai_cost_control/` low-cost mode layer missing. |

## Runtime Gaps

| Gap ID | Area | Status |
| --- | --- | --- |
| GAP-016 | Policy command | No `kvdf policy` command observed. |
| GAP-017 | Migration command | No `kvdf migrate` command observed. |
| GAP-018 | Post-work capture command | No `kvdf capture` or equivalent observed. |
| GAP-019 | Natural-language task command | No `kvdf ask` or intent classifier command observed. |
| GAP-020 | Design-source command | No `kvdf design` or design intake command observed. |
| GAP-021 | Handoff command | No `kvdf handoff` command observed. |
| GAP-022 | Docs site run command | No docs site exists yet. |

## Deferred / Owner Decision Items

- Whether v2/v3/v4/v5 docs should remain in their current folders or be mirrored into the DEEP command folder names.
- Whether to preserve both `task_tracking/` and `task_governance/` or merge one into the other.
- Whether v6/v7 should be documentation-only first or include CLI commands in the same phase.
- Whether to create GitHub issues from machine-readable plans now or wait for Owner approval.

## No-Go Items Before Implementation

- Do not push to main.
- Do not run `gh` confirmed write commands.
- Do not delete/rename existing folders during consolidation without a migration plan.
- Do not implement frontend from raw images/PDFs/links without v7 text specs.
- Do not treat dashboard/VS Code as source of truth.

