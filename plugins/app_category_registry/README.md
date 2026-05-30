# app_category_registry

`app_category_registry` is the category brain for KVDOS app creation.

It turns a new app request into a governed category profile, then resolves the exact planning inputs the rest of KVDOS needs to continue safely and consistently.

## What it does

- exposes the active, ready, default-visible app categories
- builds a deterministic category profile for the selected app
- routes source intake into the correct planning tracks
- loads the right questionnaire packs for the chosen category profile
- resolves required specs and micro-doc contracts
- generates the roadmap order and workspace plan
- writes evidence and readiness outputs for downstream KVDOS stages

## What it is not

- it does not build the app directly
- it does not choose hidden categories for the user
- it does not bypass readiness, compatibility, or approval rules

## Main outputs

- `.kabeeri/app_pipeline_contract.json`
- `.kabeeri/app_category_profile.yaml`
- `.kabeeri/source_inventory.yaml`
- `.kabeeri/source_map.yaml`
- `.kabeeri/questionnaire_profile.yaml`
- `.kabeeri/spec_profile.yaml`
- `.kabeeri/micro_doc_contract.yaml`
- `.kabeeri/roadmap_profile.yaml`
- `.kabeeri/roadmap_order.yaml`
- `.kabeeri/workspace_plan.yaml`
- `.kabeeri/readiness_profile.yaml`
- `.kabeeri/category_evidence.json`

## Command surface

- `kvdf app-category status`
- `kvdf app-category profile <category>`
- `kvdf app-category plan <category>`
- `kvdf app-category validate <category>`
- `kvdf app-category create <category>`

`kvdf app-category create` writes the strict app pipeline contract that `kvdf app-folder create` consumes next.

The workspace root preserves the planning history and the package root contains the executable plugin shell.
