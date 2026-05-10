# Performance Review Checklist

## Core Web Vitals

- LCP element is identified.
- LCP image or content is not lazy-loaded.
- CLS risks are handled with stable dimensions.
- INP risks are handled for search, filters, forms, navigation, and primary actions.
- Public pages can be reviewed for LCP, INP, CLS, JS weight, image weight, and font loading.

## Assets

- Images have dimensions or aspect ratios.
- Responsive images are used where needed.
- Below-the-fold images are lazy-loaded.
- Custom font use is justified and limited.
- Icon, chart, date, map, and animation libraries are not over-imported.

## Rendering

- Critical public content is not hidden behind unnecessary client-only rendering.
- Heavy widgets are deferred or split.
- Large tables and lists use pagination, virtualization, or progressive rendering.
- Skeletons and loading states preserve layout size.
- Error and empty states do not cause layout jumps.

## Interaction

- Search and filters are debounced or server-side for large data.
- Primary actions show immediate feedback.
- Long-running actions avoid blocking unrelated UI.
- Motion avoids layout-heavy animation.
- Third-party scripts reserve space and fail safely.

