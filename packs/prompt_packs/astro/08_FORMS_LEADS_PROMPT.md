# 08 — Forms and Lead Capture Prompt

## Goal

Add forms and lead capture foundation if the site needs contact, newsletter, quote, or booking forms.

## Context for the AI coding assistant

This prompt is optional. Use it only when the first release needs forms.

## Information the user should provide before running this prompt

- What forms are needed first? Contact, newsletter, quote, booking, waitlist?
- What fields are required?
- Where should submissions go?
- Technical note: If unsure, ask ChatGPT to recommend a simple lead capture approach for Astro.

## Files and areas allowed for this prompt

```text
src/pages/
src/components/forms/
src/lib/
src/pages/api/ if used
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
Real secrets
Unrelated CRM integrations
Advanced workflow engines
```

## Tasks

1. Identify which first-release forms are needed.
2. Add a simple form component/pattern.
3. Add validation and clear error messages.
4. Decide where submissions go: email service, API, serverless endpoint, CRM, static form provider, or placeholder.
5. Keep secrets server-side.
6. Add success/loading states.
7. Do not add complex automation unless requested.


## Checks to run

```bash
npm run build
Test form manually in local/staging if possible.
```

## Acceptance criteria

- Form pattern is clear.
- Validation is understandable.
- Submission destination is clear.
- Secrets are not exposed.
- Scope is limited to first-release forms.


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
