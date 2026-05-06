# 09 — Security, Capabilities, and Nonces Prompt

## Goal

Review and improve WordPress security basics for the plugin/theme customization.

## Context for the AI coding assistant

This prompt is used after one or more WordPress features have been added.

## Information the user should provide before running this prompt

- Which plugin/theme files were changed so far?
- Are there admin forms?
- Are there REST endpoints?
- Are there frontend forms?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/
wp-content/themes/<child-theme>/ only if relevant
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Third-party plugin files
```

## Tasks

1. Review user capability checks.
2. Add or improve nonces for admin forms/actions.
3. Sanitize inputs.
4. Escape outputs.
5. Check REST API permission callbacks.
6. Check direct file access protection if appropriate.
7. Do not add new product features.


## Checks to run

```text
Test admin forms.
Test unauthorized access.
Check frontend output.
Check debug.log if enabled.
```

## Acceptance criteria

- Admin actions are protected.
- Inputs are sanitized.
- Outputs are escaped.
- REST endpoints have permission callbacks.
- No product scope was added.


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
