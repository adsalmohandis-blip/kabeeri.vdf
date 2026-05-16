# Standard Systems Capability Map

This folder is the reference brain for v5 adaptive questionnaires. It lists the system areas Kabeeri uses to avoid missing important parts of a software project.

The machine-readable source of truth for repository layout is `REPOSITORY_FOLDERING_MAP.json` in this folder. When a capability or document needs a home, use that map first, then the human guide in `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`, and only then add or edit files inside the owning root.

Runtime support:

```bash
kvdf capability list
kvdf capability show payments_billing
kvdf questionnaire coverage
kvdf blueprint list
kvdf blueprint recommend "Build ecommerce store with payments shipping and mobile app"
kvdf blueprint context ecommerce --json
kvdf data-design context ecommerce --json
kvdf data-design checklist
```

## Product Blueprint Catalog

`PRODUCT_BLUEPRINT_CATALOG.json` is the market-system map used before task
creation. It tells Kabeeri and AI coding tools what a requested product usually
contains:

- channels such as website, admin panel, mobile app, POS terminal, vendor portal, or API
- backend modules such as catalog, checkout, accounting, editorial workflow, or delivery tracking
- frontend pages/screens such as product details, cart, editorial queue, or driver orders
- database entities such as orders, invoices, articles, drivers, appointments, and audit logs
- workstreams and risk flags that should shape task splitting and review gates

The catalog complements the capability map. Capability areas say which broad
system areas are required; product blueprints give a compact starting structure
for common systems like eCommerce, POS, ERP, CRM, news websites, booking,
delivery/logistics, and mobile apps.

Business-type packs for booking and ecommerce should stay in parity. The
booking pack covers appointments, services, classes, hotels, and events, while
the ecommerce pack covers store, marketplace, digital products, subscription,
and services. Both packs should keep matching intake, module, and acceptance
structure so the docs read as one shared archetype family.

This reduces AI token usage because Codex can read one compact blueprint context
instead of rediscovering the same application anatomy across disconnected
sessions.

## Data Design Blueprint

`DATA_DESIGN_BLUEPRINT.json` is the database modeling companion to product
blueprints. It gives AI tools workflow-first rules, module-specific entities,
constraints, indexes, snapshots, audit, reporting, mobile, integration,
transaction, idempotency, and migration guidance.

Use it after product type detection:

```bash
kvdf blueprint recommend "Build ecommerce store with inventory and mobile app"
kvdf data-design context ecommerce --json
```

This gives Codex a compact database context before it writes migrations or data
models.
