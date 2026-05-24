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
- optional wifi packet workflow for transport-only LAN delivery

The runtime commands now load through `plugins/multi_ai_governance/bootstrap.js`.
That bootstrap owns the command exports while the shared CLI layer only mounts
the bundle.

`wifi_data_sharing` is an optional transport integration for local LAN packet
exchange. It does not change the governance authority of this bundle. The
`kvdf multi-ai wifi ...` commands create packet metadata, inspect or consume
packet receipts, and route sends through the optional wifi provider without
auto-applying anything back into multi-AI state.

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
- `kvdf multi-ai wifi status`
- `kvdf multi-ai wifi nodes`
- `kvdf multi-ai wifi packet create`
- `kvdf multi-ai wifi packet send`
- `kvdf multi-ai wifi packet inbox`
- `kvdf multi-ai wifi packet inspect`
- `kvdf multi-ai wifi packet consume`
- `kvdf plugins install multi_ai_governance`
- `kvdf plugins enable multi_ai_governance`
- `kvdf plugins uninstall multi_ai_governance`
- `kvdf plugins disable multi_ai_governance`

## Bundle Layout

- `docs/` for plugin docs and overview material
- `commands/` for the plugin-owned governance and communications command layer
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
