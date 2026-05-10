# Core Web Vitals Rules

## LCP

- Identify the LCP element: hero image, heading block, product image, article title, dashboard shell, or first content card.
- Do not lazy-load the LCP element.
- Use correct image dimensions and modern formats.
- Avoid blocking CSS or JavaScript before first meaningful content.
- Keep first-viewport decorative effects lightweight.
- Public pages should render important content server-side or statically when the stack supports it.

## CLS

- Reserve width, height, aspect ratio, or stable containers for images, videos, ads, embeds, charts, tables, skeletons, and dynamic alerts.
- Avoid inserting banners above existing content after load.
- Use font loading strategies that reduce text shift.
- Keep loading, empty, error, and success states dimensionally stable.
- Do not animate layout properties for common UI transitions.

## INP

- Keep click, input, filter, sort, search, and route-change handlers short.
- Debounce search and expensive filters.
- Split expensive work away from immediate input.
- Avoid heavy synchronous table, chart, map, or markdown rendering on interaction.
- Give instant feedback for long-running actions.
- Avoid unnecessary re-renders of the whole page when only one region changes.

