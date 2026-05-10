# REST-UI01 Property Listing

## Identity

- Design code: `REST-UI01`
- Business: real-estate
- View: property listing/search results
- Style: visual listing grid/list with strong filters

## Layout Anatomy

```text
search/location
filters
property cards
sort
map toggle
pagination
```

## UX Goals

- Help users filter and compare properties.
- Make price, location, and photos prominent.
- Keep contact path accessible.

## Required Components

- `LocationSearch`
- `PropertyFilterBar`
- `PropertyCard`
- `PriceBlock`
- `FeatureBadges`
- `MapToggle`
- `Pagination`

## Required States

- loading;
- no listings;
- filtered empty;
- saved;
- unavailable.

## Data Requirements

- price;
- location;
- photos;
- bedrooms/bathrooms/area;
- status;
- agent.

## Accessibility

- Images have alt text.
- Feature badges include text.
- Filters have labels.

## Motion

- `BALANCED_MOTION`
- Card hover can be subtle.
- Avoid effects over property photos.

## Common Mistakes

- Price or location too small.
- Weak filters.
- CTA hidden below the card.

## Acceptance Criteria

- User can compare properties by price, location, features, and status.

## Task Seed

- Build property listing with filters, cards, map toggle, saved state, and no-results states.

