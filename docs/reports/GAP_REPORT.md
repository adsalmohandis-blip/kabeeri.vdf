# Gap Report

Updated: 2026-05-09

This report compares the current repository state with the intended Kabeeri VDF
product direction. It focuses on active gaps only. Historical roadmap gaps that
have since been implemented are not repeated as missing.

## Executive Summary

Kabeeri VDF now has a working local runtime around `.kabeeri` state, CLI
commands, schemas, policy gates, Vibe-first flows, task tracker live JSON,
dashboard exports/API, Agile records, AI cost controls, design governance,
ADR/AI run history, packaging checks, and GitHub dry-run/policy-gated flows.

Last verified:

- `node bin\kvdf.js validate` passed.
- `node bin\kvdf.js validate runtime-schemas` passed.
- `npm test` passed with 48 integration tests.
- `npm run pack:check` reported packaging status `ready`.

## Implemented Since Original Gap Snapshot

| Area | Current Evidence |
| --- | --- |
| Vibe-first runtime | `kvdf vibe`, `kvdf ask`, `kvdf capture`; `.kabeeri/interactions/*`; Vibe docs. |
| Post-work capture | `.kabeeri/interactions/post_work_captures.json`; capture command and tests. |
| Task tracker live JSON | `.kabeeri/dashboard/task_tracker_state.json`; `kvdf task tracker`; `/__kvdf/api/tasks`. |
| Runtime schemas | `schemas/runtime/schema_registry.json`; 68 JSON mappings and 13 JSONL mappings. |
| Policy gates | task, release, handoff, security, migration, and GitHub write policies. |
| Security governance | `kvdf security scan/report/gate/list/show`; readiness state. |
| Migration safety | plan, rollback-plan, check, report, audit, and migration gate. |
| ADR / AI run history | `kvdf adr`; `kvdf ai-run`; accepted/rejected output review state. |
| Agile runtime | backlog, epic, story, sprint, and sprint summary commands. |
| Common prompt layer | `prompt_packs/common/`; prompt composition runtime. |
| React Native Expo pack | `prompt_packs/react-native-expo/` and integration tests. |
| Design governance | design source intake, text/page/component specs, visual review, audit, and gates. |
| Dashboard UX governance | dashboard UX audit docs and runtime command. |
| Release/GitHub publish gates | release and GitHub writes are blocked unless policy gates pass. |
| Product packaging | packaging command, packaging guide, upgrade guide, and ready pack check. |

## Active Gaps

| Gap ID | Area | Current State | Risk | Recommended Action |
| --- | --- | --- | --- | --- |
| GAP-001 | Working tree release safety | The repo is in active development with many modified/deleted/untracked files. | Release or publish could accidentally include unfinished work. | Commit, branch, or snapshot before public release. |
| GAP-002 | VS Code extension product | `kvdf vscode scaffold` exists, but full sidebar/webview extension is not built. | Kabeeri remains CLI/dashboard-first instead of editor-native. | Build extension views for Ask Kabeeri, task board, tracker, verify queue, and dashboard. |
| GAP-003 | Dashboard product polish | Live dashboard and task tracker exist; UX is still basic. | Teams may need filters, role views, drilldowns, and better large-project navigation. | Deepen dashboard UX with tabs, filters, saved views, role visibility, and richer empty/error states. |
| GAP-004 | Security/privacy depth | Scanner and gates exist but are lightweight. | PII, privacy, framework-specific secrets, and enterprise checks may be missed. | Add privacy/PII policy, stack-specific patterns, and readiness checklist depth. |
| GAP-005 | Migration execution adapters | Migration governance exists but does not run real database migrations. | Users may assume it executes migrations instead of governing readiness. | Add Laravel/MySQL/etc. adapters later, explicitly gated and dry-run first. |
| GAP-006 | Design QA automation depth | Design governance and visual review records exist; browser screenshot/contrast automation is still limited. | Frontend work may pass governance without strong visual regression evidence. | Add contrast checks, screenshot review helpers, theme audit, and visual issue tracking. |
| GAP-007 | Bilingual documentation parity | Arabic/English docs exist and parity policy exists; full line-by-line parity is not guaranteed. | Onboarding may differ by language. | Continue parity passes for root docs, docs site, and numbered docs. |
| GAP-008 | Historical report freshness | Some phase reports intentionally preserve old snapshots. | Future sessions may read a historical report as current. | Keep current reports clearly dated and mark older phase reports as historical. |

## No Longer Active Gaps

| Former Gap | Current Status |
| --- | --- |
| Missing Vibe-first runtime | Implemented. |
| Missing post-work capture | Implemented. |
| Missing policy engine | Implemented. |
| Missing security scan/report/gate | Implemented. |
| Missing migration safety runtime | Implemented as governance dry-run. |
| Missing ADR command | Implemented. |
| Missing AI run history workflow | Implemented. |
| Missing common prompt layer | Implemented. |
| Missing React Native Expo prompt pack | Implemented. |
| Missing runtime schemas | Implemented and validated. |
| Missing product packaging / upgrade docs | Implemented. |
| Missing task tracker dashboard live JSON | Implemented. |
| Missing release/GitHub publish gates | Implemented. |

## Recommended Next Implementation Order

1. Stabilize the current working tree with an Owner-approved branch/commit.
2. Deepen the live dashboard product UX and VS Code extension surface.
3. Expand security/privacy scanner rules and readiness checklists.
4. Add design QA automation around screenshots, contrast, themes, and visual issues.
5. Add framework-specific migration adapters after the current governance-only model is stable.

## No-Go Items

- Do not push or publish without explicit Owner approval.
- Do not run confirmed GitHub writes unless the GitHub write policy gate passes.
- Do not treat dashboard or VS Code UI as source of truth; `.kabeeri` remains canonical.
- Do not recreate removed duplicate folders such as `task_governance/`.
