# 01 — Project Context Prompt

## Goal

Give the AI coding assistant the correct product and Nuxt/Vue context before writing code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand the product, first release scope, frontend/backend relationship, rendering approach, and what it must not build yet.

## Information the user should provide before running this prompt

- What are you building?
- Who will use it?
- What should the first version do?
- Is this Nuxt, Vue SPA, or not sure?
- Does it connect to an API/CMS? If yes, what backend?

## Files and areas allowed for this prompt

```text
README.md
app/
pages/
components/
nuxt.config.*
vite.config.*
package.json
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Unrelated future modules
```

## Tasks

1. Read the product summary provided by the user.
2. Identify the first release scope.
3. Identify whether this is Nuxt, Vue SPA, frontend-only, or full-stack Nuxt.
4. Identify whether there is a backend API or CMS such as Laravel, .NET, FastAPI, Strapi, Supabase, Firebase, or Shopify.
5. Identify rendering mode if relevant: SSR, SPA, SSG/static, or not decided.
6. Identify what should not be built yet.
7. Produce an implementation context summary.
8. Do not write product code unless the user explicitly asks after this summary.


## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- The AI clearly understands the product.
- First release scope is separated from future ideas.
- Nuxt/Vue role is clear.
- Backend/API relationship is clear.
- No unrelated features are added.


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
