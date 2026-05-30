# appfs-000-a

- Goal: Map repo conventions and safe integration points.
- Meaning: Learn how this repo already registers plugins, exposes commands, writes runtime state, and documents behavior so the new plugin follows the same rules.
- Allowed files:
  - plugins/
  - src/cli/
  - schemas/
  - docs/
  - .kabeeri/
- Forbidden files:
  - Implementation code outside analysis scope
- Acceptance: A clear analysis report exists with repo conventions and integration points.
- Tests / checks:
  - Repository inspection only; no behavior changes.
