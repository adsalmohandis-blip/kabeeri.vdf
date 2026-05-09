# 01 — Strapi Project Context Prompt

## Goal

Give the AI coding assistant the correct product and Strapi context before implementation.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand whether Strapi is used as a headless CMS, backend for a frontend, content API, admin content system, or internal data platform.

## Information the user should provide before running this prompt

- What are you building with Strapi?
- Is Strapi for a website, app, CMS, internal backend, or content API?
- What frontend/app will consume Strapi?
- What should the first version do?
- What should wait until later?

## Files and areas allowed for this prompt

```text
README.md
.env.example
src/
config/
database/
package.json
```

## Files and areas forbidden for this prompt

```text
Real secrets
Production credentials
Unrelated future modules
prompt_packs/
```

## Tasks

1. Read the product/content summary provided by the user.
2. Identify how Strapi will be used: CMS, content API, admin backend, internal tool, website backend, or app backend.
3. Identify the frontend/app that connects to Strapi.
4. Identify first release scope.
5. Identify what should not be built yet.
6. Produce an implementation context summary.
7. Do not write content types or code unless the user explicitly asks after this summary.


## Checks to run

```text
Review .env.example manually.
Confirm no real keys or credentials are committed.
Confirm Strapi role and connected frontend/app.
```

## Acceptance criteria

- Strapi role is clear.
- First release scope is separated from future ideas.
- Connected frontend/app is understood.
- No real secrets are exposed.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Strapi secrets or private credentials.  
Do not make private content public by default.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Strapi changes:
Checks to run:
Security/permissions notes:
Manual review notes:
Next recommended prompt:
```
