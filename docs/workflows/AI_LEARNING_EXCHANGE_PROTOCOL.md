# AI Learning Exchange Protocol

## Purpose

This workflow keeps AI learning local-first, sanitized, reviewable, and Owner-approved before anything is promoted into KVDF Core shared knowledge.

## When To Run

- After a repeated failure pattern appears in an app workspace.
- Before promoting learning into KVDF Core shared knowledge.
- Before reusing imported learning across Owner, Vibe, or Plugin tracks.
- Before future cloud collection, if cloud-ready metadata is needed.

## Source Of Truth

1. Current workspace docs, manifests, specs, configs, source, and tests
2. Current workspace local runtime learning state
3. Git history if available
4. Shared knowledge files only after Owner approval
5. User global cache as reusable local support
6. Chat history as supporting context only

## Flow

1. Capture local learning in the current workspace with `kvdf learn capture` or `kvdf learn fast-path`.
2. Export a sanitized package with `kvdf learn export`.
3. Owner Track imports the package with `kvdf learn import`.
4. Owner reviews candidates with `kvdf learn review`.
5. Owner approves reusable learning with `kvdf learn promote --confirm`.
6. Owner may reject non-reusable items with `kvdf learn reject`.
7. Teams can inspect approved shared learning with `kvdf learn shared`.
8. Local apps can sync a safe cache with `kvdf learn cache update`.

## Safety Rules

- Capture stays local to the current workspace.
- Export packages must be sanitized and portable.
- Vibe/App Track cannot write directly into KVDF Core shared learning files.
- Owner Track is the only track allowed to promote learning into KVDF Core shared knowledge.
- Do not auto-promote imported candidates.
- Do not store secrets, tokens, credentials, or private client-specific content in shared learning.
- Do not treat cloud-ready metadata as cloud upload.

## Cloud Readiness

- `cloud_ready`
- `consent_required`
- `anonymized`
- `sensitive_items_removed`
- `dataset_tags`
- `training_eligible`
- `owner_approved_for_cloud`

These fields are metadata only. They do not upload learning and do not authorize model training on their own.

## Local Cache

The optional user global cache lives under `~/.kabeeri/learning/` and helps local workspaces reuse safe patterns without dirtying KVDF Core.

## Stop Conditions

Stop and ask the Owner if:

- the candidate is ambiguous
- the candidate looks sensitive
- the candidate is app-specific and cannot be generalized
- the workspace source-of-truth is stale or conflicting
- a promotion would cross track boundaries without approval
