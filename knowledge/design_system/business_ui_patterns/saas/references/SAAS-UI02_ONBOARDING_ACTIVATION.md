# SAAS-UI02 Onboarding Activation

## Identity

- Design code: `SAAS-UI02`
- Business: SaaS
- View: onboarding and activation
- Style: short guided setup with visible progress

## Core Pattern

```text
value statement
setup steps
progress indicator
optional skip
success redirect
```

## Required Sections

- concise value statement;
- step list or wizard;
- required input forms;
- progress and completion state;
- final success and next action.

## Component Contracts

- `OnboardingChecklist`
- `StepCard`
- `ProgressBadge`
- `SaveAndContinueButton`
- `SkipLink`
- `SuccessState`

## States

- not started;
- in progress;
- step complete;
- skipped optional step;
- validation error;
- completed.

## Design Rules

- Ask only for fields needed to unlock first success.
- Optional steps must be clearly optional.
- Preserve progress if the user leaves.

## Motion

- `BALANCED_MOTION`
- Step transition can slide or fade.
- No long intro animation before setup.

## Task Seed

- Build onboarding using `ONBOARDING_FLOW.md`.
- Include progress, validation, skip, save, and success states.

