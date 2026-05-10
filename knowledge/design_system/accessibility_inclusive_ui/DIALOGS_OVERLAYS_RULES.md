# Dialogs And Overlay Rules

## Modals And Dialogs

- Dialogs need a clear title.
- Focus moves into the dialog when opened.
- Focus is contained while modal dialog is active.
- Escape closes dismissible dialogs.
- Closing returns focus to the opener.
- Destructive dialogs explain consequence and offer safe cancel.

## Drawers

- Drawers must define whether they are modal or non-modal.
- Navigation drawers should not trap focus unless modal.
- Form drawers should preserve unsaved changes or warn before close.

## Popovers, Tooltips, Dropdowns

- Tooltips should not contain essential interactive content.
- Dropdowns and menus must support keyboard navigation.
- Popovers need dismissal behavior and focus policy.
- Hover-only access is not acceptable for essential content.

