# 05 — API Access Prompt

## Goal

Plan Strapi API access, response exposure, and frontend consumption.

## Context for the AI coding assistant

This prompt is used when a frontend or app needs to consume Strapi data.

## Information the user should provide before running this prompt

- What frontend/app needs this data?
- What content should it fetch first?
- Should the API be public or authenticated?
- Are there fields that must never be exposed?

## Files and areas allowed for this prompt

```text
src/api/
config/
README.md
frontend integration notes
```

## Files and areas forbidden for this prompt

```text
Exposing private tokens
Overly broad API access
Unrelated frontend features
```

## Tasks

1. Identify the first frontend/app use case for Strapi data.
2. Decide whether REST or GraphQL is used if applicable.
3. Identify which fields should be exposed.
4. Avoid returning private/admin-only fields.
5. Plan pagination/filtering/sorting only if needed.
6. Add one focused API access pattern or documentation.
7. Do not build every endpoint or every screen.


## Checks to run

```text
Test API response locally/staging.
Confirm private fields are not exposed.
Confirm frontend can fetch one sample content type.
```

## Acceptance criteria

- API access supports one clear use case.
- Private fields are not exposed.
- Response shape is understandable.
- Scope stays focused.


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
