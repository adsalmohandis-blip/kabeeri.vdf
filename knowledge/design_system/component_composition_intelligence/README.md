# Component Composition Intelligence

This pack helps Kabeeri choose a screen composition before code generation.
It reduces AI token cost by referencing a stable composition ID instead of
describing every component arrangement in the prompt.

Use it after selecting:

- product blueprint
- business UI pattern
- theme tokens
- UI foundation
- user flow

Runtime commands:

```bash
kvdf design composition-list
kvdf design composition-recommend erp --page "invoice approval table" --json
kvdf design composition-recommend ecommerce --page checkout
```

Primary files:

- `COMPONENT_COMPOSITION_CONTRACT.md`
- `SCREEN_COMPOSITION_CATALOG.json`
- `FRAMEWORK_COMPOSITION_RULES.md`

