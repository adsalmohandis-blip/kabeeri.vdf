# SAAS-UI04 Team Workspace

## Identity

- Design code: `SAAS-UI04`
- Business: SaaS
- View: team, roles, permissions, invitations
- Style: approachable permissions management

## Core Pattern

```text
team table
invite action
role badges
permission summary
pending invitations
danger zone
```

## Required Sections

- members table;
- invite user flow;
- role and status badges;
- pending invites;
- permission summary;
- remove/deactivate confirmation.

## Component Contracts

- `MembersTable`
- `InviteUserModal`
- `RoleSelect`
- `StatusBadge`
- `PermissionSummary`
- `DangerZone`

## States

- pending invite;
- active member;
- suspended member;
- role conflict;
- invite failed;
- permission denied.

## Design Rules

- Role changes communicate impact.
- Removing or deactivating users requires confirmation.
- Pending invites are visually distinct.

## Motion

- `BALANCED_MOTION`
- Invite success can toast.
- Role changes should not use distracting animation.

## Task Seed

- Build team workspace with invite, role management, pending invites, and confirmation states.

