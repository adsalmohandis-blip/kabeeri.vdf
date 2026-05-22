# UI Dashboard Kits CLI

```bash
kvdf ui-dashboard-kits status --json
kvdf ui-dashboard-kits check path/to/file.html --json
kvdf ui-dashboard-kits examples --json
kvdf ui-dashboard-kits templates --json
kvdf ui-dashboard-kits snippets --json
kvdf ui-dashboard-kits provider --json
kvdf ui-dashboard-kits recommend --surface owner-dashboard --json
kvdf ui-dashboard-kits html-comment --surface owner-dashboard --json
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

### `provider`

Shows whether the dashboard kit provider is available and whether the command
should use the optional plugin or the fallback surface.

### `recommend`

Returns a small dashboard-kit recommendation set for a target surface such as
`owner-dashboard`, `viber-dashboard`, `planner-visual`, or `docs-status`.

### `html-comment`

Returns the short HTML comment marker that KVDF-generated HTML surfaces can use
to identify the selected dashboard kit provider.

## Compatibility

The historical `knowledge/design_system/ui_execution_kit/scripts/check-ui.js`
path now delegates to this plugin so `npm run ui:check` remains supported during
migration. The optional provider/recommendation commands are guidance-only and
do not require Bootstrap or Tailwind packages.
