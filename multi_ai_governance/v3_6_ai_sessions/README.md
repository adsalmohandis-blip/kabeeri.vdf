# v3.6.0 - AI Developer Sessions and Output Contracts

Goal: make AI Developer work readable, reviewable, costed, and auditable.

## Session Schema

```json
{
  "session_id": "ai-session-001",
  "developer_id": "agent-001",
  "task_id": "task-001",
  "token_id": "task-token-001",
  "provider": "openai",
  "model": "model-name",
  "started_at": "2026-05-07T00:00:00Z",
  "ended_at": "2026-05-07T01:00:00Z",
  "input_tokens": 10000,
  "output_tokens": 8000,
  "cached_tokens": 2000,
  "cost": 2.5,
  "currency": "USD",
  "files_touched": ["src/api/users.ts"],
  "status": "completed"
}
```

## Output Contract

Every AI Developer handoff must include:

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

AI usage without task, token, source, or session identity is classified as `untracked`.

Untracked usage should:

- appear in cost analytics
- show dashboard warnings
- require review before being associated with official task cost

## Acceptance Criteria

- AI session schema is documented.
- AI output has a fixed shape.
- Non-compliant output blocks verify.
- Random AI usage is detectable.

