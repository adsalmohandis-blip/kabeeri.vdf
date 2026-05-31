# EVO_AUTO_020 Scope Statement

## Priority

- ID: `evo-auto-020-two-track-entry`
- Title: `Two-Track Entry System`
- Source: `new_features_docs_study`

## Scope

This priority routes sessions into Framework Owner Track or Vibe App Developer Track from the first entry point.

The scope includes:

- automatic first-session track routing
- persisted session-track state
- aligned `resume`, `entry`, and `track status` behavior
- clear owner/app next actions

## Out of scope

- forcing every command through the same start route
- removing the existing owner/app split
- making GitHub or any external provider mandatory for entry
- changing unrelated capability behavior

## Success criteria

- the correct track is visible from the first entry point
- the route persists for later sessions
- the next exact action is track-aware
- the docs and CLI help continue to describe the same split
