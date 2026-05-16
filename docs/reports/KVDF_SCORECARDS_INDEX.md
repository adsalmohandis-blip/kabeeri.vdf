# Kabeeri Scorecard Index

This is the master map for the current scorecard planning set.
Use it to move between the review-only scorecard report, the structured live state,
and the finalized four-layer scorecard model:

- Thinking cards
- Module cards
- Flow-step cards
- Relationship-pattern cards

Locked review families:

- Architecture
- AI Usability
- Plugin System
- Task Governance
- Docs Consistency
- Maintainability

Source of truth:

- `.kabeeri/reports/kabeeri_scorecards.json`
- `docs/reports/KVDF_SCORECARDS.md`

Current status:

- Review set complete and locked
- Evolution materialization not requested
- All cards are locked in this planning pass

## Final Layer Map

| Layer | Cards | Purpose |
| --- | ---: | --- |
| Thinking | 6 | The core mental model for Kabeeri. |
| Modules | 24 | The operating modules and capabilities. |
| Flow Steps | 11 | How the modules work together from start to finish. |
| Relationship Patterns | 11 | Cross-module dependencies and trust boundaries. |

## Family Overview

| Family | Cards | Focus |
| --- | ---: | --- |
| Thinking | 6 | The core mental model for Kabeeri. |
| Modules | 24 | The operating modules and capabilities. |
| Flow Steps | 11 | How the modules work together from start to finish. |
| Relationship Patterns | 11 | Cross-module dependencies and trust boundaries. |

## Thinking Cards

| Card ID | Title | Score | Band | Risk | Review Focus |
| --- | --- | ---: | --- | --- | --- |
| `architecture` | Architecture and track boundaries | 4.6 | strong | medium | Canonical paths, alias drift, live vs historical surfaces. |
| `ai_usability` | AI usability and next-action clarity | 4.4 | watch | medium | Next-action language, JSON shape consistency, alias noise. |
| `plugin_system` | Standalone plugin system | 4.5 | strong | low | Bundle contract parity, removable lifecycle, domain pack maturity. |
| `task_governance` | Task governance and execution control | 4.7 | strong | low | Packet, executor contract, coverage, verification, archive sync. |
| `docs_consistency` | Documentation consistency and source-of-truth alignment | 3.6 | watch | medium | Docs generation, command registry alignment, manual duplication drift. |
| `maintainability` | Maintainability and shared service extraction | 3.8 | watch | medium | Shared service extraction, command layer size, ownership boundaries. |

## Module Cards

| Card ID | Title | Score | Band | Risk | Review Focus |
| --- | --- | ---: | --- | --- | --- |
| `cli_engine` | CLI Engine | 4.7 | strong | medium | Routing, guards, state access, and governed reports. |
| `ai_cli_contract` | AI/CLI Operating Contract | 4.4 | watch | medium | Boundary between AI reasoning and CLI execution. |
| `workspace_state` | Workspace State | 4.8 | strong | low | `.kabeeri/` as live memory and source of truth. |
| `session_track_router` | Session Track Router | 4.4 | watch | medium | Owner/app routing and track clarity. |
| `project_intake_profile` | Project Intake and Profile Router | 4.5 | strong | medium | Project shape, profile routing, downstream planning. |
| `delivery_mode_advisor` | Delivery Mode Advisor | 4.3 | watch | medium | Agile vs Structured choice and downstream visibility. |
| `blueprint_data_design` | Blueprint and Data Design | 4.8 | strong | medium | Implementation shape, entities, relationships, constraints. |
| `questionnaires` | Questionnaires | 4.7 | strong | medium | Missing facts, scope clarity, downstream linkage. |
| `prompt_packs` | Prompt Packs | 4.6 | strong | medium | Stack-aware guidance, curation, runtime alignment. |
| `task_governance` | Task Governance | 4.7 | strong | low | Task lifecycle, traceability, execution control. |
| `task_packet` | Task Packet | 4.8 | strong | medium | Control-plane packet between planning and execution. |
| `executor_contract` | Executor Contract | 4.8 | strong | medium | Packet-only boundary for the executor. |
| `batch_execution` | Batch Execution | 4.5 | strong | medium | Governed ordered execution of approved work. |
| `plugin_system` | Plugin System | 4.5 | strong | low | Removable plugin lifecycle and bundle consistency. |
| `app_builder_plugins` | App Builder Plugins | 4.6 | strong | medium | Domain-specific plugin family and bundle parity. |
| `multi_ai_governance` | Multi-AI Governance | 4.6 | strong | medium | Leadership, queues, leases, handoffs, merge bundles. |
| `evolution_steward` | Evolution Steward | 4.7 | strong | medium | Framework-owner backlog and change management. |
| `dashboard` | Dashboard | 4.5 | strong | medium | Live observability and current state. |
| `reports_traceability` | Reports and Traceability | 4.7 | strong | medium | Evidence, history, traceability, audit records. |
| `validation_schemas` | Validation and Schemas | 4.8 | strong | medium | Runtime file checks and schema-backed drift detection. |
| `policy_gates` | Policy Gates | 4.6 | strong | medium | Safety rules for risky operations. |
| `design_governance` | Design Governance | 4.5 | strong | medium | Design source approval and frontend spec control. |
| `ai_cost_control` | AI Cost Control | 4.4 | watch | medium | Usage, budgets, routing, and cost visibility. |
| `handoff_release` | Handoff and Release | 4.6 | strong | medium | Finish gate for delivery and release readiness. |

## Flow-Step Cards

| Card ID | Title | Score | Band | Risk | Review Focus |
| --- | --- | ---: | --- | --- | --- |
| `flow_entry_routing` | Entry and Routing | 4.4 | watch | medium | First-session entry and lane selection. |
| `flow_workspace_state` | Workspace State | 4.8 | strong | low | `.kabeeri/` as durable live memory. |
| `flow_planning_intake` | Planning and Intake | 4.6 | strong | medium | Profile, delivery mode, questionnaire, and design intake. |
| `flow_governance_safety` | Governance and Safety | 4.7 | strong | low | Task rules, policy gates, packet readiness, and boundaries. |
| `flow_execution_task_control` | Execution and Task Control | 4.7 | strong | medium | Packet, contract, lifecycle, and batch execution. |
| `flow_plugins_optional_compilers` | Plugins and Optional Compilers | 4.5 | strong | medium | Optional capability bundles and domain packs. |
| `flow_dashboard_reporting` | Dashboard and Reporting | 4.6 | strong | medium | Live observability and structured evidence. |
| `flow_validation_schemas` | Validation and Schemas | 4.8 | strong | medium | Drift checks against schema-backed runtime shapes. |
| `flow_handoff_release` | Handoff and Release | 4.6 | strong | medium | Delivery finish gate and release readiness. |
| `flow_evolution_improvement` | Evolution and Improvement Loop | 4.7 | strong | medium | Scorecards, priorities, backlog, and change slices. |
| `flow_relationship_patterns` | Relationship Patterns and Cross-Module Trust | 4.6 | strong | medium | Dependency review across the full system. |

## Relationship-Pattern Cards

| Card ID | Title | Score | Band | Risk | Review Focus |
| --- | --- | ---: | --- | --- | --- |
| `rel_ai_cli` | AI -> CLI | 4.7 | strong | medium | AI proposes, CLI enforces. |
| `rel_cli_workspace` | CLI -> Workspace State | 4.8 | strong | low | CLI writes and reads the live memory. |
| `rel_questionnaire_tasks` | Questionnaire -> Tasks | 4.7 | strong | medium | Intake answers become concrete task scope. |
| `rel_task_packet_executor` | Task Packet -> Executor Contract | 4.8 | strong | medium | Safe planning-to-execution boundary. |
| `rel_plugin_loader_bundles` | Plugin Loader -> Plugin Bundles | 4.5 | strong | low | Centralized plugin discovery and reversible lifecycle. |
| `rel_dashboard_reports` | Dashboard -> Reports | 4.6 | strong | medium | Live truth vs historical evidence. |
| `rel_validation_runtime` | Validation -> Runtime State | 4.8 | strong | medium | Drift detection against current runtime shapes. |
| `rel_policy_release` | Policy Gates -> Release and GitHub Writes | 4.6 | strong | medium | Safety gate before outward actions. |
| `rel_multi_ai_evolution` | Multi-AI Governance -> Evolution | 4.6 | strong | medium | Multi-agent coordination feeding controlled improvement. |
| `rel_docs_registry` | Docs -> Command Registry | 4.7 | strong | medium | Documentation mirrors the live CLI contract. |
| `rel_app_builder_business_types` | App Builder Plugins -> Business-Type Packs | 4.6 | strong | medium | Domain-aware plugin modes and consistent pack structure. |

## How To Use This Index

1. Start with the family overview if you want the broad map.
2. Jump to the relevant family table if you want a specific card.
3. Open `docs/reports/KVDF_SCORECARDS.md` for the narrative review summary.
4. Inspect `.kabeeri/reports/kabeeri_scorecards.json` when you want the structured live snapshot.
5. Only move to Evo planning later, and only for cards you explicitly choose.

## Next Review Moves

- Revisit any card that needs a wording change.
- Turn this index into a docs-site page if you want a browser-friendly master map.
- Use the review summary and structured state as the canonical planning set.
