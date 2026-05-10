# Cost, Context, And Policy Rules

- Prefer the smallest context that can safely complete the task.
- Use an existing context pack when one is available for the task.
- Do not ask the AI to scan the whole repository unless the task truly requires it.
- Before risky work, check the relevant Kabeeri policy gate instead of relying on memory.
- Treat security, migration, handoff, release, and GitHub write gates as blockers when they fail.
- If the task grows beyond its approved scope, create a follow-up task instead of silently expanding the run.
- Mention any expected token/cost risk when the task needs broad context or repeated verification.
