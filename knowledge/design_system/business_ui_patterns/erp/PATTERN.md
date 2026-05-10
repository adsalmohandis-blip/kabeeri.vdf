# ERP UI Pattern Pack

Use this pack for finance, inventory, purchasing, approvals, HR, accounting, and multi-module enterprise operations.

## Design Posture

- Priority: accuracy, traceability, density, permission clarity.
- Density: compact and readable.
- Motion: `MINIMAL_MOTION`.
- Dashboard reference: `ADMIT-ADB04` for billing and enterprise records; `ADMIT-ADB03` for app shell.

## Required Views

- Module dashboard
- Dense records table
- Record detail
- Create/edit workflow
- Approval queue
- Reports

## Required Flows

- `CRUD_FLOW.md`
- `DELETE_CONFIRMATION_FLOW.md`
- `USER_MANAGEMENT_FLOW.md`

## Creative Axes

- Table density
- Approval visibility
- Module navigation shape
- Detail drawer versus split view
- Audit emphasis

## Acceptance Criteria

- Record status, permission state, and audit information are visible when relevant.
- Tables support filters, column visibility, pagination or virtualization, and export.
- Approval flows show current step, owner, and consequence.
- Decorative motion is absent from dense screens.

