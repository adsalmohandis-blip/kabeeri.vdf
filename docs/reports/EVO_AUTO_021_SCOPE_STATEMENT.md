# EVO_AUTO_021 Scope Statement

## Priority

- ID: `evo-auto-021-role-track-enforcement`
- Title: `Role and Track Enforcement`
- Source: `new_features_docs_study`

## Scope

This priority blocks cross-track work and keeps sessions locked to the correct role, track, and workspace context.

The scope includes:

- owner-only enforcement for framework-owner work
- app-scoped enforcement for vibe/app work
- workspace-context precedence over stale session track data
- explicit mismatch warnings and blocked features

## Out of scope

- changing the two-track routing decision itself
- removing the app track
- removing the owner track
- making cross-track work silent or implicit

## Success criteria

- role gates are visible and enforced
- workspace context remains the source of truth when it disagrees with stale session data
- blocked features remain blocked
- the user can see the next correct action instead of guessing
