# 06 — REST API Endpoints Prompt

## Goal

Add simple WordPress REST API endpoints for the plugin or customization.

## Context for the AI coding assistant

This prompt is used only when external apps, JavaScript frontend, mobile apps, or integrations need data from WordPress.

## Information the user should provide before running this prompt

- What data should the API return or receive?
- Who can access it: public, logged-in users, admins only?
- Will it be used by frontend, mobile app, or external system?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/includes/
wp-content/plugins/<plugin-folder>/rest/
main plugin file
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Unrelated plugins
```

## Tasks

1. Ask what data or action the API endpoint needs.
2. Register a namespaced REST route.
3. Add permission callbacks.
4. Sanitize request parameters.
5. Escape/prepare response data.
6. Add clear error responses.
7. Do not expose private data.


## Checks to run

```text
Open the REST endpoint locally.
Test with valid and invalid inputs.
Confirm unauthorized access is blocked if required.
```

## Acceptance criteria

- REST endpoint is namespaced.
- Permission callback exists.
- Inputs are sanitized.
- Sensitive data is not exposed.
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
