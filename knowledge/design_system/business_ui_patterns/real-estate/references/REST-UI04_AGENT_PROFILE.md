# REST-UI04 Agent Profile

## Identity

- Design code: `REST-UI04`
- Business: real-estate
- View: agent profile
- Style: trust and listings hub

## Layout Anatomy

```text
agent header
credentials
contact actions
active listings
reviews
areas served
```

## UX Goals

- Build trust in the agent.
- Show active listings and expertise.
- Make contact easy.

## Required Components

- `AgentHeader`
- `CredentialBadge`
- `ContactActions`
- `ActiveListings`
- `ReviewSummary`
- `AreaTags`

## Required States

- available;
- unavailable;
- no listings;
- contact submitted;
- loading reviews.

## Data Requirements

- agent name/photo;
- credentials;
- contact channels;
- listings;
- reviews;
- areas.

## Accessibility

- Contact actions have text labels.
- Agent photo alt text.
- Reviews readable with numeric score.

## Motion

- `BALANCED_MOTION`
- Listing hover subtle.
- Avoid motion that distracts from trust details.

## Common Mistakes

- Credentials not explained.
- Contact hidden behind icons only.
- No active listing context.

## Acceptance Criteria

- User can evaluate and contact the agent confidently.

## Task Seed

- Build agent profile with credentials, contact actions, listings, reviews, and availability states.

