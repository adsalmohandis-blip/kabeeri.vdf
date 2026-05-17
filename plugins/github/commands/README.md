# GitHub Commands

The GitHub command surface now lives in this bundle.

- `github.js`: command entrypoint used by the core shim and the plugin bootstrap.

The bundle is loaded through `plugins/github/bootstrap.js`, which is mounted by
the plugin loader when `github` is enabled.
