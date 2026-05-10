# LAND-UI04 Social Proof

## Identity

- Design code: `LAND-UI04`
- Business: landing-page
- View: testimonials, logos, case proof
- Style: credibility section with real proof hierarchy

## Layout Anatomy

```text
logo strip
testimonial cards
case metric
trust badges
CTA continuation
```

## UX Goals

- Build trust before conversion.
- Show relevance to the target audience.
- Make claims feel credible.

## Required Components

- `LogoStrip`
- `TestimonialCard`
- `CaseMetric`
- `TrustBadge`
- `CTAButton`

## Required States

- no logos;
- carousel disabled;
- testimonial fallback;
- responsive layout.

## Data Requirements

- customer name or role;
- quote;
- company/logo;
- measurable result.

## Accessibility

- Logos have accessible names when meaningful.
- Carousel controls are keyboard accessible if used.
- Quotes are readable as plain text.

## Motion

- `EXPRESSIVE_MOTION`
- Testimonial carousel transition may be used.
- Avoid auto-rotating content that cannot be paused.

## Common Mistakes

- Anonymous fake-looking quotes.
- Logo wall with no relevance.
- Proof placed after final CTA only.

## Acceptance Criteria

- Proof supports the offer.
- Motion does not prevent reading.

## Task Seed

- Build social proof section with logo strip, testimonial cards, case metric, and accessible carousel behavior if needed.

