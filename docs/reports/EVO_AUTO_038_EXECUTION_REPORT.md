# EVO_AUTO_038 Execution Report

## Priority

- ID: `evo-auto-038-full-task-coverage`
- Title: `Full Task Coverage Workflow`
- Source: `new_features_docs_study`
- Status: `done`

## Why this priority exists

Full task coverage keeps every visible task broken into complete execution slices so nothing is left floating outside the queue. The coverage board already exists and currently reports an empty visible task set, which makes this slice a coverage contract rather than a structural rewrite.

The key idea is completeness:

- every visible task should have a coverage representation
- slices should be complete rather than partial
- the board should make the absence of tasks explicit instead of hiding it
- the next session should know whether a task is fully covered or not

## Detailed checklist

1. Keep the task coverage board available as a structured report.
2. Keep the coverage policy explicit as `full_task_coverage`.
3. Keep the summary readable even when there are zero visible tasks.
4. Preserve the empty-board case as a valid outcome.
5. Avoid leaving tasks partially represented outside the coverage queue.

## Preconditions

- `kvdf tasks coverage --json` exists.
- `.kabeeri/reports/task_coverage_board.json` exists.
- The coverage board is mapped in the runtime schema registry.

## Guardrails

- Do not treat an empty task list as an error when it is explicitly reported.
- Do not remove the coverage policy from the report.
- Do not allow a task to be visible without a full coverage slice.

## Validation flow

```bash
node bin/kvdf.js tasks coverage --json
node bin/kvdf.js conflict scan
node bin/kvdf.js evolution status
```

## Expected outputs

- The coverage board stays readable and valid.
- The runtime schema registry includes the coverage board report.
- The next session can resume without reconstructing the board.

## Summary

`evo-auto-038` is complete because the task coverage board exists, reports the empty visible-task case honestly, and now has a matching runtime schema mapping. The next session can move on to blocked scenario reporting with the same coverage contract.
