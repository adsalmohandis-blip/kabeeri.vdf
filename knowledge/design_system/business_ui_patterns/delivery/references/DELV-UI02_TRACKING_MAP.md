# DELV-UI02 Tracking Map

## Identity

- Design code: `DELV-UI02`
- Business: delivery
- View: tracking map
- Style: map plus status timeline

## Layout Anatomy

```text
map
driver marker
ETA panel
timeline
delivery details
support
```

## UX Goals

- Show location when useful.
- Keep ETA and status readable without relying on map.
- Avoid overloading the map.

## Required Components

- `TrackingMap`
- `DriverMarker`
- `EtaPanel`
- `StatusTimeline`
- `DeliveryDetails`
- `SupportButton`

## Required States

- driver assigned;
- location unavailable;
- delayed;
- arrived;
- delivered;
- map error.

## Data Requirements

- driver location;
- route;
- ETA;
- address;
- status;
- contact policy.

## Accessibility

- Map has text fallback.
- Location unavailable state is explicit.
- Critical status is outside the map.

## Motion

- `BALANCED_MOTION`
- Marker movement can be smooth.
- Avoid excessive map animation.

## Common Mistakes

- Status only inside map.
- No fallback when location fails.
- Distracting marker effects.

## Acceptance Criteria

- User can understand delivery progress even if map fails.

## Task Seed

- Build tracking map with ETA, timeline, text fallback, map error, delayed, and delivered states.

