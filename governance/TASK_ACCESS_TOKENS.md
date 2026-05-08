# Task Access Tokens

Task access tokens grant scoped permission for one developer or AI agent to execute one approved task.

Task access tokens are not AI usage tokens. Access tokens control permission. AI usage tokens measure model consumption and cost.

## Token Shape

```json
{
  "token_id": "task-token-001",
  "task_id": "task-001",
  "assignee_id": "agent-001",
  "workstream": "backend",
  "allowed_files": ["src/api/users.ts"],
  "forbidden_files": [".env", "secrets/"],
  "expires_at": "2026-06-08T00:00:00Z",
  "max_usage_tokens": 50000,
  "max_cost": 10.0,
  "currency": "USD",
  "owner_verify_required": true,
  "status": "active"
}
```

## Required Fields

- `token_id`
- `task_id`
- `assignee_id`
- `workstream`
- `allowed_files` or an explicitly approved allowed scope
- `forbidden_files`
- `expires_at`
- `status`

## CLI Command Design

```text
kvdf token issue --task TASK-ID --assignee ASSIGNEE-ID
kvdf token revoke TOKEN-ID
kvdf token list
kvdf token show TOKEN-ID
```

Only Owner or Maintainer roles can issue or revoke task access tokens. AI Developers cannot transfer, broaden, or self-issue tokens.

