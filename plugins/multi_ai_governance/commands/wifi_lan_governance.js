const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot } = require("../../../src/cli/fs_utils");
const { table } = require("../../../src/cli/ui");
const { isExpired } = require("../../../src/cli/services/collections");
const wifiClientModule = require("../integrations/wifi_data_sharing_client");
const wifiPackets = require("./wifi_packets");
const localProjectGovernance = require("./local_project_governance");

const WIFI_STATE_DIR = ".kabeeri/multi_ai_governance";
const WIFI_NODES_FILE = `${WIFI_STATE_DIR}/wifi_nodes.json`;
const WIFI_NODE_IDENTITY_MAP_FILE = `${WIFI_STATE_DIR}/wifi_node_identity_map.json`;
const WIFI_TRUST_FILE = `${WIFI_STATE_DIR}/wifi_trust.json`;
const WIFI_PAIRING_REQUESTS_FILE = `${WIFI_STATE_DIR}/wifi_pairing_requests.json`;
const WIFI_PERMISSIONS_FILE = `${WIFI_STATE_DIR}/wifi_permissions.json`;
const WIFI_REVOCATIONS_FILE = `${WIFI_STATE_DIR}/wifi_revocations.json`;
const WIFI_TASK_TOKENS_FILE = `${WIFI_STATE_DIR}/wifi_task_tokens.json`;
const WIFI_LEASES_FILE = `${WIFI_STATE_DIR}/wifi_leases.json`;
const WIFI_CONFLICTS_FILE = `${WIFI_STATE_DIR}/wifi_conflicts.json`;
const WIFI_UNGOVERNED_PACKETS_FILE = `${WIFI_STATE_DIR}/wifi_ungoverned_packets.json`;
const WIFI_POLICY_DECISIONS_FILE = `${WIFI_STATE_DIR}/wifi_policy_decisions.json`;
const WIFI_APPROVAL_REQUESTS_FILE = `${WIFI_STATE_DIR}/wifi_approval_requests.json`;
const WIFI_AUDIT_LOG_FILE = `${WIFI_STATE_DIR}/wifi_audit_log.json`;
const WIFI_PACKET_EVIDENCE_FILE = `${WIFI_STATE_DIR}/wifi_packet_evidence.json`;

const WIFI_NODE_TYPES = new Set([
  "owner_machine",
  "developer_machine",
  "ai_runner",
  "gpu_runner",
  "test_runner",
  "build_runner",
  "browser_runner",
  "mcp_server",
  "database_server",
  "local_dev_server",
  "iot_device",
  "embedded_board",
  "robotics_device",
  "drone_device",
  "cnc_device",
  "unknown_node"
]);

const WIFI_TRUST_STATUSES = new Set([
  "untrusted",
  "pairing_requested",
  "trusted",
  "revoked",
  "expired",
  "blocked"
]);

const WIFI_CAPABILITIES = new Set([
  "read_project_state",
  "receive_task_packet",
  "send_task_result",
  "run_tests",
  "run_build",
  "run_ai_model",
  "propose_patch",
  "sync_files",
  "write_project_files",
  "access_local_service",
  "access_device",
  "push_to_git",
  "modify_secrets"
]);

const WIFI_LEASE_TYPES = new Set([
  "task",
  "file",
  "folder",
  "branch",
  "runner",
  "service",
  "device",
  "port"
]);

function multiAiWifiGovernance(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const subaction = normalizeAction(value, flags);
  const appendAudit = typeof deps.appendAudit === "function" ? deps.appendAudit : null;

  if (!action || action === "status" || action === "summary") {
    return buildWifiStatusReport(flags, deps);
  }
  if (subaction === "status" || subaction === "show" || subaction === "summary") {
    return buildWifiStatusReport(flags, deps);
  }
  if (subaction === "nodes") {
    return buildWifiNodesReport(flags, deps);
  }
  if (subaction === "map-node" || subaction === "map_node" || subaction === "map") {
    return mapWifiNode(flags, deps, appendAudit);
  }
  if (subaction === "trust") {
    const trustAction = normalizeNestedAction(rest[0], flags);
    if (!trustAction || trustAction === "status" || trustAction === "show" || trustAction === "list") {
      return buildWifiTrustStatusReport(flags, deps);
    }
    if (trustAction === "permissions") {
      return buildWifiPermissionsReport(flags, deps);
    }
  }
  if (subaction === "pair") {
    return handlePairingAction(normalizeNestedAction(rest[0], flags), flags, rest.slice(1), deps, appendAudit);
  }
  if (subaction === "permissions") {
    return buildWifiPermissionsReport(flags, deps);
  }
  if (subaction === "token") {
    return handleTokenAction(normalizeNestedAction(rest[0], flags), flags, rest.slice(1), deps, appendAudit);
  }
  if (subaction === "lease") {
    return handleLeaseAction(normalizeNestedAction(rest[0], flags), flags, rest.slice(1), deps, appendAudit);
  }
  if (subaction === "release") {
    return releaseWifiLease(flags, deps, appendAudit);
  }
  if (subaction === "conflicts") {
    return buildWifiConflictsReport(flags, deps);
  }
  if (subaction === "policy" || subaction === "check" || subaction === "evaluate") {
    return evaluateWifiPolicy(flags, deps, appendAudit);
  }
  if (subaction === "packet") {
    return routePacketAction(normalizeNestedAction(rest[0], flags), value, flags, rest.slice(1), deps);
  }
  if (subaction === "packet-create" || subaction === "packet_create" || subaction === "packet-send" || subaction === "packet_send" || subaction === "packet-inbox" || subaction === "packet_inbox" || subaction === "packet-inspect" || subaction === "packet_inspect" || subaction === "packet-consume" || subaction === "packet_consume") {
    return routePacketAction(subaction, value, flags, rest, deps);
  }
  throw new Error(`Unknown wifi governance action: ${action}${subaction ? ` ${subaction}` : ""}`);
}

function buildWifiStatusReport(flags = {}, deps = {}) {
  const wifiClient = resolveWifiClient(deps);
  const integration = buildIntegrationStatus(wifiClient);
  const nodesState = readWifiNodesState();
  const trustState = readWifiTrustState();
  const pairings = readWifiPairingRequestsState();
  const permissions = readWifiPermissionsState();
  const tokens = readWifiTaskTokensState();
  const leases = readWifiLeasesState();
  const conflicts = readWifiConflictsState();
  const localProject = readLocalProjectContext();
  const observedNodes = observeWifiNodes(wifiClient);
  const governanceNodes = mergeObservedAndMappedNodes(nodesState.nodes, observedNodes);
  return {
    report_type: "multi_ai_wifi_lan_status",
    generated_at: new Date().toISOString(),
    status: integration.available ? "partial" : "unavailable",
    integration,
    local_project: localProject.project,
    local_machine: localProject.machine,
    counts: {
      observed_nodes: observedNodes.length,
      governance_nodes: governanceNodes.length,
      mapped_nodes: nodesState.nodes.length,
      trusted_nodes: trustState.trust_records.filter((item) => item.trust_status === "trusted").length,
      pairing_requests: pairings.requests.length,
      permissions: permissions.permissions.length,
      tokens: tokens.tokens.length,
      active_leases: leases.leases.filter((item) => item.status === "active").length,
      open_conflicts: conflicts.conflicts.filter((item) => item.status !== "resolved").length
    },
    observed_nodes: observedNodes,
    nodes: governanceNodes,
    next_action: integration.available
      ? "Use `kvdf multi-ai wifi map-node`, `kvdf multi-ai wifi pair request`, or `kvdf multi-ai wifi lease create` to govern the LAN."
      : "Enable wifi_data_sharing to observe LAN peers."
  };
}

function buildWifiNodesReport(flags = {}, deps = {}) {
  const wifiClient = resolveWifiClient(deps);
  const integration = buildIntegrationStatus(wifiClient);
  const nodesState = readWifiNodesState();
  const observedNodes = observeWifiNodes(wifiClient);
  const governanceNodes = mergeObservedAndMappedNodes(nodesState.nodes, observedNodes);
  const nodeId = String(getFlag(flags, "wifi_node_id", "wifi-node-id", "wifiNodeId", "node", "id") || "").trim();
  const nodes = nodeId ? governanceNodes.filter((item) => item.wifi_node_id === nodeId || item.governance_node_id === nodeId) : governanceNodes;
  return {
    report_type: "multi_ai_wifi_nodes",
    generated_at: new Date().toISOString(),
    status: integration.available ? "available" : "unavailable",
    integration,
    nodes,
    observed_nodes: observedNodes,
    counts: {
      total: governanceNodes.length,
      selected: nodes.length,
      trusted: governanceNodes.filter((item) => item.trust_status === "trusted").length,
      untrusted: governanceNodes.filter((item) => item.trust_status !== "trusted").length
    },
    next_action: "Use `kvdf multi-ai wifi map-node` to bind a discovered LAN node to governance identity."
  };
}

function mapWifiNode(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const context = readLocalProjectContext();
  const nodesState = readWifiNodesState();
  const mapState = readWifiNodeIdentityMapState();
  const trustState = readWifiTrustState();
  const wifiNodeId = resolveWifiNodeId(flags);
  const governanceNodeId = resolveGovernanceNodeId(flags, wifiNodeId);
  const requestedTrustStatus = normalizeTrustStatus(getFlag(flags, "trust_status", "trust-status", "trustStatus", "trust") || "untrusted");
  const trustStatus = "untrusted";
  const record = {
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    machine_id: resolveMachineId(flags, context.machine),
    project_id: resolveProjectId(flags, context.project),
    node_type: normalizeNodeType(getFlag(flags, "node_type", "node-type", "nodeType", "type", "role") || "unknown_node"),
    hostname: String(getFlag(flags, "hostname", "host") || "").trim() || null,
    local_ip: String(getFlag(flags, "local_ip", "local-ip", "localIp", "ip", "address") || "").trim() || null,
    wifi_data_sharing_peer_id: String(getFlag(flags, "wifi_data_sharing_peer_id", "wifi-data-sharing-peer-id", "wifiDataSharingPeerId", "peer_id", "peer-id", "peerId", "peer") || "").trim() || null,
    trust_status: trustStatus,
    requested_trust_status: requestedTrustStatus,
    owner_approved: isTruthyFlag(getFlag(flags, "owner_approved", "owner-approved", "ownerApproved", "approved", "confirm")),
    paired_at: getFlag(flags, "paired_at", "paired-at", "pairedAt") || null,
    last_seen_at: now,
    status: getFlag(flags, "status") || "active",
    capabilities: normalizeList(getFlag(flags, "capabilities") || inferNodeCapabilities(flags)),
    ide_window_id: getFlag(flags, "ide_window_id", "ide-window-id", "ideWindowId") || null,
    session_id: getFlag(flags, "session_id", "session-id", "sessionId") || null
  };
  upsertById(nodesState.nodes, record, "wifi_node_id");
  nodesState.updated_at = now;
  writeWifiNodesState(nodesState);
  upsertById(mapState.mappings, {
    wifi_node_id: record.wifi_node_id,
    governance_node_id: record.governance_node_id,
    machine_id: record.machine_id,
    project_id: record.project_id,
    wifi_data_sharing_peer_id: record.wifi_data_sharing_peer_id,
    mapped_at: now,
    status: record.status
  }, "wifi_node_id");
  mapState.updated_at = now;
  writeWifiNodeIdentityMapState(mapState);
  upsertById(trustState.trust_records, {
    trust_record_id: nextId(trustState.trust_records, "wifi-trust"),
    wifi_node_id: record.wifi_node_id,
    governance_node_id: record.governance_node_id,
    machine_id: record.machine_id,
    project_id: record.project_id,
    trust_status: trustStatus,
    owner_approved: record.owner_approved,
    paired_at: record.paired_at,
    last_seen_at: now,
    status: record.status,
    capabilities: record.capabilities,
    requested_trust_status: requestedTrustStatus
  }, "wifi_node_id");
  trustState.updated_at = now;
  writeWifiTrustState(trustState);
  recordWifiAuditEvent("wifi.node.mapped", "wifi_node", record.wifi_node_id, `Mapped Wi-Fi node ${record.wifi_node_id}`, record, appendAudit);
  return {
    report_type: "multi_ai_wifi_node_mapped",
    generated_at: now,
    status: "ok",
    wifi_node: record,
    next_action: trustStatus === "trusted"
      ? "Issue a Wi-Fi task token with `kvdf multi-ai wifi token issue`."
      : "Request pairing approval before issuing governed Wi-Fi tokens."
  };
}

function buildWifiTrustStatusReport(flags = {}, deps = {}) {
  const state = readWifiTrustState();
  const nodeId = String(getFlag(flags, "wifi_node_id", "wifi-node-id", "wifiNodeId", "node", "id") || "").trim();
  const trust_records = nodeId
    ? state.trust_records.filter((item) => item.wifi_node_id === nodeId || item.governance_node_id === nodeId)
    : state.trust_records;
  return {
    report_type: "multi_ai_wifi_trust_status",
    generated_at: new Date().toISOString(),
    status: "ok",
    trust_records,
    counts: {
      total: state.trust_records.length,
      trusted: state.trust_records.filter((item) => item.trust_status === "trusted").length,
      revoked: state.trust_records.filter((item) => item.trust_status === "revoked").length,
      untrusted: state.trust_records.filter((item) => item.trust_status !== "trusted").length
    },
    next_action: "Use `kvdf multi-ai wifi pair request` to start a trust flow."
  };
}

function buildWifiPermissionsReport(flags = {}, deps = {}) {
  const state = readWifiPermissionsState();
  const nodeId = String(getFlag(flags, "wifi_node_id", "wifi-node-id", "wifiNodeId", "node", "id") || "").trim();
  const permissions = nodeId
    ? state.permissions.filter((item) => item.wifi_node_id === nodeId || item.governance_node_id === nodeId)
    : state.permissions;
  return {
    report_type: "multi_ai_wifi_permissions",
    generated_at: new Date().toISOString(),
    status: "ok",
    permissions,
    counts: {
      total: state.permissions.length,
      selected: permissions.length
    },
    next_action: "Grant permissions through pairing approval or issue a Wi-Fi task token."
  };
}

function handlePairingAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "show") {
    return buildWifiPairingRequestsReport(flags, deps);
  }
  if (normalized === "request" || normalized === "create" || normalized === "open") {
    return requestWifiPairing(flags, deps, appendAudit);
  }
  if (normalized === "approve") {
    return approveWifiPairing(flags, deps, appendAudit);
  }
  if (normalized === "deny") {
    return denyWifiPairing(flags, deps, appendAudit);
  }
  if (normalized === "revoke") {
    return revokeWifiPairing(flags, deps, appendAudit);
  }
  throw new Error(`Unknown wifi pairing action: ${normalized}`);
}

function buildWifiPairingRequestsReport(flags = {}, deps = {}) {
  const state = readWifiPairingRequestsState();
  const wifiNodeId = String(getFlag(flags, "wifi_node_id", "wifi-node-id", "wifiNodeId", "node", "id") || "").trim();
  const requests = wifiNodeId ? state.requests.filter((item) => item.wifi_node_id === wifiNodeId) : state.requests;
  return {
    report_type: "multi_ai_wifi_pairing_requests",
    generated_at: new Date().toISOString(),
    status: "ok",
    requests,
    counts: {
      total: state.requests.length,
      requested: state.requests.filter((item) => item.approval_status === "requested").length,
      approved: state.requests.filter((item) => item.approval_status === "approved").length,
      denied: state.requests.filter((item) => item.approval_status === "denied").length
    },
    next_action: "Use `kvdf multi-ai wifi pair request` to open a pairing request."
  };
}

function requestWifiPairing(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const wifiNodeId = resolveWifiNodeId(flags);
  const governanceNodeId = resolveGovernanceNodeId(flags, wifiNodeId);
  const projectId = resolveProjectId(flags, readLocalProjectContext().project);
  const ownerId = String(getFlag(flags, "owner_id", "owner-id", "ownerId", "owner") || readLocalProjectContext().project.owner_id || "owner-unknown").trim();
  const record = {
    pairing_request_id: nextId(readWifiPairingRequestsState().requests, "wifi-pair"),
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    requested_by: String(getFlag(flags, "requested_by", "requested-by", "requestedBy", "requested_by_id", "requested-by-id", "by") || wifiNodeId || "unknown").trim(),
    owner_id: ownerId,
    trust_status: "pairing_requested",
    approval_status: "requested",
    approved_at: null,
    revoked_at: null,
    expires_at: getFlag(flags, "expires_at", "expires-at", "expiresAt") || null,
    allowed_projects: normalizeList(getFlag(flags, "allowed_projects", "allowed-projects", "allowedProjects") || projectId),
    allowed_capabilities: normalizeCapabilities(getFlag(flags, "allowed_capabilities", "allowed-capabilities", "allowedCapabilities") || []),
    denied_capabilities: normalizeCapabilities(getFlag(flags, "denied_capabilities", "denied-capabilities", "deniedCapabilities") || []),
    risk_level: normalizeRiskLevel(getFlag(flags, "risk_level", "risk-level", "riskLevel") || "medium"),
    created_at: now,
    updated_at: now
  };
  const state = readWifiPairingRequestsState();
  state.requests.push(record);
  state.updated_at = now;
  writeWifiPairingRequestsState(state);
  upsertWifiTrustRecord({
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    project_id: projectId,
    trust_status: "pairing_requested",
    owner_approved: false,
    paired_at: null,
    last_seen_at: now,
    status: "active"
  });
  recordWifiAuditEvent("wifi.pair.requested", "wifi_pairing_request", record.pairing_request_id, `Wi-Fi pairing requested for ${wifiNodeId}`, record, appendAudit);
  return {
    report_type: "multi_ai_wifi_pairing_request",
    generated_at: now,
    status: "ok",
    pairing_request: record,
    next_action: "Use `kvdf multi-ai wifi pair approve` or `kvdf multi-ai wifi pair deny`."
  };
}

function approveWifiPairing(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const wifiNodeId = resolveWifiNodeId(flags);
  const state = readWifiPairingRequestsState();
  const request = findLatestByNode(state.requests, wifiNodeId);
  if (!request) {
    return buildBlockedWifiReport("Pairing request not found.", "pair-approve");
  }
  request.approval_status = "approved";
  request.trust_status = "trusted";
  request.approved_at = now;
  request.owner_approved = true;
  request.updated_at = now;
  request.allowed_projects = normalizeList(getFlag(flags, "allowed_projects", "allowed-projects", "allowedProjects") || request.allowed_projects || []);
  request.allowed_capabilities = normalizeCapabilities(getFlag(flags, "allowed_capabilities", "allowed-capabilities", "allowedCapabilities") || request.allowed_capabilities || []);
  request.denied_capabilities = normalizeCapabilities(getFlag(flags, "denied_capabilities", "denied-capabilities", "deniedCapabilities") || request.denied_capabilities || []);
  writeWifiPairingRequestsState(state);
  const permissionsRecord = {
    permission_id: nextId(readWifiPermissionsState().permissions, "wifi-permission"),
    pairing_request_id: request.pairing_request_id,
    wifi_node_id: request.wifi_node_id,
    governance_node_id: request.governance_node_id,
    owner_id: request.owner_id,
    allowed_projects: request.allowed_projects,
    allowed_capabilities: request.allowed_capabilities,
    denied_capabilities: request.denied_capabilities,
    approved_at: now,
    revoked_at: null,
    expires_at: request.expires_at || null,
    risk_level: request.risk_level,
    status: "active",
    created_at: now,
    updated_at: now
  };
  const permissionsState = readWifiPermissionsState();
  permissionsState.permissions.push(permissionsRecord);
  permissionsState.updated_at = now;
  writeWifiPermissionsState(permissionsState);
  upsertWifiTrustRecord({
    wifi_node_id: request.wifi_node_id,
    governance_node_id: request.governance_node_id,
    project_id: request.allowed_projects[0] || resolveProjectId(flags, readLocalProjectContext().project),
    trust_status: "trusted",
    owner_approved: true,
    paired_at: now,
    last_seen_at: now,
    status: "active"
  });
  writeWifiTrustState(readWifiTrustState());
  recordWifiAuditEvent("wifi.pair.approved", "wifi_pairing_request", request.pairing_request_id, `Wi-Fi pairing approved for ${wifiNodeId}`, request, appendAudit);
  return {
    report_type: "multi_ai_wifi_pairing_approved",
    generated_at: now,
    status: "ok",
    pairing_request: request,
    permissions: permissionsRecord,
    next_action: "Issue a Wi-Fi task token with `kvdf multi-ai wifi token issue`."
  };
}

function denyWifiPairing(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const wifiNodeId = resolveWifiNodeId(flags);
  const state = readWifiPairingRequestsState();
  const request = findLatestByNode(state.requests, wifiNodeId);
  if (!request) {
    return buildBlockedWifiReport("Pairing request not found.", "pair-deny");
  }
  request.approval_status = "denied";
  request.trust_status = "blocked";
  request.revoked_at = now;
  request.updated_at = now;
  request.deny_reason = getFlag(flags, "reason", "deny-reason", "denyReason") || null;
  writeWifiPairingRequestsState(state);
  const revocationsState = readWifiRevocationsState();
  revocationsState.revocations.push({
    revocation_id: nextId(revocationsState.revocations, "wifi-revocation"),
    pairing_request_id: request.pairing_request_id,
    wifi_node_id: request.wifi_node_id,
    governance_node_id: request.governance_node_id,
    owner_id: request.owner_id,
    reason: request.deny_reason || "Denied by owner",
    revoked_at: now,
    status: "denied",
    created_at: now,
    updated_at: now
  });
  revocationsState.updated_at = now;
  writeWifiRevocationsState(revocationsState);
  upsertWifiTrustRecord({
    wifi_node_id: request.wifi_node_id,
    governance_node_id: request.governance_node_id,
    project_id: request.allowed_projects[0] || resolveProjectId(flags, readLocalProjectContext().project),
    trust_status: "blocked",
    owner_approved: false,
    paired_at: null,
    last_seen_at: now,
    status: "blocked"
  });
  recordWifiAuditEvent("wifi.pair.denied", "wifi_pairing_request", request.pairing_request_id, `Wi-Fi pairing denied for ${wifiNodeId}`, request, appendAudit);
  return {
    report_type: "multi_ai_wifi_pairing_denied",
    generated_at: now,
    status: "ok",
    pairing_request: request,
    next_action: "The node is blocked until a new pairing request is approved."
  };
}

function revokeWifiPairing(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const wifiNodeId = resolveWifiNodeId(flags);
  const state = readWifiPairingRequestsState();
  const request = findLatestByNode(state.requests, wifiNodeId);
  if (!request) {
    return buildBlockedWifiReport("Pairing request not found.", "pair-revoke");
  }
  const revocationsState = readWifiRevocationsState();
  const revocation = {
    revocation_id: nextId(revocationsState.revocations, "wifi-revocation"),
    pairing_request_id: request.pairing_request_id,
    wifi_node_id: request.wifi_node_id,
    governance_node_id: request.governance_node_id,
    owner_id: request.owner_id,
    reason: getFlag(flags, "reason", "revoke-reason", "revokeReason") || "Revoked by owner",
    revoked_at: now,
    status: "revoked",
    created_at: now,
    updated_at: now
  };
  revocationsState.revocations.push(revocation);
  revocationsState.updated_at = now;
  writeWifiRevocationsState(revocationsState);
  request.approval_status = "revoked";
  request.trust_status = "revoked";
  request.revoked_at = now;
  request.updated_at = now;
  writeWifiPairingRequestsState(state);
  upsertWifiTrustRecord({
    wifi_node_id: request.wifi_node_id,
    governance_node_id: request.governance_node_id,
    project_id: request.allowed_projects[0] || resolveProjectId(flags, readLocalProjectContext().project),
    trust_status: "revoked",
    owner_approved: false,
    paired_at: request.approved_at || null,
    last_seen_at: now,
    status: "revoked"
  });
  recordWifiAuditEvent("wifi.pair.revoked", "wifi_pairing_request", request.pairing_request_id, `Wi-Fi pairing revoked for ${wifiNodeId}`, revocation, appendAudit);
  return {
    report_type: "multi_ai_wifi_pairing_revoked",
    generated_at: now,
    status: "ok",
    revocation,
    next_action: "The node is revoked and must request pairing again."
  };
}

function handleTokenAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "show" || normalized === "list") {
    return buildWifiTokenStatusReport(flags, deps);
  }
  if (normalized === "issue" || normalized === "create" || normalized === "grant") {
    return issueWifiTaskToken(flags, deps, appendAudit);
  }
  throw new Error(`Unknown wifi token action: ${normalized}`);
}

function buildWifiTokenStatusReport(flags = {}, deps = {}) {
  const state = readWifiTaskTokensState();
  const nodeId = String(getFlag(flags, "wifi_node_id", "wifi-node-id", "wifiNodeId", "node", "id") || "").trim();
  const taskId = String(getFlag(flags, "task_id", "task-id", "taskId", "task") || "").trim();
  const tokens = state.tokens.filter((item) => {
    if (nodeId && item.wifi_node_id !== nodeId && item.governance_node_id !== nodeId) return false;
    if (taskId && item.task_id !== taskId) return false;
    return true;
  });
  return {
    report_type: "multi_ai_wifi_token_status",
    generated_at: new Date().toISOString(),
    status: "ok",
    tokens,
    counts: {
      total: state.tokens.length,
      active: state.tokens.filter((item) => item.status === "active").length,
      selected: tokens.length
    },
    next_action: "Use `kvdf multi-ai wifi token issue` to mint a governed Wi-Fi task token."
  };
}

function issueWifiTaskToken(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const wifiNodeId = resolveWifiNodeId(flags);
  const governanceNodeId = resolveGovernanceNodeId(flags, wifiNodeId);
  const trustRecord = findWifiTrustRecord(wifiNodeId);
  if (!trustRecord || trustRecord.trust_status !== "trusted") {
    return buildBlockedWifiReport("Trusted pairing is required before issuing a Wi-Fi task token.", "token-issue");
  }
  const token = {
    wifi_task_token_id: nextId(readWifiTaskTokensState().tokens, "wifi-token"),
    project_id: resolveProjectId(flags, readLocalProjectContext().project),
    task_id: String(getFlag(flags, "task_id", "task-id", "taskId", "task", "active_task_id", "active-task-id", "activeTaskId") || "task-unknown").trim(),
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    agent_id: String(getFlag(flags, "agent_id", "agent-id", "agentId", "agent") || trustRecord.agent_id || "").trim() || null,
    tool_id: String(getFlag(flags, "tool_id", "tool-id", "toolId", "tool") || "").trim() || null,
    allowed_actions: normalizeCapabilities(getFlag(flags, "allowed_actions", "allowed-actions", "allowedActions") || ["read_project_state", "receive_task_packet", "send_task_result"]),
    denied_actions: normalizeCapabilities(getFlag(flags, "denied_actions", "denied-actions", "deniedActions") || []),
    allowed_paths: normalizeList(getFlag(flags, "allowed_paths", "allowed-paths", "allowedPaths") || []),
    denied_paths: normalizeList(getFlag(flags, "denied_paths", "denied-paths", "deniedPaths") || []),
    allowed_services: normalizeList(getFlag(flags, "allowed_services", "allowed-services", "allowedServices") || []),
    denied_services: normalizeList(getFlag(flags, "denied_services", "denied-services", "deniedServices") || []),
    allowed_devices: normalizeList(getFlag(flags, "allowed_devices", "allowed-devices", "allowedDevices") || []),
    denied_devices: normalizeList(getFlag(flags, "denied_devices", "denied-devices", "deniedDevices") || []),
    max_runtime_seconds: Number(getFlag(flags, "max_runtime_seconds", "max-runtime-seconds", "maxRuntimeSeconds", "max_runtime") || 0) || null,
    risk_level: normalizeRiskLevel(getFlag(flags, "risk_level", "risk-level", "riskLevel") || "medium"),
    created_at: now,
    expires_at: getFlag(flags, "expires_at", "expires-at", "expiresAt") || null,
    status: "active",
    trust_status: trustRecord.trust_status
  };
  const state = readWifiTaskTokensState();
  state.tokens.push(token);
  state.updated_at = now;
  writeWifiTaskTokensState(state);
  recordWifiAuditEvent("wifi.token.issued", "wifi_task_token", token.wifi_task_token_id, `Wi-Fi task token issued for ${wifiNodeId}`, token, appendAudit);
  return {
    report_type: "multi_ai_wifi_task_token_issued",
    generated_at: now,
    status: "ok",
    wifi_task_token: token,
    next_action: "Create a Wi-Fi lease with `kvdf multi-ai wifi lease create`."
  };
}

function handleLeaseAction(action, flags = {}, rest = [], deps = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "show" || normalized === "list") {
    return buildWifiLeaseReport(flags, deps);
  }
  if (normalized === "create" || normalized === "add" || normalized === "register") {
    return createWifiLease(flags, deps, appendAudit);
  }
  throw new Error(`Unknown wifi lease action: ${normalized}`);
}

function buildWifiLeaseReport(flags = {}, deps = {}) {
  const state = readWifiLeasesState();
  const leaseId = String(getFlag(flags, "wifi_lease_id", "wifi-lease-id", "wifiLeaseId", "lease_id", "lease-id", "leaseId", "lease", "id") || "").trim();
  const taskId = String(getFlag(flags, "task_id", "task-id", "taskId", "task") || "").trim();
  const leases = state.leases.filter((item) => {
    if (leaseId && item.wifi_lease_id !== leaseId) return false;
    if (taskId && item.task_id !== taskId) return false;
    return true;
  });
  return {
    report_type: "multi_ai_wifi_leases",
    generated_at: new Date().toISOString(),
    status: "ok",
    leases,
    counts: {
      total: state.leases.length,
      active: state.leases.filter((item) => item.status === "active").length,
      selected: leases.length
    },
    next_action: "Use `kvdf multi-ai wifi lease create` to govern the LAN scope."
  };
}

function createWifiLease(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const wifiNodeId = resolveWifiNodeId(flags);
  const governanceNodeId = resolveGovernanceNodeId(flags, wifiNodeId);
  const token = resolveWifiTaskToken(flags, wifiNodeId);
  if (!token || token.status !== "active") {
    return buildBlockedWifiReport("An active Wi-Fi task token is required before creating a lease.", "lease-create");
  }
  const leaseTypeFlag = getFlag(flags, "lease_type", "lease-type", "leaseType", "type", "kind");
  const leaseType = normalizeLeaseType(
    leaseTypeFlag ||
      (getFlag(flags, "branch") ? "branch" : null) ||
      (getFlag(flags, "device_id", "device-id", "deviceId", "device") ? "device" : null) ||
      (getFlag(flags, "port") ? "port" : null) ||
      (getFlag(flags, "local_service", "local-service", "localService") ? "service" : null) ||
      (getFlag(flags, "scope", "path", "file", "folder") ? "file" : "task")
  );
  const scope = String(getFlag(flags, "scope", "path", "file", "folder", "branch", "device_id", "device-id", "deviceId", "device", "local_service", "local-service", "localService", "port") || token.task_id).trim();
  const lease = {
    wifi_lease_id: nextId(readWifiLeasesState().leases, "wifi-lease"),
    project_id: token.project_id,
    task_id: token.task_id,
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    lease_type: leaseType,
    scope,
    branch: getFlag(flags, "branch") || null,
    local_service: getFlag(flags, "local_service", "local-service", "localService") || null,
    device_id: getFlag(flags, "device_id", "device-id", "deviceId", "device") || null,
    port: getFlag(flags, "port") || null,
    created_at: now,
    expires_at: getFlag(flags, "expires_at", "expires-at", "expiresAt") || token.expires_at || null,
    status: "active",
    allowed_paths: normalizeList(getFlag(flags, "allowed_paths", "allowed-paths", "allowedPaths") || token.allowed_paths || []),
    denied_paths: normalizeList(getFlag(flags, "denied_paths", "denied-paths", "deniedPaths") || token.denied_paths || []),
    allowed_services: normalizeList(getFlag(flags, "allowed_services", "allowed-services", "allowedServices") || token.allowed_services || []),
    denied_services: normalizeList(getFlag(flags, "denied_services", "denied-services", "deniedServices") || token.denied_services || []),
    allowed_devices: normalizeList(getFlag(flags, "allowed_devices", "allowed-devices", "allowedDevices") || token.allowed_devices || []),
    denied_devices: normalizeList(getFlag(flags, "denied_devices", "denied-devices", "deniedDevices") || token.denied_devices || []),
    max_runtime_seconds: token.max_runtime_seconds || null,
    risk_level: token.risk_level || "medium"
  };
  const conflicts = detectWifiLeaseConflicts(lease, deps);
  if (conflicts.length) {
    recordWifiConflicts(conflicts, appendAudit);
    if (!isTruthyFlag(flags.force)) {
      recordWifiAuditEvent("wifi.lease.blocked", "wifi_lease", lease.wifi_lease_id, `Wi-Fi lease blocked for ${lease.scope}`, { lease, conflicts }, appendAudit);
      return {
        report_type: "multi_ai_wifi_lease_blocked",
        generated_at: now,
        status: "blocked",
        lease,
        conflicts,
        next_action: "Resolve the conflict or retry with explicit owner approval."
      };
    }
  }
  const state = readWifiLeasesState();
  state.leases.push(lease);
  state.updated_at = now;
  writeWifiLeasesState(state);
  recordWifiAuditEvent("wifi.lease.created", "wifi_lease", lease.wifi_lease_id, `Wi-Fi lease created for ${lease.scope}`, { lease, conflicts }, appendAudit);
  return {
    report_type: "multi_ai_wifi_lease_created",
    generated_at: now,
    status: conflicts.length ? "warn" : "ok",
    lease,
    conflicts,
    next_action: conflicts.length
      ? "The lease was created with warnings. Run `kvdf multi-ai wifi conflicts` to inspect them."
      : "Use `kvdf multi-ai wifi policy check` before the next distributed action."
  };
}

function releaseWifiLease(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readWifiLeasesState();
  const leaseId = String(getFlag(flags, "wifi_lease_id", "wifi-lease-id", "wifiLeaseId", "lease_id", "lease-id", "leaseId", "lease", "id", "scope") || "").trim();
  const lease = state.leases.find((item) => item.wifi_lease_id === leaseId || item.scope === leaseId) || null;
  if (!lease) {
    return buildBlockedWifiReport("Wi-Fi lease not found.", "lease-release");
  }
  lease.status = "released";
  lease.released_at = now;
  lease.updated_at = now;
  state.updated_at = now;
  writeWifiLeasesState(state);
  recordWifiAuditEvent("wifi.lease.released", "wifi_lease", lease.wifi_lease_id, `Wi-Fi lease released: ${lease.wifi_lease_id}`, lease, appendAudit);
  return {
    report_type: "multi_ai_wifi_lease_released",
    generated_at: now,
    status: "ok",
    lease,
    next_action: "Create a new lease if the node should continue work."
  };
}

function evaluateWifiPolicy(flags = {}, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const context = readLocalProjectContext();
  const wifiNodeId = resolveWifiNodeId(flags);
  const governanceNodeId = resolveGovernanceNodeId(flags, wifiNodeId);
  const taskId = String(getFlag(flags, "task_id", "task-id", "taskId", "task", "active_task_id", "active-task-id", "activeTaskId") || "").trim() || null;
  const packetId = String(getFlag(flags, "packet_id", "packet-id", "packetId", "packet", "package_id", "package-id", "packageId") || "").trim() || null;
  const action = String(getFlag(flags, "action", "operation", "kind", "mode") || "edit").trim().toLowerCase();
  const pathValue = normalizePathValue(getFlag(flags, "path", "file", "folder", "scope", "target") || "");
  const branch = String(getFlag(flags, "branch") || "").trim() || null;
  const deviceId = String(getFlag(flags, "device_id", "device-id", "deviceId", "device") || "").trim() || null;
  const localService = String(getFlag(flags, "local_service", "local-service", "localService", "service") || "").trim() || null;
  const port = String(getFlag(flags, "port") || "").trim() || null;
  const trustRecord = findWifiTrustRecord(wifiNodeId);
  const token = resolveWifiTaskToken(flags, wifiNodeId);
  const lease = resolveWifiLease(flags, wifiNodeId);
  const localLease = findLocalLeaseConflict(pathValue, branch, taskId);
  const conflicts = detectWifiPolicyConflicts({
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    task_id: taskId,
    action,
    path: pathValue,
    branch,
    device_id: deviceId,
    local_service: localService,
    port,
    token,
    lease,
    localLease
  }, deps);

  let decision = "allow";
  let reason = "Valid Wi-Fi lease and no conflict detected.";
  let riskLevel = "low";
  let requiresOwnerApproval = false;
  let status = "ok";

  if (!trustRecord || trustRecord.trust_status !== "trusted") {
    decision = "block";
    reason = "Untrusted Wi-Fi node cannot perform governed work.";
    riskLevel = "high";
  } else if (!token) {
    decision = "warn";
    reason = "Ungoverned Wi-Fi packet or action: no active Wi-Fi task token was found.";
    riskLevel = "medium";
  } else if (token.expires_at && isExpired(token.expires_at)) {
    decision = "block";
    reason = `Expired Wi-Fi task token still in use: ${token.wifi_task_token_id}`;
    riskLevel = "high";
  } else if (lease && lease.expires_at && isExpired(lease.expires_at)) {
    decision = "block";
    reason = `Expired Wi-Fi lease still in use: ${lease.wifi_lease_id}`;
    riskLevel = "high";
  } else if (conflicts.some((item) => item.conflict_type === "denied_path" || item.conflict_type === "denied_action" || item.conflict_type === "local_lease_conflict" || item.conflict_type === "same_file" || item.conflict_type === "same_branch" || item.conflict_type === "device_conflict" || item.conflict_type === "service_conflict" || item.conflict_type === "port_conflict")) {
    decision = "block";
    reason = conflicts[0].summary || "Wi-Fi conflict detected.";
    riskLevel = "high";
  } else if (isHighRiskWifiPath(pathValue) || isHighRiskWifiAction(action)) {
    decision = "require_owner_approval";
    reason = `High-risk Wi-Fi/LAN action requires owner approval for ${pathValue || action}.`;
    riskLevel = "high";
    requiresOwnerApproval = true;
    status = "blocked";
  } else if (!lease || !lease.wifi_lease_id) {
    decision = "warn";
    reason = "Ungoverned Wi-Fi packet or action: no active Wi-Fi lease covers the requested scope.";
    riskLevel = "medium";
  }

  const evidenceId = `wifi-evidence-${String(readWifiPolicyDecisionsState().decisions.length + 1).padStart(3, "0")}`;
  const decisionId = `wifi-decision-${String(readWifiPolicyDecisionsState().decisions.length + 1).padStart(3, "0")}`;
  const record = {
    decision_id: decisionId,
    decision,
    reason,
    risk_level: riskLevel,
    requires_owner_approval: requiresOwnerApproval,
    machine_id: context.machine.machine_id,
    project_id: context.project.project_id,
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    task_id: taskId,
    wifi_task_token_id: token ? token.wifi_task_token_id : null,
    wifi_lease_id: lease ? lease.wifi_lease_id : null,
    packet_id: packetId,
    evidence_id: evidenceId,
    timestamp: now,
    status,
    action,
    path: pathValue,
    branch,
    service: localService,
    device_id: deviceId,
    port
  };

  const decisionsState = readWifiPolicyDecisionsState();
  decisionsState.decisions.push(record);
  decisionsState.updated_at = now;
  writeWifiPolicyDecisionsState(decisionsState);

  if (decision === "warn" && packetId) {
    const ungovernedState = readWifiUngovernedPacketsState();
    ungovernedState.packets.push({
      ungoverned_packet_id: `wifi-ungoverned-${String(unguardedCount(ungovernedState.packets) + 1).padStart(3, "0")}`,
      packet_id: packetId,
      project_id: context.project.project_id,
      wifi_node_id: wifiNodeId,
      governance_node_id: governanceNodeId,
      task_id: taskId,
      path: pathValue,
      action,
      reason,
      timestamp: now,
      status: "ungoverned"
    });
    ungovernedState.updated_at = now;
    writeWifiUngovernedPacketsState(ungovernedState);
  }

  if (requiresOwnerApproval) {
    const approvalState = readWifiApprovalRequestsState();
    const approval = {
      request_id: `wifi-approval-${String(approvalState.requests.length + 1).padStart(3, "0")}`,
      decision_id: decisionId,
      project_id: context.project.project_id,
      wifi_node_id: wifiNodeId,
      governance_node_id: governanceNodeId,
      task_id: taskId,
      packet_id: packetId,
      reason,
      status: "requested",
      requested_at: now,
      resolved_at: null,
      resolved_by: null,
      resolution: null
    };
    approvalState.requests.push(approval);
    approvalState.updated_at = now;
    writeWifiApprovalRequestsState(approvalState);
    recordWifiAuditEvent("wifi.approval.requested", "wifi_approval_request", approval.request_id, `Wi-Fi owner approval requested: ${approval.request_id}`, approval, appendAudit);
  }

  recordWifiEvidence({
    evidence_id: evidenceId,
    decision_id: decisionId,
    packet_id: packetId,
    project_id: context.project.project_id,
    wifi_node_id: wifiNodeId,
    governance_node_id: governanceNodeId,
    task_id: taskId,
    wifi_task_token_id: token ? token.wifi_task_token_id : null,
    wifi_lease_id: lease ? lease.wifi_lease_id : null,
    decision,
    reason,
    timestamp: now
  });

  recordWifiAuditEvent("wifi.policy.decision", "wifi_policy", decisionId, `Wi-Fi policy decision: ${decision}`, record, appendAudit);
  recordWifiConflicts(conflicts, appendAudit);

  return {
    report_type: "multi_ai_wifi_policy_decision",
    generated_at: now,
    ...record,
    conflicts,
    trust_record: trustRecord || null,
    token,
    lease,
    local_lease: localLease,
    status,
    next_action: getWifiPolicyNextAction(decision, requiresOwnerApproval, conflicts, token, lease)
  };
}

function buildWifiConflictsForPath(flags = {}, deps = {}) {
  return buildWifiConflictsReport(flags, deps);
}

function routePacketAction(action, value, flags = {}, rest = [], deps = {}) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "summary") {
    return buildWifiStatusReport(flags, deps);
  }
  if (normalized === "packet-create" || normalized === "packet_create" || normalized === "create") {
    return wifiPackets.buildWifiPacketCreateReport({
      packetType: flags.type || flags.packet_type || flags.packetType || flags.kind || null,
      queueId: flags.queue || flags.queue_id || rest[0] || null,
      flags,
      ...(deps.governanceState ? { governanceState: deps.governanceState } : {}),
      appendAudit: deps.appendAudit
    });
  }
  if (normalized === "packet-send" || normalized === "packet_send" || normalized === "send") {
    return wifiPackets.buildWifiPacketSendReport({
      packetId: flags.packet || flags.packet_id || flags.packetId || rest[0] || null,
      targetNodeId: flags.to || flags.node || flags.node_id || rest[1] || null,
      confirm: Boolean(flags.confirm),
      flags,
      wifiClient: resolveWifiClient(deps),
      ...(deps.governanceState ? { governanceState: deps.governanceState } : {}),
      appendAudit: deps.appendAudit
    });
  }
  if (normalized === "packet-inbox" || normalized === "packet_inbox" || normalized === "inbox") {
    return wifiPackets.buildWifiPacketInboxReport({
      packetState: wifiPackets.readPacketState(),
      wifiClient: resolveWifiClient(deps),
      ...(deps.governanceState ? { governanceState: deps.governanceState } : {})
    });
  }
  if (normalized === "packet-inspect" || normalized === "packet_inspect" || normalized === "inspect") {
    return wifiPackets.buildWifiPacketInspectReport({
      identifier: flags.package || flags.package_id || flags.packet || flags.packet_id || rest[0] || null,
      packetState: wifiPackets.readPacketState(),
      wifiClient: resolveWifiClient(deps),
      ...(deps.governanceState ? { governanceState: deps.governanceState } : {})
    });
  }
  if (normalized === "packet-consume" || normalized === "packet_consume" || normalized === "consume") {
    return wifiPackets.buildWifiPacketConsumeReport({
      identifier: flags.package || flags.package_id || flags.packet || flags.packet_id || rest[0] || null,
      confirm: Boolean(flags.confirm),
      decision: flags.decision || flags.decision_type || flags.result || rest[1] || null,
      reason: flags.reason || flags.note || rest.slice(2).join(" ") || null,
      decidedBy: flags.by || flags.decided_by || flags.approved_by || flags.actor || null,
      packetState: wifiPackets.ensurePacketState(),
      wifiClient: resolveWifiClient(deps),
      ...(deps.governanceState ? { governanceState: deps.governanceState } : {}),
      appendAudit: deps.appendAudit
    });
  }
  return buildBlockedWifiReport(`Unknown wifi packet action: ${normalized}`, {
    report_type: "multi_ai_wifi_packet_blocked",
    next_action: "Use `kvdf multi-ai wifi packet create|send|inbox|inspect|consume`."
  });
}

function buildWifiConflictsReport(flags = {}, deps = {}) {
  const state = readWifiConflictsState();
  const wifiNodeId = String(getFlag(flags, "wifi_node_id", "wifi-node-id", "wifiNodeId", "node", "id") || "").trim();
  const conflicts = wifiNodeId ? state.conflicts.filter((item) => item.wifi_node_id === wifiNodeId || item.governance_node_id === wifiNodeId) : state.conflicts;
  return {
    report_type: "multi_ai_wifi_conflicts",
    generated_at: new Date().toISOString(),
    status: "ok",
    conflicts,
    counts: {
      total: state.conflicts.length,
      open: state.conflicts.filter((item) => item.status !== "resolved").length,
      selected: conflicts.length
    },
    next_action: conflicts.length ? "Resolve the conflicts before the next Wi-Fi action." : "No Wi-Fi conflicts detected."
  };
}

function buildWifiLanPacketWorkflowReport() {
  return wifiPackets.buildWifiPacketWorkflowReport();
}

function buildWifiPacketWorkflowReport() {
  return wifiPackets.buildWifiPacketWorkflowReport();
}

function renderWifiLanReport(report) {
  if (!report || typeof report !== "object") return "Wi-Fi/LAN governance report unavailable.";
  if (report.report_type === "multi_ai_wifi_lan_status") {
    return [
      "Multi-AI Wi-Fi/LAN Governance",
      "",
      `Integration: ${report.integration && report.integration.available ? "available" : "unavailable"}`,
      `Nodes: ${report.counts.governance_nodes}`,
      `Trusted nodes: ${report.counts.trusted_nodes}`,
      `Pairing requests: ${report.counts.pairing_requests}`,
      `Tokens: ${report.counts.tokens}`,
      `Leases: ${report.counts.active_leases}`,
      `Conflicts: ${report.counts.open_conflicts}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_wifi_nodes") {
    const rows = (report.nodes || []).map((item) => [
      item.wifi_node_id,
      item.governance_node_id,
      item.node_type,
      item.trust_status,
      item.status
    ]);
    return table(["Wi-Fi Node", "Governance Node", "Type", "Trust", "Status"], rows);
  }
  if (report.report_type === "multi_ai_wifi_trust_status") {
    return table(["Wi-Fi Node", "Governance Node", "Trust", "Owner Approved", "Status"], (report.trust_records || []).map((item) => [
      item.wifi_node_id,
      item.governance_node_id,
      item.trust_status,
      item.owner_approved ? "yes" : "no",
      item.status
    ]));
  }
  if (report.report_type === "multi_ai_wifi_permissions") {
    return table(["Wi-Fi Node", "Governance Node", "Projects", "Allowed Capabilities", "Status"], (report.permissions || []).map((item) => [
      item.wifi_node_id,
      item.governance_node_id,
      (item.allowed_projects || []).join(", "),
      (item.allowed_capabilities || []).join(", "),
      item.status
    ]));
  }
  if (report.report_type === "multi_ai_wifi_pairing_requests") {
    return table(["Request", "Wi-Fi Node", "Trust", "Approval", "Status"], (report.requests || []).map((item) => [
      item.pairing_request_id,
      item.wifi_node_id,
      item.trust_status,
      item.approval_status,
      item.status || "active"
    ]));
  }
  if (report.report_type === "multi_ai_wifi_pairing_request" || report.report_type === "multi_ai_wifi_pairing_approved" || report.report_type === "multi_ai_wifi_pairing_denied" || report.report_type === "multi_ai_wifi_pairing_revoked") {
    return [
      "Multi-AI Wi-Fi Pairing",
      "",
      `Status: ${report.status}`,
      report.pairing_request ? `Node: ${report.pairing_request.wifi_node_id}` : report.revocation ? `Node: ${report.revocation.wifi_node_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_wifi_token_status") {
    return table(["Token", "Wi-Fi Node", "Task", "Risk", "Status"], (report.tokens || []).map((item) => [
      item.wifi_task_token_id,
      item.wifi_node_id,
      item.task_id,
      item.risk_level,
      item.status
    ]));
  }
  if (report.report_type === "multi_ai_wifi_task_token_issued") {
    return `Wi-Fi task token issued: ${report.wifi_task_token ? report.wifi_task_token.wifi_task_token_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_wifi_leases") {
    return table(["Lease", "Type", "Scope", "Branch", "Node", "Task", "Status"], (report.leases || []).map((item) => [
      item.wifi_lease_id,
      item.lease_type,
      item.scope || "",
      item.branch || "",
      item.wifi_node_id,
      item.task_id,
      item.status
    ]));
  }
  if (report.report_type === "multi_ai_wifi_lease_created" || report.report_type === "multi_ai_wifi_lease_blocked" || report.report_type === "multi_ai_wifi_lease_released") {
    return [
      "Multi-AI Wi-Fi Lease",
      "",
      `Status: ${report.status}`,
      report.lease ? `Lease: ${report.lease.wifi_lease_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_wifi_conflicts") {
    return table(["Conflict", "Type", "Scope", "Status"], (report.conflicts || []).map((item) => [
      item.conflict_id,
      item.conflict_type,
      item.scope || item.path || "",
      item.status || "open"
    ]));
  }
  if (report.report_type === "multi_ai_wifi_policy_decision") {
    return [
      "Multi-AI Wi-Fi Policy Decision",
      "",
      `Decision: ${report.decision}`,
      `Risk: ${report.risk_level}`,
      `Owner approval required: ${report.requires_owner_approval ? "yes" : "no"}`,
      report.reason ? `Reason: ${report.reason}` : null,
      report.path ? `Path: ${report.path}` : null,
      report.packet_id ? `Packet: ${report.packet_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type && report.report_type.startsWith("multi_ai_wifi_packet_")) {
    return wifiPackets.renderWifiPacketsReport(report);
  }
  return JSON.stringify(report, null, 2);
}

function resolveWifiClient(deps = {}) {
  if (deps && deps.wifiClient) return deps.wifiClient;
  return wifiClientModule;
}

function buildIntegrationStatus(wifiClient) {
  if (!wifiClient || typeof wifiClient.buildWifiDataSharingIntegrationStatus !== "function") {
    return {
      report_type: "multi_ai_wifi_data_sharing_integration",
      available: false,
      status: "unavailable",
      next_action: "Install or enable wifi_data_sharing to observe LAN peers."
    };
  }
  return wifiClient.buildWifiDataSharingIntegrationStatus();
}

function observeWifiNodes(wifiClient) {
  const provider = resolveWifiProvider(wifiClient);
  if (!provider) return [];
  const localNode = safeCall(() => (typeof provider.getLocalNode === "function" ? provider.getLocalNode() : null), null);
  const trustedNodes = safeCall(() => (typeof provider.listTrustedNodes === "function" ? provider.listTrustedNodes() : []), []);
  const candidates = safeCall(() => (typeof provider.listCandidates === "function" ? provider.listCandidates() : []), []);
  const nodes = [];
  if (localNode && localNode.node_id) {
    nodes.push({
      wifi_node_id: String(localNode.node_id),
      governance_node_id: `wifi-gov-${String(localNode.node_id)}`,
      machine_id: null,
      project_id: null,
      node_type: "owner_machine",
      hostname: localNode.hostname || localNode.display_name || null,
      local_ip: localNode.address || null,
      wifi_data_sharing_peer_id: localNode.peer_id || null,
      trust_status: "untrusted",
      owner_approved: false,
      paired_at: null,
      last_seen_at: new Date().toISOString(),
      status: "observed",
      capabilities: normalizeCapabilities(localNode.capabilities || ["read_project_state"]),
      observed_from: "wifi_data_sharing"
    });
  }
  for (const item of trustedNodes) {
    nodes.push({
      wifi_node_id: String(item.node_id || item.wifi_node_id || item.peer_id || "").trim(),
      governance_node_id: `wifi-gov-${String(item.node_id || item.wifi_node_id || item.peer_id || "node")}`,
      machine_id: null,
      project_id: null,
      node_type: normalizeNodeType(item.node_type || "unknown_node"),
      hostname: item.hostname || item.display_name || null,
      local_ip: item.address || null,
      wifi_data_sharing_peer_id: item.peer_id || null,
      trust_status: "untrusted",
      owner_approved: false,
      paired_at: null,
      last_seen_at: item.last_seen_at || new Date().toISOString(),
      status: item.status || "observed",
      capabilities: normalizeCapabilities(item.capabilities || [])
    });
  }
  for (const item of candidates) {
    nodes.push({
      wifi_node_id: String(item.node_id || item.wifi_node_id || item.peer_id || "").trim(),
      governance_node_id: `wifi-gov-${String(item.node_id || item.wifi_node_id || item.peer_id || "candidate")}`,
      machine_id: null,
      project_id: null,
      node_type: normalizeNodeType(item.node_type || "unknown_node"),
      hostname: item.hostname || item.display_name || null,
      local_ip: item.address || null,
      wifi_data_sharing_peer_id: item.peer_id || null,
      trust_status: "untrusted",
      owner_approved: false,
      paired_at: null,
      last_seen_at: item.last_seen_at || new Date().toISOString(),
      status: item.status || "observed",
      capabilities: normalizeCapabilities(item.capabilities || [])
    });
  }
  return dedupeNodes(nodes);
}

function resolveWifiProvider(wifiClient) {
  if (!wifiClient || typeof wifiClient.getWifiDataSharingProvider !== "function") return null;
  return wifiClient.getWifiDataSharingProvider();
}

function mergeObservedAndMappedNodes(mappedNodes, observedNodes) {
  const byId = new Map();
  for (const item of observedNodes || []) {
    if (!item || !item.wifi_node_id) continue;
    byId.set(item.wifi_node_id, { ...item });
  }
  for (const item of mappedNodes || []) {
    if (!item || !item.wifi_node_id) continue;
    const existing = byId.get(item.wifi_node_id) || {};
    byId.set(item.wifi_node_id, { ...existing, ...item });
  }
  return Array.from(byId.values());
}

function detectWifiLeaseConflicts(lease, deps = {}) {
  const state = readWifiLeasesState();
  const localLeases = localProjectGovernance.readLocalLeasesState ? localProjectGovernance.readLocalLeasesState().leases || [] : [];
  const conflicts = [];
  for (const existing of state.leases) {
    if (!existing || existing.status !== "active") continue;
    if (existing.wifi_node_id === lease.wifi_node_id && existing.lease_type === lease.lease_type && existing.scope === lease.scope && existing.task_id === lease.task_id) continue;
    if (lease.lease_type === "file" && (pathsOverlap(existing.scope, lease.scope) || arraysOverlap(existing.allowed_paths, lease.allowed_paths))) {
      conflicts.push(buildConflict("same_file", lease, existing, "Two Wi-Fi/LAN nodes are targeting the same file."));
    }
    if (lease.lease_type === "branch" && existing.branch && lease.branch && existing.branch === lease.branch && existing.task_id !== lease.task_id) {
      conflicts.push(buildConflict("same_branch", lease, existing, "The same branch is already leased for another task."));
    }
    if (lease.device_id && existing.device_id && lease.device_id === existing.device_id) {
      conflicts.push(buildConflict("device_conflict", lease, existing, "The device is already leased."));
    }
    if (lease.local_service && existing.local_service && lease.local_service === existing.local_service) {
      conflicts.push(buildConflict("service_conflict", lease, existing, "The local service is already leased."));
    }
    if (lease.port && existing.port && String(lease.port) === String(existing.port)) {
      conflicts.push(buildConflict("port_conflict", lease, existing, "The port is already leased."));
    }
  }
  for (const localLease of localLeases) {
    if (!localLease || localLease.status !== "active") continue;
    if (lease.lease_type === "file" && (pathsOverlap(localLease.scope, lease.scope) || arraysOverlap(localLease.allowed_paths, lease.allowed_paths))) {
      conflicts.push(buildConflict("local_lease_conflict", lease, localLease, "The same file is already leased by local project governance."));
    }
    if (lease.lease_type === "branch" && localLease.branch && lease.branch && localLease.branch === lease.branch && localLease.task_id !== lease.task_id) {
      conflicts.push(buildConflict("local_lease_conflict", lease, localLease, "The branch is already leased by local project governance."));
    }
  }
  return dedupeConflicts(conflicts);
}

function detectWifiPolicyConflicts(input = {}, deps = {}) {
  const conflicts = [];
  const { wifi_node_id, governance_node_id, task_id, action, path, branch, device_id, local_service, port, token, lease, localLease } = input;
  if (!token) {
    conflicts.push(buildPolicyConflict("missing_lease", input, null, "No active Wi-Fi task token covers the requested action."));
  }
  if (token && token.expires_at && isExpired(token.expires_at)) {
    conflicts.push(buildPolicyConflict("expired_token", input, token, "The Wi-Fi task token has expired."));
  }
  if (lease && lease.expires_at && isExpired(lease.expires_at)) {
    conflicts.push(buildPolicyConflict("expired_lease", input, lease, "The Wi-Fi lease has expired."));
  }
  if (path && token && arraysContainsDenied(token.denied_paths, path)) {
    conflicts.push(buildPolicyConflict("denied_path", input, token, `Denied path: ${path}`));
  }
  if (action && token && arraysContainsDenied(token.denied_actions, action)) {
    conflicts.push(buildPolicyConflict("denied_action", input, token, `Denied action: ${action}`));
  }
  if (device_id && token && token.denied_devices && token.denied_devices.includes(device_id)) {
    conflicts.push(buildPolicyConflict("denied_device", input, token, `Denied device: ${device_id}`));
  }
  if (local_service && token && token.denied_services && token.denied_services.includes(local_service)) {
    conflicts.push(buildPolicyConflict("denied_service", input, token, `Denied service: ${local_service}`));
  }
  if (port && token && token.denied_services && token.denied_services.includes(String(port))) {
    conflicts.push(buildPolicyConflict("denied_port", input, token, `Denied port: ${port}`));
  }
  if (lease && path && lease.lease_type === "file" && !pathCoveredByLease(lease, path)) {
    conflicts.push(buildPolicyConflict("missing_lease", input, lease, "The requested path is outside the active lease scope."));
  }
  if (localLease && path && !pathsOverlap(localLease.scope, path)) {
    conflicts.push(buildPolicyConflict("local_lease_conflict", input, localLease, "The requested path conflicts with a local project lease."));
  }
  if (trustRecordIsBlocked(wifi_node_id)) {
    conflicts.push(buildPolicyConflict("untrusted_node", input, null, "The Wi-Fi node is not trusted for governed work."));
  }
  return dedupeConflicts(conflicts);
}

function recordWifiConflicts(conflicts, appendAudit = null) {
  if (!Array.isArray(conflicts) || !conflicts.length) return [];
  const now = new Date().toISOString();
  const state = readWifiConflictsState();
  const appended = [];
  for (const conflict of conflicts) {
    const existing = state.conflicts.find((item) => item.conflict_key === conflict.conflict_key && item.status !== "resolved");
    if (existing) {
      appended.push(existing);
      continue;
    }
    const record = {
      conflict_id: nextId(state.conflicts, "wifi-conflict"),
      conflict_key: conflict.conflict_key,
      conflict_type: conflict.conflict_type,
      machine_id: conflict.machine_id || null,
      project_id: conflict.project_id || null,
      wifi_node_id: conflict.wifi_node_id || null,
      governance_node_id: conflict.governance_node_id || null,
      task_id: conflict.task_id || null,
      lease_id: conflict.lease_id || null,
      local_lease_id: conflict.local_lease_id || null,
      path: conflict.path || null,
      scope: conflict.scope || null,
      reason: conflict.reason || null,
      summary: conflict.summary || null,
      status: "open",
      detected_at: conflict.detected_at || now,
      resolved_at: null
    };
    state.conflicts.push(record);
    appended.push(record);
    recordWifiAuditEvent("wifi.conflict.detected", "wifi_conflict", record.conflict_id, record.summary || record.reason || "Wi-Fi conflict detected", record, appendAudit);
  }
  state.updated_at = now;
  writeWifiConflictsState(state);
  return appended;
}

function recordWifiEvidence(record) {
  const now = new Date().toISOString();
  const state = readWifiPacketEvidenceState();
  const evidence = { ...record, status: record.status || "recorded", created_at: record.timestamp || now, updated_at: now };
  state.records.push(evidence);
  state.updated_at = now;
  writeWifiPacketEvidenceState(state);
  return evidence;
}

function recordWifiAuditEvent(eventType, entityType, entityId, summary, metadata, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readWifiAuditLogState();
  const entry = {
    audit_id: nextId(state.records, "wifi-audit"),
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata: metadata || null,
    created_at: now
  };
  state.records.push(entry);
  state.updated_at = now;
  writeWifiAuditLogState(state);
  if (appendAudit) {
    appendAudit(eventType, entityType, entityId, summary, metadata);
  }
  return entry;
}

function resolveWifiTaskToken(flags = {}, wifiNodeId = null) {
  const state = readWifiTaskTokensState();
  const tokenId = String(getFlag(flags, "wifi_task_token_id", "wifi-task-token-id", "wifiTaskTokenId", "token_id", "token-id", "tokenId", "token") || "").trim();
  if (tokenId) {
    return state.tokens.find((item) => item.wifi_task_token_id === tokenId) || null;
  }
  return [...state.tokens].reverse().find((item) => {
    if (wifiNodeId && item.wifi_node_id !== wifiNodeId && item.governance_node_id !== wifiNodeId) return false;
    if (getFlag(flags, "task_id", "task-id", "taskId", "task") && item.task_id !== getFlag(flags, "task_id", "task-id", "taskId", "task")) return false;
    return item.status === "active";
  }) || null;
}

function resolveWifiLease(flags = {}, wifiNodeId = null) {
  const state = readWifiLeasesState();
  const leaseId = String(getFlag(flags, "wifi_lease_id", "wifi-lease-id", "wifiLeaseId", "lease_id", "lease-id", "leaseId", "lease") || "").trim();
  if (leaseId) {
    return state.leases.find((item) => item.wifi_lease_id === leaseId) || null;
  }
  const taskId = String(getFlag(flags, "task_id", "task-id", "taskId", "task") || "").trim();
  const pathValue = normalizePathValue(getFlag(flags, "path", "file", "folder", "scope") || "");
  const branch = String(getFlag(flags, "branch") || "").trim();
  const deviceId = String(getFlag(flags, "device_id", "device-id", "deviceId", "device") || "").trim();
  const localService = String(getFlag(flags, "local_service", "local-service", "localService", "service") || "").trim();
  const port = String(getFlag(flags, "port") || "").trim();
  return [...state.leases].reverse().find((item) => {
    if (wifiNodeId && item.wifi_node_id !== wifiNodeId && item.governance_node_id !== wifiNodeId) return false;
    if (taskId && item.task_id !== taskId) return false;
    if (pathValue && !pathsOverlap(item.scope, pathValue) && !arraysOverlap(item.allowed_paths, [pathValue])) return false;
    if (branch && item.branch && item.branch !== branch) return false;
    if (deviceId && item.device_id && item.device_id !== deviceId) return false;
    if (localService && item.local_service && item.local_service !== localService) return false;
    if (port && item.port && String(item.port) !== String(port)) return false;
    return item.status === "active";
  }) || null;
}

function resolveWifiNodeId(flags = {}) {
  const candidate = getFlag(flags,
    "wifi_node_id",
    "wifi-node-id",
    "wifiNodeId",
    "node",
    "id",
    "peer",
    "peer_id",
    "peer-id",
    "peerId",
    "node_id",
    "node-id",
    "nodeId",
    "wifi_peer_id",
    "wifi-peer-id",
    "wifiPeerId",
    "hostname",
    "host"
  ) || "";
  const resolved = String(candidate || "").trim();
  if (resolved) return resolved;
  const project = readLocalProjectContext().project;
  return project.project_id ? `wifi-${project.project_id}` : "wifi-node-unknown";
}

function resolveGovernanceNodeId(flags = {}, wifiNodeId = "") {
  const candidate = getFlag(flags, "governance_node_id", "governance-node-id", "governanceNodeId", "governance_id", "governance-id", "governanceId", "governance") || "";
  const resolved = String(candidate || "").trim();
  if (resolved) return resolved;
  return `wifi-gov-${String(wifiNodeId || "node").replace(/[^A-Za-z0-9_-]+/g, "-")}`;
}

function resolveProjectId(flags = {}, project = null) {
  return String(getFlag(flags, "project_id", "project-id", "projectId", "project") || (project && project.project_id) || "project-unknown").trim();
}

function resolveMachineId(flags = {}, machine = null) {
  return String(getFlag(flags, "machine_id", "machine-id", "machineId", "machine") || (machine && machine.machine_id) || `machine-${sanitizeId(repoRoot())}`).trim();
}

function readLocalProjectContext() {
  const project = localProjectGovernance.readLocalProjectState ? localProjectGovernance.readLocalProjectState() : {};
  const machine = localProjectGovernance.readLocalMachineState ? localProjectGovernance.readLocalMachineState() : {};
  return { project, machine };
}

function normalizeNodeType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return WIFI_NODE_TYPES.has(normalized) ? normalized : "unknown_node";
}

function normalizeTrustStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return WIFI_TRUST_STATUSES.has(normalized) ? normalized : "untrusted";
}

function normalizeLeaseType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return WIFI_LEASE_TYPES.has(normalized) ? normalized : "task";
}

function normalizeRiskLevel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["low", "medium", "high", "critical"].includes(normalized)) return normalized;
  return "medium";
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeCapabilities(value) {
  return normalizeList(value).map((item) => {
    const normalized = item.trim().toLowerCase();
    return WIFI_CAPABILITIES.has(normalized) ? normalized : item;
  });
}

function inferNodeCapabilities(flags = {}) {
  const role = String(getFlag(flags, "node_type", "node-type", "nodeType", "type", "role") || "").trim().toLowerCase();
  if (role === "owner_machine") return ["read_project_state", "receive_task_packet", "send_task_result", "run_tests", "run_build", "sync_files", "write_project_files"];
  if (role === "ai_runner" || role === "gpu_runner") return ["run_ai_model", "receive_task_packet", "send_task_result", "propose_patch"];
  if (role === "test_runner") return ["run_tests", "receive_task_packet", "send_task_result"];
  if (role === "build_runner") return ["run_build", "receive_task_packet", "send_task_result"];
  if (role === "browser_runner") return ["access_local_service", "receive_task_packet", "send_task_result"];
  return [];
}

function isHighRiskWifiPath(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return false;
  return [".kabeeri/", "owner_auth", "owner_docs_tokens", "owner_transfer_tokens", "tokens", "secrets", ".env", "credentials", "password", "private", "git/", ".git/"].some((token) => text.includes(token));
}

function isHighRiskWifiAction(action) {
  const text = String(action || "").trim().toLowerCase();
  return ["push_to_git", "modify_secrets", "write_project_files", "access_device"].includes(text);
}

function pathCoveredByLease(lease, value) {
  if (!lease) return false;
  const allowed = lease.allowed_paths && lease.allowed_paths.length ? lease.allowed_paths : [lease.scope].filter(Boolean);
  if (!allowed.length) return false;
  return allowed.some((candidate) => pathsOverlap(candidate, value));
}

function findLocalLeaseConflict(pathValue, branch, taskId) {
  const leases = localProjectGovernance.readLocalLeasesState ? localProjectGovernance.readLocalLeasesState().leases || [] : [];
  return [...leases].reverse().find((item) => {
    if (!item || item.status !== "active") return false;
    if (pathValue && !pathsOverlap(item.scope, pathValue) && !(item.allowed_paths || []).some((candidate) => pathsOverlap(candidate, pathValue))) return false;
    if (branch && item.branch && item.branch !== branch) return false;
    if (taskId && item.task_id && item.task_id !== taskId) return false;
    return true;
  }) || null;
}

function buildConflict(conflictType, lease, other, summary) {
  const now = new Date().toISOString();
  const scope = lease.scope || lease.path || null;
  return {
    conflict_key: [conflictType, lease.project_id || "", lease.task_id || "", lease.wifi_node_id || "", scope || "", other && (other.wifi_node_id || other.client_id || other.lease_id || other.scope || "")].join("|"),
    conflict_type: conflictType,
    project_id: lease.project_id || null,
    machine_id: null,
    wifi_node_id: lease.wifi_node_id || null,
    governance_node_id: lease.governance_node_id || null,
    task_id: lease.task_id || null,
    lease_id: lease.wifi_lease_id || null,
    local_lease_id: other && other.lease_id ? other.lease_id : null,
    path: lease.scope || null,
    scope,
    reason: summary,
    summary,
    detected_at: now,
    status: "open"
  };
}

function buildPolicyConflict(conflictType, input, other, summary) {
  return {
    conflict_key: [conflictType, input.project_id || "", input.task_id || "", input.wifi_node_id || "", input.path || input.branch || input.device_id || input.local_service || input.port || "", other && (other.wifi_task_token_id || other.wifi_lease_id || other.scope || other.task_id || "")].join("|"),
    conflict_type: conflictType,
    project_id: input.project_id || null,
    wifi_node_id: input.wifi_node_id || null,
    governance_node_id: input.governance_node_id || null,
    task_id: input.task_id || null,
    path: input.path || null,
    scope: input.path || input.branch || input.device_id || input.local_service || input.port || null,
    lease_id: input.lease ? input.lease.wifi_lease_id : null,
    local_lease_id: input.localLease ? input.localLease.lease_id : null,
    reason: summary,
    summary,
    detected_at: new Date().toISOString(),
    status: "open"
  };
}

function getWifiPolicyNextAction(decision, requiresOwnerApproval, conflicts, token, lease) {
  if (decision === "allow") return "The Wi-Fi action is allowed. Continue within the active lease.";
  if (decision === "warn") return "Proceed carefully and refresh the Wi-Fi lease before the next action.";
  if (decision === "require_owner_approval") return "Request owner approval before continuing the Wi-Fi action.";
  if (conflicts && conflicts.length) return "Resolve the Wi-Fi conflict before continuing.";
  if (token && token.expires_at && isExpired(token.expires_at)) return "Issue a new Wi-Fi task token.";
  if (lease && lease.expires_at && isExpired(lease.expires_at)) return "Create a fresh Wi-Fi lease.";
  if (requiresOwnerApproval) return "Owner approval is required for this Wi-Fi action.";
  return "Resolve the policy blocker before continuing.";
}

function arraysOverlap(left = [], right = []) {
  const a = normalizeList(left).map((item) => item.toLowerCase());
  const b = normalizeList(right).map((item) => item.toLowerCase());
  return a.some((item) => b.includes(item));
}

function arraysContainsDenied(values = [], candidate = "") {
  const normalized = String(candidate || "").trim().toLowerCase();
  return normalizeList(values).map((item) => item.toLowerCase()).includes(normalized);
}

function pathsOverlap(left, right) {
  const a = normalizePathValue(left);
  const b = normalizePathValue(right);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function normalizePathValue(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase();
}

function sanitizeId(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "-")
    .replace(/\//g, "-")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "root";
}

function normalizeAction(value, flags = {}) {
  return String(value || flags.action || flags.cmd || "").trim().toLowerCase();
}

function normalizeNestedAction(value, flags = {}) {
  return normalizeAction(value || flags.subaction || flags.action || flags.cmd || "");
}

function isTruthyFlag(value) {
  return value === true || value === "true" || value === "1" || value === "yes" || value === "on";
}

function getFlag(flags = {}, ...names) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(flags, name) && flags[name] !== undefined && flags[name] !== null) {
      return flags[name];
    }
    const underscored = String(name).replace(/-/g, "_");
    if (Object.prototype.hasOwnProperty.call(flags, underscored) && flags[underscored] !== undefined && flags[underscored] !== null) {
      return flags[underscored];
    }
    const camel = String(name).replace(/[-_]+([a-z])/g, (_, letter) => letter.toUpperCase());
    if (Object.prototype.hasOwnProperty.call(flags, camel) && flags[camel] !== undefined && flags[camel] !== null) {
      return flags[camel];
    }
  }
  return undefined;
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    return fallback;
  }
}

function dedupeNodes(nodes) {
  const byId = new Map();
  for (const node of nodes || []) {
    if (!node || !node.wifi_node_id) continue;
    byId.set(node.wifi_node_id, { ...byId.get(node.wifi_node_id), ...node });
  }
  return Array.from(byId.values());
}

function dedupeConflicts(conflicts) {
  const byKey = new Map();
  for (const conflict of conflicts || []) {
    if (!conflict || !conflict.conflict_key) continue;
    byKey.set(conflict.conflict_key, { ...byKey.get(conflict.conflict_key), ...conflict });
  }
  return Array.from(byKey.values());
}

function upsertById(items, item, key) {
  const next = Array.isArray(items) ? items : [];
  const index = next.findIndex((entry) => entry && item && entry[key] === item[key]);
  if (index >= 0) {
    next[index] = { ...next[index], ...item };
  } else {
    next.push(item);
  }
  return next;
}

function nextId(items, prefix) {
  const count = Array.isArray(items) ? items.length + 1 : 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

function findLatestByNode(items = [], wifiNodeId = "") {
  return [...items].reverse().find((item) => item && (item.wifi_node_id === wifiNodeId || item.governance_node_id === wifiNodeId)) || null;
}

function findWifiTrustRecord(wifiNodeId) {
  const state = readWifiTrustState();
  return findLatestByNode(state.trust_records, wifiNodeId);
}

function trustRecordIsBlocked(wifiNodeId) {
  const record = findWifiTrustRecord(wifiNodeId);
  return !record || record.trust_status !== "trusted";
}

function unguardedCount(items = []) {
  return Array.isArray(items) ? items.length : 0;
}

function buildBlockedWifiReport(message, action) {
  return {
    report_type: "multi_ai_wifi_blocked",
    generated_at: new Date().toISOString(),
    status: "blocked",
    action: action || null,
    next_action: message
  };
}

function ensureState(file, defaults) {
  const fullPath = path.join(repoRoot(), file);
  if (!fs.existsSync(fullPath)) {
    writeJsonFile(file, defaults);
  }
  return readJsonFile(file, defaults);
}

function readWifiNodesState() {
  return ensureState(WIFI_NODES_FILE, defaultWifiNodesState());
}

function writeWifiNodesState(state) {
  return writeJsonFile(WIFI_NODES_FILE, normalizeState(state, defaultWifiNodesState(), "nodes"));
}

function readWifiNodeIdentityMapState() {
  return ensureState(WIFI_NODE_IDENTITY_MAP_FILE, defaultWifiNodeIdentityMapState());
}

function writeWifiNodeIdentityMapState(state) {
  return writeJsonFile(WIFI_NODE_IDENTITY_MAP_FILE, normalizeState(state, defaultWifiNodeIdentityMapState(), "mappings"));
}

function readWifiTrustState() {
  return ensureState(WIFI_TRUST_FILE, defaultWifiTrustState());
}

function writeWifiTrustState(state) {
  return writeJsonFile(WIFI_TRUST_FILE, normalizeState(state, defaultWifiTrustState(), "trust_records"));
}

function upsertWifiTrustRecord(record) {
  const now = new Date().toISOString();
  const state = readWifiTrustState();
  upsertById(state.trust_records, {
    trust_record_id: nextId(state.trust_records, "wifi-trust"),
    ...record,
    updated_at: now
  }, "wifi_node_id");
  state.updated_at = now;
  writeWifiTrustState(state);
  return record;
}

function readWifiPairingRequestsState() {
  return ensureState(WIFI_PAIRING_REQUESTS_FILE, defaultWifiPairingRequestsState());
}

function writeWifiPairingRequestsState(state) {
  return writeJsonFile(WIFI_PAIRING_REQUESTS_FILE, normalizeState(state, defaultWifiPairingRequestsState(), "requests"));
}

function readWifiPermissionsState() {
  return ensureState(WIFI_PERMISSIONS_FILE, defaultWifiPermissionsState());
}

function writeWifiPermissionsState(state) {
  return writeJsonFile(WIFI_PERMISSIONS_FILE, normalizeState(state, defaultWifiPermissionsState(), "permissions"));
}

function readWifiRevocationsState() {
  return ensureState(WIFI_REVOCATIONS_FILE, defaultWifiRevocationsState());
}

function writeWifiRevocationsState(state) {
  return writeJsonFile(WIFI_REVOCATIONS_FILE, normalizeState(state, defaultWifiRevocationsState(), "revocations"));
}

function readWifiTaskTokensState() {
  return ensureState(WIFI_TASK_TOKENS_FILE, defaultWifiTaskTokensState());
}

function writeWifiTaskTokensState(state) {
  return writeJsonFile(WIFI_TASK_TOKENS_FILE, normalizeState(state, defaultWifiTaskTokensState(), "tokens"));
}

function readWifiLeasesState() {
  return ensureState(WIFI_LEASES_FILE, defaultWifiLeasesState());
}

function writeWifiLeasesState(state) {
  return writeJsonFile(WIFI_LEASES_FILE, normalizeState(state, defaultWifiLeasesState(), "leases"));
}

function readWifiConflictsState() {
  return ensureState(WIFI_CONFLICTS_FILE, defaultWifiConflictsState());
}

function writeWifiConflictsState(state) {
  return writeJsonFile(WIFI_CONFLICTS_FILE, normalizeState(state, defaultWifiConflictsState(), "conflicts"));
}

function readWifiUngovernedPacketsState() {
  return ensureState(WIFI_UNGOVERNED_PACKETS_FILE, defaultWifiUngovernedPacketsState());
}

function writeWifiUngovernedPacketsState(state) {
  return writeJsonFile(WIFI_UNGOVERNED_PACKETS_FILE, normalizeState(state, defaultWifiUngovernedPacketsState(), "packets"));
}

function readWifiPolicyDecisionsState() {
  return ensureState(WIFI_POLICY_DECISIONS_FILE, defaultWifiPolicyDecisionsState());
}

function writeWifiPolicyDecisionsState(state) {
  return writeJsonFile(WIFI_POLICY_DECISIONS_FILE, normalizeState(state, defaultWifiPolicyDecisionsState(), "decisions"));
}

function readWifiApprovalRequestsState() {
  return ensureState(WIFI_APPROVAL_REQUESTS_FILE, defaultWifiApprovalRequestsState());
}

function writeWifiApprovalRequestsState(state) {
  return writeJsonFile(WIFI_APPROVAL_REQUESTS_FILE, normalizeState(state, defaultWifiApprovalRequestsState(), "requests"));
}

function readWifiAuditLogState() {
  return ensureState(WIFI_AUDIT_LOG_FILE, defaultWifiAuditLogState());
}

function writeWifiAuditLogState(state) {
  return writeJsonFile(WIFI_AUDIT_LOG_FILE, normalizeState(state, defaultWifiAuditLogState(), "records"));
}

function readWifiPacketEvidenceState() {
  return ensureState(WIFI_PACKET_EVIDENCE_FILE, defaultWifiPacketEvidenceState());
}

function writeWifiPacketEvidenceState(state) {
  return writeJsonFile(WIFI_PACKET_EVIDENCE_FILE, normalizeState(state, defaultWifiPacketEvidenceState(), "records"));
}

function defaultWifiNodesState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, nodes: [] };
}

function defaultWifiNodeIdentityMapState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, mappings: [] };
}

function defaultWifiTrustState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, trust_records: [] };
}

function defaultWifiPairingRequestsState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, requests: [] };
}

function defaultWifiPermissionsState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, permissions: [] };
}

function defaultWifiRevocationsState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, revocations: [] };
}

function defaultWifiTaskTokensState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, tokens: [] };
}

function defaultWifiLeasesState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, leases: [] };
}

function defaultWifiConflictsState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, conflicts: [] };
}

function defaultWifiUngovernedPacketsState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, packets: [] };
}

function defaultWifiPolicyDecisionsState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, decisions: [] };
}

function defaultWifiApprovalRequestsState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, requests: [] };
}

function defaultWifiAuditLogState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, records: [] };
}

function defaultWifiPacketEvidenceState() {
  return { version: "v1", plugin_id: "multi_ai_governance", created_at: null, updated_at: null, records: [] };
}

function normalizeState(state, defaults, arrayKey) {
  const now = new Date().toISOString();
  const next = { ...defaults, ...(state || {}) };
  next[arrayKey] = Array.isArray(state && state[arrayKey]) ? state[arrayKey] : [];
  next.created_at = next.created_at || now;
  next.updated_at = now;
  return next;
}

module.exports = {
  multiAiWifiGovernance,
  buildWifiStatusReport,
  buildWifiNodesReport,
  mapWifiNode,
  buildWifiTrustStatusReport,
  buildWifiPermissionsReport,
  buildWifiPairingRequestsReport,
  requestWifiPairing,
  approveWifiPairing,
  denyWifiPairing,
  revokeWifiPairing,
  buildWifiTokenStatusReport,
  issueWifiTaskToken,
  buildWifiLeaseReport,
  createWifiLease,
  releaseWifiLease,
  buildWifiConflictsReport,
  evaluateWifiPolicy,
  buildWifiLanPacketWorkflowReport,
  buildWifiPacketWorkflowReport,
  renderWifiLanReport,
  readWifiNodesState,
  writeWifiNodesState,
  readWifiNodeIdentityMapState,
  writeWifiNodeIdentityMapState,
  readWifiTrustState,
  writeWifiTrustState,
  readWifiPairingRequestsState,
  writeWifiPairingRequestsState,
  readWifiPermissionsState,
  writeWifiPermissionsState,
  readWifiRevocationsState,
  writeWifiRevocationsState,
  readWifiTaskTokensState,
  writeWifiTaskTokensState,
  readWifiLeasesState,
  writeWifiLeasesState,
  readWifiConflictsState,
  writeWifiConflictsState,
  readWifiUngovernedPacketsState,
  writeWifiUngovernedPacketsState,
  readWifiPolicyDecisionsState,
  writeWifiPolicyDecisionsState,
  readWifiApprovalRequestsState,
  writeWifiApprovalRequestsState,
  readWifiAuditLogState,
  writeWifiAuditLogState,
  readWifiPacketEvidenceState,
  writeWifiPacketEvidenceState,
  defaultWifiNodesState,
  defaultWifiNodeIdentityMapState,
  defaultWifiTrustState,
  defaultWifiPairingRequestsState,
  defaultWifiPermissionsState,
  defaultWifiRevocationsState,
  defaultWifiTaskTokensState,
  defaultWifiLeasesState,
  defaultWifiConflictsState,
  defaultWifiUngovernedPacketsState,
  defaultWifiPolicyDecisionsState,
  defaultWifiApprovalRequestsState,
  defaultWifiAuditLogState,
  defaultWifiPacketEvidenceState
};
