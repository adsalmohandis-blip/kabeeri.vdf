# GitHub Integration Bundle

This bundle packages the GitHub planning and sync notes used by KVDF as a
removable plugin.

It is installable and uninstallable through the standard plugin loader:

```bash
kvdf plugins install github
kvdf plugins uninstall github
```

You can also toggle the active state without changing the bundle files:

```bash
kvdf plugins enable github
kvdf plugins disable github
```

## What lives here

- `import_instructions.md`: safe import guidance for GitHub mutations.
- `issues_backlog.md`: backlog template and issue grouping notes.
- `labels.json`: recommended GitHub label set.
- `milestones.md`: milestone planning and import guidance.

## Relationship To GitHub Sync

`plugins/github/` is the bundle that carries the GitHub planning/reference
material. `plugins/github_sync/` carries the sync-rule bundle that aligns
release and issue write workflows with KVDF governance.

Keep GitHub writes gated by the CLI confirmation and policy checks. The plugin
only stores the bundle contract and reference material.
