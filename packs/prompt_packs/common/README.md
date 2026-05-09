# Common Prompt Layer

The common prompt layer is shared by all Kabeeri prompt packs.

It is not a framework installer and it is not a replacement for stack-specific
prompt packs. It provides the common execution discipline that should wrap every
AI coding task:

- use one governed task at a time
- respect app, workstream, token, and file scope
- avoid broad repository context
- produce reviewable output
- record accepted or rejected AI run history

Use it directly only for review or composition:

```bash
kvdf prompt-pack common
kvdf prompt-pack compose react --task task-001
```
