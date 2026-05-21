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

`prompt-context` is the same track-aware learning surface that `kvdf planner prompt` reuses when it builds an `AI Learning Context` section. Safe shared warnings and fast paths are visible there; raw sensitive details are not.

## Notes

- `capture` and `fast-path` record local AI learning state in the current workspace.
- `export` produces a sanitized portable learning package and Markdown summary.
- `import` writes owner-review candidates into harvest state instead of auto-promoting.
- `review`, `promote`, and `reject` keep KVDF Core shared learning Owner-approved.
- `cache` syncs an optional local global cache under `~/.kabeeri/learning/`.
- `metadata` prepares future cloud-ready metadata without requiring a remote provider.
- Planner prompt generation reuses the track-aware learning context and suppresses the section entirely when there is no safe learning to show.
