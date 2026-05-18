# KVDF Canonical Capability Registry

Generated: 2026-05-18T00:00:00.000Z

This registry is the canonical capability map for KVDF Core. It separates
native engine capabilities, framework-owner delivery, vibe/app delivery,
plugin bundles, runtime-only state boundaries, and generated artifacts.

## Registry Overview

| Area ID | Title | Default Track | Capabilities |
| --- | --- | --- | ---: |
| `core_native_system_capabilities` | Core Native System Capabilities | `shared` | 14 |
| `kvdf_development_pipeline_dev` | KVDF Development Pipeline Dev | `framework_owner` | 9 |
| `vibe_development_pipeline_dev` | Vibe Development Pipeline Dev | `vibe_app_developer` | 10 |
| `plugins_dev` | Plugins Dev | `plugin` | 13 |

## What The Registry Covers

- **Core Native System Capabilities**: always-available CLI/runtime features such as resume, validation, questionnaires, tasks, evolution, dashboards, handoff, policy, and packaging.
- **KVDF Development Pipeline Dev**: framework-owner work that keeps KVDF itself evolving with direct-to-main as the default solo-owner policy.
- **Vibe Development Pipeline Dev**: app-building workflow with file-based intake, blueprinting, task slicing, local-only handoff, and optional GitHub-backed delivery.
- **Plugins Dev**: removable bundles that extend KVDF with app builders, GitHub sync, multi-AI governance, KVDF development, and app maintenance.

## Runtime Boundaries

| Path | Classification | Notes |
| --- | --- | --- |
| `.kabeeri/` | `runtime_only` | Workspace runtime state; do not commit unless explicitly required. |
| `.kabeeri/tasks.json` | `runtime_only` | Active task ledger. |
| `.kabeeri/evolution.json` | `runtime_only` | Evolution / milestone ledger. |
| `.kabeeri/plugins.json` | `runtime_only` | Plugin enablement state. |
| `.kabeeri/dashboard/*` | `runtime_only` | Dashboard state and exported local views. |
| `.kabeeri/reports/*` | `runtime_only` | Generated runtime reports. |
| `.kabeeri/questionnaires/*` | `runtime_only` | Questionnaire questions, answers, and planning output. |
| `.kabeeri/site/*` | `runtime_only` | Local site export output. |

## Generated Artifacts

| Path | Classification | Notes |
| --- | --- | --- |
| `docs/reports/*` | `generated_artifact` | Audit, coverage, and capability reports; safe to regenerate but not canonical source. |
| `docs/site/site-manifest.json` | `generated_artifact` | Generated docs-site manifest. |
| `docs/site/page-contracts.json` | `generated_artifact` | Generated docs-site page contracts. |
| `.kabeeri/dashboard/*` | `generated_artifact` | Dashboard-derived local views. |
| `.kabeeri/reports/*` | `generated_artifact` | Runtime report artifacts. |

## Use It As The Source Of Truth

- Use `kvdf capability registry --json` for the canonical machine-readable view.
- Use `kvdf capability registry` for the grouped readable summary.
- Use the capability registry to resolve ownership, track, runtime-boundary, and generated-artifact questions before inventing new capability names.
