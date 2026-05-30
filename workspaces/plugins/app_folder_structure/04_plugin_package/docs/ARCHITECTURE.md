# Architecture

The plugin is organized around three layers:

1. `core/`
   - canonical constants
   - category registry
   - safe slug and track resolution
   - the app workspace plan

2. `services/`
   - creation
   - validation
   - repair
   - manifest writing
   - evidence writing

3. `commands/`
   - CLI-facing wrappers for status, create, validate, repair, manifest, and print

The plugin uses the category profile as the source of truth for roadmap internals and stores the generated app manifest inside the workspace itself.
