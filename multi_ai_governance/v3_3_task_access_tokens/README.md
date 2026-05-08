# v3.3.0 - Task Access Tokens Lifecycle

Goal: let a developer or AI Developer work on one task with explicit limits.

## Token Schema

```json
{
  "token_id": "task-token-001",
  "task_id": "task-001",
  "assignee_id": "agent-001",
  "workstream": "backend",
  "allowed_files": ["src/api/users.ts"],
  "forbidden_files": [".env", "secrets/"],
  "expires_at": "2026-05-08T00:00:00Z",
  "max_usage_tokens": 50000,
  "max_cost": 10.0,
  "currency": "USD",
  "owner_verify_required": true,
  "status": "active"
}
```

## Lifecycle

```text
created -> assigned -> active -> used
active -> expired
active -> revoked
revoked -> reissued
expired -> reissued
```

## CLI Commands

```text
kvdf token issue --task TASK-ID --assignee ASSIGNEE-ID
kvdf token revoke TOKEN-ID
kvdf token list
kvdf token show TOKEN-ID
```

Only Owner or Maintainer can issue/revoke task tokens. AI Developers cannot transfer tokens.

## Acceptance Criteria

- Token schema exists.
- Every token is linked to one task and one assignee.
- Lifecycle has no open-ended permission.
- CLI command design is documented.

