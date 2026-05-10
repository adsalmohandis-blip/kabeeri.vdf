# ADMP-UI01 Admin App Shell

## Identity

- Design code: `ADMP-UI01`
- Business: admin panel
- View: global app shell
- Style: stable sidebar and topbar for repeat operations
- Dashboard reference: `ADMIT-ADB03`

## Core Pattern

```text
sidebar navigation
topbar with search and profile
breadcrumb/page header
content outlet
notification and quick actions
```

## Required Sections

- configurable sidebar;
- topbar search;
- breadcrumbs;
- page title and description;
- user menu;
- notifications;
- responsive mobile drawer.

## Component Contracts

- `AdminShell`
- `SidebarNav`
- `Topbar`
- `Breadcrumbs`
- `CommandSearch`
- `NotificationMenu`
- `UserMenu`

## States

- collapsed sidebar;
- active navigation;
- permission-hidden item;
- mobile drawer;
- loading page shell.

## Design Rules

- Navigation is config-driven.
- Role-restricted items are hidden or disabled consistently.
- App shell must support RTL.

## Motion

- `MINIMAL_MOTION`
- Sidebar open/close can transition.
- Avoid page-wide animation.

## Task Seed

- Build admin shell with config navigation, topbar, breadcrumbs, notifications, RTL, and responsive drawer.

