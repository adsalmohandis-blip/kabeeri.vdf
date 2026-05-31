# EVO_AUTO_031 Dependency Map

## Priority

- ID: `evo-auto-031-project-profiles`
- Title: `Project Profile System`

## Upstream dependencies

- `kvdf project profile route`
- `kvdf project profile status`
- `kvdf project profile report`
- `kvdf prompt-pack scale`
- `.kabeeri/project_profile.json`
- `.kabeeri/reports/project_profile_report.json`
- `.kabeeri/reports/scale_specific_packs_report.json`

## Downstream dependents

- scale-specific packs
- questionnaire planning
- intake group selection
- docs/CLI guidance

## Notes

- The profile report is the durable artifact for profile routing.
- Later intake work should reuse the current profile instead of recalculating it from memory.
- Scale-pack recommendations remain part of the same routing story.
