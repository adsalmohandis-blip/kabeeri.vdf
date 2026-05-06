# 04 — Admin Settings Page Prompt

## Goal

Create a simple WordPress admin settings page for the plugin or customization.

## Context for the AI coding assistant

This prompt is used when site owners need to control options from wp-admin.

## Information the user should provide before running this prompt

- What settings should the owner control?
- Who can edit settings?
- Should settings affect frontend output, API behavior, emails, or something else?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/admin/
wp-content/plugins/<plugin-folder>/includes/
main plugin file
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Other plugins
```

## Tasks

1. Identify which settings the owner should control.
2. Add an admin menu or submenu page.
3. Register settings safely.
4. Sanitize all saved values.
5. Escape output in admin screens.
6. Use nonces for forms.
7. Do not create complex settings panels unless required.


## Checks to run

```text
Open wp-admin.
Open the plugin settings page.
Save test settings.
Confirm no PHP warnings or errors.
```

## Acceptance criteria

- Admin settings page exists if needed.
- Settings are sanitized.
- Output is escaped.
- Only authorized users can access the page.
- No WordPress core files are modified.


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
