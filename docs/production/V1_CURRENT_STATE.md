# Kabeeri VDF v1 Current State

This file records the current v1 foundation state after Phase 04 stabilization. It does not claim the full v2-v7 roadmap is complete.

## What Exists

| Area | Current State |
| --- | --- |
| Root docs | `README.md` and `README_AR.md` exist. The root README now distinguishes the working CLI MVP from future roadmap work. |
| Generators | `generators/lite.json`, `generators/standard.json`, and `generators/enterprise.json` exist. |
| Questionnaires | Core, production, and extension questionnaire folders exist with Arabic and English DOCX files. |
| Prompt packs | Many stack prompt packs exist directly under `prompt_packs/<pack-name>/`. Some logical categories and common-layer notes remain roadmap items. |
| Task tracking | `task_tracking/` provides the practical task format, task states, task schema, intake template, provenance schema, review checklist, and execution log template. |
| Task governance | `governance/TASK_GOVERNANCE.md` is the canonical task policy for readiness, source tracing, scope, assignment, execution, review, and Owner verification. |
| Acceptance checklists | Task, folder, prompt pack, AI output, release, and decision checklists exist. |
| Examples | Lite, standard, and enterprise example folders exist with workflow, product brief, and task examples. |
| CLI MVP | `kvdf` exists through `bin/kvdf.js` and package scripts. It supports local validation, project creation, dashboard export/serve, governance workflows, and additional local state operations. |

## What Remains Deferred

| Area | Deferred To |
| --- | --- |
| Static documentation website | Phase 12 |
| Full English/Arabic parity | Dedicated documentation pass |
| DOCX questionnaire content edits | Focused questionnaire approval |
| v2-v7 full platform layers | Their approved implementation phases |
| GitHub publishing and release mutation | Phase 13 with Owner approval |

## Source of Truth Rule

For Kabeeri-managed projects, `.kabeeri/` is the local source of truth. CLI, VS Code, dashboard, docs, and GitHub sync are user-facing or integration layers that must read from or write to that state through explicit rules.

## v1 Stabilization Boundary

Phase 04 only stabilizes public v1 documentation and navigation. It does not change CLI behavior, publish to GitHub, build a docs site, rename folders, delete content, or implement later roadmap features.
