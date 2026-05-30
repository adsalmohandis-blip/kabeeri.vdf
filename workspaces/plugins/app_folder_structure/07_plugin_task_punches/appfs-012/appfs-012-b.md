# appfs-012-b

- Goal: Add safe repair, manifest, evidence, and hardening tests.
- Meaning: Ensure repair is additive only and produces evidence.
- Allowed files:
  - validation
  - repair
  - evidence
  - tests
- Forbidden files:
  - Deletion or overwrite of user content
- Acceptance: Repair writes evidence and preserves content.
- Tests / checks:
  - Repair/evidence tests.
