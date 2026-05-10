# Kabeeri Business UI Patterns

This layer adapts the KVDF business guidance into Kabeeri's existing design system.

Use it after the product type is known and before generating screens:

1. Identify the closest business pattern.
2. Read the matching `PATTERN.md` or the machine-readable catalog.
3. Read `TEMPLATE_LIBRARY_INDEX.json` and the selected pack's `data/templates.json`.
4. Combine it with `knowledge/design_system/ui_execution_kit/UI_CONTRACT.md`.
5. Select the relevant view recipes and user flows.
6. Apply color, motion, density, and layout variation from product answers.
7. Review with the UI checklist before finishing.

Do not clone the same layout for every product in the same category. The business pattern defines what must be solved; creative variation defines how it should feel.

Core references:

- Catalog: `BUSINESS_UI_PATTERN_CATALOG.json`
- Template index: `TEMPLATE_LIBRARY_INDEX.json`
- Full reference index: `BUSINESS_REFERENCE_INDEX.json`
- Pattern template: `BUSINESS_PATTERN_TEMPLATE.md`
- UI kit: `../ui_execution_kit/README.md`
- Flows: `../ui_flows/README.md`

## Detailed Packs

- `landing-page/`
- `corporate/`
- `ecommerce/`
- `marketplace/`
- `saas/`
- `admin-panel/`
- `dashboard/`
- `crm/`
- `erp/`
- `booking/`
- `delivery/`
- `lms/`
- `fintech/`
- `healthtech/`
- `real-estate/`
- `ai-product/`

Each priority pack contains:

- `PATTERN.md`
- `references/` with five full design reference files
- `templates/`
- `data/templates.json`
