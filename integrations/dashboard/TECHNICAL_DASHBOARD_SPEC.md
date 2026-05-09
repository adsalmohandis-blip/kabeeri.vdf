# Technical Dashboard Spec

The technical dashboard is a derived view. It is not the source of truth.

## State File

`.kabeeri/dashboard/technical_state.json`

## Sections

- Tasks by status
- GitHub issue sync state
- Branch/build/test status
- Database tables and migration notes
- Backend progress
- Public frontend progress
- Admin frontend progress
- Docs progress
- Testing progress
- Developer/agent activity
- Locks and current assignments
- Cost so far
- App boundary status
- Linked KVDF workspace summaries
- Live policy/security/migration blockers
- Dashboard UX action center
- Dashboard UX audit status

## Safety

- Do not expose secrets.
- Do not allow final verify unless current actor is Owner.
- Do not resolve GitHub conflicts automatically.
- Do not mix unrelated products inside one workspace; show them as linked KVDF workspaces instead.

## UX Governance

The technical dashboard must remain readable during large projects. Use `kvdf dashboard ux` to audit source-of-truth notice, action center, live state, responsive tables, empty states, governance visibility, cost visibility, Vibe/Agile visibility, and common secret leakage.
