# ADMP-UI05 Audit Activity

## Identity

- Design code: `ADMP-UI05`
- Business: admin panel
- View: audit log and activity monitoring
- Style: timestamped operational history

## Core Pattern

```text
filters
activity stream
actor/action/resource
severity badges
detail drawer
export
```

## Required Sections

- date and actor filters;
- severity filter;
- activity timeline or table;
- detail drawer;
- export action;
- empty and error states.

## Component Contracts

- `AuditFilterBar`
- `ActivityTimeline`
- `AuditTable`
- `SeverityBadge`
- `DetailDrawer`
- `ExportButton`

## States

- loading;
- empty;
- filtered empty;
- export pending;
- permission denied;
- retention notice.

## Design Rules

- Actor, action, resource, and timestamp must be visible.
- Severe events require icon plus label.
- Export action follows data governance rules.

## Motion

- `MINIMAL_MOTION`
- Drawer can transition.
- Avoid looping alert animation.

## Task Seed

- Build audit activity screen with filters, timeline/table, detail drawer, export, and permission states.

