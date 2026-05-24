# Wi-Fi Data Sharing

`wifi_data_sharing` is a removable KVDF/KVDOS integration plugin for local Wi-Fi/LAN node identity, candidate discovery, pairing, a trusted-node registry, package transfer, and inbox review.

Phase 1 responsibilities:
- local node identity
- local state creation
- policy reporting
- reset and re-init flows

Phase 2 responsibilities:
- LAN discovery
- candidate collection
- discovery event logging

Phase 3 responsibilities:
- pairing and trust verification
- trusted-node registry

Phase 4 responsibilities:
- bounded package transfer between trusted nodes
- inbox quarantine and review

Later responsibilities:
- provider API surfaces
- future integration with governed packet workflows
- transfer security gates and quarantine policy enforcement
- resumable transfer sessions and outbox lifecycle
- provider dashboard and readiness reporting
- audit and evidence reports for local LAN sharing traceability
- optional integration contract for multi_ai_governance
- local two-node simulation and stress tests for contract verification

## Commands

```bash
kvdf wifi-data-sharing status
kvdf wifi-data-sharing init --name "Owner Laptop" --role owner
kvdf wifi-data-sharing state
kvdf wifi-data-sharing reset --confirm
kvdf wifi-data-sharing policy
kvdf wifi-data-sharing discover
kvdf wifi-data-sharing pairing create --node <candidate-node-id>
kvdf wifi-data-sharing pairing verify --node <candidate-node-id> --code <code>
kvdf wifi-data-sharing trust --node <node-id> --confirm
kvdf wifi-data-sharing trusted
kvdf wifi-data-sharing server start --port 47633
kvdf wifi-data-sharing server status
kvdf wifi-data-sharing package create --type <type> --input <path> --title "<title>"
kvdf wifi-data-sharing send --package <package-id> --to <node-id> --confirm
kvdf wifi-data-sharing inbox
kvdf wifi-data-sharing inbox show <package-id>
kvdf wifi-data-sharing inbox accept <package-id> --confirm
kvdf wifi-data-sharing inbox reject <package-id> --reason "..."
kvdf wifi-data-sharing outbox
kvdf wifi-data-sharing outbox show <package-id>
kvdf wifi-data-sharing outbox retry <package-id> --confirm
kvdf wifi-data-sharing outbox cancel <package-id> --reason "..."
kvdf wifi-data-sharing transfers
kvdf wifi-data-sharing transfer show <transfer-id>
kvdf wifi-data-sharing transfer resume --session <session-id> --confirm
kvdf wifi-data-sharing transfer sessions
kvdf wifi-data-sharing transfer clean --confirm
kvdf wifi-data-sharing security check --package <package-id>
kvdf wifi-data-sharing security results
kvdf wifi-data-sharing quarantine
kvdf wifi-data-sharing quarantine show <package-id>
kvdf wifi-data-sharing quarantine release <package-id> --confirm
kvdf wifi-data-sharing quarantine reject <package-id> --reason "..."
kvdf wifi-data-sharing advertise --duration 10000
kvdf wifi-data-sharing candidates
kvdf wifi-data-sharing provider
kvdf wifi-data-sharing readiness
kvdf wifi-data-sharing dashboard
kvdf wifi-data-sharing audit
kvdf wifi-data-sharing evidence
kvdf wifi-data-sharing simulate two-node
kvdf wifi-data-sharing simulate two-node --json
kvdf wifi-data-sharing simulate transfer --size 1024
kvdf wifi-data-sharing simulate security
```

## Safety model

- No external dependencies.
- No real project data transfer in Phase 1 or Phase 2.
- Discovery creates candidates only.
- Trust is never assigned automatically.
- Pairing codes are short-lived and stored as hashes only.
- Received packages are quarantined and never auto-applied.
- Trusted nodes are required for package transfer.
- Package transfer uses integrity hashes and bounded payloads.
- Outbox retries and transfer sessions are manual and durable.
- Dashboard, readiness, audit, and evidence reports are visibility-only and do not change network or trust state.
- Simulation is local-only, deterministic, and uses temp workspaces instead of real Wi-Fi.
- `multi_ai_governance` is not modified by this plugin.
- The provider API is intentionally optional and is designed for other removable plugins to consume.
