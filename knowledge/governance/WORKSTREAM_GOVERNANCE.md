# Workstream Governance Runtime

Workstream Governance turns `backend`, `public_frontend`, `database`, `qa`, and similar labels into runtime boundaries. It works with task access tokens through `EXECUTION_SCOPE_GOVERNANCE.md`.

It answers three questions before work is treated as governed:

- Is this a known workstream?
- Is the assignee allowed to work in this workstream?
- Did the issued task access token and AI session stay inside the task workstream?

## Runtime State

`kvdf init` creates:

```text
.kabeeri/workstreams.json
```

Each workstream has:

- `id`
- `name`
- `description`
- `path_rules`
- `required_review`
- `status`

The default registry includes:

- `backend`
- `public_frontend`
- `admin_frontend`
- `mobile`
- `database`
- `devops`
- `qa`
- `docs`
- `integrations`
- `security`

Use `mobile` for Expo, React Native, Flutter, iOS/Android navigation, device
permissions, push notifications, and mobile-only UI behavior. Use
`public_frontend` for web storefronts and browser-facing UI.

## CLI

```bash
kvdf workstream list
kvdf workstream show backend
kvdf workstream add --id payments --name "Payments" --paths src/payments,app/Payments --review security,contract_safety
kvdf workstream update backend --paths src/api,app/Http,routes/api.php
kvdf workstream validate
kvdf validate workstream
```

## Enforcement

Task creation rejects unknown workstreams:

```bash
kvdf task create --title "Unknown" --workstream random_area
```

Cross-workstream tasks must be explicit integration tasks:

```bash
kvdf task create --title "Wire API to storefront" --type integration --workstreams backend,public_frontend
```

Task assignment checks developer or agent capability:

```bash
kvdf agent add --id backend-agent --name "Backend Agent" --role "AI Developer" --workstreams backend
kvdf task assign task-001 --assignee backend-agent
```

AI session completion checks touched files against the task workstream path rules:

```bash
kvdf session end session-001 --files src/api/users.ts --summary "Implemented endpoint"
```

If a backend task touches a frontend-only file, the session is blocked.

Task access tokens also derive `allowed_files` from the task app and workstream boundaries:

```bash
kvdf token issue --task task-001 --assignee backend-agent
kvdf token show task-token-001
```

## Dashboard

The private Live Dashboard includes a Workstream Governance section with:

- workstream status
- path rules
- task counts
- open work
- session counts
- token and cost rollups

## Solo Developer Mode

Solo Developer Mode grants one full-stack developer all standard workstreams. It does not bypass this governance:

- tasks still reference known workstreams
- cross-workstream tasks still require `--type integration`
- session files still have to match the task workstream path rules
- dashboard still shows per-workstream progress and cost

## App Boundary Relationship

App Boundary Governance and Workstream Governance are separate layers:

- App Boundary says which app the work belongs to.
- Workstream Governance says which engineering lane owns the work.
- Developer capability says who can execute it.

For example, a Laravel API and React storefront can be one product with multiple apps, while backend and public frontend remain separate workstreams.
