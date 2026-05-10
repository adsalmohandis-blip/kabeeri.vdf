# Missing Requirements Backlog

Updated: 2026-05-10

This backlog now lists active missing or clearly partial work only. Older
roadmap rows that said Vibe-first, policy gates, ADR/AI run history, runtime
schemas, task tracker live JSON, React Native Expo, common prompt layer,
product packaging, and release/GitHub gates were missing are superseded by the
current runtime. It also treats Dashboard UX role/widget governance, Design
Governance unified reports, ADR/AI decision tracing, and React Native Expo
v0.2.0 as implemented.

## Summary

| Metric | Count |
| --- | ---: |
| Active missing/partial backlog groups | 8 |
| High priority groups | 4 |
| Medium priority groups | 4 |
| Owner-gated release actions | 3 |

## Active Backlog

| Backlog ID | Area | Current State | Priority | Required Work | Acceptance Check |
| --- | --- | --- | --- | --- | --- |
| BACKLOG-001 | Working tree stabilization | Current repo has many intentional modified/deleted/untracked files. | high | Create Owner-approved branch/commit grouping before release. | `git status --short` is reviewed and changes are grouped or intentionally documented. |
| BACKLOG-002 | VS Code extension UI | `kvdf vscode scaffold` exists; full extension sidebar/webviews are not implemented. | high | Build Ask Kabeeri, task tracker, dashboard, verify queue, and progress views. | Extension opens inside VS Code and reads `.kabeeri` state without becoming source of truth. |
| BACKLOG-003 | Dashboard UX product polish | Live dashboard, task tracker, role guidance, widget registry, workspace strategy, and live-state UX rules exist; richer interactive navigation is still needed. | high | Add saved views, date ranges, role-specific filtering, and deeper drilldowns. | Dashboard remains usable on large projects and passes `kvdf dashboard ux`. |
| BACKLOG-004 | Security/privacy depth | Security scan/report/gate exists but is lightweight. | high | Add PII/privacy checks, framework-specific secret patterns, and deeper readiness checklist. | Security gate blocks high-risk examples and reports privacy findings. |
| BACKLOG-005 | Design QA automation | Design governance, visual review records, and unified governance reports exist; visual automation is limited. | medium | Add contrast checks, browser screenshot helpers, theme audit, safe CSS rules, and visual issue records. | Design reports include automated visual evidence and gate-ready findings. |
| BACKLOG-006 | Migration execution adapters | Migration plan/check/report/rollback/audit exist as governance dry-runs. | medium | Add optional framework/database adapters with explicit policy gates. | Adapter dry-run passes tests; real execution remains gated. |
| BACKLOG-007 | Bilingual docs parity | Arabic/English docs exist; full parity is still ongoing. | medium | Continue parity updates for root docs, numbered docs, docs site, and current runtime references. | New/updated docs have Arabic and English counterparts or a documented exception. |
| BACKLOG-008 | Historical report labeling | Current reports are refreshed; old phase reports remain historical. | medium | Add clear historical snapshot notes only where old reports may be misread. | Historical reports do not contradict current reports without a visible note. |

## Owner-Gated Release Actions

| Release Item | Status | Gate |
| --- | --- | --- |
| Publish v1.0.0 GitHub release | deferred | explicit Owner approval + release policy + GitHub write policy |
| Publish v3.0.0 GitHub release | deferred | explicit Owner approval + release policy + GitHub write policy |
| Publish v4.0.0 GitHub release | deferred | explicit Owner approval + release policy + GitHub write policy |

## Closed Backlog Items

These items were backlog entries in older snapshots but are now implemented:

- Vibe-first runtime and natural-language task suggestions.
- Post-work capture.
- Policy engine and approval gates.
- Task tracker dashboard and live JSON file.
- Runtime schema registry.
- ADR and AI run history.
- ADR/AI decision trace and two-way run linking.
- Common prompt layer.
- React Native Expo prompt pack v0.2.0.
- Agile runtime records.
- Product packaging and upgrade guide.
- Release/GitHub publish gates.
- Task governance consolidation.
- Dashboard UX role visibility, widget registry, app/workspace strategy, and live-state UX rules.
- Unified Design Governance report.

## Notes

- This file intentionally avoids preserving the old 143-item stale backlog as
  active work.
- For historical traceability, see `REQUIREMENTS_TRACEABILITY_MATRIX.md`.
- For current priority order, see `IMPLEMENTATION_PLAN.md`.
