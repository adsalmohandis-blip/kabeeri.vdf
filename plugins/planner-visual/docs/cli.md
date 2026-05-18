# Planner Visual Renderer CLI

## Commands

```text
kvdf planner-visual status
kvdf planner-visual render --goal "Add visual planner" --track owner
kvdf planner-visual render --goal "Build app flow" --track vibe
kvdf planner-visual render --goal "Improve plugin docs" --track plugin --plugin kvdf-dev
kvdf planner-visual render --from-current
kvdf planner-visual export --goal "Add visual planner" --track owner
kvdf plugins install planner-visual
kvdf plugins uninstall planner-visual
```

## Behavior

- `status` reports whether the renderer is available.
- `render` turns planner visual JSON into Markdown text with a Mermaid block.
- `export` follows the same rendering path.
- `--from-current` reuses the approved planner runtime state when available.

## Example

```bash
kvdf planner visual --goal "Add visual planner" --track owner --json
kvdf planner-visual render --from-current
```
