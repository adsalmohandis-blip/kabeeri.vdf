# Resumable Transfer Policy

`wifi_data_sharing` supports durable local transfer sessions so interrupted LAN sharing can be retried without turning the plugin into an execution engine.

## Policy Principles

- Retries are manual and controlled.
- Transfer sessions are durable until they are explicitly cleaned.
- Incomplete transfers do not create accepted packages.
- Received chunks are not executable.
- Accepted inbox packages still require the security gate and manual review.
- The plugin never auto-applies received data into other `.kabeeri` state.

## Lifecycle Rules

- `created`: the package exists in the outbox but has not been sent yet.
- `queued`: the transfer has been prepared for delivery.
- `sending`: the package is actively being delivered.
- `partially_sent`: at least one chunk has been delivered but the transfer is incomplete.
- `sent`: all required chunks were delivered.
- `received`: the target node has written the package into inbox/quarantine state.
- `quarantined`: the package is waiting for policy review.
- `accepted`: the package passed review and was accepted into the inbox review flow only.
- `rejected`: the package was rejected and stays isolated.
- `failed`: the transfer hit a blocking error and may be retried manually.
- `cancelled`: the operator stopped the transfer manually.
- `expired`: the session timed out and requires a new operator action.

## Session Handling

- Chunk manifests are generated from the package payload and chunk size policy.
- Missing chunks can be resumed from the transfer session record.
- Completed and expired sessions may be cleaned only with explicit confirmation.
- Retry state is preserved in the outbox and transfer-session records.

## Safety Boundaries

- Local resume operations do not bypass the security gate.
- A transferred package still lands in inbox/quarantine first.
- `multi_ai_governance` remains the authority for governed AI work and is not mutated by transfer lifecycle commands.
