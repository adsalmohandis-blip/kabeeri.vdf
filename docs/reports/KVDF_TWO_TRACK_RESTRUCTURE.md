# KVDF Two-Track Restructure

This report records the practical reorganization of KVDF into two primary
operating tracks with one shared platform layer.

## 1. Framework Owner Track

Purpose:
- Change Kabeeri itself.
- Maintain Evolution Steward priorities.
- Keep framework runtime, docs, schemas, dashboard, reports, and tests aligned.

Canonical cycle:

```text
resume -> evolution priorities -> evolution temp -> implement -> sync -> validate -> verify
```

Key capabilities:
- Session resume guard for framework-owner mode
- Evolution Steward
- Temporary execution queues for active framework priorities
- Deferred idea restore with placement confirmation
- Impact plans and follow-up tasks for framework changes
- Multi-AI governance when several agents share the same repository

## 2. Vibe App Developer Track

Purpose:
- Build application work while KVDF acts as the governed engine.
- Capture intent, clarify scope, and convert work into safe tasks.
- Keep application execution separate from framework development.

Canonical cycle:

```text
resume -> vibe/ask -> blueprint/questionnaire -> temp -> tasks/capture -> validate -> handoff
```

Key capabilities:
- Vibe-first natural language intake
- App-focused `kvdf evolution app ...` alias for development visibility
- General `kvdf temp` queue for current application tasks
- Task tracker, captures, and governed task conversion
- Blueprints, questionnaires, and prompt packs for planning

## 3. Shared Platform Layer

Purpose:
- Keep both tracks safe, resumable, and traceable.
- Provide common runtime services, state files, and validation.

Shared cycle:

```text
resume -> guard -> conflict scan -> validate -> dashboard/reports
```

Shared capabilities:
- CLI engine and workspace state
- Session resume guard
- Framework boundary guard
- Conflict scan
- Dashboards and live reports
- GitHub sync preflight
- Security, release, migration, tokens, locks, and AI cost control
- Runtime schema validation

## 4. Restructure Rules

1. Framework-owner changes must stay in the framework-owner track.
2. App-development changes must stay in the vibe app-developer track.
3. Shared capabilities should not be duplicated across tracks unless the track-specific wording materially changes behavior.
4. `evolution` and `temp` keep the execution graph separate:
   - `kvdf evolution` governs KVDF framework work.
   - `kvdf temp` governs application task execution.
5. A session always starts with `kvdf resume` so the operator sees the track, the root, and the safe next action before any implementation begins.

## 5. Session End Conditions

A session is considered complete only when:
- The track-specific queue is closed.
- The relevant validation passes.
- The dashboard/live state reflects the new work.
- Any new tasks or deferred items are recorded in the correct queue.
- The next session can resume without chat memory.
