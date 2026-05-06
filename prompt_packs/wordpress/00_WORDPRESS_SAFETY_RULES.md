# 00 — WordPress Safety Rules

Use these rules with every WordPress prompt in this pack.

## Main safety rule

Never modify WordPress core files.

Do not edit files inside:

```text
wp-admin/
wp-includes/
```

Do not directly modify core WordPress files in the root folder.

## Allowed areas

Work should normally happen inside:

```text
wp-content/plugins/
wp-content/themes/
wp-content/mu-plugins/
```

## Plugin safety

A plugin should:

- have a clear plugin folder
- have a clear main plugin file
- use unique prefixes/namespaces
- avoid function name collisions
- check user capabilities before admin actions
- sanitize input
- escape output
- use nonces for form actions
- avoid storing secrets in code

## Theme safety

A theme or child theme should:

- not hardcode sensitive values
- not break parent theme updates
- avoid editing third-party theme files directly
- use child themes for customization when possible
- avoid mixing business logic deeply into templates

## WooCommerce safety

A WooCommerce extension should:

- not edit WooCommerce core files
- use hooks and filters
- check whether WooCommerce is active
- protect order/customer data
- handle missing dependencies gracefully

## AI coding assistant instruction

Always include this instruction when sending a WordPress prompt:

```text
You are working on a WordPress project.
Never modify WordPress core files.
Work only inside wp-content/plugins, wp-content/themes, or wp-content/mu-plugins unless explicitly instructed.
Follow the prompt scope exactly.
Do not add unrelated features.
Explain what you changed.
List files changed.
List checks to run.
Stop after completing this task.
```

## Beginner note

If you do not understand a WordPress technical term such as hook, shortcode, nonce, capability, or custom post type, ask an AI assistant such as ChatGPT to explain it before running the coding prompt.
