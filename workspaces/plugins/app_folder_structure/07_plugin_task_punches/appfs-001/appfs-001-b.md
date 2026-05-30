# appfs-001-b

- Goal: Add status output and discoverability reporting.
- Meaning: Give users and workers a read-only way to see what the plugin is for before any workspace logic is added.
- Allowed files:
  - plugins/app_folder_structure/*
  - src/cli/*
- Forbidden files:
  - Workspace creation logic
- Acceptance: Status reports plugin state without creating folders.
- Tests / checks:
  - CLI smoke for status/help.
