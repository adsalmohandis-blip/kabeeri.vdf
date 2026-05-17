# v2.6.0 - Owner-Only Task Verification

Goal: final task completion requires Owner verification.

## Roles

| Role | Can Recommend? | Can Final Verify? |
|---|---:|---:|
| Developer | No | No |
| AI Agent | No | No |
| Reviewer | Yes | No |
| Maintainer | Yes | No |
| Owner | Yes | Yes |

There must be exactly one final verification authority: the Owner.

## Task States

Recommended flow:

```text
proposed -> in_progress -> review_ready -> reviewer_recommended -> owner_verified
                                           -> rejected
owner_verified -> reopened
```

Current intake flow uses the active task lifecycle labels instead of the legacy starter label.

Reviewer approval is only a recommendation. A task is not complete until `owner_verified`.

## CLI Commands

```text
kvdf task verify TASK-ID
kvdf task reject TASK-ID --reason "..."
kvdf task reopen TASK-ID
```

These commands require either:

- active owner session
- owner approval token with narrow scope

## Dashboard Action

The dashboard may show a `Verify Task` action only when:

- current user role is `Owner`
- task is in a verifiable state
- acceptance criteria are present
- current task state is not already `owner_verified`

Every verify/reject/reopen action writes to `audit_log.jsonl`.

## Acceptance Criteria

- Owner-only final verify is documented.
- Reviewer recommendation is separated from final verify.
- CLI commands require owner authority.
- Dashboard verify is unavailable to ordinary developers.
