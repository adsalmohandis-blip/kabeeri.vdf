# 03 — Theme Sections and Blocks Prompt

## Goal

Create or modify Shopify theme sections and blocks safely.

## Context for the AI coding assistant

This prompt is used when the project needs theme customization using sections and blocks.

## Information the user should provide before running this prompt

- What section/block is needed?
- Where should it appear?
- What settings should the merchant control?
- Should it support images, text, products, collections, or custom content?

## Files and areas allowed for this prompt

```text
sections/
blocks/
snippets/
assets/
config/settings_schema.json only if needed
README.md
```

## Files and areas forbidden for this prompt

```text
Live production theme without backup
Unrelated theme files
Shopify secrets
Customer data
```

## Tasks

1. Confirm the work is on a development or duplicated theme.
2. Identify the section/block needed for the first release.
3. Create or modify only the relevant section/block.
4. Add theme schema settings only if needed.
5. Keep the section reusable and merchant-friendly.
6. Add empty/default states.
7. Do not change unrelated theme files.


## Checks to run

```text
Preview the theme.
Test section in theme editor.
Test mobile and desktop.
Confirm no Liquid errors.
```

## Acceptance criteria

- Section/block works in theme editor.
- Merchant settings are understandable.
- Mobile/desktop preview is acceptable.
- Unrelated theme files are not changed.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Shopify secrets.  
Do not modify live production themes/stores without backup and approval.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Shopify changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
