# Theme Token Intelligence

This pack helps Kabeeri select and export product-aware design tokens before UI
implementation. It keeps AI prompts short by referencing a stable token file
instead of repeating palette, spacing, radius, density, shadow, and motion rules.

Use it when:

- starting a new frontend
- selecting a UI stack
- creating page specs
- refactoring visual style
- preparing Bootstrap, Tailwind, MUI, Ant Design, daisyUI, or shadcn/ui themes

Primary files:

- `THEME_TOKEN_CONTRACT.md`
- `PALETTE_PRESET_CATALOG.json`
- `FRAMEWORK_TOKEN_MAPPING.md`
- `THEME_VARIATION_RULES.md`

Runtime commands:

```bash
kvdf design theme-presets
kvdf design theme-recommend ecommerce --json
kvdf design theme-recommend erp --output knowledge/frontend_specs/tokens.json
```
