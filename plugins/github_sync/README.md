# GitHub Sync Rules Bundle

This bundle packages the GitHub sync rules used by KVDF as a removable plugin.
The bundle entrypoint lives in `plugins/github_sync/bootstrap.js`.

It is installable and uninstallable through the standard plugin loader:

```bash
kvdf plugins install github_sync
kvdf plugins uninstall github_sync
```

You can also toggle the active state without changing bundle files:

```bash
kvdf plugins enable github_sync
kvdf plugins disable github_sync
```

## What lives here

- `GITHUB_SYNC_RULES.md`: safety rules and command intent for GitHub sync.
- `GITHUB_ISSUE_MAPPING.md`: task-to-issue mapping rules and conflict handling.

## Relationship To GitHub

`plugins/github_sync/` holds the sync policy layer. `plugins/github/` holds the
planning and import-reference bundle. Together they define the safe GitHub
surface without making GitHub the source of truth.
