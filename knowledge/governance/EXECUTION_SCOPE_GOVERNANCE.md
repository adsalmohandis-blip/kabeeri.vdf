# Execution Scope Governance

Execution Scope Governance combines Workstream Governance and Task Access Tokens into one runtime permission system.

It separates capability from permission:

- Workstream capability says a developer can work in `backend`, `public_frontend`, `qa`, or another engineering lane.
- A task access token grants temporary permission to execute one assigned task.
- The token scope is derived from the task app boundary and task workstream boundary.

## Runtime Flow

```text
task -> assignee -> workstream capability check -> task access token -> AI session -> Owner verification
```

An AI session is governed only when all of these are true:

- the task exists
- the assignee is valid
- the assignee is allowed to work in the task workstreams
- an active task access token exists for the task and assignee
- touched files stay inside app, token, lock, and workstream boundaries

## Token Shape

```json
{
  "token_id": "task-token-001",
  "task_id": "task-001",
  "assignee_id": "agent-001",
  "workstreams": ["backend"],
  "app_usernames": ["backend-api"],
  "allowed_files": ["apps/api-laravel/app/Http/", "apps/api-laravel/routes/api.php"],
  "forbidden_files": [".env", ".env.*", "secrets/"],
  "scope_mode": "auto",
  "scope_source": "task_app_and_workstream_boundaries",
  "scope_warnings": [],
  "expires_at": "2026-06-08T00:00:00Z",
  "max_usage_tokens": 50000,
  "max_cost": 10,
  "status": "active"
}
```

## Automatic Scope

By default, `kvdf token issue` derives `allowed_files` from:

- registered task app paths
- registered workstream path rules

If a task has both app and workstream boundaries, Kabeeri tries to use the narrowest overlap. If no overlap exists, it falls back to the union of app paths and workstream paths, while session app and workstream gates still enforce the final boundary.

```bash
kvdf token issue --task task-001 --assignee agent-001
kvdf token show task-token-001
```

## Manual Scope

Manual `--allowed-files` is allowed only when it stays inside the derived task boundaries:

```bash
kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/api/
```

If the requested path is broader than the task app/workstream boundary, the command is blocked.

An Owner or Maintainer can record an explicit broad-scope override:

```bash
kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/ --allow-broad-scope
```

The override is stored in `scope_source` and `scope_warnings` so the dashboard and audit trail show that the token was intentionally broadened.

## Lifecycle

```text
created -> active -> revoked
active -> expired
revoked -> reissued
expired -> reissued
```

Rules:

- Tokens are scoped to one task and one assignee.
- Tokens must not be transferred to another developer silently.
- Reissued tokens reference the previous token and a reason.
- Owner verification revokes active task tokens.
- Owner rejection revokes active task tokens.
- Broader reissue needs an explicit override.

## AI Usage Tokens

Task access tokens are not model usage tokens.

- Task access tokens control permission and scope.
- AI usage tokens measure input, output, cached tokens, and cost.

Budgets attach to task access tokens and AI sessions so permission and spend remain connected.

## Dashboard

The Live Dashboard shows Execution Scopes with:

- token ID
- task
- assignee
- scope mode
- workstreams
- apps
- allowed files
- warnings

This lets an Owner see whether a session is operating under a narrow automatic scope or a manual override.
