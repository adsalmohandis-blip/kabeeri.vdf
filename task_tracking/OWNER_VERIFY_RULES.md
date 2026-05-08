# Owner Verify Rules

Final task verification belongs to the Owner only.

## Roles

- Developer or AI Developer can complete work.
- Reviewer can recommend acceptance or changes.
- Owner performs final verify.

## CLI Commands

```bash
kvdf task verify TASK-ID --owner OWNER-ID
kvdf task reject TASK-ID --reason "Reason"
kvdf task reopen TASK-ID
```

## Rules

- No task is final without Owner verify.
- Reviewer recommendation is not final verification.
- Verify writes an audit event.
- Reject requires a reason.
- Reopen preserves previous audit history.
- GitHub issue closure must not happen before Owner verify.
