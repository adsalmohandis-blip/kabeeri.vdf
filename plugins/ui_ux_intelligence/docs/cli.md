# UI UX Intelligence CLI

## Commands

```bash
kvdf ui-ux-intelligence status --json
kvdf ui-ux-intelligence source-status --json
kvdf ui-ux-intelligence search --idea "Build booking app for clinics" --json
kvdf ui-ux-intelligence recommend --idea "Build booking app for clinics" --json
kvdf ui-ux-intelligence design-system --idea "Build ecommerce app" --json
kvdf ui-ux-intelligence checklist --idea "Build dashboard app" --json
kvdf ui-ux-intelligence docs --idea "Build booking app" --track vibe --app booking --json
kvdf ui-ux-intelligence audit --target docs/ui-ux/UI_UX_DESIGN.md --json
kvdf plugins install ui_ux_intelligence
kvdf plugins uninstall ui_ux_intelligence
```

## Notes

- `status` reports the plugin as an available optional bundle.
- `source-status` inspects only flat files directly under `_temp_meta/`.
- `search`, `recommend`, `design-system`, `checklist`, `docs`, and `audit` all work offline in the MVP.
- Later phases can relocate approved staging material from `_temp_meta/` into plugin folders, but the final plugin must not depend on `_temp_meta/`.

