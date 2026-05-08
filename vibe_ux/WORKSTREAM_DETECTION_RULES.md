# Workstream Detection Rules

Kabeeri maps user intent to workstreams so tasks can be split safely.

## Workstreams

- `backend`
- `public_frontend`
- `admin_frontend`
- `database`
- `docs`
- `qa`
- `devops`
- `security`
- `design`
- `governance`
- `ai_cost_control`

## Detection Hints

- API, service, controller, worker: `backend`
- public page, landing, visitor: `public_frontend`
- dashboard, admin, settings: `admin_frontend`
- table, schema, migration: `database`
- README, guide, handoff: `docs`
- tests, release gate, checklist: `qa`
- deployment, hosting, CI: `devops`
- auth, secrets, privacy: `security`

## Split Rule

If a request touches multiple workstreams, create multiple suggested task cards or mark it as an `integration_task` with explicit approval.

