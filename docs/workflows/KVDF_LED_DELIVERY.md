# KVDF-Led Delivery

## Purpose

KVDF-led delivery is the core workflow for turning an approved Evolution into a
finished delivery slice. It keeps the local workspace authoritative, keeps the
task ledger and Evolution ledger in sync, and optionally adds a GitHub-backed
handoff layer when the workspace is ready to publish through a branch and PR.

For Vibe/App Track work, the current application files are the primary source of
truth. Git and GitHub do not override current app files unless the Owner
explicitly chooses remote history as authoritative.

## When To Use It

Use KVDF-led delivery when:

- the product request has already passed intake, review, and approval
- the current work must be delivered as one Evolution slice
- the workspace must remain local-first
- GitHub may be used as a handoff layer but is not required
- the owner wants a branch, PR, and review gate before merging to `main`

## Delivery Modes

### Local-Only Mode

Local-only mode is valid when GitHub is not used.

Use it when:

- the workspace is offline or GitHub is unavailable
- the team wants to finish the Evolution entirely inside the workspace
- the delivery must not depend on external publishing tools

Required outcome:

- tasks are completed
- tasks are verified and archived
- the parent Evolution auto-closes
- the final handoff report is written locally

### Solo Owner Direct-to-Main Mode

Solo Owner Direct-to-Main Mode is the default for KVDF core development when
the Owner is the only active framework developer.

Use it when:

- the target repo is `kabeeri.vdf`
- the active work is KVDF Core / Owner Track work
- the Owner is the only active core developer
- no team-review or protected-branch policy is required
- the Owner explicitly accepts direct-to-main delivery

Required outcome:

- the work is completed on `main`
- required checks are run before push
- only intended KVDF source, docs, schemas, tests, and approved generated docs
  are committed
- runtime state is not committed unless explicitly required by the Evolution
- the commit is pushed directly to `origin main`
- the workspace is clean or intentionally documented after push

Standard command flow:

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short
node bin/kvdf.js validate
npm test
npm run check
git add -A
git commit -m "<type>: <message>"
git push origin main
```

### Team / Protected Repo GitHub Mode

Team / Protected Repo GitHub Mode is optional.

Use it when:

- the Owner explicitly asks for a branch and PR
- more than one developer is active
- branch protection requires review
- the change is risky or experimental

Required outcome:

- a branch is created from the approved Evolution slice
- tests run before commit
- the approved changes are committed and pushed
- a PR is prepared or created
- Owner review happens before merge
- `main` is merged only after approval
- the latest `main` is pulled before the next Evolution begins

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

For app-track work, confirm the current app docs, requirements, manifests,
specs, source structure, and tests before looking at local Git or remote
history.

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

## App Track Source-Of-Truth Priority

For Vibe/App Track work, use this priority:

1. Current app docs and requirements files
2. Current app manifests/specs/configs
3. Current app source structure
4. Current app tests
5. Local Git history if available
6. Release/tag history if available
7. Remote provider history such as GitHub only if enabled
8. `.kabeeri/` runtime state as supporting state only
9. Chat history as supporting context only

`.kabeeri/tasks.json` and other local runtime state are supporting evidence for
app planning, not the final authority when the current app files show a later
state.

## Git Commit and Publishing Rules

For Solo Owner Direct-to-Main Mode:

1. Work on `main`.
2. Run the required checks.
3. Commit only the intended KVDF Core changes.
4. Do not commit `.kabeeri/` runtime state or transient execution outputs unless explicitly required.
5. Push directly to `origin main`.

For Team / Protected Repo GitHub Mode:

1. Create a branch for the approved Evolution slice.
2. Run the required tests.
3. Commit only the intended source, docs, and deliverable artifacts.
4. Push the branch.
5. Prepare or create the PR.
6. Route the PR to Owner review.
7. Merge only after Owner approval.
8. Pull the latest `main`.
9. Re-validate the workspace.
10. Start the next Evolution only after the sync is clean.

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
