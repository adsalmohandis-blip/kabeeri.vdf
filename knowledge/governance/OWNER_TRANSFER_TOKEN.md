# Owner Transfer Token

Owner transfer tokens allow a current Owner to transfer the only Owner role without creating a two-owner period.

## Token Shape

```json
{
  "transfer_token_id": "owner-transfer-001",
  "created_by": "dev-owner-001",
  "issued_by": "dev-owner-001",
  "new_owner_id": "dev-maintainer-002",
  "status": "issued",
  "old_owner_downgrade_to": "Maintainer",
  "created_at": "2026-05-08T00:00:00Z",
  "issued_at": "2026-05-08T00:00:00Z",
  "expires_at": "2026-05-09T00:00:00Z",
  "accepted_by": null,
  "accepted_at": null,
  "used_at": null,
  "revoked_at": null,
  "transfer_path": "issued",
  "max_usage": 1,
  "usage_count": 0
}
```

## State Flow

```text
created -> issued -> accepted -> used
created -> revoked
issued -> expired
issued -> revoked
accepted -> expired
accepted -> revoked
```

## Rules

- Only the current Owner can create a transfer token.
- A token can be used once.
- A token must expire.
- The old Owner downgrade and new Owner promotion happen in the same state transition.
- Secret token values must not be committed, logged, or shown in dashboard state.
- Every transfer attempt writes an audit event.
- Transfer records should preserve the issue, acceptance, and completion timestamps so the owner handoff path is traceable end to end.
