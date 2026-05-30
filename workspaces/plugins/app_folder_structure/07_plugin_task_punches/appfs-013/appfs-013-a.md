# appfs-013-a

- Goal: Upgrade existing workspaces additively to the full canonical set.
- Meaning: Add missing folders/files without deleting compact folders already present.
- Allowed files:
  - workspace root
  - manifests
  - mapping docs
- Forbidden files:
  - Renaming or deleting compact folders
- Acceptance: Existing compact workspaces are upgraded additively.
- Tests / checks:
  - Additive-upgrade tests.
