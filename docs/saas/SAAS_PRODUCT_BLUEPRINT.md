# Kabeeri SaaS Product Blueprint

Kabeeri SaaS turns the local Kabeeri VDF workflow into a hosted product for
developers, teams, agencies, and AI-assisted software delivery.

## Product Name

Working name: **Kabeeri Cloud**

## Core Promise

Kabeeri Cloud lets a developer speak naturally to any AI assistant while the
project work is tracked, scoped, governed, cost-aware, resumable, and visible in
a hosted dashboard.

## Primary Users

| User | Needs |
| --- | --- |
| Solo vibe coder | Start projects quickly, avoid losing context, reduce AI mistakes. |
| Technical owner | Track tasks, cost, readiness, GitHub sync, and release gates. |
| Agency lead | Manage many client projects and multiple AI tools. |
| AI developer operator | Run scoped AI tasks with clear context and evidence. |
| Reviewer / QA | Review acceptance, policies, security, and migration gates. |

## SaaS Modules

| Module | Purpose |
| --- | --- |
| Tenant Accounts | Organizations, users, roles, subscriptions, and billing. |
| Hosted Workspaces | Cloud representation of `.kabeeri/` state per project. |
| Repository Connections | GitHub repository links, branch tracking, and sync status. |
| Vibe Intake | Natural language product goal, adaptive questions, and docs-first tasks. |
| Task Governance | Hosted task tracker with assignment, review, verification, and evidence. |
| AI Agent Control | Agent identities, scopes, locks, task tokens, and provider routing. |
| Live Dashboard | Task, workstream, app boundary, readiness, governance, cost, and release views. |
| Cost Control | AI usage, budget alerts, untracked prompts, and per-task cost reports. |
| Release Gates | Security, migration, policy, GitHub write, handoff, and publish gates. |
| Export / Local Sync | Import/export `.kabeeri/` state so local and hosted workflows remain compatible. |

## First SaaS Slice

The current branch starts with a dependency-free preview app:

```text
apps/saas/
```

It proves the product shape:

- hosted product shell
- workspace dashboard page
- JSON API health endpoint
- workspace list endpoint
- seed workspace state

## What Must Stay Shared With Local Kabeeri

The SaaS product should not fork the core rules casually. These concepts remain
shared with local Kabeeri:

- product blueprints
- adaptive questionnaire logic
- task governance
- app boundary governance
- workstream governance
- execution scope governance
- AI usage and cost records
- dashboard state concepts
- policy gates
- runtime schemas
- prompt packs

## Success Criteria

Kabeeri SaaS is successful when a developer can:

1. Create a hosted workspace.
2. Describe the project in one sentence.
3. Let Kabeeri generate questions and docs-first tasks.
4. Connect a GitHub repository.
5. Assign scoped work to one or more AI tools.
6. Track every task, cost, policy, and release decision.
7. Export the workspace back into local `.kabeeri/` format.
