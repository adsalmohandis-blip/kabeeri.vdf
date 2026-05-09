# Solo Developer Mode

Solo Developer Mode is for a KVDF workspace where one human developer is responsible for backend, frontend, admin, database, DevOps, QA, documentation, and integrations.

It does not disable governance. It removes unnecessary team assignment friction while keeping app boundaries, locks, tokens, policy gates, AI usage, and Owner verification visible.

## Configure

```bash
kvdf developer solo --id dev-main --name "Main Developer"
```

This creates or updates one developer with role `Full-stack Developer` and grants the standard full-stack workstreams:

- backend
- public_frontend
- admin_frontend
- database
- devops
- qa
- docs
- integrations
- security

For a solo owner/developer workspace:

```bash
kvdf developer owner-developer --id owner-001 --name "Project Owner"
```

## Runtime State

Solo mode is stored in:

```text
.kabeeri/developer_mode.json
```

Developers remain stored in:

```text
.kabeeri/developers.json
```

## Rules

- A solo developer can be assigned tasks in all standard workstreams.
- App Boundary Governance still prevents work outside registered app paths.
- Lock and token scopes still apply.
- Policy gates still apply.
- Owner verification remains separate unless the workspace explicitly uses `Owner-Developer`.

## Dashboard

The Live Dashboard shows Developer Mode and the active solo developer so a resumed session can quickly identify whether the workspace is solo or team-based.
