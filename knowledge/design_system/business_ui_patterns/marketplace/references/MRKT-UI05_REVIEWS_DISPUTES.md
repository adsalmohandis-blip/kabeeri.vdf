# MRKT-UI05 Reviews Disputes

## Identity

- Design code: `MRKT-UI05`
- Business: marketplace
- View: reviews, ratings, disputes, support
- Style: transparent trust and resolution surface

## Layout Anatomy

```text
rating summary
review filters
review list
dispute entry
resolution status
support path
```

## UX Goals

- Help buyers evaluate trust.
- Let users resolve issues.
- Keep platform accountability clear.

## Required Components

- `RatingSummary`
- `ReviewFilter`
- `ReviewList`
- `DisputeForm`
- `ResolutionStatus`
- `SupportLink`

## Required States

- no reviews;
- filtered empty;
- dispute draft;
- dispute submitted;
- under review;
- resolved.

## Data Requirements

- ratings;
- reviews;
- review source;
- dispute reason;
- status timeline.

## Accessibility

- Rating uses numeric text.
- Review filters have labels.
- Status timeline uses labels and icons.

## Motion

- `BALANCED_MOTION`
- Status updates can highlight once.
- Avoid aggressive animations around disputes.

## Common Mistakes

- Star-only rating.
- Dispute path hard to find.
- No status timeline after report.

## Acceptance Criteria

- Trust and resolution information are readable and actionable.

## Task Seed

- Build reviews/disputes with rating summary, filters, dispute form, status timeline, and support states.

