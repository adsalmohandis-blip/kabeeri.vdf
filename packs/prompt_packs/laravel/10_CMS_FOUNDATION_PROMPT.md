# 10 — CMS Foundation Prompt

## Goal

Add a basic CMS/content foundation if the project needs pages, posts, or editable content.

## Context for the AI coding assistant

This prompt is optional. Use it only if the product needs content management.

## Information the user should provide before running this prompt

- Does the product need editable pages?
- Does it need blog posts or articles?
- Who can publish content?
- Should content be public, private, or both?

## Files and areas allowed for this prompt

```text
app/Models/
database/migrations/
app/Http/Controllers/
resources/views/
routes/
tests/
```

## Files and areas forbidden for this prompt

```text
Full page builder
Theme marketplace
Advanced SEO platform
Unrelated product features
```

## Tasks

1. Ask whether the project needs CMS pages, posts, categories, or simple static content.
2. Create only the content types required for the first release.
3. Add slug, title, body, status, published date if needed.
4. Add simple admin management if in scope.
5. Add public display routes if needed.
6. Do not build a full page builder.


## Checks to run

```bash
php artisan migrate
php artisan route:list
php artisan test
```

## Acceptance criteria

- Required content types exist.
- Draft/published behavior is clear if needed.
- Admin users can manage content if in scope.
- Public routes are simple and safe.


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
