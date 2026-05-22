# GitHub Sync Rules Bundle

This bundle is deprecated and kept only for compatibility. The canonical GitHub
provider now lives in `plugins/github_provider/`.

The bundle entrypoint lives in `plugins/github_sync/bootstrap.js`.

It is installable and uninstallable through the standard plugin loader:

```bash
kvdf plugins install github_sync
kvdf plugins uninstall github_sync
```

## What lives here

- `GITHUB_SYNC_RULES.md`: safety rules and command intent for GitHub sync.
- `GITHUB_ISSUE_MAPPING.md`: task-to-issue mapping rules and conflict handling.

## Relationship To GitHub

`plugins/github_sync/` is now compatibility material. Use
`plugins/github_provider/` for the canonical GitHub provider implementation.
