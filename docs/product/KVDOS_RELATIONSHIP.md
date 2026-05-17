# Relationship Between Kabeeri VDF and KVDOS

## Summary

Kabeeri VDF is the open-source AI development governance core.

KVDOS is the commercial AI Software Factory OS built on top of Kabeeri VDF concepts.

## Kabeeri VDF

Kabeeri VDF:

- Works inside existing editors such as VS Code, Codex-enabled workflows, Cursor, Windsurf, and normal terminals.
- Uses the `kvdf` CLI.
- Stores local governance state under `.kabeeri/`.
- Provides task governance, prompt packs, questionnaires, schemas, validation, and basic reporting.
- Is not a SaaS product or full IDE by itself.

## KVDOS

KVDOS:

- Uses the `kvdos` CLI and product runtime.
- Stores product runtime state under `.kvdos/`.
- Uses `app.kvdos.yaml` as the primary system specification.
- Adds Studio, Runner, Cloud, licensing, subscriptions, package registry, marketplace, enterprise features, advanced agents, sandbox execution, quality gates, and commercial workflows.

## Integration Options

KVDOS may integrate with Kabeeri VDF through:

1. Documentation boundary.
2. GitHub package dependency.
3. CLI bridge.
4. Machine-readable export commands.
5. Internal API bridge.
6. State migration from `.kabeeri/` to `.kvdos/`.

## Boundary Rule

Kabeeri VDF should remain lightweight, open, and useful without KVDOS.

KVDOS should remain a separate commercial product that can consume VDF without duplicating or silently forking the open core.
