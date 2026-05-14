# Common Prompt Layer

The common prompt layer is shared by all Kabeeri prompt packs.

Current version: `v0.3.0`

It is not a framework installer and it is not a replacement for stack-specific
prompt packs. It provides the common execution discipline that should wrap every
AI coding task:

- use one governed task at a time
- respect app, workstream, token, and file scope
- keep owner-track work separate from app-track work
- treat plugins as independently addable or removable feature units
- avoid broad repository context
- produce reviewable output
- record accepted or rejected AI run history
- control context size and token/cost risk
- respect policy gates before risky work
- apply design, security, and migration guardrails
- preserve traceability through evidence, ADRs, captures, and handoff notes

Use it directly only for review or composition:

```bash
kvdf prompt-pack common
kvdf prompt-pack compose react --task task-001
```

The common layer is composed before the stack prompt. It should never install a
framework, publish a release, write GitHub state, run destructive migrations, or
override Owner approval by itself.

When `kvdf prompt-pack compose` renders a task-specific prompt, it also includes
compact guidance so the AI can focus on one stack prompt, one task scope, and
the smallest useful next step.

The best prompt uses:

- a single task
- the narrowest command surface
- the smallest set of changed files
- the current owner/app track only
