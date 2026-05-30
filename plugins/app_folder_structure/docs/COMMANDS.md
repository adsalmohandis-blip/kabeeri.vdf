# Commands

- `kvdf app-folder status`
- `kvdf app-folder create --app <app-slug> --category <category>`
- `kvdf app-folder validate --app <app-slug>`
- `kvdf app-folder repair --app <app-slug>`
- `kvdf app-folder manifest --app <app-slug>`
- `kvdf app-folder print --category <category>`

`kvdf app-folder create` requires a matching `.kabeeri/app_pipeline_contract.json` produced by `kvdf app-category create`.

All commands fail closed when the app slug is unsafe, the category profile is missing, or the pipeline contract is missing or mismatched.
