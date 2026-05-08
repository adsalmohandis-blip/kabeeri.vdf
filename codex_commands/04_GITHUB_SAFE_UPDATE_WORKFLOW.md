# GitHub Safe Update Workflow

Default behavior: create import-ready files.
Use `gh` CLI only with auth and Owner approval.

Required outputs:
- `github/labels.json`
- `github/milestones.md`
- `github/issues_backlog.md`
- `github/import_instructions.md`
- `docs/production/FINAL_RELEASE_PREPARATION_CHECKLIST.md`

Rules:
- never push to main directly
- never close issues without Owner Verify
- never mutate GitHub without explicit approval
- if unsure, produce files only
