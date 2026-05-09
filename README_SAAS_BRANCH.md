# Kabeeri SaaS Branch

This branch turns Kabeeri VDF from a local-first framework into a SaaS product
track.

The original `main` branch remains the stable local framework for normal users.
This branch adds a hosted product layer in `apps/saas/` while keeping the CLI,
knowledge base, schemas, prompt packs, and governance runtime available as the
core engine.

## Product Direction

Kabeeri SaaS is a hosted workspace control center for AI-assisted software
development. It should let a developer or team:

- create hosted Kabeeri workspaces
- connect repositories
- manage product intake and questionnaires
- track tasks, workstreams, app boundaries, and AI agents
- monitor AI cost and token usage
- review dashboard/readiness/governance state
- coordinate multiple AI tools without relying on one chat session
- export local `.kabeeri/` state when needed

## Current Implementation Layer

The first SaaS implementation lives here:

```text
apps/saas/
```

It is intentionally dependency-free for the first branch slice. It provides:

- a Node HTTP server
- a SaaS landing/dashboard shell
- API health and workspace demo endpoints
- seed workspace data
- a smoke check command

Run it with:

```bash
npm run saas:start
```

Validate the scaffold with:

```bash
npm run saas:check
```

## Branch Rules

- Do SaaS-only work in this branch.
- Keep local CLI/framework work in `main` first, then merge `main` into this
  branch when needed.
- Do not remove local-first capabilities from the SaaS branch. The SaaS app is
  a hosted layer around the same Kabeeri engine.
- Any shared improvement should be proposed for `main` before it becomes a SaaS
  customization.
