# WordPress Plugin Development

Kabeeri treats WordPress plugin work as a governed software product, not as a loose PHP snippet. The plugin must have a purpose, scope, architecture, security model, tasks, acceptance criteria, and handoff notes before broad implementation.

## When To Use

Use the plugin workflow when the requested behavior should live outside a theme:

- Booking systems.
- WooCommerce checkout/order/catalog extensions.
- Custom post types and taxonomies.
- Admin settings pages.
- Shortcodes or blocks.
- REST API endpoints.
- External integrations and webhooks.
- Business rules that must survive theme changes.

Visual-only work usually belongs in a child theme. Business behavior usually belongs in a plugin.

## Runtime

Plugin plans are stored inside:

```text
.kabeeri/wordpress.json
```

The important fields are:

- `plugin_plans`: governed plugin architecture and task plans.
- `current_plugin_plan_id`: the latest selected plugin plan.
- `scaffolds`: generated plugin folders and files.

The state is validated by:

```text
schemas/runtime/wordpress-state.schema.json
```

## CLI

```bash
kvdf wordpress plugin plan "Build a clinic booking plugin" --name "Clinic Booking" --type booking
kvdf wordpress plugin plan "Create a WooCommerce checkout add-on" --name "Checkout Addon" --type woocommerce
kvdf wordpress plugin tasks
kvdf wordpress plugin tasks --plan wordpress-plugin-plan-001 --json
kvdf wordpress plugin scaffold --name "Clinic Booking"
kvdf wordpress plugin checklist
kvdf prompt-pack compose wordpress --task <task-id>
```

## Plugin Types

- `business`: general business features.
- `booking`: appointments, clinics, calendars, reservations.
- `woocommerce`: products, cart, checkout, orders, stock, tax, refunds, emails.
- `integration`: APIs, webhooks, sync jobs, external systems.
- `cpt`: custom post types, taxonomies, directories, listings, editorial models.

## Generated Structure

```text
wp-content/plugins/<plugin-slug>/
  <plugin-slug>.php
  includes/class-plugin.php
  admin/class-admin.php
  public/class-public.php
  assets/css/admin.css
  assets/css/public.css
  assets/js/admin.js
  assets/js/public.js
  languages/.gitkeep
  uninstall.php
  README.md
```

The scaffold is intentionally conservative. It creates a safe boot layer, admin settings placeholder, public shortcode placeholder, uninstall policy, assets folders, and translation-ready text domain.

## Governance Rules

- Plugin writes are scoped to `wp-content/plugins/<plugin-slug>/`.
- `wp-admin/`, `wp-includes/`, `wp-config.php`, and `wp-content/uploads/` are forbidden.
- Every state-changing request needs a nonce.
- Every admin action needs a capability check.
- Every input must be sanitized and validated.
- Every output must be escaped for its context.
- REST routes must define permission callbacks.
- WooCommerce changes need sandbox evidence before touching payment or order lifecycle.
- Uninstall must not delete customer data unless the Owner explicitly approves it.

## AI Workflow

The developer can speak naturally:

```text
I want a WordPress plugin for clinic appointments with admin settings and a public booking shortcode.
```

Kabeeri-backed AI should translate this into:

```bash
kvdf wordpress plugin plan "Clinic appointments with admin settings and a public booking shortcode" --name "Clinic Booking" --type booking
kvdf wordpress plugin scaffold --name "Clinic Booking"
kvdf wordpress plugin tasks
kvdf prompt-pack compose wordpress --task <task-id>
```

Then the AI implements one governed task at a time.

## Acceptance Checklist

- Plugin has a clear purpose and scope.
- Plugin architecture is recorded.
- Scaffold exists under `wp-content/plugins/<plugin-slug>/`.
- Tasks include allowed and forbidden file scopes.
- Activation, deactivation, uninstall, and rollback are documented.
- Admin pages use capabilities and validated settings.
- Nonces, sanitization, escaping, and REST permission callbacks are reviewed.
- Public shortcodes/blocks handle empty, error, and responsive states.
- Handoff includes installation, activation, rollback, changed files, and tests.
