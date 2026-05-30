# Plugin Dependencies

- `plugin_folder_structure` for plugin workspace governance patterns
- `app_category_registry` for approved category folder-structure profiles
- repo CLI validation and evidence conventions
# Plugin Dependencies

Runtime dependencies:

- `plugin_folder_structure` for governed plugin-workspace conventions and track-aware plugin packaging patterns
- `app_category_registry` for approved folder-structure profiles
- `track_control` for explicit track routing
- `workspace_naming` for underscore slug normalization

Behavioral dependencies:

- safe filesystem writes
- manifest read/write helpers
- validation and evidence helpers

This plugin should fail closed if the category profile or workspace contract is missing.
