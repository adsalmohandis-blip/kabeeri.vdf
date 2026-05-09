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
- Same-product app boundaries
- Linked workspace portfolio summaries
- High-level dashboard action center

## Feature Readiness Values

- `ready_to_demo`
- `ready_to_publish`
- `needs_review`
- `future`

## Rule

Business dashboard must avoid internal secrets, raw tokens, and implementation-only details unless explicitly marked safe.

## Multi-App Rule

Multiple apps can appear in one business dashboard only when they are part of the same product boundary.

Separate products, clients, or release lifecycles must appear as linked KVDF workspaces rather than apps inside the same workspace.

## UX Governance

Business dashboard views must surface the next safest action before long detail tables. `kvdf dashboard ux` checks that the dashboard remains readable, has empty states, separates apps from linked workspaces, and does not expose implementation secrets.
