# app_category_registry Task Punch History

**Status:** `completed`
**Track:** `plugin_dev`
**Scope:** category brain for KVDOS app creation
**Mode:** detailed task-punch planning

---

## Purpose

This task index breaks the `app_category_registry` work into concrete implementation punches.
The goal is to keep each slice small, explicit, and safe.

Each punch is intentionally narrow enough that it can be assigned, reviewed, and tested without overlapping too much with the others.

---

## Punch Breakdown

### `acr-000` - Design Contract

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-000-a` | Define the plugin boundary and file contract. | Write down exactly what the plugin owns and what it does not own. | workspace docs, design docs | Runtime behavior | Boundary is explicit. | Document review. |
| `acr-000-b` | Define the category data model and plan outputs. | Specify the category universe, active catalog, visibility, readiness, and output files. | planning docs, schema drafts | Command code | Output contracts are clear. | Contract review. |

### `acr-001` - Plugin Foundation

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-001-a` | Create the plugin shell and schemas. | Make the plugin loadable with schema scaffolding and metadata. | plugin package shell, schemas | Universe hardcoding | Plugin loads safely. | Metadata load test. |
| `acr-001-b` | Add loader, validator, readiness, and status. | Create the basic runtime services that can inspect category files without crashing on empties. | loader/validator services | App generation logic | Status works and invalid categories fail clearly. | Loader and validator tests. |

### `acr-002` - Category Universe + Active Catalog

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-002-a` | Store the full category universe. | Represent all category possibilities in data files. | category data folders and YAML files | Hardcoded category logic | Universe is data-driven. | Catalog load tests. |
| `acr-002-b` | Expose only active ready categories by default. | Filter to categories with active/ready/default visibility. | active catalog and visibility files | Production selection of hidden categories | Default view shows only safe categories. | Visibility filtering tests. |

### `acr-003` - Category Profile + Compatibility Engine

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-003-a` | Build the category profile builder. | Combine delivery, domain, architecture, governance, and industry selections into one profile. | profile builder, profile writer | App scaffolding | Profile output is deterministic. | Profile writer tests. |
| `acr-003-b` | Build the compatibility engine. | Validate combinations and classify issues as info, warning, error, or blocking. | compatibility rules, validator | Silent coercion | Invalid combinations fail safely. | Combination coverage tests. |

### `acr-004` - Source Intake Router

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-004-a` | Classify and route source inputs. | Route screenshots, files, links, DBs, and repo inputs into roadmap tracks. | source router, inventory outputs | Ignoring unknown inputs | Sources are classified. | Source routing tests. |
| `acr-004-b` | Record conflicts and confidence. | Track inferred, assumed, conflicting, missing, and approved details. | conflict outputs, evidence outputs | Silent conflict resolution | Conflicts are explicit. | Conflict handling tests. |

### `acr-005` - Category Questionnaire Router

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-005-a` | Load category-specific question packs. | Pull the right questions for the selected profile and source gaps. | questionnaire packs, router | One-size-fits-all questions | Missing details are asked first. | Pack load tests. |
| `acr-005-b` | Mark answered questions and prioritize risk. | Reduce noise by de-prioritizing already answered items. | questionnaire profile files | Re-asking confirmed inputs | Critical missing questions rise to the top. | Priority tests. |

### `acr-006` - Spec + Micro-Docs Contract Resolver

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-006-a` | Resolve required spec docs. | Define which specs must exist for UI/UX, system design, database, testing, deployment, and security. | spec resolver, contract files | Writing the app itself | Required docs are known. | Contract resolution tests. |
| `acr-006-b` | Resolve micro-doc contracts. | Specify required sections, inputs, outputs, approvals, and readiness checks for each doc type. | micro-doc contract files | Ignoring missing inputs | Micro-doc requirements are explicit. | Micro-doc contract tests. |

### `acr-007` - Roadmap Tracks + Roadmap Order Engine

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-007-a` | Generate roadmap tracks and order. | Build the ordered roadmap with dependencies and phase rules. | roadmap resolver, order engine | Random track order | Roadmap order is deterministic. | Order tests. |
| `acr-007-b` | Enforce approval gates and dependency constraints. | Block phases when required inputs or approvals are missing. | validators, approval gate logic | Ignoring blockers | Dependencies are enforced. | Gate tests. |

### `acr-008` - Workspace Planner

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-008-a` | Plan the workspace safely. | Produce a dry-run/apply workspace plan without destructive changes. | workspace planner, plan outputs | Forced folder writes | Workspace plan is generated. | Dry-run tests. |
| `acr-008-b` | Emit folder evidence and category-specific templates. | Record what was planned and what category template was used. | evidence outputs, templates | Silent folder mutations | The plan is auditable. | Apply-mode tests. |

### `acr-009` - IDE Integration + Evidence + Tests

| Punch ID | Goal | What This Punch Means | Allowed Files | Forbidden Files | Acceptance | Tests / Checks |
|---|---|---|---|---|---|---|
| `acr-009-a` | Integrate category selection into the Create New App flow. | Show active categories, warnings, and previews before profile approval. | IDE integration docs, evidence | Unsafe app build automation | Selection flow works with warnings. | UI flow tests. |
| `acr-009-b` | Finalize evidence and production tests. | Save evidence for category selection, intake, questionnaire, spec resolution, roadmap, workspace plan, and approval gates. | evidence folder, tests, docs | Missing audit trail | The plugin is production-ready. | Evidence and regression tests. |

---

## Summary

`app_category_registry` is a data-driven category intelligence layer.
It owns category visibility, selection, questionnaire routing, doc contracts, roadmap ordering, workspace planning, and the evidence needed to keep KVDOS app creation safe and predictable. This task index now reflects the completed implementation history for the plugin.
