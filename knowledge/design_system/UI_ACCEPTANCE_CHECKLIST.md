# UI Acceptance Checklist

## Source And Spec

- UI/UX Advisor recommendation exists when the product blueprint is known.
- Approved design source is linked.
- Approved text spec exists.
- Design tokens are referenced.
- Page spec exists.
- Component contracts exist for repeated components.

## States

- Loading state is defined.
- Empty state is defined.
- Error state is defined.
- Success state is defined when relevant.
- Disabled state is defined for controls.

## Responsive And Accessibility

- Mobile behavior is defined.
- Desktop behavior is defined.
- Keyboard access is considered.
- Focus states are visible.
- Contrast is acceptable.
- RTL behavior is considered when Arabic is supported.

## Visual Review

- Screenshot or visual review notes exist.
- `kvdf design visual-review` is recorded when implementation touches UI.
- `kvdf design gate --task <task-id> --page <page-spec-id>` passes before Owner/client visual verify.
- Deviations are recorded.
- Owner/client visual approval is recorded when required.

## SEO/GEO Surfaces

- Semantic HTML structure is defined.
- Structured data type is selected when relevant.
- Breadcrumb behavior is defined.
- Author/date/source/last-updated rules are defined for content pages.
- Core Web Vitals risks are reviewed.

## Dashboard And Mobile Surfaces

- Data-heavy screens define table filters, pagination or virtualization, and empty/error states.
- Role-based visibility and permission UX are defined for dashboards.
- Mobile screens define touch targets, offline state, deep links, and permission prompts.
