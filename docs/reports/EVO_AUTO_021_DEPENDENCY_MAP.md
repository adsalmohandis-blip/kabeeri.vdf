# EVO_AUTO_021 Dependency Map

## Priority

- ID: `evo-auto-021-role-track-enforcement`
- Title: `Role and Track Enforcement`

## Upstream dependencies

- `src/cli/commands/resume.js`
- `src/cli/commands/track.js`
- `src/cli/validate.js`
- `knowledge/governance/TRACK_ROUTING_GOVERNANCE.md`
- `.kabeeri/session_track.json`

## Downstream dependents

- pack routing
- project profile routing
- workspace boundary checks
- planner track selection and prompts

## Notes

- This priority should remain the hard boundary layer for owner/app work.
- Later routing and packaging work should build on this enforcement, not bypass it.
- Keep the mismatch warnings visible so stale session state never silently wins.
