# 03 — Custom Post Types and Taxonomies Prompt

## Goal

Add custom post types and taxonomies for WordPress content structures.

## Context for the AI coding assistant

This prompt is used when the product needs structured content such as properties, bookings, courses, events, listings, testimonials, or products outside WooCommerce.

## Information the user should provide before running this prompt

- What content does the site need to manage? Example: events, properties, courses, bookings, testimonials.
- Should this content appear publicly?
- Does it need categories/tags?
- What should the admin menu label be?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/
wp-content/themes/<child-theme>/functions.php only if child theme customization is explicitly selected
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
Third-party plugin files
```

## Tasks

1. Ask what content types the product needs.
2. Create only first-release custom post types.
3. Add labels that are understandable in WordPress admin.
4. Add taxonomies only if needed.
5. Configure public/admin visibility according to the product.
6. Add rewrite slugs only if required.
7. Do not create many future content types.


## Checks to run

```text
Activate plugin/theme locally.
Open WordPress admin.
Confirm CPT menu appears if expected.
Create a test item manually.
```

## Acceptance criteria

- Required content types exist.
- Admin labels are clear.
- Public/private behavior is correct.
- No unnecessary future content types were added.


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
