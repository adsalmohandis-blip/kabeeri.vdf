# Framework Adapter Intelligence

This pack converts Kabeeri design decisions into implementation guidance for a selected UI framework.

Use it after:

1. Theme Token Intelligence selects a token set.
2. Component Composition Intelligence selects a screen composition.
3. The project chooses an approved UI library or framework.

The adapter prevents AI agents from rethinking framework usage on every task. Prompts should reference the selected adapter key, token set, and composition ID instead of pasting long framework instructions.

## Commands

```bash
kvdf design framework-adapters
kvdf design framework-plan bootstrap --blueprint erp --composition crud_table_workspace --json
kvdf design framework-plan shadcn-ui --blueprint ecommerce --page checkout --json
```

## Rule

Adapters do not replace design creativity. They translate approved creative decisions into framework-specific classes, imports, components, ownership rules, accessibility checks, and compatibility warnings.

