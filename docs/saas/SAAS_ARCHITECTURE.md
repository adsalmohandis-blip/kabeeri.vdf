# Kabeeri SaaS Architecture

This document defines the target architecture for the SaaS branch.

## Layers

```text
apps/saas/            Hosted web product
src/cli/              Local Kabeeri engine and reusable runtime behavior
knowledge/            System rules, governance, product intelligence, prompt logic
schemas/              Runtime contracts shared by local and hosted modes
integrations/         GitHub, dashboard, VS Code, and future provider integrations
packs/                Prompt packs, templates, examples, and generators
```

## Target Runtime Model

Local Kabeeri stores truth in `.kabeeri/`.

Kabeeri SaaS stores the same concepts in a hosted data model:

| Local Runtime | SaaS Runtime |
| --- | --- |
| `.kabeeri/project.json` | `workspaces` |
| `.kabeeri/tasks.json` | `tasks` |
| `.kabeeri/customer_apps.json` | `workspace_apps` |
| `.kabeeri/workstreams.json` | `workstreams` |
| `.kabeeri/tokens.json` | `task_access_tokens` |
| `.kabeeri/locks.json` | `locks` |
| `.kabeeri/ai_usage/*` | `ai_usage_events`, `cost_summaries` |
| `.kabeeri/policies/*` | `policy_results` |
| `.kabeeri/reports/live_reports_state.json` | `live_report_snapshots` |

## Suggested Production Stack

The first preview is dependency-free. The production SaaS can move to:

| Area | Recommendation |
| --- | --- |
| Web app | Next.js or Remix |
| API | Next.js route handlers, NestJS, or Laravel API |
| Database | PostgreSQL |
| Auth | Email/password + OAuth + organization roles |
| Billing | Stripe subscriptions |
| Background jobs | BullMQ, Cloud Tasks, or provider equivalent |
| Repository sync | GitHub App |
| AI providers | OpenAI, Anthropic, Gemini, local provider adapters |
| Deployment | Vercel/Render/Fly.io initially, then containerized option |

## Multi-Tenant Requirements

Every SaaS record that belongs to a customer must be scoped by:

```text
organization_id
workspace_id
```

Do not rely on frontend filters for tenant isolation.

## Security Requirements

- Store provider keys encrypted or use user-managed provider connections.
- Never expose task access tokens in dashboard HTML.
- Keep audit logs for Owner verification, GitHub writes, policy overrides, and billing changes.
- Separate organization roles from project workstream permissions.
- Treat repository content and AI prompts as customer data.

## Local Sync Principle

The SaaS should be able to import and export local Kabeeri state.

That means hosted data should remain compatible with the schemas in:

```text
schemas/runtime/
```

The SaaS app can add database tables and indexes, but it should not break the
core Kabeeri mental model.
