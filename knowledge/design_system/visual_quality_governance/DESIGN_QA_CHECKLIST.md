# Design QA Checklist

Use this checklist after implementation and before Owner/client visual approval.

## Fit

- UI follows approved page spec.
- Selected business UI pattern is visible in layout and priorities.
- Approved tokens are used.
- Components follow approved contracts.
- Creative variation axes are reflected without breaking consistency.

## Usability

- Primary action is clear.
- Destructive action is clearly distinguished.
- Forms are easy to scan and recover from.
- Tables and dense screens support filtering, sorting, pagination, or virtualization where needed.
- Navigation and hierarchy are predictable.

## States

- Loading state is stable.
- Empty state includes useful next action.
- Error state explains recovery.
- Success feedback is visible but not disruptive.
- Disabled and in-progress states prevent duplicate actions.

## Quality

- No text overlap.
- No unstable layout shifts.
- No raw colors inside page components.
- No unnecessary custom UI where the approved library provides a component.
- No generic copy where product-aware microcopy is needed.

## Evidence

- Screenshots cover desktop and mobile.
- Accessibility, performance, content, motion, and RTL checks are recorded when relevant.
- Deviations are explicit and either accepted or assigned for rework.

