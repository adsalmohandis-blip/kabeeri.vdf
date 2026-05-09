# 03 - Framework Architecture

Kabeeri VDF is organized around a simple principle:

```text
project idea -> structured answers -> governed tasks -> composed prompts -> reviewed output
```

## Main Layers

- Documentation and onboarding: `README.md`, `docs/`, and `docs_site/`.
- Project intake: `project_intake/` and questionnaires.
- Planning and capability coverage: `standard_systems/` and `questionnaire_engine/`.
- Runtime state: `.kabeeri/` files created by `kvdf init`.
- CLI engine: `bin/kvdf.js` and `src/cli/`.
- Governance: `governance/`, policies, workstreams, apps, tokens, sessions, and locks.
- Prompt packs: `prompt_packs/` plus `prompt_packs/common/`.
- Dashboards and reports: `dashboard/`, readiness reports, governance reports, and handoff packages.

## Runtime Contract

The CLI is the execution engine. Chat, dashboard actions, VS Code tasks, and
future UI surfaces should ultimately write governed state or call CLI behavior
instead of inventing a separate source of truth.

## Current Capability Map

For the up-to-date system view, use:

```text
docs/SYSTEM_CAPABILITIES_REFERENCE.md
```
