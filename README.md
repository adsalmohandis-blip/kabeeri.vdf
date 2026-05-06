# Kabeeri Vibe Developer Framework

**Kabeeri Vibe Developer Framework** is an open-source meta-framework for AI-powered software builders and vibe developers. It sits above traditional coding frameworks such as Laravel, .NET, Next.js, Django, and WordPress.

It does not replace coding frameworks. It helps builders define what to build, why to build it, how to describe it to AI, how to break it into documents and tasks, and how to review AI output.

## Core idea

Traditional frameworks start at code. Kabeeri VDF starts before code:

```text
Raw idea
→ structured questions
→ folder-specific documents
→ AI-ready prompts
→ tasks
→ generated code
→ review and acceptance
→ extensions
```

## Target users

- AI-powered software builders.
- Vibe developers.
- Founders and product owners building with AI.
- Small teams using ChatGPT, Codex, Cursor, Claude, Windsurf, or GitHub Copilot.
- Agencies that want a repeatable AI delivery method.

## Repository layout

```text
Kabeeri-Vibe-Developer-Framework/
├── generators/
├── templates/
├── questionnaires/
├── prompt_packs/
├── task_tracking/
├── acceptance_checklists/
├── schemas/
├── examples/
└── docs/
```

Arabic documentation is available in `docs/ar/`. English documentation is available in `docs/en/`.

## Recommended first release

Start as a GitHub repository with Markdown docs, JSON generators, questionnaire templates, and prompt-pack templates. Then add a CLI, then a VS Code extension, then a desktop app or SaaS layer.
