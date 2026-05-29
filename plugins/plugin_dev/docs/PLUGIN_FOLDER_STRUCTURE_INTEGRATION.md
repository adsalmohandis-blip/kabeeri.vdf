# plugin_folder_structure Integration

`plugin_dev` reads the workspace contract from `plugin_folder_structure` and delegates workspace creation/checking when safe.

If `plugin_folder_structure` is missing or disabled:
- `plugin_dev` runs in limited mode
- only read-only discovery commands should be used
