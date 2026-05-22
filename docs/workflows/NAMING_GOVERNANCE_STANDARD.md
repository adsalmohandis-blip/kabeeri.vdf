# Naming Governance Standard

KVDF Naming Governance keeps machine-readable IDs stable and human-readable
titles flexible for the two supported tracks:

- Owner Track: framework work, policy work, planner work, and governance work.
- Viber/App Track: app delivery work under a specific app slug.

## Core Rules

1. IDs are deterministic and lowercase.
2. IDs use kebab-case segments, except version tokens that preserve semver dots in the version portion of the ID.
3. IDs must never change after creation.
4. Titles may be improved later without changing the ID.
5. Owner and Viber IDs must not collide.
6. Viber IDs must always include the app slug.
7. Slugs are derived deterministically from the supplied title or explicit slug.
8. No ID should hardcode a human app name; use the app slug instead.
9. After materialization, IDs and slugs are frozen for that record.
10. Normalized IDs are preferred, but legacy IDs are preserved beside them when older runtime state still exists.

## Owner Track Patterns

- Plan ID: `oplan-<yyyyMMdd>-<nn>-<slug>`
- Version ID: `kvdf-v<major>.<minor>.<patch>-<label>`
- Evolution ID: `oevo-<version-slug>-<nn>-<slug>`
- Task ID: `otask-<evolution-id>-<nn>-<verb-object>`

## Viber/App Track Patterns

- Plan ID: `vplan-<app-slug>-<yyyyMMdd>-<nn>-<slug>`
- Version ID: `<app-slug>-v<major>.<minor>.<patch>-<label>`
- Evolution ID: `vevo-<app-slug>-<version-slug>-<nn>-<category>-<slug>`
- Task ID: `vtask-<app-slug>-<evolution-id>-<nn>-<workstream>-<verb-object>`

## Normalized Values

- Version slugs are normalized from semver-like input such as `v0.2.0` into
  `v0-2-0` for use inside evolution and task IDs.
- Evolution categories are normalized into kebab-case from the approved list:
  `boundary-stabilization`, `local-ui-foundation`, `runtime-state`,
  `discovery-spec`, `tasking-approval`, `cloud-commercial-control`,
  `local-license-gate`, `release-access`, `safety-quality`,
  `execution-review`, `release-packaging`, `bridge-evolution`.
- Task workstreams are normalized into kebab-case from the approved list:
  `docs`, `frontend`, `backend`, `database`, `api`, `security`, `testing`,
  `devops`, `source-control`, `handoff`, `dashboard`, `ai-learning`,
  `plugin`, and `governance`.

## CLI Surfaces

- `kvdf naming preview` shows the generated ID for a proposed object.
- `kvdf naming validate` scans local runtime state, reports invalid IDs,
  missing `normalized_id` values, legacy-only objects, duplicates, and
  cross-track collisions, and does not write runtime state.
- `kvdf naming migrate --dry-run` suggests a read-only migration plan for
  backfilling `normalized_id` values while preserving legacy IDs.

## System-Wide Validation

Naming Governance is not only a planner preview feature. KVDF Core also uses
the same rules to validate runtime state, dashboards, handoff/reporting data,
and any derived records that still reference plans, versions, evolutions, or
tasks.

- Runtime state scanned: `.kabeeri/planner.json`, `.kabeeri/evolution.json`,
  `.kabeeri/tasks.json`, and `.kabeeri/task_trash.json` when present.
- Optional report and handoff references may also be scanned when safely
  available.
- Dashboard summaries only display read-only counts from source objects.
- Materialized records keep their legacy IDs as compatibility metadata, but the
  normalized ID is the preferred machine-readable key for future workflow use.

## Examples

```bash
kvdf naming preview --track owner --type plan --title "Planner Readiness" --json
kvdf naming preview --track vibe --app booking --type task --title "Build Booking Form" --evolution vevo-booking-v0-2-0-03-safety-quality-validation-gate --workstream frontend --json
kvdf naming validate --json
kvdf naming migrate --dry-run --json
```
