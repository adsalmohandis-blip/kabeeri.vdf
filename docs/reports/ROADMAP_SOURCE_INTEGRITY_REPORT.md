# Roadmap Source Integrity Report

Generated for Phase 1 only. This is an ingestion report; it does not implement roadmap requirements.

## Integrity Summary

| Version | Expected Source | Repository Source | Present | Requirement Count | Integrity Status | Required Action |
| --- | --- | --- | --- | ---: | --- | --- |
| v1 | `kabeeri_vdf_v1_milestones_issues.docx` | `codex_context/roadmap_sources/kabeeri_vdf_v1_milestones_issues.md` | yes | 57 | ok | None for ingestion. |
| v2 | `kabeeri_vdf_v2_updated_task_governance_project_intake_ai_usage.docx` | `codex_context/roadmap_sources/kabeeri_vdf_v2_updated_task_governance_project_intake_ai_usage.md` | yes | 22 | ok | None for ingestion. |
| v3 | `kabeeri_vdf_v3_updated_dashboard_github_vscode_token_costs.docx` | `codex_context/roadmap_sources/kabeeri_vdf_v3_updated_dashboard_github_vscode_token_costs.md` | yes | 28 | ok | None for ingestion. |
| v4 | `kabeeri_vdf_v4_updated_multi_ai_governance_tokens_locks.docx` | `codex_context/roadmap_sources/kabeeri_vdf_v4_updated_multi_ai_governance_tokens_locks.md` | yes | 28 | ok | None for ingestion. |
| v5 | `kabeeri_vdf_v5_complete_merged_adaptive_system_capabilities.docx` | `codex_context/roadmap_sources/kabeeri_vdf_v5_complete_merged_adaptive_system_capabilities.md` | yes | 68 | ok | Preserve both the new adaptive layer and original v5 trust layer. |
| v6 | `kabeeri_vdf_v6_vibe_first_interaction_layer.docx` | `codex_context/roadmap_sources/kabeeri_vdf_v6_vibe_first_interaction_layer.md` | yes | 56 | ok | None for ingestion. |
| v7 | conversation-approved design governance requirements | `codex_context/roadmap_sources/kabeeri_vdf_v7_design_source_governance_frontend_experience_layer.md` | yes | 69 | ok | Treat section-based v7 source as authoritative for design governance. |

## Checks Performed

- Confirmed all roadmap source files v1-v7 exist under `codex_context/roadmap_sources/`.
- Confirmed each source has identifiable scope, milestones or section groups, and issue/requirement entries.
- Confirmed v5 has a merged structure: 12 adaptive questionnaire/system capability requirements plus 56 original trust-layer issues.
- Confirmed v7 is not a normal milestone-heading file, but contains v7.1 through v7.10 section groups with 69 issues.
- Confirmed `docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md` contains 328 requirement rows.

## Blockers

No source-ingestion blockers were found.

## Integrity Notes

- The source files are Markdown exports of the roadmap pack, while `01_ROADMAP_SOURCE_INGESTION.md` refers to `.docx` names. The Markdown files are the available local canonical source pack for this repository.
- Some Arabic text displays with mojibake in terminal output, but file structure, headings, issue titles, and roadmap intent remain indexable.
- This report does not assert that requirements are implemented. It only confirms source pack availability and ingestion completeness.

