# UI UX Intelligence Data Relocation Report

This report records the phase-2 relocation for `plugins/ui_ux_intelligence`.

## Summary

- Approved CSV data was relocated from `plugins/ui_ux_intelligence/_temp_meta/` into `plugins/ui_ux_intelligence/data/`.
- Stack-specific CSV data was relocated into `plugins/ui_ux_intelligence/data/stacks/`.
- Runtime now loads catalog and search data only from `data/` and `data/stacks/`.
- `_temp_meta/` remains a staging folder and is not used by runtime code.

## Relocated Data

### Data files

- `products.csv`
- `styles.csv`
- `colors.csv`
- `typography.csv`
- `ui-reasoning.csv`
- `ux-guidelines.csv`
- `charts.csv`
- `landing.csv`
- `icons.csv`
- `app-interface.csv`
- `react-performance.csv`

### Stack files

- `angular.csv`
- `astro.csv`
- `flutter.csv`
- `html-tailwind.csv`
- `jetpack-compose.csv`
- `laravel.csv`
- `nextjs.csv`
- `nuxt-ui.csv`
- `nuxtjs.csv`
- `react-native.csv`
- `react.csv`
- `shadcn.csv`
- `svelte.csv`
- `swiftui.csv`
- `threejs.csv`
- `vue.csv`

## Reference-Only Files

These files were used only to guide original JS behavior and were not copied into runtime:

- `core.py`
- `search.py`
- `design_system.py`
- `quick-reference.md`
- `skill-content.md`

## Runtime Surface

- `kvdf ui-ux-intelligence source-status --json`
- `kvdf ui-ux-intelligence catalog --json`
- `kvdf ui-ux-intelligence search --query "..." --domain all --json`

## Notes

- No external GitHub repository is required.
- Font binaries, screenshots, previews, packaging, and unrelated wrappers were excluded.
- The relocation keeps the plugin standalone and local-first.
