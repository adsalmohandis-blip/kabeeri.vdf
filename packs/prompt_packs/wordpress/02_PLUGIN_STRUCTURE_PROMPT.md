# 02 — Plugin Structure Prompt

## Goal

Create a clean WordPress plugin structure for a first-release plugin.

## Context for the AI coding assistant

This prompt should be used when the project needs a WordPress plugin. It should not build all plugin features yet.

## Information the user should provide before running this prompt

- Plugin name
- Plugin slug
- Main purpose
- Does it need admin screens?
- Does it need frontend output?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/
README.md inside plugin folder
main plugin file
includes/
assets/
admin/
public/
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Other plugins unless explicitly approved
Active theme files unless required
```

## Tasks

1. Create a plugin folder using a safe slug.
2. Create a main plugin file with a valid plugin header.
3. Add basic folder structure only if needed: includes, admin, public, assets.
4. Add activation/deactivation hooks only if needed.
5. Add unique prefix or namespace to avoid conflicts.
6. Add a simple README for the plugin.
7. Do not build feature logic outside the requested scope.


## Checks to run

```text
Activate the plugin locally.
Check that WordPress admin does not show fatal errors.
Check debug.log if WP_DEBUG is enabled.
```

## Acceptance criteria

- Plugin can be activated without fatal errors.
- Plugin has a clean main file and folder structure.
- Names are unique enough to avoid collisions.
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
