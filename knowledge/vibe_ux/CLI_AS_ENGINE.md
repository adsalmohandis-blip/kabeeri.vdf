# CLI As Engine

The `kvdf` CLI powers actions behind UI buttons, command palette entries, dashboard controls, and automation.

## User-Facing Rule

Core workflows should not require manually typing CLI commands.

## Direct CLI Use

Direct CLI is appropriate for:

- power users
- automation
- CI checks
- imports and exports
- scripted validation
- troubleshooting

## UI To CLI Examples

| UI Action | Internal Command |
|---|---|
| Create task | `kvdf task create` |
| Assign task | `kvdf task assign` |
| Start work | `kvdf task start` |
| Issue access token | `kvdf token issue` |
| Create lock | `kvdf lock create` |
| Estimate cost | `kvdf usage estimate` or future cost preflight command |
| Generate dashboard | `kvdf dashboard generate` |
| Owner verify | `kvdf task verify` |
| Reject task | `kvdf task reject` |

## Result Contract

UI layers should receive structured results: `success`, `warning`, `failure`, `needs_approval`, or `partial`. Raw terminal output should be translated into clear user messages.

