# ADMP-UI04 Permission Management

## Identity

- Design code: `ADMP-UI04`
- Business: admin panel
- View: roles, permissions, access control
- Style: careful role management with audit clarity

## Core Pattern

```text
role list
permission matrix
impact summary
change confirmation
audit trail
```

## Required Sections

- roles table;
- permission matrix;
- affected users;
- change summary;
- confirmation modal;
- audit history.

## Component Contracts

- `RoleTable`
- `PermissionMatrix`
- `ImpactSummary`
- `ConfirmModal`
- `AuditLog`
- `StatusBadge`

## States

- inherited permission;
- custom permission;
- conflict;
- pending save;
- permission denied;
- audit loading.

## Design Rules

- Permission language must be understandable.
- High-risk permission changes require confirmation.
- Do not rely on color alone for granted/denied.

## Motion

- `MINIMAL_MOTION`
- Matrix changes can highlight briefly.
- No celebratory motion for permission changes.

## Task Seed

- Build permissions screen with matrix, impact summary, confirmation, and audit log.

