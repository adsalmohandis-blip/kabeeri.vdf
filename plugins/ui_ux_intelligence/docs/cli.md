# UI UX Intelligence CLI

## Commands

```bash
kvdf ui-ux-intelligence status --json
kvdf ui-ux-intelligence source-status --json
kvdf ui-ux-intelligence catalog --json
kvdf ui-ux-intelligence search --idea "Build booking app for clinics" --json
kvdf ui-ux-intelligence search --query "clinic booking app" --domain products --json
kvdf ui-ux-intelligence recommend --idea "Build booking app for clinics" --json
kvdf ui-ux-intelligence design-system --idea "Build ecommerce app" --json
kvdf ui-ux-intelligence checklist --idea "Build dashboard app" --json
kvdf ui-ux-intelligence docs --idea "Build booking app" --track vibe --app booking --json
kvdf ui-ux-intelligence audit --target docs/ui-ux/UI_UX_DESIGN.md --json
kvdf ui-ux-intelligence audit --target docs/ui-ux/UI_UX_DESIGN.md --strict --json
kvdf plugins install ui_ux_intelligence
kvdf plugins uninstall ui_ux_intelligence
```

## Notes

- `status` reports the plugin as an available optional bundle.
- `source-status` inspects the flat `_temp_meta/` staging contract and the installed `data/` + `data/stacks/` catalog.
- `catalog` reports whether the relocated data is ready for search and recommendation.
- `recommend` is deterministic and uses only the local catalog and search scoring to derive product, style, palette, typography, layout, UX, chart, icon, and stack guidance.
- `design-system` turns the recommendation into a structured design foundation for Viber planning.
- `checklist` returns UI/UX readiness checks grouped by accessibility, responsive, interaction, content, layout, forms, dashboard, performance, motion, and handoff.
- `docs` returns Markdown-ready sections for the Viber UI/UX docs pipeline and never writes files.
- `audit` inspects a target UI/UX file or inline text, returns warnings or blockers, and never writes files.
- Planner integration is optional: `kvdf planner docs plan|materialize --include-ui-ux-intelligence` can consume the docs sections, `kvdf planner review|visual|prompt` can surface optional summaries, and `kvdf dashboard viber state --json` can expose a safe availability summary. Use `--no-ui-ux-intelligence` when you want to suppress the provider even if it is installed.
- `search`, `recommend`, `design-system`, `checklist`, `docs`, and `audit` all work offline in the MVP.
- `search` uses the local catalog only and can filter by `--domain products|styles|colors|typography|ui_reasoning|ux_guidelines|charts|landing|icons|app_interface|react_performance|stacks|all`.
- The final plugin must not depend on `_temp_meta/` at runtime and does not call any external GitHub or AI API service.
- `audit --strict` escalates critical missing UI/UX sections to blockers for handoff review.
