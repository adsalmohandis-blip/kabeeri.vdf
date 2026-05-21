# UI UX Intelligence Data

This folder stores KVDF-native data imported from the flat staging area:

- `plugins/ui_ux_intelligence/_temp_meta/`

Phase 1 uses the staging contract only. Later phases relocate approved data into the proper folders under `data/`.

## Source Staging Contract

- Data CSV files are relocated into `data/`.
- Stack CSV files are relocated into `data/stacks/`.
- Reference Python files are never copied into runtime as executable code.
- Reference Markdown files are not copied blindly into docs.
- `_temp_meta/` is ignored by git and can be safely removed after relocation.

## Expected Later-Phase Inputs

Data files:
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

Stack files:
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
