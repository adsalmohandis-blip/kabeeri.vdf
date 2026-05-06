# CLI Roadmap

This file defines the staged roadmap for the future `kvdf` CLI.

## v0.1.1 — Command design only

Goal:

```text
Define the command structure without implementation.
```

Included:

```text
- CLI command list
- safety rules
- user flows
- command schema
- command examples
```

Not included:

```text
- working CLI
- package publishing
- command execution
```

## v0.2.0 — CLI foundation

Goal:

```text
Create the first working CLI shell.
```

Suggested features:

```text
kvdf --help
kvdf --version
kvdf doctor
kvdf validate
```

Implementation candidate:

```text
Node.js / TypeScript
```

## v0.3.0 — Workspace generation

Goal:

```text
Help users initialize Kabeeri VDF folders and generate planning skeletons.
```

Suggested features:

```text
kvdf init
kvdf generate --profile lite
kvdf generate --profile standard
kvdf generate --profile enterprise
```

## v0.4.0 — Workflow helpers

Goal:

```text
Help users manage questionnaires, tasks, and acceptance checklists.
```

Suggested features:

```text
kvdf questionnaire create
kvdf task create
kvdf acceptance create
```

## v0.5.0 — Prompt pack helpers

Goal:

```text
Help users list and select prompt packs.
```

Suggested features:

```text
kvdf prompt-pack list
kvdf prompt-pack show <stack>
kvdf prompt-pack validate <stack>
```

## v0.6.0 — Release helpers

Goal:

```text
Prepare release checklist and notes.
```

Suggested features:

```text
kvdf release check
kvdf release notes --version <version>
kvdf release checklist --version <version>
```

## v1.0.0 — Stable CLI

Goal:

```text
Stable CLI for framework scaffolding, validation, and workflow support.
```

Requirements:

```text
- documented commands
- tests
- safe file writing
- no destructive defaults
- clear errors
- beginner-friendly output
```
