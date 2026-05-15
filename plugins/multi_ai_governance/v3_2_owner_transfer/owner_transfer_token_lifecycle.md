# Owner Transfer Token Lifecycle

## Token Shape

```json
{
  "transfer_token_id": "owner-transfer-001",
  "created_by": "dev-owner-001",
  "new_owner_id": "dev-maintainer-002",
  "status": "issued",
  "old_owner_downgrade_to": "Maintainer",
  "created_at": "2026-05-07T00:00:00Z",
  "expires_at": "2026-05-08T00:00:00Z",
  "used_at": null,
  "revoked_at": null,
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
- The token can be used once.
- The token must expire.
- The old Owner is downgraded during the same state transition that promotes the new Owner.
- The token value is secret and must not appear in dashboard state.

