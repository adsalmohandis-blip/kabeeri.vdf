# 11 — WordPress Testing and Review Prompt

## Goal

Review the current WordPress implementation and improve basic quality and safety checks.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new features.

## Information the user should provide before running this prompt

- Which plugin/theme features have been implemented so far?
- Are there known bugs?
- Which admin/frontend pages should be tested?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/
wp-content/themes/<child-theme>/ only if relevant
README.md
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
New product features
Large refactors
```

## Tasks

1. Review current plugin/theme files.
2. Check for fatal errors.
3. Check activation/deactivation behavior if plugin.
4. Check admin capability checks.
5. Check nonces, sanitization, and escaping.
6. Check frontend empty/error states.
7. Add a short testing section in README if needed.
8. Do not add new features.


## Checks to run

```text
Activate/deactivate plugin.
Open wp-admin pages.
Open frontend pages.
Check debug.log if enabled.
Test as admin and non-admin where relevant.
```

## Acceptance criteria

- Current features pass basic manual checks.
- Security basics are reviewed.
- No new product scope is added.
- Review notes are clear.


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
