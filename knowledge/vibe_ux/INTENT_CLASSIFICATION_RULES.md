# Intent Classification Rules

Kabeeri classifies natural language requests before suggesting tasks.

## Intent Types

- `create_task`
- `change_scope`
- `ask_question`
- `generate_docs`
- `run_check`
- `capture_work`
- `review_work`
- `verify_task`
- `estimate_cost`
- `sync_github`
- `publish_or_release`
- `owner_transfer`

## Classification Inputs

- user message
- active project mode
- current task state
- changed files
- user role
- current budgets and locks
- source document or question context

## Risk Hints

Flag as high-risk when the request mentions:

- production
- publish
- migration
- auth
- payments
- secrets
- owner transfer
- broad refactor
- delete or overwrite
- budget override

## Output

Classification output should include intent type, confidence, missing details, likely workstream, risk level, and suggested next action.

