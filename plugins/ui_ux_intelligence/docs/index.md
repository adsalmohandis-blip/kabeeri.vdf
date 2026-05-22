# UI UX Intelligence Plugin

`ui_ux_intelligence` is an optional KVDF design plugin that provides:

- product type detection
- a local catalog and search layer over the relocated CSV data
- design-system recommendations
- UI style recommendations
- palette and typography guidance
- layout and component guidance
- accessibility checklists
- UX anti-pattern detection
- UI/UX documentation support for Viber apps

This plugin works offline in the MVP and does not depend on external GitHub repositories or paid APIs.
Runtime data is loaded from `plugins/ui_ux_intelligence/data/` and `plugins/ui_ux_intelligence/data/stacks/` only.

## Phase 2 Data Relocation

The only approved staging area for incoming reference material was:

`plugins/ui_ux_intelligence/_temp_meta/`

That folder is flat. Approved CSV files are relocated into `data/` and `data/stacks/`. Reference scripts and markdown notes remain staging-only and are not used as runtime dependencies.
