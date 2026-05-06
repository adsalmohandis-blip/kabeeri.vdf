# CLI Command Reference

This is a compact reference for the proposed `kvdf` commands.

## Global

```bash
kvdf --help
kvdf --version
```

## Workspace

```bash
kvdf init
kvdf init --profile lite
kvdf init --profile standard
kvdf init --profile enterprise
kvdf init --lang ar
kvdf init --lang en
kvdf init --lang both
```

## Generators

```bash
kvdf generate --profile lite
kvdf generate --profile standard
kvdf generate --profile enterprise
```

## Questionnaires

```bash
kvdf questionnaire list
kvdf questionnaire create --profile lite
kvdf questionnaire create --group core
kvdf questionnaire create --group production
kvdf questionnaire create --group extension
kvdf questionnaire status
```

## Prompt packs

```bash
kvdf prompt-pack list
kvdf prompt-pack show <name>
kvdf prompt-pack use <name>
kvdf prompt-pack validate <name>
```

Examples:

```bash
kvdf prompt-pack show laravel
kvdf prompt-pack show nextjs
kvdf prompt-pack show fastapi
```

## Tasks

```bash
kvdf task create
kvdf task list
kvdf task status
kvdf task review
```

Examples:

```bash
kvdf task create --title "Add task tracking format" --type task-tracking --issue 6
kvdf task status --id T006
```

## Acceptance

```bash
kvdf acceptance create
kvdf acceptance review
kvdf acceptance list
```

Examples:

```bash
kvdf acceptance create --type task-completion --issue 7
kvdf acceptance create --type release --version v0.1.1
```

## Examples

```bash
kvdf example list
kvdf example show lite
kvdf example show standard
kvdf example show enterprise
```

## Validation

```bash
kvdf validate
kvdf validate task
kvdf validate acceptance
kvdf validate prompt-packs
kvdf validate generators
```

## Release

```bash
kvdf release check
kvdf release notes --version v0.1.1
kvdf release checklist --version v0.1.1
```

## Doctor

```bash
kvdf doctor
```
