# SAAS-UI01 Product Dashboard

## Identity

- Design code: `SAAS-UI01`
- Business: SaaS
- View: logged-in product dashboard
- Style: clean workspace dashboard with activation and usage context
- Dashboard reference: `ADMIT-ADB05`

## Core Pattern

```text
app shell
workspace header
activation or KPI cards
usage card
recent activity
recommended next action
```

## Required Sections

- workspace switcher or account context;
- page header with primary action;
- setup or activation checklist;
- KPI or usage cards;
- recent activity;
- empty state for first-run users.

## Component Contracts

- `AppShell`
- `WorkspaceSwitcher`
- `SetupChecklist`
- `UsageCard`
- `ActivityTimeline`
- `PrimaryAction`

## States

- first run;
- trial;
- active subscription;
- near usage limit;
- loading;
- error.

## Design Rules

- First screen must tell the user what to do next.
- Do not fill first-run dashboards with empty charts.
- Keep upgrade and billing cues visible but not aggressive.

## Motion

- `BALANCED_MOTION`
- Onboarding progress can animate subtly.
- Usage warnings must not rely on motion.

## Task Seed

- Build SaaS dashboard using setup checklist and usage card templates.
- Add first-run, active, usage-limit, and error states.

