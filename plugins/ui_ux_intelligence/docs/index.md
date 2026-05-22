# UI UX Intelligence Plugin

`ui_ux_intelligence` is an optional KVDF design plugin that provides:

- product type detection
- a local catalog and search layer over the relocated CSV data
- deterministic recommendation and design-system generation
- UI/UX checklist generation
- UI/UX docs section generation for Viber app planning
- lightweight UI/UX audit reporting
- design-system recommendations
- UI style recommendations
- palette and typography guidance
- layout and component guidance
- accessibility checklists
- UX anti-pattern detection
- UI/UX documentation support for Viber apps

This plugin works offline in the MVP and does not depend on external GitHub repositories, paid APIs, or any AI API. Runtime data is loaded from `plugins/ui_ux_intelligence/data/` and `plugins/ui_ux_intelligence/data/stacks/` only.

## Phase 2 Data Relocation

The only approved staging area for incoming reference material was:

`plugins/ui_ux_intelligence/_temp_meta/`

That folder is flat. Approved CSV files are relocated into `data/` and `data/stacks/`. Reference scripts and markdown notes remain staging-only and are not used as runtime dependencies. The runtime never reads `_temp_meta/`.

## Checklist, Docs, And Audit

The plugin also produces handoff-oriented validation material:

- `checklist` creates readiness checks for accessibility, responsive behavior, interaction states, forms, dashboards, performance, motion, and handoff.
- `docs` creates Markdown-ready sections for `docs/ui-ux/UI_UX_DESIGN.md`, `docs/ui-ux/UX_PRINCIPLES.md`, `docs/ui-ux/INFORMATION_ARCHITECTURE.md`, `docs/ui-ux/USER_FLOWS.md`, `docs/ui-ux/WIREFRAMES.md`, `docs/ui-ux/UI_SPECIFICATION.md`, `docs/ui-ux/ACCESSIBILITY.md`, and `docs/delivery/QA_CHECKLIST.md`.
- `audit` checks a target file or inline UI/UX text and returns warnings or blockers without writing files.
- `audit --strict` can escalate critical missing sections to blockers for handoff review.
- All three commands run offline, use only `plugins/ui_ux_intelligence/data/`, and never write to `_temp_meta/` or `.kabeeri/`.

## Recommendation Layer

The recommender turns a brief into:

- detected product type
- recommended style, palette, and typography
- recommended layout patterns and components
- UX rules and anti-patterns
- chart, icon, and stack guidance when relevant

The design-system generator turns the recommendation into a structured Viber planning foundation with colors, typography, layout, component guidance, motion rules, accessibility guidance, and a pre-delivery checklist. The checklist, docs adapter, and audit layer extend that foundation into handoff-ready UI/UX validation material.
