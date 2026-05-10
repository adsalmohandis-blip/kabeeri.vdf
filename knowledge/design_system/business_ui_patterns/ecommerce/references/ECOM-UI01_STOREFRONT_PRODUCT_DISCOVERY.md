# ECOM-UI01 Storefront Product Discovery

## Identity

- Design code: `ECOM-UI01`
- Business: e-commerce
- View: storefront discovery, category, search, recommendations
- Style: product-led grid with strong filters and trust signals
- Copy policy: inspiration only, use project assets and tokens

## Core Pattern

Use a product discovery surface:

```text
header/search
category/filter toolbar
product grid
promotion or trust band
pagination or load-more
recently viewed or recommendations
```

## Required Sections

- search input with icon and suggestions;
- category navigation or breadcrumb;
- filter sidebar or filter drawer;
- sort menu;
- responsive product grid;
- no-results empty state;
- trust strip for shipping, returns, and support.

## Component Contracts

- `SearchBox`
- `FilterSidebar`
- `SortDropdown`
- `ProductCard`
- `PriceBlock`
- `DiscountBadge`
- `WishlistButton`
- `Pagination`
- `EmptyState`

## States

- loading grid skeleton;
- empty category;
- no-results after filters;
- out-of-stock product;
- sale product;
- filter applied.

## Design Rules

- Product image, name, price, and purchase affordance must be immediately visible.
- Keep filters persistent on desktop and drawer-based on mobile.
- Product cards may vary by brand, but price hierarchy must stay stable.
- Do not hide price, shipping, stock, or primary action.

## Motion

- `BALANCED_MOTION`
- Product hover can lift subtly.
- Filter changes can crossfade results.
- Avoid animations that delay product images.

## Task Seed

- Build responsive discovery page using the selected UI foundation.
- Use product card template and checkout flow references.
- Add loading, empty, no-results, and out-of-stock states.
- Review with UI and motion checklists.

