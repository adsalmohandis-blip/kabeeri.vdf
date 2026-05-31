# EVO_AUTO_020 Execution Report

## Priority

- ID: `evo-auto-020-two-track-entry`
- Title: `Two-Track Entry System`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

The first command in a session should route the operator into the correct track without forcing the human to manually reason about the framework-owner/app split. This priority makes the two-track entry point explicit and keeps the persisted decision visible for later resume.

The key idea is routing clarity:

- framework owner work starts in the owner track
- app-building work starts in the vibe app-developer track
- `resume`, `entry`, and `track status` all agree on the same route state
- the chosen track is persisted for later sessions

## Detailed checklist

1. Confirm the owner and app entry routes are distinguishable.
2. Confirm `resume`, `entry`, and `track status` resolve the same track state.
3. Keep the persisted session track visible in runtime state.
4. Preserve the owner/app split in docs and command help.
5. Keep the route decision resumable without relying on chat memory.

## Preconditions

- `kvdf resume` can resolve the current track.
- `kvdf entry` returns an explicit first-session route.
- `kvdf track status` reports the persisted track and next exact action.

## Guardrails

- Do not collapse owner and app routes into one generic start path.
- Do not lose the persisted session track once it is set.
- Do not let app work masquerade as framework-owner work.
- Do not let the entry route forget the next exact action for the current track.

## Validation flow

```bash
node bin/kvdf.js track status --json
node bin/kvdf.js entry --json
node bin/kvdf.js conflict scan
```

## Expected outputs

- The active track and next exact action are visible in JSON.
- The entry route matches the persisted session track.
- Evolution status advances to the role enforcement slice.

## Summary

`evo-auto-020` is complete because the repository already exposes the owner/app split through `resume`, `entry`, and `track status`, and the session track state keeps that decision durable for later resume. The next session can move on to enforcing the role boundary more strictly.
