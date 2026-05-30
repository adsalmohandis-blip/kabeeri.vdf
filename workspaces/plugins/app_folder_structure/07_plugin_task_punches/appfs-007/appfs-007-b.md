# appfs-007-b

- Goal: Emit a neutral source manifest.
- Meaning: Record that the real source layout will be created later by the selected stack/framework.
- Allowed files:
  - 08_source/source_manifest.json
  - docs
- Forbidden files:
  - Package-specific source shape
- Acceptance: The manifest states source tracking only.
- Tests / checks:
  - Source-manifest content tests.
