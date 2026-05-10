# ADMIT-ADB02 Dasher E-commerce Dashboard

## Identity

- Design code: `ADMIT-ADB02`
- Category: admin dashboard
- Style: clean light multi-module admin dashboard
- Use: e-commerce, CRM, analytics, finance, blog, project management
- Copy policy: inspiration only

## Core Pattern

Use a data-driven sidebar with nested groups and a global top navbar.

Recommended navigation groups:

- Dashboards
- Apps
- Commerce
- Projects
- CRM
- Finance / Invoices
- Profile
- Blog
- Pages
- Authentication
- Components

Navigation must be config-driven, not repeated markup.

## Dashboard Overview

For e-commerce, include:

- welcome panel;
- ideas or suggestions panel;
- KPI cards;
- revenue chart;
- product sales breakdown;
- orders table;
- revenue by location;
- sales by segment;
- top selling products table.

## Global Components

- notification dropdown with tabs;
- profile menu;
- theme toggle for light/dark/auto;
- command palette or quick search;
- breadcrumbs;
- page header.

## Design Rules

- Use light neutral background and white cards.
- Support dark and auto modes through tokens.
- Tables must support search, filters, sorting, pagination, row actions, and states.
- Segment labels must be configurable and not hardcoded to one business type.
- Mobile tables should become horizontal scroll or compact cards.
- RTL and Arabic support are required.

## Task Seed

- Create Dasher-inspired tokens.
- Create app shell, sidebar config, topbar, notifications, profile menu, theme toggle.
- Create e-commerce overview sections.
- Add loading, empty, error, permission, and no-results states.
- Add responsive and RTL checks.
