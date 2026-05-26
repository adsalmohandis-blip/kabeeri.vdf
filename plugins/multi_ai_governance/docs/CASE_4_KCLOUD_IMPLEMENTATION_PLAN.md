# Case 4 KCloud Implementation Plan

## Phase 1

- Inspect the current plugin surface and cloud-related boundaries.
- Record what exists, what is missing, and what belongs outside this case.
- Write the Case 4 analysis and gap docs before coding.

## Phase 2

- Add cloud node, tenant, project, and identity mapping state.
- Add CLI commands for cloud status, mapping, and trust visibility.
- Register the runtime schemas.

## Phase 3

- Add cloud trust, role permissions, and cloud task tokens.
- Add approval-rule state and CLI commands.
- Keep authority in `multi_ai_governance`.

## Phase 4

- Add cloud leases, packet governance, and conflict detection.
- Detect collisions with Cases 2 and 3 local/LAN state.
- Keep `kcloud_data_sharing` as transport/sync only if it exists.

## Phase 5

- Add policy checks, audit, evidence, tests, docs, and completion reporting.
- Verify Case 1 to Case 3 regressions still pass.
- Keep `github_provider` outside the case.

