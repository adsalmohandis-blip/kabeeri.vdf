# Enterprise Example Workflow

## Step 1 — Choose profile

```text
enterprise
```

## Step 2 — Choose stack

Example stack:

```text
.NET backend
Angular frontend
PostgreSQL database
```

Alternative:

```text
Spring Boot backend
React frontend
```

## Step 3 — Create planning documents

Enterprise profile should include:

```text
Strategy
Architecture
Release specs
Database architecture
Execution plan
Engineering standards
Security and access
AI code prompts
Task tracking
Acceptance checklists
Release handoff
Extension layer
```

## Step 4 — Create tasks with dependencies

```text
ENT-T001 - Define roles and access model
ENT-T002 - Define branch data model
ENT-T003 - Create service request workflow
ENT-T004 - Create admin dashboard foundation
ENT-T005 - Add audit notes
ENT-T006 - Review release candidate
```

## Step 5 — Use prompt packs

Example:

```text
prompt_packs/dotnet/
prompt_packs/angular/
```

## Step 6 — Use stricter acceptance

Use:

```text
acceptance_checklists/FOLDER_OUTPUT_ACCEPTANCE_CHECKLIST.md
acceptance_checklists/PROMPT_PACK_ACCEPTANCE_CHECKLIST.md
acceptance_checklists/RELEASE_ACCEPTANCE_CHECKLIST.md
```

## Step 7 — Handoff

Do not publish an enterprise release without:

```text
- task review
- access review
- acceptance checklist
- release notes
- known limitations
```
