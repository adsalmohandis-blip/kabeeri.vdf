# Roadmap Source Index

Updated during Phase 1 from `00_DEEP_MASTER_COMMANDS.md` using the roadmap ingestion rules in `codex_commands/01_ROADMAP_SOURCE_INGESTION.md`. No implementation changes were made.

## Current Status Addendum

Updated: 2026-05-09.

This index is a historical ingestion index for v1-v7 roadmap sources. The
status counts below are not the current implementation status. Many items that
were counted as `missing` or `partial` have since been implemented in runtime.
Use `CURRENT_REPOSITORY_ANALYSIS.md`, `GAP_REPORT.md`, and
`MISSING_REQUIREMENTS_BACKLOG.md` for active status.

## Indexed Sources

| Version | Source | Lines | Words | Indexed Requirements | Completeness | Notes |
| --- | --- | ---: | ---: | ---: | --- | --- |
| v1 | `kabeeri_vdf_v1_milestones_issues.md` | 1716 | 5661 | 57 | complete | Indexed into RTM. |
| v2 | `kabeeri_vdf_v2_updated_task_governance_project_intake_ai_usage.md` | 519 | 1811 | 22 | complete | Indexed into RTM. |
| v3 | `kabeeri_vdf_v3_updated_dashboard_github_vscode_token_costs.md` | 615 | 2116 | 28 | complete | Indexed into RTM. |
| v4 | `kabeeri_vdf_v4_updated_multi_ai_governance_tokens_locks.md` | 591 | 2126 | 28 | complete | Indexed into RTM. |
| v5 | `kabeeri_vdf_v5_complete_merged_adaptive_system_capabilities.md` | 1677 | 6825 | 68 | complete | Indexed into RTM. Includes 12 adaptive questionnaire/capability-map requirements plus 56 original trust-layer issues. |
| v6 | `kabeeri_vdf_v6_vibe_first_interaction_layer.md` | 1417 | 4862 | 56 | complete | Indexed into RTM. |
| v7 | `kabeeri_vdf_v7_design_source_governance_frontend_experience_layer.md` | 2106 | 7122 | 69 | complete | Indexed into RTM. Section-based source with v7.1-v7.10 issue groups. |

## Requirement Count Summary

| Version | Requirements Indexed |
| --- | ---: |
| v1 | 57 |
| v2 | 22 |
| v3 | 28 |
| v4 | 28 |
| v5 | 68 |
| v6 | 56 |
| v7 | 69 |
| **Total** | **328** |

## Status Summary

Historical ingestion counts:

| Status | Count |
| --- | ---: |
| deferred | 4 |
| exists | 10 |
| missing | 139 |
| partial | 175 |

## Coverage Notes

- v1-v7 roadmap source files are present under `codex_context/roadmap_sources/`.
- v5 includes both the adaptive questionnaire/system capability layer and the preserved original v5 trust-layer issues.
- v7 was indexed from the conversation-approved design governance source file.
  Current design governance docs and runtime now exist; deeper design QA
  automation remains active work.
- No roadmap source is currently marked missing or blocked.
