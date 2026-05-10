# ADMIT-ADB05 Material Shadcn Dashboard

## Identity

- Design code: `ADMIT-ADB05`
- Category: minimal SaaS admin dashboard
- Style: light gray shell, white cards, subtle borders, dark active sidebar
- Use: simple admin analytics, project overview, internal SaaS dashboards
- Copy policy: inspiration only

## Core Pattern

Use:

- fixed or sticky left sidebar;
- wide main content area;
- hero card;
- statistic cards;
- projects table;
- compact typography;
- lucide-style outline icons;
- shadcn/Radix-like component behavior.

## Visual Rules

- Background is very light gray.
- Cards are white with subtle borders.
- Shadows are very soft.
- Active sidebar item is dark with stronger shadow.
- Use mostly neutral colors, with minimal blue/green/red accents.
- Avoid heavy gradients, saturated palettes, and decorative clutter.

## Required Components

- `AppLayout`
- `Sidebar`
- `SidebarSection`
- `NavItem`
- `HeroCard`
- `StatsGrid`
- `StatCard`
- `MiniBarChart`
- `ProjectsTable`
- `AvatarGroup`
- `ProgressBar`
- `IconButton`

## Responsive Rules

- Desktop: sidebar visible, stats in four columns.
- Tablet: stats in two columns.
- Mobile: sidebar becomes drawer/top menu, stats stack, table scrolls horizontally.

## Task Seed

- Create minimal neutral tokens.
- Build sidebar, hero card, stats grid, projects table.
- Add responsive behavior and accessible controls.
- Verify shadows, spacing, typography, and table readability.
