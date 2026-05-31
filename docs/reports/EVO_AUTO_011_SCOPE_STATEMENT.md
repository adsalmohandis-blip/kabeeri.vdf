# EVO_AUTO_011 Scope Statement

## Priority

- ID: `evo-auto-011`
- Title: `Runtime schema registry enforcement`
- Source: `technical_debt_review`

## Scope

This priority enforces schema coverage for runtime state files so new `.kabeeri/` JSON and JSONL files must either map to a schema or be explicitly exempted.

The scope includes:

- registry coverage checks
- unmapped runtime file blocking
- explicit exemption handling for example files
- readable validation output for operator review

## Out of scope

- changing the schema model itself
- inventing new runtime files without validation
- altering unrelated planner or questionnaire behavior
- removing explicit exemption support for example files

## Success criteria

- runtime files are checked against the schema registry
- unmapped files fail validation
- explicit exemptions still pass
- the validation summary is clear enough to use in conflict checks

