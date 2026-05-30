# appfs-002-b

- Goal: Validate supported workspace types and reject unsupported ones.
- Meaning: Fail closed for unrecognized workspace types and unsafe roots.
- Allowed files:
  - validation code
  - schemas
  - reports
- Forbidden files:
  - Auto-creating unsupported types
- Acceptance: Invalid workspace types are rejected.
- Tests / checks:
  - Unsupported-type validation tests.
