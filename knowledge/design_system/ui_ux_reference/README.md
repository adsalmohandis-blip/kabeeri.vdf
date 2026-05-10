# Kabeeri UI/UX Reference Library

This folder is the governed UI/UX learning layer for Kabeeri.

It is not a place for copying templates. It is a place for converting approved visual references, product patterns, and professional UI/UX rules into reusable design knowledge that AI coding tools can safely use.

For implementation-level recipes, icon maps, color presets, and low-token review rules, use `knowledge/design_system/ui_execution_kit/`.

## Purpose

Kabeeri uses this library to:

- ask better UI/UX discovery questions before frontend work starts;
- recommend the right interface pattern for admin dashboards, storefronts, content sites, mobile apps, POS screens, and SaaS products;
- generate design-system, page-spec, component-contract, and visual-QA tasks;
- prevent random colors, one-off components, weak responsive behavior, and missing empty/error/loading states;
- keep AI implementation tied to approved text specifications and design tokens.

## Structure

```text
knowledge/design_system/ui_ux_reference/
  README.md
  GENERAL_UI_UX_SYSTEM_RULES.md
  UI_UX_REFERENCE_INDEX.json
  component_library_foundations/
    BOOT-UI01_BOOTSTRAP_5_FOUNDATION.md
    TAIL-UI01_TAILWIND_4_FOUNDATION.md
    BULM-UI01_BULMA_FOUNDATION.md
    FOUND-UI01_FOUNDATION_SITES_FOUNDATION.md
    MUI-UI01_MATERIAL_UI_FOUNDATION.md
    ANTD-UI01_ANT_DESIGN_FOUNDATION.md
    DAISY-UI01_DAISYUI_FOUNDATION.md
    SHAD-UI01_SHADCN_UI_FOUNDATION.md
  admin_dashboard_patterns/
    ADMIT-ADB01_DARK_GOVERNANCE_DASHBOARD.md
    ADMIT-ADB02_DASHER_ECOMMERCE_DASHBOARD.md
    ADMIT-ADB03_FALCON_ENTERPRISE_APP_SHELL.md
    ADMIT-ADB04_SOFT_UI_BILLING.md
    ADMIT-ADB05_MATERIAL_SHADCN_DASHBOARD.md
```

Future public-facing examples should be added under domain folders, for example:

```text
public_site_patterns/
commerce_patterns/
content_patterns/
mobile_patterns/
pos_patterns/
```

## CLI

```text
kvdf design reference-list
kvdf design reference-show ADMIT-ADB01
kvdf design reference-recommend "admin ecommerce dashboard with orders and revenue"
kvdf design reference-questions ADMIT-ADB02
kvdf design reference-tasks ADMIT-ADB02 --scope "ecommerce admin dashboard"
```

## AI Rules

- Use references as inspiration and reasoning input only.
- Bootstrap 5.3.8 is an approved implementation foundation when a project asks for a Bootstrap-based UI, a fast responsive prototype, a WordPress theme/plugin UI, or a conventional public/admin interface.
- Tailwind CSS 4.3.0 is an approved utility-first implementation foundation when a project asks for Tailwind, needs custom product UI, uses modern frameworks such as Next.js, Astro, Nuxt, SvelteKit, Vue, React, or needs token-driven responsive styling without a heavy prebuilt component system.
- Bulma 1.0.4, Foundation Sites 6.9.0, MUI 9.0.1, Ant Design 6.3.7, daisyUI 5.5.19, and shadcn/ui CLI 4.7.0 are approved UI foundation options when their framework fit, product density, and ownership model match the project.
- Do not copy source code, assets, branding, demo text, or pixel-perfect layouts from third-party templates.
- Convert every chosen reference into design tokens, page specs, component contracts, states, responsive rules, accessibility rules, and visual acceptance criteria before implementation.
- When Bootstrap is selected, map Bootstrap variables, utilities, breakpoints, grid, forms, navs, modals, dropdowns, alerts, toasts, cards, badges, tables, and icons strategy into the project design tokens and component contracts.
- When Tailwind is selected, map theme variables, utility policy, responsive breakpoints, dark mode, RTL strategy, content scanning, reusable component classes, and plugin choices into the project design tokens and component contracts.
- React-only libraries such as MUI, Ant Design, and shadcn/ui must only be selected for React/Next.js-style projects.
- Tailwind add-ons such as daisyUI and shadcn/ui require an approved Tailwind foundation first.
- Use the UI Execution Kit to keep prompts short, while using creative variation rules to prevent repetitive generated UI across similar apps.
- Ask questions before implementation when product type, users, layout density, navigation depth, RTL, SEO/GEO, or data behavior is unclear.
- All implementation tasks must include loading, empty, error, permission, and responsive states unless explicitly out of scope.
