# Security Gate Policy

KVDF security is split into two layers:

- `security-auditor` is the optional scanning plugin.
- KVDF Core security gate policy decides whether the latest scan is advisory, required, warning, or blocking.

## Policy Source

The runtime policy file is:

```text
.kabeeri/policies/security_gate_policy.json
```

If the file is missing, KVDF Core uses this default policy:

```json
{
  "security_gate_policy_version": "1",
  "default_required": false,
  "strict_blocking": false,
  "required_scopes": [],
  "required_tracks": [],
  "required_before": [],
  "blocked_statuses": ["blocked"],
  "warning_statuses": ["warning"],
  "missing_plugin_behavior": "warn",
  "notes": ["Default policy is non-blocking unless explicitly configured."]
}
```

## Required Determination

Security gate becomes required when any of these are true:

- `default_required` is `true`
- the active scope is in `required_scopes`
- the active track is in `required_tracks`
- the active lifecycle moment is in `required_before`
- the command explicitly passes `--required`

If none of those are true, the gate is optional.

## Blocking Rule

- If the gate is optional, KVDF never blocks on security.
- If the gate is required and the latest scan is blocked, KVDF blocks only when `strict_blocking` is `true` or the command passes `--strict`.
- If the gate is required and the plugin is missing or disabled, KVDF blocks only when `missing_plugin_behavior` is `block`.
- Otherwise KVDF warns and keeps the workflow local-first.

## Lifecycle Surfaces

Security gate summaries appear in:

- task completion
- evolution closeout
- handoff readiness
- owner dashboard
- viber dashboard
- planner and materialized execution summaries

The gate summary always includes the plugin status, the policy source, the required/strict flags, the latest scan summary when available, and the next action.

## Tracks

Security gate policy applies across:

- owner track
- vibe/app track
- plugin track

The `security-auditor` plugin remains optional and removable. Core policy should never force the plugin into every workflow unless the active policy explicitly requires it.
