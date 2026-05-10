# Admin Panel UI Pattern Pack

Use this pack for internal admin systems, backoffice tools, moderation consoles, CMS admin, and operational management.

## Design Posture

- Priority: operator speed, safe data changes, clear state.
- Density: compact to balanced.
- Motion: `MINIMAL_MOTION`.
- Dashboard reference: `ADMIT-ADB03` for enterprise app shell and navigation.

## Required Views

- Dashboard overview
- CRUD list
- Record detail
- Create/edit form
- Audit or activity surface

## Required Flows

- `CRUD_FLOW.md`
- `DELETE_CONFIRMATION_FLOW.md`
- `USER_MANAGEMENT_FLOW.md`

## Creative Axes

- Admin shell style
- Table density
- Filter placement
- Detail drawer versus detail page
- Role visibility

## Acceptance Criteria

- Tables include search, filters, responsive wrapper, pagination, empty, loading, and error states.
- Destructive actions use confirmation.
- Bulk actions are clear and reversible when possible.
- Permissions and status are visible where decisions depend on them.

