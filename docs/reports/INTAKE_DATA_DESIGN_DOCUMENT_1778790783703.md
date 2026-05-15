# Intake Data Design Document

**Task ID:** `task-080`  
**Title:** Data design document  
**Intake Plan:** `questionnaire-intake-1778790783703`  
**Status:** `recorded`  
**Date:** 2026-05-14

---

## Executive Summary

This document defines the initial data model for the current ecommerce intake.
The design is centered on commerce safety, inventory consistency, and clean
entity boundaries so implementation can start with predictable database
contracts.

The project uses MySQL, a Laravel backend, and a structured delivery mode. The
data model must support storefront browsing, checkout, order processing,
shipping, payments, coupons, reviews, accounts, and admin workflows without
mixing unrelated concerns.

---

## Core Design Principles

- Keep commerce entities explicit and normalized.
- Protect order and inventory workflows with transaction-safe writes.
- Separate public commerce data from operational/admin data where it matters.
- Use snapshots for historical order and payment context.
- Treat audit trails as first-class records, not optional logs.
- Keep migrations safe, additive, and reversible when possible.

---

## Main Modules

### Commerce

- products
- product_variants
- categories
- carts
- cart_items
- orders
- order_items
- payments
- shipments
- coupons
- reviews
- addresses

### Identity and Operations

- users
- customers
- roles
- permissions
- role_permissions
- user_roles
- sessions
- notifications
- api_keys

### Audit and Support

- audit_logs
- activity_logs
- files
- settings

### Inventory

- warehouses
- stock_balances
- stock_movements
- stock_reservations
- stock_transfers
- stock_transfer_items
- batches
- serial_numbers

---

## Entity Relationships

### Customer and Account Model

- A `customer` may own many `orders`.
- A `customer` may own many `addresses`.
- A `user` may be linked to one or more roles and permissions.
- A `customer` may map to a `user` for authenticated account access.

### Catalog Model

- A `category` may contain many `products`.
- A `product` may contain many `product_variants`.
- A `product` may have many `reviews`.
- A `product_variant` may have price and inventory tracking.

### Cart and Checkout Model

- A `cart` belongs to a customer or anonymous session.
- A `cart` contains many `cart_items`.
- A `cart_item` references a product or variant.
- Checkout transforms cart state into an `order`.

### Order Model

- An `order` belongs to a customer.
- An `order` contains many `order_items`.
- An `order` may have many `payments`.
- An `order` may have many `shipments`.
- Orders should snapshot the important product, pricing, tax, and shipping
  details at purchase time.

### Inventory Model

- A `warehouse` may hold many `stock_balances`.
- A `stock_balance` belongs to a product variant and warehouse context.
- A `stock_movement` records every stock change.
- A `stock_reservation` reserves inventory during checkout or fulfillment.
- A `stock_transfer` groups inter-warehouse movements.

---

## Snapshots

Snapshots should preserve the state that matters at the time of the user
action:

- order item snapshot
- payment snapshot
- shipment snapshot
- address snapshot
- product pricing snapshot
- tax or discount snapshot

Snapshots prevent historical records from changing when current catalog data is
updated later.

---

## Index and Constraint Direction

The initial MySQL schema should include:

- unique identifiers for users, customers, orders, products, variants, and
  coupons
- foreign keys for ownership and parent-child relations
- indexes for lookup-heavy columns such as status, sku, slug, order number,
  customer id, and created_at
- unique constraints for variant sku, coupon code, and any public slug fields
- transaction-safe constraints for inventory reservations and order writes

---

## Security and Integrity

- Payment records should not store raw gateway secrets.
- Sensitive session or API key material must be protected.
- Inventory changes should be atomic and auditable.
- Role and permission data should be explicit and queryable.
- Audit events should record who changed what, when, and why.

---

## Migration Safety

- Additive migrations are preferred.
- Tables should be introduced in dependency order.
- Data backfills should be separate from schema creation when possible.
- High-risk changes such as inventory schema updates require verification
  before release.
- Existing commerce records must remain readable during future schema changes.

---

## Entity Notes

### products

- The catalog source of truth.
- Should support status, visibility, slug, and SEO metadata.

### product_variants

- Holds size, color, stock, sku, and price-specific data.

### orders

- Must preserve full commercial history.
- Should capture status changes and payment/fulfillment lifecycle.

### payments

- Stores gateway references, payment status, method, and captured amounts.

### shipments

- Tracks shipping provider, tracking number, and shipment state.

### stock_movements

- Records all inventory deltas with reason and actor context.

---

## Delivery Implications

Because delivery mode is structured, the data design should be finalized before
implementation tasks begin. The schema becomes the contract that later tasks
must respect.

---

## Acceptance Criteria Coverage

This document satisfies the required data design elements:

- core entities
- relationships
- snapshots
- indexes
- constraints
- audit
- migration safety

---

## Next Step

1. Confirm this data design.
2. Move to the UI/UX direction document.
3. Continue the docs-first sequence before implementation.
