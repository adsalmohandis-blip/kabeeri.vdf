# 20 - AI Usage Rules

AI should work inside Kabeeri boundaries, not outside them.

## Rules

- Use approved tasks or suggested task cards.
- Keep prompts small.
- Define allowed and forbidden files.
- Use context packs when token cost matters.
- Record usage when possible.
- Review and accept or reject AI runs.
- Capture post-work changes when work happened outside the normal flow.

## Runtime

```bash
kvdf context-pack create --task task-001
kvdf prompt-pack compose react --task task-001
kvdf ai-run record --task task-001 --provider openai --model gpt
kvdf capture "Summarize changed files"
```
