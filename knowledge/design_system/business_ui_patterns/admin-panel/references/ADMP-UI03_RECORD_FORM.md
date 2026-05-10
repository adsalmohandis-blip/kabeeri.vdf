# ADMP-UI03 Record Form

## Identity

- Design code: `ADMP-UI03`
- Business: admin panel
- View: create/edit form
- Style: grouped form sections with validation

## Core Pattern

```text
page header
form sections
helper text
validation messages
save/cancel actions
success feedback
```

## Required Sections

- form title and context;
- grouped fields;
- visible labels;
- helper and error text;
- sticky or clear save actions;
- success toast or alert.

## Component Contracts

- `FormCard`
- `FormSection`
- `InputField`
- `SelectField`
- `ValidationMessage`
- `SaveButton`
- `CancelButton`

## States

- pristine;
- dirty;
- validating;
- saving;
- validation error;
- save success;
- save failure.

## Design Rules

- Every input has a visible label.
- Cancel action is secondary.
- Save action disables during submission.

## Motion

- `MINIMAL_MOTION`
- Validation can appear with a short fade.
- Do not move focus unexpectedly.

## Task Seed

- Build record form with grouped fields, validation, dirty/saving states, and success/error feedback.

