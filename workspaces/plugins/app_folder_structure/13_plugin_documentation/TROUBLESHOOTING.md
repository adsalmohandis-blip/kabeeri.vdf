# Troubleshooting

Common failure modes:

- unsafe app slug
- missing category profile
- path traversal attempt
- missing `08_source/source_manifest.json`
- non-empty file preservation during repair
- package comparison using absolute paths instead of package-relative paths

Recommended checks:

- run `kvdf app-folder status`
- run `kvdf app-folder validate --app <app-slug>`
- confirm the category profile is valid
- inspect the workspace manifest and evidence output
