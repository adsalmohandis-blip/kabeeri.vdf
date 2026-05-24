# Wi-Fi Data Sharing Simulation

This folder contains the local simulation harness for `wifi_data_sharing`.

## What it is

- A deterministic, local-only two-node simulation.
- A contract/stress harness for discovery, pairing, trust, package transfer, security, inbox/quarantine, and provider checks.
- A temporary-workspace workflow that uses Node.js core modules only.

## What it is not

- It is not real Wi-Fi or real LAN network compatibility testing.
- It is not a firewall, multicast, or mDNS compliance test.
- It is not a replacement for live multi-machine validation.
- It does not mutate `multi_ai_governance`.

## Why it exists

Phase 9 of `wifi_data_sharing` uses simulation to verify the plugin's contracts without needing multiple computers or external network access.

The simulation verifies:

- node initialization
- candidate discovery mirroring
- pairing and trust flows
- package creation and delivery
- inbox and quarantine lifecycle
- security gate decisions
- provider and stress-report behavior

## Commands

```bash
kvdf wifi-data-sharing simulate two-node
kvdf wifi-data-sharing simulate two-node --json
kvdf wifi-data-sharing simulate transfer --size 1024
kvdf wifi-data-sharing simulate security
```

## Cleanup

Simulation workspaces are created under the system temporary directory and are removed automatically unless `--keep` is passed.
