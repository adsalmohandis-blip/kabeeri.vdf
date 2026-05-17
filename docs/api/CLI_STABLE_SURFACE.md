# CLI Stable Surface

This file classifies the `kvdf` command surface for open-core stabilization.

The goal is to help users, contributors, and downstream products such as KVDOS understand which commands are safe to depend on and which commands are still evolving.

## Stable Core Commands

These commands are part of the expected open-core workflow and should remain stable unless a migration note is provided.

```bash
kvdf --version
kvdf --help
kvdf init
kvdf validate
kvdf task list
kvdf task create
kvdf task start
kvdf task complete
kvdf task verify
kvdf capture
kvdf report
```

## Stable Supporting Commands

These commands are useful for common governance, validation, and reporting workflows.

```bash
kvdf prompt-pack list
kvdf prompt-pack show <name>
kvdf questionnaire list
kvdf questionnaire plan "<goal>"
kvdf readiness report
kvdf governance report
```

## Experimental Commands

These commands may evolve while Kabeeri VDF continues toward a stable open-core release.

```bash
kvdf vibe
kvdf dashboard
kvdf multi-ai
kvdf evolution
kvdf sync
kvdf conflict
```

## Internal / Owner Development Commands

Some commands are useful for the Kabeeri framework owner or deep framework development. They should not be treated as a stable public integration contract unless documented separately.

Examples include framework-internal Evolution workflows, owner-specific resume flows, and temporary execution queues.

## Downstream Integration Rule

Downstream products such as KVDOS should depend on commands in this order of preference:

1. Stable CLI commands.
2. Machine-readable JSON export commands when available.
3. Stable schema files.
4. Stable VDF API exports when available.
5. Experimental commands only with explicit compatibility handling.

## Future Work

Planned bridge-friendly commands:

```bash
kvdf export state --json
kvdf export tasks --json
kvdf export schemas --output ./schemas
```
