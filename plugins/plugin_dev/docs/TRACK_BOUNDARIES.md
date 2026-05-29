# Track Boundaries

- `plugin_folder_structure` owns workspace creation and workspace contract shape.
- `plugin_dev` owns the development lifecycle inside an approved workspace.
- `plugin_dev` must not create folder structure directly.
- `plugin_dev` must not install or publish plugins directly.
- `plugin_dev` must support generic plugin-to-plugin integration contracts.
