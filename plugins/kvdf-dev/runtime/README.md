# Runtime

Runtime helpers, loader behavior, session state, execution contracts, packet
compilation, and executor-boundary reporting for KVDF.

The bundle-owned runtime entrypoint lives in `plugins/kvdf-dev/runtime/index.js`.

Batch execution supports three modes:
- `dry-run` for packet-only preview
- `review` for packet plus executor contract preview
- `execute` for governed task starts
