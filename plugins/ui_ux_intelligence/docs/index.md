# UI UX Intelligence Plugin

`ui_ux_intelligence` is an optional KVDF design plugin that provides:

- product type detection
- a local catalog and search layer over the relocated CSV data
- deterministic recommendation and design-system generation
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

## Recommendation Layer

The recommender turns a brief into:

- detected product type
- recommended style, palette, and typography
- recommended layout patterns and components
- UX rules and anti-patterns
- chart, icon, and stack guidance when relevant

The design-system generator turns the recommendation into a structured Viber planning foundation with colors, typography, layout, component guidance, motion rules, accessibility guidance, and a pre-delivery checklist.
