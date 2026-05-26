# Case 1 Implementation Plan: IDE Window Governance

## Goal

Add Case 1 IDE Window Governance inside the existing `multi_ai_governance` plugin without creating a new plugin or duplicating adapter logic.

The canonical command family should follow the repository convention:

- primary: `kvdf multi-ai ide ...`
- optional alias later only if the CLI router supports it cleanly

## Phase 1: Existing Plugin Analysis

Done first by inspecting:

- plugin manifest and bootstrap wiring
- existing `multi_ai_governance` command handlers
- existing schemas and schema registry
- `.kabeeri` runtime state
- docs and CLI reference style
- existing tests
- `ai_tool_adapters` plugin relationship

Deliverables:

- `plugins/multi_ai_governance/docs/CASE_1_IDE_WINDOW_ANALYSIS.md`
- `plugins/multi_ai_governance/docs/CASE_1_GAP_REPORT.md`

## Phase 2: IDE Window Session Model

Add the first IDE-local runtime model.

Planned runtime file:

- `.kabeeri/multi_ai_governance/ide_window_sessions.json`

Planned schema work:

- create `schemas/runtime/ide-window-sessions-state.schema.json`
- register the file in `schemas/runtime/schema_registry.json`

Planned command surface:

- `kvdf multi-ai ide status`
- `kvdf multi-ai ide register`

Expected behavior:

- register or refresh an IDE window session
- store window, workspace, project, repo root, active task, owner, timestamps, and status
- report current IDE window status from local state

## Phase 3: AI Tool Presence Inside IDE Window

Add a tool-presence layer tied to IDE sessions.

Planned runtime files:

- `.kabeeri/multi_ai_governance/ide_tool_presence.json`
- `.kabeeri/multi_ai_governance/ide_agent_sessions.json`

Planned schema work:

- create `schemas/runtime/ide-tool-presence-state.schema.json`
- create `schemas/runtime/ide-agent-sessions-state.schema.json`
- register both in `schemas/runtime/schema_registry.json`

Expected behavior:

- register a tool presence record for known tools such as `codex`, `claude_code`, `github_copilot`, `cursor_agent`, `cline`, `roo`, `continue`, `mcp_tool`, `terminal_agent`, and `unknown_ai_tool`
- connect a tool presence record to an IDE window, workspace, and task
- update presence timestamps and capabilities
- avoid assuming direct control over the editor extension itself

## Phase 4: IDE Task, File, and Folder Leases

Add the lease model and conflict surface.

Planned runtime files:

- `.kabeeri/multi_ai_governance/ide_leases.json`
- `.kabeeri/multi_ai_governance/ide_conflicts.json`

Planned schema work:

- create `schemas/runtime/ide-leases-state.schema.json`
- create `schemas/runtime/ide-conflicts-state.schema.json`
- register both in `schemas/runtime/schema_registry.json`

Planned command surface:

- `kvdf multi-ai ide lease`
- `kvdf multi-ai ide release`
- `kvdf multi-ai ide conflicts`

Expected behavior:

- create task, file, and folder leases
- enforce allowed and denied paths
- detect same-file conflicts
- detect edits without a task lease
- detect scope violations
- detect expired lease usage
- detect high-risk path changes that need approval

## Phase 5: Policy Check, Approval, Audit, and Tests

Add the policy engine and verification layer.

Planned runtime files:

- `.kabeeri/multi_ai_governance/ide_policy_decisions.json`
- `.kabeeri/multi_ai_governance/ide_approval_requests.json`
- `.kabeeri/multi_ai_governance/ide_audit_log.json`

Planned schema work:

- create `schemas/runtime/ide-policy-decisions-state.schema.json`
- create `schemas/runtime/ide-approval-requests-state.schema.json`
- create `schemas/runtime/ide-audit-log-state.schema.json`
- register all three in `schemas/runtime/schema_registry.json`

Policy decision requirements:

- `decision`
- `reason`
- `risk_level`
- `requires_owner_approval`
- `evidence_id`
- `timestamp`

Decision outcomes:

- `allow`
- `warn`
- `block`
- `require_owner_approval`

Planned command surface:

- `kvdf multi-ai ide policy`

Tests to add or update:

- registering an IDE window
- registering AI tool presence
- creating a lease
- detecting same-file conflict
- blocking denied path
- warning on ungoverned change
- requiring approval for high-risk action
- writing audit records

Docs to add:

- `plugins/multi_ai_governance/docs/CASE_1_IDE_WINDOW_GOVERNANCE.md`
- `plugins/multi_ai_governance/docs/CASE_1_IDE_POLICY_CHECKS.md`
- `plugins/multi_ai_governance/docs/CASE_1_IDE_LEASES.md`

## Files Likely To Change

Plugin bundle:

- `plugins/multi_ai_governance/plugin.json`
- `plugins/multi_ai_governance/bootstrap.js`
- `plugins/multi_ai_governance/commands/multi_ai_governance.js`
- possibly one new command module for IDE governance
- `plugins/multi_ai_governance/README.md`
- `plugins/multi_ai_governance/docs/index.md`
- `plugins/multi_ai_governance/docs/CASE_1_*.md`
- `plugins/multi_ai_governance/tests/*.test.js`

Core repo:

- `schemas/runtime/schema_registry.json`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- possibly `src/cli/index.js` only if a new alias family is introduced

## Not In Scope

Do not add any of the following in Case 1:

- cloud governance
- Wi-Fi/LAN governance
- GitHub governance
- Case 2, Case 3, Case 4, or Case 5 logic
- a new plugin
- a duplicate governance authority outside `multi_ai_governance`

## Completion Artifact

When the implementation is finished, add:

- `plugins/multi_ai_governance/docs/CASE_1_COMPLETION_REPORT.md`

The completion report should summarize:

- files changed
- files added
- commands added or updated
- runtime files created
- tests added
- what works now
- what remains for Case 2
- limitations
- how `ai_tool_adapter` connects later
