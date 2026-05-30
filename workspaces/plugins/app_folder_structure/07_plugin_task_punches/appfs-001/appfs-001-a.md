# appfs-001-a

- Goal: Create the plugin shell and manifest.
- Meaning: Establish app_folder_structure as a real plugin package with a manifest and entry point, but no app-workspace logic yet.
- Allowed files:
  - plugins/app_folder_structure/plugin.json
  - plugins/app_folder_structure/README.md
  - plugins/app_folder_structure/bootstrap.js
  - plugins/app_folder_structure/index.js
- Forbidden files:
  - Workspaces
  - runtime
  - unrelated plugins
- Acceptance: Plugin exists as a safe shell with documented purpose.
- Tests / checks:
  - Plugin metadata loads and surfaces a status command.
