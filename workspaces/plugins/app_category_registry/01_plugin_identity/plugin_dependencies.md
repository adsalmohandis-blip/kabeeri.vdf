# Plugin Dependencies

Required supporting systems:

- `plugin_folder_structure` for workspace governance and canonical plugin folders
- KVDOS CLI routing and plugin discovery
- `.kabeeri` runtime state storage
- JSON/YAML-safe config parsing
- evidence and audit writing

Logical data dependencies:

- category universe data
- active catalog data
- readiness matrix data
- visibility rules data
- compatibility rules data
- questionnaire packs
- roadmap templates
- workspace templates

The plugin should keep these dependencies data-driven and replaceable.
