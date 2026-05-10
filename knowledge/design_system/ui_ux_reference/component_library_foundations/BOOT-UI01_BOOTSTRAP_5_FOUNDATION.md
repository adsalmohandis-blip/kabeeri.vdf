# BOOT-UI01 Bootstrap 5.3 Foundation

Bootstrap 5.3.8 is an approved Kabeeri UI foundation for projects that need a reliable responsive grid, common web components, fast prototyping, WordPress-friendly markup, or a conventional public/admin interface.

Use it as an implementation library, not as a visual shortcut. Kabeeri still requires approved design tokens, page specs, component contracts, accessibility rules, responsive rules, and visual acceptance checks before frontend implementation.

## Best For

- public websites and landing pages that need responsive structure;
- WordPress themes, child themes, and plugin admin/public UI;
- Bootstrap-compatible admin dashboards;
- MVPs that need stable forms, navs, cards, tables, alerts, modals, dropdowns, and toasts;
- mixed teams that benefit from widely understood class names and documentation.

## Use With Care

Bootstrap should not force every project into the same visual identity. Customize through tokens and variables first:

- colors and semantic color roles;
- typography scale and font families;
- spacing and grid rhythm;
- border radius and shadow scale;
- light/dark color mode behavior;
- RTL/LTR behavior;
- component variants and states.

Avoid stacking unrelated CSS frameworks unless a project has an explicit migration reason. Do not mix Bootstrap with another full component system in the same surface without a documented decision.

## Required Component Contracts

When Bootstrap is selected, define contracts for the components the product will actually use:

- buttons and icon buttons;
- forms, validation, input groups, selects, checks, radios, switches, and file inputs;
- navbars, tabs, breadcrumbs, pagination, dropdowns, offcanvas, and sidebars;
- cards, badges, alerts, toasts, accordions, modals, tooltips, and popovers;
- tables with search, filters, sorting, pagination, empty/loading/error states;
- grid/layout shells for desktop, tablet, mobile, RTL, and print when relevant.

## Acceptance Rules

- Bootstrap version is pinned to `5.3.8` or consciously upgraded with a recorded design-system change.
- CSS and JavaScript import method is documented: npm bundler import, Sass build, or CDN only when appropriate.
- Design tokens document Bootstrap variable overrides before page implementation.
- Components include keyboard behavior and accessible names.
- Interactive components that need JavaScript use `bootstrap.bundle` or an equivalent bundler import.
- RTL is tested for Arabic surfaces.
- No copied demo branding, placeholder business data, or template-specific layout is shipped as product UI.
