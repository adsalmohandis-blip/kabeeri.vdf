# Viber Release Train

The Viber Release Train is the shared FIFO execution model for app and product delivery.

## Rules

- Use the app workspace as the primary storage location when it exists.
- Persist the release train under `workspaces/apps/<app-slug>/.kabeeri/release_train.json`.
- Use `.kabeeri/viber_release_train.json` only as a fallback when an app workspace is unavailable.

## Gates

Viber readiness should move through:

1. docs
2. evolution
3. task
4. validation
5. security
6. handoff
7. publish readiness

## Output

- The next version and next evolution must be explicit.
- The release train should expose the first unblocked FIFO evolution.
- Publishing is still explicit and gated elsewhere.
