# Visual Review Evidence

A visual review should include enough evidence for another developer, designer,
or AI agent to understand what was checked without reopening the whole task.

## Required Evidence

- Desktop screenshot.
- Mobile screenshot.
- Reviewed page spec ID.
- Related task ID when the UI came from a task.
- Checks applied.
- Decision: `pass`, `needs_rework`, or `blocked`.
- Reviewer.
- Deviations from the approved spec.

## Strong Evidence

- Tablet screenshot for dense dashboards.
- RTL screenshot for Arabic or bilingual UI.
- Dark mode screenshot when dark mode is supported.
- Loading, empty, error, success, and validation screenshots when relevant.
- Performance notes for public, commerce, or data-heavy screens.
- Accessibility notes for forms, tables, dialogs, keyboard, and contrast.

## Evidence Naming

Prefer descriptive paths:

```text
evidence/ui/checkout-desktop.png
evidence/ui/checkout-mobile.png
evidence/ui/checkout-error-state.png
evidence/ui/checkout-rtl.png
```

