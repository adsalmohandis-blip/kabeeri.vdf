# GitHub Integration Bundle

This bundle is deprecated and kept only for compatibility. The canonical GitHub
provider now lives in `plugins/github_provider/`.

The bundle entrypoint lives in `plugins/github/bootstrap.js`.

It is installable and uninstallable through the standard plugin loader:

```bash
kvdf plugins install github
kvdf plugins uninstall github
```

## What lives here

- `commands/github.js`: plugin-owned GitHub command implementation.
- `import_instructions.md`: safe import guidance for GitHub mutations.
- `issues_backlog.md`: backlog template and issue grouping notes.
- `labels.json`: recommended GitHub label set.
- `milestones.md`: milestone planning and import guidance.

## Relationship To GitHub Sync

`plugins/github/` is now a compatibility bundle. Use `plugins/github_provider/`
for the canonical GitHub provider implementation. `plugins/github_sync/` is
also deprecated compatibility material.

Keep GitHub writes gated by the CLI confirmation and policy checks. The plugin
only stores the bundle contract and reference material.
