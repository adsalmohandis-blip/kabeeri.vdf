# AI Learning Promotion Rules

## Purpose

Promotions move safe, reusable learning from imported candidates into KVDF Core shared knowledge.

## Rules

- Owner track is the only track allowed to promote candidates into `knowledge/ai_learning/`.
- Promotion requires an explicit `--confirm`.
- Capture stays local to the current workspace.
- Export packages must be sanitized before import or cache update.
- Reject private, secret, token, or client-specific content.
- Do not promote raw app-specific file paths unless the rule has been generalized.
- Cloud-ready fields are metadata only.
- `owner_approved_for_cloud` stays false unless an explicit cloud approval flag is used.
- Shared learning must stay reusable across owner, vibe, and plugin tracks.

## Approval Criteria

- The candidate solves a repeated problem, not a one-off.
- The fix can be generalized without exposing sensitive details.
- The candidate does not depend on a single app path, secret, or transient runtime state.
- The candidate is safe to inject into Planner prompt-context.

## Cloud Readiness

- `cloud_ready` is metadata only in this task.
- Future cloud export needs consent, anonymization, dataset review, and a separate cloud workflow.
