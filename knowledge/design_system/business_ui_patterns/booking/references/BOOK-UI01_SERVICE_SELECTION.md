# BOOK-UI01 Service Selection

## Identity

- Design code: `BOOK-UI01`
- Business: booking
- View: service selection
- Style: clear service cards with duration, price, and next step

## Core Pattern

```text
service categories
service cards
duration / price
provider or location hint
continue action
```

## Required Sections

- category selector;
- service cards;
- duration and price;
- availability hint;
- selected service summary;
- continue action.

## Component Contracts

- `ServiceCategoryTabs`
- `ServiceCard`
- `DurationBadge`
- `PriceBlock`
- `SelectedSummary`
- `ContinueButton`

## States

- selected;
- unavailable;
- loading services;
- no services;
- price varies.

## Design Rules

- Duration, price, and service outcome must be visible.
- Selected service must be unmistakable.
- Continue action is disabled until selection.

## Motion

- `BALANCED_MOTION`
- Selection feedback can be subtle.
- Do not animate availability ambiguously.

## Task Seed

- Build service selection with cards, selected state, no-service state, and continue action.

