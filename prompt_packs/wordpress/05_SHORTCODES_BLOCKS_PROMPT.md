# 05 — Shortcodes and Blocks Prompt

## Goal

Add frontend output using shortcodes or Gutenberg blocks.

## Context for the AI coding assistant

This prompt is used when content must appear on pages/posts through shortcodes or blocks.

## Information the user should provide before running this prompt

- Should users place this using shortcode, block, or both?
- What should appear on the page?
- What should happen if there is no data?
- Should output be public or only for logged-in users?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/public/
wp-content/plugins/<plugin-folder>/blocks/
assets/
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Unrelated theme files
```

## Tasks

1. Ask whether the user needs shortcode, Gutenberg block, or both.
2. Create a simple shortcode if that is enough.
3. Create a block only if required by the project.
4. Sanitize shortcode attributes.
5. Escape frontend output.
6. Add empty state for no data.
7. Do not build complex page builder behavior.


## Checks to run

```text
Add shortcode/block to a test page.
View frontend.
Check for errors.
Check output with no data.
```

## Acceptance criteria

- Shortcode/block works in a test page.
- Output is escaped.
- Empty states are handled.
- No unrelated frontend features are added.


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
