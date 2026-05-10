# REST-UI02 Property Details

## Identity

- Design code: `REST-UI02`
- Business: real-estate
- View: property detail
- Style: immersive gallery plus facts and contact CTA

## Layout Anatomy

```text
gallery
price/location
features
description
map
agent/contact
similar properties
```

## UX Goals

- Let users inspect the property.
- Make price and location clear.
- Encourage contact or viewing booking.

## Required Components

- `PropertyGallery`
- `PriceLocationHeader`
- `FeatureGrid`
- `DescriptionBlock`
- `MapEmbed`
- `AgentContactCard`
- `SimilarProperties`

## Required States

- available;
- sold/rented;
- gallery loading;
- map unavailable;
- contact submitted.

## Data Requirements

- photos;
- price;
- address;
- features;
- description;
- agent;
- availability.

## Accessibility

- Gallery controls keyboard accessible.
- Map has address fallback.
- Contact form labels are visible.

## Motion

- `BALANCED_MOTION`
- Gallery transition allowed.
- Do not obscure photos with decorative effects.

## Common Mistakes

- Contact CTA hidden.
- Floor plan or map inaccessible.
- Overlaid text reducing photo inspection.

## Acceptance Criteria

- User can inspect photos, price, features, map, and contact agent.

## Task Seed

- Build property detail with gallery, facts, map fallback, agent contact, and availability states.

