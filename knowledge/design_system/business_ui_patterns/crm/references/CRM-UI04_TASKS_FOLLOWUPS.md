# CRM-UI04 Tasks Followups

## Identity

- Design code: `CRM-UI04`
- Business: CRM
- View: tasks and follow-ups
- Style: action-first task management

## Core Pattern

```text
task filters
today/overdue groups
task cards or table
quick complete
linked customer/deal
```

## Required Sections

- due date filters;
- owner filter;
- overdue and today groups;
- quick complete action;
- linked contact or deal;
- create follow-up action.

## Component Contracts

- `TaskFilterBar`
- `TaskGroup`
- `TaskItem`
- `DueBadge`
- `CompleteButton`
- `QuickAddTask`

## States

- overdue;
- due today;
- completed;
- empty;
- save failed;
- recurring task.

## Design Rules

- Due state is text plus color/icon.
- Complete action should be quick but undoable where possible.
- Linked record is visible.

## Motion

- `BALANCED_MOTION`
- Completion can use subtle check feedback.
- Avoid distracting celebration.

## Task Seed

- Build CRM tasks view with groups, quick complete, follow-up creation, and states.

