# JavaScript And Interaction Performance Rules

## Bundle Discipline

- Do not add a UI library when the selected stack already provides the needed component.
- Do not import full icon, chart, date, or animation libraries for small needs.
- Use route-level or component-level splitting where the framework supports it.
- Defer non-critical widgets, analytics, maps, and embeds.

## Interaction

- Search, filters, sort, tabs, drawers, and modals should respond immediately.
- Debounce text search and expensive filters.
- Avoid re-rendering large tables or dashboards on every keystroke.
- Long-running actions need disabled states, progress, cancel/retry when appropriate, and clear completion feedback.
- Keep animation JavaScript minimal and prefer CSS transitions for simple feedback.

## Third Party Scripts

- Public pages should limit third-party scripts above the fold.
- Ads, chat widgets, analytics, maps, and embeds must reserve space and load intentionally.
- Third-party failures should not break primary UI.

