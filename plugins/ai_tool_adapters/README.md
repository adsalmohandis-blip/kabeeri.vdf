# AI Tool Adapter

`ai_tool_adapter` is the public-facing identity for this KVDF plugin.
The bundle remains in `plugins/ai_tool_adapters/` and keeps the legacy
`ai_tool_adapters` plugin id and runtime state filenames for compatibility.

This plugin is a governance-heavy integration layer, not an approval authority
and not a general shell wrapper.

## What It Does

- discovers local AI and developer tools on `PATH`
- catalogs known adapter profiles for common AI and developer tool surfaces
- ships a local adaptation pack for each supported tool profile
- ships a governed prompt profile for each supported tool profile
- ships a prompt composition pack that expands short vibe notes into professional prompts
- stores a local registry in `.kabeeri/ai_tool_adapters.json`
- supports `status`, `scan`, `list`, `show`, `register`, and `unregister`
- supports `catalog` to inspect the built-in adapter profile library
- supports `packs` to inspect the per-tool adaptation packs
- supports `prompts` to inspect the per-tool prompt profiles
- supports `compose` to turn a short brief into a governed professional prompt
- supports `track-mode` templates for `owner_core`, `owner_docs`, `vibe_product`, `vibe_ux`, `plugin_manifest`, `plugin_runtime`, and `plugin_schema`
- accepts natural-language aliases for track modes such as `docs`, `ux`, `product`, `manifest`, `runtime`, and `schema`
- validates governed run contracts before any execution attempt
- evaluates a fail-closed policy gate
- can run a governed direct process spawn with `shell: false`
- writes run evidence to `.kabeeri/ai_tool_runs.jsonl`
- exposes a provider API for capability and readiness checks
- publishes dashboard, readiness, evidence, and audit reports
- keeps `multi_ai_governance` as the authority plugin

## What It Does Not Do

- it does not become the approval authority
- it does not replace `multi_ai_governance`
- it does not execute arbitrary shell commands
- it does not auto-approve work
- it does not auto-merge or auto-commit
- it does not create live adapters for every external AI tool yet
- it does not turn runtime state into the source of truth for tasks or queues

## Compatibility Notes

- The folder stays plural: `plugins/ai_tool_adapters/`
- The plugin id stays plural: `ai_tool_adapters`
- The user-facing command surface now prefers `kvdf ai-tool-adapter ...`
- Legacy `ai-tool-adapters` and `ai_tool_adapters` aliases still work
- Runtime state filenames remain plural for compatibility:
  - `.kabeeri/ai_tool_adapters.json`
  - `.kabeeri/ai_tool_runs.jsonl`
  - `.kabeeri/ai_tool_policy_results.json`
  - `.kabeeri/reports/ai_tool_adapters_dashboard.json`
  - `.kabeeri/reports/ai_tool_adapters_readiness.json`

## Docs

- [Architecture](governance/AI_TOOL_ADAPTER_ARCHITECTURE.md)
- [Boundaries](governance/AI_TOOL_ADAPTER_BOUNDARIES.md)
- [Phases](governance/AI_TOOL_ADAPTER_PHASES.md)
- [Authority Boundary](governance/MULTI_AI_GOVERNANCE_AUTHORITY.md)
- [Runtime State Ownership](governance/RUNTIME_STATE_OWNERSHIP.md)

## Commands

- `kvdf ai-tool-adapter status`
- `kvdf ai-tool-adapter scan`
- `kvdf ai-tool-adapter catalog`
- `kvdf ai-tool-adapter list`
- `kvdf ai-tool-adapter prompts`
- `kvdf ai-tool-adapter prompt --brief "<short idea>" --tool <tool-id>`
- `kvdf ai-tool-adapter compose --brief "<short idea>" --tool <tool-id>`
- `kvdf ai-tool-adapter preset --preset bugfix --track owner --brief "<short idea>" --tool <tool-id>`
- `kvdf ai-tool-adapter compose --track-mode owner_docs --brief "<short idea>" --tool <tool-id>`
- `kvdf ai-tool-adapter blueprint --track vibe --brief "<short idea>" --tool <tool-id>`
- `kvdf ai-tool-adapter compose --track plugin --brief "<short idea>" --tool <tool-id>`
- `kvdf ai-tool-adapter register --tool <tool> --path <path|auto> --editor <editor>`
- `kvdf ai-tool-adapter unregister --tool <tool-id>`
- `kvdf ai-tool-adapter show <tool-id>`
- `kvdf ai-tool-adapter test --tool <tool-id>`
- `kvdf ai-tool-adapter run --tool <tool-id> --contract <path> --confirm`
- `kvdf ai-tool-adapter runs`
- `kvdf ai-tool-adapter run-show <run-id>`
- `kvdf ai-tool-adapter provider`
- `kvdf ai-tool-adapter capabilities`
- `kvdf ai-tool-adapter can-run --contract <path>`
- `kvdf ai-tool-adapter evidence --run <run-id>`
- `kvdf ai-tool-adapter dashboard`
- `kvdf ai-tool-adapter readiness`
- `kvdf ai-tool-adapter audit`
- `kvdf ai-tool-adapter enable-execution --tool <tool-id> --confirm`
- `kvdf ai-tool-adapter disable-execution --tool <tool-id>`

## Current Limitation

This plugin currently governs local tool discovery, registry state, contracts,
policy checks, governed direct spawn, and evidence reporting.
It now recognizes a broader catalog of agent runtimes and editor integrations,
but it still does not ship live adapters for every external AI tool yet.

## Track Modes

- `owner_core` for source, tests, schema, and mainline implementation work
- `owner_docs` for authoritative docs, guides, references, and explanations
- `vibe_product` for KVDOS/app delivery, scope, and product outcomes
- `vibe_ux` for screens, layout, flows, and interaction design
- `plugin_manifest` for plugin packaging, identity, and surface area
- `plugin_runtime` for command handlers, provider behavior, and execution policy
- `plugin_schema` for state shape, response contracts, and validation
