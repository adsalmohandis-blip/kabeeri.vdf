# Security

## Security goals

- never hardcode category branching
- never hide conflicts
- never auto-promote inactive categories
- never write outside the planning scope
- never convert incomplete data into a false-ready profile

## Safety posture

The plugin prefers explicit failure over silent assumptions. If a profile, source, or category pack is incomplete, the plugin records the gap and leaves the decision visible to the creator or owner track.
