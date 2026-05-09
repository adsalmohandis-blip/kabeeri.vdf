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
kvdf github label sync --version v3.0.0 --dry-run
kvdf github milestone sync --version v3.0.0 --dry-run
kvdf github issue sync --version v3.0.0 --dry-run
kvdf github issue sync --version v3.0.0 --confirm
```

## Audit

Every confirmed GitHub write should append an event to `.kabeeri/audit_log.jsonl`.
