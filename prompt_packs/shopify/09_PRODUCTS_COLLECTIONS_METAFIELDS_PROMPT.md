# 09 — Products, Collections, and Metafields Prompt

## Goal

Plan or implement first-release product, collection, and metafield structure.

## Context for the AI coding assistant

This prompt helps organize product catalog data and custom fields without overcomplicating the store.

## Information the user should provide before running this prompt

- What product types exist?
- What extra product information is needed?
- Should customers see this data?
- Should merchants edit it in Shopify admin?

## Files and areas allowed for this prompt

```text
store-structure-notes.md
metafield-plan.md
app or theme files if needed
README.md
```

## Files and areas forbidden for this prompt

```text
Production destructive product updates
Real customer data
Unrelated catalog changes
```

## Tasks

1. Identify product types and collections.
2. Identify required metafields for first release.
3. Define which metafields are merchant-editable.
4. Explain where data appears in theme/app.
5. Create code only if the project already has theme/app context.
6. Do not add future catalog complexity.


## Checks to run

```text
Review catalog plan.
Test metafields on development store if possible.
Preview affected product/collection pages.
```

## Acceptance criteria

- Product/collection plan is clear.
- Metafields are necessary and understandable.
- Future catalog ideas are separated.
- No destructive production changes are made.


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
