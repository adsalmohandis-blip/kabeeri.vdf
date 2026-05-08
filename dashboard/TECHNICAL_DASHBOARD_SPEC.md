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

## Safety

- Do not expose secrets.
- Do not allow final verify unless current actor is Owner.
- Do not resolve GitHub conflicts automatically.
