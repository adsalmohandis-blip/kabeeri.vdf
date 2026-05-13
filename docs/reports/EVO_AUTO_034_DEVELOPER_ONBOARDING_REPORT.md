# EVO Auto 034 - Developer Onboarding Report

## Summary

This report documents the developer onboarding flow added for `kvdf onboarding`.
The command gives a guided first-session route for new developers and returning
contributors so they can enter the correct track, confirm the current workspace,
choose a safe next step, and reload the persisted onboarding report without
relying on chat history.

## What Was Added

- `kvdf onboarding`
- `kvdf onboarding report`
- JSON output with a `session_onboarding` report type
- guided text output for the first-session route
- persisted onboarding report state in `.kabeeri/reports/session_onboarding.json`
- onboarding coverage in the docs site
- CLI help and command reference updates
- integration coverage for the onboarding command

## Operational Rules

- The onboarding flow starts by identifying the current session mode.
- Framework-owner sessions are guided toward `resume`, `evolution priorities`,
  and the active temporary queue.
- The flow emphasizes the next exact command before any code edit.
- The command is safe to run repeatedly because it reads state instead of
  mutating it.

## Validation

- `node bin/kvdf.js onboarding`
- `node bin/kvdf.js onboarding --json`
- `node bin/kvdf.js onboarding report --json`
- `node bin/kvdf.js docs generate`
- `node -c src/cli/commands/resume.js`
- `node -c src/cli/index.js`
- `node -c src/cli/ui.js`

## Outcome

The repository now has a dedicated onboarding surface that helps developers
restart safely, confirm their track, and move into the right command sequence
without guessing. The report is now persisted locally so the same onboarding
guidance can be recalled later without re-deriving it from chat history.
