# 02 — Framework Architecture

## Overview

Kabeeri VDF is a meta-framework made of layers. Each layer solves a different part of AI-driven software development.

```text
Kabeeri VDF
├── Project Profile Layer
├── Project Skeleton Layer
├── Architecture Guide Layer
├── Questionnaire Layer
├── Documentation Generation Layer
├── Prompt Pack Layer
├── Task Tracking Layer
├── Acceptance & Review Layer
└── Extension Layer
```

The framework starts before code. It helps define the product, collect answers, create documents, produce prompts, track execution, and review AI-generated work.

## 1. Project Profile Layer

This layer decides the size and depth of the project structure.

Planned profiles:

- **Lite** — small projects and MVPs
- **Standard** — normal software products and business apps
- **Enterprise** — complex systems and long-term platforms

The profile controls which folders and starter files are generated.

## 2. Project Skeleton Layer

This layer creates the initial folder structure.

It should generate:

- core folders
- production-readiness folders
- extension folders
- archive folder
- architecture guide inside the system index
- one folder owner questionnaire inside each folder

It should not generate many empty detailed documents before the project owner answers the questionnaires.

## 3. Architecture Guide Layer

The architecture guide explains the generated project structure.

It should help the user understand:

- what each folder means
- why each folder exists
- what type of documents belong inside it
- how the folder relates to the full lifecycle
- how to use folder questionnaires with AI

## 4. Questionnaire Layer

Each important folder can contain a folder owner questionnaire.

The questionnaire should:

- explain the folder’s purpose
- list the documents AI can generate for that folder
- ask beginner-friendly questions about the product
- avoid vague technical questions where possible
- mark unavoidable technical questions clearly
- instruct the AI to generate documents for that folder only

The questionnaire is the bridge between a non-technical project owner and AI-generated project documentation.

## 5. Documentation Generation Layer

After the project owner answers a questionnaire, the answered file can be sent to an AI assistant.

The AI should generate the detailed documents for that specific folder based on the answers.

Example:

```text
01_STRATEGY_AND_BUSINESS/
└── 00_FOLDER_OWNER_QUESTIONNAIRE.md

After answers:
├── 01_Product_Master_Summary.md
├── 02_Target_Users.md
├── 03_Business_Model.md
└── 04_Pricing_And_Plans.md
```

This prevents the framework from generating many empty documents that do not contain project-specific information.

## 6. Prompt Pack Layer

Prompt packs convert approved documents into implementation instructions for AI coding tools.

Prompt packs may be created for:

- Laravel
- .NET
- Next.js
- WordPress
- Django
- other stacks

Each prompt should be small, focused, and reviewable.

A good prompt should define:

- the task goal
- the files AI may change
- the files AI must not change
- expected output
- required tests or review steps
- task tracking reference

## 7. Task Tracking Layer

Task tracking helps the vibe developer know what has been done, what is in progress, and what needs review.

Suggested task statuses:

```text
pending
in_progress
ai_done
review_needed
verified
blocked
```

A task should include:

- task ID
- title
- related prompt
- status
- notes
- tests or checks
- review result

## 8. Acceptance & Review Layer

This layer defines how completed AI output should be reviewed.

Acceptance checklists should cover:

- functionality
- clarity
- file structure
- permissions and safety
- data handling
- tests
- user experience
- documentation updates

The goal is to prevent blind trust in AI-generated output.

## 9. Extension Layer

Future features should not directly modify the project core.

The extension layer is used for:

- future features
- optional modules
- paid add-ons
- experimental ideas
- integrations
- platform extensions

A future feature should move through:

```text
Idea
→ Extension proposal
→ Business review
→ Technical review
→ Database/API addendum
→ Prompt pack
→ Task tracking
→ Acceptance
→ Release
```

## Architecture rule

Kabeeri VDF should protect the core project from uncontrolled growth.

New features should start as extension proposals unless they are clearly required for the first product version.

