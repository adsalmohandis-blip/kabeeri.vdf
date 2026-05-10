# Delete Confirmation Flow

Use for destructive actions, irreversible changes, or high-risk state changes.

Steps:

1. Trigger delete from a clearly labeled danger action.
2. Show a modal or confirmation screen with item identity.
3. Explain consequence in plain language.
4. Require explicit confirm action.
5. Show loading while deleting.
6. Show success, error, or undo option when appropriate.

Required states:

- Confirmation
- Deleting
- Success
- Error

Rules:

- Delete buttons use danger styling and trash icon.
- Cancel remains visually secondary.
- Never use playful or bouncy motion for destructive actions.

