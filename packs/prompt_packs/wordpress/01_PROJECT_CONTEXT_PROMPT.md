# 01 — WordPress Project Context Prompt

## Goal

Give the AI coding assistant the correct WordPress project context before writing code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand whether this is a plugin, theme, child theme, WooCommerce extension, block, or migration helper.

## Information the user should provide before running this prompt

- Are we building a plugin, theme, child theme, WooCommerce extension, block, shortcode, or migration helper?
- What should the first version do?
- What should wait until later?
- What is the plugin/theme name?

## Files and areas allowed for this prompt

```text
wp-content/plugins/
wp-content/themes/
wp-content/mu-plugins/
README.md
plugin/theme files if already present
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core root files
Third-party plugin files unless explicitly approved
```

## Tasks

1. Read the product summary provided by the user.
2. Identify the WordPress work type: plugin, theme, child theme, WooCommerce extension, block, shortcode, REST API, or migration helper.
3. Identify the first release scope.
4. Identify what should not be built yet.
5. Identify the allowed working folder.
6. Produce an implementation context summary.
7. Do not write product code unless the user explicitly asks after this summary.


## Checks to run

```text
Open the site locally.
Confirm WordPress admin loads.
Confirm the target plugin/theme folder is accessible.
```

## Acceptance criteria

- The AI clearly understands the WordPress work type.
- First release scope is separated from future ideas.
- Allowed working folder is clear.
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
