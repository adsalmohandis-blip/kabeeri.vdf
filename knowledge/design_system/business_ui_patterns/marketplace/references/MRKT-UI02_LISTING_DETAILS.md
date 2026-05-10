# MRKT-UI02 Listing Details

## Identity

- Design code: `MRKT-UI02`
- Business: marketplace
- View: listing details
- Style: offer detail with seller trust and transaction action

## Layout Anatomy

```text
gallery/details
price or rate
seller panel
terms
primary transaction action
reviews
related listings
```

## UX Goals

- Make the offer inspectable.
- Clarify seller trust and terms.
- Push a clear transaction or contact action.

## Required Components

- `ListingGallery`
- `PriceBlock`
- `SellerPanel`
- `TermsPanel`
- `PrimaryAction`
- `ReviewSummary`
- `RelatedListings`

## Required States

- available;
- unavailable;
- seller offline;
- request pending;
- action failed.

## Data Requirements

- listing media;
- price/rate;
- seller details;
- terms;
- reviews;
- availability.

## Accessibility

- Media has alt text.
- Primary action uses button.
- Terms are readable before commitment.

## Motion

- `BALANCED_MOTION`
- Gallery transition is allowed.
- Do not animate key terms or prices distractingly.

## Common Mistakes

- Trust signals below hidden tabs only.
- Unclear platform versus seller responsibility.
- Primary action label too vague.

## Acceptance Criteria

- Seller, terms, price, and action are visible before commitment.

## Task Seed

- Build listing detail with gallery, seller panel, terms, reviews, related listings, and action states.

