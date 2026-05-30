# Commands

Supported commands in the package shell:

- `status` - show the current catalog, readiness, and output contracts
- `create` - generate the full planning bundle for a selected category profile
- `profile` - resolve a deterministic category profile
- `plan` - build the source, questionnaire, spec, roadmap, and workspace plan
- `validate` - validate the registry, selection, and derived artifacts

These commands prepare the app-creation pipeline; they do not build the app directly.
`create` also writes `.kabeeri/app_pipeline_contract.json`, which is the strict handoff that `kvdf app-folder create` must read before workspace materialization.
