# Business Dashboard Spec

The business dashboard translates project state into owner/client language.

## State File

`.kabeeri/dashboard/business_state.json`

## Sections

- Product capabilities
- Feature readiness
- User journeys
- Target audience
- Onboarding status
- Release value
- What is ready to demo
- What is ready to publish
- Deferred features

## Feature Readiness Values

- `ready_to_demo`
- `ready_to_publish`
- `needs_review`
- `future`

## Rule

Business dashboard must avoid internal secrets, raw tokens, and implementation-only details unless explicitly marked safe.
