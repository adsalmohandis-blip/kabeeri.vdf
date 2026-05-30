# app_category_registry Evo History

**Status:** `completed`
**Track:** `plugin_dev`
**Scope:** category brain for KVDOS app creation
**Mode:** design and execution planning

---

## Purpose

This Evo history defines the phased implementation record for `app_category_registry`.
The plugin is intended to become the category brain for app creation in KVDOS:

`Create New App -> Category Selection -> Source Intake -> Directed Questionnaire -> Micro Docs -> Ordered Roadmaps -> Workspace Setup -> Tasks -> Agents -> Normal KVDOS Pipeline`

The plugin must store the full universe of categories, but only show active ready categories by default.

---

## Evo Queue

| Evo ID | Title | Phase | Outcome | Dependency Notes | Exit Criterion |
|---|---|---:|---|---|---|
| `acr-000` | Design Contract | 0 | Plugin boundary, output contracts, category universe model, active catalog model, readiness matrix model, visibility rules, profile model, compatibility model, routing models, workspace plan model, evidence model, approval gate model, MVP active list, future inactive list, test matrix, risks, and implementation phases. | First slice. Lock the architecture before coding. | The design contract is complete and reviewable. |
| `acr-001` | Plugin Foundation | 1 | Plugin shell, schemas, loader, validator, registry reader, readiness loader, visibility engine, and basic status command. | Depends on `acr-000`. | The plugin loads category files and reports status safely. |
| `acr-002` | Category Universe + Active Catalog | 2 | Full category universe storage, active catalog, readiness matrix, and visibility rules with common ready categories shown first. | Depends on `acr-001`. | Registry stores the universe and exposes only active ready categories by default. |
| `acr-003` | Category Profile + Compatibility Engine | 3 | Selected category profile builder, compatibility engine, profile validator, and deterministic `.kabeeri/app_category_profile.yaml`. | Depends on `acr-001` and `acr-002`. | Valid profiles are generated and invalid combinations fail safely. |
| `acr-004` | Source Intake Router | 4 | Source classification, source map, confidence model, conflict tracking, and source inventory outputs. | Depends on `acr-003`. | Sources are routed and conflicts are recorded, not hidden. |
| `acr-005` | Category Questionnaire Router | 5 | Questionnaire packs, missing-detail prioritization, conditional questions, and `.kabeeri/questionnaire_profile.yaml`. | Depends on `acr-003` and `acr-004`. | The router asks missing and high-risk questions first. |
| `acr-006` | Spec + Micro-Docs Contract Resolver | 6 | Required docs/spec contracts for UI/UX, system design, database, testing, deployment, security, and evidence. | Depends on `acr-003` and `acr-005`. | The plugin knows exactly which docs are required for the selected profile. |
| `acr-007` | Roadmap Tracks + Roadmap Order Engine | 7 | Ordered roadmap tracks, dependency validation, approval gates, and category-specific ordering rules. | Depends on `acr-003`, `acr-005`, and `acr-006`. | Roadmaps are ordered and dependency-safe. |
| `acr-008` | Workspace Planner | 8 | Non-destructive workspace planning, dry-run/apply behavior, category templates, and folder evidence. | Depends on `acr-003`, `acr-006`, and `acr-007`. | A category-specific workspace plan is generated safely. |
| `acr-009` | IDE Integration + Evidence + Tests | 9 | Create New App selection flow, evidence outputs, approval gates, docs, tests, and final hardening. | Depends on `acr-001` through `acr-008`. | The category chooser is production-ready and test-covered. |

---

## Execution Order

1. `acr-000`
2. `acr-001`
3. `acr-002`
4. `acr-003`
5. `acr-004`
6. `acr-005`
7. `acr-006`
8. `acr-007`
9. `acr-008`
10. `acr-009`

---

## Safety Rules

- Categories are data, not hardcoded business logic.
- Only active ready categories appear in the normal Create New App flow.
- The plugin prepares the pipeline; it does not build apps directly.
- Inactive categories remain hidden, warning-labeled, or admin-only until their specs are ready.
- Conflicts must be recorded, not silently resolved.
- The code should use `app_creator` or `vibe_user` in user-facing naming, not `viber`.

---

## Summary

`app_category_registry` is the app creation intelligence layer for KVDOS. It resolves category selection, source routing, questionnaires, docs, roadmaps, workspace planning, and evidence before the normal app pipeline begins. This Evo set has been implemented and the workspace now reflects the completed implementation history.
