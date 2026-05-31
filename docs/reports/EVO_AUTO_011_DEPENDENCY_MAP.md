# EVO_AUTO_011 Dependency Map

## Priority

- ID: `evo-auto-011`
- Title: `Runtime schema registry enforcement`

## Upstream dependencies

- `schemas/runtime/schema_registry.json`
- `src/cli/validate.js`
- runtime JSON and JSONL state files
- explicit exemption support for example files

## Downstream dependents

- conflict scan
- session health checks
- future runtime state additions
- workspace governance reports

## Notes

- This priority depends on the runtime registry and validator being present.
- Once closed, it becomes the enforcement contract for future runtime state additions.

