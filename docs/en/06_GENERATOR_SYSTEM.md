# 06 - Generator System

## Goal

A generator is a JSON-defined project skeleton that a CLI, AI assistant, or
future UI can read to create a Kabeeri project structure.

## Golden Rule

Generators should not create many detailed empty files. They should create:

- folders
- README guidance
- questionnaire entry points
- a generation metadata file

## Profiles

- Lite: small, fast projects.
- Standard: most SaaS, dashboard, marketplace, and business apps.
- Enterprise: larger systems with more teams, modules, governance, and release needs.

## Commands

```bash
kvdf generate --profile lite
kvdf generate --profile standard --output my-project
kvdf create --profile enterprise
```

## Rules

- Keep folder names stable.
- Keep generated output reviewable.
- Support Arabic and English where useful.
- Do not overwrite user files without explicit force behavior.
