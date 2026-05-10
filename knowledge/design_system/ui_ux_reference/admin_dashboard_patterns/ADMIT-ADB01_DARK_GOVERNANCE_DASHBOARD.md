# ADMIT-ADB01 Dark Governance Dashboard

## Identity

- Design code: `ADMIT-ADB01`
- Category: admin dashboard
- Style: dark navy app shell with data cards
- Use: Kabeeri-like monitoring, governance, task tracking, AI cost, owner verification
- Copy policy: inspiration only, no copied source, assets, branding, or pixel-perfect layout

## Core Pattern

Use a stable app shell:

```text
dark top navbar
dark vertical sidebar
main content area
cards, charts, tables, verification queues
```

## Required Sections

- page header with title, description, breadcrumb, date range, action;
- KPI cards for tasks, blockers, cost, readiness, sprint progress;
- analytics chart for tokens, cost, completed tasks, accepted/rejected runs;
- task progress panel;
- developer or AI agent status list;
- AI token cost summary;
- owner verification queue;
- recent activity and quick actions.

## Component Contracts

Use reusable components:

- `AppShell`
- `SidebarNav`
- `TopNavbar`
- `PageHeader`
- `StatCard`
- `ChartCard`
- `DataTable`
- `StatusBadge`
- `TaskProgressPanel`
- `CostSummaryCard`
- `OwnerVerifyQueue`
- `DeveloperStatusItem`
- `NotificationDropdown`
- `LanguageSwitcher`
- `ThemeToggle`

## Design Rules

- Sidebar and topbar use dark navy tokens.
- Main background is soft neutral.
- Cards are white or surface tokens.
- Owner-only actions must be visually and logically protected.
- Do not use random colors outside tokens.
- Every widget needs loading, empty, error, and permission states.
- RTL support is required.

## Task Seed

- Create dashboard design tokens.
- Build app shell, dark sidebar, and dark topbar.
- Build KPI cards, task progress, AI cost summary, developer status, owner queue.
- Add responsive and RTL behavior.
- Run visual acceptance checklist.
