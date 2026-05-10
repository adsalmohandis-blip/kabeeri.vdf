# ECOM-UI05 Merchant Admin

## Identity

- Design code: `ECOM-UI05`
- Business: e-commerce
- View: merchant product and order admin
- Style: commerce backoffice with data density
- Dashboard reference: `ADMIT-ADB02`
- Copy policy: inspiration only

## Core Pattern

```text
admin app shell
commerce KPIs
orders table
product table
inventory alerts
sales chart
quick actions
```

## Required Sections

- revenue and order KPIs;
- orders needing attention;
- inventory alerts;
- product CRUD table;
- sales by channel or category;
- quick create product/order actions.

## Component Contracts

- `CommerceDashboard`
- `MetricCard`
- `OrdersTable`
- `ProductTable`
- `InventoryAlert`
- `RevenueChart`
- `QuickActionButton`

## States

- empty product catalog;
- no orders;
- low stock;
- failed sync;
- permission denied;
- export in progress.

## Design Rules

- Operational screens use compact density.
- Tables include search, filters, sorting, pagination, row actions, and bulk actions.
- Product status and stock are badge-driven.

## Motion

- `BALANCED_MOTION`
- Admin table updates use minimal highlight.
- Avoid decorative motion in operational order handling.

## Task Seed

- Build merchant admin using `ADMIT-ADB02` as the dashboard reference.
- Include product CRUD, orders table, KPIs, alerts, and states.

