# Planner Visual Renderer

`planner-visual` is an optional renderer plugin.

The core Planner Layer remains the source of truth for:
- owner-track planner proposals
- vibe/app-track planner proposals
- plugin-track planner proposals
- task punch generation
- Codex-ready prompt generation

This plugin only renders planner visual JSON into readable Markdown and Mermaid text.

It does not:
- replace KVDF Core planner logic
- change planner runtime state
- change task or evolution behavior
- install Mermaid as a dependency

Use this plugin when you want the visual plan to be easier to read without moving planning logic out of KVDF Core.
