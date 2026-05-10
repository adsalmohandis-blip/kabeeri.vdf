# CRUD Page Recipe

Use for index/list pages that manage records.

## Required Sections

1. Page header with title, short subtitle, and Create action.
2. Search and filter toolbar.
3. Responsive table or grid.
4. Row actions: View, Edit, Delete.
5. Pagination or virtualization when needed.
6. Loading, empty, error, success, and action-in-progress states.

## Acceptance Criteria

- Create action uses Add/Create icon.
- Search input uses Search icon or accessible label.
- Delete uses danger style and confirm modal/dialog.
- Table has responsive behavior.
- Empty state includes icon, title, copy, and primary action.
- Error state uses alert/callout with retry action.
- No raw colors inside components.

## Variation Hooks

Vary these from project answers:

- table density;
- toolbar placement;
- filters as inline controls, drawer, or popover;
- row details as page, drawer, or modal;
- empty-state tone and icon;
- KPI summary above table when useful.
