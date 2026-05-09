# Component Rules

Repeated UI components need contracts before implementation.

## Required For

- buttons
- inputs
- cards
- tables
- modals
- navigation
- tabs
- alerts
- dashboards
- charts
- forms

## Contract Requirements

- purpose
- variants
- states
- content rules
- accessibility rules
- responsive behavior
- design tokens
- forbidden variations

## Rule

Do not create multiple visual styles for the same component unless the component contract defines those variants.

## UI/UX Advisor

Use the advisor before creating frontend tasks when the product type is known:

```bash
kvdf design recommend ecommerce --json
kvdf design recommend news_website --json
kvdf design recommend erp --json
```

The advisor maps Product Blueprints to expected component groups:

- SEO/content: article cards, author boxes, FAQ, breadcrumbs, source lists, related posts.
- Commerce: product cards, galleries, cart drawer, checkout stepper, filters, order summary.
- Dashboards: sidebar, data table, filters, date range picker, bulk actions, activity timeline.
- Mobile: app bar, bottom navigation, list items, bottom sheet, offline states, push permission UI.

The output is advisory. Component contracts are still required for repeated
components before implementation.
