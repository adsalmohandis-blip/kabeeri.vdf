# 08 — Data Fetching and API Prompt

## Goal

Add data fetching, API integration, or CMS/backend connection foundation.

## Context for the AI coding assistant

This prompt creates the foundation for connecting the UI to data. It should not implement every product feature.

## Information the user should provide before running this prompt

- Where will data come from?
- Is there an existing backend/API/CMS?
- What is the first page that needs real data?
- Should the first version use mock data or real API?

## Files and areas allowed for this prompt

```text
composables/
lib/
server/api/
plugins/
pages/
components/
.env.example
tests/ if present
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced integrations
Secrets
Full backend redesign
```

## Tasks

1. Identify where data comes from: Laravel API, .NET API, FastAPI, NestJS, Strapi, Supabase, Firebase, Shopify, mock data, or other.
2. Add a simple API client or data fetching helper.
3. Use Nuxt data fetching patterns if this is Nuxt.
4. Add error and loading handling patterns.
5. Add a sample integration for one confirmed endpoint or mock source.
6. Keep secrets server-side.
7. Do not build all endpoints or all screens.


## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- Data source strategy is clear.
- API client/helper is simple.
- Loading and error states are handled.
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
