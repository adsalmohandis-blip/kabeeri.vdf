const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot } = require("../../../src/cli/fs_utils");
const { table } = require("../../../src/cli/ui");
const { isExpired } = require("../../../src/cli/services/collections");
const { normalizeLockScope, pathScopeContains } = require("../../../src/cli/commands/lock");

const IDE_STATE_DIR = ".kabeeri/multi_ai_governance";
const IDE_WINDOW_SESSIONS_FILE = `${IDE_STATE_DIR}/ide_window_sessions.json`;
const IDE_TOOL_PRESENCE_FILE = `${IDE_STATE_DIR}/ide_tool_presence.json`;
const IDE_AGENT_SESSIONS_FILE = `${IDE_STATE_DIR}/ide_agent_sessions.json`;
const IDE_LEASES_FILE = `${IDE_STATE_DIR}/ide_leases.json`;
const IDE_CONFLICTS_FILE = `${IDE_STATE_DIR}/ide_conflicts.json`;
const IDE_POLICY_DECISIONS_FILE = `${IDE_STATE_DIR}/ide_policy_decisions.json`;
const IDE_APPROVAL_REQUESTS_FILE = `${IDE_STATE_DIR}/ide_approval_requests.json`;
const IDE_AUDIT_LOG_FILE = `${IDE_STATE_DIR}/ide_audit_log.json`;

const KNOWN_TOOL_ALIASES = {
  codex: { tool_id: "codex", tool_name: "Codex", capabilities: ["code_edit", "patch_proposal", "terminal_assist"] },
  claude_code: { tool_id: "claude_code", tool_name: "Claude Code", capabilities: ["code_edit", "patch_proposal", "terminal_assist"] },
  github_copilot: { tool_id: "github_copilot", tool_name: "GitHub Copilot", capabilities: ["code_edit", "patch_proposal", "inline_suggestions"] },
  cursor_agent: { tool_id: "cursor_agent", tool_name: "Cursor Agent", capabilities: ["code_edit", "patch_proposal", "terminal_assist"] },
  cline: { tool_id: "cline", tool_name: "Cline", capabilities: ["code_edit", "patch_proposal", "terminal_assist"] },
  roo: { tool_id: "roo", tool_name: "Roo", capabilities: ["code_edit", "patch_proposal", "terminal_assist"] },
  continue: { tool_id: "continue", tool_name: "Continue", capabilities: ["code_edit", "patch_proposal", "terminal_assist"] },
  mcp_tool: { tool_id: "mcp_tool", tool_name: "MCP Tool", capabilities: ["tool_orchestration", "read_only_access"] },
  terminal_agent: { tool_id: "terminal_agent", tool_name: "Terminal Agent", capabilities: ["script_execution", "terminal_assist"] },
  unknown_ai_tool: { tool_id: "unknown_ai_tool", tool_name: "Unknown AI Tool", capabilities: ["unknown"] }
};

function multiAiIdeGovernance(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const appendAudit = typeof deps.appendAudit === "function" ? deps.appendAudit : null;
  const subaction = normalizeAction(value, flags);

  if (!action || action === "status" || action === "summary") {
    return buildIdeStatusReport(flags, deps);
  }

  if (subaction === "status" || subaction === "show" || subaction === "list") {
    return buildIdeStatusReport(flags, deps);
  }

  if (subaction === "register" || subaction === "open" || subaction === "refresh") {
    return registerIdeWindowSession(flags, deps, appendAudit);
  }

  if (subaction === "tool") {
    const toolAction = normalizeNestedAction(rest[0], flags);
    return handleToolPresenceAction(toolAction, flags, rest.slice(1), deps, appendAudit);
  }

  if (subaction === "agent") {
    const agentAction = normalizeNestedAction(rest[0], flags);
    return handleAgentSessionAction(agentAction, flags, rest.slice(1), deps, appendAudit);
  }

  if (subaction === "lease") {
    const leaseAction = normalizeNestedAction(rest[0], flags);
    return handleLeaseAction(leaseAction, flags, rest.slice(1), deps, appendAudit);
  }

  if (subaction === "release") {
    return releaseIdeLease(flags, deps, appendAudit);
  }

  if (subaction === "conflicts") {
    return buildIdeConflictsReport(flags, deps);
  }

  if (subaction === "policy" || subaction === "check" || subaction === "evaluate") {
    const policyAction = normalizeNestedAction(rest[0], flags);
    return evaluateIdePolicy(policyAction, flags, rest.slice(1), deps, appendAudit);
  }

  throw new Error(`Unknown IDE governance action: ${action}${subaction ? ` ${subaction}` : ""}`);
}

function buildIdeStatusReport(flags = {}, deps = {}) {
  const windows = readIdeWindowSessionsState().sessions || [];
  const tools = readIdeToolPresenceState().tools || [];
  const agents = readIdeAgentSessionsState().sessions || [];
  const leases = readIdeLeasesState().leases || [];
  const conflicts = readIdeConflictsState().conflicts || [];
  const decisions = readIdePolicyDecisionsState().decisions || [];
  const windowId = resolveIdeWindowId(flags, windows);
  const workspaceId = resolveWorkspaceId(flags, windows);
  const activeWindow = windowId ? windows.find((item) => item.ide_window_id === windowId) || null : latestIdeWindowSession(windows);
  const windowTools = filterByWindow(tools, activeWindow);
  const windowLeases = filterByWindow(leases, activeWindow);
  const windowConflicts = filterByWindow(conflicts, activeWindow);
  const activeAgents = filterByWindow(agents, activeWindow);
  const adapterTools = readAiToolAdapterTools();

  return {
    report_type: "multi_ai_ide_status",
    generated_at: new Date().toISOString(),
    ide_window: activeWindow,
    counts: {
      windows: windows.length,
      tools: tools.length,
      active_tools: tools.filter((item) => item.status === "active").length,
      agents: agents.length,
      leases: leases.length,
      active_leases: leases.filter((item) => item.status === "active").length,
      conflicts: conflicts.length,
      open_conflicts: conflicts.filter((item) => item.status !== "resolved").length,
      decisions: decisions.length
    },
    workspace_id: workspaceId || (activeWindow ? activeWindow.workspace_id : null),
    repo_root: activeWindow ? activeWindow.repo_root : repoRoot(),
    current_task_id: activeWindow ? activeWindow.active_task_id : null,
    tool_presence: windowTools,
    agent_sessions: activeAgents,
    leases: windowLeases,
    conflicts: windowConflicts,
    adapter_tools: adapterTools,
    next_action: activeWindow
      ? "Use `kvdf multi-ai ide tool register`, `kvdf multi-ai ide lease create`, or `kvdf multi-ai ide policy check` for the active window."
      : "Register an IDE window with `kvdf multi-ai ide register`."
  };
}

function registerIdeWindowSession(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readIdeWindowSessionsState();
  const ideWindowId = resolveIdeWindowId(flags, state.sessions || []) || buildIdeWindowId(state.sessions || []);
  const workspaceId = resolveWorkspaceId(flags, state.sessions || []) || deriveWorkspaceId();
  const projectId = resolveProjectId(flags) || deriveProjectId();
  const session = {
    ide_window_id: ideWindowId,
    workspace_id: workspaceId,
    project_id: projectId,
    repo_root: normalizePath(flags.repo_root || flags["repo-root"] || repoRoot()),
    active_task_id: flags.task || flags.task_id || flags.active_task_id || null,
    owner_id: resolveOwnerId(flags),
    opened_at: now,
    last_seen_at: now,
    status: flags.status || "active"
  };
  const existingIndex = state.sessions.findIndex((item) => item.ide_window_id === ideWindowId);
  if (existingIndex >= 0) {
    session.opened_at = state.sessions[existingIndex].opened_at || now;
    state.sessions[existingIndex] = { ...state.sessions[existingIndex], ...session };
  } else {
    state.sessions.push(session);
  }
  state.updated_at = now;
  writeIdeWindowSessionsState(state);
  recordIdeAuditEvent("ide.window.registered", "ide_window", ideWindowId, `IDE window registered: ${ideWindowId}`, { ide_window_id: ideWindowId, workspace_id: workspaceId, project_id: projectId }, appendAudit);
  return {
    report_type: "multi_ai_ide_window_registered",
    generated_at: now,
    ide_window: session,
    counts: {
      windows: state.sessions.length
    },
    next_action: "Register tool presence with `kvdf multi-ai ide tool register`."
  };
}

function handleToolPresenceAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const subaction = normalizeNestedAction(action, flags);
  if (!subaction || subaction === "status" || subaction === "show" || subaction === "list") {
    return buildToolPresenceReport(flags);
  }
  if (subaction === "register" || subaction === "add" || subaction === "refresh") {
    return registerToolPresence(flags, deps, appendAudit);
  }
  throw new Error(`Unknown IDE tool action: ${subaction}`);
}

function handleAgentSessionAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const subaction = normalizeNestedAction(action, flags);
  if (!subaction || subaction === "status" || subaction === "show" || subaction === "list") {
    return buildAgentSessionReport(flags);
  }
  if (subaction === "register" || subaction === "add" || subaction === "refresh") {
    return registerAgentSession(flags, deps, appendAudit);
  }
  throw new Error(`Unknown IDE agent action: ${subaction}`);
}

function handleLeaseAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const subaction = normalizeNestedAction(action, flags);
  if (!subaction || subaction === "status" || subaction === "show" || subaction === "list") {
    return buildLeaseReport(flags);
  }
  if (subaction === "create" || subaction === "add" || subaction === "register") {
    return createIdeLease(flags, deps, appendAudit);
  }
  throw new Error(`Unknown IDE lease action: ${subaction}`);
}

function releaseIdeLease(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readIdeLeasesState();
  const leaseId = String(flags.id || flags.lease_id || flags.lease || flags.scope || "").trim();
  if (!leaseId) throw new Error("Missing lease id.");
  const item = state.leases.find((entry) => entry.lease_id === leaseId || normalizePath(entry.scope) === normalizePath(leaseId)) || null;
  if (!item) throw new Error(`Lease not found: ${leaseId}`);
  item.status = "released";
  item.released_at = now;
  item.last_seen_at = now;
  state.updated_at = now;
  writeIdeLeasesState(state);
  recordIdeAuditEvent("ide.lease.released", "ide_lease", item.lease_id, `IDE lease released: ${item.lease_id}`, { lease_id: item.lease_id, ide_window_id: item.ide_window_id, workspace_id: item.workspace_id }, appendAudit);
  return {
    report_type: "multi_ai_ide_lease_released",
    generated_at: now,
    lease: item,
    next_action: "Use `kvdf multi-ai ide policy check` to verify the next IDE action."
  };
}

function buildIdeConflictsReport(flags = {}, deps = {}) {
  const state = readIdeConflictsState();
  const windowId = resolveIdeWindowId(flags, []);
  const conflicts = windowId ? state.conflicts.filter((item) => item.ide_window_id === windowId) : state.conflicts;
  return {
    report_type: "multi_ai_ide_conflicts",
    generated_at: new Date().toISOString(),
    ide_window_id: windowId || null,
    conflicts,
    counts: {
      total: state.conflicts.length,
      active: state.conflicts.filter((item) => item.status !== "resolved").length,
      selected: conflicts.length
    },
    next_action: conflicts.length ? "Resolve the conflict or release the overlapping lease." : "No active conflicts were found."
  };
}

function evaluateIdePolicy(action = null, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const windowsState = readIdeWindowSessionsState();
  const toolsState = readIdeToolPresenceState();
  const agentsState = readIdeAgentSessionsState();
  const leasesState = readIdeLeasesState();
  const conflictsState = readIdeConflictsState();
  const decisionsState = readIdePolicyDecisionsState();
  const windowId = resolveIdeWindowId(flags, windowsState.sessions || []);
  const workspaceId = resolveWorkspaceId(flags, windowsState.sessions || []);
  const pathValue = normalizePath(flags.path || flags.file || flags.folder || flags.scope || flags.target || flags["target-path"] || rest[0] || "");
  const toolId = resolveToolId(flags);
  const toolPresence = findToolPresence(toolsState.tools || [], { toolId, windowId, workspaceId, agentId: flags.agent || flags.agent_id || null });
  const agentSession = findAgentSession(agentsState.sessions || [], { toolId, windowId, workspaceId, agentId: flags.agent || flags.agent_id || null });
  const windowSession = resolveIdeWindowSessionById(windowsState.sessions || [], windowId, workspaceId);
  const activeLease = findActiveLease(leasesState.leases || [], { windowId, workspaceId, toolId, agentId: flags.agent || flags.agent_id || null, pathValue });
  const leaseConflict = findConflictForPath(conflictsState.conflicts || [], { windowId, workspaceId, toolId, pathValue });
  const deniedByLease = activeLease ? findDeniedPathHit(activeLease, pathValue) : null;
  const expiredLease = activeLease && activeLease.expires_at && isExpired(activeLease.expires_at) ? activeLease : null;
  const highRisk = isHighRiskPath(pathValue) || Boolean(flags.high_risk) || Boolean(flags["owner-approval-required"]);
  const hasValidTask = Boolean((windowSession && windowSession.active_task_id) || flags.task || flags.task_id);
  const hasLeaseForPath = Boolean(activeLease);

  let decision = "allow";
  let reason = "Valid IDE lease and no conflict detected.";
  let riskLevel = "low";
  let requiresOwnerApproval = false;

  if (!toolPresence) {
    decision = "warn";
    reason = "Ungoverned change: no registered tool presence was found for this IDE action.";
    riskLevel = "medium";
  }

  if (!hasValidTask) {
    decision = decision === "allow" ? "warn" : decision;
    if (reason === "Valid IDE lease and no conflict detected.") {
      reason = "Ungoverned change: no active task is registered for the IDE window.";
    }
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
  }

  if (pathValue && !hasLeaseForPath && decision === "allow") {
    decision = "warn";
    reason = "Ungoverned change: no valid active lease covers the requested path.";
    riskLevel = "medium";
  }

  if (deniedByLease) {
    decision = "block";
    reason = `Denied path: ${pathValue || deniedByLease}`;
    riskLevel = "high";
  }

  if (!deniedByLease && leaseConflict) {
    decision = "block";
    reason = `Conflict detected: ${leaseConflict.conflict_type || "lease_conflict"} on ${leaseConflict.path || pathValue || "unknown path"}`;
    riskLevel = "high";
  }

  if (expiredLease) {
    decision = "block";
    reason = `Expired lease still in use: ${expiredLease.lease_id}`;
    riskLevel = "high";
  }

  if (highRisk && decision !== "block") {
    decision = "require_owner_approval";
    reason = `High-risk IDE action requires owner approval for ${pathValue || "this path"}.`;
    riskLevel = "high";
    requiresOwnerApproval = true;
  }

  const evidenceId = `ide-evidence-${String(decisionsState.decisions.length + 1).padStart(3, "0")}`;
  const decisionId = `ide-decision-${String(decisionsState.decisions.length + 1).padStart(3, "0")}`;
  const record = {
    decision_id: decisionId,
    ide_window_id: windowId || (windowSession ? windowSession.ide_window_id : null),
    workspace_id: workspaceId || (windowSession ? windowSession.workspace_id : null),
    project_id: windowSession ? windowSession.project_id : null,
    repo_root: windowSession ? windowSession.repo_root : repoRoot(),
    tool_id: toolId,
    tool_name: toolPresence ? toolPresence.tool_name : canonicalToolName(toolId),
    agent_id: flags.agent || flags.agent_id || (agentSession ? agentSession.agent_id : null),
    session_id: flags.session || flags.session_id || (toolPresence ? toolPresence.session_id : null),
    task_id: flags.task || flags.task_id || (windowSession ? windowSession.active_task_id : null),
    path: pathValue || null,
    action: action || flags.action || flags.operation || "edit",
    decision,
    reason,
    risk_level: riskLevel,
    requires_owner_approval: requiresOwnerApproval,
    evidence_id: evidenceId,
    timestamp: now,
    lease_id: activeLease ? activeLease.lease_id : null,
    conflict_id: leaseConflict ? leaseConflict.conflict_id : null,
    status: "recorded"
  };

  decisionsState.decisions.push(record);
  decisionsState.updated_at = now;
  writeIdePolicyDecisionsState(decisionsState);

  if (requiresOwnerApproval) {
    const approvalState = readIdeApprovalRequestsState();
    const approvalRequest = {
      request_id: `ide-approval-${String(approvalState.requests.length + 1).padStart(3, "0")}`,
      decision_id: decisionId,
      ide_window_id: record.ide_window_id,
      workspace_id: record.workspace_id,
      task_id: record.task_id,
      agent_id: record.agent_id,
      tool_id: record.tool_id,
      path: record.path,
      reason: record.reason,
      status: "requested",
      requested_at: now,
      resolved_at: null,
      resolved_by: null,
      resolution: null
    };
    approvalState.requests.push(approvalRequest);
    approvalState.updated_at = now;
    writeIdeApprovalRequestsState(approvalState);
    recordIdeAuditEvent(
      "ide.approval.requested",
      "ide_approval_request",
      approvalRequest.request_id,
      `IDE owner approval requested: ${approvalRequest.request_id}`,
      approvalRequest,
      appendAudit
    );
  }

  recordIdeAuditEvent("ide.policy.decision", "ide_policy", decisionId, `IDE policy decision: ${decision}`, record, appendAudit);

  const report = {
    report_type: "multi_ai_ide_policy_decision",
    generated_at: now,
    ...record,
    conflicts: leaseConflict ? [leaseConflict] : [],
    active_lease: activeLease,
    tool_presence: toolPresence,
    agent_session: agentSession,
    window_session: windowSession,
    next_action: getPolicyNextAction(decision, requiresOwnerApproval, deniedByLease, leaseConflict, expiredLease, highRisk, pathValue)
  };

  if (decision === "require_owner_approval") {
    report.status = "blocked";
  }
  return report;
}

function createIdeLease(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const windows = readIdeWindowSessionsState().sessions || [];
  const state = readIdeLeasesState();
  const windowId = resolveIdeWindowId(flags, windows);
  const workspaceId = resolveWorkspaceId(flags, windows);
  const projectId = resolveProjectId(flags) || deriveProjectId();
  const leaseType = normalizeLeaseType(flags.type || flags.lease_type || flags.lease || "task");
  const scope = normalizePath(flags.scope || flags.path || flags.file || flags.folder || flags.task || "");
  if (!scope) throw new Error("Missing lease scope or task.");
  const allowedPaths = normalizePathList(flags.allowed_paths || flags["allowed-paths"] || deriveAllowedPathsForLease(leaseType, scope));
  const deniedPaths = normalizePathList(flags.denied_paths || flags["denied-paths"] || deriveDeniedPathsForLease(leaseType));
  const lease = {
    lease_id: String(flags.id || flags.lease_id || `ide-lease-${String(state.leases.length + 1).padStart(3, "0")}`),
    ide_window_id: windowId,
    workspace_id: workspaceId,
    project_id: projectId,
    task_id: flags.task || flags.task_id || flags.active_task_id || null,
    agent_id: flags.agent || flags.agent_id || null,
    tool_id: resolveToolId(flags),
    lease_type: leaseType,
    scope: scope || null,
    allowed_paths: allowedPaths,
    denied_paths: deniedPaths,
    created_at: now,
    expires_at: flags.expires || flags.expires_at || null,
    status: flags.status || "active"
  };
  const existingIndex = state.leases.findIndex((item) => item.lease_id === lease.lease_id);
  if (existingIndex >= 0) {
    lease.created_at = state.leases[existingIndex].created_at || now;
    state.leases[existingIndex] = { ...state.leases[existingIndex], ...lease };
  } else {
    state.leases.push(lease);
  }
  state.updated_at = now;
  writeIdeLeasesState(state);

  const activeLeases = state.leases.filter((item) => item.status === "active");
  const conflictState = readIdeConflictsState();
  const detectedConflicts = detectLeaseConflicts(lease, activeLeases.filter((item) => item.lease_id !== lease.lease_id));
  for (const conflict of detectedConflicts) {
    conflictState.conflicts.push(conflict);
  }
  if (detectedConflicts.length) {
    conflictState.updated_at = now;
    writeIdeConflictsState(conflictState);
    for (const conflict of detectedConflicts) {
      recordIdeAuditEvent(
        "ide.conflict.detected",
        "ide_conflict",
        conflict.conflict_id,
        `IDE conflict detected: ${conflict.conflict_type}`,
        conflict,
        appendAudit
      );
    }
  }

  recordIdeAuditEvent("ide.lease.created", "ide_lease", lease.lease_id, `IDE lease created: ${lease.lease_id}`, lease, appendAudit);

  return {
    report_type: "multi_ai_ide_lease_created",
    generated_at: now,
    lease,
    conflicts: detectedConflicts,
    counts: {
      leases: state.leases.length,
      conflicts: conflictState.conflicts.length
    },
    next_action: detectedConflicts.length
      ? "Review the conflict records or release the overlapping lease."
      : "Use `kvdf multi-ai ide policy check` before editing."
  };
}

function registerToolPresence(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const windows = readIdeWindowSessionsState().sessions || [];
  const state = readIdeToolPresenceState();
  const toolRecord = resolveToolRecord(flags);
  const ideWindowId = resolveIdeWindowId(flags, windows);
  const workspaceId = resolveWorkspaceId(flags, windows);
  const toolId = toolRecord.tool_id;
  const presence = {
    tool_id: toolId,
    tool_name: toolRecord.tool_name,
    agent_id: flags.agent || flags.agent_id || toolId,
    session_id: flags.session || flags.session_id || `ide-session-${toolId}`,
    ide_window_id: ideWindowId,
    workspace_id: workspaceId,
    task_id: flags.task || flags.task_id || flags.active_task_id || null,
    status: flags.status || "active",
    last_seen_at: now,
    capabilities: toolRecord.capabilities,
    registered_at: now,
    updated_at: now
  };
  const existingIndex = state.tools.findIndex((item) => item.tool_id === toolId && item.ide_window_id === ideWindowId && item.workspace_id === workspaceId);
  if (existingIndex >= 0) {
    presence.registered_at = state.tools[existingIndex].registered_at || now;
    state.tools[existingIndex] = { ...state.tools[existingIndex], ...presence };
  } else {
    state.tools.push(presence);
  }
  state.updated_at = now;
  writeIdeToolPresenceState(state);
  registerAgentSession({
    ...flags,
    tool_id: toolId,
    tool_name: toolRecord.tool_name,
    session: presence.session_id,
    agent: presence.agent_id,
    ide_window_id: ideWindowId,
    workspace_id: workspaceId,
    task_id: presence.task_id,
    capabilities: toolRecord.capabilities,
    status: presence.status
  }, deps, appendAudit, { silent: true });
  recordIdeAuditEvent("ide.tool.registered", "ide_tool", toolId, `IDE tool presence registered: ${toolId}`, presence, appendAudit);
  return {
    report_type: "multi_ai_ide_tool_registered",
    generated_at: now,
    tool_presence: presence,
    next_action: "Use `kvdf multi-ai ide policy check` to evaluate the next edit."
  };
}

function registerAgentSession(flags = {}, deps = {}, appendAudit = null, options = {}) {
  const now = new Date().toISOString();
  const windows = readIdeWindowSessionsState().sessions || [];
  const state = readIdeAgentSessionsState();
  const toolRecord = resolveToolRecord(flags);
  const agentId = String(flags.agent || flags.agent_id || flags.tool_id || toolRecord.tool_id || "unknown-agent").trim();
  const sessionId = String(flags.session || flags.session_id || `ide-agent-${String(state.sessions.length + 1).padStart(3, "0")}`).trim();
  const ideWindowId = resolveIdeWindowId(flags, windows);
  const workspaceId = resolveWorkspaceId(flags, windows);
  const session = {
    agent_id: agentId,
    agent_name: flags.agent_name || flags.name || toolRecord.tool_name,
    tool_id: toolRecord.tool_id,
    session_id: sessionId,
    ide_window_id: ideWindowId,
    workspace_id: workspaceId,
    task_id: flags.task || flags.task_id || null,
    status: flags.status || "active",
    opened_at: now,
    last_seen_at: now,
    capabilities: normalizePathList(flags.capabilities || toolRecord.capabilities)
  };
  const existingIndex = state.sessions.findIndex((item) => item.agent_id === agentId && item.session_id === sessionId && item.ide_window_id === ideWindowId);
  if (existingIndex >= 0) {
    session.opened_at = state.sessions[existingIndex].opened_at || now;
    state.sessions[existingIndex] = { ...state.sessions[existingIndex], ...session };
  } else {
    state.sessions.push(session);
  }
  state.updated_at = now;
  writeIdeAgentSessionsState(state);
  if (!options.silent) {
    recordIdeAuditEvent("ide.agent.registered", "ide_agent", agentId, `IDE agent session registered: ${agentId}`, session, appendAudit);
  }
  return {
    report_type: "multi_ai_ide_agent_registered",
    generated_at: now,
    agent_session: session,
    next_action: "Use `kvdf multi-ai ide tool register` to align tool presence with the same IDE window."
  };
}

function buildToolPresenceReport(flags = {}) {
  const state = readIdeToolPresenceState();
  const ideWindowId = resolveIdeWindowId(flags, []);
  const tools = ideWindowId ? state.tools.filter((item) => item.ide_window_id === ideWindowId) : state.tools;
  return {
    report_type: "multi_ai_ide_tool_presence",
    generated_at: new Date().toISOString(),
    ide_window_id: ideWindowId || null,
    tools,
    counts: {
      total: state.tools.length,
      active: state.tools.filter((item) => item.status === "active").length,
      selected: tools.length
    }
  };
}

function buildAgentSessionReport(flags = {}) {
  const state = readIdeAgentSessionsState();
  const ideWindowId = resolveIdeWindowId(flags, []);
  const sessions = ideWindowId ? state.sessions.filter((item) => item.ide_window_id === ideWindowId) : state.sessions;
  return {
    report_type: "multi_ai_ide_agent_sessions",
    generated_at: new Date().toISOString(),
    ide_window_id: ideWindowId || null,
    sessions,
    counts: {
      total: state.sessions.length,
      active: state.sessions.filter((item) => item.status === "active").length,
      selected: sessions.length
    }
  };
}

function buildLeaseReport(flags = {}) {
  const state = readIdeLeasesState();
  const ideWindowId = resolveIdeWindowId(flags, []);
  const leases = ideWindowId ? state.leases.filter((item) => item.ide_window_id === ideWindowId) : state.leases;
  return {
    report_type: "multi_ai_ide_leases",
    generated_at: new Date().toISOString(),
    ide_window_id: ideWindowId || null,
    leases,
    counts: {
      total: state.leases.length,
      active: state.leases.filter((item) => item.status === "active").length,
      selected: leases.length
    }
  };
}

function detectLeaseConflicts(lease, otherLeases = []) {
  const now = new Date().toISOString();
  const conflicts = [];
  const leasePaths = uniquePaths([...(lease.allowed_paths || []), lease.scope].filter(Boolean));
  const deniedPaths = uniquePaths(lease.denied_paths || []);
  for (const other of otherLeases) {
    if (!other || other.status !== "active") continue;
    if (other.lease_id === lease.lease_id) continue;
    const otherPaths = uniquePaths([...(other.allowed_paths || []), other.scope].filter(Boolean));
    const sameFile = leasePaths.some((left) => otherPaths.some((right) => pathsOverlap(left, right)));
    if (sameFile && String(other.tool_id || "") !== String(lease.tool_id || "")) {
      conflicts.push({
        conflict_id: `ide-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        ide_window_id: lease.ide_window_id,
        workspace_id: lease.workspace_id,
        task_id: lease.task_id,
        agent_id: lease.agent_id,
        tool_id: lease.tool_id,
        conflict_type: "same_file",
        severity: "high",
        path: leasePaths[0] || lease.scope || null,
        reason: `Same file or folder is already leased by ${other.tool_id || other.agent_id || other.lease_id}.`,
        created_at: now,
        status: "open"
      });
    }
    if (deniedPaths.length && otherPaths.some((candidate) => deniedPaths.some((denied) => pathsOverlap(candidate, denied)))) {
      conflicts.push({
        conflict_id: `ide-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        ide_window_id: lease.ide_window_id,
        workspace_id: lease.workspace_id,
        task_id: lease.task_id,
        agent_id: lease.agent_id,
        tool_id: lease.tool_id,
        conflict_type: "denied_path",
        severity: "high",
        path: deniedPaths[0] || lease.scope || null,
        reason: `Denied path overlaps with an active lease: ${deniedPaths[0] || "unknown"}.`,
        created_at: now,
        status: "open"
      });
    }
  }
  if (lease.expires_at && isExpired(lease.expires_at)) {
    conflicts.push({
      conflict_id: `ide-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
      lease_id: lease.lease_id,
      other_lease_id: null,
      ide_window_id: lease.ide_window_id,
      workspace_id: lease.workspace_id,
      task_id: lease.task_id,
      agent_id: lease.agent_id,
      tool_id: lease.tool_id,
      conflict_type: "expired_lease",
      severity: "high",
      path: lease.scope || (lease.allowed_paths && lease.allowed_paths[0]) || null,
      reason: `Lease expired at ${lease.expires_at}.`,
      created_at: now,
      status: "open"
    });
  }
  return conflicts;
}

function findDeniedPathHit(lease, pathValue) {
  if (!pathValue) return null;
  const denied = Array.isArray(lease.denied_paths) ? lease.denied_paths : [];
  return denied.find((item) => pathsOverlap(item, pathValue)) || null;
}

function findConflictForPath(conflicts, { windowId, workspaceId, toolId, pathValue }) {
  if (!Array.isArray(conflicts) || !conflicts.length) return null;
  return [...conflicts].reverse().find((item) => {
    if (item.status === "resolved") return false;
    if (windowId && item.ide_window_id && item.ide_window_id !== windowId) return false;
    if (workspaceId && item.workspace_id && item.workspace_id !== workspaceId) return false;
    if (toolId && item.tool_id && item.tool_id === toolId && item.conflict_type !== "denied_path") return false;
    if (pathValue && item.path && !pathsOverlap(item.path, pathValue)) return false;
    return true;
  }) || null;
}

function findActiveLease(leases, { windowId, workspaceId, toolId, agentId, pathValue }) {
  if (!Array.isArray(leases) || !leases.length) return null;
  return [...leases].reverse().find((item) => {
    if (item.status !== "active") return false;
    if (windowId && item.ide_window_id && item.ide_window_id !== windowId) return false;
    if (workspaceId && item.workspace_id && item.workspace_id !== workspaceId) return false;
    if (toolId && item.tool_id && item.tool_id !== toolId) return false;
    if (agentId && item.agent_id && item.agent_id !== agentId) return false;
    if (pathValue) {
      const allowed = Array.isArray(item.allowed_paths) && item.allowed_paths.length ? item.allowed_paths : [item.scope].filter(Boolean);
      const allowedHit = allowed.some((candidate) => pathsOverlap(candidate, pathValue));
      return allowedHit;
    }
    return true;
  }) || null;
}

function findToolPresence(tools, { toolId, windowId, workspaceId, agentId }) {
  return [...(tools || [])].reverse().find((item) => {
    if (item.status !== "active") return false;
    if (toolId && item.tool_id !== toolId) return false;
    if (windowId && item.ide_window_id && item.ide_window_id !== windowId) return false;
    if (workspaceId && item.workspace_id && item.workspace_id !== workspaceId) return false;
    if (agentId && item.agent_id && item.agent_id !== agentId) return false;
    return true;
  }) || null;
}

function findAgentSession(sessions, { toolId, windowId, workspaceId, agentId }) {
  return [...(sessions || [])].reverse().find((item) => {
    if (item.status !== "active") return false;
    if (toolId && item.tool_id !== toolId) return false;
    if (windowId && item.ide_window_id && item.ide_window_id !== windowId) return false;
    if (workspaceId && item.workspace_id && item.workspace_id !== workspaceId) return false;
    if (agentId && item.agent_id && item.agent_id !== agentId) return false;
    return true;
  }) || null;
}

function registerAgentSessionFromPresence(presence, deps = {}, appendAudit = null) {
  return registerAgentSession({
    agent: presence.agent_id,
    agent_id: presence.agent_id,
    agent_name: presence.tool_name,
    tool_id: presence.tool_id,
    session: presence.session_id,
    session_id: presence.session_id,
    ide_window_id: presence.ide_window_id,
    workspace_id: presence.workspace_id,
    task_id: presence.task_id,
    status: presence.status,
    capabilities: presence.capabilities
  }, deps, appendAudit, { silent: true });
}

function pathsOverlap(left, right) {
  const a = normalizePath(left);
  const b = normalizePath(right);
  if (!a || !b) return false;
  return a === b || pathScopeContains(a, b) || pathScopeContains(b, a);
}

function normalizePath(value) {
  return normalizeLockScope(String(value || "").trim());
}

function normalizePathList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return uniquePaths(value.map((item) => normalizePath(item)).filter(Boolean));
  return uniquePaths(String(value).split(",").map((item) => normalizePath(item)).filter(Boolean));
}

function deriveAllowedPathsForLease(leaseType, scope) {
  if (!scope) return [];
  if (leaseType === "folder") return [scope];
  if (leaseType === "file") return [scope];
  return [scope];
}

function deriveDeniedPathsForLease(leaseType) {
  void leaseType;
  return [".env", ".env.*", "secrets/", ".kabeeri/owner_auth.json", ".kabeeri/session.json"];
}

function isHighRiskPath(pathValue) {
  const normalized = normalizePath(pathValue);
  if (!normalized) return false;
  const highRiskPaths = [
    ".kabeeri/owner_auth.json",
    ".kabeeri/session.json",
    ".kabeeri/multi_ai_governance.json",
    ".kabeeri/ai_tool_adapters.json",
    "package.json",
    "plugins/multi_ai_governance/plugin.json",
    "plugins/ai_tool_adapters/plugin.json",
    "src/cli/index.js",
    "schemas/runtime/schema_registry.json",
    ".env"
  ].map((item) => normalizePath(item));
  return highRiskPaths.some((item) => pathsOverlap(item, normalized));
}

function getPolicyNextAction(decision, requiresOwnerApproval, deniedByLease, leaseConflict, expiredLease, highRisk, pathValue) {
  if (decision === "allow") return "The IDE action is allowed. Continue inside the active lease.";
  if (decision === "warn") return "Proceed carefully and create or refresh the lease before the next edit.";
  if (decision === "require_owner_approval") return `Request owner approval before editing ${pathValue || "the requested path"}.`;
  if (deniedByLease) return "The path is denied by the active lease.";
  if (leaseConflict) return "Resolve the lease conflict before editing.";
  if (expiredLease) return "Refresh or replace the expired lease before editing.";
  if (highRisk || requiresOwnerApproval) return "Owner approval is required for this IDE action.";
  return "Resolve the policy blocker before continuing.";
}

function recordIdeAuditEvent(eventType, entityType, entityId, summary, metadata = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readIdeAuditLogState();
  const record = {
    event_id: `ide-audit-${String(state.records.length + 1).padStart(3, "0")}`,
    timestamp: now,
    actor_id: metadata && metadata.agent_id ? metadata.agent_id : "local-cli",
    actor_role: metadata && metadata.tool_id ? metadata.tool_id : "ide",
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata: metadata && typeof metadata === "object" ? metadata : {}
  };
  state.records.push(record);
  state.updated_at = now;
  writeIdeAuditLogState(state);
  if (appendAudit) {
    appendAudit(eventType, entityType, entityId, summary, metadata);
  }
  return record;
}

function readAiToolAdapterTools() {
  const file = ".kabeeri/ai_tool_adapters.json";
  if (!fileExists(file)) return [];
  try {
    const state = readJsonFile(file);
    return Array.isArray(state.tools) ? state.tools.map((tool) => ({
      tool_id: tool.tool_id || tool.tool_type || tool.command || "unknown_ai_tool",
      tool_name: tool.display_name || canonicalToolName(tool.tool_id || tool.tool_type || tool.command),
      capabilities: Array.isArray(tool.capabilities) ? tool.capabilities : [],
      status: tool.status || "unknown",
      execution_enabled: Boolean(tool.execution_enabled),
      command: tool.command || null,
      resolved_path: tool.resolved_path || null
    })) : [];
  } catch (error) {
    return [];
  }
}

function resolveToolRecord(flags = {}) {
  const raw = String(flags.tool || flags.tool_id || flags.tool_name || flags.agent || flags.agent_id || flags.name || flags.value || "").trim();
  const normalized = normalizeToolId(raw) || "unknown_ai_tool";
  const known = KNOWN_TOOL_ALIASES[normalized] || KNOWN_TOOL_ALIASES.unknown_ai_tool;
  const adapterTools = readAiToolAdapterTools();
  const adapterMatch = adapterTools.find((item) => normalizeToolId(item.tool_id) === normalized || normalizeToolId(item.tool_name) === normalized) || null;
  return {
    tool_id: adapterMatch ? normalizeToolId(adapterMatch.tool_id) : known.tool_id,
    tool_name: adapterMatch ? adapterMatch.tool_name : known.tool_name,
    capabilities: uniquePaths([
      ...(adapterMatch && Array.isArray(adapterMatch.capabilities) ? adapterMatch.capabilities : []),
      ...known.capabilities
    ])
  };
}

function normalizeToolId(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized) return "";
  const aliases = {
    codex_cli: "codex",
    codex: "codex",
    claude: "claude_code",
    claude_code: "claude_code",
    "claude-code": "claude_code",
    github_copilot: "github_copilot",
    copilot: "github_copilot",
    cursor: "cursor_agent",
    cursor_agent: "cursor_agent",
    "cursor-agent": "cursor_agent",
    cline: "cline",
    roo: "roo",
    continue: "continue",
    mcp: "mcp_tool",
    mcp_tool: "mcp_tool",
    "mcp-tool": "mcp_tool",
    terminal: "terminal_agent",
    terminal_agent: "terminal_agent",
    "terminal-agent": "terminal_agent",
    unknown: "unknown_ai_tool",
    unknown_ai_tool: "unknown_ai_tool"
  };
  return aliases[normalized] || normalized;
}

function normalizeLeaseType(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized) return "task";
  const aliases = {
    dir: "folder",
    directory: "folder",
    folder: "folder",
    folders: "folder",
    file: "file",
    files: "file",
    path: "file",
    paths: "folder",
    task: "task",
    tasks: "task"
  };
  return aliases[normalized] || normalized;
}

function canonicalToolName(toolId) {
  const normalized = normalizeToolId(toolId);
  return (KNOWN_TOOL_ALIASES[normalized] && KNOWN_TOOL_ALIASES[normalized].tool_name) || String(toolId || "Unknown AI Tool").replace(/[_-]/g, " ");
}

function resolveToolId(flags = {}) {
  const raw = String(flags.tool_id || flags.tool || flags.tool_name || flags.agent || flags.agent_id || flags.value || "").trim();
  return normalizeToolId(raw) || "unknown_ai_tool";
}

function resolveIdeWindowId(flags = {}, sessions = []) {
  const candidate = flags.ide_window_id || flags.window_id || flags.window || flags.id || null;
  if (candidate) return String(candidate).trim();
  const latest = latestIdeWindowSession(sessions);
  return latest ? latest.ide_window_id : null;
}

function resolveWorkspaceId(flags = {}, sessions = []) {
  const candidate = flags.workspace_id || flags.workspace || flags["workspace-id"] || null;
  if (candidate) return String(candidate).trim();
  const latest = latestIdeWindowSession(sessions);
  return latest ? latest.workspace_id : null;
}

function resolveProjectId(flags = {}) {
  const candidate = flags.project_id || flags.project || flags["project-id"] || null;
  if (candidate) return String(candidate).trim();
  return null;
}

function resolveOwnerId(flags = {}) {
  const candidate = flags.owner_id || flags.owner || flags["owner-id"] || null;
  if (candidate) return String(candidate).trim();
  const session = fileExists(".kabeeri/session.json") ? readJsonFile(".kabeeri/session.json") : null;
  return session && session.owner_id ? String(session.owner_id).trim() : "owner";
}

function deriveWorkspaceId() {
  return path.basename(repoRoot()).replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase() || "workspace";
}

function deriveProjectId() {
  if (fileExists(".kabeeri/project.json")) {
    try {
      const project = readJsonFile(".kabeeri/project.json");
      return String(project.project_id || project.id || project.slug || project.name || "").trim() || null;
    } catch (error) {
      return null;
    }
  }
  return null;
}

function buildIdeWindowId(sessions = []) {
  return `ide-window-${String((sessions || []).length + 1).padStart(3, "0")}`;
}

function latestIdeWindowSession(sessions = []) {
  return [...(sessions || [])].sort((left, right) => String(right.last_seen_at || right.opened_at || right.ide_window_id || "").localeCompare(String(left.last_seen_at || left.opened_at || left.ide_window_id || "")))[0] || null;
}

function resolveIdeWindowSessionById(sessions, windowId, workspaceId) {
  if (!Array.isArray(sessions) || !sessions.length) return null;
  if (windowId) {
    const found = sessions.find((item) => item.ide_window_id === windowId);
    if (found) return found;
  }
  if (workspaceId) {
    const found = [...sessions].reverse().find((item) => item.workspace_id === workspaceId);
    if (found) return found;
  }
  return latestIdeWindowSession(sessions);
}

function filterByWindow(items, windowSession) {
  if (!windowSession) return [];
  return (items || []).filter((item) => item.ide_window_id === windowSession.ide_window_id);
}

function normalizeAction(value, flags = {}) {
  if (value && typeof value === "string") return value.trim().toLowerCase();
  return String(flags.action || flags.cmd || flags.subaction || "").trim().toLowerCase();
}

function normalizeNestedAction(value, flags = {}) {
  if (value && typeof value === "string") return value.trim().toLowerCase();
  return String(flags.action || flags.cmd || flags.mode || "").trim().toLowerCase();
}

function uniquePaths(values) {
  return Array.from(new Set((values || []).map((item) => normalizePath(item)).filter(Boolean)));
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot(), relativePath));
}

function ensureStateObject(relativePath, defaults) {
  ensureWorkspace();
  ensureIdeStateDir();
  if (!fileExists(relativePath)) {
    writeJsonFile(relativePath, defaults);
  }
  return readJsonFile(relativePath);
}

function ensureIdeStateDir() {
  fs.mkdirSync(path.join(repoRoot(), IDE_STATE_DIR), { recursive: true });
}

function readIdeWindowSessionsState() {
  const state = ensureStateObject(IDE_WINDOW_SESSIONS_FILE, defaultIdeWindowSessionsState());
  state.sessions = Array.isArray(state.sessions) ? state.sessions : [];
  return state;
}

function writeIdeWindowSessionsState(state) {
  writeJsonFile(IDE_WINDOW_SESSIONS_FILE, {
    ...defaultIdeWindowSessionsState(),
    ...(state || {}),
    sessions: Array.isArray(state && state.sessions) ? state.sessions : []
  });
}

function defaultIdeWindowSessionsState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    sessions: []
  };
}

function readIdeToolPresenceState() {
  const state = ensureStateObject(IDE_TOOL_PRESENCE_FILE, defaultIdeToolPresenceState());
  state.tools = Array.isArray(state.tools) ? state.tools : [];
  return state;
}

function writeIdeToolPresenceState(state) {
  writeJsonFile(IDE_TOOL_PRESENCE_FILE, {
    ...defaultIdeToolPresenceState(),
    ...(state || {}),
    tools: Array.isArray(state && state.tools) ? state.tools : []
  });
}

function defaultIdeToolPresenceState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    tools: []
  };
}

function readIdeAgentSessionsState() {
  const state = ensureStateObject(IDE_AGENT_SESSIONS_FILE, defaultIdeAgentSessionsState());
  state.sessions = Array.isArray(state.sessions) ? state.sessions : [];
  return state;
}

function writeIdeAgentSessionsState(state) {
  writeJsonFile(IDE_AGENT_SESSIONS_FILE, {
    ...defaultIdeAgentSessionsState(),
    ...(state || {}),
    sessions: Array.isArray(state && state.sessions) ? state.sessions : []
  });
}

function defaultIdeAgentSessionsState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    sessions: []
  };
}

function readIdeLeasesState() {
  const state = ensureStateObject(IDE_LEASES_FILE, defaultIdeLeasesState());
  state.leases = Array.isArray(state.leases) ? state.leases : [];
  return state;
}

function writeIdeLeasesState(state) {
  writeJsonFile(IDE_LEASES_FILE, {
    ...defaultIdeLeasesState(),
    ...(state || {}),
    leases: Array.isArray(state && state.leases) ? state.leases : []
  });
}

function defaultIdeLeasesState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    leases: []
  };
}

function readIdeConflictsState() {
  const state = ensureStateObject(IDE_CONFLICTS_FILE, defaultIdeConflictsState());
  state.conflicts = Array.isArray(state.conflicts) ? state.conflicts : [];
  return state;
}

function writeIdeConflictsState(state) {
  writeJsonFile(IDE_CONFLICTS_FILE, {
    ...defaultIdeConflictsState(),
    ...(state || {}),
    conflicts: Array.isArray(state && state.conflicts) ? state.conflicts : []
  });
}

function defaultIdeConflictsState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    conflicts: []
  };
}

function readIdePolicyDecisionsState() {
  const state = ensureStateObject(IDE_POLICY_DECISIONS_FILE, defaultIdePolicyDecisionsState());
  state.decisions = Array.isArray(state.decisions) ? state.decisions : [];
  return state;
}

function writeIdePolicyDecisionsState(state) {
  writeJsonFile(IDE_POLICY_DECISIONS_FILE, {
    ...defaultIdePolicyDecisionsState(),
    ...(state || {}),
    decisions: Array.isArray(state && state.decisions) ? state.decisions : []
  });
}

function defaultIdePolicyDecisionsState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    decisions: []
  };
}

function readIdeApprovalRequestsState() {
  const state = ensureStateObject(IDE_APPROVAL_REQUESTS_FILE, defaultIdeApprovalRequestsState());
  state.requests = Array.isArray(state.requests) ? state.requests : [];
  return state;
}

function writeIdeApprovalRequestsState(state) {
  writeJsonFile(IDE_APPROVAL_REQUESTS_FILE, {
    ...defaultIdeApprovalRequestsState(),
    ...(state || {}),
    requests: Array.isArray(state && state.requests) ? state.requests : []
  });
}

function defaultIdeApprovalRequestsState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    requests: []
  };
}

function readIdeAuditLogState() {
  const state = ensureStateObject(IDE_AUDIT_LOG_FILE, defaultIdeAuditLogState());
  state.records = Array.isArray(state.records) ? state.records : [];
  return state;
}

function writeIdeAuditLogState(state) {
  writeJsonFile(IDE_AUDIT_LOG_FILE, {
    ...defaultIdeAuditLogState(),
    ...(state || {}),
    records: Array.isArray(state && state.records) ? state.records : []
  });
}

function defaultIdeAuditLogState() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    records: []
  };
}

function renderIdeReport(report) {
  if (!report || typeof report !== "object") return "IDE governance report unavailable.";
  if (report.report_type === "multi_ai_ide_status") {
    return [
      "Multi-AI IDE Window Governance",
      "",
      `IDE windows: ${report.counts.windows}`,
      `Active tools: ${report.counts.active_tools}`,
      `Active leases: ${report.counts.active_leases}`,
      `Open conflicts: ${report.counts.open_conflicts}`,
      report.ide_window ? `Selected window: ${report.ide_window.ide_window_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_ide_window_registered") {
    return `IDE window registered: ${report.ide_window ? report.ide_window.ide_window_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_ide_tool_registered") {
    return `IDE tool registered: ${report.tool_presence ? report.tool_presence.tool_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_ide_agent_registered") {
    return `IDE agent registered: ${report.agent_session ? report.agent_session.agent_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_ide_lease_created") {
    return `IDE lease created: ${report.lease ? report.lease.lease_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_ide_lease_released") {
    return `IDE lease released: ${report.lease ? report.lease.lease_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_ide_conflicts") {
    const lines = [
      "Multi-AI IDE Conflicts",
      `Conflicts: ${report.counts.selected}`
    ];
    for (const conflict of report.conflicts || []) {
      lines.push(`- ${conflict.conflict_id}: ${conflict.conflict_type} (${conflict.path || "n/a"})`);
    }
    if (!(report.conflicts || []).length) lines.push("- none");
    return lines.join("\n");
  }
  if (report.report_type === "multi_ai_ide_policy_decision") {
    return [
      "Multi-AI IDE Policy Decision",
      "",
      `Decision: ${report.decision}`,
      `Risk: ${report.risk_level}`,
      `Owner approval required: ${report.requires_owner_approval ? "yes" : "no"}`,
      report.reason ? `Reason: ${report.reason}` : null,
      report.path ? `Path: ${report.path}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_ide_tool_presence") {
    const rows = (report.tools || []).map((item) => [
      item.tool_id,
      item.agent_id,
      item.session_id,
      item.ide_window_id,
      item.status
    ]);
    return table(["Tool", "Agent", "Session", "Window", "Status"], rows);
  }
  if (report.report_type === "multi_ai_ide_agent_sessions") {
    const rows = (report.sessions || []).map((item) => [
      item.agent_id,
      item.tool_id,
      item.session_id,
      item.ide_window_id,
      item.status
    ]);
    return table(["Agent", "Tool", "Session", "Window", "Status"], rows);
  }
  if (report.report_type === "multi_ai_ide_leases") {
    const rows = (report.leases || []).map((item) => [
      item.lease_id,
      item.lease_type,
      item.scope || "",
      item.tool_id || "",
      item.agent_id || "",
      item.status
    ]);
    return table(["Lease", "Type", "Scope", "Tool", "Agent", "Status"], rows);
  }
  return JSON.stringify(report, null, 2);
}

function normalizePathValue(value) {
  return normalizePath(value);
}

module.exports = {
  multiAiIdeGovernance,
  buildIdeStatusReport,
  registerIdeWindowSession,
  handleToolPresenceAction,
  handleAgentSessionAction,
  handleLeaseAction,
  releaseIdeLease,
  buildIdeConflictsReport,
  evaluateIdePolicy,
  createIdeLease,
  registerToolPresence,
  registerAgentSession,
  buildToolPresenceReport,
  buildAgentSessionReport,
  buildLeaseReport,
  detectLeaseConflicts,
  readIdeWindowSessionsState,
  readIdeToolPresenceState,
  readIdeAgentSessionsState,
  readIdeLeasesState,
  readIdeConflictsState,
  readIdePolicyDecisionsState,
  readIdeApprovalRequestsState,
  readIdeAuditLogState,
  writeIdeWindowSessionsState,
  writeIdeToolPresenceState,
  writeIdeAgentSessionsState,
  writeIdeLeasesState,
  writeIdeConflictsState,
  writeIdePolicyDecisionsState,
  writeIdeApprovalRequestsState,
  writeIdeAuditLogState,
  normalizeToolId,
  normalizeLeaseType,
  canonicalToolName,
  normalizePath: normalizePathValue,
  renderIdeReport
};
