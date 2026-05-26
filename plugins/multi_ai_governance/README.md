# Multi-AI Governance Plugin

This bundle packages the multi-AI governance surface as a removable KVDF plugin
with a plugin-owned bootstrap and command surface.

It provides the operational contract for:

- leader sessions
- agent registration and heartbeats
- queue planning and dispatch
- conversation relay
- merge bundle provenance
- token, lock, assignment, and audit governance
- Evolution assignment bridge for owner/developer task distribution
- Evolution two-laptop workflow report for master/worker handoff
- Evolution session automation for master/worker startup and Wi-Fi broadcast/apply handoff
- IDE window governance for same-workspace AI tools
- local project governance for the same machine/repo across IDEs, terminals, and local agents
- Wi-Fi/LAN governance through the optional `wifi_data_sharing` transport plugin
- Kabeeri / KVDOS Cloud governance through the `kcloud_data_sharing` transport boundary when available
- GitHub provider governance through the optional `github_provider` provider layer

The runtime commands now load through `plugins/multi_ai_governance/bootstrap.js`.
That bootstrap owns the command exports while the shared CLI layer only mounts
the bundle.

`wifi_data_sharing` is an optional transport integration for local LAN packet
exchange and peer discovery. It does not change the governance authority of
this bundle. The `kvdf multi-ai wifi ...` commands now expose the governance
view for Wi-Fi/LAN nodes, trust, pairings, permissions, task tokens, leases,
conflicts, and policy decisions while still routing packet transport through
the optional wifi provider without auto-applying anything back into
multi-AI state. Packet consume still records an explicit `approve` or
`reject` decision so the authority model stays with `multi_ai_governance`
while the transport layer remains read-only.

## Plugin Contract

- Plugin id: `multi_ai_governance`
- Family: `framework_plugin`
- Track: `shared`
- Removal: supported
- Load strategy: `manifest_driven`

## Entry Surfaces

- `kvdf multi-ai status`
- `kvdf multi-ai queue`
- `kvdf multi-ai relay`
- `kvdf multi-ai sync`
- `kvdf multi-ai evolution status`
- `kvdf multi-ai evolution assign`
- `kvdf multi-ai evolution workflow`
- `kvdf multi-ai evolution session`
- `kvdf multi-ai ide status`
- `kvdf multi-ai ide register`
- `kvdf multi-ai ide tool status`
- `kvdf multi-ai ide tool register`
- `kvdf multi-ai ide agent status`
- `kvdf multi-ai ide agent register`
- `kvdf multi-ai ide lease status`
- `kvdf multi-ai ide lease create`
- `kvdf multi-ai ide release`
- `kvdf multi-ai ide conflicts`
- `kvdf multi-ai ide policy check`
- `kvdf multi-ai local status`
- `kvdf multi-ai local register`
- `kvdf multi-ai local client status`
- `kvdf multi-ai local client register`
- `kvdf multi-ai local session status`
- `kvdf multi-ai local session register`
- `kvdf multi-ai local heartbeat`
- `kvdf multi-ai local lease status`
- `kvdf multi-ai local lease create`
- `kvdf multi-ai local release`
- `kvdf multi-ai local conflicts`
- `kvdf multi-ai local scan`
- `kvdf multi-ai local policy check`
- `kvdf multi-ai wifi status`
- `kvdf multi-ai wifi nodes`
- `kvdf multi-ai wifi map-node`
- `kvdf multi-ai wifi trust status`
- `kvdf multi-ai wifi pair request`
- `kvdf multi-ai wifi pair approve`
- `kvdf multi-ai wifi pair deny`
- `kvdf multi-ai wifi revoke`
- `kvdf multi-ai wifi permissions`
- `kvdf multi-ai wifi token issue`
- `kvdf multi-ai wifi token status`
- `kvdf multi-ai wifi lease status`
- `kvdf multi-ai wifi lease create`
- `kvdf multi-ai wifi release`
- `kvdf multi-ai wifi conflicts`
- `kvdf multi-ai wifi policy check`
- `kvdf multi-ai wifi packet create`
- `kvdf multi-ai wifi packet send`
- `kvdf multi-ai wifi packet inbox`
- `kvdf multi-ai wifi packet inspect`
- `kvdf multi-ai wifi packet consume --confirm --decision approve|reject`
- `kvdf multi-ai kcloud status`
- `kvdf multi-ai kcloud nodes`
- `kvdf multi-ai kcloud map-node`
- `kvdf multi-ai kcloud map-project`
- `kvdf multi-ai kcloud trust status`
- `kvdf multi-ai kcloud permissions`
- `kvdf multi-ai kcloud token issue`
- `kvdf multi-ai kcloud token status`
- `kvdf multi-ai kcloud approval status`
- `kvdf multi-ai kcloud lease create`
- `kvdf multi-ai kcloud lease status`
- `kvdf multi-ai kcloud release`
- `kvdf multi-ai kcloud conflicts`
- `kvdf multi-ai kcloud packet check`
- `kvdf multi-ai kcloud policy check`
- `kvdf multi-ai kcloud audit`
- `kvdf multi-ai kcloud evidence`
- `kvdf multi-ai github-provider status`
- `kvdf multi-ai github-provider map-repo`
- `kvdf multi-ai github-provider sync status`
- `kvdf multi-ai github-provider operation request`
- `kvdf multi-ai github-provider operation status`
- `kvdf multi-ai github-provider operation execute`
- `kvdf multi-ai github-provider risk check`
- `kvdf multi-ai github-provider issue sync`
- `kvdf multi-ai github-provider pr sync`
- `kvdf multi-ai github-provider check run`
- `kvdf multi-ai github-provider comment`
- `kvdf multi-ai github-provider label`
- `kvdf multi-ai github-provider policy check`
- `kvdf multi-ai github-provider approval status`
- `kvdf multi-ai github-provider audit`
- `kvdf multi-ai github-provider evidence`
- `kvdf plugins install multi_ai_governance`
- `kvdf plugins enable multi_ai_governance`
- `kvdf plugins uninstall multi_ai_governance`
- `kvdf plugins disable multi_ai_governance`

## Bundle Layout

- `docs/` for plugin docs and overview material
- `commands/` for the plugin-owned governance and communications command layer, including IDE window governance
- `prompts/` for AI guidance and routing notes
- `schemas/` for bundle-specific state contracts
- `templates/` for reusable governance templates
- `tests/` for plugin bundle contract checks
- `governance/`, `runtime/`, `tracks/`, and `reports/` for family-specific material
- `integrations/` for optional provider clients such as `wifi_data_sharing`

## Source Of Truth

The active runtime state lives in `.kabeeri/multi_ai_governance.json`.
The shared governance rules live in `knowledge/governance/MULTI_AI_GOVERNANCE.md`.

Optional transport contracts are documented in:

- `plugins/multi_ai_governance/governance/WIFI_GOVERNANCE_PACKET_POLICY.md`
- `plugins/multi_ai_governance/governance/WIFI_DATA_SHARING_USAGE_POLICY.md`
- `plugins/multi_ai_governance/integrations/wifi_data_sharing_client.js`

Wi-Fi/LAN governance contracts are documented in:

- `plugins/multi_ai_governance/docs/CASE_3_WIFI_LAN_GOVERNANCE.md`
- `plugins/multi_ai_governance/docs/CASE_3_WIFI_POLICY_CHECKS.md`
- `plugins/multi_ai_governance/docs/CASE_3_WIFI_LEASES.md`
- `plugins/multi_ai_governance/docs/CASE_3_WIFI_DATA_SHARING_INTEGRATION.md`

KCloud governance contracts are documented in:

- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_GOVERNANCE.md`
- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_POLICY_CHECKS.md`
- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_LEASES.md`
- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_DATA_SHARING_INTEGRATION.md`
- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_ANALYSIS.md`
- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_GAP_REPORT.md`
- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_IMPLEMENTATION_PLAN.md`
- `plugins/multi_ai_governance/docs/CASE_4_KCLOUD_DATA_SHARING_BOUNDARY.md`
- `plugins/multi_ai_governance/docs/CASE_4_GITHUB_PROVIDER_BOUNDARY.md`
- `plugins/multi_ai_governance/docs/CASE_4_COMPLETION_REPORT.md`

GitHub provider governance contracts are documented in:

- `plugins/multi_ai_governance/docs/CASE_5_GITHUB_PROVIDER_GOVERNANCE.md`
- `plugins/multi_ai_governance/docs/CASE_5_GITHUB_PROVIDER_POLICY_CHECKS.md`
- `plugins/multi_ai_governance/docs/CASE_5_GITHUB_PROVIDER_INTEGRATION.md`
- `plugins/multi_ai_governance/docs/CASE_5_GITHUB_PROVIDER_BOUNDARY.md`
- `plugins/multi_ai_governance/docs/CASE_5_COMPLETION_REPORT.md`

IDE window governance contracts are documented in:

- `plugins/multi_ai_governance/docs/CASE_1_IDE_WINDOW_GOVERNANCE.md`
- `plugins/multi_ai_governance/docs/CASE_1_IDE_POLICY_CHECKS.md`
- `plugins/multi_ai_governance/docs/CASE_1_IDE_LEASES.md`

Local project governance contracts are documented in:

- `plugins/multi_ai_governance/docs/CASE_2_LOCAL_PROJECT_GOVERNANCE.md`
- `plugins/multi_ai_governance/docs/CASE_2_LOCAL_POLICY_CHECKS.md`
- `plugins/multi_ai_governance/docs/CASE_2_LOCAL_LEASES.md`
