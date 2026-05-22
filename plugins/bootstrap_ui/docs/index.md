# Bootstrap UI Plugin

`bootstrap_ui` is the optional Bootstrap asset provider plugin for KVDF Core.

It exists so Bootstrap can be used where it is explicitly wanted without making
Bootstrap a hard Core dependency.

## What It Provides

- A manifest-driven optional plugin bundle
- Copied Bootstrap CSS and JavaScript assets
- A safe HTML snippet helper for docs and dashboard surfaces
- A third-party notice that keeps Bootstrap licensing explicit

## Runtime Rules

- Offline only
- No external GitHub dependency
- No network fetches at runtime
- No `_temp_meta` dependency
- Removable and disabled by default

## Usage

- `kvdf bootstrap-ui status`
- `kvdf bootstrap-ui assets`
- `kvdf bootstrap-ui verify`
- `kvdf bootstrap-ui provider`
- `kvdf bootstrap-ui snippet`
- `kvdf plugins install bootstrap_ui`
- `kvdf plugins uninstall bootstrap_ui`

## Design Intent

Use this plugin only when a surface explicitly needs Bootstrap assets. Core
dashboards, docs, and CLI flows must continue to work when the plugin is absent.
The provider helper makes the fallback path explicit so HTML surfaces can stay
readable and render safely even when Bootstrap is unavailable.
