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
- inclusive UI behavior for keyboard, focus, screen readers, contrast, zoom, and reduced motion
- performance behavior for stable dimensions, loading, rendering cost, and interaction responsiveness
- content and microcopy behavior for labels, states, errors, confirmations, and status messages
- responsive behavior
- direction behavior for RTL/LTR when Arabic or bilingual UI is supported
- design tokens
- icon rules
- color token usage
- density rules
- motion rules
- creative variation hooks
- forbidden variations

## Rule

Do not create multiple visual styles for the same component unless the component contract defines those variants.

Use `knowledge/design_system/ui_execution_kit/` for execution-level UI rules:

- `UI_CONTRACT.md`
- `COLOR_SYSTEM.md`
- `CREATIVE_VARIATION_RULES.md`
- `ICON_MAP.md`
- `BUTTON_PRESETS.md`
- `COMPONENT_MAP.md`
- `MOTION_MICROINTERACTIONS.md`
- `UI_REVIEW.md`
- `recipes/`

The kit reduces prompt size by letting AI agents reference stable files instead of repeating design instructions in every task.

Use `knowledge/design_system/accessibility_inclusive_ui/` for accessibility-level decisions and component-specific inclusive behavior:

- `ACCESSIBILITY_CONTRACT.md`
- `FOCUS_KEYBOARD_RULES.md`
- `SEMANTIC_HTML_RULES.md`
- `FORMS_ERRORS_RULES.md`
- `TABLES_DATA_ACCESSIBILITY.md`
- `DIALOGS_OVERLAYS_RULES.md`
- `CONTENT_READABILITY_RULES.md`
- `ACCESSIBILITY_REVIEW_CHECKLIST.md`

Accessibility is a default requirement for every component contract, not an optional review category.

Use `knowledge/design_system/performance_web_vitals_ui/` for performance-level decisions and component-specific rendering behavior:

- `PERFORMANCE_CONTRACT.md`
- `CORE_WEB_VITALS_RULES.md`
- `IMAGE_MEDIA_RULES.md`
- `FONT_CSS_RULES.md`
- `JAVASCRIPT_INTERACTION_RULES.md`
- `DATA_RENDERING_RULES.md`
- `LOADING_SKELETON_RULES.md`
- `PERFORMANCE_REVIEW_CHECKLIST.md`

Performance is a default requirement for every component that affects first viewport, media, data rendering, interaction, layout stability, or loading states.

Use `knowledge/design_system/content_microcopy_ux/` for content-level decisions and component-specific microcopy:

- `CONTENT_MICROCOPY_CONTRACT.md`
- `ACTION_LABEL_RULES.md`
- `EMPTY_ERROR_STATE_COPY.md`
- `FORM_VALIDATION_COPY.md`
- `ONBOARDING_HELP_COPY.md`
- `CONFIRMATION_STATUS_COPY.md`
- `BUSINESS_TONE_MATRIX.md`
- `CONTENT_REVIEW_CHECKLIST.md`

Microcopy is part of the component contract for buttons, forms, empty states, error states, confirmations, status badges, onboarding, and guided flows.

## Controlled Creativity

Components must stay consistent, but page composition should not become repetitive across similar products.

Before implementation, choose creative variation axes from project answers:

- palette preset;
- density;
- navigation pattern;
- component emphasis;
- surface style;
- microcopy tone;
- layout hierarchy.
- motion level and microinteraction style.

Do not use creative variation to bypass accessibility, states, tokens, or approved UI foundation rules.

## Business Patterns And Flows

For product-aware UI, select the closest business pattern and flow before choosing component details:

- Business patterns: `knowledge/design_system/business_ui_patterns/BUSINESS_UI_PATTERN_CATALOG.json`
- Flow library: `knowledge/design_system/ui_flows/`
- Template metadata schema: `schemas/ui-template.schema.json`

The business pattern defines what the product must solve. The flow defines the sequence and required states. The component contract defines how repeated UI elements behave.

## RTL Arabic Components

When a surface supports Arabic, bilingual content, MENA users, or RTL direction, apply `knowledge/design_system/rtl_arabic_ui/` before final component decisions.

Component contracts must cover:

- `dir` behavior for page shell, navigation, drawers, modals, forms, and tables.
- Arabic typography and line-height.
- Mirrored layout rules without mirroring meaning-sensitive icons.
- Arabic/Latin number, currency, and date display rules.
- Form label, helper text, validation, and error placement in RTL.
- Table alignment, pinned action columns, pagination, and filter behavior in RTL.
- Keyboard, focus order, and screen reader expectations for Arabic UI.

## Motion

Use `MOTION_MICROINTERACTIONS.md` for animation decisions.

- Admin, ERP, FinTech, and HealthTech default to `MINIMAL_MOTION`.
- SaaS, CRM, dashboard, booking, delivery, LMS, real estate, and AI products default to `BALANCED_MOTION`.
- Landing, corporate, marketing, and showcase pages may use `EXPRESSIVE_MOTION`.

All motion must respect reduced-motion preferences and must not be the only way to communicate status or meaning.

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
