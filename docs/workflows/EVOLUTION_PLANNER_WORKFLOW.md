# Evolution Planner Workflow

## Overview

The KVDF Planner Layer turns governed repository context into the next
approved Evolution, a Task Punch, and a Codex-ready prompt.

This workflow is deterministic and local-first. It does not replace the Owner.

## Workflow

```text
Owner direction
-> planner next
-> planner evolution
-> planner task punch
-> planner prompt
-> Codex execution
-> validation
-> review
-> direct-to-main commit for KVDF Core
```

## Required Checks

Before execution, the planner should surface:

- allowed files
- forbidden files
- acceptance criteria
- validation commands
- stop condition

## KVDF Core Policy

For KVDF Core Owner Track work:

- direct-to-main is the default
- branch and PR are optional only for team, protected-repo, or risky work
- `.kabeeri/` runtime state is not part of the normal delivery commit
- the Planner Layer is an owner-facing planning helper, not an autonomous
  planner

## Task Punch

A Task Punch is the grouped set of implementation tasks generated for one
Evolution slice.

Each task in the punch should include:

- task id
- title
- status
- allowed files
- forbidden files
- acceptance criteria
- validation commands
- stop condition

## Prompt Output

The Codex-ready prompt must explicitly state:

- repository context
- track
- delivery mode
- allowed files
- forbidden files
- implementation tasks
- validation commands
- commit instructions
- stop condition

## Stop Rule

Stop if:

- the requested change would touch KVDOS
- the requested change would require runtime writes under `.kabeeri/`
- the requested change would make branch/PR the default KVDF Core path
- the requested change is outside the allowed planner files
- validation fails
