# Wi-Fi Data Transfer Policy

`wifi_data_sharing` may move bounded data packages only between trusted local nodes.

## Rules

- Trusted nodes only.
- Candidate or revoked nodes cannot receive packages.
- Package review is required before any acceptance.
- Received data is quarantined in the inbox and is never auto-applied.
- No package is executed as code.
- Package size is capped by the plugin policy.
- Integrity hashes are required for every package.
- Owner or operator confirmation is required for send and accept actions.

## Storage

- Package catalog: `.kabeeri/wifi_data_packages.json`
- Inbox catalog: `.kabeeri/wifi_data_inbox.json`
- Transfer log: `.kabeeri/wifi_data_transfers.jsonl`

## Security boundary

This phase uses TCP frame helpers and local state records, but it does not transfer secrets, execute received payloads, or mutate `multi_ai_governance`.

## Acceptance model

An accepted inbox package is only marked as accepted in the plugin inbox. It is still not applied to any other KVDF or KVDOS state until a later explicit consume phase exists.
