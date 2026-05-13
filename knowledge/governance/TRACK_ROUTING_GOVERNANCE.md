# Track Routing Governance

Track Routing Governance defines how KVDF decides which session track to
activate when a person enters the system.

## Tracks

### 1. Framework Owner Track

Purpose:
- Maintain and extend Kabeeri itself.
- Use Evolution Steward and framework-owned runtime commands.
- Never create customer application work inside the framework development
  workspace.

Activated surface:
- `kvdf evolution`
- `kvdf evolution priorities`
- `kvdf evolution temp`
- `kvdf sync`
- `kvdf validate`
- `kvdf verify`
- `kvdf track status`

Blocked surface:
- `kvdf vibe`
- `kvdf ask`
- `kvdf capture`
- `kvdf task tracker`
- application creation workflows

### 2. Vibe App Developer Track

Purpose:
- Build a customer application with KVDF as the governed engine.
- Use vibe-first intake, task tracking, capture, blueprints, and temp queues.

Activated surface:
- `kvdf vibe`
- `kvdf ask`
- `kvdf capture`
- `kvdf temp`
- `kvdf task tracker`
- `kvdf blueprint`
- `kvdf questionnaire`
- `kvdf track status`

Blocked surface:
- `kvdf evolution`
- deferred restore of framework ideas
- framework-edit surfaces
- owner-only verification surfaces

## Entry Rule

The entry router must decide the track from workspace context first, not from
user preference text.

- Framework source with Owner state active routes to Framework Owner Track.
- User app workspace routes to Vibe App Developer Track.
- Uninitialized or ambiguous roots route to setup first.

If the track does not match the current workspace role, KVDF must stop and show
the blocked route instead of silently switching tracks.

The selected track is persisted in `.kabeeri/session_track.json` so later
commands can resume the same context without guessing.

`kvdf track status` shows the persisted route and active session track without
changing it. `kvdf track route` re-evaluates the current workspace and persists
the correct track decision back into `.kabeeri/session_track.json`.

## Session Contract

```text
entry -> determine role -> activate track -> show allowed commands -> block wrong-track access
```

The operator does not select the track manually unless the workspace is
ambiguous and requires initialization.

## Enforcement Sources

- `kvdf entry`
- `kvdf start`
- `kvdf track route`
- `kvdf resume`
- `kvdf guard`
- `kvdf app`
- `kvdf task`
- `kvdf evolution`

## Design Rule

Track routing is a safety system, not a convenience alias. The point of entry
must activate the correct track, and the wrong track must be visibly blocked.
