# 07 — Data and API Integration Prompt

## Goal

Add data fetching, API integration, or backend connection foundation.

## Context for the AI coding assistant

This prompt creates the foundation for connecting the UI to data. It should not implement every product feature.

## Information the user should provide before running this prompt

- Where will data come from?
- Is there an existing backend API?
- What is the first screen that needs real data?
- Should the first version use mock data or real API?

## Files and areas allowed for this prompt

```text
lib/api.*
lib/fetchers.*
app/ or pages/ route handlers if used
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

1. Identify whether data comes from internal Next.js route handlers, external API, Laravel backend, .NET backend, CMS, Supabase, Firebase, or another source.
2. Add a simple API client or data fetching helper.
3. Add error and loading handling patterns.
4. Add a sample integration for one confirmed endpoint or mock source.
5. Keep secrets server-side.
6. Do not build all endpoints or all screens.


## Checks to run

```bash
npm run lint
npm run build
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
