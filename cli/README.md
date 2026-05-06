# KVDF CLI Design

This directory defines the first command structure design for the future **Kabeeri Vibe Developer Framework CLI**.

## Important clarification

This folder is **not** a working CLI implementation yet.

It does not install packages, run commands, generate real projects, or modify the repository automatically.

It is a design/specification layer for the future command-line tool.

## Proposed CLI name

```text
kvdf
```

Alternative package/display names:

```text
kabeeri-vdf
kabeeri.vdf
```

## Purpose

The future CLI should help vibe developers use Kabeeri VDF from the terminal in a simple and predictable way.

It should help with:

```text
- initializing a Kabeeri VDF workspace
- choosing Lite, Standard, or Enterprise generator
- copying templates
- creating questionnaires
- selecting prompt packs
- creating task tracking files
- running acceptance checklist scaffolds
- validating framework files
- preparing release handoff files
```

## What the CLI should not do in early versions

Early CLI versions should not:

```text
- install Laravel, .NET, Next.js, or other frameworks
- create production apps automatically
- deploy projects
- modify live systems
- store real secrets
- replace GitHub Issues or project management tools
- run destructive commands
```

## Core philosophy

The CLI is not a magic app builder.

It should be a safe assistant for preparing structured Kabeeri VDF files.

```text
Raw idea
→ choose profile
→ generate framework documents
→ choose prompt pack
→ create tasks
→ review with acceptance checklist
→ handoff
```

## Suggested first CLI scope

For `v0.1.1`, only design the command structure.

For future `v0.2.0` or later, implement a minimal CLI.

## Proposed command family

```text
kvdf init
kvdf generate
kvdf questionnaire
kvdf prompt-pack
kvdf task
kvdf acceptance
kvdf example
kvdf validate
kvdf release
kvdf doctor
```

## Recommended first implementation language

The first implementation can be one of:

```text
Node.js / TypeScript
Python
Go
```

Recommended for this framework:

```text
Node.js / TypeScript
```

Reason:

```text
- easy npm distribution
- familiar to many frontend/full-stack AI builders
- good JSON/Markdown tooling
- good CLI libraries
```

## Folder contents

```text
README.md
README_AR.md
CLI_COMMANDS.md
CLI_COMMANDS_AR.md
CLI_ROADMAP.md
CLI_SAFETY_RULES.md
CLI_USER_FLOWS.md
CLI_COMMAND_REFERENCE.md
cli.commands.schema.json
cli.commands.example.json
cli_manifest.json
```

## Status

CLI command structure design for `v0.1.1`.
