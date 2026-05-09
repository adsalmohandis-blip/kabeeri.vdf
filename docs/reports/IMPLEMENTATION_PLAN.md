# Implementation Plan

Updated: 2026-05-09

This is the current forward implementation plan. Older phase plans are now
historical context; they should not be used as the active roadmap when they
contradict current runtime behavior.

## Current Baseline

Kabeeri VDF currently has:

- a working `kvdf` CLI runtime.
- governed `.kabeeri` workspace state.
- runtime schemas for core JSON and JSONL state.
- task governance, workstreams, app boundaries, tokens, locks, sessions, audit.
- Vibe-first commands and post-work capture lifecycle.
- live dashboard, task tracker live JSON, and dashboard API endpoints.
- Agile records and sprint cost summaries.
- AI usage, budgets, context packs, preflights, and model routing.
- policy gates for task, release, handoff, security, migration, and GitHub writes.
- security and migration governance.
- ADR and AI run history.
- common prompt layer and React Native Expo pack.
- design source governance and dashboard UX governance.
- package and upgrade checks.

## Guardrails

- `.kabeeri/` remains source of truth.
- CLI remains the engine; dashboard, docs, VS Code, and chat are surfaces.
- No GitHub mutation without explicit Owner approval and passing policy gates.
- No release/publish without readiness and governance checks.
- No raw-design frontend execution without approved design text specs.
- Do not recreate deleted duplicate folders.

## Phase A: Stabilize Current Work

Goal: make the current implementation safe to continue from.

Tasks:

- Review current `git status`.
- Group changes into coherent commits or a protected branch.
- Keep `OWNER_DEVELOPMENT_STATE.md` updated after each work session.
- Run the baseline checks before any release candidate:
  - `node bin\kvdf.js validate`
  - `node bin\kvdf.js validate runtime-schemas`
  - `npm test`
  - `npm run pack:check`

Outputs:

- clean branch/commit strategy.
- current reports synced with runtime.
- Owner-visible next-action notes.

## Phase B: Dashboard And VS Code Product Surface

Goal: make the live state easier for solo and team developers to use without
reading many files.

Tasks:

- Deepen `Task Tracker Live Board` with filters, views, and drilldowns.
- Add role-aware dashboard sections for Owner, developer, AI agent, QA, and solo mode.
- Improve empty/error/loading states.
- Add dashboard saved views for tasks, apps, workstreams, policy gates, cost, and handoff.
- Build VS Code extension views on top of existing `kvdf vscode scaffold`.

Outputs:

- richer dashboard UX.
- VS Code Ask Kabeeri and task tracker panels.
- updated dashboard UX tests.

## Phase C: Security And Privacy Depth

Goal: make safety checks stronger for real projects.

Tasks:

- Add PII/privacy rules to security governance.
- Add stack-specific secret patterns.
- Add framework-specific security checklist extensions.
- Include security/privacy status in readiness and handoff reports.

Outputs:

- stronger security scanner rules.
- deeper security readiness report.
- updated policy tests.

## Phase D: Design QA Automation

Goal: make design governance more practical for frontend execution.

Tasks:

- Add visual issue records and dashboard visibility.
- Add contrast/theme checks.
- Add screenshot review workflow and evidence fields.
- Add safe custom CSS/theme audit rules.

Outputs:

- design QA command depth.
- visual issue tracking.
- updated design governance docs and tests.

## Phase E: Framework Adapters

Goal: add optional stack-specific execution helpers without weakening the
governance model.

Tasks:

- Add migration adapters only as gated dry-run-first commands.
- Prioritize Laravel/MySQL, Node, and common frontend stacks.
- Add adapter manifests and safety policy checks.

Outputs:

- framework adapter docs.
- adapter runtime tests.
- policy-gated execution flow.

## Current Definition Of Done

A feature is complete when:

- runtime behavior exists or the docs explicitly say it is docs-only.
- new `.kabeeri` files have schemas where appropriate.
- CLI help and command reference are updated.
- current reports do not describe it as missing.
- tests and validation pass.
