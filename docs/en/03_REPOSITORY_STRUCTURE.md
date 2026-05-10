# 03 — Repository Structure

# Legacy English File - Repository Structure

This file is retained for old links only. The canonical English file is
`docs/en/04_REPOSITORY_STRUCTURE.md`, and the Arabic counterpart is
`docs/ar/04_REPOSITORY_STRUCTURE.md`.

New documentation links should use the canonical numbered files listed in
`docs/en/README.md`.

---

## Purpose

This document explains the repository structure of Kabeeri VDF and what each folder is responsible for.

The repository is designed to support documentation, generators, questionnaires, prompt packs, task tracking, acceptance checklists, schemas, examples, and future tooling.

## Root structure

```text
kabeeri.vdf/
│
├── generators/
├── templates/
├── questionnaires/
├── prompt_packs/
├── task_tracking/
├── acceptance_checklists/
├── schemas/
├── examples/
├── docs/
├── README.md
├── README_AR.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── GOVERNANCE.md
├── ROADMAP.md
└── CHANGELOG.md
```

## Folder responsibilities

| Folder | Purpose |
|---|---|
| `generators/` | Contains JSON generator profiles such as Lite, Standard, and Enterprise. |
| `templates/` | Contains reusable document templates in Arabic and English. |
| `questionnaires/` | Contains folder questionnaire templates for core, production, and extension layers. |
| `prompt_packs/` | Contains AI prompt packs for implementation stacks such as Laravel, .NET, Next.js, and WordPress. |
| `task_tracking/` | Contains task tracking formats, examples, and future workflow rules. |
| `acceptance_checklists/` | Contains checklists for reviewing AI-generated documents, prompts, and code output. |
| `schemas/` | Contains JSON schemas and validation rules for generators and task formats. |
| `examples/` | Contains example projects that show the framework lifecycle in practice. |
| `docs/` | Contains Arabic and English documentation. |

## Generators

The `generators/` folder should include:

```text
generators/
├── lite.json
├── standard.json
└── enterprise.json
```

Each generator describes a project skeleton. The generator should create folders and starter guidance files, not full empty documentation sets.

Expected behavior:

- create folders
- add architecture guide
- add questionnaire files
- avoid unnecessary empty detailed documents

## Templates

The `templates/` folder should include reusable template files.

```text
templates/
├── arabic/
└── english/
```

Templates may include:

- architecture guide templates
- folder questionnaire templates
- prompt templates
- checklist templates
- task tracking templates

## Questionnaires

The `questionnaires/` folder stores reusable questionnaire sources.

```text
questionnaires/
├── core/
├── production/
└── extension/
```

Questionnaires should be beginner-friendly and product-focused.

They should help the user answer questions such as:

- what is the product?
- who will use it?
- what should the first version do?
- what data does the system need to store?
- what screens are needed?
- what features are future extensions?

## Prompt packs

The `prompt_packs/` folder organizes implementation prompts by stack.

```text
prompt_packs/
├── laravel/
├── dotnet/
├── nextjs/
└── wordpress/
```

Each prompt pack should eventually include:

- prompt index
- project setup prompts
- database prompts
- authentication prompts
- dashboard prompts
- testing prompts
- review prompts

## Task tracking

The `task_tracking/` folder should define how tasks are represented and updated.

A future task object may include:

```json
{
  "id": "T001",
  "title": "Create project skeleton",
  "status": "pending",
  "prompt_ref": "P001",
  "notes": "",
  "tests": [],
  "verified_by": null
}
```

## Acceptance checklists

The `acceptance_checklists/` folder should contain checklists for reviewing work.

Examples:

- document acceptance checklist
- generator acceptance checklist
- prompt pack acceptance checklist
- AI coding task acceptance checklist
- release readiness checklist

## Docs

The `docs/` folder contains:

```text
docs/
├── ar/
├── en/
└── rfcs/
```

- `docs/ar/` contains Arabic documentation.
- `docs/en/` contains English documentation.
- `docs/rfcs/` can contain future Request for Comments documents.

## Repository rule

The repository should remain easy to understand for beginners.

Do not add complex tooling before the documentation, generators, questionnaires, and examples are clear.
