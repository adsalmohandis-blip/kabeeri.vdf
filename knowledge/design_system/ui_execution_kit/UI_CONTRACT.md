# Kabeeri UI Contract

Use the approved UI stack. Do not design from scratch when an approved foundation, component, or recipe already exists.

## Required Inputs

Before UI implementation, identify:

- product type;
- target users and roles;
- selected UI foundation;
- selected color palette or brand tokens;
- required pages;
- required data states;
- RTL/LTR and language behavior;
- density level: comfortable, balanced, or compact;
- visual personality: calm, editorial, operational, premium, playful, clinical, or enterprise.

## Page Structure

Every data-driven page should define:

1. page header with title, subtitle, and primary action when relevant;
2. toolbar for search, filters, date ranges, or bulk actions when relevant;
3. main content surface: card, table, grid, chart, form, or workflow stepper;
4. loading state;
5. empty state;
6. error state;
7. success feedback;
8. disabled/action-in-progress behavior.

## Non-Negotiable Rules

- Use tokens/classes from the approved UI foundation.
- Do not use raw hex colors inside page components.
- Do not create custom buttons, cards, modals, alerts, badges, tables, or forms when the approved foundation provides them.
- Every user-facing action button must include an icon unless the chosen design system explicitly forbids it.
- Icon appears before the label in LTR and after the label when RTL design requires it.
- Destructive actions use the semantic danger variant.
- Forms require visible labels.
- Tables require responsive behavior and empty/error states.
- Icon-only buttons require `aria-label` and tooltip or visible affordance.
- Actions use buttons. Navigation uses links.

## No Naked Text

Do not place standalone action or status text without visual structure.

Use:

- button for actions;
- badge/tag for statuses;
- alert/callout for important messages;
- card/section for grouped content;
- table/grid for comparable rows;
- empty state for zero data;
- toast/snackbar for temporary feedback.

## Naming

Use consistent action labels:

- Create
- Add
- Edit
- Delete
- Save
- Cancel
- Search
- Filter
- Refresh
- Export
- Import
- View
- Download
- Upload
- Settings

Do not invent synonyms unless the product language requires them.
