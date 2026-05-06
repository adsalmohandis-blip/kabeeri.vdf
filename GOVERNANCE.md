# Governance Model

## Purpose

Kabeeri Vibe Developer Framework should evolve like a serious open-source framework, not like a random prompt collection.

## Maintainer roles

- **Framework Lead:** approves vision, roadmap, and releases.
- **Documentation Maintainers:** review docs and translations.
- **Questionnaire Maintainers:** review folder-specific questions.
- **Prompt Pack Maintainers:** review framework-specific AI prompts.
- **Tooling Maintainers:** maintain CLI, VS Code extension, schemas, and validation tools.
- **Security Maintainer:** reviews security-related templates and guidance.

## Decision levels

1. **Patch:** wording fixes, typos, small clarifications.
2. **Minor:** new questionnaire, new prompt pack, new example.
3. **Major:** lifecycle changes, folder structure changes, generator schema changes.

## Release approvals

- Patch releases require one maintainer.
- Minor releases require two maintainers.
- Major releases require the Framework Lead plus at least two maintainers.

## Compatibility rule

The framework must preserve backward compatibility for existing project skeletons where possible. Breaking changes must be documented in `CHANGELOG.md` and migration notes.
