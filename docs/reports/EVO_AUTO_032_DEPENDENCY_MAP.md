# EVO_AUTO_032 Dependency Map

## Priority

- ID: `evo-auto-032-scale-packs`
- Title: `Scale-Specific Packs`

## Upstream dependencies

- `kvdf prompt-pack scale`
- `kvdf project profile route`
- `kvdf project profile report`
- `.kabeeri/reports/scale_specific_packs_report.json`
- `.kabeeri/reports/project_profile_report.json`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`

## Downstream dependents

- prompt-pack composition
- task generation
- questionnaire planning
- docs/CLI guidance

## Notes

- The scale-pack report is the durable record of the selected bundle.
- Later prompt composition should reuse the same scale-aware selection.
- Large-system routing is a distinct layer above the base project profile.
