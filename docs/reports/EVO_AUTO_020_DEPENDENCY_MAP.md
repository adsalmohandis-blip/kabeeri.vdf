# EVO_AUTO_020 Dependency Map

## Priority

- ID: `evo-auto-020-two-track-entry`
- Title: `Two-Track Entry System`

## Upstream dependencies

- `src/cli/commands/resume.js`
- `src/cli/commands/track.js`
- `knowledge/governance/TRACK_ROUTING_GOVERNANCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `.kabeeri/session_track.json`

## Downstream dependents

- role and track enforcement
- planner track selection
- resume and onboarding guidance
- workspace boundary checks

## Notes

- This priority should remain the canonical first-step router for owner vs app work.
- Later enforcement work should tighten this boundary, not replace it.
- The persisted route decision is the key artifact that keeps future resume behavior predictable.
