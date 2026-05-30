# UI UX Intelligence

`ui_ux_intelligence` is a read-only design intelligence plugin for KVDF.

It helps with:
- product-type detection
- UI/UX recommendations
- design-system generation
- accessibility and anti-pattern checks
- checklist, docs, scorecard, and handoff planning
- visual QA and readiness gates
- governance, catalog health, and knowledge-pack checks

## Runtime Contract

- Data lives in `plugins/ui_ux_intelligence/data/`
- Runtime logic lives in `plugins/ui_ux_intelligence/runtime/`
- Schemas live in `plugins/ui_ux_intelligence/schemas/`
- The plugin does not call external AI or GitHub APIs

## Data Lifecycle

The live catalog is stored entirely in `data/` and `data/stacks/`.

- Keep those folders as the only runtime data source.
- Treat any import-only or temporary source material as outside the bundled runtime contract.
- The plugin never reads staging or import cache folders at runtime.

## Entry Points

- `plugins/ui_ux_intelligence/bootstrap.js`
- `plugins/ui_ux_intelligence/runtime/index.js`

## Main Commands

- `kvdf ui-ux-intelligence status`
- `kvdf ui-ux-intelligence source-status`
- `kvdf ui-ux-intelligence search`
- `kvdf ui-ux-intelligence recommend`
- `kvdf ui-ux-intelligence design-system`
- `kvdf ui-ux-intelligence checklist`
- `kvdf ui-ux-intelligence docs`
- `kvdf ui-ux-intelligence audit`
- `kvdf ui-ux-intelligence scorecard`
- `kvdf ui-ux-intelligence gate`
- `kvdf ui-ux-intelligence readiness`
- `kvdf ui-ux-intelligence handoff-pack`
- `kvdf ui-ux-intelligence tokens`
- `kvdf ui-ux-intelligence components`
- `kvdf ui-ux-intelligence screens`
- `kvdf ui-ux-intelligence patterns`
- `kvdf ui-ux-intelligence implementation-guidance`
- `kvdf ui-ux-intelligence prompt-pack`
- `kvdf ui-ux-intelligence evidence`
- `kvdf ui-ux-intelligence visual-qa`
- `kvdf ui-ux-intelligence acceptance-gate`
- `kvdf ui-ux-intelligence regression`
- `kvdf ui-ux-intelligence knowledge-pack`
- `kvdf ui-ux-intelligence catalog-health`
- `kvdf ui-ux-intelligence governance-registry`
- `kvdf ui-ux-intelligence upgrade-plan`
- `kvdf ui-ux-intelligence governance`

## Notes

The plugin is intentionally deterministic and offline. It reads only the local catalog files in `data/` and `data/stacks/` and returns planning artifacts rather than production UI code.
