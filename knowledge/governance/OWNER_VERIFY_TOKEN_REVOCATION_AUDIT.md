# Owner Verify, Token Revocation, And Audit

## Verify Flow

```text
reviewer_recommended
  -> Owner verifies
  -> task status becomes owner_verified
  -> task access token is revoked
  -> locks are released or archived
  -> audit event is written
  -> final verification report is generated
```

## Rejection Flow

When Owner rejects a task:

- rejection reason is required
- current task access token is revoked or suspended
- task returns to `assigned` or `ready`
- a narrower replacement token may be issued
- audit log records rejection and reissue

## Final Verification Report

Every verified task should produce a report containing:

- task ID
- assignee
- reviewer
- Owner
- token ID
- files created or changed
- acceptance criteria
- checks run
- usage tokens
- final cost
- verification timestamp

## Audit Requirements

Audit events must record actor, action, task, token, timestamp, previous state, new state, and reason when applicable.

