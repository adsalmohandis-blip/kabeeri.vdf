# 01 — Project Context Prompt

## Goal

Give the AI coding assistant the correct product and SvelteKit context before writing code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand the product, first release scope, frontend/backend relationship, rendering approach, and what it must not build yet.

## Information the user should provide before running this prompt

- What are you building?
- Who will use it?
- What should the first version do?
- Is this full-stack SvelteKit or connected to an external backend?
- What backend/API/CMS will it use?

## Files and areas allowed for this prompt

```text
README.md
src/
svelte.config.*
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
3. Identify whether this is frontend-only, full-stack SvelteKit, or frontend connected to an external backend.
4. Identify backend/API/CMS if any: Laravel, .NET, FastAPI, NestJS, Strapi, Supabase, Firebase, Shopify, or other.
5. Identify rendering/deployment target if relevant.
6. Identify what should not be built yet.
7. Produce an implementation context summary.
8. Do not write product code unless the user explicitly asks after this summary.


## Checks to run

```bash
npm run check
npm run build
npm test
```

## Acceptance criteria

- The AI clearly understands the product.
- First release scope is separated from future ideas.
- SvelteKit role is clear.
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
