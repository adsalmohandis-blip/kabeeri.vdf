# Performance Contract

## Principle

The UI must feel fast, stable, and responsive before it is considered complete.

## Required Baseline

- Identify the likely Largest Contentful Paint element before building the page.
- Reserve dimensions for images, media, cards, embeds, charts, tables, ads, skeletons, and dynamic regions.
- Keep above-the-fold UI lightweight.
- Avoid layout shifts from late fonts, late images, banners, filters, ads, charts, and permission prompts.
- Use lazy loading only for non-critical media and sections.
- Do not lazy-load the LCP image or primary first-viewport content.
- Keep JavaScript interaction handlers small and predictable.
- Avoid shipping unused UI libraries, icon sets, charts, animation libraries, or component bundles.
- Heavy lists and tables must use pagination, virtualization, or progressive rendering.
- Loading states must preserve layout dimensions.
- Motion and animation must not cause layout reflow or interaction delay.

## Levels

### PERFORMANCE_PUBLIC_STRICT

Use for SEO pages, landing pages, commerce storefronts, marketplaces, news, blogs, documentation, and public marketing pages.

Required emphasis:

- LCP planning;
- optimized images;
- font loading;
- semantic HTML before JavaScript;
- low JavaScript weight;
- stable first viewport;
- Core Web Vitals evidence.

### PERFORMANCE_APP_BALANCED

Use for SaaS, booking, delivery, LMS, real estate, AI products, and general authenticated apps.

Required emphasis:

- fast first usable screen;
- responsive forms and filters;
- progressive data loading;
- route-level splitting;
- clear loading and error states.

### PERFORMANCE_DATA_HEAVY

Use for ERP, CRM, admin panels, dashboards, FinTech, HealthTech, BI, WMS, accounting, helpdesk, and dense operational tools.

Required emphasis:

- table pagination or virtualization;
- chart lazy loading after shell;
- filter debounce;
- export background state;
- stable panel dimensions;
- no blocking dashboard widgets.

## Anti-Patterns

- Decorative hero media that becomes the LCP bottleneck.
- Heavy sliders or carousels above the fold.
- Layout shifts from images without dimensions.
- Client-only rendering for critical public content.
- Loading spinners that collapse page layout.
- Importing a full icon library for a few icons.
- Large chart libraries on pages without charts.
- Infinite scroll without crawlable or accessible fallback.
- Hover-heavy interactions that trigger expensive layout work.

