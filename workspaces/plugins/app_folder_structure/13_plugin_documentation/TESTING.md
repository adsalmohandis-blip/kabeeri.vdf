# Testing

The test surface should prove:

- status reporting works
- create/validate/repair/manifest/print behave safely
- underscore slugs are used
- category profiles are loaded and validated
- `08_source/` stays stack-adaptive
- non-empty files are preserved
- the canonical full workspace set exists
- no deep nested plugin root is created

Regression tests belong in the plugin package `tests/` tree and the workspace contract suite.
