# 06 — Content Collections Prompt

## Goal

Add Astro content collections for blog, docs, resources, or structured content if needed.

## Context for the AI coding assistant

This prompt is optional. Use it when content needs structure and repeatable entries.

## Information the user should provide before running this prompt

- What content should the site manage? Blog posts, docs, resources, case studies, pages?
- Which content is needed in the first release?
- What fields should each content item have?
- Technical note: If unsure, ask ChatGPT to design Astro content collection schemas.

## Files and areas allowed for this prompt

```text
src/content/
src/pages/
src/components/
src/lib/
README.md
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced CMS integration unless requested
Real private content
```

## Tasks

1. Ask what content types the site needs.
2. Create content collections only for first-release content.
3. Define schema fields in beginner-readable language.
4. Add sample demo content only if useful.
5. Add list/detail pages only for confirmed content types.
6. Do not add future content collections.
7. Do not include real private content.


## Checks to run

```bash
npm run build
```

## Acceptance criteria

- Content collections match first-release needs.
- Schema is clear.
- Sample content is safe/demo only.
- No future content types are added.


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
