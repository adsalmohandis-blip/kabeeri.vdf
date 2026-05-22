# KVDF Core Plugin Extraction Audit

## Report Summary

- report_type: `kvdf_core_plugin_extraction_audit`
- status: `warning`
- next_action: `Start Phase 1: bootstrap_ui extraction.`

## Core Keep

- planner contracts
- task lifecycle
- evolution lifecycle
- truth policy
- current-state policy
- boundary policy
- validation
- plugin loader
- runtime schemas
- source-control abstraction
- security gate contract
- dashboard state contracts
- handoff/release contracts
- policy gate contracts
- repository structure

## Plugin Candidates

| Candidate | Surface | Recommended Plugin | Priority | Phase |
| --- | --- | --- | --- | --- |
| bootstrap_ui | package dependency | bootstrap_ui | high | 1 |
| tailwind_ui | package devDependency | tailwind_ui | high | 2 |
| ui_dashboard_kits | knowledge/design_system/ui_execution_kit | ui_dashboard_kits | high | 3 |
| viber_app_builders | core app-builder bundle | viber_app_builders | medium | 4 |
| wordpress_builder | Core wordpress command surface | wordpress | high | 5 |
| github_provider | Core provider integration surface | github | high | 6 |
| docs_site | Core docs/site tooling | docs_site | medium | 7 |
| source_package | Core docs/site tooling | source_package | medium | 7 |
| multi_ai_governance | Core multi-AI governance surface | multi_ai_governance | medium | 8 |
| multi_ai_communications | Core multi-AI communication surface | multi_ai_communications | medium | 8 |
| vscode | Core editor bridge surface | vscode | medium | 9 |
| generator | Core scaffold surface | generator | medium | 10 |

## Already-Plugin Surfaces

- company_profile
- news_website
- blog
- ecommerce_mobile_app
- crm
- pos
- ecommerce
- booking

## Do Not Move

- planner
- validation
- plugin loader
- runtime schemas
- source-control abstraction
- security gate contract
- dashboard state contracts
- handoff/release contracts
- policy gate contracts
- repository structure

## Recommended Order

1. bootstrap_ui
2. tailwind_ui
3. ui_dashboard_kits
4. viber_app_builders
5. wordpress_builder
6. github_provider
7. docs_site
8. source_package
9. multi_ai_governance
10. multi_ai_communications
11. vscode
12. generator
