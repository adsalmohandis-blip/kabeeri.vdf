# UI Dashboard Kits CLI

```bash
kvdf ui-dashboard-kits status --json
kvdf ui-dashboard-kits check path/to/file.html --json
kvdf ui-dashboard-kits examples --json
kvdf ui-dashboard-kits templates --json
kvdf ui-dashboard-kits snippets --json
```

## Commands

### `status`

Shows whether the plugin runtime is available and lists the active UI checks.

### `check`

Runs the lightweight static UI checker against the files you pass in. The
checker looks for:

- raw hex colors
- inline color styles
- Bootstrap button accessibility warnings
- danger button icon guidance
- loading, empty, and error state hints for data-driven surfaces

The command is safe to run with no file arguments. In non-JSON mode it prints a
usage reminder instead of failing.

### `examples`

Lists the dashboard example docs shipped with the plugin.

### `templates`

Lists the starter HTML templates shipped with the plugin.

### `snippets`

Lists the small reusable guidance snippets shipped with the plugin.

## Compatibility

The historical `knowledge/design_system/ui_execution_kit/scripts/check-ui.js`
path now delegates to this plugin so `npm run ui:check` remains supported during
migration.
