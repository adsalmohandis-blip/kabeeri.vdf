# KCloud Data Sharing

`kcloud_data_sharing` is a removable transport shell for governed Kabeeri /
KVDOS cloud data sharing.

## Authority Split

- `multi_ai_governance` decides policy, approval, and audit.
- `ai_tool_adapter` can provide tool identity.
- `kcloud_data_sharing` only transmits and receives governed cloud data.

## Phase 1 Contract

- local runtime root: `.kabeeri/kcloud/`
- config file: `.kabeeri/kcloud/config.json`
- no real cloud connection required
- no transmit or receive logic yet

## Phase 2 Contract

- local event storage root remains `.kabeeri/kcloud/`
- JSONL event queues are stored locally only
- outbox, inbox, ACK log, dead-letter, and sync cursor files are created locally
- payload hashing is deterministic and local
- there is still no real cloud transmission yet

## Phase 3 Contract

- a mockable cloud client abstraction is used for transmit and ACK handling
- outbound events flow from outbox to the cloud client
- duplicate event IDs do not create duplicate cloud actions
- failed events retry with exponential backoff and dead-letter when final
- `kvdf kcloud transmit`, `kvdf kcloud transmit-one`, and `kvdf kcloud retry-failed` are available

## Phase 4 Contract

- inbound cloud events are pulled with a sync cursor
- received events are validated before they are stored
- invalid hashes and wrong project IDs are rejected
- received events are ACKed back to the cloud client
- `kvdf kcloud receive`, `kvdf kcloud receive-one`, and `kvdf kcloud ack-received` are available

## Phase 5 Contract

- `kvdf kcloud sync` runs the full duplex transmit/receive flow
- `kvdf kcloud sync --once` runs one cycle
- `kvdf kcloud sync --watch` keeps running cooperatively
- `kvdf kcloud sync --interval <seconds>` sets the pause between cycles

## Phase 6 Contract

- outbound and inbound operations ask `multi_ai_governance` for policy decisions when available
- restricted events are blocked by default if governance is unavailable
- approval-required events are recorded locally for handoff and audit

## Phase 7 Contract

- `kvdf kcloud audit` reports the local transport audit trail
- `kvdf kcloud readiness` reports the transmit/receive readiness matrix
- readiness checks validate the transport shell, payload hashing, deduplication, retry handling, dead-letter handling, and governance adapter availability

## Commands

```bash
kvdf kcloud status
kvdf kcloud init
kvdf kcloud queue-outbox
kvdf kcloud queue-inbox
kvdf kcloud inspect-events
kvdf kcloud outbox
kvdf kcloud inbox
kvdf kcloud transmit
kvdf kcloud transmit-one <event_id>
kvdf kcloud retry-failed
kvdf kcloud receive
kvdf kcloud receive-one <event_id>
kvdf kcloud ack-received <event_id>
kvdf kcloud sync
kvdf kcloud audit
kvdf kcloud readiness
```

## Config Contract

The cloud project config stores:

- `project_id`
- `repo_url`
- `cloud_project_id`
- `cloud_endpoint`
- `transmit_enabled`
- `receive_enabled`
- `authority_plugin`
- `created_at`
- `updated_at`

## Local Event Files

- `.kabeeri/kcloud/outbox.jsonl`
- `.kabeeri/kcloud/inbox.jsonl`
- `.kabeeri/kcloud/ack-log.jsonl`
- `.kabeeri/kcloud/dead-letter.jsonl`
- `.kabeeri/kcloud/sync-cursor.json`
- `.kabeeri/kcloud/transmit-log.jsonl`
- `.kabeeri/kcloud/receive-log.jsonl`
- `.kabeeri/kcloud/audit-log.jsonl`
