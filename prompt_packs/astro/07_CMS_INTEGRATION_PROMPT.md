# 07 — CMS Integration Prompt

## Goal

Add CMS or API content integration if the site uses an external content source.

## Context for the AI coding assistant

This prompt is optional. Use it only when content comes from a CMS/API such as Strapi, WordPress, Sanity, Contentful, Shopify, Supabase, or custom API.

## Information the user should provide before running this prompt

- What CMS/API will provide content?
- What is the first content type to fetch?
- Is content public or private?
- Should fetching happen at build time or runtime?

## Files and areas allowed for this prompt

```text
src/lib/
src/pages/
src/components/
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
Secrets in frontend
Unrelated integrations
Full backend redesign
```

## Tasks

1. Identify the CMS/API content source.
2. Create a simple content client/helper.
3. Use safe environment variables.
4. Fetch one confirmed content type first.
5. Add loading/error/empty handling where relevant.
6. Do not build all CMS integrations at once.
7. Do not expose private tokens to the browser.


## Checks to run

```bash
npm run build
```

## Acceptance criteria

- CMS/API source is clear.
- Content client/helper is simple.
- No private tokens are exposed.
- One basic content fetch works or is documented.


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
