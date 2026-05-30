# appfs-004-b

- Goal: Separate inputs from generated outputs.
- Meaning: Prevent generated roadmap/spec material from leaking into the input zone.
- Allowed files:
  - input docs
  - validation code
- Forbidden files:
  - Generated content paths
- Acceptance: Inputs and outputs are strictly separated.
- Tests / checks:
  - Separation invariant tests.
