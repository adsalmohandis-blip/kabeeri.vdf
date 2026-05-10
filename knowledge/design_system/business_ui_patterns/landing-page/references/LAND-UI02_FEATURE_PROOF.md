# LAND-UI02 Feature Proof

## Identity

- Design code: `LAND-UI02`
- Business: landing-page
- View: benefits and proof section
- Style: benefit-led feature explanation

## Layout Anatomy

```text
section title
benefit cards
feature evidence
metric or quote
CTA bridge
```

## UX Goals

- Translate features into outcomes.
- Reduce skepticism with proof.
- Keep section scanable.

## Required Components

- `BenefitCard`
- `FeatureList`
- `MetricProof`
- `QuoteProof`
- `CTAButton`

## Required States

- default;
- missing proof fallback;
- responsive stacked layout.

## Data Requirements

- benefit title;
- benefit description;
- proof metric or customer quote;
- supporting feature.

## Accessibility

- Cards have semantic headings.
- Icons do not replace text.
- Quotes identify source when available.

## Motion

- `EXPRESSIVE_MOTION`
- Staggered card reveal is allowed.
- Avoid motion that makes content slower to read.

## Common Mistakes

- Listing features without outcomes.
- Too many equal-weight cards.
- Fake metrics without context.

## Acceptance Criteria

- Each feature maps to a user benefit.
- Proof exists or is intentionally deferred.

## Task Seed

- Build feature proof section with benefit cards, proof metric, quote, CTA bridge, and responsive states.

