const fs = require("fs");
const os = require("os");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot } = require("../../../src/cli/fs_utils");
const { table } = require("../../../src/cli/ui");
const { isExpired } = require("../../../src/cli/services/collections");
const { getGitChangedFileDetails, listLocalGitChangedFileDetails } = require("../../../src/cli/services/git_snapshot");
const { buildGitContext } = require("../../../src/cli/services/source_control_context");
const { normalizeLockScope, pathScopeContains } = require("../../../src/cli/commands/lock");
const ideGovernance = require("./ide_window_governance");

const LOCAL_STATE_DIR = ".kabeeri/multi_ai_governance";
const LOCAL_PROJECT_FILE = `${LOCAL_STATE_DIR}/local_project.json`;
const LOCAL_MACHINE_FILE = `${LOCAL_STATE_DIR}/local_machine.json`;
const LOCAL_CLIENTS_FILE = `${LOCAL_STATE_DIR}/local_clients.json`;
const LOCAL_SESSIONS_FILE = `${LOCAL_STATE_DIR}/local_sessions.json`;
const LOCAL_HEARTBEATS_FILE = `${LOCAL_STATE_DIR}/local_heartbeats.json`;
const LOCAL_LEASES_FILE = `${LOCAL_STATE_DIR}/local_leases.json`;
const LOCAL_CONFLICTS_FILE = `${LOCAL_STATE_DIR}/local_conflicts.json`;
const LOCAL_UNGOVERNED_CHANGES_FILE = `${LOCAL_STATE_DIR}/local_ungoverned_changes.json`;
const LOCAL_POLICY_DECISIONS_FILE = `${LOCAL_STATE_DIR}/local_policy_decisions.json`;
const LOCAL_APPROVAL_REQUESTS_FILE = `${LOCAL_STATE_DIR}/local_approval_requests.json`;
const LOCAL_AUDIT_LOG_FILE = `${LOCAL_STATE_DIR}/local_audit_log.json`;

const LOCAL_CLIENT_TYPES = new Set([
  "vscode",
  "cursor",
  "webstorm",
  "visual_studio",
  "zed",
  "terminal",
  "local_agent",
  "local_script",
  "github_desktop",
  "unknown_editor",
  "unknown_ai_tool"
]);

function multiAiLocalGovernance(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const appendAudit = typeof deps.appendAudit === "function" ? deps.appendAudit : null;
  const subaction = normalizeAction(value, flags);

  if (!action || action === "status" || action === "summary") {
    return buildLocalStatusReport(flags, deps);
  }

  if (subaction === "status" || subaction === "show" || subaction === "list") {
    return buildLocalStatusReport(flags, deps);
  }

  if (subaction === "register" || subaction === "open" || subaction === "refresh") {
    return registerLocalProject(flags, deps, appendAudit);
  }

  if (subaction === "client") {
    const clientAction = normalizeNestedAction(rest[0], flags);
    return handleClientAction(clientAction, flags, rest.slice(1), deps, appendAudit);
  }

  if (subaction === "session") {
    const sessionAction = normalizeNestedAction(rest[0], flags);
    return handleSessionAction(sessionAction, flags, rest.slice(1), deps, appendAudit);
  }

  if (subaction === "heartbeat") {
    return recordLocalHeartbeat(flags, deps, appendAudit);
  }

  if (subaction === "lease") {
    const leaseAction = normalizeNestedAction(rest[0], flags);
    return handleLeaseAction(leaseAction, flags, rest.slice(1), deps, appendAudit);
  }

  if (subaction === "release") {
    return releaseLocalLease(flags, deps, appendAudit);
  }

  if (subaction === "conflicts") {
    return buildLocalConflictsReport(flags, deps);
  }

  if (subaction === "scan") {
    return scanLocalProject(flags, deps, appendAudit);
  }

  if (subaction === "policy" || subaction === "check" || subaction === "evaluate") {
    const policyAction = normalizeNestedAction(rest[0], flags);
    return evaluateLocalPolicy(policyAction, flags, rest.slice(1), deps, appendAudit);
  }

  throw new Error(`Unknown local governance action: ${action}${subaction ? ` ${subaction}` : ""}`);
}

function buildLocalStatusReport(flags = {}, deps = {}) {
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const clients = readLocalClientsState().clients || [];
  const sessions = readLocalSessionsState().sessions || [];
  const heartbeats = readLocalHeartbeatsState().heartbeats || [];
  const leases = readLocalLeasesState().leases || [];
  const conflicts = readLocalConflictsState().conflicts || [];
  const ungoverned = readLocalUngovernedChangesState().changes || [];
  const decisions = readLocalPolicyDecisionsState().decisions || [];
  const windowSessions = ideGovernance.readIdeWindowSessionsState().sessions || [];
  const linkedWindows = clients.filter((item) => item.ide_window_id).map((item) => item.ide_window_id).filter(Boolean);
  const activeWindows = Array.from(new Set(linkedWindows));

  return {
    report_type: "multi_ai_local_status",
    generated_at: new Date().toISOString(),
    local_project: project,
    local_machine: machine,
    counts: {
      clients: clients.length,
      sessions: sessions.length,
      heartbeats: heartbeats.length,
      leases: leases.length,
      active_leases: leases.filter((item) => item.status === "active").length,
      conflicts: conflicts.length,
      open_conflicts: conflicts.filter((item) => item.status !== "resolved").length,
      ungoverned_changes: ungoverned.length,
      policy_decisions: decisions.length,
      linked_ide_windows: activeWindows.length,
      ide_windows: windowSessions.length
    },
    clients: filterByProject(clients, project),
    sessions: filterByProject(sessions, project),
    leases: filterByProject(leases, project),
    conflicts: filterByProject(conflicts, project),
    ungoverned_changes: filterByProject(ungoverned, project),
    next_action: project && project.project_id
      ? "Use `kvdf multi-ai local client register`, `kvdf multi-ai local lease create`, or `kvdf multi-ai local policy check`."
      : "Register the local project with `kvdf multi-ai local register`."
  };
}

function registerLocalProject(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const projectState = readLocalProjectState();
  const machineState = readLocalMachineState();
  const gitContext = buildGitContext({ cwd: repoRoot(), track: "framework_owner" });
  const project = {
    machine_id: resolveMachineId(flags, machineState.machine_id),
    project_id: resolveProjectId(flags, projectState.project_id),
    repo_root: normalizePath(flags.repo_root || flags["repo-root"] || repoRoot()),
    runtime_root: LOCAL_STATE_DIR,
    git_remote: resolveGitRemote(flags, gitContext),
    default_branch: resolveDefaultBranch(flags, gitContext),
    current_branch: resolveCurrentBranch(flags, gitContext),
    owner_id: resolveOwnerId(flags, projectState.owner_id),
    created_at: projectState.created_at || now,
    last_seen_at: now,
    status: flags.status || projectState.status || "active"
  };
  const machine = {
    machine_id: project.machine_id,
    hostname: os.hostname(),
    platform: process.platform,
    release: os.release(),
    repo_root: project.repo_root,
    runtime_root: LOCAL_STATE_DIR,
    owner_id: project.owner_id,
    created_at: machineState.created_at || now,
    last_seen_at: now,
    status: flags.status || machineState.status || "active"
  };
  writeLocalProjectState(project);
  writeLocalMachineState(machine);
  recordLocalAuditEvent("local.project.registered", "local_project", project.project_id, `Local project registered: ${project.project_id}`, { ...project, machine_id: machine.machine_id }, appendAudit);
  recordLocalAuditEvent("local.machine.registered", "local_machine", machine.machine_id, `Local machine registered: ${machine.machine_id}`, machine, appendAudit);
  return {
    report_type: "multi_ai_local_project_registered",
    generated_at: now,
    local_project: project,
    local_machine: machine,
    next_action: "Register a local client with `kvdf multi-ai local client register`."
  };
}

function handleClientAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const subaction = normalizeNestedAction(action, flags);
  if (!subaction || subaction === "status" || subaction === "show" || subaction === "list") {
    return buildLocalClientReport(flags);
  }
  if (subaction === "register" || subaction === "add" || subaction === "refresh") {
    return registerLocalClient(flags, deps, appendAudit);
  }
  throw new Error(`Unknown local client action: ${subaction}`);
}

function handleSessionAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const subaction = normalizeNestedAction(action, flags);
  if (!subaction || subaction === "status" || subaction === "show" || subaction === "list") {
    return buildLocalSessionReport(flags);
  }
  if (subaction === "register" || subaction === "add" || subaction === "refresh") {
    return registerLocalSession(flags, deps, appendAudit);
  }
  throw new Error(`Unknown local session action: ${subaction}`);
}

function handleLeaseAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const subaction = normalizeNestedAction(action, flags);
  if (!subaction || subaction === "status" || subaction === "show" || subaction === "list") {
    return buildLocalLeaseReport(flags);
  }
  if (subaction === "create" || subaction === "add" || subaction === "register") {
    return createLocalLease(flags, deps, appendAudit);
  }
  throw new Error(`Unknown local lease action: ${subaction}`);
}

function registerLocalClient(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const sessions = readLocalSessionsState().sessions || [];
  const clientState = readLocalClientsState();
  const clientType = normalizeLocalClientType(flags);
  const clientId = resolveLocalClientId(flags, clientType, clientState.clients || []);
  const sessionId = resolveLocalSessionId(flags, clientId);
  const client = {
    client_id: clientId,
    client_type: clientType,
    machine_id: project.machine_id || machine.machine_id,
    project_id: project.project_id,
    repo_root: project.repo_root,
    process_hint: resolveProcessHint(flags),
    ide_window_id: flags.ide_window_id || flags.window_id || null,
    agent_id: flags.agent || flags.agent_id || null,
    tool_id: flags.tool || flags.tool_id || null,
    active_task_id: flags.task || flags.task_id || flags.active_task_id || null,
    status: flags.status || "active",
    last_seen_at: now,
    capabilities: normalizeCapabilities(flags.capabilities || inferClientCapabilities(clientType)),
    session_id: sessionId
  };
  const existingIndex = clientState.clients.findIndex((item) => item.client_id === clientId);
  if (existingIndex >= 0) {
    client.created_at = clientState.clients[existingIndex].created_at || now;
    clientState.clients[existingIndex] = { ...clientState.clients[existingIndex], ...client };
  } else {
    client.created_at = now;
    clientState.clients.push(client);
  }
  clientState.updated_at = now;
  writeLocalClientsState(clientState);
  recordLocalHeartbeat({
    ...flags,
    client_id: clientId,
    session_id: sessionId,
    client_type: clientType,
    ide_window_id: client.ide_window_id,
    agent: client.agent_id,
    tool: client.tool_id,
    task: client.active_task_id,
    status: client.status
  }, deps, appendAudit, { silent: true });
  recordLocalAuditEvent("local.client.registered", "local_client", clientId, `Local client registered: ${clientId}`, client, appendAudit);
  return {
    report_type: "multi_ai_local_client_registered",
    generated_at: now,
    local_client: client,
    next_action: "Register a local session with `kvdf multi-ai local session register`."
  };
}

function registerLocalSession(flags = {}, deps = {}, appendAudit = null, options = {}) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const clientsState = readLocalClientsState();
  const clientType = normalizeLocalClientType(flags);
  const clientId = resolveLocalClientId(flags, clientType, clientsState.clients || []);
  const client = findLocalClient(clientsState.clients || [], clientId) || null;
  const sessionState = readLocalSessionsState();
  const sessionId = resolveLocalSessionId(flags, clientId, sessionState.sessions || []);
  const session = {
    session_id: sessionId,
    client_id: clientId,
    client_type: clientType,
    machine_id: project.machine_id || machine.machine_id,
    project_id: project.project_id,
    repo_root: project.repo_root,
    ide_window_id: flags.ide_window_id || (client ? client.ide_window_id : null) || null,
    agent_id: flags.agent || flags.agent_id || (client ? client.agent_id : null) || null,
    tool_id: flags.tool || flags.tool_id || (client ? client.tool_id : null) || null,
    active_task_id: flags.task || flags.task_id || flags.active_task_id || (client ? client.active_task_id : null) || null,
    branch: flags.branch || null,
    process_hint: resolveProcessHint(flags),
    status: flags.status || "active",
    opened_at: now,
    last_seen_at: now,
    capabilities: normalizeCapabilities(flags.capabilities || (client ? client.capabilities : inferClientCapabilities(clientType)))
  };
  const existingIndex = sessionState.sessions.findIndex((item) => item.session_id === sessionId);
  if (existingIndex >= 0) {
    session.opened_at = sessionState.sessions[existingIndex].opened_at || now;
    sessionState.sessions[existingIndex] = { ...sessionState.sessions[existingIndex], ...session };
  } else {
    sessionState.sessions.push(session);
  }
  sessionState.updated_at = now;
  writeLocalSessionsState(sessionState);
  recordLocalHeartbeat({
    ...flags,
    client_id: clientId,
    session_id: sessionId,
    client_type: clientType,
    ide_window_id: session.ide_window_id,
    agent: session.agent_id,
    tool: session.tool_id,
    task: session.active_task_id,
    status: session.status
  }, deps, appendAudit, { silent: true });
  recordLocalAuditEvent("local.session.registered", "local_session", sessionId, `Local session registered: ${sessionId}`, session, appendAudit);
  return {
    report_type: "multi_ai_local_session_registered",
    generated_at: now,
    local_session: session,
    next_action: "Create a local lease with `kvdf multi-ai local lease create`."
  };
}

function recordLocalHeartbeat(flags = {}, deps = {}, appendAudit = null, options = {}) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const clientsState = readLocalClientsState();
  const sessionsState = readLocalSessionsState();
  const heartbeatsState = readLocalHeartbeatsState();
  const clientType = normalizeLocalClientType(flags);
  const clientId = resolveLocalClientId(flags, clientType, clientsState.clients || []);
  const sessionId = resolveLocalSessionId(flags, clientId, sessionsState.sessions || []);
  const client = findLocalClient(clientsState.clients || [], clientId) || null;
  const session = findLocalSession(sessionsState.sessions || [], sessionId) || null;
  const heartbeat = {
    heartbeat_id: `local-heartbeat-${String(heartbeatsState.heartbeats.length + 1).padStart(3, "0")}`,
    client_id: clientId,
    session_id: sessionId,
    client_type: clientType,
    machine_id: project.machine_id || machine.machine_id,
    project_id: project.project_id,
    repo_root: project.repo_root,
    ide_window_id: flags.ide_window_id || (client ? client.ide_window_id : null) || null,
    agent_id: flags.agent || flags.agent_id || (client ? client.agent_id : null) || null,
    tool_id: flags.tool || flags.tool_id || (client ? client.tool_id : null) || null,
    task_id: flags.task || flags.task_id || flags.active_task_id || (client ? client.active_task_id : null) || null,
    status: flags.status || "active",
    timestamp: now,
    capabilities: normalizeCapabilities(flags.capabilities || (client ? client.capabilities : inferClientCapabilities(clientType)))
  };
  heartbeatsState.heartbeats.push(heartbeat);
  heartbeatsState.updated_at = now;
  writeLocalHeartbeatsState(heartbeatsState);
  if (client) {
    client.last_seen_at = now;
    client.status = heartbeat.status;
    client.project_id = project.project_id;
    writeLocalClientsState({
      ...clientsState,
      updated_at: now,
      clients: upsertById(clientsState.clients || [], client, "client_id")
    });
  }
  if (session) {
    session.last_seen_at = now;
    session.status = heartbeat.status;
    writeLocalSessionsState({
      ...sessionsState,
      updated_at: now,
      sessions: upsertById(sessionsState.sessions || [], session, "session_id")
    });
  }
  if (!options.silent) {
    recordLocalAuditEvent("local.heartbeat.recorded", "local_heartbeat", heartbeat.heartbeat_id, `Local heartbeat recorded: ${heartbeat.heartbeat_id}`, heartbeat, appendAudit);
  }
  return {
    report_type: "multi_ai_local_heartbeat",
    generated_at: now,
    local_heartbeat: heartbeat
  };
}

function buildLocalClientReport(flags = {}) {
  const state = readLocalClientsState();
  const clientId = String(flags.client_id || flags.client || flags.id || "").trim();
  const clients = clientId ? state.clients.filter((item) => item.client_id === clientId) : state.clients;
  return {
    report_type: "multi_ai_local_clients",
    generated_at: new Date().toISOString(),
    clients,
    counts: {
      total: state.clients.length,
      active: state.clients.filter((item) => item.status === "active").length,
      selected: clients.length
    }
  };
}

function buildLocalSessionReport(flags = {}) {
  const state = readLocalSessionsState();
  const sessionId = String(flags.session_id || flags.session || flags.id || "").trim();
  const sessions = sessionId ? state.sessions.filter((item) => item.session_id === sessionId) : state.sessions;
  return {
    report_type: "multi_ai_local_sessions",
    generated_at: new Date().toISOString(),
    sessions,
    counts: {
      total: state.sessions.length,
      active: state.sessions.filter((item) => item.status === "active").length,
      selected: sessions.length
    }
  };
}

function buildLocalLeaseReport(flags = {}) {
  const state = readLocalLeasesState();
  const leaseId = String(flags.lease_id || flags.lease || flags.id || "").trim();
  const leases = leaseId ? state.leases.filter((item) => item.lease_id === leaseId) : state.leases;
  return {
    report_type: "multi_ai_local_leases",
    generated_at: new Date().toISOString(),
    leases,
    counts: {
      total: state.leases.length,
      active: state.leases.filter((item) => item.status === "active").length,
      selected: leases.length
    }
  };
}

function releaseLocalLease(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readLocalLeasesState();
  const leaseId = String(flags.id || flags.lease_id || flags.lease || flags.scope || "").trim();
  if (!leaseId) throw new Error("Missing lease id.");
  const item = state.leases.find((entry) => entry.lease_id === leaseId || normalizePath(entry.scope) === normalizePath(leaseId)) || null;
  if (!item) throw new Error(`Lease not found: ${leaseId}`);
  item.status = "released";
  item.released_at = now;
  item.last_seen_at = now;
  state.updated_at = now;
  writeLocalLeasesState(state);
  recordLocalAuditEvent("local.lease.released", "local_lease", item.lease_id, `Local lease released: ${item.lease_id}`, item, appendAudit);
  return {
    report_type: "multi_ai_local_lease_released",
    generated_at: now,
    lease: item,
    next_action: "Run `kvdf multi-ai local policy check` before the next local change."
  };
}

function createLocalLease(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const clientsState = readLocalClientsState();
  const sessionsState = readLocalSessionsState();
  const state = readLocalLeasesState();
  const clientType = normalizeLocalClientType(flags);
  const clientId = resolveLocalClientId(flags, clientType, clientsState.clients || []);
  const sessionId = resolveLocalSessionId(flags, clientId, sessionsState.sessions || []);
  const taskId = flags.task || flags.task_id || flags.active_task_id || null;
  const leaseType = normalizeLeaseType(flags.type || flags.lease_type || flags.lease || "task");
  const scope = normalizePath(flags.scope || flags.path || flags.file || flags.folder || flags.task || flags.branch || "");
  if (!scope) throw new Error("Missing local lease scope.");
  const lease = {
    lease_id: String(flags.id || flags.lease_id || `local-lease-${String(state.leases.length + 1).padStart(3, "0")}`),
    machine_id: project.machine_id || machine.machine_id,
    project_id: project.project_id,
    client_id: clientId,
    session_id: sessionId,
    agent_id: flags.agent || flags.agent_id || null,
    tool_id: flags.tool || flags.tool_id || null,
    task_id: taskId,
    lease_type: leaseType,
    scope,
    allowed_paths: normalizePathList(flags.allowed_paths || flags["allowed-paths"] || deriveAllowedPathsForLease(leaseType, scope)),
    denied_paths: normalizePathList(flags.denied_paths || flags["denied-paths"] || deriveDeniedPathsForLease(leaseType)),
    branch: flags.branch || (leaseType === "branch" ? scope : null),
    created_at: now,
    expires_at: flags.expires || flags.expires_at || null,
    status: flags.status || "active",
    shared_task: Boolean(flags.shared_task || flags.share_task || flags.shared || false),
    ide_window_id: flags.ide_window_id || null
  };
  const existingIndex = state.leases.findIndex((item) => item.lease_id === lease.lease_id);
  if (existingIndex >= 0) {
    lease.created_at = state.leases[existingIndex].created_at || now;
    state.leases[existingIndex] = { ...state.leases[existingIndex], ...lease };
  } else {
    state.leases.push(lease);
  }
  state.updated_at = now;
  writeLocalLeasesState(state);
  const activeLeases = state.leases.filter((item) => item.status === "active");
  const detectedConflicts = detectLocalLeaseConflicts(lease, activeLeases.filter((item) => item.lease_id !== lease.lease_id));
  if (detectedConflicts.length) {
    const conflictState = readLocalConflictsState();
    conflictState.conflicts.push(...detectedConflicts);
    conflictState.updated_at = now;
    writeLocalConflictsState(conflictState);
    for (const conflict of detectedConflicts) {
      recordLocalAuditEvent("local.conflict.detected", "local_conflict", conflict.conflict_id, `Local conflict detected: ${conflict.conflict_type}`, conflict, appendAudit);
    }
  }
  recordLocalAuditEvent("local.lease.created", "local_lease", lease.lease_id, `Local lease created: ${lease.lease_id}`, lease, appendAudit);
  return {
    report_type: "multi_ai_local_lease_created",
    generated_at: now,
    lease,
    conflicts: detectedConflicts,
    counts: {
      leases: state.leases.length,
      conflicts: readLocalConflictsState().conflicts.length
    },
    next_action: detectedConflicts.length
      ? "Review the local conflict records or release the overlapping lease."
      : "Use `kvdf multi-ai local policy check` before the next local change."
  };
}

function buildLocalConflictsReport(flags = {}) {
  const state = readLocalConflictsState();
  const machineId = String(flags.machine_id || flags.machine || "").trim();
  const projectId = String(flags.project_id || flags.project || "").trim();
  const clientId = String(flags.client_id || flags.client || "").trim();
  const conflicts = state.conflicts.filter((item) => {
    if (machineId && item.machine_id && item.machine_id !== machineId) return false;
    if (projectId && item.project_id && item.project_id !== projectId) return false;
    if (clientId && item.client_id && item.client_id !== clientId) return false;
    return true;
  });
  return {
    report_type: "multi_ai_local_conflicts",
    generated_at: new Date().toISOString(),
    conflicts,
    counts: {
      total: state.conflicts.length,
      active: state.conflicts.filter((item) => item.status !== "resolved").length,
      selected: conflicts.length
    },
    next_action: conflicts.length ? "Resolve the conflict or release the overlapping lease." : "No active local conflicts were found."
  };
}

function scanLocalProject(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const leases = readLocalLeasesState().leases || [];
  const clients = readLocalClientsState().clients || [];
  const sessions = readLocalSessionsState().sessions || [];
  const localChanges = collectLocalChanges();
  const ungovernedState = readLocalUngovernedChangesState();
  const scanClientId = resolveLocalClientId(flags, normalizeLocalClientType(flags), clients);
  const scanSessionId = resolveLocalSessionId(flags, scanClientId, sessions);
  const records = [];

  for (const change of localChanges) {
    const coveringLease = findActiveLocalLease(leases, {
      machine_id: project.machine_id,
      project_id: project.project_id,
      client_id: scanClientId,
      session_id: scanSessionId,
      path: change.file
    });
    if (coveringLease) continue;
    const referencedIdeLease = findReferencedIdeLease(change.file, {
      client_id: scanClientId,
      ide_window_id: null,
      agent_id: null,
      tool_id: null
    });
    const record = {
      change_id: `local-change-${String(records.length + 1).padStart(3, "0")}`,
      machine_id: project.machine_id,
      project_id: project.project_id,
      client_id: scanClientId,
      session_id: scanSessionId,
      task_id: flags.task || flags.task_id || null,
      path: change.file,
      status: "ungoverned",
      reason: "Local change has no active local lease.",
      referenced_ide_lease_id: referencedIdeLease ? referencedIdeLease.lease_id : null,
      referenced_ide_window_id: referencedIdeLease ? referencedIdeLease.ide_window_id : null,
      detected_at: now
    };
    records.push(record);
  }

  if (records.length) {
    ungovernedState.changes.push(...records);
    ungovernedState.updated_at = now;
    writeLocalUngovernedChangesState(ungovernedState);
  }
  recordLocalAuditEvent("local.scan.completed", "local_scan", `scan-${String(Date.now())}`, `Local project scan completed: ${records.length} ungoverned change(s)`, { ...project, machine_id: machine.machine_id, changes_detected: records.length }, appendAudit);
  return {
    report_type: "multi_ai_local_scan",
    generated_at: now,
    project,
    machine,
    local_changes: localChanges,
    ungoverned_changes: records,
    counts: {
      changed_files: localChanges.length,
      ungoverned_changes: records.length
    },
    next_action: records.length
      ? "Add or refresh local leases before the next change."
      : "No ungoverned local changes were found."
  };
}

function evaluateLocalPolicy(action = null, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const clientsState = readLocalClientsState();
  const sessionsState = readLocalSessionsState();
  const leasesState = readLocalLeasesState();
  const conflictsState = readLocalConflictsState();
  const policyState = readLocalPolicyDecisionsState();
  const approvalState = readLocalApprovalRequestsState();
  const pathValue = normalizePath(flags.path || flags.file || flags.folder || flags.scope || flags.target || rest[0] || "");
  const clientType = normalizeLocalClientType(flags);
  const clientId = resolveLocalClientId(flags, clientType, clientsState.clients || []);
  const sessionId = resolveLocalSessionId(flags, clientId, sessionsState.sessions || []);
  const taskId = flags.task || flags.task_id || flags.active_task_id || null;
  const branch = flags.branch || null;
  const localClient = findLocalClient(clientsState.clients || [], clientId);
  const localSession = findLocalSession(sessionsState.sessions || [], sessionId);
  const activeLease = findActiveLocalLease(leasesState.leases || [], {
    machine_id: project.machine_id,
    project_id: project.project_id,
    client_id: clientId,
    session_id: sessionId,
    task_id: taskId,
    branch,
    path: pathValue
  });
  const conflict = findLocalConflictForPath(conflictsState.conflicts || [], {
    machine_id: project.machine_id,
    project_id: project.project_id,
    client_id: clientId,
    session_id: sessionId,
    task_id: taskId,
    branch,
    path: pathValue
  });
  const expiredLease = activeLease && activeLease.expires_at && isExpired(activeLease.expires_at) ? activeLease : null;
  const deniedByLease = activeLease ? findDeniedPathHit(activeLease, pathValue) : null;
  const referencedIdeLease = findReferencedIdeLease(pathValue, {
    client_id: clientId,
    ide_window_id: localClient ? localClient.ide_window_id : null,
    agent_id: localClient ? localClient.agent_id : null,
    tool_id: localClient ? localClient.tool_id : null
  });
  const highRisk = isHighRiskLocalPath(pathValue) || Boolean(flags.high_risk) || Boolean(flags["owner-approval-required"]);
  const hasValidLease = Boolean(activeLease);
  const hasClient = Boolean(localClient);
  const hasSession = Boolean(localSession);

  let decision = "allow";
  let reason = "Valid local lease and no conflict detected.";
  let riskLevel = "low";
  let requiresOwnerApproval = false;

  if (!hasClient || !hasSession) {
    decision = decision === "allow" ? "warn" : decision;
    reason = !hasClient
      ? "Ungoverned local change: no registered local client was found."
      : "Ungoverned local change: no active local session was found.";
    riskLevel = "medium";
  }

  if (pathValue && !hasValidLease && decision === "allow") {
    decision = "warn";
    reason = "Ungoverned local change: no valid active lease covers the requested path.";
    riskLevel = "medium";
  }

  if (deniedByLease) {
    decision = "block";
    reason = `Denied path: ${pathValue || deniedByLease}`;
    riskLevel = "high";
  }

  if (!deniedByLease && conflict) {
    decision = "block";
    reason = `Conflict detected: ${conflict.conflict_type || "local_conflict"} on ${conflict.path || pathValue || "unknown path"}`;
    riskLevel = "high";
  }

  if (expiredLease) {
    decision = "block";
    reason = `Expired lease still in use: ${expiredLease.lease_id}`;
    riskLevel = "high";
  }

  if (highRisk && decision !== "block") {
    decision = "require_owner_approval";
    reason = `High-risk local project action requires owner approval for ${pathValue || "the requested path"}.`;
    riskLevel = "high";
    requiresOwnerApproval = true;
  }

  const evidenceId = `local-evidence-${String(policyState.decisions.length + 1).padStart(3, "0")}`;
  const decisionId = `local-decision-${String(policyState.decisions.length + 1).padStart(3, "0")}`;
  const record = {
    decision_id: decisionId,
    machine_id: machine.machine_id,
    project_id: project.project_id,
    client_id: clientId,
    session_id: sessionId,
    task_id: taskId,
    branch,
    path: pathValue || null,
    local_lease_id: activeLease ? activeLease.lease_id : null,
    conflict_id: conflict ? conflict.conflict_id : null,
    referenced_ide_lease_id: referencedIdeLease ? referencedIdeLease.lease_id : null,
    referenced_ide_window_id: referencedIdeLease ? referencedIdeLease.ide_window_id : null,
    action: action || flags.action || flags.operation || "edit",
    decision,
    reason,
    risk_level: riskLevel,
    requires_owner_approval: requiresOwnerApproval,
    evidence_id: evidenceId,
    timestamp: now,
    status: "recorded"
  };

  policyState.decisions.push(record);
  policyState.updated_at = now;
  writeLocalPolicyDecisionsState(policyState);

  if (pathValue && !hasValidLease && decision === "warn") {
    const ungovernedState = readLocalUngovernedChangesState();
    ungovernedState.changes.push({
      change_id: `local-change-${String(ungovernedState.changes.length + 1).padStart(3, "0")}`,
      machine_id: machine.machine_id,
      project_id: project.project_id,
      client_id: clientId,
      session_id: sessionId,
      task_id: taskId,
      path: pathValue,
      status: "ungoverned",
      reason,
      referenced_ide_lease_id: referencedIdeLease ? referencedIdeLease.lease_id : null,
      referenced_ide_window_id: referencedIdeLease ? referencedIdeLease.ide_window_id : null,
      detected_at: now
    });
    ungovernedState.updated_at = now;
    writeLocalUngovernedChangesState(ungovernedState);
  }

  if (requiresOwnerApproval) {
    const approvalRequest = {
      request_id: `local-approval-${String(approvalState.requests.length + 1).padStart(3, "0")}`,
      decision_id: decisionId,
      machine_id: machine.machine_id,
      project_id: project.project_id,
      client_id: clientId,
      session_id: sessionId,
      task_id: taskId,
      branch,
      path: pathValue || null,
      reason,
      status: "requested",
      requested_at: now,
      resolved_at: null,
      resolved_by: null,
      resolution: null
    };
    approvalState.requests.push(approvalRequest);
    approvalState.updated_at = now;
    writeLocalApprovalRequestsState(approvalState);
    recordLocalAuditEvent("local.approval.requested", "local_approval_request", approvalRequest.request_id, `Local owner approval requested: ${approvalRequest.request_id}`, approvalRequest, appendAudit);
  }

  recordLocalAuditEvent("local.policy.decision", "local_policy", decisionId, `Local policy decision: ${decision}`, record, appendAudit);

  const report = {
    report_type: "multi_ai_local_policy_decision",
    generated_at: now,
    ...record,
    active_lease: activeLease,
    conflict,
    referenced_ide_lease: referencedIdeLease,
    client: localClient,
    session: localSession,
    next_action: getLocalPolicyNextAction(decision, requiresOwnerApproval, deniedByLease, conflict, expiredLease, highRisk, pathValue)
  };
  if (decision === "require_owner_approval") {
    report.status = "blocked";
  }
  return report;
}

function buildLocalUngovernedChangesReport(flags = {}) {
  const state = readLocalUngovernedChangesState();
  const projectId = String(flags.project_id || flags.project || "").trim();
  const clientId = String(flags.client_id || flags.client || "").trim();
  const changes = state.changes.filter((item) => {
    if (projectId && item.project_id && item.project_id !== projectId) return false;
    if (clientId && item.client_id && item.client_id !== clientId) return false;
    return true;
  });
  return {
    report_type: "multi_ai_local_ungoverned_changes",
    generated_at: new Date().toISOString(),
    changes,
    counts: {
      total: state.changes.length,
      selected: changes.length
    }
  };
}

function recordLocalAuditEvent(eventType, entityType, entityId, summary, metadata = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readLocalAuditLogState();
  const record = {
    event_id: `local-audit-${String(state.records.length + 1).padStart(3, "0")}`,
    timestamp: now,
    actor_id: metadata && metadata.client_id ? metadata.client_id : "local-cli",
    actor_role: metadata && metadata.client_type ? metadata.client_type : "local",
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata: metadata && typeof metadata === "object" ? metadata : {}
  };
  state.records.push(record);
  state.updated_at = now;
  writeLocalAuditLogState(state);
  if (appendAudit) {
    appendAudit(eventType, entityType, entityId, summary, metadata);
  }
  return record;
}

function detectLocalLeaseConflicts(lease, otherLeases = []) {
  const now = new Date().toISOString();
  const conflicts = [];
  for (const other of otherLeases) {
    if (!other || other.status !== "active") continue;
    if (other.lease_id === lease.lease_id) continue;
    const otherPaths = uniquePaths([...(other.allowed_paths || []), other.scope].filter(Boolean));
    const leasePaths = uniquePaths([...(lease.allowed_paths || []), lease.scope].filter(Boolean));
    const sameFile = leasePaths.some((left) => otherPaths.some((right) => pathsOverlap(left, right)));
    if (sameFile && String(other.client_id || "") !== String(lease.client_id || "")) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch || null,
        conflict_type: "same_file",
        severity: "high",
        path: leasePaths[0] || lease.scope || null,
        reason: `Same file or folder is already leased by ${other.client_id || other.session_id || other.lease_id}.`,
        created_at: now,
        status: "open"
      });
    }
    if (!lease.shared_task && !other.shared_task && lease.task_id && other.task_id && lease.task_id === other.task_id && String(other.client_id || "") !== String(lease.client_id || "")) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch || null,
        conflict_type: "same_task",
        severity: "medium",
        path: lease.scope || null,
        reason: `Task ${lease.task_id} is already in use by ${other.client_id || other.session_id || other.lease_id}.`,
        created_at: now,
        status: "open"
      });
    }
    if (lease.branch && other.branch && lease.branch === other.branch && String(lease.task_id || "") !== String(other.task_id || "")) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch,
        conflict_type: "branch_task_conflict",
        severity: "high",
        path: lease.branch,
        reason: `Branch ${lease.branch} is already leased by task ${other.task_id || "unknown"}.`,
        created_at: now,
        status: "open"
      });
    }
    if (lease.denied_paths && lease.denied_paths.length && lease.denied_paths.some((denied) => leasePaths.some((candidate) => pathsOverlap(candidate, denied)))) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch || null,
        conflict_type: "denied_path",
        severity: "high",
        path: lease.denied_paths[0] || lease.scope || null,
        reason: `Denied path overlaps with an active local lease: ${lease.denied_paths[0] || "unknown"}.`,
        created_at: now,
        status: "open"
      });
    }
  }
  if (lease.expires_at && isExpired(lease.expires_at)) {
    conflicts.push({
      conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
      lease_id: lease.lease_id,
      other_lease_id: null,
      machine_id: lease.machine_id,
      project_id: lease.project_id,
      client_id: lease.client_id,
      session_id: lease.session_id,
      task_id: lease.task_id,
      branch: lease.branch || null,
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

function findActiveLocalLease(leases, { machine_id, project_id, client_id, session_id, task_id, branch, path }) {
  return [...(leases || [])].reverse().find((item) => {
    if (!item || item.status !== "active") return false;
    if (machine_id && item.machine_id && item.machine_id !== machine_id) return false;
    if (project_id && item.project_id && item.project_id !== project_id) return false;
    if (client_id && item.client_id && item.client_id !== client_id) return false;
    if (session_id && item.session_id && item.session_id !== session_id) return false;
    if (task_id && item.task_id && item.task_id !== task_id) return false;
    if (branch && item.branch && item.branch !== branch) return false;
    if (path) {
      const allowed = Array.isArray(item.allowed_paths) && item.allowed_paths.length ? item.allowed_paths : [item.scope].filter(Boolean);
      const allowedHit = allowed.some((candidate) => pathsOverlap(candidate, path));
      if (!allowedHit) return false;
    }
    return true;
  }) || null;
}

function findLocalConflictForPath(conflicts, { machine_id, project_id, client_id, session_id, task_id, branch, path }) {
  return [...(conflicts || [])].reverse().find((item) => {
    if (item.status === "resolved") return false;
    if (machine_id && item.machine_id && item.machine_id !== machine_id) return false;
    if (project_id && item.project_id && item.project_id !== project_id) return false;
    if (client_id && item.client_id && item.client_id !== client_id) return false;
    if (session_id && item.session_id && item.session_id !== session_id) return false;
    if (task_id && item.task_id && item.task_id !== task_id && item.conflict_type !== "branch_task_conflict") return false;
    if (branch && item.branch && item.branch !== branch && item.conflict_type !== "branch_task_conflict") return false;
    if (path && item.path && !pathsOverlap(item.path, path)) return false;
    return true;
  }) || null;
}

function collectLocalChanges() {
  const cwd = repoRoot();
  const details = getGitChangedFileDetails(cwd);
  const fallback = details.length ? details : listLocalGitChangedFileDetails(cwd);
  return fallback
    .filter((item) => item && item.file && !normalizePath(item.file).startsWith(normalizePath(".kabeeri/")))
    .map((item) => ({
    file: item.file,
    status: item.status,
    raw: item.raw
  }));
}

function findReferencedIdeLease(pathValue, reference = null) {
  const ideLeases = ideGovernance.readIdeLeasesState().leases || [];
  return [...ideLeases].reverse().find((item) => {
    if (!item || item.status !== "active") return false;
    const referenceClientId = reference && typeof reference === "object" ? String(reference.client_id || "").trim() : String(reference || "").trim();
    const referenceIdeWindowId = reference && typeof reference === "object" ? String(reference.ide_window_id || "").trim() : null;
    const referenceAgentId = reference && typeof reference === "object" ? String(reference.agent_id || "").trim() : null;
    const referenceToolId = reference && typeof reference === "object" ? String(reference.tool_id || "").trim() : null;
    if (referenceIdeWindowId && item.ide_window_id && String(item.ide_window_id) !== referenceIdeWindowId) return false;
    if (referenceAgentId && item.agent_id && String(item.agent_id) !== referenceAgentId) return false;
    if (referenceToolId && item.tool_id && String(item.tool_id) !== referenceToolId) return false;
    if (referenceClientId && item.client_id && String(item.client_id) !== referenceClientId) return false;
    const allowed = Array.isArray(item.allowed_paths) && item.allowed_paths.length ? item.allowed_paths : [item.scope].filter(Boolean);
    if (!pathValue) return false;
    return allowed.some((candidate) => pathsOverlap(candidate, pathValue));
  }) || null;
}

function getLocalPolicyNextAction(decision, requiresOwnerApproval, deniedByLease, conflict, expiredLease, highRisk, pathValue) {
  if (decision === "allow") return "The local action is allowed. Continue inside the active local lease.";
  if (decision === "warn") return "Refresh or create a local lease before the next change.";
  if (decision === "require_owner_approval") return `Request owner approval before editing ${pathValue || "the requested path"}.`;
  if (deniedByLease) return "The path is denied by the active local lease.";
  if (conflict) return "Resolve the local conflict before editing.";
  if (expiredLease) return "Refresh or replace the expired local lease before editing.";
  if (highRisk || requiresOwnerApproval) return "Owner approval is required for this local project action.";
  return "Resolve the policy blocker before continuing.";
}

function buildLocalProjectStateDefaults() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    machine_id: null,
    project_id: null,
    repo_root: null,
    runtime_root: LOCAL_STATE_DIR,
    git_remote: null,
    default_branch: "main",
    current_branch: null,
    owner_id: null,
    status: "inactive"
  };
}

function buildLocalMachineStateDefaults() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    machine_id: null,
    hostname: null,
    platform: null,
    release: null,
    repo_root: null,
    runtime_root: LOCAL_STATE_DIR,
    owner_id: null,
    status: "inactive"
  };
}

function buildLocalArrayStateDefaults() {
  return { version: "v1", created_at: null, updated_at: null, items: [] };
}

function readLocalProjectState() {
  const state = ensureStateObject(LOCAL_PROJECT_FILE, buildLocalProjectStateDefaults());
  return { ...buildLocalProjectStateDefaults(), ...(state || {}) };
}

function writeLocalProjectState(state) {
  writeJsonFile(LOCAL_PROJECT_FILE, { ...buildLocalProjectStateDefaults(), ...(state || {}) });
}

function readLocalMachineState() {
  const state = ensureStateObject(LOCAL_MACHINE_FILE, buildLocalMachineStateDefaults());
  return { ...buildLocalMachineStateDefaults(), ...(state || {}) };
}

function writeLocalMachineState(state) {
  writeJsonFile(LOCAL_MACHINE_FILE, { ...buildLocalMachineStateDefaults(), ...(state || {}) });
}

function readLocalClientsState() {
  const state = ensureStateObject(LOCAL_CLIENTS_FILE, buildLocalArrayStateDefaults());
  state.clients = Array.isArray(state.clients) ? state.clients : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalClientsState(state) {
  writeJsonFile(LOCAL_CLIENTS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    clients: Array.isArray(state && state.clients) ? state.clients : []
  });
}

function readLocalSessionsState() {
  const state = ensureStateObject(LOCAL_SESSIONS_FILE, buildLocalArrayStateDefaults());
  state.sessions = Array.isArray(state.sessions) ? state.sessions : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalSessionsState(state) {
  writeJsonFile(LOCAL_SESSIONS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    sessions: Array.isArray(state && state.sessions) ? state.sessions : []
  });
}

function readLocalHeartbeatsState() {
  const state = ensureStateObject(LOCAL_HEARTBEATS_FILE, buildLocalArrayStateDefaults());
  state.heartbeats = Array.isArray(state.heartbeats) ? state.heartbeats : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalHeartbeatsState(state) {
  writeJsonFile(LOCAL_HEARTBEATS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    heartbeats: Array.isArray(state && state.heartbeats) ? state.heartbeats : []
  });
}

function readLocalLeasesState() {
  const state = ensureStateObject(LOCAL_LEASES_FILE, buildLocalArrayStateDefaults());
  state.leases = Array.isArray(state.leases) ? state.leases : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalLeasesState(state) {
  writeJsonFile(LOCAL_LEASES_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    leases: Array.isArray(state && state.leases) ? state.leases : []
  });
}

function readLocalConflictsState() {
  const state = ensureStateObject(LOCAL_CONFLICTS_FILE, buildLocalArrayStateDefaults());
  state.conflicts = Array.isArray(state.conflicts) ? state.conflicts : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalConflictsState(state) {
  writeJsonFile(LOCAL_CONFLICTS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    conflicts: Array.isArray(state && state.conflicts) ? state.conflicts : []
  });
}

function readLocalUngovernedChangesState() {
  const state = ensureStateObject(LOCAL_UNGOVERNED_CHANGES_FILE, buildLocalArrayStateDefaults());
  state.changes = Array.isArray(state.changes) ? state.changes : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalUngovernedChangesState(state) {
  writeJsonFile(LOCAL_UNGOVERNED_CHANGES_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    changes: Array.isArray(state && state.changes) ? state.changes : []
  });
}

function readLocalPolicyDecisionsState() {
  const state = ensureStateObject(LOCAL_POLICY_DECISIONS_FILE, buildLocalArrayStateDefaults());
  state.decisions = Array.isArray(state.decisions) ? state.decisions : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalPolicyDecisionsState(state) {
  writeJsonFile(LOCAL_POLICY_DECISIONS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    decisions: Array.isArray(state && state.decisions) ? state.decisions : []
  });
}

function readLocalApprovalRequestsState() {
  const state = ensureStateObject(LOCAL_APPROVAL_REQUESTS_FILE, buildLocalArrayStateDefaults());
  state.requests = Array.isArray(state.requests) ? state.requests : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalApprovalRequestsState(state) {
  writeJsonFile(LOCAL_APPROVAL_REQUESTS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    requests: Array.isArray(state && state.requests) ? state.requests : []
  });
}

function readLocalAuditLogState() {
  const state = ensureStateObject(LOCAL_AUDIT_LOG_FILE, buildLocalArrayStateDefaults());
  state.records = Array.isArray(state.records) ? state.records : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalAuditLogState(state) {
  writeJsonFile(LOCAL_AUDIT_LOG_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    records: Array.isArray(state && state.records) ? state.records : []
  });
}

function ensureStateObject(relativePath, defaults) {
  ensureWorkspace();
  ensureLocalStateDir();
  if (!fileExists(relativePath)) {
    writeJsonFile(relativePath, defaults);
  }
  const state = readJsonFile(relativePath);
  return state && typeof state === "object" ? state : { ...defaults };
}

function ensureLocalStateDir() {
  fs.mkdirSync(path.join(repoRoot(), LOCAL_STATE_DIR), { recursive: true });
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot(), relativePath));
}

function normalizeAction(value, flags = {}) {
  if (value && typeof value === "string") return value.trim().toLowerCase();
  return String(flags.action || flags.cmd || flags.subaction || "").trim().toLowerCase();
}

function normalizeNestedAction(value, flags = {}) {
  if (value && typeof value === "string") return value.trim().toLowerCase();
  return String(flags.action || flags.cmd || flags.mode || "").trim().toLowerCase();
}

function normalizePath(value) {
  return normalizeLockScope(String(value || "").trim());
}

function normalizePathList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return uniquePaths(value.map((item) => normalizePath(item)).filter(Boolean));
  return uniquePaths(String(value).split(",").map((item) => normalizePath(item)).filter(Boolean));
}

function uniquePaths(values) {
  return Array.from(new Set((values || []).map((item) => normalizePath(item)).filter(Boolean)));
}

function pathsOverlap(left, right) {
  const a = normalizePath(left);
  const b = normalizePath(right);
  if (!a || !b) return false;
  return a === b || pathScopeContains(a, b) || pathScopeContains(b, a);
}

function resolveMachineId(flags = {}, fallback = null) {
  const candidate = flags.machine_id || flags.machine || process.env.KVDF_MACHINE_ID || process.env.COMPUTERNAME || process.env.HOSTNAME || fallback;
  const text = String(candidate || "").trim();
  return text || `machine-${os.hostname().replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase()}`;
}

function resolveProjectId(flags = {}, fallback = null) {
  const candidate = flags.project_id || flags.project || flags["project-id"] || fallback;
  if (candidate) return String(candidate).trim();
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : null;
  if (project && (project.project_id || project.id || project.slug || project.name)) {
    return String(project.project_id || project.id || project.slug || project.name).trim();
  }
  return path.basename(repoRoot()).replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase() || "local-project";
}

function resolveOwnerId(flags = {}, fallback = null) {
  const candidate = flags.owner_id || flags.owner || flags["owner-id"] || fallback;
  if (candidate) return String(candidate).trim();
  const session = fileExists(".kabeeri/session.json") ? readJsonFile(".kabeeri/session.json") : null;
  return session && session.owner_id ? String(session.owner_id).trim() : "owner";
}

function resolveGitRemote(flags = {}, gitContext = null) {
  const candidate = flags.git_remote || flags.remote || flags["git-remote"] || null;
  if (candidate) return String(candidate).trim();
  return gitContext && gitContext.remote_url ? String(gitContext.remote_url).trim() : null;
}

function resolveDefaultBranch(flags = {}, gitContext = null) {
  const candidate = flags.default_branch || flags["default-branch"] || null;
  if (candidate) return String(candidate).trim();
  return "main";
}

function resolveCurrentBranch(flags = {}, gitContext = null) {
  const candidate = flags.current_branch || flags.branch || flags["current-branch"] || null;
  if (candidate) return String(candidate).trim();
  return gitContext && gitContext.current_branch ? String(gitContext.current_branch).trim() : null;
}

function resolveProcessHint(flags = {}) {
  return String(flags.process_hint || flags.process || flags.hint || flags.command || flags.value || "").trim() || null;
}

function normalizeLocalClientType(flags = {}) {
  const raw = String(flags.client_type || flags.type || flags.client || flags.tool || flags.tool_id || flags.process_hint || flags.process || flags.ide || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    vscode: "vscode",
    "visual_studio_code": "vscode",
    code: "vscode",
    cursor: "cursor",
    webstorm: "webstorm",
    visual_studio: "visual_studio",
    zed: "zed",
    terminal: "terminal",
    shell: "terminal",
    cli: "terminal",
    local_agent: "local_agent",
    agent: "local_agent",
    terminal_agent: "local_agent",
    local_script: "local_script",
    script: "local_script",
    github_desktop: "github_desktop",
    githubdesktop: "github_desktop",
    unknown_editor: "unknown_editor",
    editor: "unknown_editor",
    unknown_ai_tool: "unknown_ai_tool",
    ai: "unknown_ai_tool",
    codex: "unknown_ai_tool",
    claude_code: "unknown_ai_tool",
    claude: "unknown_ai_tool",
    cline: "unknown_ai_tool",
    roo: "unknown_ai_tool",
    continue: "unknown_ai_tool",
    mcp_tool: "unknown_ai_tool",
    github_copilot: "unknown_ai_tool",
    copilot: "unknown_ai_tool"
  };
  return LOCAL_CLIENT_TYPES.has(aliases[raw] || raw) ? (aliases[raw] || raw) : "unknown_editor";
}

function inferClientCapabilities(clientType) {
  const map = {
    vscode: ["edit", "terminal", "workspace"],
    cursor: ["edit", "terminal", "ai"],
    webstorm: ["edit", "terminal", "workspace"],
    visual_studio: ["edit", "terminal"],
    zed: ["edit", "terminal", "workspace"],
    terminal: ["shell", "script"],
    local_agent: ["ai", "automation"],
    local_script: ["automation", "filesystem"],
    github_desktop: ["git", "branching"],
    unknown_editor: ["edit"],
    unknown_ai_tool: ["ai"]
  };
  return map[clientType] || ["edit"];
}

function normalizeCapabilities(value) {
  if (!value) return [];
  if (Array.isArray(value)) return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)));
  return Array.from(new Set(String(value).split(",").map((item) => String(item).trim()).filter(Boolean)));
}

function resolveLocalClientId(flags = {}, clientType = "unknown_editor", clients = []) {
  const explicit = flags.client_id || flags.client || flags.id || null;
  if (explicit) return String(explicit).trim();
  const ideWindowId = flags.ide_window_id || flags.window_id || null;
  if (ideWindowId) return `client-${clientType}-${String(ideWindowId).replace(/[^A-Za-z0-9_-]+/g, "-")}`;
  const toolId = flags.tool || flags.tool_id || null;
  if (toolId) return `client-${clientType}-${String(toolId).replace(/[^A-Za-z0-9_-]+/g, "-")}`;
  return `client-${clientType}-${String((clients || []).length + 1).padStart(3, "0")}`;
}

function resolveLocalSessionId(flags = {}, clientId = "", sessions = []) {
  const explicit = flags.session_id || flags.session || flags.id || null;
  if (explicit) return String(explicit).trim();
  return `local-session-${String((sessions || []).length + 1).padStart(3, "0")}-${String(clientId || "client").replace(/[^A-Za-z0-9_-]+/g, "-")}`;
}

function findLocalClient(clients = [], clientId) {
  return [...(clients || [])].reverse().find((item) => item.client_id === clientId) || null;
}

function findLocalSession(sessions = [], sessionId) {
  return [...(sessions || [])].reverse().find((item) => item.session_id === sessionId) || null;
}

function filterByProject(items, project) {
  if (!project) return [];
  return (items || []).filter((item) => {
    if (item.project_id && item.project_id !== project.project_id) return false;
    if (item.machine_id && project.machine_id && item.machine_id !== project.machine_id) return false;
    return true;
  });
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
    task: "task",
    tasks: "task",
    branch: "branch"
  };
  return aliases[normalized] || normalized;
}

function deriveAllowedPathsForLease(leaseType, scope) {
  if (!scope) return [];
  if (leaseType === "branch") return [scope];
  return [scope];
}

function deriveDeniedPathsForLease(leaseType) {
  void leaseType;
  return [".env", ".env.*", "secrets/", ".kabeeri/owner_auth.json", ".kabeeri/session.json", ".git/config", "package.json"];
}

function isHighRiskLocalPath(pathValue) {
  const normalized = normalizePath(pathValue);
  if (!normalized) return false;
  const highRiskPaths = [
    ".kabeeri/owner_auth.json",
    ".kabeeri/session.json",
    ".kabeeri/multi_ai_governance.json",
    ".kabeeri/multi_ai_governance/",
    "package.json",
    "plugins/multi_ai_governance/plugin.json",
    "plugins/kvdf_dev/runtime/task_packet.js",
    "src/cli/index.js",
    "schemas/runtime/schema_registry.json",
    ".env",
    ".git/config"
  ].map((item) => normalizePath(item));
  return highRiskPaths.some((item) => pathsOverlap(item, normalized));
}

function getLocalPolicyNextAction(decision, requiresOwnerApproval, deniedByLease, conflict, expiredLease, highRisk, pathValue) {
  if (decision === "allow") return "The local action is allowed. Continue inside the active local lease.";
  if (decision === "warn") return "Proceed carefully and create or refresh the local lease before the next change.";
  if (decision === "require_owner_approval") return `Request owner approval before editing ${pathValue || "the requested path"}.`;
  if (deniedByLease) return "The path is denied by the active local lease.";
  if (conflict) return "Resolve the local conflict before editing.";
  if (expiredLease) return "Refresh or replace the expired local lease before editing.";
  if (highRisk || requiresOwnerApproval) return "Owner approval is required for this local project action.";
  return "Resolve the policy blocker before continuing.";
}

function readLocalProjectState() {
  const state = ensureStateObject(LOCAL_PROJECT_FILE, buildLocalProjectStateDefaults());
  return { ...buildLocalProjectStateDefaults(), ...(state || {}) };
}

function writeLocalProjectState(state) {
  writeJsonFile(LOCAL_PROJECT_FILE, { ...buildLocalProjectStateDefaults(), ...(state || {}) });
}

function readLocalMachineState() {
  const state = ensureStateObject(LOCAL_MACHINE_FILE, buildLocalMachineStateDefaults());
  return { ...buildLocalMachineStateDefaults(), ...(state || {}) };
}

function writeLocalMachineState(state) {
  writeJsonFile(LOCAL_MACHINE_FILE, { ...buildLocalMachineStateDefaults(), ...(state || {}) });
}

function readLocalClientsState() {
  const state = ensureStateObject(LOCAL_CLIENTS_FILE, buildLocalArrayStateDefaults());
  state.clients = Array.isArray(state.clients) ? state.clients : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalClientsState(state) {
  writeJsonFile(LOCAL_CLIENTS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    clients: Array.isArray(state && state.clients) ? state.clients : []
  });
}

function readLocalSessionsState() {
  const state = ensureStateObject(LOCAL_SESSIONS_FILE, buildLocalArrayStateDefaults());
  state.sessions = Array.isArray(state.sessions) ? state.sessions : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalSessionsState(state) {
  writeJsonFile(LOCAL_SESSIONS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    sessions: Array.isArray(state && state.sessions) ? state.sessions : []
  });
}

function readLocalHeartbeatsState() {
  const state = ensureStateObject(LOCAL_HEARTBEATS_FILE, buildLocalArrayStateDefaults());
  state.heartbeats = Array.isArray(state.heartbeats) ? state.heartbeats : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalHeartbeatsState(state) {
  writeJsonFile(LOCAL_HEARTBEATS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    heartbeats: Array.isArray(state && state.heartbeats) ? state.heartbeats : []
  });
}

function readLocalLeasesState() {
  const state = ensureStateObject(LOCAL_LEASES_FILE, buildLocalArrayStateDefaults());
  state.leases = Array.isArray(state.leases) ? state.leases : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalLeasesState(state) {
  writeJsonFile(LOCAL_LEASES_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    leases: Array.isArray(state && state.leases) ? state.leases : []
  });
}

function readLocalConflictsState() {
  const state = ensureStateObject(LOCAL_CONFLICTS_FILE, buildLocalArrayStateDefaults());
  state.conflicts = Array.isArray(state.conflicts) ? state.conflicts : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalConflictsState(state) {
  writeJsonFile(LOCAL_CONFLICTS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    conflicts: Array.isArray(state && state.conflicts) ? state.conflicts : []
  });
}

function readLocalUngovernedChangesState() {
  const state = ensureStateObject(LOCAL_UNGOVERNED_CHANGES_FILE, buildLocalArrayStateDefaults());
  state.changes = Array.isArray(state.changes) ? state.changes : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalUngovernedChangesState(state) {
  writeJsonFile(LOCAL_UNGOVERNED_CHANGES_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    changes: Array.isArray(state && state.changes) ? state.changes : []
  });
}

function readLocalPolicyDecisionsState() {
  const state = ensureStateObject(LOCAL_POLICY_DECISIONS_FILE, buildLocalArrayStateDefaults());
  state.decisions = Array.isArray(state.decisions) ? state.decisions : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalPolicyDecisionsState(state) {
  writeJsonFile(LOCAL_POLICY_DECISIONS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    decisions: Array.isArray(state && state.decisions) ? state.decisions : []
  });
}

function readLocalApprovalRequestsState() {
  const state = ensureStateObject(LOCAL_APPROVAL_REQUESTS_FILE, buildLocalArrayStateDefaults());
  state.requests = Array.isArray(state.requests) ? state.requests : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalApprovalRequestsState(state) {
  writeJsonFile(LOCAL_APPROVAL_REQUESTS_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    requests: Array.isArray(state && state.requests) ? state.requests : []
  });
}

function readLocalAuditLogState() {
  const state = ensureStateObject(LOCAL_AUDIT_LOG_FILE, buildLocalArrayStateDefaults());
  state.records = Array.isArray(state.records) ? state.records : Array.isArray(state.items) ? state.items : [];
  return state;
}

function writeLocalAuditLogState(state) {
  writeJsonFile(LOCAL_AUDIT_LOG_FILE, {
    ...buildLocalArrayStateDefaults(),
    ...(state || {}),
    records: Array.isArray(state && state.records) ? state.records : []
  });
}

function buildLocalProjectStateDefaults() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    machine_id: null,
    project_id: null,
    repo_root: null,
    runtime_root: LOCAL_STATE_DIR,
    git_remote: null,
    default_branch: "main",
    current_branch: null,
    owner_id: null,
    status: "inactive"
  };
}

function buildLocalMachineStateDefaults() {
  return {
    version: "v1",
    created_at: null,
    updated_at: null,
    machine_id: null,
    hostname: null,
    platform: null,
    release: null,
    repo_root: null,
    runtime_root: LOCAL_STATE_DIR,
    owner_id: null,
    status: "inactive"
  };
}

function buildLocalArrayStateDefaults() {
  return { version: "v1", created_at: null, updated_at: null, items: [] };
}

function ensureStateObject(relativePath, defaults) {
  ensureWorkspace();
  ensureLocalStateDir();
  if (!fileExists(relativePath)) {
    writeJsonFile(relativePath, defaults);
  }
  const state = readJsonFile(relativePath);
  return state && typeof state === "object" ? state : { ...defaults };
}

function ensureLocalStateDir() {
  fs.mkdirSync(path.join(repoRoot(), LOCAL_STATE_DIR), { recursive: true });
}

function buildLocalClientReport(flags = {}) {
  const state = readLocalClientsState();
  const clientId = String(flags.client_id || flags.client || flags.id || "").trim();
  const clients = clientId ? state.clients.filter((item) => item.client_id === clientId) : state.clients;
  return {
    report_type: "multi_ai_local_clients",
    generated_at: new Date().toISOString(),
    clients,
    counts: {
      total: state.clients.length,
      active: state.clients.filter((item) => item.status === "active").length,
      selected: clients.length
    }
  };
}

function buildLocalSessionReport(flags = {}) {
  const state = readLocalSessionsState();
  const sessionId = String(flags.session_id || flags.session || flags.id || "").trim();
  const sessions = sessionId ? state.sessions.filter((item) => item.session_id === sessionId) : state.sessions;
  return {
    report_type: "multi_ai_local_sessions",
    generated_at: new Date().toISOString(),
    sessions,
    counts: {
      total: state.sessions.length,
      active: state.sessions.filter((item) => item.status === "active").length,
      selected: sessions.length
    }
  };
}

function buildLocalLeaseReport(flags = {}) {
  const state = readLocalLeasesState();
  const leaseId = String(flags.lease_id || flags.lease || flags.id || "").trim();
  const leases = leaseId ? state.leases.filter((item) => item.lease_id === leaseId) : state.leases;
  return {
    report_type: "multi_ai_local_leases",
    generated_at: new Date().toISOString(),
    leases,
    counts: {
      total: state.leases.length,
      active: state.leases.filter((item) => item.status === "active").length,
      selected: leases.length
    }
  };
}

function buildLocalConflictsReport(flags = {}) {
  const state = readLocalConflictsState();
  const machineId = String(flags.machine_id || flags.machine || "").trim();
  const projectId = String(flags.project_id || flags.project || "").trim();
  const clientId = String(flags.client_id || flags.client || "").trim();
  const conflicts = state.conflicts.filter((item) => {
    if (machineId && item.machine_id && item.machine_id !== machineId) return false;
    if (projectId && item.project_id && item.project_id !== projectId) return false;
    if (clientId && item.client_id && item.client_id !== clientId) return false;
    return true;
  });
  return {
    report_type: "multi_ai_local_conflicts",
    generated_at: new Date().toISOString(),
    conflicts,
    counts: {
      total: state.conflicts.length,
      active: state.conflicts.filter((item) => item.status !== "resolved").length,
      selected: conflicts.length
    },
    next_action: conflicts.length ? "Resolve the conflict or release the overlapping lease." : "No active local conflicts were found."
  };
}

function buildLocalUngovernedChangesReport(flags = {}) {
  const state = readLocalUngovernedChangesState();
  const projectId = String(flags.project_id || flags.project || "").trim();
  const clientId = String(flags.client_id || flags.client || "").trim();
  const changes = state.changes.filter((item) => {
    if (projectId && item.project_id && item.project_id !== projectId) return false;
    if (clientId && item.client_id && item.client_id !== clientId) return false;
    return true;
  });
  return {
    report_type: "multi_ai_local_ungoverned_changes",
    generated_at: new Date().toISOString(),
    changes,
    counts: {
      total: state.changes.length,
      selected: changes.length
    }
  };
}

function recordLocalAuditEvent(eventType, entityType, entityId, summary, metadata = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readLocalAuditLogState();
  const record = {
    event_id: `local-audit-${String(state.records.length + 1).padStart(3, "0")}`,
    timestamp: now,
    actor_id: metadata && metadata.client_id ? metadata.client_id : "local-cli",
    actor_role: metadata && metadata.client_type ? metadata.client_type : "local",
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata: metadata && typeof metadata === "object" ? metadata : {}
  };
  state.records.push(record);
  state.updated_at = now;
  writeLocalAuditLogState(state);
  if (appendAudit) {
    appendAudit(eventType, entityType, entityId, summary, metadata);
  }
  return record;
}

function detectLocalLeaseConflicts(lease, otherLeases = []) {
  const now = new Date().toISOString();
  const conflicts = [];
  for (const other of otherLeases) {
    if (!other || other.status !== "active") continue;
    if (other.lease_id === lease.lease_id) continue;
    const otherPaths = uniquePaths([...(other.allowed_paths || []), other.scope].filter(Boolean));
    const leasePaths = uniquePaths([...(lease.allowed_paths || []), lease.scope].filter(Boolean));
    const sameFile = leasePaths.some((left) => otherPaths.some((right) => pathsOverlap(left, right)));
    if (sameFile && String(other.client_id || "") !== String(lease.client_id || "")) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch || null,
        conflict_type: "same_file",
        severity: "high",
        path: leasePaths[0] || lease.scope || null,
        reason: `Same file or folder is already leased by ${other.client_id || other.session_id || other.lease_id}.`,
        created_at: now,
        status: "open"
      });
    }
    if (!lease.shared_task && !other.shared_task && lease.task_id && other.task_id && lease.task_id === other.task_id && String(other.client_id || "") !== String(lease.client_id || "")) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch || null,
        conflict_type: "same_task",
        severity: "medium",
        path: lease.scope || null,
        reason: `Task ${lease.task_id} is already in use by ${other.client_id || other.session_id || other.lease_id}.`,
        created_at: now,
        status: "open"
      });
    }
    if (lease.branch && other.branch && lease.branch === other.branch && String(lease.task_id || "") !== String(other.task_id || "")) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch,
        conflict_type: "branch_task_conflict",
        severity: "high",
        path: lease.branch,
        reason: `Branch ${lease.branch} is already leased by task ${other.task_id || "unknown"}.`,
        created_at: now,
        status: "open"
      });
    }
    if (lease.denied_paths && lease.denied_paths.length && lease.denied_paths.some((denied) => leasePaths.some((candidate) => pathsOverlap(candidate, denied)))) {
      conflicts.push({
        conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
        lease_id: lease.lease_id,
        other_lease_id: other.lease_id,
        machine_id: lease.machine_id,
        project_id: lease.project_id,
        client_id: lease.client_id,
        session_id: lease.session_id,
        task_id: lease.task_id,
        branch: lease.branch || null,
        conflict_type: "denied_path",
        severity: "high",
        path: lease.denied_paths[0] || lease.scope || null,
        reason: `Denied path overlaps with an active local lease: ${lease.denied_paths[0] || "unknown"}.`,
        created_at: now,
        status: "open"
      });
    }
  }
  if (lease.expires_at && isExpired(lease.expires_at)) {
    conflicts.push({
      conflict_id: `local-conflict-${String(conflicts.length + 1).padStart(3, "0")}`,
      lease_id: lease.lease_id,
      other_lease_id: null,
      machine_id: lease.machine_id,
      project_id: lease.project_id,
      client_id: lease.client_id,
      session_id: lease.session_id,
      task_id: lease.task_id,
      branch: lease.branch || null,
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

function findActiveLocalLease(leases, { machine_id, project_id, client_id, session_id, task_id, branch, path }) {
  return [...(leases || [])].reverse().find((item) => {
    if (!item || item.status !== "active") return false;
    if (machine_id && item.machine_id && item.machine_id !== machine_id) return false;
    if (project_id && item.project_id && item.project_id !== project_id) return false;
    if (client_id && item.client_id && item.client_id !== client_id) return false;
    if (session_id && item.session_id && item.session_id !== session_id) return false;
    if (task_id && item.task_id && item.task_id !== task_id) return false;
    if (branch && item.branch && item.branch !== branch) return false;
    if (path) {
      const allowed = Array.isArray(item.allowed_paths) && item.allowed_paths.length ? item.allowed_paths : [item.scope].filter(Boolean);
      const allowedHit = allowed.some((candidate) => pathsOverlap(candidate, path));
      if (!allowedHit) return false;
    }
    return true;
  }) || null;
}

function findLocalConflictForPath(conflicts, { machine_id, project_id, client_id, session_id, task_id, branch, path }) {
  return [...(conflicts || [])].reverse().find((item) => {
    if (item.status === "resolved") return false;
    if (machine_id && item.machine_id && item.machine_id !== machine_id) return false;
    if (project_id && item.project_id && item.project_id !== project_id) return false;
    if (client_id && item.client_id && item.client_id !== client_id) return false;
    if (session_id && item.session_id && item.session_id !== session_id) return false;
    if (task_id && item.task_id && item.task_id !== task_id && item.conflict_type !== "branch_task_conflict") return false;
    if (branch && item.branch && item.branch !== branch && item.conflict_type !== "branch_task_conflict") return false;
    if (path && item.path && !pathsOverlap(item.path, path)) return false;
    return true;
  }) || null;
}

function collectLocalChanges() {
  const cwd = repoRoot();
  const details = getGitChangedFileDetails(cwd);
  const fallback = details.length ? details : listLocalGitChangedFileDetails(cwd);
  return fallback
    .filter((item) => item && item.file && !normalizePath(item.file).startsWith(normalizePath(".kabeeri/")))
    .map((item) => ({
      file: item.file,
      status: item.status,
      raw: item.raw
    }));
}

function findReferencedIdeLease(pathValue, clientId = null) {
  const ideLeases = ideGovernance.readIdeLeasesState().leases || [];
  return [...ideLeases].reverse().find((item) => {
    if (!item || item.status !== "active") return false;
    if (clientId && item.agent_id && String(item.agent_id) !== String(clientId)) return false;
    const allowed = Array.isArray(item.allowed_paths) && item.allowed_paths.length ? item.allowed_paths : [item.scope].filter(Boolean);
    if (!pathValue) return false;
    return allowed.some((candidate) => pathsOverlap(candidate, pathValue));
  }) || null;
}

function getLocalPolicyNextAction(decision, requiresOwnerApproval, deniedByLease, conflict, expiredLease, highRisk, pathValue) {
  if (decision === "allow") return "The local action is allowed. Continue inside the active local lease.";
  if (decision === "warn") return "Proceed carefully and create or refresh the local lease before the next change.";
  if (decision === "require_owner_approval") return `Request owner approval before editing ${pathValue || "the requested path"}.`;
  if (deniedByLease) return "The path is denied by the active local lease.";
  if (conflict) return "Resolve the local conflict before editing.";
  if (expiredLease) return "Refresh or replace the expired local lease before editing.";
  if (highRisk || requiresOwnerApproval) return "Owner approval is required for this local project action.";
  return "Resolve the policy blocker before continuing.";
}

function scanLocalProject(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const leases = readLocalLeasesState().leases || [];
  const clients = readLocalClientsState().clients || [];
  const sessions = readLocalSessionsState().sessions || [];
  const localChanges = collectLocalChanges();
  const ungovernedState = readLocalUngovernedChangesState();
  const scanClientType = normalizeLocalClientType(flags);
  const scanClientId = resolveLocalClientId(flags, scanClientType, clients);
  const scanSessionId = resolveLocalSessionId(flags, scanClientId, sessions);
  const records = [];

  for (const change of localChanges) {
    const coveringLease = findActiveLocalLease(leases, {
      machine_id: project.machine_id,
      project_id: project.project_id,
      client_id: scanClientId,
      session_id: scanSessionId,
      path: change.file
    });
    if (coveringLease) continue;
    const referencedIdeLease = findReferencedIdeLease(change.file);
    records.push({
      change_id: `local-change-${String(records.length + 1).padStart(3, "0")}`,
      machine_id: project.machine_id,
      project_id: project.project_id,
      client_id: scanClientId,
      session_id: scanSessionId,
      task_id: flags.task || flags.task_id || null,
      path: change.file,
      status: "ungoverned",
      reason: "Local change has no active local lease.",
      referenced_ide_lease_id: referencedIdeLease ? referencedIdeLease.lease_id : null,
      referenced_ide_window_id: referencedIdeLease ? referencedIdeLease.ide_window_id : null,
      detected_at: now
    });
  }

  if (records.length) {
    ungovernedState.changes.push(...records);
    ungovernedState.updated_at = now;
    writeLocalUngovernedChangesState(ungovernedState);
  }
  recordLocalAuditEvent("local.scan.completed", "local_scan", `scan-${String(Date.now())}`, `Local project scan completed: ${records.length} ungoverned change(s)`, { ...project, machine_id: machine.machine_id, changes_detected: records.length }, appendAudit);
  return {
    report_type: "multi_ai_local_scan",
    generated_at: now,
    project,
    machine,
    local_changes: localChanges,
    ungoverned_changes: records,
    counts: {
      changed_files: localChanges.length,
      ungoverned_changes: records.length
    },
    next_action: records.length
      ? "Add or refresh local leases before the next change."
      : "No ungoverned local changes were found."
  };
}

function evaluateLocalPolicy(action = null, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const project = readLocalProjectState();
  const machine = readLocalMachineState();
  const clientsState = readLocalClientsState();
  const sessionsState = readLocalSessionsState();
  const leasesState = readLocalLeasesState();
  const conflictsState = readLocalConflictsState();
  const policyState = readLocalPolicyDecisionsState();
  const approvalState = readLocalApprovalRequestsState();
  const pathValue = normalizePath(flags.path || flags.file || flags.folder || flags.scope || flags.target || rest[0] || "");
  const clientType = normalizeLocalClientType(flags);
  const clientId = resolveLocalClientId(flags, clientType, clientsState.clients || []);
  const sessionId = resolveLocalSessionId(flags, clientId, sessionsState.sessions || []);
  const taskId = flags.task || flags.task_id || flags.active_task_id || null;
  const branch = flags.branch || null;
  const localClient = findLocalClient(clientsState.clients || [], clientId);
  const localSession = findLocalSession(sessionsState.sessions || [], sessionId);
  const activeLease = findActiveLocalLease(leasesState.leases || [], {
    machine_id: project.machine_id,
    project_id: project.project_id,
    client_id: clientId,
    session_id: sessionId,
    task_id: taskId,
    branch,
    path: pathValue
  });
  const conflict = findLocalConflictForPath(conflictsState.conflicts || [], {
    machine_id: project.machine_id,
    project_id: project.project_id,
    client_id: clientId,
    session_id: sessionId,
    task_id: taskId,
    branch,
    path: pathValue
  });
  const expiredLease = activeLease && activeLease.expires_at && isExpired(activeLease.expires_at) ? activeLease : null;
  const deniedByLease = activeLease ? findDeniedPathHit(activeLease, pathValue) : null;
  const referencedIdeLease = findReferencedIdeLease(pathValue, clientId);
  const highRisk = isHighRiskLocalPath(pathValue) || Boolean(flags.high_risk) || Boolean(flags["owner-approval-required"]);
  const hasValidLease = Boolean(activeLease);
  const hasClient = Boolean(localClient);
  const hasSession = Boolean(localSession);

  let decision = "allow";
  let reason = "Valid local lease and no conflict detected.";
  let riskLevel = "low";
  let requiresOwnerApproval = false;

  if (!hasClient || !hasSession) {
    decision = decision === "allow" ? "warn" : decision;
    reason = !hasClient
      ? "Ungoverned local change: no registered local client was found."
      : "Ungoverned local change: no active local session was found.";
    riskLevel = "medium";
  }

  if (pathValue && !hasValidLease && decision === "allow") {
    decision = "warn";
    reason = "Ungoverned local change: no valid active lease covers the requested path.";
    riskLevel = "medium";
  }

  if (deniedByLease) {
    decision = "block";
    reason = `Denied path: ${pathValue || deniedByLease}`;
    riskLevel = "high";
  }

  if (!deniedByLease && conflict) {
    decision = "block";
    reason = `Conflict detected: ${conflict.conflict_type || "local_conflict"} on ${conflict.path || pathValue || "unknown path"}`;
    riskLevel = "high";
  }

  if (expiredLease) {
    decision = "block";
    reason = `Expired lease still in use: ${expiredLease.lease_id}`;
    riskLevel = "high";
  }

  if (highRisk && decision !== "block") {
    decision = "require_owner_approval";
    reason = `High-risk local project action requires owner approval for ${pathValue || "the requested path"}.`;
    riskLevel = "high";
    requiresOwnerApproval = true;
  }

  const evidenceId = `local-evidence-${String(policyState.decisions.length + 1).padStart(3, "0")}`;
  const decisionId = `local-decision-${String(policyState.decisions.length + 1).padStart(3, "0")}`;
  const record = {
    decision_id: decisionId,
    machine_id: machine.machine_id,
    project_id: project.project_id,
    client_id: clientId,
    session_id: sessionId,
    task_id: taskId,
    branch,
    path: pathValue || null,
    local_lease_id: activeLease ? activeLease.lease_id : null,
    conflict_id: conflict ? conflict.conflict_id : null,
    referenced_ide_lease_id: referencedIdeLease ? referencedIdeLease.lease_id : null,
    referenced_ide_window_id: referencedIdeLease ? referencedIdeLease.ide_window_id : null,
    action: action || flags.action || flags.operation || "edit",
    decision,
    reason,
    risk_level: riskLevel,
    requires_owner_approval: requiresOwnerApproval,
    evidence_id: evidenceId,
    timestamp: now,
    status: "recorded"
  };

  policyState.decisions.push(record);
  policyState.updated_at = now;
  writeLocalPolicyDecisionsState(policyState);

  if (pathValue && !hasValidLease && decision === "warn") {
    const ungovernedState = readLocalUngovernedChangesState();
    ungovernedState.changes.push({
      change_id: `local-change-${String(ungovernedState.changes.length + 1).padStart(3, "0")}`,
      machine_id: machine.machine_id,
      project_id: project.project_id,
      client_id: clientId,
      session_id: sessionId,
      task_id: taskId,
      path: pathValue,
      status: "ungoverned",
      reason,
      referenced_ide_lease_id: referencedIdeLease ? referencedIdeLease.lease_id : null,
      referenced_ide_window_id: referencedIdeLease ? referencedIdeLease.ide_window_id : null,
      detected_at: now
    });
    ungovernedState.updated_at = now;
    writeLocalUngovernedChangesState(ungovernedState);
  }

  if (requiresOwnerApproval) {
    const approvalRequest = {
      request_id: `local-approval-${String(approvalState.requests.length + 1).padStart(3, "0")}`,
      decision_id: decisionId,
      machine_id: machine.machine_id,
      project_id: project.project_id,
      client_id: clientId,
      session_id: sessionId,
      task_id: taskId,
      branch,
      path: pathValue || null,
      reason,
      status: "requested",
      requested_at: now,
      resolved_at: null,
      resolved_by: null,
      resolution: null
    };
    approvalState.requests.push(approvalRequest);
    approvalState.updated_at = now;
    writeLocalApprovalRequestsState(approvalState);
    recordLocalAuditEvent("local.approval.requested", "local_approval_request", approvalRequest.request_id, `Local owner approval requested: ${approvalRequest.request_id}`, approvalRequest, appendAudit);
  }

  recordLocalAuditEvent("local.policy.decision", "local_policy", decisionId, `Local policy decision: ${decision}`, record, appendAudit);

  const report = {
    report_type: "multi_ai_local_policy_decision",
    generated_at: now,
    ...record,
    active_lease: activeLease,
    conflict,
    referenced_ide_lease: referencedIdeLease,
    client: localClient,
    session: localSession,
    next_action: getLocalPolicyNextAction(decision, requiresOwnerApproval, deniedByLease, conflict, expiredLease, highRisk, pathValue)
  };
  if (decision === "require_owner_approval") {
    report.status = "blocked";
  }
  return report;
}

function registerLocalHeartbeatProxy(flags = {}, deps = {}, appendAudit = null) {
  return recordLocalHeartbeat(flags, deps, appendAudit);
}

function upsertById(items, item, key) {
  const next = [...(items || [])];
  const index = next.findIndex((entry) => entry && item && entry[key] === item[key]);
  if (index >= 0) next[index] = { ...next[index], ...item };
  else next.push(item);
  return next;
}

function normalizeLocalClientTypeValue(value) {
  return normalizeLocalClientType({ client_type: value });
}

function findLocalClientsByProject(projectId) {
  return readLocalClientsState().clients.filter((item) => !projectId || item.project_id === projectId);
}

function renderLocalReport(report) {
  if (!report || typeof report !== "object") return "Local project governance report unavailable.";
  if (report.report_type === "multi_ai_local_status") {
    return [
      "Multi-AI Local Project Governance",
      "",
      `Project: ${report.local_project ? report.local_project.project_id : "unknown"}`,
      `Machine: ${report.local_machine ? report.local_machine.machine_id : "unknown"}`,
      `Clients: ${report.counts.clients}`,
      `Sessions: ${report.counts.sessions}`,
      `Active leases: ${report.counts.active_leases}`,
      `Open conflicts: ${report.counts.open_conflicts}`,
      `Ungoverned changes: ${report.counts.ungoverned_changes}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_local_project_registered") {
    return `Local project registered: ${report.local_project ? report.local_project.project_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_local_clients") {
    const rows = (report.clients || []).map((item) => [
      item.client_id,
      item.client_type,
      item.machine_id || "",
      item.project_id || "",
      item.ide_window_id || "",
      item.status
    ]);
    return table(["Client", "Type", "Machine", "Project", "IDE Window", "Status"], rows);
  }
  if (report.report_type === "multi_ai_local_sessions") {
    const rows = (report.sessions || []).map((item) => [
      item.session_id,
      item.client_id,
      item.client_type,
      item.branch || "",
      item.status
    ]);
    return table(["Session", "Client", "Type", "Branch", "Status"], rows);
  }
  if (report.report_type === "multi_ai_local_leases") {
    const rows = (report.leases || []).map((item) => [
      item.lease_id,
      item.lease_type,
      item.scope || "",
      item.branch || "",
      item.client_id || "",
      item.task_id || "",
      item.status
    ]);
    return table(["Lease", "Type", "Scope", "Branch", "Client", "Task", "Status"], rows);
  }
  if (report.report_type === "multi_ai_local_conflicts") {
    const lines = ["Multi-AI Local Conflicts", `Conflicts: ${report.counts.selected}`];
    for (const conflict of report.conflicts || []) {
      lines.push(`- ${conflict.conflict_id}: ${conflict.conflict_type} (${conflict.path || "n/a"})`);
    }
    if (!(report.conflicts || []).length) lines.push("- none");
    return lines.join("\n");
  }
  if (report.report_type === "multi_ai_local_policy_decision") {
    return [
      "Multi-AI Local Policy Decision",
      "",
      `Decision: ${report.decision}`,
      `Risk: ${report.risk_level}`,
      `Owner approval required: ${report.requires_owner_approval ? "yes" : "no"}`,
      report.reason ? `Reason: ${report.reason}` : null,
      report.path ? `Path: ${report.path}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_local_lease_created") {
    return `Local lease created: ${report.lease ? report.lease.lease_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_local_lease_released") {
    return `Local lease released: ${report.lease ? report.lease.lease_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_local_ungoverned_changes") {
    const rows = (report.changes || []).map((item) => [
      item.change_id,
      item.path || "",
      item.client_id || "",
      item.task_id || "",
      item.status
    ]);
    return table(["Change", "Path", "Client", "Task", "Status"], rows);
  }
  if (report.report_type === "multi_ai_local_scan") {
    return [
      "Multi-AI Local Scan",
      "",
      `Changed files: ${report.counts.changed_files}`,
      `Ungoverned changes: ${report.counts.ungoverned_changes}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_local_heartbeat") {
    return `Local heartbeat recorded: ${report.local_heartbeat ? report.local_heartbeat.heartbeat_id : "unknown"}`;
  }
  return JSON.stringify(report, null, 2);
}

function buildLocalUngovernedOrScanReport(flags = {}) {
  return buildLocalUngovernedChangesReport(flags);
}

function findLocalLeaseById(leaseId) {
  return readLocalLeasesState().leases.find((item) => item.lease_id === leaseId) || null;
}

function buildLocalStatusForCli(flags = {}) {
  return buildLocalStatusReport(flags);
}

function normalizeLeaseTypeWrapper(value) {
  return normalizeLeaseType(value);
}

function normalizeLocalClientTypeWrapper(flags = {}) {
  return normalizeLocalClientType(flags);
}

module.exports = {
  multiAiLocalGovernance,
  buildLocalStatusReport,
  registerLocalProject,
  handleClientAction,
  handleSessionAction,
  registerLocalClient,
  registerLocalSession,
  recordLocalHeartbeat: registerLocalHeartbeatProxy,
  handleLeaseAction,
  releaseLocalLease,
  createLocalLease,
  buildLocalConflictsReport,
  scanLocalProject,
  evaluateLocalPolicy,
  buildLocalUngovernedChangesReport,
  readLocalProjectState,
  readLocalMachineState,
  readLocalClientsState,
  readLocalSessionsState,
  readLocalHeartbeatsState,
  readLocalLeasesState,
  readLocalConflictsState,
  readLocalUngovernedChangesState,
  readLocalPolicyDecisionsState,
  readLocalApprovalRequestsState,
  readLocalAuditLogState,
  writeLocalProjectState,
  writeLocalMachineState,
  writeLocalClientsState,
  writeLocalSessionsState,
  writeLocalHeartbeatsState,
  writeLocalLeasesState,
  writeLocalConflictsState,
  writeLocalUngovernedChangesState,
  writeLocalPolicyDecisionsState,
  writeLocalApprovalRequestsState,
  writeLocalAuditLogState,
  normalizeLocalClientType: normalizeLocalClientTypeWrapper,
  normalizeLeaseType: normalizeLeaseTypeWrapper,
  renderLocalReport,
  findLocalLeaseById,
  buildLocalStatusForCli,
  findLocalClientsByProject,
  collectLocalChanges
};
