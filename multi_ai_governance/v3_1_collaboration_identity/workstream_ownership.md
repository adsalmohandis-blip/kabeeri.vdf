# Workstream Ownership Rules

## Standard Workstreams

| Workstream | Allowed primary roles |
|---|---|
| `backend` | Backend Developer, Maintainer, Owner, scoped AI Developer |
| `public_frontend` | Frontend Developer, Maintainer, Owner, scoped AI Developer |
| `admin_frontend` | Admin Frontend Developer, Maintainer, Owner, scoped AI Developer |
| `database` | Backend Developer with database approval, Maintainer, Owner |
| `docs` | Business Analyst, Reviewer, Maintainer, Owner, scoped AI Developer |
| `qa` | Reviewer, Maintainer, Owner, scoped AI Developer |

## Rules

- Each task should have one primary workstream.
- Cross-workstream tasks must be marked as `integration_task`.
- Integration Tasks require Owner or Maintainer approval before assignment.
- AI Developers can work only in workstreams listed in their task access token.
- Workstream locks can block assignment until resolved.

