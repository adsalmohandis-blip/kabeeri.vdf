# Multi-AI Governance

Multi-AI Governance is the operational layer that lets several AI tools work on
the same Kabeeri repository without corrupting the framework, racing the same
files, or losing priority order across devices.

## Core Rule

Evolution is the global priority governor.

The first AI that enters a development session becomes the Leader for that
session. The Leader coordinates, assigns temporary queues, records merge
bundles, and keeps the session aligned with the current Evolution priority. By
default, the Leader does not execute tasks. Execution is allowed only when the
human Owner explicitly delegates a scoped slice.

## Required Behaviors

- Evolution owns the framework backlog and priority order.
- The Leader AI owns session orchestration for the active development session.
- Worker AIs receive temporary queues that are scoped to a specific session and
  priority slice.
- A queue slice must describe the work clearly enough to survive a session
  interruption or a device switch.
- The Merger layer combines workspace copies, patch bundles, or semantic
  sections back into the original files and records a semantic surface plan
  for every merged bundle.
- A merge must be traceable to the AI tools that participated in it.
- Owner verification remains the final authority for risky or completed work.
- Cross-device work must be reproducible from repo-backed state, not from local
  chat memory.

## Governance Shape

```json
{
  "version": "v1",
  "evolution_governor": {
    "scope": "Evolution",
    "description": "Evolution is the global priority governor for Kabeeri framework development."
  },
  "active_leader_session_id": "multi-ai-leader-001",
  "leader_sessions": [],
  "worker_queues": [],
  "merge_bundles": []
}
```

## Session Rules

- The Leader session is elected from the first active session entry, or from an
  explicit transfer approved by the Owner.
- The Leader session tracks the current Evolution priority, so a session always
  knows which framework slice it is serving.
- Any AI tool that starts work on an active Evolution priority must first read
  `kvdf evolution temp` and work only on the current temporary slice.
- The Leader status report exposes a current task derived from the active
  Evolution temporary slice so worker tools do not have to guess which work
  item they should pick up.
- The Leader can delegate execution only when the Owner marks the session or
  slice as delegated.
- The Leader can sync with the active Evolution temporary queue and distribute
  its slices to worker AIs when the session needs parallel execution.
- If a Leader session ends, the next session must be created explicitly.

## Queue Rules

- Each AI gets its own temporary queue within the active session.
- A queue is always tied to one active Leader session.
- Queue slices must carry a title, description, done definition, and file or
  surface notes when relevant.
- Queue slices should also carry provenance details such as source slice id,
  assigned AI id, and a stable tool symbol when they originate from a
  multi-AI distribution pass.
- Queue slices move through a small lifecycle: queued, active, blocked, done,
  or handed off, and the queue closes only when the active slices are fully
  resolved.
- Queue slices expire with the session or when Evolution moves to another
  priority.

## Merge Rules

- Merge bundles are semantic, not blind copy/paste.
- Each bundle can be previewed before validation so the Leader can inspect
  semantic surface plans, contributor overlaps, and review-required files.
- Each bundle records source queue ids, source AI ids, target priority, and a
  manifest of the intended changes, including contributor provenance.
- The Merger layer must validate the bundle before the result is considered
  usable.
- After validation, a bundle can be committed, which records a provenance
  trace and marks the source queues as resolved in the governance record.
- A committed bundle also stores the semantic merge plan, including file
  sections, surface risk, and review-required overlaps.
- The original files remain authoritative until the merged output passes
  validation.

## Runtime State

The runtime state lives in `.kabeeri/multi_ai_governance.json` and is validated
through `schemas/runtime/multi-ai-governance-state.schema.json`.

## CLI Surface

- `kvdf multi-ai status`
- `kvdf multi-ai leader start`
- `kvdf multi-ai leader transfer`
- `kvdf multi-ai leader end`
- `kvdf multi-ai sync`
- `kvdf multi-ai sync distribute`
- `kvdf multi-ai queue add`
- `kvdf multi-ai queue list`
- `kvdf multi-ai queue start`
- `kvdf multi-ai queue advance`
- `kvdf multi-ai queue complete`
- `kvdf multi-ai merge add`
- `kvdf multi-ai merge preview`
- `kvdf multi-ai merge validate`
- `kvdf multi-ai merge commit`

## Cross-Device Requirement

This system is designed to work across GitHub-synced workspaces and different
computers. The authoritative state should be kept in tracked repo files and
committed or synced when the session changes, so another AI or another machine
can continue from the same governance record.
