# DELV-UI05 Admin Monitoring

## Identity

- Design code: `DELV-UI05`
- Business: delivery
- View: admin monitoring dashboard
- Style: operations dashboard with exceptions and live status
- Dashboard reference: `ADMIT-ADB02`

## Layout Anatomy

```text
operations KPIs
map/status overview
exception queue
driver/store status
reports
```

## UX Goals

- Monitor delivery health.
- Surface exceptions.
- Support quick intervention.

## Required Components

- `OperationsKpi`
- `MonitoringMap`
- `ExceptionQueue`
- `DriverStatusTable`
- `StoreStatusTable`
- `ReportExport`

## Required States

- normal;
- delayed;
- incident;
- stale data;
- failed refresh;
- permission denied.

## Data Requirements

- active orders;
- delayed count;
- driver/store statuses;
- incidents;
- SLA metrics.

## Accessibility

- Map has table/list fallback.
- Incidents use labels and icons.
- Refresh status is visible.

## Motion

- `BALANCED_MOTION`
- Updates can highlight.
- Avoid constant animation across maps and tables.

## Common Mistakes

- Dashboard with map only and no exception list.
- No stale data state.
- Too many colors without meaning.

## Acceptance Criteria

- Operations team can identify exceptions and act quickly.

## Task Seed

- Build delivery admin monitoring with KPIs, exceptions, driver/store status, map fallback, and refresh states.

