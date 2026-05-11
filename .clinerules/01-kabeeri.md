# Kabeeri Workspace Rules

## Scope
- Treat this repository as Kabeeri framework source, not a user app.
- Use Kabeeri governance before broad feature work.
- Respect the active Evolution priority and do not switch tasks without explicit Owner approval.

## Session Start
- Read `OWNER_DEVELOPMENT_STATE.md` before making changes.
- Check the current Evolution priorities and the latest resume state first.
- If a priority is already in progress, continue that priority before starting new work.

## Feature Requests
- Do not auto-import or auto-analyze `KVDF_New_Features_Docs/`.
- Only read `KVDF_New_Features_Docs/` when the Owner explicitly asks for it.
- When a new feature is requested, propose placement in Evolution priorities before implementing it.

## Code Changes
- Keep changes incremental and aligned with the current module boundaries.
- Prefer extracting safe slices from large files before moving broad runtime logic.
- Do not revert unrelated user changes.
- Do not expand scope just because a file is large.

## Validation
- Run the relevant Kabeeri checks after changes.
- Prefer `node --check`, `kvdf validate runtime-schemas`, and `kvdf conflict scan --json` for CLI/core work.
- If a test failure looks environmental, report that clearly instead of treating it as a product regression.

## Collaboration
- Keep status updates short and specific.
- Surface tradeoffs when a change could affect the framework boundary, task ordering, or deferred ideas.
