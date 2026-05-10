# TAIL-UI01 Tailwind CSS 4 Foundation

Tailwind CSS 4.3.0 is an approved Kabeeri UI foundation for projects that need utility-first styling, custom product identity, modern frontend framework integration, fast responsive layouts, and token-driven component design.

Use it as a styling foundation, not as permission to scatter arbitrary classes everywhere. Kabeeri still requires approved design tokens, page specs, component contracts, accessibility rules, responsive rules, and visual acceptance checks before frontend implementation.

## Best For

- Next.js, Astro, Nuxt, SvelteKit, Vue, React, Laravel, Rails, and other modern frontend builds;
- custom public sites, storefronts, SaaS dashboards, portals, and marketing pages;
- products that need a bespoke visual identity without starting from a prebuilt component look;
- teams using shadcn/ui, Headless UI, Radix, or local component contracts on top of Tailwind utilities;
- fast iteration where layout, spacing, color, and responsive behavior must remain tokenized.

## Use With Care

Tailwind should produce a coherent design system, not one-off utility noise. Define first:

- theme color variables and semantic color roles;
- typography, spacing, radius, shadow, breakpoint, and motion tokens;
- dark mode and forced-color behavior;
- RTL/LTR behavior for Arabic and bilingual products;
- reusable component contracts and class composition policy;
- allowed plugins and framework adapter package.

Avoid mixing Tailwind with another full styling framework on the same surface unless the project has a documented migration or compatibility reason.

## Installation Options

Tailwind 4 uses package choices based on the build surface:

- `tailwindcss` for the core library;
- `@tailwindcss/cli` for standalone CLI builds and watch scripts;
- `@tailwindcss/vite` for Vite-based projects;
- `@tailwindcss/postcss` for PostCSS pipelines such as Next.js or Laravel;
- `@tailwindcss/browser` only for demos or prototypes, not production product UI.

## Required Component Contracts

When Tailwind is selected, define contracts for the components the product will actually use:

- buttons, icon buttons, links, and command actions;
- forms, validation, field groups, selects, checks, radios, switches, and file inputs;
- app shells, navbars, sidebars, tabs, breadcrumbs, pagination, drawers, and dialogs;
- cards, badges, alerts, toasts, accordions, tooltips, popovers, and empty/error states;
- tables and grids with search, filters, sorting, pagination, density, and responsive overflow;
- content blocks, hero sections, product cards, dashboards, and mobile-first layouts when relevant.

## Acceptance Rules

- Tailwind version is pinned to `4.3.0` or consciously upgraded with a recorded design-system change.
- Build adapter is documented: CLI, Vite, PostCSS, framework plugin, or browser-only prototype.
- Design tokens document Tailwind theme variables and semantic utility policy before page implementation.
- Component contracts prevent repeated ad hoc class strings for shared product components.
- Content scanning/build inputs are documented so production CSS includes every required class.
- Dark mode, responsive behavior, accessibility, and RTL are tested for Arabic surfaces.
- No copied demo branding, placeholder business data, or template-specific layout is shipped as product UI.
