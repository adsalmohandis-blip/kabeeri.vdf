# Wi-Fi Data Sharing Release Policy

This policy governs release readiness, integrity checks, backup/restore safety, and local rollout hardening.

## Purpose

- Validate the plugin state before release-oriented changes.
- Record integrity checks over the local `.kabeeri` runtime state.
- Provide backup and restore support with explicit confirmation.
- Keep release hardening local, deterministic, and fail-closed.

## Rules

- Backups are explicit and local-only.
- Restore requires `--confirm`.
- Restore must not write outside `.kabeeri/`.
- Integrity checks must fail closed when required files are missing or unreadable.
- Release readiness is advisory and does not auto-publish anything.
- `multi_ai_governance` remains the authority model for packet decisions.

## Safety Guarantees

- No external dependencies.
- No network execution.
- No auto-apply.
- No auto-migration of governance records.
- No silent overwrite without explicit confirmation.

