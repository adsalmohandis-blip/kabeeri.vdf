# Open Core Strategy

Kabeeri uses an open-core product strategy.

## Open Core

The open-source core is **Kabeeri VDF**.

Kabeeri VDF helps developers organize AI-assisted development inside their existing editor, terminal, and project folder. It is designed to work with VS Code, Codex, Cursor, Windsurf, and other AI coding assistants.

The open core provides:

- CLI governance workflows
- `.kabeeri/` local runtime state
- Task governance
- Prompt pack and questionnaire structure
- Basic schemas and contracts
- Basic validation and reports
- Documentation for AI-assisted development

## Commercial Product Layer

The commercial product is **KVDOS**.

KVDOS is the commercial AI Software Factory OS built on top of Kabeeri VDF concepts.

KVDOS adds:

- Studio
- Runner
- Cloud
- Licensing
- Subscriptions
- Marketplace
- Package registry
- Enterprise deployment
- Advanced commercial agent execution

## Feature Placement Rule

A feature belongs to VDF if it improves the open governance engine for all AI-assisted developers.

A feature belongs to KVDOS if it depends on commercial distribution, billing, licensing, team SaaS, enterprise deployment, marketplace features, or proprietary product UX.

## Repository Rule

`kabeeri.vdf` remains the open-source core repository.

`kvdos` remains a separate commercial product repository.

KVDOS should not silently fork VDF. General improvements discovered while building KVDOS should be proposed back to VDF when they improve the open core.
