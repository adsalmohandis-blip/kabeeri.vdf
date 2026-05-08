# Assignment Execution Governance

## Task Flow

```text
proposed -> approved -> ready -> assigned -> in_progress -> review -> reviewer_recommended -> owner_verified
                                                        -> rejected
owner_verified -> reopened
```

## Assignment Rules

- Only Owner or Maintainer can assign executable tasks.
- A task cannot move to `assigned` without source and acceptance criteria.
- A task cannot move to `in_progress` without an active task access token.
- A task cannot move to `in_progress` when required locks are missing or conflicted.
- AI Developers can execute only tasks assigned to their identity.
- A developer cannot execute work outside the token scope even if the task title implies it.

## Workstream Separation

Backend, Public Frontend, and Admin Frontend work should be split into separate tasks.

Cross-workstream work is allowed only when:

- task type is `integration_task`
- affected workstreams are listed
- Owner or Maintainer approval exists
- locks are created for every affected scope
- review covers each affected workstream

## Review Independence

The executor cannot accept their own task. Reviewer recommendation is advisory. Owner verification is final.

