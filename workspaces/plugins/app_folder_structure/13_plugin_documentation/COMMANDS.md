# Commands

The `app_folder_structure` command surface is:

- `kvdf app-folder status`
- `kvdf app-folder create --app <app-slug> --category <category>`
- `kvdf app-folder validate --app <app-slug>`
- `kvdf app-folder repair --app <app-slug>`
- `kvdf app-folder manifest --app <app-slug>`
- `kvdf app-folder print --category <category>`

Safety rules:

- app slugs are normalized to underscores
- category profiles must exist
- unsafe paths fail closed
- `08_source/` stays stack-adaptive
- repair is additive only
- non-empty files are preserved unless the safe path explicitly allows replacement
