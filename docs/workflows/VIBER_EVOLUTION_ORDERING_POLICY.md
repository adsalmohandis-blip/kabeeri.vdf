# Viber Evolution Ordering Policy

Viber evolution ordering is category-based and generic. It does not depend on
exact slice titles, app names, or one-off wording.

## Purpose

The ordering gate prevents task generation from starting before the app/product
boundary, discovery, approval, and safety steps are in the correct order.

This is a generic Viber/App rule that applies across all app workspaces.

## Categories

Required categories:

- `boundary_stabilization`
- `local_ui_foundation`
- `runtime_state`
- `discovery_spec`
- `tasking_approval`
- `cloud_commercial_control`
- `local_license_gate`
- `release_access`
- `safety_quality`
- `execution_review`
- `release_packaging`
- `bridge_evolution`

## Default Order

```text
boundary_stabilization
-> local_ui_foundation
-> runtime_state
-> discovery_spec
-> tasking_approval
-> cloud_commercial_control
-> local_license_gate
-> release_access
-> safety_quality
-> execution_review
-> release_packaging
-> bridge_evolution
```

## Hard Rules

- `boundary_stabilization` must come first.
- `discovery_spec` must come before `tasking_approval`.
- `tasking_approval` must come before `execution_review`.
- `safety_quality` must come before `execution_review`.
- `release_packaging` must come after `safety_quality`.
- `release_packaging` must come after `execution_review`.
- If `cloud_commercial_control` is enabled, it must come before `local_license_gate`.
- If `local_license_gate` is enabled, it must come before `release_access`.
- If `release_access` is enabled, it must come before `release_packaging`.
- `bridge_evolution` must not be used before `boundary_stabilization` is complete.

## Task Generation Preflight

Before `kvdf questionnaire generate-tasks --app <app-name>` runs, KVDF must
validate the evolution order and block task generation if:

- the questionnaire plan is incomplete or unapproved
- the source-of-truth map is missing
- the app docs package is missing
- the evolution slices are not approved or active
- future-only slices are mixed into the active release without approval
- the slice categories are out of order

## Failure Behavior

When the order is unsafe, KVDF prints a current validation report with the
current order, expected order, blocking errors, warnings, and a corrected
order suggestion.

The report is the source of truth for why task generation is blocked.

## Safety Notes

- Do not depend on evolution titles as the source of truth.
- Do not treat draft slices as executable work.
- Do not auto-promote future-only slices into the active release.
- Do not require GitHub for ordering validation.
- For Viber/App Track, current app files, docs, specs, source, and tests are
  primary truth.

