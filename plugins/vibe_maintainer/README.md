# Vibe Maintainer

`vibe-maintainer` is the maintenance plugin for vibe developer app workspaces.

It helps you:

- inspect one workspace or all workspaces
- generate a saved maintenance report
- review stale docs, dead code, spec drift, and blocked-flow signals
- preview or apply safe folder relocation candidates
- approve, execute, and finalize a maintenance pass

## Scope

You can run maintenance against:

- the current workspace
- one dedicated app workspace
- selected workspaces
- all app workspaces

## Modes

- `fast` for quick, lightweight maintenance scans
- `slow` for strict, file-by-file review

## Common flow

```bash
kvdf vibe-maintainer cleanup --workspace storefront-web
kvdf vibe-maintainer approve --confirm
kvdf vibe-maintainer execute
kvdf vibe-maintainer finalize
```

