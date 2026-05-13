# Owner Plugin Packaging

## Purpose

The owner track is packaged as a removable plugin bundle so KVDF can:

- keep framework-development surfaces isolated from developer-app surfaces
- load owner-only behavior only when the owner bundle is enabled
- remove owner-specific behavior without breaking shared core runtime behavior
- expose the packaging contract in a readable, versioned form

## Packaging Model

The owner bundle lives at:

```text
plugins/owner-track/
```

The bundle is described by:

- `plugins/owner-track/plugin.json`
- `.kabeeri/plugins.json`
- the shared plugin loader in `src/cli/services/plugin_loader.js`

## Bundle Contract

The owner bundle is expected to declare:

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

These fields let the loader answer three questions:

1. What bundle is this?
2. Is it removable?
3. What surfaces should appear when it is enabled?

## Load Control

The shared loader reads all manifests from `plugins/*/plugin.json` and then
applies local overrides from `.kabeeri/plugins.json`.

Load control rules:

- enabled bundles are reported as active
- disabled bundles remain present in the loader report but do not act as active surfaces
- the loader must fail closed when a required owner bundle is disabled
- developer-track behavior must continue to work when the owner bundle is removed

## Removal Rules

Removing the owner bundle must not:

- delete shared core code
- delete developer workspace state
- change the runtime schema registry for shared state files
- break `kvdf resume`, `kvdf start`, `kvdf validate`, or conflict scanning

Removal may:

- hide owner-only commands
- hide owner-only docs
- stop owner-only routing
- stop owner-only reports from appearing as active behavior

## Validation

Packaging is considered correct when:

- `kvdf plugins status` reports the owner bundle with the correct metadata
- `kvdf plugins show owner-track` exposes the manifest details
- `kvdf plugins disable owner-track` prevents owner-only surfaces from acting active
- `kvdf plugins enable owner-track` restores the bundle without affecting shared runtime files

## Related References

- [Core / Plugin Capability Split Study](../reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md)
- [Track Routing Governance](TRACK_ROUTING_GOVERNANCE.md)
- [Plugin Loader Runtime](../../src/cli/services/plugin_loader.js)

