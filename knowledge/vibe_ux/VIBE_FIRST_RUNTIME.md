# Vibe-first Runtime Commands

Vibe-first runtime commands are an optional human-first layer over the normal `kvdf` CLI.

Kabeeri still works without this layer. Existing commands such as `kvdf task`, `kvdf token`, `kvdf dashboard`, and `kvdf validate` remain the direct engine. Vibe-first commands only add a safer natural-language entry point and post-work capture records.

## Runtime State

`kvdf init` creates:

```text
.kabeeri/interactions/user_intents.jsonl
.kabeeri/interactions/suggested_tasks.json
.kabeeri/interactions/post_work_captures.json
```

These files are derived interaction records. The core source of truth remains `.kabeeri/tasks.json`, `.kabeeri/tokens.json`, `.kabeeri/workstreams.json`, and the rest of the existing workspace state.

## Commands

```bash
kvdf vibe "Add admin dashboard settings page for owner"
kvdf vibe suggest "Add checkout API for the storefront"
kvdf ask "Improve the dashboard"
kvdf capture --summary "Updated dashboard filters" --files src/cli/index.js --checks "npm test"
kvdf capture list
kvdf capture show capture-001
kvdf capture link capture-001 --task task-001
kvdf capture convert capture-001 --task task-002
kvdf capture resolve capture-001 --reason "Evidence reviewed"
```

Task card workflow:

```bash
kvdf vibe list
kvdf vibe show suggestion-001
kvdf vibe convert suggestion-001
kvdf vibe reject suggestion-001 --reason "Too broad"
kvdf vibe plan "Build an ecommerce store with catalog cart checkout and admin"
kvdf vibe session start --title "Ecommerce planning"
kvdf vibe brief
kvdf vibe next
```

## Behavior

`kvdf vibe` and `kvdf vibe suggest`:

- classify the natural-language intent
- detect likely workstream
- estimate risk and cost level
- detect vague or broad requests
- create a suggested task card when the request is specific enough

`kvdf ask`:

- classifies the request
- returns clarifying questions and a safe next step
- does not create execution work directly

`kvdf capture`:

- records post-work notes
- stores changed files and file status from `--files` or `git status --short`
- classifies likely workstreams and risk
- marks whether the work matches an existing task, needs a new task, is documentation-only, exploration, urgent, or unapproved scope
- lists, shows, links, converts, and resolves capture records
- validates capture records through `kvdf validate capture`

`kvdf vibe plan`:

- splits broad product requests into multiple safer task cards
- uses reusable templates when it recognizes common project types such as ecommerce
- keeps each card tied to one workstream whenever possible

`kvdf vibe brief`:

- writes a compact context brief under `.kabeeri/interactions/context_briefs.json`
- lists latest intent, open suggestions, open tasks, and recent captures
- is designed to reduce token usage when a new AI session resumes work

`kvdf vibe next`:

- recommends the next actionable command for the team
- prefers reviewing suggestions, approving converted tasks, assigning work, or running `kvdf capture convert <id>` for ungoverned captures

`kvdf vibe session`:

- tracks a human or AI planning session
- links intents, suggestions, and captures to a shared session ID
- helps teams resume work after interrupted chat sessions

## Conversion

`kvdf vibe convert suggestion-001` turns a suggested card into a normal governed task. From that point, the existing runtime applies:

- task approval
- assignment
- Execution Scope token
- locks
- AI session handoff
- Owner verification
- dashboard visibility

`kvdf capture convert capture-001` does the same for useful work that already happened. The created task keeps `source: capture:capture-001` and inherits workstream/app boundaries from the changed files.

## Design Rule

Vibe-first never silently executes code changes or GitHub writes. It suggests, captures, converts, and records. Execution remains governed by the existing Kabeeri engine.
