# DASH-UI05 Self-Service Insights

## Identity

- Design code: `DASH-UI05`
- Business: dashboard
- View: self-service insights
- Style: approachable exploration dashboard for non-technical users

## Core Pattern

```text
plain-language questions
guided filters
insight cards
charts
save/share
```

## Required Sections

- question or goal selector;
- guided filters;
- insight cards;
- charts;
- saved views;
- share/export actions.

## Component Contracts

- `QuestionSelector`
- `GuidedFilter`
- `InsightCard`
- `ChartCard`
- `SavedViewMenu`
- `ShareButton`

## States

- first run;
- empty insight;
- filter no-results;
- saved view;
- share success.

## Design Rules

- Use plain-language labels.
- Avoid analytics jargon unless explained.
- Keep next action visible.

## Motion

- `BALANCED_MOTION`
- Insight cards can fade in.
- Avoid motion that implies data changed when it did not.

## Task Seed

- Build self-service dashboard with guided filters, insights, saved views, and share/export states.

