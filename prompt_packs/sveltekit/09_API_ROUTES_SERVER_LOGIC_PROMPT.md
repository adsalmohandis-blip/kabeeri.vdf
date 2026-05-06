# 09 — API Routes and Server Logic Prompt

## Goal

Add SvelteKit API routes or server-side logic if needed.

## Context for the AI coding assistant

This prompt is optional. Use it only when the first release needs server-side endpoints or trusted logic.

## Information the user should provide before running this prompt

- What action must run server-side?
- Does it call an external API?
- What input does it receive?
- Who can call it?

## Files and areas allowed for this prompt

```text
src/routes/api/
src/lib/server/
src/hooks.server.*
src/lib/types/
.env.example
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated integrations
Real secrets
Large backend redesign
```

## Tasks

1. Ask what server-side action or endpoint is needed.
2. Add one API route or server function only.
3. Keep secrets server-side.
4. Validate input.
5. Return clear success/error responses.
6. Add authorization checks if needed.
7. Do not create multiple unrelated endpoints.


## Checks to run

```bash
npm run check
npm run build
npm test
```

## Acceptance criteria

- Server/API logic has one clear purpose.
- Secrets are server-side only.
- Inputs are validated.
- No unrelated endpoints are added.


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
