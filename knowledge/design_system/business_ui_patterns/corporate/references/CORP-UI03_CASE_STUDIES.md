# CORP-UI03 Case Studies

## Identity

- Design code: `CORP-UI03`
- Business: corporate
- View: case studies and portfolio proof
- Style: evidence-led proof library

## Layout Anatomy

```text
case filter
case cards
case detail
results metrics
testimonial
CTA
```

## UX Goals

- Prove capability.
- Help visitors find relevant examples.
- Connect proof to inquiry.

## Required Components

- `CaseFilter`
- `CaseStudyCard`
- `MetricResult`
- `ChallengeSolutionResult`
- `Testimonial`
- `ContactCTA`

## Required States

- no cases;
- filtered empty;
- loading;
- restricted case.

## Data Requirements

- client/industry;
- challenge;
- solution;
- results;
- quote.

## Accessibility

- Case cards have descriptive links.
- Metrics include labels and context.
- Filter controls have labels.

## Motion

- `BALANCED_MOTION`
- Card reveal can be subtle.
- Avoid portfolio animation that hides results.

## Common Mistakes

- Pretty screenshots without results.
- Generic case labels.
- No contact path after proof.

## Acceptance Criteria

- Each case explains challenge, solution, and result.

## Task Seed

- Build case studies list/detail pattern with filters, metrics, proof, and CTA.

