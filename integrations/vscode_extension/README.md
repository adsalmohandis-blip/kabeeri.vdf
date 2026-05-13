# VS Code Integration Foundation

VS Code is a user-facing layer for Kabeeri. It must call the CLI and read `.kabeeri/` state rather than becoming a separate source of truth.

## Panels

- Tasks
- Dashboard
- AI usage
- GitHub sync
- Owner verification

## Architecture

```text
VS Code command/webview
-> kvdf CLI command
-> .kabeeri state
-> derived dashboard or report
```

## Rules

- Extension does not store independent project state.
- Extension does not bypass Owner verification.
- Extension does not write GitHub without CLI confirmation rules.
- Extension should be reusable as a model for other editors later.
- Use `kvdf vscode report` to inspect the generated editor bridge before adding more commands.
- Use `kvdf github report` to inspect the GitHub sync adapter before adding more commands.
