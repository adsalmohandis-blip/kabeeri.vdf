# MRKT-UI01 Listing Discovery

## Identity

- Design code: `MRKT-UI01`
- Business: marketplace
- View: listing discovery
- Style: searchable multi-seller result grid/list

## Layout Anatomy

```text
search
filters
listing cards
seller trust
compare/save
pagination
```

## UX Goals

- Help buyers find and compare options.
- Surface seller credibility.
- Keep platform terms clear.

## Required Components

- `MarketplaceSearch`
- `FilterSidebar`
- `ListingCard`
- `SellerBadge`
- `CompareButton`
- `SavedButton`
- `Pagination`

## Required States

- loading;
- empty;
- no results;
- saved;
- seller verified;
- unavailable listing.

## Data Requirements

- listing title;
- seller identity;
- price/rate;
- rating;
- availability;
- platform fees if any.

## Accessibility

- Filter controls have labels.
- Listing cards use descriptive links.
- Seller status is text plus icon.

## Motion

- `BALANCED_MOTION`
- Save/compare feedback can be subtle.
- Avoid motion that changes listing order unexpectedly.

## Common Mistakes

- Seller identity hidden.
- Comparison requires too many clicks.
- Filters reset unexpectedly.

## Acceptance Criteria

- Buyer can compare listings by seller, price, rating, and availability.

## Task Seed

- Build marketplace discovery with search, filters, listing cards, seller badges, compare/save, and empty states.

