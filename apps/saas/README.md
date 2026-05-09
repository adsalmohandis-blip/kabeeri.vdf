# Kabeeri SaaS App

This app is the hosted SaaS layer for Kabeeri VDF.

It is not a replacement for the local CLI. It is the web product surface that
will eventually call the same Kabeeri runtime concepts: workspaces, intake,
tasks, workstreams, AI agents, dashboards, reports, cost tracking, and release
gates.

## Run

```bash
npm run saas:start
```

Open:

```text
http://127.0.0.1:4290
```

## Check

```bash
npm run saas:check
```

## Current Routes

| Route | Purpose |
| --- | --- |
| `/` | Product overview and start actions. |
| `/dashboard` | Hosted workspace dashboard shell. |
| `/api/health` | JSON health check. |
| `/api/workspaces` | Demo workspace list. |

## Next SaaS Milestones

1. Add authentication and tenant accounts.
2. Add persistent database storage.
3. Add repository connection and workspace import.
4. Add hosted task tracker and dashboard APIs.
5. Add AI provider routing and usage billing.
6. Add GitHub sync and release gates.
