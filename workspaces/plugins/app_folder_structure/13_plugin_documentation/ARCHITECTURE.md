# Architecture

`app_folder_structure` is organized around three layers:

1. `core/`
   - canonical constants
   - track and category resolution
   - the app workspace plan

2. `services/`
   - creation
   - validation
   - repair
   - manifest writing
   - evidence writing

3. `commands/`
   - CLI-facing wrappers for status, create, validate, repair, manifest, and print

The design principle is simple:

- the workspace is governed
- the source layout is stack-adaptive
- the plugin never invents a second plugin structure
- category profiles define the roadmap internals
- promotion remains an Owner Track concern
