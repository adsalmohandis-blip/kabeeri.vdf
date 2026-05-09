# AI Run History Rules

After execution, record the AI run when the work used meaningful AI assistance:

```bash
kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --summary "Implemented endpoint"
```

After review:

```bash
kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
kvdf ai-run reject ai-run-001 --reason "Wrong scope"
```

Accepted runs become reusable learning. Rejected runs prevent repeating the same
mistake.
