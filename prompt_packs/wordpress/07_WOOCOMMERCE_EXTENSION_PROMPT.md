# 07 — WooCommerce Extension Prompt

## Goal

Create a safe WooCommerce extension or customization using hooks and filters.

## Context for the AI coding assistant

This prompt is used only if the project needs WooCommerce behavior.

## Information the user should provide before running this prompt

- What WooCommerce feature do you need?
- Is it product, cart, checkout, order, shipping, payment, email, or admin related?
- Should this be a plugin or child theme customization?
- Technical note: If unsure, ask ChatGPT to explain the safest WooCommerce hook-based approach.

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/
wp-content/themes/<child-theme>/ only if explicitly selected
WooCommerce hook-based files
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WooCommerce core files
WordPress core files
Other plugins unless explicitly approved
```

## Tasks

1. Confirm WooCommerce is part of the project.
2. Identify the requested customization: product fields, checkout, shipping, payment integration skeleton, order metadata, emails, or admin settings.
3. Check if WooCommerce is active before running WooCommerce-specific code.
4. Use hooks and filters.
5. Protect customer/order data.
6. Add admin settings if needed.
7. Do not edit WooCommerce core files.


## Checks to run

```text
Activate plugin locally.
Confirm WooCommerce is active.
Test cart/checkout/product/admin flow as relevant.
Check for PHP errors.
```

## Acceptance criteria

- WooCommerce customization is isolated in plugin or child theme.
- WooCommerce core is not modified.
- Missing WooCommerce dependency is handled gracefully.
- Customer/order data is protected.


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
