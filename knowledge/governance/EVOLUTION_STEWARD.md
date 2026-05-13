# Evolution Steward

Evolution Steward is the single Kabeeri capability that governs changes to
Kabeeri itself. Do not create a parallel framework-change manager; extend this
system when framework development tracking needs more behavior.

Its purpose is to prevent framework updates from becoming isolated code or docs
edits. When the Owner asks for a new Kabeeri capability, bug fix, governance
rule, dashboard behavior, CLI surface, schema, or documentation change,
Evolution Steward records the change, keeps the ordered development priorities,
checks possible duplicate capability matches, infers the impacted system areas,
creates follow-up tasks, and exposes the unfinished work to dashboard and live
reports.

## Source Of Truth

- Runtime state: `.kabeeri/evolution.json`
- Follow-up work: `.kabeeri/tasks.json`
- Central capability reference: `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- CLI reference: `cli/CLI_COMMAND_REFERENCE.md`
- Dashboard/live reports: `.kabeeri/dashboard/*.json` and `.kabeeri/reports/live_reports_state.json`
- Multi-AI governance runtime: `.kabeeri/multi_ai_governance.json`
- Schema: `schemas/runtime/evolution-state.schema.json`

## Why This Exists

Kabeeri is a meta-framework. A change in one part often affects other parts:

- CLI commands and help
- task tracking and governance rules
- runtime state files
- schemas and validation
- dashboard and live JSON
- readiness/governance reports
- prompt packs or AI workflow guidance
- human docs and docs site
- capability reference
- tests
- changelog and release notes

Evolution Steward turns that dependency list into an explicit impact plan.

## Commands

```bash
kvdf evolution plan "Add docs-first init gate"
kvdf evolution plan "Improve dashboard descriptions" --areas cli,docs,dashboard,tests
kvdf evolution list
kvdf evolution status
kvdf evolution priorities
kvdf evolution next
kvdf evolution app status
kvdf evolution app priorities
kvdf evolution app temp
kvdf evolution app defer "Future app idea"
kvdf evolution app deferred
kvdf evolution temp
kvdf evolution temp advance
kvdf evolution temp complete
kvdf evolution priority evo-auto-001 --status in_progress --note "Working now"
kvdf evolution show evo-001
kvdf evolution impact evo-001
kvdf evolution tasks evo-001
kvdf evolution verify evo-001
```

## Workflow

1. Owner requests a Kabeeri update.
2. The AI assistant runs `kvdf evolution plan "<request>"`.
3. If an existing priority is `in_progress`, Kabeeri must not interrupt or
   reorder development automatically. It shows the unfinished priority, the
   ordered priority list, and a recommended placement for the new request.
4. The Owner confirms the placement with `--confirm-placement` and, when
   needed, `--priority-position <number>`.
5. Kabeeri checks the central capability reference for possible duplicate
   capability matches before treating the change as new.
6. Kabeeri records a change under `.kabeeri/evolution.json`.
7. Kabeeri creates proposed follow-up tasks for impacted areas.
8. The AI assistant implements the update through the generated tasks.
9. The dashboard and live reports show open follow-up work.
10. The Owner or maintainer verifies the evolution change when dependent tasks
   are complete.
11. Before implementation begins, every AI tool reads `kvdf evolution temp`
    and executes only the current temporary slice for the active priority.

Temporary execution priorities are a short-lived execution queue attached to
the single active `in_progress` development priority. Every AI tool that starts
work on an active priority must begin by reading `kvdf evolution temp` and
following the current temporary slice. `kvdf evolution temp` shows or
generates the queue for the current active priority, splitting it into
execution-grade slices with durable descriptions. `kvdf evolution temp
advance` marks the current slice done and moves to the next slice inside the
same priority. `kvdf evolution temp complete` closes the queue when the active
priority has finished. The queue expires automatically when the priority leaves
`in_progress`, so it never becomes a second backlog. The queue must cover the
full current task from the first required step to the last required step, with
no leftover execution remainder outside the queue.

Application developers can use `kvdf evolution app ...` as the developer-
facing alias for the same lifecycle. It preserves the same `priorities`,
`temp`, and `deferred` behavior but uses app-oriented wording so a vibe
developer can manage app work without framework-owner language.

Framework-owner and vibe-app sessions share the same engine but remain
separate operating tracks:

- Framework-owner track: `kvdf evolution ...`
- Vibe app-developer track: `kvdf evolution app ...`

Both tracks still obey the same placement gate, ordered priorities, and full
temporary queue coverage before execution counts as complete.

For application task execution, use `kvdf temp` against the active task in
`.kabeeri/tasks.json`. `kvdf evolution temp` remains the Evolution-specific
queue for framework priorities.

## Development Priorities

`kvdf evolution priorities` is the canonical ordered development list for
Kabeeri framework work. It replaces chat memory as the place to ask:

- What phase are we in?
- What is next?
- What did the Owner add during conversation?
- Which feature requests are planned, in progress, done, deferred, or rejected?

`kvdf evolution next` returns the next open priority plus a direct next-action
hint so worker tools can start execution without inferring the task from the
title alone.

The `KVDF_New_Features_Docs/` source package is intentionally not read
automatically. It is a dual-purpose reference package: one side contains
software design systems that have already been analyzed for permanent Kabeeri
reference, and the other side contains the project-documentation generator
system that teaches Kabeeri how to produce the full docs stack for an
application. The package is read only when the Owner explicitly asks
Kabeeri/Codex to analyze it, and imported content should be represented in
Evolution Steward before implementation.

Every framework-owner session should start by showing the ordered priorities.
`kvdf resume` includes the next priority, top priorities, owner checkpoint,
git summary, and one exact next action. `kvdf resume --scan` also checks the
Evolution priority state and conflict scan before work continues. Use
`kvdf evolution priority <id> --status ...` to keep the list accurate as work
moves from planned to in progress, blocked, done, deferred, or rejected.

When a priority is already `in_progress`, the first execution step for any AI
tool is always `kvdf evolution temp`. Do not start implementation, docs,
tests, or follow-up edits until the current temporary slice is visible and
selected.

When a new requested feature appears while a priority is `in_progress`, the
assistant must warn the Owner instead of silently switching work. Kabeeri
supports this through the placement gate in `kvdf evolution plan`: it returns
`evolution_feature_request_placement`, recommends where the request should sit,
and waits for explicit Owner confirmation before adding the change or creating
follow-up tasks.

When any new task request is opened through Evolution Steward, Kabeeri first
shows the current priority list, recommends the placement order, and marks the
request as waiting for a decision. No change record, impact plan, or follow-up
task is created until the caller confirms placement with
`--confirm-placement`.

Deferred development ideas are for useful concepts the Owner explicitly wants
to remember but not implement yet. Store them with `kvdf evolution defer
"<idea>"`. Review them with `kvdf evolution deferred`. They appear in
`kvdf evolution priorities` only as one final bucket named deferred development
ideas, not as executable priorities. A selected idea moves into active
Evolution work only when the Owner runs `kvdf evolution deferred restore
<idea-id> --confirm-placement --priority-position <number>`.

## Impact Areas

| Area | Meaning |
| --- | --- |
| `implementation` | Runtime code in `src/cli/` or related helpers. |
| `cli` | Command routing, help text, CLI reference, and examples. |
| `tasks` | Task tracker integration and governance metadata. |
| `schemas` | Runtime schema and validation coverage. |
| `dashboard` | Dashboard state, live APIs, or UI visibility. |
| `reports` | Readiness, governance, or live reports. |
| `ai_context` | Prompt packs, Vibe-first rules, or AI workflow guidance. |
| `docs` | Human documentation and knowledge files. |
| `capabilities` | Central capability map and docs site capability table. |
| `tests` | Automated integration or validation coverage. |
| `changelog` | Change history and Owner continuation state. |
| `release` | Release notes, publish gates, or upgrade guidance. |

## Rule

A framework update is not considered done just because code changed. It is done
when all dependent surfaces are either updated, explicitly deferred, or rejected
with a reason.
