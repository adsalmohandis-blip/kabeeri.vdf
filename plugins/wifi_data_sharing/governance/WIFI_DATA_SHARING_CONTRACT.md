# Wi-Fi Data Sharing Contract

`wifi_data_sharing` is a removable integration plugin for trusted KVDF/KVDOS nodes on the same Wi-Fi or LAN.

## Scope

- Node identity
- Discovery
- Candidate registry
- Local state
- Policy visibility
- Pairing, trust, inbox quarantine, and bounded package transfer in later phases

## Explicit non-goals for Phase 1

- No packet exchange for project data
- No real transfer pipeline
- No trust promotion
- No governance replacement
- No AI task routing

## Ownership rules

- Core stays thin and routes to the plugin.
- The plugin owns its own state file.
- Discovery data is local evidence only.
- `multi_ai_governance` remains the authority for AI governance.

## Runtime state

- Primary state file: `.kabeeri/wifi_data_sharing.json`
- Discovery log: `.kabeeri/wifi_data_discovery.jsonl`
- Package catalog: `.kabeeri/wifi_data_packages.json`
- Inbox catalog: `.kabeeri/wifi_data_inbox.json`
- Transfer log: `.kabeeri/wifi_data_transfers.jsonl`
