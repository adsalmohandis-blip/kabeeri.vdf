# 04 — Product Roadmap

## Purpose

This roadmap explains the planned development path for Kabeeri VDF.

The goal is to grow from a documentation-first open-source repository into a complete framework with generators, schemas, prompt packs, task tracking, CLI tooling, editor integration, and eventually optional desktop or SaaS interfaces.

## Current stage

Kabeeri VDF is currently in the early public foundation stage.

Current release:

```text
v0.1.0
```

Current milestone:

```text
v0.1.1
```

## v0.1.x — Foundation

Focus:

- repository cleanup
- README improvement
- Arabic and English documentation
- generator review
- beginner-friendly questionnaires
- initial task tracking format
- first acceptance checklist templates
- first example project plan

Expected outcome:

A user can understand the framework, explore the repository, and see how the system is intended to work.

## v0.2.0 — Generator System

Focus:

- stabilize Lite generator
- stabilize Standard generator
- stabilize Enterprise generator
- add JSON schemas
- define generator validation rules
- add generated skeleton examples

Expected outcome:

A user can use generator definitions to create a clean AI-ready project skeleton.

## v0.3.0 — CLI Prototype

Focus:

- introduce the `kvdf` command
- support project creation from profiles
- support language options
- validate project structure
- export AI handoff instructions

Planned commands:

```bash
kvdf new my-project --profile lite --lang en
kvdf new my-project --profile standard --lang ar
kvdf new my-project --profile enterprise --lang en
kvdf validate
kvdf export-ai-handoff
```

Expected outcome:

A user can create and validate Kabeeri VDF projects from the command line.

## v0.4.0 — Prompt Packs

Focus:

- create first Laravel prompt pack
- create Next.js prompt pack draft
- define .NET prompt pack structure
- define WordPress prompt pack structure
- define prompt safety and review rules

Expected outcome:

A user can move from documents to implementation prompts for at least one real stack.

## v0.5.0 — VS Code Extension Prototype

Focus:

- create Kabeeri VDF projects inside VS Code
- browse questionnaires
- validate folder structure
- export AI prompts
- view task tracking status
- open acceptance checklists

Expected outcome:

A vibe developer can use Kabeeri VDF inside a common coding environment.

## v0.6.0 — Desktop App Prototype

Focus:

- provide a local GUI for non-technical users
- choose project profile
- answer questionnaires
- export project skeletons
- export AI handoff files
- manage local project documentation

Expected outcome:

Non-technical builders can use the framework without command-line knowledge.

## v0.7.0 — Team Workflow

Focus:

- contributor roles
- review workflows
- template governance
- project examples
- issue and task templates
- collaboration rules

Expected outcome:

Small teams can work together using Kabeeri VDF.

## v1.0.0 — Stable Framework

Kabeeri VDF should not reach v1.0.0 until the following are stable:

- Lite, Standard, and Enterprise generators
- core questionnaire system
- documentation in Arabic and English
- first real prompt packs
- task tracking format
- acceptance checklist system
- example project
- contributor workflow
- CLI basics

## Long-term direction

Possible future products:

1. **GitHub repository** — source of truth and open-source community.
2. **CLI tool** — practical automation for developers.
3. **VS Code extension** — daily workflow tool for AI-assisted development.
4. **Desktop app** — local GUI for non-technical users.
5. **SaaS layer** — team workspaces, template marketplace, AI integrations, and governance.

## Development principle

Do not build complex tooling before the framework logic is clear.

The correct order is:

```text
Docs
→ Generators
→ Questionnaires
→ Examples
→ Prompt packs
→ Task tracking
→ CLI
→ VS Code extension
→ Desktop/SaaS
```

