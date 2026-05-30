# appfs-005-b

- Goal: Require approved folder-structure profiles.
- Meaning: Fail safely when the category profile is missing, invalid, or incomplete.
- Allowed files:
  - validation code
  - reports
- Forbidden files:
  - Silent fallback to generic roadmap folders
- Acceptance: Missing profiles stop generation.
- Tests / checks:
  - Missing-profile failure tests.
