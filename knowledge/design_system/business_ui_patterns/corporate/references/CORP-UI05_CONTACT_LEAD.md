# CORP-UI05 Contact Lead

## Identity

- Design code: `CORP-UI05`
- Business: corporate
- View: contact and lead inquiry
- Style: clear form plus routing information

## Layout Anatomy

```text
contact header
lead form
contact details
locations
expectation copy
success state
```

## UX Goals

- Make contacting easy.
- Set response expectations.
- Route inquiries correctly.

## Required Components

- `LeadForm`
- `ContactDetails`
- `LocationCard`
- `ResponseExpectation`
- `SuccessState`

## Required States

- form idle;
- validation error;
- submitting;
- success;
- server error.

## Data Requirements

- form fields;
- contact channels;
- locations;
- privacy copy;
- response SLA.

## Accessibility

- Every field has visible label.
- Error messages are close to fields.
- Form success is announced clearly.

## Motion

- `BALANCED_MOTION`
- Form success can fade in.
- Do not move focus unexpectedly.

## Common Mistakes

- Too many required fields.
- No response expectation.
- Contact info hidden below form only.

## Acceptance Criteria

- Contact flow has validation, loading, success, and error states.

## Task Seed

- Build contact page with lead form, contact info, locations, expectations, and complete form states.

