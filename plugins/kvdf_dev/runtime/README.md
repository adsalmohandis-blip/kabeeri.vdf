# Runtime

Runtime helpers, loader behavior, session state, execution contracts, packet
compilation, and executor-boundary reporting for KVDF.

The bundle-owned runtime entrypoint lives in `plugins/kvdf_dev/runtime/index.js`.

This folder contains the code that turns the plugin contract into runtime
artifacts. If the manifest says the bundle owns a capability, the runtime
helpers here should be able to produce or render it deterministically.

Batch execution supports three modes:
- `dry-run` for packet-only preview
- `review` for packet plus executor contract preview
- `execute` for governed task starts
