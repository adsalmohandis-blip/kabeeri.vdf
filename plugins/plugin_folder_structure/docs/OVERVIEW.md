# Overview

`plugin_folder_structure` governs where plugin folders live and which track is allowed to create them.

It keeps the rules simple:

- No numbered folders.
- No folder names start with `plugin_`.
- `docs/` is the single docs folder and holds the documentation layer.
- `prompts/`, `runtime/`, `dashboard/`, and `viber_blocking/` are mandatory shell folders.
- `src/`, `schemas/`, and `tests/` stay in place.
- Owner Track may create a plugin directly in `./plugins/<plugin-slug>/`
- Plugin Development Track may create a workspace in `./workspaces/plugins/<plugin-slug>/`
- Viber/App Track must switch to Plugin Development Track

The plugin also provides:

- status reporting
- safe folder creation
- validation and readiness checks
- Git library governance
- integration contracts
- owner review requests
- marketplace upload requests
