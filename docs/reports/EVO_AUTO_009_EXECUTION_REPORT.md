# EVO_AUTO_009 Execution Report

## Priority

- ID: `evo-auto-009`
- Title: `UI/UX questionnaire linkage`
- Source: `owner_conversation`
- Status: `done`

## Why this priority exists

The questionnaire pipeline already carries product, delivery, and UI/UX context. This priority keeps the missing UI decisions visible in the same places where the project is resumed, reviewed, and converted into work so the next session does not lose product intent.

The key idea is consistency:

- questionnaire coverage should surface missing UI decisions
- resume output should point at the next UI/UX decision
- task generation should emit explicit frontend decision work instead of burying the gap
- the planning flow should stay fail-closed until the questionnaire is reviewed and approved

## Detailed checklist

1. Confirm the questionnaire command surface exposes flow, review, approve, missing, and generate-tasks actions.
2. Confirm resume output highlights pending UI/UX decisions from questionnaire reports.
3. Confirm task generation emits explicit frontend UI decision tasks when the questionnaire is still incomplete.
4. Keep the questionnaire planning pack fail-closed until review and approval are complete.
5. Preserve provenance so generated tasks can be traced back to questionnaire answers and missing-answer reports.

## Preconditions

- Questionnaire planning is already available in the runtime.
- The UI/UX advisor and delivery-mode advisor are part of the planning pack.
- Resume and task-generation commands already inspect questionnaire state.

## Guardrails

- Do not hide missing UI decisions behind generic task generation.
- Do not skip review and approval before generating tasks.
- Do not treat the questionnaire planner as complete if missing-answer reports still point at UI gaps.
- Do not rely on chat memory instead of the questionnaire artifacts.

## Validation flow

```bash
node bin/kvdf.js questionnaire --help
node bin/kvdf.js questionnaire flow
node bin/kvdf.js evolution status
node bin/kvdf.js conflict scan
```

## Expected outputs

- Resume output points at the next explicit UI/UX decision.
- Questionnaire review surfaces missing UI decisions clearly.
- Task generation emits frontend decision work when needed.
- The questionnaire planning pack remains reviewable and approval-gated.

## Summary

`evo-auto-009` is the connective tissue between questionnaire intake and UI-sensitive task creation. The runtime already exposes that linkage, so this priority is now recorded as complete and the queue can move on to the next planning step.
