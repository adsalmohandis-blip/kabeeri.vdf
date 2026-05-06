# 09 — SEO, Metadata, and Performance Prompt

## Goal

Add SEO, metadata, structured basics, and performance review foundation.

## Context for the AI coding assistant

This prompt improves discoverability and quality without adding product features.

## Information the user should provide before running this prompt

- What pages are most important for SEO?
- What is the site title and description?
- Is this a business, product, blog, docs, or landing site?
- Are there social sharing images?

## Files and areas allowed for this prompt

```text
src/layouts/
src/components/
src/pages/
astro.config.*
public/
README.md
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Keyword stuffing
Fake claims
```

## Tasks

1. Add or review page title and description patterns.
2. Add Open Graph/Twitter metadata if useful.
3. Add canonical URL handling if needed.
4. Add sitemap/robots notes or config if needed.
5. Review images and asset loading.
6. Add basic accessibility and performance notes.
7. Do not add fake SEO claims or unrelated content.


## Checks to run

```bash
npm run build
Run local preview.
Review important pages manually.
```

## Acceptance criteria

- Metadata pattern is clear.
- Important pages have useful titles/descriptions.
- Performance/accessibility risks are noted.
- No fake or unrelated content is added.


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
