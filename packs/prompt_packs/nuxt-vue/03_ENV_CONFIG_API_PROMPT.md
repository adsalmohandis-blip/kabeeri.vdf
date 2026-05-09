# 03 — Environment, Configuration, and API Prompt

## Goal

Configure environment variables, runtime config, API URL, and safe configuration rules.

## Context for the AI coding assistant

This prompt prepares configuration before adding product features.

## Information the user should provide before running this prompt

- Does the app connect to an API?
- What is the API base URL?
- Does it need staging/production config?
- Technical note: If unsure about public vs private runtime config, ask ChatGPT.

## Files and areas allowed for this prompt

```text
.env.example
nuxt.config.*
vite.config.*
app.config.*
composables/
lib/
plugins/
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

1. Review environment/config files.
2. Create or update `.env.example`.
3. Add API URL placeholder if the app connects to a backend.
4. Clearly separate public client variables from server/private variables.
5. For Nuxt, use runtime config patterns when appropriate.
6. Do not commit real secrets.
7. Add README notes for local configuration.
8. Do not add unrelated packages unless required and explained.


## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- `.env.example` is safe and useful.
- Real secrets are not committed.
- Public vs private config is clear.
- Beginner can understand what to set locally.


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
