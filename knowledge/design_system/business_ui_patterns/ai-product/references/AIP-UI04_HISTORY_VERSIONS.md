# AIP-UI04 History Versions

## Identity

- Design code: `AIP-UI04`
- Business: AI product
- View: history, saved outputs, versions
- Style: recoverable generation history

## Core Pattern

```text
history list
filters
version preview
restore/copy
metadata
delete confirmation
```

## Required Sections

- history list;
- filters by type/date/status;
- preview panel;
- version metadata;
- copy/restore actions;
- delete confirmation.

## Component Contracts

- `HistoryList`
- `HistoryFilter`
- `VersionPreview`
- `MetadataPanel`
- `RestoreButton`
- `DeleteConfirmModal`

## States

- empty history;
- saved;
- restored;
- deleted;
- permission denied;
- loading more.

## Design Rules

- Users can recover previous outputs.
- Delete uses confirmation.
- Metadata should not clutter the reading surface.

## Motion

- `BALANCED_MOTION`
- Restore success can toast.
- Delete stays calm and explicit.

## Task Seed

- Build history and versions screen with filters, preview, restore, copy, delete, and empty states.

