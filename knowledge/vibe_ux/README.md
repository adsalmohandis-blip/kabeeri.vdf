# Vibe UX

Vibe UX is Kabeeri's human-first interaction layer. It keeps `.kabeeri/` as source of truth and keeps the CLI as the background engine, while normal users work through VS Code, dashboard, chat, cards, and guided flows.

## Core Principle

Files are the source of truth. CLI is the engine. VS Code, dashboard, and chat are the main human experience.

The interaction model also keeps three lanes clear:

- owner track for framework/system work
- app track for application-building work
- plugin modules for independently addable or removable features

## Goals

- Let users describe intent in natural language.
- Turn intent into suggested tasks, not silent execution.
- Make AI assistants start with `kvdf contract` or `kvdf resume` before they write, so the next exact action and the governed boundary stay visible.
- Keep governance visible only when it matters.
- Capture free coding after the work and connect it to tasks.
- Make common CLI commands available as UI actions.
- Show cost, locks, and Owner verification in human-readable language.

## Relationship To Existing Layers

- v2 delivery modes decide whether work is Structured or Agile.
- v3 platform surfaces provide CLI, VS Code, dashboard, GitHub sync, and Owner verify.
- v4 governance controls roles, tokens, locks, assignment, and verification.
- v5 intelligence supplies adaptive questions, capability maps, memory, policies, and handoff.
- v6 Vibe UX makes those capabilities usable without forcing a terminal-first workflow.

## Files

- `VIBE_UX_PRINCIPLES.md`
- `CLI_AS_ENGINE.md`
- `INTERACTION_SURFACES.md`
- `CHAT_INTERACTION_MODEL.md`
- `NATURAL_LANGUAGE_TASK_CREATION.md`
- `INTENT_CLASSIFICATION_RULES.md`
- `SUGGESTED_TASK_CARD.md`
- `VAGUE_REQUEST_DETECTION.md`
- `WORKSTREAM_DETECTION_RULES.md`
- `POST_WORK_CAPTURE.md`
- `COMMAND_ABSTRACTION_RULES.md`
- `INTERACTION_MODES.md`
- `UX_FRICTION_RULES.md`
- `VIBE_FIRST_RUNTIME.md`

## Runtime Commands

The first executable slice is implemented as optional CLI commands:

```bash
kvdf vibe "Add admin dashboard settings page for owner"
kvdf vibe suggest "Add checkout API"
kvdf ask "Improve the dashboard"
kvdf questionnaire plan "Build an ecommerce store"
kvdf prompt-pack compose react --task task-001
kvdf capture --summary "Updated dashboard filters" --files src/cli/index.js
kvdf capture list
kvdf capture convert capture-001
kvdf vibe brief
kvdf vibe next
```

These commands write interaction records under `.kabeeri/interactions/`. They do not replace the normal CLI engine; projects can keep using `kvdf task`, `kvdf token`, `kvdf dashboard`, and `kvdf validate` directly.

Questionnaire intake and prompt-pack composition keep the AI start short and task-specific: questionnaire generates the missing decisions, then prompt-pack compose turns the selected stack into one reviewable prompt with compact guidance. This reduces repeated context and helps AI stay on the current track only.

Post-work capture supports a full lifecycle: record changed work, review it, link it to a task, convert it into a governed task, or resolve it after evidence is reviewed.
