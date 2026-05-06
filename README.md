# Kabeeri Vibe Developer Framework

**Kabeeri Vibe Developer Framework** — also known as **Kabeeri VDF** or **kabeeri.vdf** — is an open-source meta-framework for AI-powered software builders, vibe developers, founders, and small teams.

It sits above traditional coding frameworks such as **Laravel**, **.NET**, **Next.js**, **Django**, and **WordPress**.

Kabeeri VDF does not replace those frameworks. Instead, it helps users understand what to build, organize the idea, generate project documentation, create AI-ready prompts, track implementation tasks, and review AI-generated output before and during coding.

---

## What is Kabeeri VDF?

Traditional development frameworks usually start at the code level:

```text
Routes
Controllers
Models
Migrations
Views
Tests

Kabeeri VDF starts before code:

Raw idea
→ beginner-friendly questions
→ structured project folders
→ folder-specific documents
→ AI-ready prompts
→ implementation tasks
→ generated code
→ review and acceptance
→ future extensions

The goal is to give vibe developers a repeatable system for turning product ideas into software projects that can be built with AI tools.

Why this framework exists

AI coding tools are powerful, but many users struggle with:

not knowing what to ask the AI
starting coding before the product is clear
mixing core features with future ideas
generating too many random files
losing track of what has been done
accepting AI output without proper review
rebuilding the same planning structure for every project

Kabeeri VDF solves this by providing a structured workflow for AI-driven development.

Who is it for?

Kabeeri VDF is designed for:

vibe developers
AI-powered software builders
founders building software with AI
product owners who want structured project planning
small teams using ChatGPT, Codex, Cursor, Claude Code, Windsurf, GitHub Copilot, or similar tools
agencies that want a repeatable AI delivery method
developers who want a clean planning layer before coding

You do not need deep programming experience to start using the framework, but it can also support experienced developers who want a better AI workflow.

What Kabeeri VDF is not

Kabeeri VDF is not:

a replacement for Laravel, .NET, Next.js, Django, or WordPress
a low-code platform
a no-code app builder
only a prompt collection
only a folder template
only a code generator

It is a meta-framework for organizing AI-driven software development before, during, and after code generation.

Core workflow

1. Choose a project profile
2. Generate the project skeleton
3. Open the architecture guide
4. Answer folder questionnaires
5. Ask AI to generate folder documents from the answered questionnaires
6. Generate coding prompts
7. Execute one task at a time using an AI coding tool
8. Track task progress
9. Review output using acceptance checklists
10. Plan future extensions without damaging the core project

Project profiles

Kabeeri VDF is planned around three project profiles.

Lite

For small projects, quick MVPs, landing pages, simple dashboards, and small internal tools.

Standard

For normal SaaS products, web apps, booking systems, CMS-style products, e-commerce systems, and business applications.

Enterprise

For large systems, multi-tenant platforms, ERP-style products, marketplaces, AI platforms, and long-term product ecosystems.

Repository layout

kabeeri.vdf/
│
├── generators/
│   ├── lite.json
│   ├── standard.json
│   └── enterprise.json
│
├── templates/
│   ├── arabic/
│   └── english/
│
├── questionnaires/
│   ├── core/
│   ├── production/
│   └── extension/
│
├── prompt_packs/
│   ├── laravel/
│   ├── dotnet/
│   ├── nextjs/
│   └── wordpress/
│
├── task_tracking/
├── acceptance_checklists/
├── schemas/
├── examples/
└── docs/
    ├── ar/
    └── en/

Main parts of the framework
Generators

JSON files that describe which folders and starter files should be created for each project profile.

Templates

Reusable document templates in Arabic and English.

Questionnaires

Beginner-friendly question files that help project owners describe their product clearly.

Each folder can have its own questionnaire. After the owner answers it, the answered file can be sent to an AI assistant to generate the detailed documents for that folder.

Prompt packs

AI-ready prompt packs for different coding stacks such as Laravel, .NET, Next.js, and WordPress.

Task tracking

A simple structure for tracking AI-assisted development tasks from idea to verification.

Acceptance checklists

Review checklists that help users decide whether AI-generated work is actually complete and safe to accept.

Docs

Arabic and English documentation for understanding and using the framework.

How to use it today

Kabeeri VDF is currently in an early foundation stage.

For now, the recommended usage is:

1. Download or clone this repository.
2. Choose a generator profile: Lite, Standard, or Enterprise.
3. Use the generator instructions to create a project skeleton.
4. Open the architecture guide inside the generated project.
5. Answer the questionnaire inside each folder.
6. Send the answered questionnaire to an AI assistant.
7. Let the AI generate the detailed documents for that folder.
8. Use prompt packs to start implementation with your preferred stack.
9. Track tasks and review output using the framework checklists.

Future versions will include a CLI tool to automate this flow.

Planned CLI

The planned command name is:

kvdf

Possible future commands:

kvdf new my-project --profile lite --lang en
kvdf new my-project --profile standard --lang ar
kvdf new my-project --profile enterprise --lang en
kvdf validate
kvdf export-ai-handoff
kvdf tasks list
kvdf tasks next

The CLI is not the first goal. The first goal is to stabilize the framework structure, documentation, generators, questionnaires, and prompt packs.

Roadmap
v0.1.x — Foundation
improve README files
complete Arabic and English docs
review generator structure
improve beginner-friendly questionnaires
define task tracking format
create acceptance checklist templates
v0.2.0 — Generator system
stabilize Lite, Standard, and Enterprise generators
add schemas and validation rules
improve generated skeleton examples
v0.3.0 — CLI prototype
introduce the first kvdf command-line interface
support project creation from profiles
support validation and AI handoff export
v0.4.0 — Prompt packs
create the first real Laravel prompt pack
add Next.js prompt pack draft
prepare .NET and WordPress prompt pack structures
v0.5.0 — VS Code extension prototype
create projects from inside VS Code
open questionnaires
validate structure
manage task tracking
v1.0.0 — Stable framework
stable generators
stable CLI
complete docs
real examples
contributor-ready workflow
tested framework lifecycle

Example positioning

Laravel helps developers write code faster.
Kabeeri VDF helps vibe developers know what to ask AI, in what order, and how to review the result.

Current status

Kabeeri VDF is in early public development.

The first public foundation release is:

v0.1.0

The next development milestone is:

v0.1.1

Focus of v0.1.1:

repository cleanup
README improvement
documentation improvement
generator review
questionnaire improvement

Contributing

Contributions are welcome, especially in:

documentation
beginner-friendly questionnaires
project generators
prompt packs
examples
task tracking
acceptance checklists
CLI design

Before contributing, please read:

CONTRIBUTING.md
CODE_OF_CONDUCT.md
GOVERNANCE.md
SECURITY.md

Good first contribution areas:

improve wording
fix documentation
simplify beginner questions
add examples
review prompt templates

License

Kabeeri Vibe Developer Framework is open-source software released under the MIT License.

See:

LICENSE
Short definition

Kabeeri Vibe Developer Framework is a meta-framework for AI-driven software development. It helps vibe developers turn raw product ideas into structured folders, beginner-friendly questionnaires, AI-ready documents, coding prompts, implementation tasks, and acceptance checklists before writing code with Laravel, .NET, Next.js, WordPress, or any other stack.
