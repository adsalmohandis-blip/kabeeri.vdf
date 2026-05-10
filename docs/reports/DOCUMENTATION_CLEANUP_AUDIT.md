# Documentation Cleanup Audit

Date: 2026-05-09

## Purpose

This audit identifies Kabeeri VDF documents that are duplicated, obsolete,
historical, misleading, or no longer useful for the current product direction.

It does not delete files by itself. It gives a cleanup plan for Owner review.

## Current Canonical References

The following documents should be treated as the current navigation layer:

- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `cli/CLI_COMMAND_REFERENCE.md`
- `governance/README.md`
- `vibe_ux/VIBE_FIRST_RUNTIME.md`
- `dashboard/LIVE_DASHBOARD_RUNTIME.md`
- `governance/APP_BOUNDARY_GOVERNANCE.md`
- `governance/WORKSTREAM_GOVERNANCE.md`
- `governance/EXECUTION_SCOPE_GOVERNANCE.md`
- `docs/internal/AI_DEVELOPMENT_WORKFLOW.md`
- `OWNER_DEVELOPMENT_STATE.md`
- `docs/reports/CURRENT_REPOSITORY_ANALYSIS.md`
- `docs/reports/GAP_REPORT.md`
- `docs/reports/IMPLEMENTATION_PLAN.md`
- `docs/reports/MISSING_REQUIREMENTS_BACKLOG.md`

## Completed Deletions

The following high-confidence cleanup candidates were deleted after Owner
review:

- `docs/reports/CODEX_COMMAND_PACK_COMPLETION_REPORT.md`
- `docs/reports/ROADMAP_INGESTION_COMPLETION_REPORT.md`
- `docs/reports/PHASE_01_ROADMAP_SOURCE_INGESTION_REPORT.md`
- `docs/reports/PHASE_02_REQUIREMENTS_TRACEABILITY_REPORT.md`
- `docs/reports/PHASE_03_CURRENT_REPOSITORY_SCAN_REPORT.md`
- `docs/reports/DOCUMENTATION_SITE_DEEP_COMMAND_REPORT.md`
- `docs/reports/OPEN_BLOCKERS.md`
- `docs/reports/PUBLISH_DECISION.md`
- `docs/reports/FINAL_DEEP_QA_REPORT.md`
- `docs/reports/FINAL_VALIDATION_REPORT.md`

## High Confidence Cleanup Candidates

These files or groups are no longer useful as active product documentation.
They are safe cleanup candidates after Owner review.

| Path | Problem | Recommendation |
| --- | --- | --- |

## Misleading Or Stale Reports

These files were stale before the 2026-05-09 report refresh. Current status:

| Path | Problem | Recommendation |
| --- | --- | --- |
| `docs/reports/MISSING_REQUIREMENTS_BACKLOG.md` | Previously contained a stale 143-item missing backlog. | Refreshed to active backlog groups only. |
| `docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md` | Row-level matrix is historical and too large to fully reclassify in-place. | Current overlay refreshed; old rows retained for traceability. |
| `docs/reports/IMPLEMENTATION_PLAN.md` | Previously contained old phase plan. | Replaced with current forward plan. |
| `docs/reports/CURRENT_REPOSITORY_ANALYSIS.md` | Previously mentioned missing Vibe/design/docs-site areas. | Replaced with current runtime analysis. |
| `docs/reports/GAP_REPORT.md` | Previously mixed stale and current gap lines. | Replaced with active gaps only. |
| `docs/reports/PHASE_TASK_BREAKDOWN.md` | Historical rows still preserve old statuses. | Current overlay added; old rows retained for traceability. |

## Duplicate Or Overlapping Documentation

These are not always safe to delete immediately. They should be consolidated
carefully because some are planning sources and others are runtime docs.

### Task Governance Duplication

| Active Runtime / Format | Overlapping Policy Docs | Decision |
| --- | --- | --- |
| historical `task_tracking/TASK_CREATION_RULES.md` | historical `task_governance/TASK_CREATION_RULES.md` | Completed: strict policy moved to `knowledge/task_tracking/TASK_GOVERNANCE.md`; old duplicate file deleted. |
| historical `task_tracking/TASK_DEFINITION_OF_READY.md` | historical `task_governance/TASK_DEFINITION_OF_READY.md` | Completed: canonical readiness policy moved to `knowledge/task_tracking/TASK_GOVERNANCE.md`; old duplicate file deleted. |
| `knowledge/task_tracking/TASK_INTAKE_TEMPLATE.md` | historical `task_governance/TASK_INTAKE_TEMPLATE.md` | Completed: practical template remains in `knowledge/task_tracking/`; old duplicate deleted. |
| historical `task_tracking/TASK_SOURCE_RULES.md` | historical `task_governance/TASK_SOURCE_RULES.md` | Completed: source/provenance policy moved to `knowledge/task_tracking/TASK_GOVERNANCE.md`; old duplicate file deleted. |

Result:

- `knowledge/task_tracking/` is now the unified format, schema, provenance, template, and task policy home.
- `knowledge/task_tracking/TASK_GOVERNANCE.md` is the canonical task policy.
- Historical `task_governance/` has been removed after references were migrated.

### AI Cost Duplication

| Path | Problem | Recommendation |
| --- | --- | --- |
| `ai_usage/README.md` | Older long-form AI usage documentation; overlapped with `ai_cost_control/` and runtime CLI cost commands. | Completed: useful accounting details merged into `ai_cost_control/README.md`; old file deleted. |
| `ai_cost_control/TOKEN_BUDGET_RULES.md` | Overlapped with `governance/TOKEN_BUDGET_RULES.md`. | Completed: governance rules now live in `governance/TOKEN_BUDGET_RULES.md`; cost-control file is a pointer. |

### v3/v4 Planning Duplication

| Planning Source | Current Runtime / Canonical Replacement | Recommendation |
| --- | --- | --- |
| `platform_integration/` | `cli/CLI_COMMAND_REFERENCE.md`, `dashboard/LIVE_DASHBOARD_RUNTIME.md`, `github_sync/`, `vscode_extension/` | Completed: root README now maps old `v2_*` folders to current runtime docs and marks them historical. |
| `multi_ai_governance/` | `governance/`, `kvdf owner/developer/agent/token/lock/session`, `docs/SYSTEM_CAPABILITIES_REFERENCE.md` | Completed: root README now maps old `v3_*` folders to current governance docs and marks them historical. |
| `project_intelligence/` | `questionnaire_engine/`, `standard_systems/`, `kvdf memory`, `kvdf capability` | Keep if used by `kvdf plan` or roadmap inspection. Otherwise fold into current intelligence docs. |

## False Positives That Should Stay

These look duplicated by filename, but they are intentional.

| Pattern | Why It Is Not A Cleanup Target |
| --- | --- |
| Many `README.md` files | Each folder needs a local entrypoint. |
| `00_FOLDER_OWNER_QUESTIONNAIRE_AR.docx` / `EN.docx` in many questionnaire folders | Same filename pattern, different questionnaire folder context. |
| Prompt pack step names like `12_RELEASE_HANDOFF_PROMPT.md` across stacks | Same stage, stack-specific content. |
| Arabic/English docs-site pages with the same slug | Language variants, not duplicates. |
| Example files under `examples/lite`, `examples/standard`, `examples/enterprise` | Different profiles. |

## Exact Duplicate Content Candidates

The initial hash scan found a small number of exact duplicate small files, most
inside ignored `.kabeeri/` runtime state. Because `.kabeeri/` is ignored and is
local workspace state, those are not repository cleanup targets.

The only content-level duplication worth auditing in tracked docs is:

- `prompt_packs/react/03_ENV_CONFIG_API_PROMPT.md`
- `prompt_packs/vue/03_ENV_CONFIG_API_PROMPT.md`
- `prompt_packs/react/05_COMPONENTS_DESIGN_SYSTEM_PROMPT.md`
- `prompt_packs/vue/05_COMPONENTS_DESIGN_SYSTEM_PROMPT.md`

Recommendation:

- Do not delete now.
- If they are truly identical, create a shared frontend prompt common layer
  later and keep stack files as wrappers.

## Suggested Cleanup Order

1. Keep current reports synchronized after each major runtime feature.
2. Treat phase reports as historical snapshots unless explicitly refreshed.
3. Do not recreate deleted duplicate folders.
4. Continue bilingual docs parity cleanup.

## Recommended Delete / Archive List

### Keep As Current Reports

- `docs/reports/CURRENT_REPOSITORY_ANALYSIS.md`
- `docs/reports/GAP_REPORT.md`
- `docs/reports/IMPLEMENTATION_PLAN.md`
- `docs/reports/MISSING_REQUIREMENTS_BACKLOG.md`

### Keep As Historical Traceability

- `docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md`
- `docs/reports/PHASE_TASK_BREAKDOWN.md`
- `docs/reports/V*_*.md`
- `docs/reports/ROADMAP_SOURCE_*.md`
- `docs/reports/SOURCE_TO_PHASE_MAP.md`

### Needs Consolidation Before Deletion

Completed:

- Historical `task_governance/` was removed and strict policy moved to `knowledge/task_tracking/TASK_GOVERNANCE.md`.
- `ai_usage/README.md` was merged into `ai_cost_control/README.md` and deleted.
- `ai_cost_control/TOKEN_BUDGET_RULES.md` was reduced to a pointer to `governance/TOKEN_BUDGET_RULES.md`.
- `platform_integration/README.md` now maps historical `v2_*` folders to current runtime docs.
- `multi_ai_governance/README.md` now maps historical `v3_*` folders to current governance docs.

## Final Assessment

The repository has too many historical planning and report documents for its
current product state. The most important cleanup is not deleting by filename;
it is separating:

- current runtime/user docs
- canonical governance docs
- historical roadmap/report artifacts
- local ignored `.kabeeri/` state

The current product-facing documentation should revolve around:

- `README.md`
- `README_AR.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `cli/CLI_COMMAND_REFERENCE.md`
- `governance/`
- `vibe_ux/`
- `dashboard/`
- `ai_cost_control/`
- `design_sources/`
- `prompt_packs/`
- `docs_site/`
