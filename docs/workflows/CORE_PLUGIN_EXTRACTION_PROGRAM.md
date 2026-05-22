# Core Plugin Extraction Program

## Why KVDF Core Should Stay Slim

KVDF Core should stay focused on the control plane that keeps the repository safe, truthful, and reproducible:

- planner contracts
- truth/current-state/boundary policy
- task and evolution lifecycle
- validation
- plugin loading and runtime schemas
- source-control abstraction
- security gate contracts
- dashboard state contracts
- handoff and release contracts
- policy gate contracts

Anything that adds product-specific UI, platform-specific integration, or generated assets should be treated as optional and removable unless it is part of Core governance.

## What Belongs In Core

Core should keep the rules and contracts that every plugin or workflow depends on:

- orchestration and planning
- validation and schema checks
- state contracts and boundary policies
- source-control abstractions
- security and release governance
- plugin discovery and enablement

Core can mention plugins and route to them, but it should not own their implementation details.

## What Belongs In Plugins

Plugins should own the implementation details that can be removed without breaking Core:

- UI libraries and UI providers
- dashboard examples, templates, snippets, and checks
- app and domain builders
- platform builders such as WordPress
- provider implementations such as GitHub
- optional docs/site publishing tools
- optional multi-AI governance implementations

## Safe Migration Rules

1. Start with audit and classification only.
2. Extract one surface family at a time.
3. Keep compatibility wrappers when an old path is still used by scripts or docs.
4. Avoid changing Core dependencies unless the plugin extraction phase explicitly requires it.
5. Never commit runtime state under `.kabeeri/` as part of extraction work.
6. Treat plugin extraction as reversible until the new plugin surface is validated.
7. Prefer read-only wrappers and reports before removing legacy Core code.

## Compatibility Wrapper Rules

- Existing commands may delegate to plugin commands while preserving their old names.
- Legacy file paths can remain as thin wrappers if tests or scripts still call them.
- Wrappers should avoid re-implementing plugin logic.
- Wrappers should clearly point to the plugin-owned implementation.

## Extraction Order

The recommended extraction order starts with the highest Core coupling risk:

1. `bootstrap_ui`
2. `tailwind_ui`
3. `ui_dashboard_kits`
4. `viber_app_builders`
5. `wordpress_builder`
6. `github_provider`
7. `docs_site`
8. `source_package`
9. `multi_ai_governance`
10. `multi_ai_communications`
11. `vscode`
12. `generator`

The audit also keeps Core-owned contracts in place so the extraction can proceed safely.

## Direct-To-Main Workflow

Owner-track extraction work should stay direct-to-main:

1. Add a read-only audit.
2. Add the plugin surface.
3. Add compatibility wrappers if needed.
4. Add tests for the new surface and the old compatibility path.
5. Run the standard validation suite.
6. Commit the change directly to main when the checks pass.

## Current Audit Reference

The current Core plugin extraction audit is written to:

- [`docs/reports/CORE_PLUGIN_EXTRACTION_AUDIT.md`](../reports/CORE_PLUGIN_EXTRACTION_AUDIT.md)

