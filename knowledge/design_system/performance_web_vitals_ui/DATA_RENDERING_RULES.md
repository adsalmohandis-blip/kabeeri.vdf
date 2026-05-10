# Data Rendering Performance Rules

## Tables And Lists

- Use pagination, virtualization, or progressive rendering for large data sets.
- Avoid rendering thousands of rows by default.
- Filters and search should be server-side or debounced when data is large.
- Preserve table height during loading to avoid layout jumps.
- Use empty, loading, error, no-results, and permission states for each data region.
- Bulk actions should not block the whole page when background processing is possible.

## Dashboards

- Load the shell and most important KPIs first.
- Defer secondary charts, activity streams, and exports.
- Each widget should fail independently.
- Skeletons should match final widget dimensions.
- Charts need fallback summaries and no-data states.

## AI Products

- Stream long outputs when possible.
- File analysis should show upload, parsing, processing, result, error, and retry states.
- Expensive history lists should paginate or lazy-load older items.
- Generated result panes should not reflow the prompt composer.

