# Troubleshooting

## Common issues

- no categories found: check `categories/`
- invalid category data: check `schemas/category.schema.json`
- hidden categories not shown: check `visibility/visibility_rules.json`
- unexpected profile warning: check compatibility rules
- empty planning bundle: verify the selected category is active and spec-complete

## Guidance

If a category does not appear, check readiness and visibility first. If a profile fails, inspect the selected categories, the source inventory, and the compatibility rules before re-running create or plan.
