# UI UX Intelligence Plugin

`ui_ux_intelligence` is an optional KVDF design plugin that provides:

- product type detection
- a local catalog and search layer over the live CSV data
- deterministic recommendation and design-system generation
- UI/UX checklist generation
- UI/UX docs section generation for Viber app planning
- lightweight UI/UX audit reporting
- UI implementation planning artifacts: design tokens, component blueprints, screen blueprints, and handoff packs
- UI pattern libraries, framework-aware implementation guidance, and Codex-ready prompt packs
- UI review evidence, visual QA contracts, acceptance gates, and regression checklists
- knowledge-pack status, catalog health, governance registry, and safe upgrade planning
- design-system recommendations
- UI style recommendations
- palette and typography guidance
- layout and component guidance
- accessibility checklists
- UX anti-pattern detection
- UI/UX documentation support for Viber apps

This plugin works offline in the MVP and does not depend on external GitHub repositories, paid APIs, or any AI API. Runtime data is loaded from `plugins/ui_ux_intelligence/data/` and `plugins/ui_ux_intelligence/data/stacks/` only.

## Data Lifecycle

The plugin runtime reads only the live catalog folders:

- `plugins/ui_ux_intelligence/data/`
- `plugins/ui_ux_intelligence/data/stacks/`

Temporary import or review material stays outside the runtime contract.

## Checklist, Docs, And Audit

The plugin also produces handoff-oriented validation material:

- `checklist` creates readiness checks for accessibility, responsive behavior, interaction states, forms, dashboards, performance, motion, and handoff.
- `docs` creates Markdown-ready sections for `docs/ui-ux/UI_UX_DESIGN.md`, `docs/ui-ux/UX_PRINCIPLES.md`, `docs/ui-ux/INFORMATION_ARCHITECTURE.md`, `docs/ui-ux/USER_FLOWS.md`, `docs/ui-ux/WIREFRAMES.md`, `docs/ui-ux/UI_SPECIFICATION.md`, `docs/ui-ux/ACCESSIBILITY.md`, and `docs/delivery/QA_CHECKLIST.md`.
- `audit` checks a target file or inline UI/UX text and returns warnings or blockers without writing files.
- `audit --strict` can escalate critical missing sections to blockers for handoff review.
- All three commands run offline, use only `plugins/ui_ux_intelligence/data/`, and never write to `.kabeeri/`.

## Implementation Artifacts

The plugin also emits implementation-ready planning artifacts without generating production code:

- `tokens` builds framework-neutral design tokens for color, typography, spacing, radius, shadow, motion, and state.
- `components` builds a component blueprint with states, accessibility, responsive behavior, and acceptance criteria.
- `screens` builds a screen blueprint with information architecture and user-flow hints.
- `handoff-pack` combines the recommendation, design system, tokens, components, screens, checklist, and scorecard into a Markdown-ready handoff bundle.
- `patterns` extracts reusable UI patterns that fit the product shape.
- `implementation-guidance` converts the planning artifacts into framework-aware implementation direction for a task punch.
- `prompt-pack` creates Codex-ready UI implementation prompts and can export Markdown when `--output` is explicitly provided. It is guidance only; it does not execute code or change app files by itself.
- `evidence` records screenshot, document, test-report, and metadata-only evidence without OCR or pixel inspection.
- `visual-qa` turns the UI plan into a metadata-based QA contract for required screens, states, breakpoints, and accessibility evidence.
- `acceptance-gate` evaluates the evidence, docs, scorecard, and visual QA contract for handoff and publish readiness.
- `regression` builds a lightweight regression checklist for the key UI screens, components, states, and accessibility behaviors.
- `knowledge-pack` reports the installed manifest-driven knowledge pack version, loaded domains, and reproducibility status.
- `catalog-health` validates that the required data files are present and that the catalog is usable.
- `governance-registry` describes the plugin capabilities, command surface, runtime modules, schemas, and docs.
- `upgrade-plan` recommends the next safe knowledge-pack upgrade without modifying data.
- `governance` combines knowledge-pack, catalog-health, governance-registry, and upgrade-plan into one read-only report.

These outputs are planning/specification artifacts only. They do not create production UI code or app source files, and they do not inspect image pixels or run OCR.

The governance layer adds manifest-backed versioning and health checks so future planner and dashboard integrations can trust the local knowledge pack before consuming any UI/UX summary.

These commands are offline and deterministic. They do not write files unless the operator passes an explicit `--output` path to `handoff-pack` or `prompt-pack`, and even then the output is Markdown only.

## Planner And Dashboard Integration

KVDF Planner and the Viber dashboard can consume `ui_ux_intelligence` as an optional provider when the operator explicitly passes `--include-ui-ux-intelligence` or `--ui-ux-intelligence`. Planner review, visual, prompt, docs, and Viber dashboard summaries can surface the provider when it is available, but the core planner still continues normally if the plugin is missing, disabled, or intentionally suppressed with `--no-ui-ux-intelligence`. The handoff pack and implementation artifacts are read-only planning outputs unless the operator explicitly requests Markdown export with `handoff-pack --output <path>`.

The integration stays read-only unless you are already using planner docs materialization, and even then the plugin only enriches the existing Viber UI/UX docs pipeline. It never calls external GitHub or AI APIs.

## Recommendation Layer

The recommender turns a brief into:

- detected product type
- recommended style, palette, and typography
- recommended layout patterns and components
- UX rules and anti-patterns
- chart, icon, and stack guidance when relevant

The design-system generator turns the recommendation into a structured Viber planning foundation with colors, typography, layout, component guidance, motion rules, accessibility guidance, and a pre-delivery checklist. The checklist, docs adapter, and audit layer extend that foundation into handoff-ready UI/UX validation material.
