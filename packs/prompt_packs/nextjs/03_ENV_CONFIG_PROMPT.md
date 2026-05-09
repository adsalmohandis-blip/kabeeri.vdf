# 03 — Environment and Configuration Prompt

## Goal

Configure environment variables, app configuration, and safe setup rules.

## Context for the AI coding assistant

This prompt prepares configuration before adding product features.

## Information the user should provide before running this prompt

- Does the app need API URLs?
- Does it need authentication provider keys?
- Does it need payment/email/storage service keys later?
- Technical note: If you are unsure about public vs private environment variables, ask ChatGPT for help.

## Files and areas allowed for this prompt

```text
.env.example
next.config.*
lib/config.*
README.md
package.json only if needed
```

## Files and areas forbidden for this prompt

```text
Real secrets
Unrelated modules
Deployment infrastructure unless requested
```

## Tasks

1. Review `.env.example` or create it if missing.
2. Add placeholders for required public and server-only environment variables.
3. Clearly separate public variables from private server variables.
4. Do not commit real secrets.
5. Add a simple config helper if useful.
6. Add README notes for local environment setup.
7. Do not add unrelated packages unless required and explained.


## Checks to run

```bash
npm run lint
npm run build
```

## Acceptance criteria

- `.env.example` is safe and useful.
- Real secrets are not committed.
- Public vs private environment variables are clear.
- Configuration is understandable for beginners.


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
