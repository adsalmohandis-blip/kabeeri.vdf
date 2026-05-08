# AI Developer Output Contract

Every AI Developer session must leave work that is readable, reviewable, costed, and auditable.

## Session Record

```json
{
  "session_id": "ai-session-001",
  "developer_id": "agent-001",
  "task_id": "task-001",
  "token_id": "task-token-001",
  "provider": "openai",
  "model": "model-name",
  "started_at": "2026-05-08T00:00:00Z",
  "ended_at": "2026-05-08T01:00:00Z",
  "input_tokens": 10000,
  "output_tokens": 8000,
  "cached_tokens": 2000,
  "cost": 2.5,
  "currency": "USD",
  "files_touched": ["src/api/users.ts"],
  "status": "completed"
}
```

## Required Handoff Fields

- Summary
- Files created
- Files changed
- Checks run
- Risks
- Known limitations
- Needs review
- Next suggested task

Missing output contract fields block Owner verification until corrected.

## Random Prompt Prevention

AI usage without task, token, source, or session identity is classified as `untracked`. Untracked usage must appear in cost analytics and cannot be silently absorbed into official task cost.

