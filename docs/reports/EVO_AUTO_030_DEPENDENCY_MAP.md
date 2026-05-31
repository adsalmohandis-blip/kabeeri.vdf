# EVO_AUTO_030 Dependency Map

## Priority

- ID: `evo-auto-030-docs-cli-sync`
- Title: `Docs-to-CLI Synchronization`

## Upstream dependencies

- `kvdf docs workflow`
- `kvdf docs sync`
- `kvdf docs validate`
- `docs/reports/DOCS_SITE_GENERATION_WORKFLOW.json`
- `docs/reports/DOCS_SITE_SYNC_REPORT.json`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/site/`

## Downstream dependents

- project profile routing
- docs generation workflow
- docs site publishing
- capability documentation

## Notes

- Sync is the contract that keeps docs honest about the CLI.
- Later docs work should continue to read from the same workflow/sync artifacts.
- A healthy sync report is meaningful because it proves the docs surface and the runtime surface agree.
