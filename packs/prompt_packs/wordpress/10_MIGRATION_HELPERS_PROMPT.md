# 10 — Migration Helpers Prompt

## Goal

Create simple migration/import/export helpers for WordPress content if needed.

## Context for the AI coding assistant

This prompt is used when a project needs to import, export, or migrate content safely.

## Information the user should provide before running this prompt

- What data should be imported/exported?
- What format is available: CSV, JSON, XML, WordPress export?
- Is this one-time migration or recurring sync?
- Technical note: Ask ChatGPT to help design a safe import plan before touching production data.

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/includes/
wp-content/plugins/<plugin-folder>/admin/
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Direct production database destructive actions
```

## Tasks

1. Ask what data needs to move.
2. Define safe import/export format such as CSV or JSON.
3. Add preview/dry-run behavior if practical.
4. Validate imported data.
5. Avoid destructive operations by default.
6. Add admin-only access.
7. Do not run large production migrations automatically.


## Checks to run

```text
Test with small sample file.
Test invalid data.
Confirm admin-only access.
Confirm backup warning is visible if data changes.
```

## Acceptance criteria

- Import/export behavior is clear.
- Invalid data is handled safely.
- Destructive operations are avoided by default.
- Admin-only access is enforced.


## Important scope rule

Do not build features outside this prompt.  
Do not modify WordPress core files.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Checks to run:
Manual review notes:
Security notes:
Next recommended prompt:
```
