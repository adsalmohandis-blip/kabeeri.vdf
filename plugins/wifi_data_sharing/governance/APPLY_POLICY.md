# Wi-Fi Data Sharing Apply Policy

This policy governs the explicit apply bridge for already approved multi-AI packets.

## Purpose

- The apply bridge records an explicit human-approved bridge action.
- It does not change `multi_ai_governance` authority.
- It does not auto-apply packets.
- It does not execute or interpret packet payloads.

## Rules

- A packet must already be explicitly approved before it can be applied.
- `--confirm` is required for every apply, reject, or cancel action.
- Rejected packets remain rejected.
- Cancelled apply records remain visible for audit.
- Apply records are plugin-owned evidence only.

## Allowed Decisions

- `apply`
- `reject`
- `cancel`

## Safety Guarantees

- No payload execution.
- No hidden queue mutation.
- No authority transfer from `multi_ai_governance` to `wifi_data_sharing`.
- All bridge actions are auditable through local state and event logs.

