# Runtime

Runtime helpers, loader behavior, session state, execution contracts, packet
compilation, and executor-boundary reporting for KVDF.

Batch execution supports three modes:
- `dry-run` for packet-only preview
- `review` for packet plus executor contract preview
- `execute` for governed task starts
