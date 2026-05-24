# Discovery Protocol

This document describes the KVDF Wi-Fi/LAN discovery protocol used by `wifi_data_sharing`.

## Important clarification

This is **not** full mDNS or DNS-SD compliance.
It is a small KVDF discovery beacon protocol built from scratch with Node.js core modules only.

## Goals

- discover nearby trusted KVDF/KVDOS nodes
- collect candidate metadata
- keep discovery local and non-destructive

## Non-goals

- no automatic trust
- no project data transfer
- no RFC-compliant mDNS claim
- no governance mutation

## Protocol fields

- `protocol`: `kvdf-wifi-data-sharing`
- `protocol_version`: `v1`
- `message_type`: `announce`, `query`, or `response`
- `service_name`: `wifi_data_sharing`
- `node_id`
- `display_name`
- `hostname`
- `platform`
- `kvdf_version`
- `plugin_version`
- `capabilities`
- `pairing_required`
- `transfer_enabled`
- `sent_at`

## Candidate rule

Discovered nodes are stored as `candidate` entries only.
The plugin does not promote them to trusted nodes.

