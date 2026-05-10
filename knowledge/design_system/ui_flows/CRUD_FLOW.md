# CRUD Flow

Use for list, create, view, edit, archive, and delete operations.

Steps:

1. List records with search, filters, sorting, pagination or virtualization.
2. Provide a clear primary create action.
3. Support row actions: View, Edit, Delete or Archive.
4. Use forms with labels, validation, helper text, save/cancel actions, and disabled submission state.
5. Return to the list or detail view with success feedback.

Required states:

- Loading
- Empty
- Error
- Form validation
- Save in progress
- Success feedback

Rules:

- Destructive actions must use the delete confirmation flow.
- Tables must remain responsive.
- Status values should use badges.

