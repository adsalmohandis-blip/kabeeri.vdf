# Case 1: IDE Window Governance

This case adds governance for multiple AI tools working inside the same IDE
window and the same workspace.

## Authority Model

- `multi_ai_governance` is the authority layer.
- `.kabeeri` is the local source of truth.
- `ai_tool_adapters` supplies tool discovery and capability context.
- GitHub remains the source-control truth.
- AI tools do not govern themselves.

## Supported Surfaces

- IDE window registration
- AI tool presence tracking
- agent session tracking inside the same IDE window
- task, file, and folder leases
- conflict detection
- policy decisions
- audit and evidence records

## Canonical Commands

- `kvdf multi-ai ide status`
- `kvdf multi-ai ide register`
- `kvdf multi-ai ide tool register`
- `kvdf multi-ai ide agent register`
- `kvdf multi-ai ide lease create`
- `kvdf multi-ai ide release`
- `kvdf multi-ai ide conflicts`
- `kvdf multi-ai ide policy check`

## Expected Behavior

- A window must have an identity before the IDE surface can be governed.
- Tool presence is recorded per window and workspace, not as a global fact.
- Leases constrain where an AI tool may edit.
- Conflicts are detected when multiple tools target the same file or when a
  denied path, expired lease, or scope violation appears.
- High-risk IDE actions require owner approval.

## Runtime Files

- `.kabeeri/multi_ai_governance/ide_window_sessions.json`
- `.kabeeri/multi_ai_governance/ide_tool_presence.json`
- `.kabeeri/multi_ai_governance/ide_agent_sessions.json`
- `.kabeeri/multi_ai_governance/ide_leases.json`
- `.kabeeri/multi_ai_governance/ide_conflicts.json`
- `.kabeeri/multi_ai_governance/ide_policy_decisions.json`
- `.kabeeri/multi_ai_governance/ide_approval_requests.json`
- `.kabeeri/multi_ai_governance/ide_audit_log.json`
