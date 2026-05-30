# Plugin Permissions

- may create app workspaces only under `workspaces/apps/<app-slug>/`
- may validate and repair missing folders safely
- may not delete user files or invent stack layouts
- may not publish or promote anything directly
# Plugin Permissions

Required permissions:

- safe filesystem write access within `workspaces/apps/<app_slug>/`
- read access to category profiles and workspace manifests
- evidence-write access under `10_evidence_audit/`

Forbidden permissions:

- direct marketplace publish
- direct install promotion
- writing outside the governed workspace root
- deleting user files
- writing non-empty files without an explicit repair/force path
