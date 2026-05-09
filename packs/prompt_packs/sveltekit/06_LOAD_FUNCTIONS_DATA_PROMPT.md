# 06 — Load Functions and Data Prompt

## Goal

Add SvelteKit load functions and data fetching foundation.

## Context for the AI coding assistant

This prompt creates a clear data loading pattern without implementing every product feature.

## Information the user should provide before running this prompt

- Where will data come from?
- What is the first page that needs real data?
- Should the first version use mock data or real API?
- Is data fetched server-side or client-side?

## Files and areas allowed for this prompt

```text
src/routes/
src/lib/server/
src/lib/api/
src/lib/types/
.env.example
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced integrations
Secrets
Full backend redesign
```

## Tasks

1. Identify where data comes from: external API, SvelteKit server, Strapi, Supabase, Firebase, Shopify, or mock data.
2. Add a simple data fetching helper if useful.
3. Add a load function for one confirmed route or mock source.
4. Add error and loading handling patterns.
5. Keep secrets server-side.
6. Do not build all routes or all endpoints.


## Checks to run

```bash
npm run check
npm run build
npm test
```

## Acceptance criteria

- Data source strategy is clear.
- Load/data helper is simple.
- Error states are handled.
- No secrets are exposed to the browser.


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
