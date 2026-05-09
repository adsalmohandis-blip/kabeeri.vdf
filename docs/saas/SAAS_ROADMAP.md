# Kabeeri SaaS Roadmap

This roadmap is specific to the `product/kvdf-saas` branch.

## Phase 0: Branch Foundation

Status: started

- Add `apps/saas/` product shell.
- Add SaaS product blueprint.
- Add SaaS architecture document.
- Add basic API health and workspace demo endpoints.
- Keep local Kabeeri CLI tests passing.

## Phase 1: Real Hosted Workspace Model

- Add persistent database.
- Add organization, user, workspace, and workspace app entities.
- Add import from `.kabeeri/` JSON.
- Add export back to `.kabeeri/` JSON.
- Add workspace list/detail pages.
- Add schema validation for imported state.

## Phase 2: Hosted Vibe Intake

- Add one-sentence project goal intake.
- Generate adaptive questions.
- Generate docs-first tasks.
- Record user language preference.
- Show missing answers and next questions.

## Phase 3: Hosted Task Governance

- Add task board.
- Add assignment and roles.
- Add workstream and app boundary views.
- Add task access token lifecycle.
- Add evidence and Owner verification.

## Phase 4: AI Provider And Cost Control

- Add provider connections.
- Add model routing rules.
- Add token/cost recording.
- Add budget approvals.
- Add untracked usage buckets.
- Add cost dashboard.

## Phase 5: GitHub Integration

- Add GitHub App connection.
- Read repositories and branches.
- Sync tasks to issues.
- Read pull requests and checks.
- Enforce GitHub write policy gates.

## Phase 6: Release And Handoff

- Add readiness reports.
- Add governance reports.
- Add security and migration gates.
- Add release checklist.
- Add client/Owner handoff package.

## Phase 7: Production Hardening

- Add billing plans.
- Add audit retention.
- Add backups.
- Add rate limits.
- Add organization-level settings.
- Add compliance and data export controls.
