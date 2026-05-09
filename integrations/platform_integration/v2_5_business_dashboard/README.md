# v2.5.0 - Business Dashboard

Goal: give the Owner and non-technical stakeholders a product-value view.

## State File

`.kabeeri/dashboard/business_state.json` is a regenerated view for business communication.

Suggested top-level shape:

```json
{
  "generated_at": "2026-05-07T00:00:00Z",
  "product": {},
  "capabilities": [],
  "feature_readiness": [],
  "user_journey": [],
  "target_audience": [],
  "onboarding": {},
  "release_value": {}
}
```

## Sections

| Section | Purpose |
|---|---|
| Product capabilities | What the product can do. |
| Feature readiness | What is demo-ready, publish-ready, under review, or future. |
| User journey | Main path a user follows. |
| Target audience | Who the product is for. |
| Onboarding | First-use and activation steps. |
| Release value | Why this release matters. |

## Feature Readiness

Allowed values:

- `ready_to_demo`
- `ready_to_publish`
- `needs_review`
- `future`

Each feature should link to:

- related task IDs
- acceptance criteria
- owner verification status
- demo notes
- release notes candidate text

## Acceptance Criteria

- Business dashboard is documented.
- It avoids technical jargon where possible.
- Feature status is understandable to non-technical stakeholders.
- User journey can support demos, marketing, and client review.

