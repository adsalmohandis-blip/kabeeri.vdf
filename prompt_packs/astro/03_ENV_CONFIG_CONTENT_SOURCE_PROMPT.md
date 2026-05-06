# 03 — Environment, Configuration, and Content Source Prompt

## Goal

Configure environment variables, site config, and content source rules.

## Context for the AI coding assistant

This prompt prepares configuration before adding site features.

## Information the user should provide before running this prompt

- Does the site connect to an API or CMS?
- What is the site URL?
- What content source will be used?
- Technical note: If unsure about public vs private variables in Astro, ask ChatGPT.

## Files and areas allowed for this prompt

```text
.env.example
astro.config.*
src/config*
src/lib*
README.md
package.json only if needed
```

## Files and areas forbidden for this prompt

```text
Real secrets
Unrelated modules
Deployment infrastructure unless requested
```

## Tasks

1. Review environment/config files.
2. Create or update `.env.example` if needed.
3. Add site URL, API URL, or CMS URL placeholders if needed.
4. Clearly separate public variables from private/server variables.
5. Configure content source notes: local markdown, CMS, API, or static data.
6. Do not commit real secrets.
7. Add README notes for local configuration.
8. Do not add unrelated packages unless required and explained.


## Checks to run

```bash
npm run build
npm test
```

## Acceptance criteria

- `.env.example` is safe and useful if needed.
- Real secrets are not committed.
- Content source strategy is clear.
- Beginner can understand what to set locally.


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
