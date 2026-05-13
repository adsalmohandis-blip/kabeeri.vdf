# 04 - Repository Structure

This file is the canonical English counterpart to
`docs/ar/04_REPOSITORY_STRUCTURE.md`.

## Root Structure

```text
kabeeri-vdf/
├── bin/
├── src/
├── generators/
├── templates/
├── questionnaires/
├── questionnaire_engine/
├── standard_systems/
├── project_intake/
├── prompt_packs/
├── task_tracking/
├── governance/
├── acceptance_checklists/
├── schemas/
├── examples/
├── dashboard/
├── docs/
└── docs_site/
```

## Main Responsibilities

| Area | Responsibility |
| --- | --- |
| `bin/`, `src/` | CLI entrypoint and runtime implementation. |
| `generators/` | Lite, Standard, and Enterprise skeleton definitions. |
| `templates/` | Reusable Arabic and English templates. |
| `questionnaires/` | Core, production, and extension questionnaire sources. |
| `questionnaire_engine/` | Flow, minimization, follow-up, and activation rules. |
| `standard_systems/` | Capability maps and standard project area definitions. |
| `project_intake/` | New/existing project intake rules. |
| `prompt_packs/` | Stack-specific AI coding prompts and common prompt layer. |
| `task_tracking/` | Task schemas, templates, examples, states, durable resume memory, and review formats. |
| `governance/` | Owner, task, app boundary, workstream, token, and execution policies. |
| `acceptance_checklists/` | Review and acceptance formats. |
| `schemas/` | JSON schemas and runtime schema registry. |
| `examples/` | Example project workflows and product briefs. |
| `dashboard/` | Live dashboard, dashboard UX, and business/technical dashboard specs. |
| `docs/` | Arabic, English, production, report, and internal documentation. |
| `docs_site/` | Static documentation website. |

## Rule

New product capabilities should be documented in the closest domain folder and
listed in `docs/SYSTEM_CAPABILITIES_REFERENCE.md` when they become part of the
system surface.
