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
- staying in an execution loop instead of checking the exact failure
- confusing dashboard separation with a role filter

## Runtime State

The durable state lives in:

- `.kabeeri/ai_learning/failure_patterns.json`

The file is shared across owner, vibe, and plugin tracks. The command writes runtime state only; it does not modify source files or auto-apply fixes.
The memory is auto-synced into planner prompt generation, resume guidance, and prompt-pack composition so the next AI action sees the learned warnings immediately.

The optional `ai-learning` plugin formalizes export/import, promotion, shared-learning, and cloud-ready metadata workflows on top of the same core local memory file. Core remains the source of truth; the plugin is a packaging and workflow layer.

## Commands

```bash
kvdf learn capture --title "..." --problem "..." --fix "..." --category test_failure --track owner --json
kvdf learn fast-path --title "..." --steps "step1,step2" --validation "npm test,npm run check" --track owner --json
kvdf learn export --track vibe --output docs/kvdf-learning/learning-export.json --json
kvdf learn import --track owner --from docs/kvdf-learning/learning-export.json --json
kvdf learn review --track owner --json
kvdf learn promote learning-candidate-001 --confirm --track owner --json
kvdf learn reject learning-candidate-002 --reason "App-specific" --track owner --json
kvdf learn shared --json
kvdf learn cache update --from-export docs/kvdf-learning/learning-export.json --json
kvdf learn cache list --json
kvdf learn metadata --json
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
- shared learning state and promotion history

### `list`

`list` returns the full memory snapshot so tooling can inspect all active patterns and fast paths.

### `prompt-context`

`prompt-context` returns only the active warning rules and fast paths for the requested track. Use `--track all` to retrieve the combined active context across every track. Promoted shared learning is included so planner prompt-context hooks can learn from the shared memory layer without relying on chat history.

### `export`

`export` serializes the current local learning state into a portable sanitized JSON package plus a Markdown summary beside it. Export packages are track-aware, anonymized, and portable. They include `cloud_ready`, `consent_required`, `owner_approved_for_cloud`, `anonymized`, `sensitive_items_removed`, `dataset_tags`, `training_eligible`, `patterns`, `fast_paths`, and `promotion_candidates`.

### `import`

`import` does not auto-promote. It reads a portable export package and writes review candidates into `.kabeeri/learning_harvest/candidates.json` so Owner track can review them first.

### `review`

`review` lists imported candidates and classifies them as `reusable`, `app_specific`, `sensitive`, `noisy`, `needs_review`, `cloud_candidate`, or `not_cloud_safe`.

### `promote`

`promote` is Owner-track only and requires `--confirm`. It writes approved reusable learning into `knowledge/ai_learning/shared_patterns.json` or `knowledge/ai_learning/shared_fast_paths.json` and records who approved it and when.

### `reject`

`reject` is Owner-track only. It marks a candidate as rejected in the harvest state and keeps the shared knowledge files unchanged.

### `shared`

`shared` returns the approved shared patterns and shared fast paths from KVDF Core knowledge files.

### `cache`

`cache update` and `cache list` maintain the user global local cache under `~/.kabeeri/learning/`. The cache helps local apps reuse safe patterns without dirtying KVDF Core.

### `metadata`

`metadata` prepares future cloud-ready metadata only. It does not upload anything and does not imply training approval.

This output is intended for prompt injection and should stay concise, track-aware, and safe. KVDF also injects it automatically into the main AI prompt builders so the memory stays in sync without a separate manual step.

## Track Rules

- Owner track entries should help KVDF Core work stay direct-to-main and keep validation order explicit.
- Vibe/App track entries should help app delivery stay local-first and prevent mixing owner core work into app tasks.
- Plugin track entries should protect plugin manifests, runtime state, docs, schema, and tests from unrelated edits.
- Combined `all` track context should stay concise and act as prompt injection for shared warnings, not as a replacement for track-specific guidance.
- Shared learning should stay reusable across tracks, but it should not replace current-file evidence when the planner is deciding the next Evolution.
- KVDF Core shared learning requires Owner approval. Viber/App Track can capture local learning and export packages, but it cannot write directly into KVDF Core shared learning files.
- Cloud-ready fields are future-facing metadata only. Future cloud collection requires explicit consent, anonymization, dataset review, and a separate cloud workflow.

## Prevention Rules

Memory entries should explain:

- what went wrong
- why it happened
- how to fix it
- how to prevent it next time
- what exact check or command should happen before patching

The best entries are short enough to inject into prompts and specific enough to change behavior on the next attempt.
