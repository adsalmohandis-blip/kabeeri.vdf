# Third-Party Notices

## Bootstrap

- Package name: Bootstrap
- Version: 5.3.8
- License: MIT
- Upstream project: https://getbootstrap.com/

Bootstrap assets are copied into this optional `bootstrap_ui` plugin so KVDF
Core does not need to depend on Bootstrap directly.

This plugin is a removable UI asset provider. It may be installed, enabled, or
uninstalled independently of KVDF Core.

Bootstrap CSS and JavaScript assets are included only for explicit opt-in use on
dashboard, docs, or app surfaces that need them.

The copied assets are not a Core runtime dependency and are not required for
KVDF Core to start or render its default surfaces.
