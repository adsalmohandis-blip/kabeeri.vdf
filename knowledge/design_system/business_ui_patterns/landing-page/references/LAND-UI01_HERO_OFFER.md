# LAND-UI01 Hero Offer

## Identity

- Design code: `LAND-UI01`
- Business: landing-page
- View: hero section
- Style: first-viewport offer with product signal and focused CTA

## Layout Anatomy

```text
nav
hero media/background
headline
supporting copy
primary/secondary CTA
proof strip
next section hint
```

## UX Goals

- Communicate the exact offer immediately.
- Show who the page is for.
- Give one clear next action.
- Build enough confidence to keep scrolling.

## Required Components

- `HeroSection`
- `PrimaryCTA`
- `SecondaryCTA`
- `ProofStrip`
- `HeroMedia`
- `Navigation`

## Required States

- default;
- CTA loading;
- form validation when inline signup exists;
- media fallback.

## Data Requirements

- offer name;
- target audience;
- value proposition;
- proof points;
- CTA labels and destinations.

## Accessibility

- H1 is literal and unique.
- Hero media has alt text or is decorative.
- CTA buttons have clear labels.
- Text contrast works over media.

## Motion

- `EXPRESSIVE_MOTION`
- Hero entrance is allowed if content is not delayed.
- Avoid animated backgrounds that reduce readability.

## Common Mistakes

- Abstract headline with no offer.
- CTA hidden below decorative content.
- Split-card hero that looks like a generic SaaS template.

## Acceptance Criteria

- User understands the offer in five seconds.
- Primary CTA is visible without scrolling.
- First viewport hints at the next section.

## Task Seed

- Build hero with product signal, clear H1, proof strip, primary CTA, media fallback, and responsive/RTL behavior.

