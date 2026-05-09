# 13 - Product Roadmap and Distribution

Kabeeri VDF is distributed as a repository and CLI-driven framework. Its product
surface includes documentation, generators, questionnaires, prompt packs, local
runtime state, dashboards, and release/governance commands.

## Roadmap Focus

- stable CLI engine
- reliable `.kabeeri/` runtime state
- prompt-pack coverage
- AI cost control
- dashboard and VS Code surfaces
- release, publish, and handoff governance
- packaging and upgrade paths

## Distribution

Distribution should be protected by packaging checks, release gates, and clear
upgrade guidance.

```bash
kvdf package check
kvdf upgrade check
kvdf release check
```
