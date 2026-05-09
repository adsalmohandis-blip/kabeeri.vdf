# 08 — Services, Jobs, and Mailers Prompt

## Goal

Add service objects, background jobs, or mailers only where needed.

## Context for the AI coding assistant

This prompt is optional. Use it when first-release behavior needs logic outside controllers/models.

## Information the user should provide before running this prompt

- Does the app need emails, background tasks, imports, exports, notifications, or external API calls?
- Which one is needed first?
- Technical note: If unsure, ask ChatGPT whether a service object, job, or mailer is appropriate.

## Files and areas allowed for this prompt

```text
app/services/
app/jobs/
app/mailers/
app/models/
test/
spec/
config/
```

## Files and areas forbidden for this prompt

```text
Unrelated integrations
Real secrets
Large workflow engines unless requested
```

## Tasks

1. Ask what business actions need service objects.
2. Ask whether background jobs are needed.
3. Ask whether emails are needed.
4. Add one focused service/job/mailer pattern only.
5. Keep secrets in config/env/credentials, not code.
6. Add tests or manual check instructions.
7. Do not add future integrations.


## Checks to run

```bash
bin/rails test
```

## Acceptance criteria

- Service/job/mailer has one clear purpose.
- Logic is not scattered randomly.
- No real secrets are committed.
- Scope is not overbuilt.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Commands run:
Tests/checks result:
Manual review notes:
Next recommended prompt:
```
