# Data Design Runtime

Data Design helps Kabeeri and AI coding tools design database models from
business workflow, not from UI screens. It complements Product Blueprints:

- Product Blueprint answers: what kind of system is this?
- Data Design answers: what database patterns and safeguards should this
  system use?

## Runtime Commands

```bash
kvdf data-design principles
kvdf data-design principle workflow_first
kvdf data-design modules
kvdf data-design module commerce
kvdf data-design context ecommerce --json
kvdf data-design recommend "Build ecommerce store with payments inventory mobile app" --json
kvdf data-design checklist
kvdf data-design review "orders table with price float and items json"
kvdf data-design history
```

## Runtime State

Generated contexts and reviews are stored in:

```text
.kabeeri/data_design.json
```

The state keeps:

- `contexts`: compact AI-ready data design contexts for selected product blueprints
- `reviews`: lightweight database design reviews and findings
- `current_context`: latest generated context id

## What The Context Gives AI

For a selected blueprint such as `ecommerce`, the context includes:

- required data modules, such as core, commerce, inventory, mobile, analytics, integration
- expected entities, such as orders, order_items, payments, invoices, stock_movements
- must-have safeguards, such as snapshots, idempotency, transactions, constraints
- index hints for common queries
- risk flags such as money precision, stock concurrency, content revisions, mobile retries
- an approval checklist before database implementation

## Core Principles

The runtime is built around these non-negotiable modeling rules:

- design from business workflow before screens
- split data into core, modules, and channels
- use primary keys, foreign keys, constraints, and pivot tables
- normalize master data but snapshot historical operations
- define statuses, status history, and workflow tables
- add audit logs and activity timelines early
- treat money, stock, wallets, and loyalty as movements or ledgers
- plan indexes, read models, summaries, search, reporting, and pagination
- design for security, multi-tenancy, sensitive data, and actor separation
- use transactions, idempotency, outbox, integration logs, migrations, backups, and restore tests

## Relationship To Other Features

| Feature | Connection |
| --- | --- |
| Product Blueprints | Data Design maps a selected product blueprint to database modules and entities. |
| Vibe-first | A natural language app request can become a product blueprint, then a data design context, then suggested tasks. |
| Structured Delivery | Enterprise databases can turn the context into approved requirements, phases, deliverables, risks, and migration plans. |
| Agile Delivery | MVP databases can turn the context into backlog items and stories while keeping integrity rules visible. |
| Migration Safety | Data Design contexts should be used before creating migration plans and rollback checks. |
| Workstreams | Database entities and indexes guide database workstream scope. |
| Prompt Packs | AI prompts can include the context so backend code starts with the right modeling assumptions. |

The context is advisory. It does not replace requirements, ERD review, migration
review, production backup planning, or Owner approval.
