# GitHub Sync Rules

GitHub sync connects Kabeeri tasks, milestones, labels, issues, and releases to GitHub without making GitHub the source of truth.

## Safety Rules

- `.kabeeri/` remains the source of truth.
- GitHub writes must be dry-run by default.
- Write commands require explicit `--confirm`.
- Conflicts are reported, not silently resolved.
- Closing a GitHub issue requires Owner verification state in Kabeeri.

## Supported Objects

- Labels
- Milestones
- Issues
- Releases

## CLI Intent

```bash
kvdf github plan --version v3.0.0 --dry-run
kvdf github report
kvdf github label sync --version v3.0.0 --dry-run
kvdf github milestone sync --version v3.0.0 --dry-run
kvdf github issue sync --version v3.0.0 --dry-run
kvdf github issue sync --version v3.0.0 --confirm
```

`kvdf github report` is the read-only trace surface for the local GitHub sync
adapter. It summarizes the current config, issue map, team feedback records, and
the CLI paths that can safely invoke dry-run or confirmed writes.

## Audit

Every confirmed GitHub write should append an event to `.kabeeri/audit_log.jsonl`.
