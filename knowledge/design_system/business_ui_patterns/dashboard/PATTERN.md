# Dashboard UI Pattern Pack

Use this pack for analytics dashboards, executive overviews, operational monitors, and reporting surfaces.

## Design Posture

- Priority: scanability, decision support, filter clarity.
- Density: balanced or compact depending on operational urgency.
- Motion: `BALANCED_MOTION`, but dense dashboards may drop to `MINIMAL_MOTION`.
- Dashboard reference: `ADMIT-ADB01` for dark governance and executive monitoring; use `ADMIT-ADB02` for commerce analytics.

## Required Views

- Overview
- KPI band
- Chart cards
- Data table or recent activity
- Alerts and anomalies

## Required Flows

- `CRUD_FLOW.md` when dashboard has operational records.

## Creative Axes

- KPI hierarchy
- Chart grouping
- Alert intensity
- Filter persistence
- Insight callout style

## Acceptance Criteria

- Every chart has title, time period, and empty/loading/error states.
- Filters are visible and persistent.
- Metrics are not all visually equal when importance differs.
- Dashboard explains what changed or what needs action.

