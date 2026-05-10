# CORP-UI02 Services Page

## Identity

- Design code: `CORP-UI02`
- Business: corporate
- View: services
- Style: structured service explanation

## Layout Anatomy

```text
service header
service categories
details
process
proof
CTA
```

## UX Goals

- Make services comparable.
- Explain process and outcomes.
- Route qualified leads.

## Required Components

- `ServiceCard`
- `ProcessSteps`
- `OutcomeList`
- `ProofCallout`
- `InquiryCTA`

## Required States

- default;
- empty service category;
- inquiry form state.

## Data Requirements

- service names;
- descriptions;
- outcomes;
- process steps;
- proof examples.

## Accessibility

- Cards use headings.
- Process steps have text labels.
- CTA is keyboard accessible.

## Motion

- `EXPRESSIVE_MOTION`
- Process step reveal can be used.
- Do not animate essential service terms too much.

## Common Mistakes

- Services listed without outcomes.
- No next step after service detail.
- Overly decorative icons.

## Acceptance Criteria

- Each service has use case, outcome, and CTA.

## Task Seed

- Build services page with categorized service cards, process, proof, and inquiry CTA.

