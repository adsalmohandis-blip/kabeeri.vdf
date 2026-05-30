# Permissions

Required:

- write inside the governed app workspace root
- read category profiles and manifests
- write evidence under `10_evidence_audit/`

Blocked:

- marketplace publish
- direct install
- writing outside the app workspace root
- deleting user content
- path traversal

Documents safe write boundaries and no-delete/no-overwrite rules.
