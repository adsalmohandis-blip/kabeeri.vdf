# Product Blueprint Runtime

Product blueprints are Kabeeri's compact understanding of common market
systems. They help AI coding tools start with the expected product structure
instead of spending tokens rediscovering it.

## Why It Exists

Many products share repeatable shapes:

- eCommerce = catalog, cart, checkout, payments, shipping, orders, customer account
- News website = CMS, editorial workflow, breaking news, ads, SEO, paywall, push alerts
- ERP = accounting, procurement, inventory, approvals, reports, roles
- Mobile app = onboarding, auth, profile, push notifications, offline/cache, API integration

The blueprint layer stores these shapes as JSON so chat, CLI, dashboard, VS
Code, and Codex-like tools can reuse them.

## Runtime Commands

```bash
kvdf blueprint list
kvdf blueprint show ecommerce
kvdf blueprint recommend "Build ecommerce store with payments shipping and mobile app"
kvdf blueprint recommend "Build news website with breaking news ads paywall and mobile app" --json
kvdf blueprint select ecommerce --delivery structured --reason "Large catalog with payments and shipping"
kvdf blueprint context ecommerce --json
kvdf blueprint history
```

## Runtime State

Selections and recommendations are stored in:

```text
.kabeeri/product_blueprints.json
```

The state keeps:

- `recommendations`: detected product types from natural language
- `selected_blueprints`: developer-confirmed product blueprints
- `current_blueprint`: the active blueprint key for the workspace

## How It Connects To Other Kabeeri Features

| Feature | Connection |
| --- | --- |
| Vibe-first | Natural language can be mapped to a blueprint before suggested task cards are created. |
| Delivery Mode Advisor | Blueprint `recommended_delivery` informs Agile/Structured recommendation but does not replace the developer decision. |
| App Boundary Governance | Blueprint channels identify whether multiple apps belong to the same product or should be separated. |
| Workstreams | Blueprint workstreams guide task ownership and AI session scopes. |
| Prompt Packs | Blueprint context can be injected before stack-specific prompts to reduce repeated discovery. |
| Design Governance | Frontend pages/screens become the starting list for page specs and component contracts. |
| Database Planning | Database entities become an early data-model checklist before migrations are written. |
| Runtime Schemas | `.kabeeri/product_blueprints.json` is validated by the runtime schema registry. |

## AI Context Contract

`kvdf blueprint context <key> --json` returns the compact context an AI tool
should read before planning or implementation:

- `channels`
- `backend_modules`
- `frontend_pages`
- `database_entities`
- `workstreams`
- `governance_links`
- `risk_flags`

This is intentionally small. It is a starting structure, not a replacement for
requirements, owner decisions, acceptance criteria, or domain-specific review.
