# KVDF Owner Plugin Packaging Report

## Summary

The owner track is now packaged as a removable plugin bundle under
`plugins/kvdf-dev/`. The shared loader can discover the bundle, enable or
disable it, and report its metadata without hard-coding the owner surface into
the core CLI registry.

## What Exists

- `plugins/kvdf-dev/plugin.json`
- `plugins/kvdf-dev/` as the framework-development bundle root
- `src/cli/services/plugin_loader.js`
- `src/cli/commands/plugin.js`
- `.kabeeri/plugins.json`

## Packaging Contract

The owner bundle now carries explicit metadata:

- `plugin_id`
- `name`
- `plugin_version`
- `bundle_type`
- `load_strategy`
- `removable`
- `track`
- `enabled_by_default`
- `command_surface`
- `docs_surface`
- `description`

This metadata lets KVDF treat the bundle as a removable extension rather than
an embedded core feature.

## Load Behavior

1. The loader scans `plugins/*/plugin.json`.
2. It merges enable/disable state from `.kabeeri/plugins.json`.
3. It reports active plugins through `kvdf plugins status`.
4. It exposes a direct manifest view through `kvdf plugins show kvdf-dev`.
5. It allows explicit enable/disable control without touching shared runtime
   state files.

## Isolation Rules

- Core runtime code stays in `src/cli/` and shared runtime folders.
- Owner-only command surfaces stay in the owner bundle.
- Developer workspaces stay in `workspaces/apps/<app-slug>/`.
- Shared state such as `.kabeeri/plugins.json` is only a loader control file,
  not a place for owner business logic.

## Validation

Packaging is considered successful when:

- the bundle is discoverable
- the bundle is removable
- the bundle metadata is visible
- developer mode still works if the bundle is disabled
- `npm test` and `kvdf conflict scan` both pass
