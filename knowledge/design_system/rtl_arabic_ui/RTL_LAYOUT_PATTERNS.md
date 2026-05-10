# RTL Layout Patterns

RTL layout is a product decision, not a CSS afterthought.

## App Shell

Arabic app shell default:

```text
right sidebar
topbar
content area
breadcrumbs start from right
primary actions near logical start or end based on local convention
```

Rules:

- Sidebar can be right-aligned for Arabic-first systems.
- Bilingual apps may keep sidebar position stable if users switch language often, but this must be intentional.
- Breadcrumb order follows reading direction.
- Search placement should remain easy to discover.

## Page Header

RTL header anatomy:

```text
title/subtitle on right
actions on left
breadcrumb above or inline from right
```

Rules:

- Primary action remains visually prominent.
- Do not force English-style left title/right action on Arabic pages unless product convention requires it.

## Cards And Grids

- Card content aligns right.
- Icons appear at logical start for labels.
- Metric trends should read correctly with direction-aware arrows.
- Grid order follows content priority, not blind mirroring.

## Navigation

- Directional chevrons are mirrored.
- Nested menu expansion direction must fit RTL.
- Active state indicator can use `border-inline-start` or `border-inline-end` intentionally.

## Drawers And Modals

- Navigation drawer usually enters from right in Arabic-first apps.
- Detail drawers can enter from the side closest to the triggering table action, but be consistent.
- Modals stay centered.

## Landing Pages

- Hero layout should not become a generic mirrored split.
- If using full-bleed media, keep text readable over image.
- CTA order should match Arabic reading flow.

## Responsive

- Mobile navigation direction must be tested.
- Horizontal scroll tables should start at the most important column.
- Avoid components that only work with left-to-right drag gestures.

## Common Mistakes

- Flipping sidebar but not breadcrumbs.
- Mirroring non-directional icons.
- Table actions appearing in unexpected order.
- Search icon on wrong side of input.
- English IDs broken inside Arabic sentences.

