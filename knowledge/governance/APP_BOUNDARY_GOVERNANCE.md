# App Boundary Governance

App Boundary Governance defines when multiple applications can live inside one Kabeeri VDF workspace and when they must be split into separate KVDF folders. Developer app workspaces are scaffolded under `workspaces/apps/<app-slug>/` so the app root stays isolated from `kabeeri-core` and removable owner bundles.

## Core Rule

One `.kabeeri/` workspace represents one product boundary.

Multiple apps are allowed inside that workspace only when they belong to the same product, Owner, roadmap, release lifecycle, and governance model.

## Allowed In One Workspace

An ecommerce product can contain:

- Laravel API backend
- React, Vue, or Angular storefront
- Admin dashboard
- Mobile app
- Background worker or integration service

These are separate apps, but they are one product.

Example:

```text
store-platform/
  .kabeeri/
  workspaces/
    apps/
      api-laravel/
      storefront-react/
      admin-vue/
```

## Not Allowed In One Workspace

Separate products should use separate KVDF workspaces.

Examples:

- ecommerce store plus booking system
- two different client projects
- products with different Owners
- products with different releases, budgets, or security gates

## Runtime Commands

Register each app with an explicit type, path, and product. The first app in a workspace establishes the product boundary for that workspace:

```bash
kvdf app workspace create --slug backend-api --name "Laravel API" --type backend
kvdf app workspace create --slug storefront --name "React Storefront" --type frontend
```

Create app-scoped tasks:

```bash
kvdf task create --title "Build product API" --app backend-api --workstream backend
kvdf task create --title "Build product grid" --app storefront --workstream public_frontend
```

Cross-app tasks must be explicit integration tasks:

```bash
kvdf task create --title "Wire product API to storefront" --type integration --apps backend-api,storefront --workstreams backend,public_frontend
```

Tasks that span multiple apps from different products are rejected even when `--type integration` is set.

## Enforcement

KVDF enforces boundaries in three places:

- `kvdf app create` blocks apps that declare a different product in the same workspace.
- `kvdf task create` blocks tasks that touch multiple apps unless the task type is `integration`.
- `kvdf session end` blocks changed files outside the task's registered app path.
- `kvdf task create` also blocks multi-app tasks when the selected apps resolve to different products.

## Validation

Run:

```bash
kvdf validate workspace
kvdf validate business
```

Validation checks app route safety, app path uniqueness, app path overlap, missing task app references, and cross-app tasks without integration type.

## Design Intent

Kabeeri should let one product have multiple technical apps without mixing unrelated products.

The app registry is not just navigation metadata. It is a safety boundary used by tasks, locks, sessions, dashboards, policy gates, and future VS Code views. Task locks and task tokens should derive their narrowest safe scope from this registry instead of widening the boundary by hand.
