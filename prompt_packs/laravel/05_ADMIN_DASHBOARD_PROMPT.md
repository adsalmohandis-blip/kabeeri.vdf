# 05 — Admin Dashboard Foundation Prompt

## Goal

Create the first admin dashboard foundation.

## Context for the AI coding assistant

This prompt creates a simple admin area for managing the early project. It should not build every admin screen yet.

## Information the user should provide before running this prompt

- What should admins see first?
- What are the first 3–5 admin sections needed?
- Is the app Arabic, English, or bilingual?

## Files and areas allowed for this prompt

```text
routes/web.php
app/Http/Controllers/Admin/
resources/views/admin/
app/Http/Middleware/
tests/
```

## Files and areas forbidden for this prompt

```text
Advanced modules
Billing
ERP
Marketplace
Unrelated UI rewrites
```

## Tasks

1. Create or improve an admin route group.
2. Protect admin routes using authentication and role/permission rules.
3. Add a simple dashboard page.
4. Show basic navigation placeholders only for confirmed modules.
5. Add a simple empty-state UI.
6. Keep the UI clean and minimal.
7. Do not create advanced charts or analytics yet.


## Checks to run

```bash
php artisan route:list
php artisan test
```

## Acceptance criteria

- Admin dashboard route exists.
- Only allowed users can access it.
- Dashboard is simple and not overloaded.
- Navigation reflects current scope only.


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
