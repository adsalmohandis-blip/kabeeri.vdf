# 08 — Theme and Child Theme Prompt

## Goal

Create or modify a WordPress theme or child theme safely.

## Context for the AI coding assistant

This prompt is used for visual templates and theme-level customization.

## Information the user should provide before running this prompt

- Are we building a new theme or child theme?
- What pages/templates need customization?
- What visual style is required?
- Is RTL/Arabic support needed?

## Files and areas allowed for this prompt

```text
wp-content/themes/<child-theme>/
style.css
functions.php
template files
assets/
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Parent theme files unless explicitly approved
```

## Tasks

1. Ask whether this is a new theme or child theme customization.
2. Prefer child theme if customizing an existing theme.
3. Add required theme files.
4. Add styles/scripts safely.
5. Add template overrides only if needed.
6. Keep business logic out of templates when possible.
7. Do not edit parent theme files unless explicitly approved and documented.


## Checks to run

```text
Activate theme/child theme locally.
Open frontend pages.
Check PHP errors.
Check responsive basics.
```

## Acceptance criteria

- Theme or child theme loads without fatal errors.
- Parent theme files are not modified unless explicitly approved.
- Styling/scripts are loaded properly.
- Scope stays visual/template-focused.


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
