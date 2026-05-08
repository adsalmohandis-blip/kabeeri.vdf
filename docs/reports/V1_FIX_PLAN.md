# V1 Fix Plan

Generated for Phase 03 only. This is a proposed plan; no fixes were applied.

## Goal

Stabilize the v1 public foundation without mixing v2-v7 features into v1 pages except as clear roadmap links.

## Rules for Phase 04

- Do not delete existing content without a report.
- Do not rewrite v1 philosophy.
- Do not introduce v2-v7 concepts into v1 core pages except as future roadmap links.
- Preserve bilingual intent.
- Keep changes small and reviewable.
- Every changed file must have a reason and risk note in the stabilization report.

## Proposed Fix Tasks

| Fix ID | Area | Priority | Proposed Fix | Acceptance Check | Risk |
| --- | --- | --- | --- | --- | --- |
| V1-FIX-001 | README | high | Replace stale "planned command name/future commands" wording with current CLI status and future roadmap distinction. | README accurately describes `kvdf` as existing runtime. | Could overstate production readiness if wording is too strong. |
| V1-FIX-002 | README_AR | high | Review Arabic README for parity with current root README status. | Arabic README includes current CLI/runtime note or links to current command reference. | Arabic wording may need Owner review. |
| V1-FIX-003 | docs/en parity | high | Add an English docs index or parity map showing which Arabic docs have no English equivalent. | Reader can see what is available and what remains untranslated. | Full translation is larger than a stabilization patch. |
| V1-FIX-004 | docs/ar links | medium | Check Arabic docs links back to root, roadmap, generators, questionnaires, prompt packs, tasks, and acceptance. | No obvious broken navigation in foundation docs. | Link-only changes can become noisy if not scoped. |
| V1-FIX-005 | prompt packs | high | Audit prompt-pack root/common layer and confirm whether React Native Expo pack is missing or intentionally deferred. | Prompt-pack status table documents present/missing/deferred packs. | May reveal a missing pack that needs a later implementation task. |
| V1-FIX-006 | generators | medium | Add/refresh generator validation examples without changing generator behavior. | Lite/standard/enterprise examples are easy to validate. | Must avoid modifying generator schema unnecessarily. |
| V1-FIX-007 | questionnaires | medium | Add questionnaire audit note and answered-example backlog. | Core/production/extension questionnaire status is documented. | DOCX content edits should be avoided unless specifically approved. |
| V1-FIX-008 | examples | medium | Confirm Lite/standard/enterprise examples include workflow, tasks, product brief, and acceptance review link. | Example index states exactly what each profile includes. | Avoid creating large sample generated docs in Phase 04 unless approved. |
| V1-FIX-009 | task docs overlap | high | Add a short cross-reference explaining the relationship between `task_tracking/` and `task_governance/`. | Users know which folder to use for task format vs governance rules. | A merge/rename would be too risky for stabilization. |
| V1-FIX-010 | acceptance checklists | medium | Confirm release/task/folder/prompt/AI output checklist index is current. | Acceptance checklist README links all checklist types. | Low. |
| V1-FIX-011 | CLI docs | high | Update `cli/README.md`, `CLI_COMMANDS.md`, `CLI_USER_FLOWS.md`, `CLI_SAFETY_RULES.md`, and `CLI_ROADMAP.md` wording where it says "future CLI" but runtime exists. | CLI docs distinguish implemented CLI from future UX. | Must not imply every future feature is implemented. |
| V1-FIX-012 | VS Code planning | medium | Add/refresh a v1 VS Code planning note for sidebar, questionnaire UI, prompt browser, task tracking, and acceptance checklist views. | v1 planning requirement is explicitly covered. | Could duplicate later v3/v6 plans if not cross-linked carefully. |
| V1-FIX-013 | ROADMAP | high | Add a current-state note above old planned/TBD rows or update statuses after review. | ROADMAP no longer contradicts current runtime. | Roadmap history can be distorted if edited carelessly. |
| V1-FIX-014 | V1 release summary | high | Replace or annotate TBD entries for templates/examples that now exist or remain deferred. | V1 release summary matches repository state. | Requires careful distinction between v1 and later features. |
| V1-FIX-015 | docs site | deferred | Do not build docs site in v1 stabilization; leave for Phase 12. Add explicit deferred note if needed. | Docs site gap is visible and intentionally deferred. | Building site too early would exceed Phase 04. |

## Suggested Phase 04 Order

1. Fix stale CLI/runtime wording in root and CLI docs.
2. Add navigation/parity notes for docs EN/AR.
3. Add task tracking/governance cross-reference.
4. Add prompt-pack and questionnaire audit notes.
5. Refresh roadmap/release summary status notes.
6. Produce `V1_STABILIZATION_REPORT.md`.

## Out of Scope for Phase 04

- Building `docs_site/`.
- Creating v6/v7 folders.
- Changing runtime CLI behavior.
- Running GitHub release/publish actions.
- Editing DOCX questionnaire contents.
- Renaming or deleting existing folders.

