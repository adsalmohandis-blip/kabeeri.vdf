# Acceptance Criteria

- `plugin.json` loads cleanly.
- `bootstrap.js` registers the command surface.
- `kvdf plugin-folder status` prints JSON with `--json` and readable text without it.
- New plugin-dev workspaces use the canonical numbered folders from `00_plugin_inputs/` through `13_plugin_documentation/` plus `99_plugin_archive/`.
- `04_plugin_package/` is the actual candidate package.
- Owner Track can create directly in `./plugins/<plugin-slug>/`.
- Plugin Development Track can create in `./workspaces/plugins/<plugin-slug>/`.
- Viber/App Track is blocked.
- Git library input records are governed.
- Integration contracts are recorded.
- Owner review and marketplace upload requests remain request-only.
- The redundant `08_plugin_source/` folder is not generated in the canonical layout.
