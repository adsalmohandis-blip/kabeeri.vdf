# WordPress Development And Adoption

Kabeeri can govern both new WordPress builds and existing WordPress site development. WordPress remains the application platform; Kabeeri provides the planning, safety, task, prompt, evidence, and handoff layer around it.

## Supported Scenarios

### New WordPress Site

Use this when the owner wants a new site such as:

- Corporate website.
- Personal blog.
- News or magazine site.
- Booking or clinic site.
- WooCommerce store.
- Membership or paid content site.
- Custom plugin-backed business website.

Kabeeri should first classify the site type, select the closest product blueprint, choose Agile or Structured delivery, generate intake questions, plan UI/content/data, then create scoped tasks.

### Existing WordPress Site

Use this when a site already exists and needs improvement, migration, redesign, plugin work, WooCommerce work, security hardening, or performance fixes.

Kabeeri must analyze before changing code:

- `wp-content/plugins`.
- `wp-content/themes`.
- WooCommerce presence.
- Page builder presence.
- SEO plugin presence.
- `wp-config.php` risk.
- Staging and backup status.
- Forbidden core paths.

## Runtime State

WordPress state lives in:

```text
.kabeeri/wordpress.json
```

The state tracks:

- `analyses`: existing-site analysis records.
- `plans`: new-build or adoption plans.
- `plugin_plans`: WordPress plugin architecture and task plans.
- `scaffolds`: generated plugin/theme/child-theme skeletons.
- `current_analysis_id`.
- `current_plan_id`.

The schema is:

```text
schemas/runtime/wordpress-state.schema.json
```

## CLI

```bash
kvdf wordpress analyze --path . --staging --backup
kvdf wordpress analyze --path existing-wordpress --json
kvdf wordpress plan "Build a WordPress company website" --type corporate --mode new
kvdf wordpress plan "Improve existing WooCommerce checkout" --type woocommerce --mode existing
kvdf wordpress tasks
kvdf wordpress plugin plan "Build a clinic booking plugin" --name "Clinic Booking" --type booking
kvdf wordpress plugin tasks
kvdf wordpress plugin scaffold --name "Clinic Booking"
kvdf wordpress scaffold plugin --name "Business Features"
kvdf wordpress scaffold theme --name "Company Theme"
kvdf wordpress scaffold child-theme --name "Company Child" --parent twentytwentyfour
kvdf wordpress checklist woocommerce
kvdf prompt-pack compose wordpress --task task-001
```

## Safety Rules

- Do not edit `wp-admin/`.
- Do not edit `wp-includes/`.
- Do not expose `wp-config.php` secrets.
- Do not change production without staging and backup confirmation.
- Prefer a custom plugin for behavior.
- Use `kvdf wordpress plugin plan` when the work is an installable plugin, WooCommerce extension, booking plugin, integration plugin, CPT plugin, shortcode/block plugin, or reusable business module.
- Prefer a child theme for visual changes on an existing theme.
- Use explicit tasks for WooCommerce checkout, payments, stock, tax, refunds, and order lifecycle changes.

## AI Workflow

The developer can talk normally:

```text
I want to improve the checkout flow in this existing WooCommerce store.
```

Kabeeri-backed AI should translate that into:

```bash
kvdf wordpress analyze --path . --staging --backup
kvdf wordpress plan "Improve checkout flow in existing WooCommerce store" --type woocommerce --mode existing
kvdf wordpress tasks
kvdf prompt-pack compose wordpress --task <task-id>
```

For plugin-specific work, the translation should be:

```bash
kvdf wordpress plugin plan "Improve checkout flow in a WooCommerce extension" --name "Checkout Addon" --type woocommerce
kvdf wordpress plugin scaffold --name "Checkout Addon"
kvdf wordpress plugin tasks
kvdf prompt-pack compose wordpress --task <task-id>
```

The AI should then implement one governed task at a time and record checks, changed files, risks, and handoff notes.

## Acceptance Checklist

- Site type is known.
- Staging and backup are confirmed for existing sites.
- Product blueprint is selected.
- WordPress plan exists.
- Tasks are generated from the plan.
- Implementation scope is plugin, theme, or child theme.
- Core paths are not changed.
- WordPress prompt pack is composed for the task.
- Security, accessibility, responsive, SEO/GEO, and performance checks are reviewed.
- Handoff includes activation notes and rollback notes.
