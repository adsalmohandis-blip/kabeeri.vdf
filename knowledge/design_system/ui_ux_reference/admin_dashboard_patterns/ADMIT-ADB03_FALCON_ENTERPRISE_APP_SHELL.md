# ADMIT-ADB03 Falcon Enterprise App Shell

## Identity

- Design code: `ADMIT-ADB03`
- Category: enterprise admin application
- Style: modular admin theme, configurable navigation, medium-high density
- Use: SaaS, CRM, e-commerce, analytics, project management, support desk
- Copy policy: inspiration only

## Core Pattern

This reference is best when the product is more than one dashboard page. It defines a scalable app shell with configurable navigation modes:

- vertical navigation;
- top navigation;
- combo navigation;
- double top navigation.

The route map must power all navigation modes.

## Required Shell Features

- vertical sidebar;
- top navbar;
- settings/customizer panel;
- command palette or global search;
- notification dropdown;
- user profile menu;
- theme selector;
- language/direction controls;
- fluid/fixed layout option.

## Supported Page Families

- dashboards;
- analytics;
- CRM;
- e-commerce;
- project management;
- SaaS;
- support desk;
- calendar, chat, email, kanban, file manager;
- authentication;
- profile/settings;
- pricing/FAQ/error pages;
- components, forms, tables, charts, maps, utilities.

## Kabeeri Mapping

- Weekly Sales -> Weekly Tasks Completed
- Total Order -> Total Tasks / Issues
- Market Share -> Workstream Distribution
- Running Projects -> Active Sprints / Active Tasks
- Storage Usage -> AI Token Budget Usage
- Best Selling Products -> Highest Value Features / Most Expensive Tasks
- Shared Files -> Recent Reports / Design Sources / AI Outputs
- Active Users -> Developers / AI Agents
- Weather -> System Health / GitHub Sync / Production Status

## Design Rules

- Use tokens only.
- Keep navigation data-driven.
- Build reusable components before page screens.
- Support light/dark/auto, RTL/LTR, and fluid/fixed layouts.
- Every table and form must include states and accessibility.

## Task Seed

- Create Falcon-inspired tokens.
- Create app shell, navigation config, sidebar, topbar, settings panel.
- Create dashboard overview widgets.
- Create reusable DataTable and form patterns.
- Add responsive, RTL, and visual QA.
