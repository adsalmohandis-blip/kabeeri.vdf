# REST-UI05 Saved Compare

## Identity

- Design code: `REST-UI05`
- Business: real-estate
- View: saved properties and comparison
- Style: decision support comparison

## Layout Anatomy

```text
saved list
compare table/cards
feature differences
contact/book viewing
remove/save states
```

## UX Goals

- Help users shortlist and compare.
- Make differences clear.
- Support next action: contact or viewing.

## Required Components

- `SavedPropertyList`
- `CompareTable`
- `FeatureDifference`
- `ContactAgentButton`
- `BookViewingButton`
- `RemoveSavedButton`

## Required States

- no saved properties;
- compare selected;
- removed;
- unavailable property;
- contact submitted.

## Data Requirements

- saved properties;
- price/features/location;
- availability;
- agent/contact;
- comparison fields.

## Accessibility

- Comparison table has headers.
- Remove actions are labeled.
- Differences are text plus visual emphasis.

## Motion

- `BALANCED_MOTION`
- Remove can animate lightly with undo.
- Avoid layout shifts during comparison.

## Common Mistakes

- Saved state not persistent.
- Comparison missing key fields.
- No path from shortlist to contact.

## Acceptance Criteria

- User can compare saved properties and take the next action.

## Task Seed

- Build saved/compare view with empty state, comparison, remove/undo, contact, and unavailable states.

