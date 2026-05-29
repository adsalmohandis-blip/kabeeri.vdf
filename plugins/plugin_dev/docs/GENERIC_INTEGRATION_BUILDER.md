# Generic Integration Builder

Any plugin developed through `plugin_dev` can declare integration with any target plugin slug.

The integration builder must:
- stay generic
- create contracts, tests, and evidence
- include fallback behavior
- block readiness when required integrations are invalid
