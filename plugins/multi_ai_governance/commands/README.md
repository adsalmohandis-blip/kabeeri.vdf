# Multi-AI Governance Commands

The `multi-ai` command surface is owned by this bundle.

- `multi_ai_governance.js`: leader sessions, agents, queues, merges, and sync.
- `evolution_assignment_bridge.js`: Evolution-led master/worker task assignment across the governance cases plus the generated two-laptop workflow and session automation reports.
- `multi_ai_communications.js`: conversations, relay inboxes, and message flow.
- `ide_window_governance.js`: IDE window sessions, tool presence, leases, conflicts, and policy decisions.
- `local_project_governance.js`: project-wide machine, client, session, lease, conflict, and policy governance across IDEs and terminals.
- `wifi_lan_governance.js`: Wi-Fi/LAN node identity, pairing, permissions, task tokens, leases, conflicts, and policy governance through `wifi_data_sharing`.
- `kcloud_governance.js`: Kabeeri / KVDOS Cloud node, tenant, project, permission, token, lease, conflict, and policy governance through the cloud transport boundary.
- `github_provider_governance.js`: GitHub provider mapping, governed operations, issue/PR/check orchestration, and policy checks through the optional `github_provider` layer.

The core CLI now mounts `plugins/multi_ai_governance/bootstrap.js` and forwards
the command calls into this bundle.
