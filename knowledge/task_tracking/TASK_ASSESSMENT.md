# Task Assessment

Task assessment is the pre-build step that turns a large request into a
structured, visible decision record before implementation begins.

The assessment captures:

- the goal or source request
- the likely workstream and app boundary
- allowed files and forbidden files
- acceptance criteria
- expected validation checks
- dependencies and blockers
- policy gates for risky work

Use:

```bash
kvdf task assessment --goal "Build checkout API"
kvdf task assessment task-001
```

Assessment results help the lifecycle engine decide whether work is ready to
move from intake into the ready or execution stages.

