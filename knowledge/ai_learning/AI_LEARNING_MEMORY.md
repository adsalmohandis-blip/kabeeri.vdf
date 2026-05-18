# AI Learning Memory

AI Learning Memory is the shared native KVDF memory layer for repeated AI mistakes, blockers, and fast-path wins.

It exists so future prompts can avoid replaying the same failure patterns:

- stale assertions after HTML or dashboard rendering changes
- touching the wrong files for the active track
- validating in the wrong order
- changing generated reports accidentally
- mixing owner and viber/app scope
- assuming branch or PR is the default delivery mode
- writing runtime state into the committed tree

## Runtime State

The durable state lives in:

- `.kabeeri/ai_learning/failure_patterns.json`

The file is shared across owner, vibe, and plugin tracks. The command writes runtime state only; it does not modify source files or auto-apply fixes.

## Commands

```bash
kvdf learn capture --title "..." --problem "..." --fix "..." --category test_failure --track owner --json
kvdf learn fast-path --title "..." --steps "step1,step2" --validation "npm test,npm run check" --track owner --json
kvdf learn list --json
kvdf learn prompt-context --track owner --json
```

### `capture`

`capture` records a failure pattern or increments an existing one when the normalized title and problem match.

Each pattern stores:

- category
- problem
- root cause
- fix
- prevention rule
- related files
- related commands
- seen count
- last seen timestamp
- prompt warning text

### `fast-path`

`fast-path` records the shortest validated solution path for a recurring issue.

Each fast path stores:

- the problem type
- the ordered steps
- the validation commands
- the track scope

### `list`

`list` returns the full memory snapshot so tooling can inspect all active patterns and fast paths.

### `prompt-context`

`prompt-context` returns only the active warning rules and fast paths for the requested track.

This output is intended for prompt injection and should stay concise, track-aware, and safe.

## Track Rules

- Owner track entries should help KVDF Core work stay direct-to-main and keep validation order explicit.
- Vibe/App track entries should help app delivery stay local-first and prevent mixing owner core work into app tasks.
- Plugin track entries should protect plugin manifests, runtime state, docs, schema, and tests from unrelated edits.

## Prevention Rules

Memory entries should explain:

- what went wrong
- why it happened
- how to fix it
- how to prevent it next time

The best entries are short enough to inject into prompts and specific enough to change behavior on the next attempt.
