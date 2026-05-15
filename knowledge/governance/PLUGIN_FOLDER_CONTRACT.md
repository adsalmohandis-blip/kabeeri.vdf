# Plugin Folder Contract

This document defines the canonical folder contract for KVDF plugin bundles.
It separates the folders that every plugin must have from folders that are
optional or family-specific. The goal is to make plugin layout predictable for
humans and for AI-driven tooling.

## Contract Goals

- One plugin, one clear folder contract.
- Common folders stay common across all plugins.
- Family-specific folders remain explicit and documented.
- A plugin can be installed, disabled, or uninstalled without ambiguity.
- The AI should be able to discover structure from the manifest first, not by
  guessing from repository history.

## Folder Classes

### 1. Required invariant folders

These folders define the minimum plugin shape. Every plugin bundle should have
them, even if some of them contain only placeholders at first.

- `plugin.json`
- `commands/`
- `docs/`
- `prompts/`
- `schemas/`
- `templates/`
- `tests/`

### 2. Common support folders

These folders are optional but commonly used by mature plugins.

- `references/`
- `examples/`
- `assets/`
- `dashboard/`

### 3. Family-specific domain folders

These folders vary by plugin family and define the semantic scope of the
plugin. They are not interchangeable across families.

## App Builder Plugin Contract

Use this family for plugins that build user-facing products such as ecommerce
sites, booking websites, SaaS apps, IDE-like desktop apps, and workflow apps.

### Purpose

- Turn vibe requests into briefs, modules, tasks, and approval-ready batches.
- Model product behavior, UI/UX, data, and delivery flow.
- Expose product archetypes through CLI and deterministic outputs.

### Required folders

- `plugin.json`
- `commands/`
- `docs/`
- `prompts/`
- `schemas/`
- `templates/`
- `tests/`

### Common support folders

- `references/`
- `examples/`
- `assets/`
- `dashboard/`

### Domain folders

Use a domain folder that reflects the product archetype instead of the
framework itself.

Allowed examples:

- `business-type/`
- `archetypes/`
- `product-types/`

Inside the domain folder, use concrete product groupings such as:

- `store/`
- `marketplace/`
- `digital-products/`
- `subscription/`
- `services/`
- `appointments/`
- `classes/`
- `hotels/`
- `events/`
- `salon/`
- `clinic/`

### Expected file meaning

- `commands/` drives the CLI surface for the plugin.
- `docs/` explains plugin usage, outputs, and workflows.
- `prompts/` stores reusable AI guidance for the plugin pipeline.
- `schemas/` defines generated artifact and state contracts.
- `templates/` stores starter blueprints and scaffolds.
- `tests/` validates the plugin loader, routing, and outputs.
- `references/` stores reference examples and visual or system patterns.
- `examples/` stores starter project examples and sample outputs.
- `assets/` stores images, icons, screenshots, and mockups.
- `dashboard/` stores plugin-specific dashboard views or summaries.
- `business-type/` or equivalent stores archetype-specific guidance.

### Not recommended

- Using framework-development folders such as `governance/` or `evolution/`
  as the main semantic container for an app-builder plugin.
- Mixing app-builder archetypes with framework-owner control files.

## Framework Plugin Contract

Use this family for plugins that extend or modify KVDF itself.

### Purpose

- Change runtime behavior, governance, lifecycle rules, CLI surfaces, plugin
  loading, or validation.
- Support framework evolution, deprecation, migrations, and owner controls.
- Keep the KVDF engine separate from app-building plugins.

### Required folders

- `plugin.json`
- `commands/`
- `docs/`
- `prompts/`
- `schemas/`
- `templates/`
- `tests/`

### Common support folders

- `references/`
- `examples/`
- `assets/`
- `dashboard/`

### Domain folders

Allowed examples:

- `governance/`
- `evolution/`
- `capabilities/`
- `runtime/`
- `plugin-control/`
- `tracks/`
- `reports/`

### Expected file meaning

- `commands/` drives framework commands and owner surfaces.
- `docs/` documents framework behavior and migration guidance.
- `prompts/` stores AI guidance for framework evolution tasks.
- `schemas/` defines runtime, plugin, and validation contracts.
- `templates/` stores reusable framework scaffolds and ownership packs.
- `tests/` validates the framework plugin contract and governance rules.
- `governance/` stores policy, ownership, and execution rules.
- `evolution/` stores roadmap, priorities, and execution slices.
- `capabilities/` stores capability maps and partition logic.
- `runtime/` stores runtime helpers, state, and execution contracts.
- `plugin-control/` stores install, enable, disable, and removal rules.

### Not recommended

- Using `business-type/` as the primary domain folder.
- Mixing app product archetypes into framework plugin governance folders.

## System Builder Plugin Contract

Use this family for plugins that build low-level platform software such as
desktop shells, OS-like systems, kernels, distro tools, cloud platforms, or
engineering runtimes.

### Purpose

- Turn architecture intent into system modules, technical briefs, and build
  tasks.
- Model platform boundaries, boot flow, runtime, packaging, and verification.
- Support complex system products that are larger than app builders but still
  not KVDF core.

### Required folders

- `plugin.json`
- `commands/`
- `docs/`
- `prompts/`
- `schemas/`
- `templates/`
- `tests/`

### Common support folders

- `references/`
- `examples/`
- `assets/`
- `dashboard/`

### Domain folders

Allowed examples:

- `architecture/`
- `boot/`
- `kernel/`
- `runtime/`
- `platform/`
- `drivers/`
- `filesystem/`
- `syscalls/`
- `packaging/`
- `installer/`
- `emulator/`
- `cloud/`

### Expected file meaning

- `architecture/` stores the system architecture plan and module map.
- `boot/` stores boot flow, bootstrapping, and startup artifacts.
- `kernel/` stores kernel design, scheduler, memory, and core contracts.
- `runtime/` stores execution/runtime contracts and state.
- `platform/` stores shell, desktop, or platform-level structure.
- `drivers/` stores device driver scope and interfaces.
- `filesystem/` stores file and storage abstractions.
- `syscalls/` stores syscall and IPC contracts.
- `packaging/` stores build, packaging, and release artifacts.
- `installer/` stores installation and setup flows.
- `emulator/` stores QEMU, VM, or sandbox test harnesses.
- `cloud/` stores cloud control plane or cloud-OS system models.

### Not recommended

- Reusing `business-type/` for system-level infrastructure plugins.
- Mixing app product archetypes directly into kernel or boot folders.

## Manifest Requirements

Every plugin manifest should declare the contract family explicitly.

Recommended manifest fields:

- `plugin_id`
- `name`
- `plugin_version`
- `bundle_type`
- `load_strategy`
- `removable`
- `track`
- `plugin_family`
- `plugin_type`
- `required_folders`
- `optional_folders`
- `domain_folders`
- `enabled_by_default`
- `description`
- `command_surface`
- `docs_surface`

## Validation Expectations

KVDF should be able to validate:

- the manifest declares the correct family
- required folders exist
- optional folders are allowed but not required
- family-specific folders match the plugin family
- disallowed folders are not used as the main semantic bucket
- plugin removal does not break the core loader

## Canonical Mapping

### App builder plugins

- `booking-builder`
- `ecommerce-builder`
- future product builders

### Framework plugins

- `kvdf-dev`
- future framework extensions

### System builder plugins

- future IDE builders
- future OS builders
- future cloud/platform builders

## Practical Rule

If a folder name does not clearly explain the plugin family, it should not be
treated as a canonical contract folder.

When in doubt:

- keep the required invariant folders
- keep the manifest explicit
- put semantic meaning into the domain folder
- let the AI learn the meaning from the manifest and this contract, not from
  folder coincidence

