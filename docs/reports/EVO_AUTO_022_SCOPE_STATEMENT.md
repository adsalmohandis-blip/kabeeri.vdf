# EVO_AUTO_022 Scope Statement

## Priority

- ID: `evo-auto-022-pack-router`
- Title: `Pack Router and Project Profile System`
- Source: `new_features_docs_study`

## Scope

This priority routes each project to the right pack set and profile before any broad generation or implementation starts.

The scope includes:

- durable project profile routing
- scale-specific prompt-pack recommendations
- profile and pack status/report commands
- selected pack guidance for later composition

## Out of scope

- starting broad generation before profile routing
- making the pack selection generic or ambiguous
- changing unrelated runtime behavior
- removing the profile router in favor of manual selection only

## Success criteria

- a project goal can be routed to a profile
- the profile can drive a pack recommendation
- the recommendation is visible in JSON and human-readable forms
- later prompts or reports can reuse the routed profile and pack set
