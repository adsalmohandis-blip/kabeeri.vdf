# evo-auto-004 Dependency Map

Generated while the active Evolution temporary queue is on the `map` slice.

## Core code surfaces

- `src/cli/index.js`
- `src/cli/commands/wordpress.js`
- `src/cli/services/wordpress.js`
- `src/cli/services/wordpress_plans.js`

## Runtime state surfaces

- `.kabeeri/wordpress.json`
- `.kabeeri/tasks.json`

## Schema surfaces

- `schemas/runtime/wordpress-state.schema.json`
- `schemas/runtime/tasks-state.schema.json`

## Documentation surfaces

- `knowledge/wordpress/WORDPRESS_DEVELOPMENT_ADOPTION.md`
- `knowledge/wordpress/WORDPRESS_PLUGIN_DEVELOPMENT.md`
- `cli/CLI_COMMAND_REFERENCE.md`
- `docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md`

## Test surfaces

- `tests/cli.integration.test.js`

## Coupled change rule

When the WordPress runtime services layer changes, the command facade, runtime state shape, CLI reference text, and integration tests must move together.

The implementation is still responsible for:

- keeping the command entry points stable
- preserving existing WordPress plan and scaffold behavior
- keeping WordPress state writes on the repository-backed `.kabeeri` files
- avoiding new scope outside evo-auto-004
