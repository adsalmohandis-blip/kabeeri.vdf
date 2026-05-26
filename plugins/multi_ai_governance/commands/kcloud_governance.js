const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot, fileExists } = require("../../../src/cli/fs_utils");
const { table } = require("../../../src/cli/ui");
const { isExpired } = require("../../../src/cli/services/collections");
const localGovernance = require("./local_project_governance");
const wifiGovernance = require("./wifi_lan_governance");

const KCLOUD_STATE_DIR = ".kabeeri/multi_ai_governance";
const KCLOUD_NODES_FILE = `${KCLOUD_STATE_DIR}/kcloud_nodes.json`;
const KCLOUD_IDENTITY_MAP_FILE = `${KCLOUD_STATE_DIR}/kcloud_identity_map.json`;
const KCLOUD_TRUST_FILE = `${KCLOUD_STATE_DIR}/kcloud_trust.json`;
const KCLOUD_PROJECT_MAP_FILE = `${KCLOUD_STATE_DIR}/kcloud_project_map.json`;
const KCLOUD_PERMISSIONS_FILE = `${KCLOUD_STATE_DIR}/kcloud_permissions.json`;
const KCLOUD_TASK_TOKENS_FILE = `${KCLOUD_STATE_DIR}/kcloud_task_tokens.json`;
const KCLOUD_APPROVAL_RULES_FILE = `${KCLOUD_STATE_DIR}/kcloud_approval_rules.json`;
const KCLOUD_LEASES_FILE = `${KCLOUD_STATE_DIR}/kcloud_leases.json`;
const KCLOUD_CONFLICTS_FILE = `${KCLOUD_STATE_DIR}/kcloud_conflicts.json`;
const KCLOUD_UNGOVERNED_PACKETS_FILE = `${KCLOUD_STATE_DIR}/kcloud_ungoverned_packets.json`;
const KCLOUD_PACKET_EVIDENCE_FILE = `${KCLOUD_STATE_DIR}/kcloud_packet_evidence.json`;
const KCLOUD_POLICY_DECISIONS_FILE = `${KCLOUD_STATE_DIR}/kcloud_policy_decisions.json`;
const KCLOUD_APPROVAL_REQUESTS_FILE = `${KCLOUD_STATE_DIR}/kcloud_approval_requests.json`;
const KCLOUD_AUDIT_LOG_FILE = `${KCLOUD_STATE_DIR}/kcloud_audit_log.json`;
const KCLOUD_EVIDENCE_FILE = `${KCLOUD_STATE_DIR}/kcloud_evidence.json`;

const KCLOUD_NODE_TYPES = new Set([
  "owner_machine",
  "developer_machine",
  "cloud_runner",
  "cloud_ai_agent",
  "cloud_sync_client",
  "cloud_task_worker",
  "cloud_test_runner",
  "cloud_build_runner",
  "cloud_review_agent",
  "client_portal_user",
  "agency_admin",
  "external_contributor",
  "unknown_cloud_node"
]);

const KCLOUD_RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);
const KCLOUD_LEASE_TYPES = new Set(["task", "file", "folder", "branch", "runner", "cloud_channel", "cloud_sync", "approval_flow", "release_gate"]);
let kcloudRuntimeCounter = 0;

function multiAiKcloudGovernance(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const subaction = normalizeAction(value, flags);
  const appendAudit = typeof deps.appendAudit === "function" ? deps.appendAudit : null;

  if (!action || action === "status" || action === "summary") {
    return buildKcloudStatusReport(flags);
  }
  if (subaction === "status" || subaction === "show" || subaction === "summary") {
    return buildKcloudStatusReport(flags);
  }
  if (subaction === "nodes") {
    return buildKcloudNodesReport(flags);
  }
  if (subaction === "map-node" || subaction === "map_node" || subaction === "map") {
    return mapKcloudNode(flags, appendAudit);
  }
  if (subaction === "map-project" || subaction === "map_project" || subaction === "project") {
    return mapKcloudProject(flags, appendAudit);
  }
  if (subaction === "trust") {
    const nested = normalizeAction(rest[0], flags);
    if (!nested || nested === "status" || nested === "show" || nested === "list") {
      return buildKcloudTrustStatusReport(flags);
    }
  }
  if (subaction === "permissions") {
    return handlePermissionsAction(normalizeAction(rest[0], flags), flags, appendAudit);
  }
  if (subaction === "token") {
    return handleTokenAction(normalizeAction(rest[0], flags), flags, appendAudit);
  }
  if (subaction === "approval") {
    const nested = normalizeAction(rest[0], flags);
    if (!nested || nested === "status" || nested === "show" || nested === "list") {
      return buildKcloudApprovalStatusReport(flags);
    }
  }
  if (subaction === "lease") {
    return handleLeaseAction(normalizeAction(rest[0], flags), flags, appendAudit);
  }
  if (subaction === "release") {
    return releaseKcloudLease(flags, appendAudit);
  }
  if (subaction === "conflicts") {
    return buildKcloudConflictsReport(flags);
  }
  if (subaction === "packet") {
    return checkKcloudPacket(flags, appendAudit);
  }
  if (subaction === "packet-check" || subaction === "packet_check" || subaction === "check") {
    return checkKcloudPacket(flags, appendAudit);
  }
  if (subaction === "policy" || subaction === "policy-check" || subaction === "policy_check" || subaction === "evaluate") {
    return evaluateKcloudPolicy(flags, appendAudit);
  }
  if (subaction === "audit") {
    return buildKcloudAuditReport(flags);
  }
  if (subaction === "evidence") {
    return buildKcloudEvidenceReport(flags);
  }

  throw new Error(`Unknown kcloud governance action: ${action}${subaction ? ` ${subaction}` : ""}`);
}

function buildKcloudStatusReport(flags = {}) {
  const nodesState = readKcloudNodesState();
  const identityMapState = readKcloudIdentityMapState();
  const trustState = readKcloudTrustState();
  const projectMapState = readKcloudProjectMapState();
  const permissionsState = readKcloudPermissionsState();
  const tokenState = readKcloudTaskTokensState();
  const leasesState = readKcloudLeasesState();
  const conflictsState = readKcloudConflictsState();
  const policyState = readKcloudPolicyDecisionsState();
  return {
    report_type: "multi_ai_kcloud_status",
    generated_at: new Date().toISOString(),
    status: "available",
    integration: {
      plugin_id: "kcloud_data_sharing",
      available: false,
      status: "not_installed",
      note: "KCloud governance is local to multi_ai_governance until a separate transport layer is available."
    },
    counts: {
      nodes: nodesState.nodes.length,
      mapped_nodes: identityMapState.mappings.length,
      trusted_nodes: trustState.trust_records.filter((item) => item.trust_status === "trusted").length,
      projects: projectMapState.project_mappings.length,
      permissions: permissionsState.permissions.length,
      tokens: tokenState.tokens.length,
      active_leases: leasesState.leases.filter((item) => item.status === "active").length,
      open_conflicts: conflictsState.conflicts.filter((item) => item.status !== "resolved").length,
      policy_decisions: policyState.decisions.length
    },
    next_action: "Use `kvdf multi-ai kcloud map-node`, `kvdf multi-ai kcloud map-project`, or `kvdf multi-ai kcloud policy check`."
  };
}

function buildKcloudNodesReport(flags = {}) {
  const state = readKcloudNodesState();
  const nodeId = getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id");
  const nodes = nodeId ? state.nodes.filter((item) => item.kcloud_node_id === nodeId || item.governance_cloud_node_id === nodeId) : state.nodes;
  return {
    report_type: "multi_ai_kcloud_nodes",
    generated_at: new Date().toISOString(),
    status: "ok",
    nodes,
    counts: {
      total: state.nodes.length,
      selected: nodes.length,
      trusted: state.nodes.filter((item) => item.trust_status === "trusted").length
    }
  };
}

function mapKcloudNode(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const localProject = readLocalProjectContext();
  const nodesState = readKcloudNodesState();
  const identityState = readKcloudIdentityMapState();
  const trustState = readKcloudTrustState();
  const record = {
    kcloud_node_id: resolveKcloudNodeId(flags),
    governance_cloud_node_id: resolveGovernanceCloudNodeId(flags),
    tenant_id: getFlag(flags, "tenant_id", "tenant-id", "tenantId") || localProject.project.project_id || "tenant-001",
    organization_id: getFlag(flags, "organization_id", "organization-id", "organizationId") || null,
    project_id: getFlag(flags, "project_id", "project-id", "projectId") || localProject.project.project_id || null,
    cloud_project_id: getFlag(flags, "cloud_project_id", "cloud-project-id", "cloudProjectId") || getFlag(flags, "project_id", "project-id", "projectId") || null,
    machine_id: getFlag(flags, "machine_id", "machine-id", "machineId") || localProject.machine.machine_id || null,
    local_project_id: getFlag(flags, "local_project_id", "local-project-id", "localProjectId") || localProject.project.project_id || null,
    owner_id: getFlag(flags, "owner_id", "owner-id", "ownerId", "owner") || localProject.project.owner_id || null,
    user_id: getFlag(flags, "user_id", "user-id", "userId", "user") || null,
    role_id: getFlag(flags, "role_id", "role-id", "roleId", "role") || null,
    kcloud_peer_id: getFlag(flags, "kcloud_peer_id", "kcloud-peer-id", "kcloudPeerId", "peer", "peer_id") || null,
    trust_status: normalizeTrustStatus(getFlag(flags, "trust_status", "trust-status", "trustStatus", "trust") || "untrusted"),
    owner_approved: isTruthyFlag(getFlag(flags, "owner_approved", "owner-approved", "ownerApproved", "approved", "confirm")),
    last_synced_at: now,
    status: getFlag(flags, "status") || "active",
    capabilities: normalizeList(getFlag(flags, "capabilities") || []),
    node_type: normalizeNodeType(getFlag(flags, "node_type", "node-type", "nodeType", "type") || "unknown_cloud_node")
  };
  upsertById(nodesState.nodes, record, "kcloud_node_id");
  nodesState.updated_at = now;
  writeKcloudNodesState(nodesState);
  upsertById(identityState.mappings, {
    kcloud_node_id: record.kcloud_node_id,
    governance_cloud_node_id: record.governance_cloud_node_id,
    tenant_id: record.tenant_id,
    organization_id: record.organization_id,
    project_id: record.project_id,
    cloud_project_id: record.cloud_project_id,
    machine_id: record.machine_id,
    local_project_id: record.local_project_id,
    owner_id: record.owner_id,
    user_id: record.user_id,
    role_id: record.role_id,
    kcloud_peer_id: record.kcloud_peer_id,
    trust_status: record.trust_status,
    owner_approved: record.owner_approved,
    last_synced_at: now,
    status: record.status,
    capabilities: record.capabilities
  }, "kcloud_node_id");
  identityState.updated_at = now;
  writeKcloudIdentityMapState(identityState);
  upsertById(trustState.trust_records, {
    kcloud_trust_id: nextId(trustState.trust_records, "kcloud-trust"),
    kcloud_node_id: record.kcloud_node_id,
    governance_cloud_node_id: record.governance_cloud_node_id,
    tenant_id: record.tenant_id,
    project_id: record.project_id,
    trust_status: record.trust_status,
    owner_approved: record.owner_approved,
    last_synced_at: now,
    status: record.status,
    capabilities: record.capabilities
  }, "kcloud_node_id");
  trustState.updated_at = now;
  writeKcloudTrustState(trustState);
  recordKcloudAudit("kcloud.node.mapped", "kcloud_node", record.kcloud_node_id, `Mapped cloud node ${record.kcloud_node_id}`, record, appendAudit);
  return {
    report_type: "multi_ai_kcloud_node_mapped",
    generated_at: now,
    status: "ok",
    kcloud_node: record,
    next_action: record.trust_status === "trusted"
      ? "Issue a cloud task token with `kvdf multi-ai kcloud token issue`."
      : "Request owner approval before issuing cloud permissions."
  };
}

function mapKcloudProject(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const localProject = readLocalProjectContext();
  const projectState = readKcloudProjectMapState();
  const mapping = {
    cloud_project_id: getFlag(flags, "cloud_project_id", "cloud-project-id", "cloudProjectId", "project") || nextId(projectState.project_mappings, "cloud-project"),
    project_id: getFlag(flags, "project_id", "project-id", "projectId") || localProject.project.project_id || null,
    local_project_id: getFlag(flags, "local_project_id", "local-project-id", "localProjectId") || localProject.project.project_id || null,
    tenant_id: getFlag(flags, "tenant_id", "tenant-id", "tenantId") || localProject.project.project_id || "tenant-001",
    organization_id: getFlag(flags, "organization_id", "organization-id", "organizationId") || null,
    owner_id: getFlag(flags, "owner_id", "owner-id", "ownerId", "owner") || localProject.project.owner_id || null,
    user_id: getFlag(flags, "user_id", "user-id", "userId", "user") || null,
    role_id: getFlag(flags, "role_id", "role-id", "roleId", "role") || null,
    repo_root: localProject.project.repo_root || repoRoot(),
    last_synced_at: now,
    status: getFlag(flags, "status") || "active"
  };
  upsertById(projectState.project_mappings, mapping, "cloud_project_id");
  projectState.updated_at = now;
  writeKcloudProjectMapState(projectState);
  recordKcloudAudit("kcloud.project.mapped", "kcloud_project", mapping.cloud_project_id, `Mapped cloud project ${mapping.cloud_project_id}`, mapping, appendAudit);
  return {
    report_type: "multi_ai_kcloud_project_mapped",
    generated_at: now,
    status: "ok",
    mapping,
    next_action: "Use `kvdf multi-ai kcloud status` or `kvdf multi-ai kcloud policy check`."
  };
}

function buildKcloudTrustStatusReport(flags = {}) {
  const state = readKcloudTrustState();
  const nodeId = getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id");
  const trust_records = nodeId ? state.trust_records.filter((item) => item.kcloud_node_id === nodeId || item.governance_cloud_node_id === nodeId) : state.trust_records;
  return {
    report_type: "multi_ai_kcloud_trust_status",
    generated_at: new Date().toISOString(),
    status: "ok",
    trust_records,
    counts: {
      total: state.trust_records.length,
      trusted: state.trust_records.filter((item) => item.trust_status === "trusted").length,
      blocked: state.trust_records.filter((item) => item.trust_status === "blocked").length
    }
  };
}

function buildKcloudPermissionsReport(flags = {}) {
  const state = readKcloudPermissionsState();
  const nodeId = getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id");
  const permissions = nodeId ? state.permissions.filter((item) => item.kcloud_node_id === nodeId) : state.permissions;
  return {
    report_type: "multi_ai_kcloud_permissions",
    generated_at: new Date().toISOString(),
    status: "ok",
    permissions,
    counts: {
      total: state.permissions.length,
      selected: permissions.length
    }
  };
}

function handlePermissionsAction(action, flags = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "show" || normalized === "list") {
    return buildKcloudPermissionsReport(flags);
  }
  if (normalized === "grant" || normalized === "create" || normalized === "add") {
    return grantKcloudPermission(flags, appendAudit);
  }
  if (normalized === "deny" || normalized === "revoke" || normalized === "remove") {
    return revokeKcloudPermission(flags, appendAudit);
  }
  throw new Error(`Unknown kcloud permissions action: ${normalized}`);
}

function grantKcloudPermission(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readKcloudPermissionsState();
  const permission = {
    kcloud_permission_id: nextId(state.permissions, "kcloud-permission"),
    tenant_id: getFlag(flags, "tenant_id", "tenant-id", "tenantId") || null,
    organization_id: getFlag(flags, "organization_id", "organization-id", "organizationId") || null,
    project_id: getFlag(flags, "project_id", "project-id", "projectId") || null,
    cloud_project_id: getFlag(flags, "cloud_project_id", "cloud-project-id", "cloudProjectId") || null,
    kcloud_node_id: getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id") || null,
    user_id: getFlag(flags, "user_id", "user-id", "userId", "user") || null,
    role_id: getFlag(flags, "role_id", "role-id", "roleId", "role") || null,
    task_id: getFlag(flags, "task_id", "task-id", "taskId", "task") || null,
    allowed_actions: normalizeList(getFlag(flags, "allowed_actions", "allowed-actions", "allowedActions") || []),
    denied_actions: normalizeList(getFlag(flags, "denied_actions", "denied-actions", "deniedActions") || []),
    allowed_paths: normalizeList(getFlag(flags, "allowed_paths", "allowed-paths", "allowedPaths") || []),
    denied_paths: normalizeList(getFlag(flags, "denied_paths", "denied-paths", "deniedPaths") || []),
    allowed_cloud_channels: normalizeList(getFlag(flags, "allowed_cloud_channels", "allowed-cloud-channels", "allowedCloudChannels") || []),
    denied_cloud_channels: normalizeList(getFlag(flags, "denied_cloud_channels", "denied-cloud-channels", "deniedCloudChannels") || []),
    risk_level: normalizeRiskLevel(getFlag(flags, "risk_level", "risk-level", "riskLevel") || "medium"),
    approval_required: isTruthyFlag(getFlag(flags, "approval_required", "approval-required", "approvalRequired", "require_approval", "require-approval")),
    expires_at: getFlag(flags, "expires_at", "expires-at", "expiresAt") || null,
    status: "active",
    created_at: now,
    updated_at: now
  };
  state.permissions.push(permission);
  state.updated_at = now;
  writeKcloudPermissionsState(state);
  recordKcloudAudit("kcloud.permission.granted", "kcloud_permission", permission.kcloud_permission_id, `Cloud permission granted for ${permission.kcloud_node_id || permission.role_id || "unknown"}`, permission, appendAudit);
  return {
    report_type: "multi_ai_kcloud_permission_granted",
    generated_at: now,
    status: "ok",
    permission
  };
}

function revokeKcloudPermission(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readKcloudPermissionsState();
  const permissionId = String(getFlag(flags, "kcloud_permission_id", "kcloud-permission-id", "kcloudPermissionId", "permission") || "").trim();
  const permission = permissionId
    ? state.permissions.find((item) => item.kcloud_permission_id === permissionId)
    : state.permissions.find((item) => item.kcloud_node_id === getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id"));
  if (!permission) {
    return buildKcloudBlockedReport("Cloud permission not found.", "permissions-revoke");
  }
  permission.status = "revoked";
  permission.revoked_at = now;
  permission.updated_at = now;
  state.updated_at = now;
  writeKcloudPermissionsState(state);
  recordKcloudAudit("kcloud.permission.revoked", "kcloud_permission", permission.kcloud_permission_id, `Cloud permission revoked for ${permission.kcloud_node_id || "unknown"}`, permission, appendAudit);
  return {
    report_type: "multi_ai_kcloud_permission_revoked",
    generated_at: now,
    status: "ok",
    permission
  };
}

function buildKcloudApprovalStatusReport(flags = {}) {
  const state = readKcloudApprovalRequestsState();
  return {
    report_type: "multi_ai_kcloud_approval_status",
    generated_at: new Date().toISOString(),
    status: "ok",
    approval_requests: state.requests,
    approval_rules: readKcloudApprovalRulesState().approval_rules,
    counts: {
      requests: state.requests.length,
      active_requests: state.requests.filter((item) => item.status === "active").length
    }
  };
}

function handleTokenAction(action, flags = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "show" || normalized === "list") {
    return buildKcloudTokenStatusReport(flags);
  }
  if (normalized === "issue" || normalized === "create" || normalized === "add") {
    return issueKcloudTaskToken(flags, appendAudit);
  }
  throw new Error(`Unknown kcloud token action: ${normalized}`);
}

function buildKcloudTokenStatusReport(flags = {}) {
  const state = readKcloudTaskTokensState();
  const nodeId = getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id");
  const tokens = nodeId ? state.tokens.filter((item) => item.kcloud_node_id === nodeId) : state.tokens;
  return {
    report_type: "multi_ai_kcloud_token_status",
    generated_at: new Date().toISOString(),
    status: "ok",
    tokens,
    counts: {
      total: state.tokens.length,
      active: state.tokens.filter((item) => item.status === "active").length
    }
  };
}

function issueKcloudTaskToken(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const nodeId = resolveKcloudNodeId(flags);
  const trust = findLatestKcloudTrust(nodeId);
  if (!trust || trust.trust_status !== "trusted") {
    const blocked = buildKcloudBlockedReport("Trusted cloud approval is required before issuing a cloud task token.", "token-issue");
    recordUngovernedKcloudPacket(blocked, appendAudit);
    return blocked;
  }
  const state = readKcloudTaskTokensState();
  const token = {
    kcloud_task_token_id: nextId(state.tokens, "kcloud-token"),
    tenant_id: getFlag(flags, "tenant_id", "tenant-id", "tenantId") || trust.tenant_id || "tenant-001",
    project_id: getFlag(flags, "project_id", "project-id", "projectId") || trust.project_id || null,
    task_id: getFlag(flags, "task_id", "task-id", "taskId", "task") || null,
    kcloud_node_id: nodeId,
    agent_id: getFlag(flags, "agent_id", "agent-id", "agentId", "agent") || null,
    tool_id: getFlag(flags, "tool_id", "tool-id", "toolId", "tool") || null,
    allowed_actions: normalizeList(getFlag(flags, "allowed_actions", "allowed-actions", "allowedActions") || []),
    denied_actions: normalizeList(getFlag(flags, "denied_actions", "denied-actions", "deniedActions") || []),
    allowed_paths: normalizeList(getFlag(flags, "allowed_paths", "allowed-paths", "allowedPaths") || []),
    denied_paths: normalizeList(getFlag(flags, "denied_paths", "denied-paths", "deniedPaths") || []),
    max_runtime_seconds: Number(getFlag(flags, "max_runtime_seconds", "max-runtime-seconds", "maxRuntimeSeconds") || 0) || null,
    max_cost: Number(getFlag(flags, "max_cost", "max-cost", "maxCost") || 0) || null,
    risk_level: normalizeRiskLevel(getFlag(flags, "risk_level", "risk-level", "riskLevel") || "medium"),
    created_at: now,
    expires_at: getFlag(flags, "expires_at", "expires-at", "expiresAt") || null,
    status: "active"
  };
  state.tokens.push(token);
  state.updated_at = now;
  writeKcloudTaskTokensState(state);
  recordKcloudAudit("kcloud.token.issued", "kcloud_task_token", token.kcloud_task_token_id, `Cloud task token issued for ${nodeId}`, token, appendAudit);
  return {
    report_type: "multi_ai_kcloud_task_token_issued",
    generated_at: now,
    status: "ok",
    kcloud_task_token: token,
    next_action: "Use `kvdf multi-ai kcloud lease create`."
  };
}

function handleLeaseAction(action, flags = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "show" || normalized === "list") {
    return buildKcloudLeaseReport(flags);
  }
  if (normalized === "create" || normalized === "add" || normalized === "register") {
    return createKcloudLease(flags, appendAudit);
  }
  throw new Error(`Unknown kcloud lease action: ${normalized}`);
}

function buildKcloudLeaseReport(flags = {}) {
  const state = readKcloudLeasesState();
  const nodeId = getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id");
  const leases = nodeId ? state.leases.filter((item) => item.kcloud_node_id === nodeId) : state.leases;
  return {
    report_type: "multi_ai_kcloud_leases",
    generated_at: new Date().toISOString(),
    status: "ok",
    leases,
    counts: {
      total: state.leases.length,
      active: state.leases.filter((item) => item.status === "active").length
    }
  };
}

function createKcloudLease(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const nodeId = resolveKcloudNodeId(flags);
  const taskId = String(getFlag(flags, "task_id", "task-id", "taskId", "task") || "").trim() || null;
  const tokenState = readKcloudTaskTokensState();
  const activeTokens = Array.isArray(tokenState.tokens) ? tokenState.tokens.filter((item) => item && item.status === "active") : [];
  const exactTokens = activeTokens.filter((item) => item.kcloud_node_id === nodeId && (!taskId || String(item.task_id || "") === String(taskId)));
  const taskTokens = taskId ? activeTokens.filter((item) => String(item.task_id || "") === String(taskId)) : [];
  const nodeTokens = nodeId ? activeTokens.filter((item) => item.kcloud_node_id === nodeId) : [];
  const token = exactTokens[exactTokens.length - 1] || taskTokens[taskTokens.length - 1] || nodeTokens[nodeTokens.length - 1] || activeTokens[activeTokens.length - 1] || null;
  if (!token || isExpired(token.expires_at, now)) {
    const blocked = buildKcloudBlockedReport("A valid cloud task token is required before creating a lease.", "lease-create");
    recordUngovernedKcloudPacket(blocked, appendAudit);
    return blocked;
  }
  const leaseType = normalizeLeaseType(getFlag(flags, "lease_type", "lease-type", "leaseType", "type") || "task");
  const scope = String(getFlag(flags, "scope", "path", "file", "folder", "branch", "cloud_channel", "cloud-channel", "cloudChannel", "runner") || token.task_id || "cloud-task").trim();
  const lease = {
    kcloud_lease_id: nextId(readKcloudLeasesState().leases, "kcloud-lease"),
    tenant_id: token.tenant_id,
    project_id: token.project_id,
    task_id: token.task_id,
    kcloud_node_id: token.kcloud_node_id,
    agent_id: token.agent_id,
    tool_id: token.tool_id,
    lease_type: leaseType,
    scope,
    branch: getFlag(flags, "branch") || (leaseType === "branch" ? scope : null),
    cloud_channel: getFlag(flags, "cloud_channel", "cloud-channel", "cloudChannel") || null,
    cloud_runner_id: getFlag(flags, "cloud_runner_id", "cloud-runner-id", "cloudRunnerId", "runner") || null,
    created_at: now,
    expires_at: getFlag(flags, "expires_at", "expires-at", "expiresAt") || token.expires_at || null,
    status: "active",
    allowed_paths: normalizeList(getFlag(flags, "allowed_paths", "allowed-paths", "allowedPaths") || token.allowed_paths || []),
    denied_paths: normalizeList(getFlag(flags, "denied_paths", "denied-paths", "deniedPaths") || token.denied_paths || [])
  };
  const conflicts = detectKcloudConflicts(lease, flags, token);
  if (conflicts.length) {
    writeKcloudConflicts(conflicts);
    const blocked = buildKcloudBlockedReport(conflicts[0].reason || "Cloud lease conflict detected.", "lease-create", { lease, conflicts });
    recordUngovernedKcloudPacket(blocked, appendAudit);
    return blocked;
  }
  const state = readKcloudLeasesState();
  state.leases.push(lease);
  state.updated_at = now;
  writeKcloudLeasesState(state);
  recordKcloudAudit("kcloud.lease.created", "kcloud_lease", lease.kcloud_lease_id, `Cloud lease created for ${lease.kcloud_node_id}`, lease, appendAudit);
  return {
    report_type: "multi_ai_kcloud_lease_created",
    generated_at: now,
    status: "ok",
    lease,
    next_action: "Use `kvdf multi-ai kcloud policy check` to validate packets against the lease."
  };
}

function releaseKcloudLease(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const leaseId = String(getFlag(flags, "kcloud_lease_id", "kcloud-lease-id", "kcloudLeaseId", "lease") || "").trim();
  const state = readKcloudLeasesState();
  const lease = leaseId
    ? state.leases.find((item) => item.kcloud_lease_id === leaseId)
    : state.leases.find((item) => item.status === "active" && item.kcloud_node_id === resolveKcloudNodeId(flags));
  if (!lease) {
    return buildKcloudBlockedReport("Cloud lease not found.", "lease-release");
  }
  lease.status = "released";
  lease.released_at = now;
  lease.updated_at = now;
  state.updated_at = now;
  writeKcloudLeasesState(state);
  recordKcloudAudit("kcloud.lease.released", "kcloud_lease", lease.kcloud_lease_id, `Cloud lease released for ${lease.kcloud_node_id}`, lease, appendAudit);
  return {
    report_type: "multi_ai_kcloud_lease_released",
    generated_at: now,
    status: "ok",
    lease
  };
}

function buildKcloudConflictsReport(flags = {}) {
  const state = readKcloudConflictsState();
  const projectId = getFlag(flags, "project_id", "project-id", "projectId");
  const conflicts = projectId ? state.conflicts.filter((item) => item.project_id === projectId) : state.conflicts;
  return {
    report_type: "multi_ai_kcloud_conflicts",
    generated_at: new Date().toISOString(),
    status: "ok",
    conflicts,
    counts: {
      total: state.conflicts.length,
      open: state.conflicts.filter((item) => item.status !== "resolved").length
    }
  };
}

function checkKcloudPacket(flags = {}, appendAudit = null) {
  const decision = evaluateKcloudPolicy(flags, appendAudit);
  return {
    report_type: "multi_ai_kcloud_packet_check",
    generated_at: decision.timestamp,
    ...decision
  };
}

function evaluateKcloudPolicy(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const nodeId = resolveKcloudNodeId(flags);
  const taskId = String(getFlag(flags, "task_id", "task-id", "taskId", "task") || "").trim() || null;
  const pathValue = String(getFlag(flags, "path", "file", "scope") || "").trim() || null;
  const branch = String(getFlag(flags, "branch") || "").trim() || null;
  const cloudChannel = String(getFlag(flags, "cloud_channel", "cloud-channel", "cloudChannel") || "").trim() || null;
  const action = normalizeAction(getFlag(flags, "action", "packet_action", "packet-action", "type") || flags.packet_action || flags.action);
  const packetId = String(getFlag(flags, "packet_id", "packet-id", "packetId", "id") || `kcloud-packet-${nodeId || "unknown"}`).trim();
  const trust = findLatestKcloudTrust(nodeId);
  const permission = findLatestKcloudPermission(nodeId, taskId, action, pathValue, branch, cloudChannel);
  const token = resolveKcloudTaskToken({ ...flags, kcloud_node_id: nodeId, task_id: taskId });
  const lease = findLatestKcloudLease(nodeId, taskId, branch, pathValue, cloudChannel);
  const conflicts = detectKcloudConflicts({
    kcloud_node_id: nodeId,
    task_id: taskId,
    branch,
    scope: pathValue || branch || cloudChannel || taskId,
    cloud_channel: cloudChannel,
    lease_type: getFlag(flags, "lease_type", "lease-type", "leaseType") || null,
    allowed_paths: [],
    denied_paths: []
  }, flags, token, lease);
  if (conflicts.length) writeKcloudConflicts(conflicts);

  let decision = "allow";
  let reason = "Cloud action is permitted.";
  let riskLevel = normalizeRiskLevel(getFlag(flags, "risk_level", "risk-level", "riskLevel") || (conflicts.some((item) => item.conflict_type === "high_risk") ? "high" : "medium"));
  let requiresOwnerApproval = false;

  if (!trust || trust.trust_status !== "trusted") {
    decision = "block";
    reason = "Untrusted cloud node.";
    riskLevel = "high";
  } else if (!permission) {
    decision = "block";
    reason = "Missing cloud permission.";
    riskLevel = "high";
  } else if (permission.denied_actions && permission.denied_actions.includes(action)) {
    decision = "block";
    reason = "Denied cloud action.";
    riskLevel = "high";
  } else if (permission.denied_paths && pathValue && permission.denied_paths.some((denied) => pathsOverlap(denied, pathValue))) {
    decision = "block";
    reason = "Denied cloud path.";
    riskLevel = "high";
  } else if (permission.denied_cloud_channels && cloudChannel && permission.denied_cloud_channels.includes(cloudChannel)) {
    decision = "block";
    reason = "Denied cloud channel.";
    riskLevel = "high";
  } else if (Array.isArray(permission.allowed_actions) && permission.allowed_actions.length && action && !permission.allowed_actions.includes(action)) {
    decision = "block";
    reason = "Action is outside the granted cloud permission.";
    riskLevel = "high";
  } else if (Array.isArray(permission.allowed_paths) && permission.allowed_paths.length && pathValue && !permission.allowed_paths.some((allowed) => pathsOverlap(allowed, pathValue))) {
    decision = "block";
    reason = "Path is outside the granted cloud permission.";
    riskLevel = "high";
  } else if (Array.isArray(permission.allowed_cloud_channels) && permission.allowed_cloud_channels.length && cloudChannel && !permission.allowed_cloud_channels.includes(cloudChannel)) {
    decision = "block";
    reason = "Cloud channel is outside the granted cloud permission.";
    riskLevel = "high";
  } else if (!token || isExpired(token.expires_at, now)) {
    decision = "block";
    reason = "Expired or missing cloud task token.";
    riskLevel = "high";
  } else if (conflicts.some((item) => item.conflict_type === "denied_path" || item.conflict_type === "denied_action" || item.conflict_type === "local_lease_conflict" || item.conflict_type === "wifi_lease_conflict" || item.conflict_type === "same_branch")) {
    decision = "block";
    reason = "Cloud action conflicts with an existing lease or denied path.";
    riskLevel = "high";
  } else if (permission.approval_required || isHighRiskCloudPath(pathValue) || isHighRiskCloudAction(action) || isHighRiskLeaseType(lease ? lease.lease_type : getFlag(flags, "lease_type", "lease-type", "leaseType"))) {
    decision = "require_owner_approval";
    reason = "High-risk cloud action requires owner approval.";
    requiresOwnerApproval = true;
    riskLevel = "high";
  } else if (!lease && getFlag(flags, "require_lease", "require-lease", "requireLease") !== false) {
    decision = "warn";
    reason = "No active cloud lease was found for this action.";
  } else if (!lease) {
    decision = "warn";
  }

  if (decision === "warn" && conflicts.length) {
    reason = conflicts[0].reason || reason;
  }
  const decisionRecord = {
    decision,
    reason,
    risk_level: riskLevel,
    requires_owner_approval: requiresOwnerApproval,
    tenant_id: token ? token.tenant_id : (permission ? permission.tenant_id : getFlag(flags, "tenant_id", "tenant-id", "tenantId") || null),
    organization_id: getFlag(flags, "organization_id", "organization-id", "organizationId") || null,
    project_id: token ? token.project_id : (permission ? permission.project_id : getFlag(flags, "project_id", "project-id", "projectId") || null),
    cloud_project_id: getFlag(flags, "cloud_project_id", "cloud-project-id", "cloudProjectId") || (permission ? permission.cloud_project_id : null),
    kcloud_node_id: nodeId,
    task_id: taskId,
    kcloud_task_token_id: token ? token.kcloud_task_token_id : null,
    kcloud_lease_id: lease ? lease.kcloud_lease_id : null,
    packet_id: packetId,
    evidence_id: null,
    timestamp: now
  };
  if (decision === "require_owner_approval") {
    recordKcloudApprovalRequest({
      tenant_id: decisionRecord.tenant_id,
      organization_id: decisionRecord.organization_id,
      project_id: decisionRecord.project_id,
      cloud_project_id: decisionRecord.cloud_project_id,
      kcloud_node_id: nodeId,
      task_id: taskId,
      packet_id: packetId,
      reason,
      risk_level: riskLevel,
      status: "pending",
      created_at: now,
      updated_at: now
    }, appendAudit);
  }
  if (decision !== "allow") {
    recordUngovernedKcloudPacket({
      report_type: "multi_ai_kcloud_policy_decision",
      decision,
      reason,
      risk_level: riskLevel,
      requires_owner_approval: requiresOwnerApproval,
      tenant_id: decisionRecord.tenant_id,
      organization_id: decisionRecord.organization_id,
      project_id: decisionRecord.project_id,
      cloud_project_id: decisionRecord.cloud_project_id,
      kcloud_node_id: nodeId,
      task_id: taskId,
      kcloud_task_token_id: token ? token.kcloud_task_token_id : null,
      kcloud_lease_id: lease ? lease.kcloud_lease_id : null,
      packet_id: packetId,
      evidence_id: null,
      timestamp: now
    }, appendAudit);
  }
  const decisionsState = readKcloudPolicyDecisionsState();
  decisionRecord.evidence_id = decision === "allow" || decision === "warn" ? recordKcloudEvidence(decisionRecord, appendAudit) : null;
  decisionsState.decisions.push(decisionRecord);
  decisionsState.updated_at = now;
  writeKcloudPolicyDecisionsState(decisionsState);
  recordKcloudAudit("kcloud.policy.checked", "kcloud_policy_decision", packetId, `Cloud policy decision: ${decision}`, decisionRecord, appendAudit);
  return {
    report_type: "multi_ai_kcloud_policy_decision",
    generated_at: now,
    ...decisionRecord,
    permission,
    conflicts,
    lease,
    token,
    next_action: decision === "allow"
      ? "Cloud action may be synced through `kcloud_data_sharing` when available."
      : decision === "warn"
        ? "Review the lease or create one before proceeding."
        : "Obtain owner approval or fix the conflict before retrying."
  };
}

function recordKcloudApprovalRequest(data, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readKcloudApprovalRequestsState();
  const request = {
    kcloud_approval_request_id: nextId(state.requests, "kcloud-approval"),
    tenant_id: data.tenant_id || null,
    organization_id: data.organization_id || null,
    project_id: data.project_id || null,
    cloud_project_id: data.cloud_project_id || null,
    kcloud_node_id: data.kcloud_node_id || null,
    task_id: data.task_id || null,
    packet_id: data.packet_id || null,
    reason: data.reason || null,
    risk_level: normalizeRiskLevel(data.risk_level || "medium"),
    status: data.status || "pending",
    created_at: data.created_at || now,
    updated_at: data.updated_at || now
  };
  state.requests.push(request);
  state.updated_at = now;
  writeKcloudApprovalRequestsState(state);
  recordKcloudAudit("kcloud.approval.requested", "kcloud_approval_request", request.kcloud_approval_request_id, request.reason || "Cloud approval requested", request, appendAudit);
  return request;
}

function buildKcloudAuditReport(flags = {}) {
  const state = readKcloudAuditLogState();
  return {
    report_type: "multi_ai_kcloud_audit",
    generated_at: new Date().toISOString(),
    status: "ok",
    events: state.events,
    counts: {
      total: state.events.length
    }
  };
}

function buildKcloudEvidenceReport(flags = {}) {
  const packetEvidence = readKcloudPacketEvidenceState();
  const evidence = readKcloudEvidenceState();
  return {
    report_type: "multi_ai_kcloud_evidence",
    generated_at: new Date().toISOString(),
    status: "ok",
    packet_evidence: packetEvidence.evidence,
    evidence: evidence.evidence,
    counts: {
      packet_evidence: packetEvidence.evidence.length,
      evidence: evidence.evidence.length
    }
  };
}

function buildKcloudApprovalRequestsReport(flags = {}) {
  const state = readKcloudApprovalRequestsState();
  return {
    report_type: "multi_ai_kcloud_approval_requests",
    generated_at: new Date().toISOString(),
    status: "ok",
    requests: state.requests
  };
}

function buildKcloudBlockedReport(message, action, extra = {}) {
  const now = new Date().toISOString();
  return {
    report_type: "multi_ai_kcloud_blocked",
    generated_at: now,
    status: "blocked",
    decision: "block",
    reason: message,
    risk_level: "high",
    requires_owner_approval: false,
    timestamp: now,
    next_action: action ? `Fix the issue and retry ${action}.` : null,
    ...extra
  };
}

function recordKcloudAudit(event_type, entity_type, entity_id, message, payload, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readKcloudAuditLogState();
  const record = {
    audit_event_id: nextId(state.events, "kcloud-audit"),
    event_type,
    entity_type,
    entity_id,
    message,
    payload: payload || null,
    created_at: now
  };
  state.events.push(record);
  state.updated_at = now;
  writeKcloudAuditLogState(state);
  if (typeof appendAudit === "function") {
    appendAudit(event_type, entity_type, entity_id, message);
  }
  return record;
}

function recordUngovernedKcloudPacket(packet, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readKcloudUngovernedPacketsState();
  const record = {
    kcloud_ungoverned_packet_id: nextId(state.packets, "kcloud-ungoverned"),
    packet_id: packet.packet_id || packet.kcloud_packet_id || packet.kcloud_task_token_id || `kcloud-packet-${state.packets.length + 1}`,
    decision: packet.decision || "block",
    reason: packet.reason || "Ungoverned cloud packet",
    risk_level: packet.risk_level || "high",
    requires_owner_approval: Boolean(packet.requires_owner_approval),
    created_at: now,
    status: "recorded",
    payload: packet
  };
  state.packets.push(record);
  state.updated_at = now;
  writeKcloudUngovernedPacketsState(state);
  recordKcloudAudit("kcloud.packet.ungoverned", "kcloud_packet", record.packet_id, record.reason, record, appendAudit);
  return record;
}

function recordKcloudEvidence(decision, appendAudit = null) {
  const now = new Date().toISOString();
  const packetEvidenceState = readKcloudPacketEvidenceState();
  const evidenceState = readKcloudEvidenceState();
  const evidenceId = nextId(evidenceState.evidence, "kcloud-evidence");
  const record = {
    kcloud_evidence_id: evidenceId,
    packet_id: decision.packet_id || null,
    kcloud_node_id: decision.kcloud_node_id || null,
    task_id: decision.task_id || null,
    evidence_type: "policy_decision",
    decision: decision.decision,
    reason: decision.reason,
    risk_level: decision.risk_level,
    created_at: now,
    status: "recorded"
  };
  packetEvidenceState.evidence.push({
    ...record,
    evidence_source: "packet"
  });
  packetEvidenceState.updated_at = now;
  evidenceState.evidence.push(record);
  evidenceState.updated_at = now;
  writeKcloudPacketEvidenceState(packetEvidenceState);
  writeKcloudEvidenceState(evidenceState);
  recordKcloudAudit("kcloud.evidence.recorded", "kcloud_evidence", evidenceId, `Cloud evidence recorded for ${decision.packet_id || "packet"}`, record, appendAudit);
  return evidenceId;
}

function buildKcloudPacketEvidenceReport(flags = {}) {
  const state = readKcloudPacketEvidenceState();
  return {
    report_type: "multi_ai_kcloud_packet_evidence",
    generated_at: new Date().toISOString(),
    status: "ok",
    evidence: state.evidence
  };
}

function normalizeAction(value, flags = {}) {
  const candidate = value !== undefined && value !== null && value !== "" ? value : flags.action || flags.cmd || "";
  return String(candidate || "").trim().toLowerCase();
}

function getFlag(flags, ...names) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(flags, name) && flags[name] !== undefined) return flags[name];
  }
  return undefined;
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeNodeType(value) {
  const candidate = String(value || "unknown_cloud_node").trim().toLowerCase();
  return KCLOUD_NODE_TYPES.has(candidate) ? candidate : "unknown_cloud_node";
}

function normalizeRiskLevel(value) {
  const candidate = String(value || "medium").trim().toLowerCase();
  return KCLOUD_RISK_LEVELS.has(candidate) ? candidate : "medium";
}

function normalizeLeaseType(value) {
  const candidate = String(value || "task").trim().toLowerCase();
  return KCLOUD_LEASE_TYPES.has(candidate) ? candidate : "task";
}

function normalizeTrustStatus(value) {
  const candidate = String(value || "untrusted").trim().toLowerCase();
  return ["untrusted", "pairing_requested", "trusted", "revoked", "expired", "blocked"].includes(candidate) ? candidate : "untrusted";
}

function isTruthyFlag(value) {
  return value === true || value === "true" || value === "1" || value === "yes" || value === "on";
}

function resolveKcloudNodeId(flags = {}) {
  return String(getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id", "peer", "peer_id") || "kcloud-node-unknown").trim();
}

function resolveGovernanceCloudNodeId(flags = {}) {
  return String(getFlag(flags, "governance_cloud_node_id", "governance-cloud-node-id", "governanceCloudNodeId", "governance_node_id", "governance-node-id", "governanceNodeId") || `gov-${resolveKcloudNodeId(flags)}`).trim();
}

function isHighRiskCloudPath(value) {
  const text = String(value || "").replace(/\\/g, "/").toLowerCase();
  return [
    "/.env",
    ".env",
    "secret",
    "secrets",
    "auth",
    "security",
    "migration",
    "deploy",
    "production",
    "plugin.json",
    "schema_registry",
    "schemas/runtime/",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock"
  ].some((item) => text.includes(item));
}

function isHighRiskCloudAction(action) {
  return ["modify_secrets", "trigger_deployment", "push_to_git", "run_cloud_build"].includes(String(action || "").trim().toLowerCase());
}

function isHighRiskLeaseType(type) {
  return ["approval_flow", "release_gate"].includes(String(type || "").trim().toLowerCase());
}

function readJsonState(file, fallback) {
  if (!fileExists(file)) {
    const initial = typeof fallback === "function" ? fallback() : fallback;
    writeJsonState(file, initial);
    return initial;
  }
  try {
    return readJsonFile(file);
  } catch (error) {
    const initial = typeof fallback === "function" ? fallback() : fallback;
    writeJsonState(file, initial);
    return initial;
  }
}

function writeJsonState(file, data) {
  writeJsonFile(file, data);
}

function baseState(recordsName) {
  const now = new Date().toISOString();
  return {
    version: "v1",
    created_at: now,
    updated_at: now,
    [recordsName]: []
  };
}

function readKcloudNodesState() {
  return readJsonState(KCLOUD_NODES_FILE, () => baseState("nodes"));
}

function writeKcloudNodesState(state) {
  writeJsonState(KCLOUD_NODES_FILE, state);
}

function readKcloudIdentityMapState() {
  return readJsonState(KCLOUD_IDENTITY_MAP_FILE, () => baseState("mappings"));
}

function writeKcloudIdentityMapState(state) {
  writeJsonState(KCLOUD_IDENTITY_MAP_FILE, state);
}

function readKcloudTrustState() {
  return readJsonState(KCLOUD_TRUST_FILE, () => baseState("trust_records"));
}

function writeKcloudTrustState(state) {
  writeJsonState(KCLOUD_TRUST_FILE, state);
}

function readKcloudProjectMapState() {
  return readJsonState(KCLOUD_PROJECT_MAP_FILE, () => baseState("project_mappings"));
}

function writeKcloudProjectMapState(state) {
  writeJsonState(KCLOUD_PROJECT_MAP_FILE, state);
}

function readKcloudPermissionsState() {
  return readJsonState(KCLOUD_PERMISSIONS_FILE, () => baseState("permissions"));
}

function writeKcloudPermissionsState(state) {
  writeJsonState(KCLOUD_PERMISSIONS_FILE, state);
}

function readKcloudTaskTokensState() {
  return readJsonState(KCLOUD_TASK_TOKENS_FILE, () => baseState("tokens"));
}

function writeKcloudTaskTokensState(state) {
  writeJsonState(KCLOUD_TASK_TOKENS_FILE, state);
}

function readKcloudApprovalRulesState() {
  return readJsonState(KCLOUD_APPROVAL_RULES_FILE, () => baseState("approval_rules"));
}

function writeKcloudApprovalRulesState(state) {
  writeJsonState(KCLOUD_APPROVAL_RULES_FILE, state);
}

function readKcloudLeasesState() {
  return readJsonState(KCLOUD_LEASES_FILE, () => baseState("leases"));
}

function writeKcloudLeasesState(state) {
  writeJsonState(KCLOUD_LEASES_FILE, state);
}

function readKcloudConflictsState() {
  return readJsonState(KCLOUD_CONFLICTS_FILE, () => baseState("conflicts"));
}

function writeKcloudConflictsState(state) {
  writeJsonState(KCLOUD_CONFLICTS_FILE, state);
}

function writeKcloudConflicts(conflicts) {
  const now = new Date().toISOString();
  const state = readKcloudConflictsState();
  for (const conflict of conflicts) {
    const existing = state.conflicts.find((item) => item.conflict_id === conflict.conflict_id);
    if (!existing) state.conflicts.push(conflict);
  }
  state.updated_at = now;
  writeKcloudConflictsState(state);
}

function readKcloudUngovernedPacketsState() {
  return readJsonState(KCLOUD_UNGOVERNED_PACKETS_FILE, () => baseState("packets"));
}

function writeKcloudUngovernedPacketsState(state) {
  writeJsonState(KCLOUD_UNGOVERNED_PACKETS_FILE, state);
}

function readKcloudPacketEvidenceState() {
  return readJsonState(KCLOUD_PACKET_EVIDENCE_FILE, () => baseState("evidence"));
}

function writeKcloudPacketEvidenceState(state) {
  writeJsonState(KCLOUD_PACKET_EVIDENCE_FILE, state);
}

function readKcloudPolicyDecisionsState() {
  return readJsonState(KCLOUD_POLICY_DECISIONS_FILE, () => baseState("decisions"));
}

function writeKcloudPolicyDecisionsState(state) {
  writeJsonState(KCLOUD_POLICY_DECISIONS_FILE, state);
}

function readKcloudApprovalRequestsState() {
  return readJsonState(KCLOUD_APPROVAL_REQUESTS_FILE, () => baseState("requests"));
}

function writeKcloudApprovalRequestsState(state) {
  writeJsonState(KCLOUD_APPROVAL_REQUESTS_FILE, state);
}

function readKcloudAuditLogState() {
  return readJsonState(KCLOUD_AUDIT_LOG_FILE, () => baseState("events"));
}

function writeKcloudAuditLogState(state) {
  writeJsonState(KCLOUD_AUDIT_LOG_FILE, state);
}

function readKcloudEvidenceState() {
  return readJsonState(KCLOUD_EVIDENCE_FILE, () => baseState("evidence"));
}

function writeKcloudEvidenceState(state) {
  writeJsonState(KCLOUD_EVIDENCE_FILE, state);
}

function readLocalProjectContext() {
  return {
    project: localGovernance.readLocalProjectState(),
    machine: localGovernance.readLocalMachineState()
  };
}

function findLatestKcloudTrust(nodeId) {
  const trust = readKcloudTrustState().trust_records.filter((item) => item.kcloud_node_id === nodeId || item.governance_cloud_node_id === nodeId);
  return trust[trust.length - 1] || null;
}

function findLatestKcloudToken(nodeId, taskId = null) {
  const tokens = readKcloudTaskTokensState().tokens.filter((item) => item.kcloud_node_id === nodeId && (!taskId || String(item.task_id || "") === String(taskId)));
  return tokens[tokens.length - 1] || null;
}

function resolveKcloudTaskToken(flags = {}) {
  const nodeId = resolveKcloudNodeId(flags);
  const taskId = String(getFlag(flags, "task_id", "task-id", "taskId", "task") || "").trim() || null;
  const tokens = (readKcloudTaskTokensState().tokens || []).filter((item) => item && item.status === "active");
  const exactMatches = tokens.filter((item) => item.kcloud_node_id === nodeId && (!taskId || String(item.task_id || "") === String(taskId)));
  if (exactMatches.length) return exactMatches[exactMatches.length - 1];
  const taskMatches = taskId ? tokens.filter((item) => String(item.task_id || "") === String(taskId)) : [];
  if (taskMatches.length) return taskMatches[taskMatches.length - 1];
  const nodeMatches = nodeId ? tokens.filter((item) => item.kcloud_node_id === nodeId) : [];
  if (nodeMatches.length) return nodeMatches[nodeMatches.length - 1];
  return tokens[tokens.length - 1] || null;
}

function findLatestKcloudPermission(nodeId, taskId = null, action = null, pathValue = null, branch = null, cloudChannel = null) {
  const permissions = readKcloudPermissionsState().permissions.filter((item) => {
    if (item.status && item.status !== "active") return false;
    if (nodeId && item.kcloud_node_id && item.kcloud_node_id !== nodeId) return false;
    if (taskId && item.task_id && String(item.task_id) !== String(taskId)) return false;
    if (branch && item.branch && item.branch !== branch) return false;
    return true;
  });
  return permissions[permissions.length - 1] || null;
}

function findLatestKcloudLease(nodeId, taskId = null, branch = null, pathValue = null, cloudChannel = null) {
  const leases = readKcloudLeasesState().leases.filter((item) => item.kcloud_node_id === nodeId && item.status === "active" && (!taskId || String(item.task_id || "") === String(taskId)));
  if (!leases.length) return null;
  return leases.find((item) => {
    if (branch && item.branch && item.branch !== branch) return false;
    if (cloudChannel && item.cloud_channel && item.cloud_channel !== cloudChannel) return false;
    if (pathValue && item.scope && !pathsOverlap(item.scope, pathValue) && !(item.allowed_paths || []).some((candidate) => pathsOverlap(candidate, pathValue))) return false;
    return true;
  }) || leases[leases.length - 1];
}

function detectKcloudConflicts(leaseOrPacket, flags = {}, token = null, activeLease = null) {
  const conflicts = [];
  const taskId = String(leaseOrPacket.task_id || getFlag(flags, "task_id", "task-id", "taskId", "task") || "").trim() || null;
  const branch = String(leaseOrPacket.branch || getFlag(flags, "branch") || "").trim() || null;
  const pathValue = String(leaseOrPacket.scope || getFlag(flags, "path", "file", "scope") || "").trim() || null;
  const cloudChannel = String(leaseOrPacket.cloud_channel || getFlag(flags, "cloud_channel", "cloud-channel", "cloudChannel") || "").trim() || null;
  const leaseType = normalizeLeaseType(leaseOrPacket.lease_type || getFlag(flags, "lease_type", "lease-type", "leaseType") || "task");
  const effectiveLeaseType = leaseType === "task" && pathValue ? "file" : leaseType;
  const projectId = String(leaseOrPacket.project_id || getFlag(flags, "project_id", "project-id", "projectId") || "").trim() || null;
  const nodeId = String(leaseOrPacket.kcloud_node_id || getFlag(flags, "kcloud_node_id", "kcloud-node-id", "kcloudNodeId", "node", "id") || "").trim() || null;

  const localLeases = localGovernance.readLocalLeasesState().leases || [];
  for (const localLease of localLeases) {
    if (projectId && localLease.project_id && localLease.project_id !== projectId) continue;
    if (pathValue && effectiveLeaseType === "file" && (pathsOverlap(localLease.scope, pathValue) || arraysOverlap(localLease.allowed_paths, [pathValue]))) {
      conflicts.push(buildKcloudConflict("local_lease_conflict", leaseOrPacket, localLease, "Cloud file scope overlaps a local project lease."));
    }
    if (branch && localLease.branch && localLease.branch === branch && String(localLease.task_id || "") !== String(taskId || "")) {
      conflicts.push(buildKcloudConflict("local_branch_conflict", leaseOrPacket, localLease, "Cloud branch conflicts with a local project lease."));
    }
  }

  const wifiLeases = wifiGovernance.readWifiLeasesState().leases || [];
  for (const wifiLease of wifiLeases) {
    if (pathValue && effectiveLeaseType === "file" && (pathsOverlap(wifiLease.scope, pathValue) || arraysOverlap(wifiLease.allowed_paths, [pathValue]))) {
      conflicts.push(buildKcloudConflict("wifi_lease_conflict", leaseOrPacket, wifiLease, "Cloud file scope overlaps a Wi-Fi/LAN lease."));
    }
    if (branch && wifiLease.branch && wifiLease.branch === branch && String(wifiLease.task_id || "") !== String(taskId || "")) {
      conflicts.push(buildKcloudConflict("wifi_branch_conflict", leaseOrPacket, wifiLease, "Cloud branch conflicts with a Wi-Fi/LAN lease."));
    }
  }

  const cloudLeases = readKcloudLeasesState().leases || [];
  for (const other of cloudLeases) {
    if (other.kcloud_node_id === nodeId && other.status !== "active") continue;
    if (activeLease && other.kcloud_lease_id === activeLease.kcloud_lease_id) continue;
    if (branch && other.branch && other.branch === branch && String(other.task_id || "") !== String(taskId || "")) {
      conflicts.push(buildKcloudConflict("same_branch", leaseOrPacket, other, "The same cloud branch is already leased for a different task."));
    }
    if (pathValue && effectiveLeaseType === "file" && (pathsOverlap(other.scope, pathValue) || arraysOverlap(other.allowed_paths, [pathValue]))) {
      conflicts.push(buildKcloudConflict("same_file", leaseOrPacket, other, "The same cloud file scope is already leased."));
    }
    if (cloudChannel && other.cloud_channel && other.cloud_channel === cloudChannel && String(other.task_id || "") !== String(taskId || "")) {
      conflicts.push(buildKcloudConflict("cloud_channel_conflict", leaseOrPacket, other, "The cloud channel is already leased for another task."));
    }
    if (other.lease_type === "approval_flow" && leaseType === "release_gate") {
      conflicts.push(buildKcloudConflict("release_gate_conflict", leaseOrPacket, other, "Release gate requires readiness approval."));
    }
  }

  if (token && isExpired(token.expires_at, new Date().toISOString())) {
    conflicts.push(buildKcloudConflict("expired_token", leaseOrPacket, token, "Expired cloud task token used."));
  }
  if (token && Array.isArray(token.denied_paths) && pathValue && token.denied_paths.some((denied) => pathsOverlap(denied, pathValue))) {
    conflicts.push(buildKcloudConflict("denied_path", leaseOrPacket, token, "Denied cloud path requested."));
  }
  if (token && Array.isArray(token.denied_actions) && String(getFlag(flags, "action", "packet_action", "packet-action", "type") || "").trim() && token.denied_actions.includes(String(getFlag(flags, "action", "packet_action", "packet-action", "type")).trim())) {
    conflicts.push(buildKcloudConflict("denied_action", leaseOrPacket, token, "Denied cloud action requested."));
  }
  if (leaseOrPacket && isHighRiskCloudPath(pathValue)) {
    conflicts.push(buildKcloudConflict("high_risk", leaseOrPacket, token || {}, "High-risk cloud path requires owner approval."));
  }
  if (!token) {
    conflicts.push(buildKcloudConflict("missing_token", leaseOrPacket, {}, "Missing cloud task token."));
  }

  return uniqueConflicts(conflicts);
}

function buildKcloudConflict(conflictType, input, other, reason) {
  const now = new Date().toISOString();
  return {
    conflict_id: generateRuntimeId("kcloud-conflict"),
    conflict_type: conflictType,
    tenant_id: input.tenant_id || null,
    organization_id: input.organization_id || null,
    project_id: input.project_id || null,
    cloud_project_id: input.cloud_project_id || null,
    kcloud_node_id: input.kcloud_node_id || null,
    task_id: input.task_id || null,
    kcloud_lease_id: input.kcloud_lease_id || null,
    packet_id: input.packet_id || null,
    scope: input.scope || input.path || input.branch || input.cloud_channel || null,
    reason,
    status: "open",
    created_at: now,
    other_id: other && (other.kcloud_lease_id || other.kcloud_task_token_id || other.kcloud_node_id || other.kcloud_conflict_id || null)
  };
}

function generateRuntimeId(prefix) {
  kcloudRuntimeCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${String(kcloudRuntimeCounter).padStart(3, "0")}`;
}

function uniqueConflicts(conflicts) {
  const seen = new Set();
  const output = [];
  for (const conflict of conflicts) {
    const key = [conflict.conflict_type, conflict.project_id || "", conflict.task_id || "", conflict.kcloud_node_id || "", conflict.scope || "", conflict.other_id || ""].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(conflict);
  }
  return output;
}

function pathsOverlap(left, right) {
  const a = String(left || "").replace(/\\/g, "/").replace(/\/+$/, "");
  const b = String(right || "").replace(/\\/g, "/").replace(/\/+$/, "");
  if (!a || !b) return false;
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function arraysOverlap(left = [], right = []) {
  const leftList = Array.isArray(left) ? left : normalizeList(left);
  const rightList = Array.isArray(right) ? right : normalizeList(right);
  return leftList.some((item) => rightList.some((candidate) => pathsOverlap(item, candidate)));
}

function nextId(items, prefix) {
  const count = Array.isArray(items) ? items.length + 1 : 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

function upsertById(items, record, key) {
  const index = items.findIndex((item) => item[key] === record[key]);
  if (index >= 0) items[index] = { ...items[index], ...record };
  else items.push(record);
}

function buildKcloudPolicyDecisionSummary(report) {
  return {
    decision: report.decision,
    reason: report.reason,
    risk_level: report.risk_level,
    requires_owner_approval: report.requires_owner_approval,
    evidence_id: report.evidence_id,
    timestamp: report.timestamp
  };
}

function buildKcloudReportRows(records, columns) {
  return table(columns, records);
}

function renderKcloudReport(report) {
  if (!report || typeof report !== "object") return "KCloud governance report unavailable.";
  if (report.report_type === "multi_ai_kcloud_status") {
    return [
      "KCloud governance status",
      `Nodes: ${report.counts.nodes}`,
      `Trusted nodes: ${report.counts.trusted_nodes}`,
      `Projects: ${report.counts.projects}`,
      `Tokens: ${report.counts.tokens}`,
      `Leases: ${report.counts.active_leases}`,
      `Conflicts: ${report.counts.open_conflicts}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_kcloud_nodes") {
    return buildKcloudReportRows((report.nodes || []).map((item) => [
      item.kcloud_node_id,
      item.governance_cloud_node_id,
      item.node_type,
      item.trust_status,
      item.status
    ]), ["KCloud Node", "Governance Node", "Type", "Trust", "Status"]);
  }
  if (report.report_type === "multi_ai_kcloud_trust_status") {
    return buildKcloudReportRows((report.trust_records || []).map((item) => [
      item.kcloud_node_id,
      item.governance_cloud_node_id,
      item.trust_status,
      item.owner_approved ? "yes" : "no",
      item.status
    ]), ["KCloud Node", "Governance Node", "Trust", "Owner Approved", "Status"]);
  }
  if (report.report_type === "multi_ai_kcloud_permissions") {
    return buildKcloudReportRows((report.permissions || []).map((item) => [
      item.kcloud_node_id,
      (item.allowed_actions || []).join(", "),
      (item.denied_actions || []).join(", "),
      item.risk_level,
      item.status
    ]), ["KCloud Node", "Allowed Actions", "Denied Actions", "Risk", "Status"]);
  }
  if (report.report_type === "multi_ai_kcloud_token_status") {
    return buildKcloudReportRows((report.tokens || []).map((item) => [
      item.kcloud_task_token_id,
      item.kcloud_node_id,
      item.task_id || "",
      item.risk_level,
      item.status
    ]), ["Token", "Node", "Task", "Risk", "Status"]);
  }
  if (report.report_type === "multi_ai_kcloud_leases") {
    return buildKcloudReportRows((report.leases || []).map((item) => [
      item.kcloud_lease_id,
      item.lease_type,
      item.scope,
      item.branch || "",
      item.kcloud_node_id,
      item.task_id || "",
      item.status
    ]), ["Lease", "Type", "Scope", "Branch", "Node", "Task", "Status"]);
  }
  if (report.report_type === "multi_ai_kcloud_conflicts") {
    return buildKcloudReportRows((report.conflicts || []).map((item) => [
      item.conflict_id,
      item.conflict_type,
      item.scope || "",
      item.status
    ]), ["Conflict", "Type", "Scope", "Status"]);
  }
  if (report.report_type === "multi_ai_kcloud_policy_decision" || report.report_type === "multi_ai_kcloud_packet_check") {
    return [
      "KCloud policy decision",
      `Decision: ${report.decision}`,
      `Risk: ${report.risk_level}`,
      `Owner approval required: ${report.requires_owner_approval ? "yes" : "no"}`,
      report.reason ? `Reason: ${report.reason}` : null,
      report.packet_id ? `Packet: ${report.packet_id}` : null,
      report.evidence_id ? `Evidence: ${report.evidence_id}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_kcloud_approval_status") {
    return buildKcloudReportRows((report.approval_requests || []).map((item) => [
      item.kcloud_node_id || "",
      item.task_id || "",
      item.status || ""
    ]), ["Node", "Task", "Status"]);
  }
  if (report.report_type === "multi_ai_kcloud_audit") {
    return buildKcloudReportRows((report.events || []).map((item) => [
      item.audit_event_id,
      item.event_type,
      item.entity_type,
      item.entity_id
    ]), ["Audit", "Event", "Type", "Entity"]);
  }
  if (report.report_type === "multi_ai_kcloud_evidence") {
    return buildKcloudReportRows((report.evidence || []).map((item) => [
      item.kcloud_evidence_id,
      item.packet_id || "",
      item.task_id || "",
      item.decision || ""
    ]), ["Evidence", "Packet", "Task", "Decision"]);
  }
  return JSON.stringify(report, null, 2);
}

module.exports = {
  multiAiKcloudGovernance,
  buildKcloudStatusReport,
  buildKcloudNodesReport,
  mapKcloudNode,
  mapKcloudProject,
  buildKcloudTrustStatusReport,
  buildKcloudPermissionsReport,
  handlePermissionsAction,
  grantKcloudPermission,
  revokeKcloudPermission,
  buildKcloudApprovalStatusReport,
  buildKcloudApprovalRequestsReport,
  buildKcloudTokenStatusReport,
  issueKcloudTaskToken,
  buildKcloudLeaseReport,
  createKcloudLease,
  releaseKcloudLease,
  buildKcloudConflictsReport,
  checkKcloudPacket,
  evaluateKcloudPolicy,
  buildKcloudAuditReport,
  buildKcloudEvidenceReport,
  buildKcloudPacketEvidenceReport,
  renderKcloudReport,
  readKcloudNodesState,
  writeKcloudNodesState,
  readKcloudIdentityMapState,
  writeKcloudIdentityMapState,
  readKcloudTrustState,
  writeKcloudTrustState,
  readKcloudProjectMapState,
  writeKcloudProjectMapState,
  readKcloudPermissionsState,
  writeKcloudPermissionsState,
  readKcloudTaskTokensState,
  writeKcloudTaskTokensState,
  readKcloudApprovalRulesState,
  writeKcloudApprovalRulesState,
  readKcloudLeasesState,
  writeKcloudLeasesState,
  readKcloudConflictsState,
  writeKcloudConflictsState,
  readKcloudUngovernedPacketsState,
  writeKcloudUngovernedPacketsState,
  readKcloudPacketEvidenceState,
  writeKcloudPacketEvidenceState,
  readKcloudPolicyDecisionsState,
  writeKcloudPolicyDecisionsState,
  readKcloudApprovalRequestsState,
  writeKcloudApprovalRequestsState,
  readKcloudAuditLogState,
  writeKcloudAuditLogState,
  readKcloudEvidenceState,
  writeKcloudEvidenceState,
  recordKcloudApprovalRequest
};
