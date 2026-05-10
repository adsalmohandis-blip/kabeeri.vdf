# MRKT-UI03 Seller Profile

## Identity

- Design code: `MRKT-UI03`
- Business: marketplace
- View: seller profile
- Style: credibility and listings hub

## Layout Anatomy

```text
seller header
verification/trust
rating summary
listings
reviews
contact/report
```

## UX Goals

- Build seller trust.
- Show active listings and performance.
- Provide contact/report routes.

## Required Components

- `SellerHeader`
- `VerificationBadge`
- `RatingSummary`
- `SellerListings`
- `ReviewList`
- `ContactSellerButton`
- `ReportButton`

## Required States

- verified;
- unverified;
- suspended;
- no listings;
- loading reviews.

## Data Requirements

- seller name;
- verification status;
- ratings;
- listing count;
- policies;
- response time.

## Accessibility

- Verification is text plus badge.
- Review filters have labels.
- Report action is not hidden.

## Motion

- `BALANCED_MOTION`
- Listing card hover can be subtle.
- Avoid gamified trust animations.

## Common Mistakes

- Verification conveyed by color only.
- Seller terms scattered across page.
- Report/support path hidden.

## Acceptance Criteria

- Buyer can assess trust and browse seller listings quickly.

## Task Seed

- Build seller profile with trust badges, listings, reviews, policies, contact, and report states.

