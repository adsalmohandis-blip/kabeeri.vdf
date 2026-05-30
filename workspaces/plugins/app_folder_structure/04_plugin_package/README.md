# App Folder Structure

`app_folder_structure` is the governed app-workspace contract engine for KVDF/KVDOS.

It creates and validates app workspaces under `workspaces/apps/<app-slug>/` with:

- a fixed top-level pipeline
- category-governed roadmap internals
- stack-adaptive source tracking
- handoff-grade specification folders
- evidence, reviews, and release governance

Primary commands:

- `kvdf app-folder status`
- `kvdf app-folder create --app <app-slug> --category <category>`
- `kvdf app-folder validate --app <app-slug>`
- `kvdf app-folder repair --app <app-slug>`
- `kvdf app-folder manifest --app <app-slug>`
- `kvdf app-folder print --category <category>`

The workspace planning artifacts for this plugin live in the plugin-dev workspace folders outside this package.

The package follows the standard plugin-package shape, including:

- `plugin.json`
- `bootstrap.js`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `src/`
- `schemas/`
- `docs/`
- `tests/`
- `prompts/`
- `dashboard/`
- `examples/`
- `config/`
- `plugin_manifest.json`
