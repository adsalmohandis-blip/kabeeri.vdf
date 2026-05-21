# AI Learning CLI

## Commands

```bash
kvdf learn capture
kvdf learn fast-path
kvdf learn export --track vibe --output docs/kvdf-learning/learning-export.json
kvdf learn import --track owner --from docs/kvdf-learning/learning-export.json
kvdf learn review --track owner
kvdf learn promote learning-candidate-001 --confirm --track owner
kvdf learn reject learning-candidate-002 --reason "App-specific" --track owner
kvdf learn shared
kvdf learn cache update --from-export docs/kvdf-learning/learning-export.json
kvdf learn cache list
kvdf learn metadata
kvdf learn prompt-context --track owner
```

## Notes

- `capture` and `fast-path` record local AI learning state in the current workspace.
- `export` produces a sanitized portable learning package and Markdown summary.
- `import` writes owner-review candidates into harvest state instead of auto-promoting.
- `review`, `promote`, and `reject` keep KVDF Core shared learning Owner-approved.
- `cache` syncs an optional local global cache under `~/.kabeeri/learning/`.
- `metadata` prepares future cloud-ready metadata without requiring a remote provider.
