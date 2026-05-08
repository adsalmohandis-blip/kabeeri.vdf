# v3.5.0 - Assignment and Execution Governance

Goal: prevent AI Developers from working on tasks that are not approved, assigned, scoped, and locked.

## Task Flow

```text
proposed -> approved -> ready -> assigned -> in_progress -> review -> reviewer_recommended -> owner_verified
                                                        -> rejected
owner_verified -> reopened
```

## Assignment Rules

- Only Owner or Maintainer can assign executable tasks.
- A task cannot move to `assigned` without source and acceptance criteria.
- A task cannot move to `in_progress` without an active access token.
- A task cannot move to `in_progress` when required locks are missing or conflicted.
- AI Developers can execute only assigned tasks tied to their identity.

## Workstream Separation

Backend, Public Frontend, and Admin Frontend tasks should be separated.

Cross-workstream work is allowed only when:

- task type is `integration_task`
- affected workstreams are listed
- Owner or Maintainer approves
- locks are created for every affected scope

## Reviewer Independence

The executor cannot accept their own task. Reviewer recommendation is not final. Owner verification is final.

## Acceptance Criteria

- Assignment flow is clear.
- No execution without assignment.
- Task workstreams are separated.
- Integration Tasks have special rules.
- Review governance is documented.

