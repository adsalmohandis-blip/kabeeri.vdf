# Integrations

Primary integration:

- `app_category_registry`

This integration provides the approved `folder_structure_profile` that determines the roadmap internals for:

- UI/UX
- system design
- database / storage

Supporting contract surfaces:

- `track_control`
- workspace manifest and validation helpers
- evidence and audit writers

The plugin must fail closed when the category profile is missing or invalid.
