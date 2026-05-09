# v3.8.0 - Owner Verify, Token Revocation, and Audit

Goal: safely close tasks after Owner verification and preserve a final audit trail.

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

## Rejection and Reissue

When Owner rejects a task:

- reason is required
- current token can be revoked
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
- files created/changed
- acceptance criteria
- checks run
- usage tokens
- final cost
- verification timestamp

## Acceptance Criteria

- Token is revoked after Owner verify.
- Task status updates automatically.
- Rejection does not create permission chaos.
- Every verified task has a final report.

