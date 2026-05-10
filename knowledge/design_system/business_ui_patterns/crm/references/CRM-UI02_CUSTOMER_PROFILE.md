# CRM-UI02 Customer Profile

## Identity

- Design code: `CRM-UI02`
- Business: CRM
- View: customer or account profile
- Style: relationship context with activity and next action

## Core Pattern

```text
profile summary
relationship status
next action
activity timeline
notes/tasks
related deals
```

## Required Sections

- profile header;
- contact details;
- relationship status and owner;
- next task/action;
- activity timeline;
- notes and attachments;
- related deals or tickets.

## Component Contracts

- `CustomerHeader`
- `ContactCard`
- `NextActionPanel`
- `ActivityTimeline`
- `TaskList`
- `DealList`
- `NoteComposer`

## States

- no activity;
- overdue task;
- note saving;
- attachment upload;
- permission-limited profile.

## Design Rules

- Important customer context appears before raw history.
- Timeline is filterable and scanable.
- Notes and tasks should not compete visually.

## Motion

- `BALANCED_MOTION`
- New timeline item can highlight once.
- Avoid heavy transitions on profile pages.

## Task Seed

- Build profile page with summary, next action, activity, notes, tasks, and related deals.

