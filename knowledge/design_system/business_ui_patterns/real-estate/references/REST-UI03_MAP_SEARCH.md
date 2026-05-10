# REST-UI03 Map Search

## Identity

- Design code: `REST-UI03`
- Business: real-estate
- View: map search
- Style: map/list split for location-driven search

## Layout Anatomy

```text
filter bar
map
listing side panel
selected marker detail
save/contact
```

## UX Goals

- Explore properties geographically.
- Keep list fallback and details available.
- Avoid map-only dead ends.

## Required Components

- `MapSearch`
- `FilterBar`
- `ListingPanel`
- `PropertyMarker`
- `SelectedPropertyCard`
- `SaveButton`

## Required States

- map loading;
- map error;
- no properties in bounds;
- selected property;
- saved.

## Data Requirements

- coordinates;
- property summary;
- filters;
- map bounds;
- selected listing.

## Accessibility

- Map has list fallback.
- Selected marker information is text.
- Keyboard users can reach listings.

## Motion

- `BALANCED_MOTION`
- Marker selection can transition.
- Avoid excessive map animations.

## Common Mistakes

- Map without list fallback.
- Filters reset when panning.
- Markers with no accessible labels.

## Acceptance Criteria

- User can search by map and still access all listings as text/cards.

## Task Seed

- Build map search with filters, list panel, selected property card, map fallback, and empty states.

