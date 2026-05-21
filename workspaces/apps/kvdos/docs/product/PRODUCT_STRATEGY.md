# KVDOS Product Strategy

## Product Definition

KVDOS is a commercial, local-first, cloud-controlled AI Software Factory OS.

It is designed to turn a software idea into a governed, auditable, executable development workflow using discovery, specs, task queues, agents, patches, sandbox execution, and quality gates.

The discovery/spec planning surface is documentation-first. Questionnaire flow,
blueprint/spec notes, and `app.kvdos.yaml` validation are aligned in docs
before any UI or generator implementation.

> Note: this strategy document is a product plan. The current repository state is
> a local-first Studio and task-governance foundation, not a complete execution
> platform yet.

## Positioning

KVDOS is not a traditional IDE in its first versions.

The initial product is:

```text
Local IDE Studio + Local Runtime + Cloud subscription/license control
```

## Relationship With Kabeeri VDF

Kabeeri VDF is the open-source CLI governance core.

KVDOS is the commercial product layer built on top of VDF concepts and, later, VDF package/API integration.

## Target Users

### Primary

- Software agencies.
- AI-assisted developers.
- small development teams.
- product builders who use VS Code, Codex, Cursor, or Windsurf.

### Later

- Startups building MVPs.
- Enterprise internal tools teams.
- Organizations needing local/private runners.

## Commercial Value

KVDOS sells:

- project control
- agent orchestration
- local execution privacy
- task governance
- approval workflows
- package ecosystem
- team visibility
- licensing and enterprise controls

It should not sell raw AI tokens as the first business model.

## Recommended Commercial Model

```text
SaaS-first distribution
+ Local Runner for privacy
+ Enterprise self-hosted later
```

## Product Layers

### KVDOS Studio

Control center for:

- projects
- discovery
- blueprint
- `app.kvdos.yaml`
- task queues
- agents
- patches
- approvals
- logs
- reports

### KVDOS Runner

Execution layer for:

- FIFO tasks
- agents
- sandbox
- builds
- tests
- patch generation
- quality gates

### KVDOS Cloud

Commercial layer for:

- accounts
- organizations
- subscriptions
- licenses
- device activation
- release/download access control
- offline grace policy
- secure entitlement cache
- package registry
- marketplace
- team sync
- updates

## First Strategic Rule

Do not build a full IDE first, but do not defer the commercial gate past v1.

Build a local project studio and runner that works with existing editors, while
also shipping the subscription and license control required for commercial v1.

Keep the discovery/spec boundary app-local and pre-implementation until the
related slice is explicitly approved for build-out.

## Success Definition for v1

KVDOS v1 is agency-ready when a small software agency can use it to generate,
review, test, export, and commercially activate a CRM or clinic-management MVP
through a governed task/agent workflow.
