# Roadmap Train And Evo Sprint Queue

The Roadmap Train is KVDF's shared ordered execution model for Owner Track and Viber/App Track.

## Purpose

- Keep planning, versioning, evolutions, and task punches in one durable FIFO queue.
- Prevent the next session from rebuilding the same plan from chat or stale runtime state.
- Make the current next action explicit and resumable.

## Tracks

- Owner Track uses `.kabeeri/owner_roadmap_train.json`.
- Viber/App Track uses `workspaces/apps/<app-slug>/.kabeeri/release_train.json`.
- If no app workspace exists, Viber can fall back to `.kabeeri/viber_release_train.json`.

## FIFO Order

The queue is ordered by:

1. major version
2. version stage
3. evo sprint
4. evolution
5. task punch

Completed items are skipped. Blocked items remain visible.

## Planning Methods

- `structured` favors stricter sequential gates.
- `agile` favors smaller sprints and lighter docs.
- `hybrid` uses a structured foundation, then agile Evo Sprints.
- `auto` chooses one of the above and explains why.

## Shared State Shape

- Roadmap train records major versions, version stages, evo sprints, evolutions, and task ids.
- Each item is persisted as JSON so the next session can resume without reconstructing the queue from chat.

## Next Action

- Build or refresh the train.
- Read the FIFO next evolution.
- Advance the current evolution when completed or blocked.
