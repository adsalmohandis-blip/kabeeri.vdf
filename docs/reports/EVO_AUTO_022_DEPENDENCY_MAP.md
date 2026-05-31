# EVO_AUTO_022 Dependency Map

## Priority

- ID: `evo-auto-022-pack-router`
- Title: `Pack Router and Project Profile System`

## Upstream dependencies

- `src/cli/commands/project_profile.js`
- `src/cli/commands/prompt_pack.js`
- `knowledge/project_intake/README.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `.kabeeri/project_profile.json`

## Downstream dependents

- questionnaire planning
- delivery mode recommendation
- prompt-pack composition
- project bootstrap and start flow

## Notes

- This priority should remain the routing layer that chooses the smallest correct pack set for the project.
- Later planning should use the selected profile instead of recomputing the same decision.
- The profile record is the durable handoff artifact for future resume and reporting flows.
