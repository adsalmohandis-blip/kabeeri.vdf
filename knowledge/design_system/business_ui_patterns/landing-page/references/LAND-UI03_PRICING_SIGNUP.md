# LAND-UI03 Pricing Signup

## Identity

- Design code: `LAND-UI03`
- Business: landing-page
- View: pricing, waitlist, signup, or lead capture
- Style: transparent conversion block

## Layout Anatomy

```text
pricing/offer summary
plan cards or signup form
trust notes
submit CTA
success/error states
```

## UX Goals

- Make commitment clear.
- Capture leads without friction.
- Explain what happens after submission.

## Required Components

- `PricingCard`
- `LeadForm`
- `PlanBadge`
- `TrustNote`
- `SubmitButton`
- `SuccessState`

## Required States

- form idle;
- validation error;
- submitting;
- success;
- backend error.

## Data Requirements

- price or offer terms;
- plan features;
- required fields;
- privacy/trust copy.

## Accessibility

- Every field has visible label.
- Errors are connected to fields where possible.
- Submit button disables during submission.

## Motion

- `BALANCED_MOTION`
- Success feedback can pop subtly.
- Do not animate pricing numbers distractingly.

## Common Mistakes

- Hidden pricing or terms.
- Long forms before proof.
- Success state without next step.

## Acceptance Criteria

- User knows what they get and what happens next.
- Form has loading, error, and success states.

## Task Seed

- Build pricing/signup block with transparent offer, form states, trust note, and success next action.

