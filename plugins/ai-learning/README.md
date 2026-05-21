# AI Learning

`ai-learning` packages the reusable AI memory workflow for KVDF.

The core command remains the source of truth for local learning state, while the plugin surface adds:

- sanitized export packages and Markdown summaries
- owner-track import, review, promotion, and rejection
- shared-learning views for cross-track reuse
- user global cache sync for local apps
- cloud-ready metadata for future remote providers

## Scope

- local failure patterns
- fast paths
- export packages
- review candidates
- shared learning
- prompt-context hooks
- user cache
- future provider metadata

## Common flow

```bash
kvdf learn capture --title "Repeated stale assertion" --problem "Dashboard test still expects old markup" --fix "Update assertions to match rendered HTML" --category test_failure --track owner --json
kvdf learn export --track vibe --output docs/kvdf-learning/learning-export.json --json
kvdf learn import --track owner --from docs/kvdf-learning/learning-export.json --json
kvdf learn review --track owner --json
kvdf learn promote learning-candidate-001 --confirm --track owner --json
kvdf learn reject learning-candidate-002 --reason "App-specific" --track owner --json
kvdf learn shared --json
kvdf learn cache update --from-export docs/kvdf-learning/learning-export.json --json
kvdf learn metadata --json
```
