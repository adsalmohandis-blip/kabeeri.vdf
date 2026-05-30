# Success Criteria

- app workspaces can be created safely
- category-governed roadmap folders are reproducible
- `08_source` stays neutral
- manifests and evidence are generated
- repairs are additive only
# Success Criteria

`app_folder_structure` is successful when:

- `kvdf app-folder status` reports the canonical contract clearly
- `kvdf app-folder create --app <slug> --category <category>` creates the fixed app pipeline safely
- `kvdf app-folder validate --app <slug>` fails closed on missing or unsafe structure
- `kvdf app-folder repair --app <slug>` adds missing files without overwriting user content
- category-governed roadmaps are sourced from approved profiles
- `08_source/` remains stack-adaptive
- manifests and evidence are written for create, validate, and repair operations
- the workspace plan and plugin package docs stay in sync
- underscore slugs are used consistently in workspace paths
