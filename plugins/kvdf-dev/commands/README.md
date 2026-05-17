# KVDF Dev Commands

Framework-development command surfaces live here for the KVDF dev bundle.
The bundle-owned bootstrap lives in `plugins/kvdf-dev/bootstrap.js`.

The repo-wide cleaner workflow is exposed through `kvdf cleaner cleanup` or
`kvdf maintenance`, with `fast` and `slow` modes. Use `kvdf maintenance fast`
for a quick audit and `kvdf maintenance slow` for the strict evidence view.
Supporting commands include `kvdf cleaner inspect`, `kvdf cleaner relocate review --threshold 0.9`,
`kvdf cleaner relocate`, `kvdf cleaner report`, `kvdf cleaner approve --confirm`,
`kvdf cleaner execute`, and `kvdf cleaner finalize`.
