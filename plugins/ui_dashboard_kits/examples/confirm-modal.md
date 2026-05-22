# Confirm Modal Recipe

Use for destructive or irreversible actions.

## Required Elements

1. Modal/dialog title with warning icon.
2. Clear consequence text.
3. Optional affected item name.
4. Cancel action.
5. Destructive confirm action.

## Acceptance Criteria

- Confirm action uses danger/destructive style.
- Cancel action is visually secondary.
- Modal has accessible title.
- Focus management follows the selected UI foundation.
- Action-in-progress state prevents double submit.

## Variation Hooks

Vary these from risk level:

- simple confirm for low-risk delete;
- typed confirmation for high-risk destructive actions;
- warning checklist for irreversible actions;
- permission message when user cannot confirm.
