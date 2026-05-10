# CRM-UI05 Activity Timeline

## Identity

- Design code: `CRM-UI05`
- Business: CRM
- View: activity timeline
- Style: chronological relationship history

## Core Pattern

```text
filters
timeline events
event type icons
notes
attachments
quick actions
```

## Required Sections

- event type filters;
- timeline grouped by date;
- note composer;
- attachment list;
- quick follow-up action;
- export or share if needed.

## Component Contracts

- `ActivityFilterBar`
- `TimelineGroup`
- `TimelineItem`
- `EventTypeIcon`
- `NoteComposer`
- `AttachmentList`

## States

- no activity;
- loading more;
- note saving;
- failed note;
- permission hidden activity.

## Design Rules

- Activity type must be clear.
- Timeline should be scanable by date and actor.
- Sensitive events follow permission rules.

## Motion

- `BALANCED_MOTION`
- New event can highlight once.
- Infinite animated loaders should be avoided.

## Task Seed

- Build activity timeline with filters, notes, attachments, and permission-aware states.

