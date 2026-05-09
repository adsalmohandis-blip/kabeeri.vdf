# 11 - Acceptance Checklists

Acceptance checklists prevent "AI output exists" from being treated as "work is
done."

## What They Check

- scope was respected
- output satisfies acceptance criteria
- relevant tests or manual checks were run
- security and privacy risks were considered
- owner or reviewer decision is recorded

## Runtime

```bash
kvdf acceptance create --task task-001 --decision pass --notes "Reviewed"
kvdf task verify task-001
```

## References

- `acceptance_checklists/`
- `.kabeeri/acceptance.json`
