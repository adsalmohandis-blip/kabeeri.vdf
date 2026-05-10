# ADR And AI Run History Runtime

This runtime closes the gap between project memory, architecture decisions,
AI sessions, and AI cost usage.

It is useful when a project needs durable decision history and reviewable AI
output history without relying on chat history.

## What This Adds

Kabeeri already has:

- `kvdf memory` for lightweight durable notes.
- `kvdf session` for governed execution sessions, task tokens, locks, and touched files.
- `kvdf usage` for token and cost accounting.
- audit events for system mutations.

This feature adds the missing non-duplicated layer:

- `kvdf adr` for formal architecture decision records.
- `kvdf ai-run` for prompt-run quality history, accepted output, rejected output, and waste signals.

## ADR Runtime

Use ADRs for decisions that future developers or AI agents must not rediscover:

- architecture and framework choices
- database and migration strategy
- authentication and security policy
- integration/provider choices
- release, deployment, or rollback decisions
- high-impact tradeoffs that affect multiple workstreams

Do not use ADRs for small notes. Use `kvdf memory add` for assumptions, risks,
constraints, and lightweight decisions.

### Commands

```bash
kvdf adr create --title "Use PostgreSQL" --context "Need relational consistency" --decision "Use PostgreSQL for v1"
kvdf adr create --title "Adopt queue workers" --context "Order emails are async" --decision "Use background jobs" --status approved
kvdf adr list
kvdf adr show adr-001
kvdf adr approve adr-001
kvdf adr reject adr-001 --reason "Not needed for MVP"
kvdf adr supersede adr-001 --by adr-002 --reason "Architecture changed"
kvdf adr report --output adr-report.md
kvdf adr trace --json
kvdf validate adr
```

### State

```text
.kabeeri/adr/records.json
.kabeeri/memory/decisions.jsonl
.kabeeri/audit_log.jsonl
```

Creating an ADR also appends a linked project-memory decision, so context packs
and handoff summaries can reuse the decision without rereading every ADR.

## AI Run History Runtime

Use AI run history when the important question is not only "how much did it
cost?" but also:

- Was this AI output accepted?
- Was it rejected?
- Was any output partially reused?
- Which task, developer, model, and prompt produced the result?
- Are there unreviewed runs that should be accepted or rejected?
- Did rejected output waste money because context or scope was poor?

### Commands

```bash
kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --summary "Implemented endpoint"
kvdf ai-run list
kvdf ai-run show ai-run-001
kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
kvdf ai-run reject ai-run-001 --reason "Wrong scope"
kvdf ai-run link ai-run-001 --adr adr-001
kvdf ai-run report
kvdf ai-run report --json
kvdf validate ai-run
```

### State

```text
.kabeeri/ai_runs/prompt_runs.jsonl
.kabeeri/ai_runs/accepted_runs.jsonl
.kabeeri/ai_runs/rejected_runs.jsonl
.kabeeri/ai_usage/usage_events.jsonl
.kabeeri/ai_usage/usage_summary.json
.kabeeri/audit_log.jsonl
```

By default, `kvdf ai-run record` also writes a usage event when token data is
provided. Use `--record-usage false` if the same token usage was already recorded
through `kvdf session end` or `kvdf usage record`.

## How It Helps AI Coding

Before a new AI coding pass, Kabeeri can inspect:

- accepted runs for useful prior output
- rejected runs for mistakes not to repeat
- ADRs for decisions that should not be reopened casually
- usage and waste reports for cost-aware model routing

This reduces repeated context reading, repeated architectural debate, random
prompting, and unreviewed AI output.

## Decision Trace

When an AI run influences a durable decision, link it:

```bash
kvdf ai-run link ai-run-001 --adr adr-001
```

Then inspect the combined trace:

```bash
kvdf adr trace --json
kvdf adr trace --output .kabeeri/reports/adr_ai_run_trace.md
```

The trace shows ADR status, impact, linked AI runs, accepted/rejected/unreviewed
run counts, tokens, cost, unlinked AI runs, and high-impact proposed ADRs that
still need approval.

## Dashboard

The live dashboard shows:

- ADR counts and proposed high-impact ADR warnings
- AI run counts
- unreviewed run counts
- AI run waste signals

The dashboard remains a view. `.kabeeri/` remains the source of truth.
