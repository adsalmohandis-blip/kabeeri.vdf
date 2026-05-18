# KVDF-Led Delivery

## Purpose

KVDF-led delivery is the core workflow for turning an approved Evolution into a
finished delivery slice. It keeps the local workspace authoritative, keeps the
task ledger and Evolution ledger in sync, and optionally adds a GitHub-backed
handoff layer when the workspace is ready to publish through a branch and PR.

## When To Use It

Use KVDF-led delivery when:

- the product request has already passed intake, review, and approval
- the current work must be delivered as one Evolution slice
- the workspace must remain local-first
- GitHub may be used as a handoff layer but is not required
- the owner wants a branch, PR, and review gate before merging to `main`

## Delivery Modes

### Local-Only Mode

Local-only mode is the default and always valid.

Use it when:

- the workspace is offline or GitHub is unavailable
- the team wants to finish the Evolution entirely inside the workspace
- the delivery must not depend on external publishing tools

Required outcome:

- tasks are completed
- tasks are verified and archived
- the parent Evolution auto-closes
- the final handoff report is written locally

### GitHub-Enabled Mode

GitHub-enabled mode is optional.

Use it when:

- the delivery should be published through a branch and PR
- the owner wants review and merge control
- the workspace is ready to mirror the local result into GitHub

Required outcome:

- a branch is created from the approved Evolution slice
- tests run before commit
- the approved changes are committed and pushed
- a PR is prepared or created
- Owner review happens before merge
- `main` is merged only after approval
- the latest `main` is pulled before the next Evolution begins

## Required Checks Before Implementation

Before any implementation begins, confirm:

1. The target repo is correct.
2. The target workspace is correct.
3. The active track is correct.
4. The evolution scope is approved.
5. The runtime state is local-only and not part of the commit payload.

Run and inspect:

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short
```

Then confirm:

- app-track work stays in the app workspace
- owner-track work stays in KVDF core
- no cross-track implementation starts by accident
- any ambiguity returns the work to planning

## Branch, Commit, Push, PR Rules

When GitHub handoff is enabled:

1. Create a branch for the approved Evolution slice.
2. Run the required tests.
3. Commit only the intended source, docs, and deliverable artifacts.
4. Do not commit `.kabeeri/` runtime state or transient execution outputs unless
   the Evolution explicitly requires it.
5. Push the branch.
6. Prepare or create the PR.
7. Route the PR to Owner review.
8. Merge only after Owner approval.
9. Pull the latest `main`.
10. Re-validate the workspace.
11. Start the next Evolution only after the sync is clean.

## Required Final Report

The handoff report must include:

- Evolution ID
- Evolution name
- Task Punch summary
- branch name
- commit SHA
- tests run
- runtime state check
- out-of-scope confirmation
- PR title
- PR body summary
- Owner review checklist result
- local-only or GitHub-enabled mode

## Failure Handling

If push, PR creation, or review tooling is unavailable:

- finish the work locally if possible
- archive the completed tasks
- auto-close the Evolution
- record the tool failure in the handoff report
- do not claim a PR was created if it was not
- do not block local delivery on external tooling

## Related Template

Use the PR handoff template when GitHub handoff is enabled:

- `docs/workflows/PR_HANDOFF_TEMPLATE.md`
