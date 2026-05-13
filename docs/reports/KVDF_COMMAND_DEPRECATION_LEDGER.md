# Kabeeri Command And Deprecation Ledger

Generated: 2026-05-13

This ledger summarizes the current CLI-first migration surface so the team can
see at a glance which commands are active, which ones were migrated out of the
monolithic CLI facade, which entry points remain as compatibility aliases, and
which older surfaces are still intentionally duplicated.

Source of truth:

- `cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `src/cli/index.js`
- `docs/reports/`

## Legend

- `active`: canonical user-facing command family.
- `migrated`: surface moved into a dedicated command module or durable docs
  surface.
- `compat-alias`: retained for backward compatibility and should resolve to the
  canonical command.
- `deprecated`: explicitly discouraged and slated for removal.
- `duplicated`: two active entry points intentionally overlap during migration.

## Active Canonical Surfaces

| Surface | Status | Notes |
| --- | --- | --- |
| `kvdf resume` | active | Canonical session resume entry point. |
| `kvdf task` | active | Canonical task tracker family. |
| `kvdf release` | active | Canonical release review and publish family. |
| `kvdf github` | active | Canonical GitHub sync family. |
| `kvdf dashboard` | active | Canonical dashboard and live JSON family. |
| `kvdf docs` | active | Canonical docs site lifecycle family. |
| `kvdf reports` | active | Canonical live report family. |
| `kvdf validate` | active | Canonical validation family. |
| `kvdf policy` | active | Canonical policy gate family. |
| `kvdf multi-ai` | active | Canonical Multi-AI governance family. |
| `kvdf github report` | active | Canonical GitHub sync trace surface. |
| `kvdf vscode report` | active | Canonical VS Code bridge trace surface. |
| `kvdf source-package` | active | Canonical imported source-package family. |
| `kvdf software-design` | active | Canonical permanent software-design reference family. |
| `kvdf docs-generator` | active | Canonical permanent docs-generator reference family. |

## Migrated Surfaces

| Surface | Status | Notes |
| --- | --- | --- |
| `src/cli/commands/release.js` | migrated | Release routing now lives in a command module instead of the monolith. |
| `src/cli/commands/github.js` | migrated | GitHub sync routing now lives in a command module. |
| `src/cli/commands/session.js` | migrated | Session routing now lives in a command module. |
| `src/cli/commands/runtime_report.js` | migrated | Readiness/governance report routing now lives in a command module. |
| `src/cli/services/evolution.js` | migrated | Evolution summary/state aggregation now lives in shared services. |
| `src/cli/services/ai_planner.js` | migrated | AI agent planning is centralized in a service helper. |
| `src/cli/services/multi_ai_relay.js` | migrated | Multi-AI relay watch behavior is centralized in a service helper. |

## Compatibility Aliases

| Alias | Canonical | Status | Notes |
| --- | --- | --- | --- |
| `kvdf start` | `kvdf resume` / track auto-route | compat-alias | Keeps the first-session entry route short. |
| `kvdf entry` | `kvdf resume` / track auto-route | compat-alias | Alternate first-session route. |
| `kvdf create` | `kvdf generate` | compat-alias | Generator convenience alias. |
| `kvdf tasks` | `kvdf task` | compat-alias | Legacy plural spelling retained for convenience. |
| `kvdf t` | `kvdf task` | compat-alias | Short alias retained for terminal convenience. |
| `kvdf tokens` | `kvdf token` | compat-alias | Legacy plural spelling retained for convenience. |
| `kvdf dash generate` | `kvdf dashboard export` | compat-alias | Older dashboard alias retained in docs/help. |
| `kvdf prompts` | `kvdf prompt-pack` | compat-alias | Legacy prompt-pack alias retained. |
| `kvdf trace show` | `kvdf trace report` | compat-alias | Traceability report view alias. |
| `kvdf trace list` | `kvdf trace report` | compat-alias | Traceability report view alias. |
| `kvdf risk report` | `kvdf change report` | compat-alias | Change-control report alias. |
| `kvdf docs build` | `kvdf docs generate` | compat-alias | Docs publishing lifecycle alias. |
| `kvdf docs preview` | `kvdf docs serve` | compat-alias | Local review alias. |
| `kvdf docs sync` | `kvdf docs generate` + validation | compat-alias | Regenerates and validates the docs site. |

## Deprecated Surfaces

- None currently. Older entry points are being retained as compatibility
  aliases while the CLI-first migration remains in progress.

## Still Duplicating Older Entry Points

| Surface Pair | Status | Notes |
| --- | --- | --- |
| `kvdf release publish` and `kvdf github release publish` | duplicated | Both paths intentionally share the release gate and GitHub write gate before any remote write occurs. |

## Maintenance Rule

When a command is renamed, extracted, or retired:

1. Update this ledger first.
2. Update `cli/CLI_COMMAND_REFERENCE.md`.
3. Update `docs/SYSTEM_CAPABILITIES_REFERENCE.md`.
4. Add or adjust a test in `tests/cli.integration.test.js` if the command
   surface changed.
