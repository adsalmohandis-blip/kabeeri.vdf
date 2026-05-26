const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot, fileExists } = require("../../../src/cli/fs_utils");
const { table } = require("../../../src/cli/ui");
const { loadGithubProviderRuntime, buildUnavailableGithubProviderReport } = require("../../../src/cli/commands/github_provider");
const localGovernance = require("./local_project_governance");

const GITHUB_PROVIDER_STATE_DIR = ".kabeeri/multi_ai_governance";
const GITHUB_PROVIDER_CONNECTIONS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_connections.json`;
const GITHUB_PROVIDER_REPO_MAP_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_repo_map.json`;
const GITHUB_PROVIDER_SYNC_STATE_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_sync_state.json`;
const GITHUB_PROVIDER_OPERATIONS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_operations.json`;
const GITHUB_PROVIDER_OPERATION_RESULTS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_operation_results.json`;
const GITHUB_PROVIDER_RISK_EVENTS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_risk_events.json`;
const GITHUB_PROVIDER_ISSUE_SYNC_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_issue_sync.json`;
const GITHUB_PROVIDER_PR_SYNC_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_pr_sync.json`;
const GITHUB_PROVIDER_CHECK_RUNS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_check_runs.json`;
const GITHUB_PROVIDER_COMMENTS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_comments.json`;
const GITHUB_PROVIDER_LABELS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_labels.json`;
const GITHUB_PROVIDER_POLICY_DECISIONS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_policy_decisions.json`;
const GITHUB_PROVIDER_APPROVAL_REQUESTS_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_approval_requests.json`;
const GITHUB_PROVIDER_AUDIT_LOG_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_audit_log.json`;
const GITHUB_PROVIDER_EVIDENCE_FILE = `${GITHUB_PROVIDER_STATE_DIR}/github_provider_evidence.json`;

const GITHUB_PROVIDER_OPERATION_TYPES = new Set([
  "read_issue",
  "create_issue",
  "update_issue",
  "comment_issue",
  "read_pr",
  "create_pr",
  "update_pr",
  "comment_pr",
  "request_review",
  "create_check_run",
  "update_check_run",
  "apply_label",
  "remove_label",
  "create_branch",
  "protect_branch",
  "create_release",
  "update_release"
]);

const GITHUB_PROVIDER_HIGH_RISK_OPERATIONS = new Set([
  "create_pr",
  "update_pr",
  "create_check_run",
  "update_check_run",
  "create_branch",
  "protect_branch",
  "create_release",
  "update_release"
]);

let githubProviderRuntimeCounter = 0;

function multiAiGithubProviderGovernance(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const appendAudit = typeof deps.appendAudit === "function" ? deps.appendAudit : null;
  const subaction = normalizeAction(value, flags);

  if (!action || action === "status" || action === "summary") {
    return buildGithubProviderStatusReport(flags, deps);
  }
  if (subaction === "status" || subaction === "summary" || subaction === "show") {
    return buildGithubProviderStatusReport(flags, deps);
  }
  if (subaction === "map-repo" || subaction === "map_repo" || subaction === "map") {
    return mapGithubProviderRepo(flags, appendAudit);
  }
  if (subaction === "sync" && (normalizeAction(rest[0], flags) === "status" || !rest.length)) {
    return buildGithubProviderSyncStatusReport(flags, deps);
  }
  if (subaction === "operation") {
    return handleGithubProviderOperationAction(normalizeAction(rest[0], flags), flags, deps, appendAudit, rest.slice(1));
  }
  if (subaction === "issue") {
    return handleGithubProviderIssueAction(normalizeAction(rest[0], flags), flags, deps, appendAudit);
  }
  if (subaction === "pr") {
    return handleGithubProviderPrAction(normalizeAction(rest[0], flags), flags, deps, appendAudit);
  }
  if (subaction === "check") {
    return handleGithubProviderCheckAction(normalizeAction(rest[0], flags), flags, deps, appendAudit);
  }
  if (subaction === "comment") {
    return handleGithubProviderCommentAction(flags, deps, appendAudit);
  }
  if (subaction === "label") {
    return handleGithubProviderLabelAction(flags, deps, appendAudit);
  }
  if (subaction === "risk" || subaction === "risk-check" || subaction === "risk_check") {
    return evaluateGithubProviderPolicy(flags, deps, appendAudit);
  }
  if (subaction === "policy" || subaction === "policy-check" || subaction === "policy_check" || subaction === "evaluate") {
    return evaluateGithubProviderPolicy(flags, deps, appendAudit);
  }
  if (subaction === "approval") {
    return buildGithubProviderApprovalStatusReport(flags);
  }
  if (subaction === "audit") {
    return buildGithubProviderAuditReport(flags);
  }
  if (subaction === "evidence") {
    return buildGithubProviderEvidenceReport(flags);
  }

  throw new Error(`Unknown github-provider governance action: ${action}${subaction ? ` ${subaction}` : ""}`);
}

function buildGithubProviderStatusReport(flags = {}, deps = {}) {
  const provider = getGithubProviderRuntime(deps);
  const localProject = readLocalProjectContext();
  const connectionsState = readGithubProviderConnectionsState();
  const repoMapState = readGithubProviderRepoMapState();
  const syncState = readGithubProviderSyncState();
  const operationsState = readGithubProviderOperationsState();
  const policyState = readGithubProviderPolicyDecisionsState();
  const providerStatus = provider && typeof provider.buildGithubProviderStatus === "function"
    ? provider.buildGithubProviderStatus({ cwd: localProject.project.repo_root || repoRoot(), ...flags })
    : buildUnavailableGithubProviderReport("status");
  return {
    report_type: "multi_ai_github_provider_status",
    generated_at: new Date().toISOString(),
    status: "available",
    integration: {
      plugin_id: "github_provider",
      available: Boolean(provider),
      provider_status: providerStatus.status || "unavailable",
      governance_status: "active"
    },
    local_project: localProject.project,
    local_machine: localProject.machine,
    counts: {
      connections: connectionsState.connections.length,
      mapped_repos: repoMapState.repo_mappings.length,
      sync_events: syncState.events.length,
      operations: operationsState.operations.length,
      policy_decisions: policyState.decisions.length
    },
    provider_status: providerStatus,
    next_action: provider
      ? "Use `kvdf multi-ai github-provider map-repo` or `kvdf multi-ai github-provider policy check`."
      : "Install or enable github_provider to use GitHub provider-backed workflows."
  };
}

function buildGithubProviderSyncStatusReport(flags = {}, deps = {}) {
  const provider = getGithubProviderRuntime(deps);
  const syncState = readGithubProviderSyncState();
  const providerReadiness = provider && typeof provider.buildGithubProviderReadiness === "function"
    ? provider.buildGithubProviderReadiness({ cwd: repoRoot(), ...flags })
    : buildUnavailableGithubProviderReport("readiness");
  return {
    report_type: "multi_ai_github_provider_sync_status",
    generated_at: new Date().toISOString(),
    status: provider ? "ok" : "warning",
    provider_readiness: providerReadiness,
    sync_events: syncState.events,
    counts: {
      sync_events: syncState.events.length,
      open_operations: readGithubProviderOperationsState().operations.filter((item) => item.status !== "completed").length
    }
  };
}

function mapGithubProviderRepo(flags = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const context = readLocalProjectContext();
  const state = readGithubProviderConnectionsState();
  const repoMapState = readGithubProviderRepoMapState();
  const repoRemote = String(getFlag(flags, "repo_remote", "repo-remote", "repoRemote", "remote") || "").trim() || inferRepoRemote(flags, context);
  const githubOwner = String(getFlag(flags, "github_owner", "github-owner", "githubOwner", "owner") || inferGithubOwner(repoRemote)).trim() || null;
  const githubRepo = String(getFlag(flags, "github_repo", "github-repo", "githubRepo", "repo") || inferGithubRepo(repoRemote)).trim() || null;
  const connection = {
    github_provider_connection_id: getFlag(flags, "github_provider_connection_id", "github-provider-connection-id", "githubProviderConnectionId") || nextId(state.connections, "github-provider-connection"),
    github_account_id: getFlag(flags, "github_account_id", "github-account-id", "githubAccountId") || null,
    github_owner: githubOwner,
    github_repo: githubRepo,
    repo_remote: repoRemote,
    project_id: getFlag(flags, "project_id", "project-id", "projectId") || context.project.project_id || null,
    machine_id: getFlag(flags, "machine_id", "machine-id", "machineId") || context.machine.machine_id || null,
    owner_id: getFlag(flags, "owner_id", "owner-id", "ownerId", "owner") || context.project.owner_id || null,
    provider_status: "available",
    governance_status: "mapped",
    last_synced_at: now,
    status: getFlag(flags, "status") || "active"
  };
  upsertById(state.connections, connection, "github_provider_connection_id");
  state.updated_at = now;
  writeGithubProviderConnectionsState(state);

  upsertById(repoMapState.repo_mappings, {
    github_provider_connection_id: connection.github_provider_connection_id,
    github_owner: connection.github_owner,
    github_repo: connection.github_repo,
    repo_remote: connection.repo_remote,
    project_id: connection.project_id,
    machine_id: connection.machine_id,
    owner_id: connection.owner_id,
    provider_status: connection.provider_status,
    governance_status: connection.governance_status,
    last_synced_at: now,
    status: connection.status
  }, "github_provider_connection_id");
  repoMapState.updated_at = now;
  writeGithubProviderRepoMapState(repoMapState);

  const syncState = readGithubProviderSyncState();
  syncState.events.push({
    github_provider_sync_event_id: nextId(syncState.events, "github-provider-sync"),
    github_provider_connection_id: connection.github_provider_connection_id,
    project_id: connection.project_id,
    repo_remote: connection.repo_remote,
    event_type: "repo_mapped",
    status: "recorded",
    created_at: now
  });
  syncState.updated_at = now;
  writeGithubProviderSyncState(syncState);

  recordGithubProviderAudit("github_provider.repo.mapped", "github_provider_connection", connection.github_provider_connection_id, `Mapped GitHub repo ${connection.github_owner || ""}/${connection.github_repo || ""}`.trim(), connection, appendAudit);
  return {
    report_type: "multi_ai_github_provider_repo_mapped",
    generated_at: now,
    status: "ok",
    connection,
    next_action: "Use `kvdf multi-ai github-provider operation request` to govern GitHub work."
  };
}

function handleGithubProviderOperationAction(action, flags = {}, deps = {}, appendAudit = null, rest = []) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "status" || normalized === "show" || normalized === "list") {
    return buildGithubProviderOperationsReport(flags);
  }
  if (normalized === "request" || normalized === "create" || normalized === "add") {
    return requestGithubProviderOperation(flags, deps, appendAudit);
  }
  if (normalized === "execute" || normalized === "run" || normalized === "apply") {
    return executeGithubProviderOperation(flags, deps, appendAudit);
  }
  throw new Error(`Unknown github-provider operation action: ${normalized}`);
}

function handleGithubProviderIssueAction(action, flags = {}, deps = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "sync" || normalized === "status" || normalized === "show") {
    return createGovernedGithubProviderOperation("create_issue", "issue sync", flags, deps, appendAudit);
  }
  return createGovernedGithubProviderOperation(normalized === "create" ? "create_issue" : "update_issue", `issue ${normalized}`, flags, deps, appendAudit);
}

function handleGithubProviderPrAction(action, flags = {}, deps = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "sync" || normalized === "status" || normalized === "show") {
    return createGovernedGithubProviderOperation("create_pr", "pr sync", flags, deps, appendAudit);
  }
  return createGovernedGithubProviderOperation(normalized === "create" ? "create_pr" : "update_pr", `pr ${normalized}`, flags, deps, appendAudit);
}

function handleGithubProviderCheckAction(action, flags = {}, deps = {}, appendAudit = null) {
  const normalized = normalizeAction(action);
  if (!normalized || normalized === "run" || normalized === "status" || normalized === "show") {
    return createGovernedGithubProviderOperation("create_check_run", "check run", flags, deps, appendAudit);
  }
  return createGovernedGithubProviderOperation("update_check_run", `check ${normalized}`, flags, deps, appendAudit);
}

function handleGithubProviderCommentAction(flags = {}, deps = {}, appendAudit = null) {
  const operationType = String(getFlag(flags, "target_type", "target-type", "targetType", "target") || "comment_issue").trim().toLowerCase() === "pr"
    ? "comment_pr"
    : "comment_issue";
  return createGovernedGithubProviderOperation(operationType, "comment", flags, deps, appendAudit);
}

function handleGithubProviderLabelAction(flags = {}, deps = {}, appendAudit = null) {
  const operationType = isTruthyFlag(getFlag(flags, "remove", "delete", "unlabel")) ? "remove_label" : "apply_label";
  return createGovernedGithubProviderOperation(operationType, "label", flags, deps, appendAudit);
}

function requestGithubProviderOperation(flags = {}, deps = {}, appendAudit = null) {
  const operationType = normalizeOperationType(getFlag(flags, "operation_type", "operation-type", "operationType", "type") || getFlag(flags, "requested_action", "requested-action", "requestedAction") || "read_issue");
  return createGovernedGithubProviderOperation(operationType, "operation request", flags, deps, appendAudit, { auto_execute: false });
}

function executeGithubProviderOperation(flags = {}, deps = {}, appendAudit = null) {
  const operationId = String(getFlag(flags, "github_operation_id", "github-operation-id", "githubOperationId", "operation") || "").trim();
  const state = readGithubProviderOperationsState();
  const operation = operationId
    ? state.operations.find((item) => item.github_operation_id === operationId)
    : [...state.operations].reverse().find((item) => item.status === "requested" || item.status === "approved");
  if (!operation) {
    return buildGithubProviderBlockedReport("GitHub provider operation not found.", "operation execute");
  }
  const decision = operation.governance_decision || evaluateGithubProviderPolicy(operation, deps, appendAudit);
  if (decision.decision === "block") {
    return buildGithubProviderBlockedReport(decision.reason || "GitHub provider operation blocked.", "operation execute", { decision });
  }
  const providerResult = buildGithubProviderExecutionResult(operation, deps);
  const now = new Date().toISOString();
  const resultsState = readGithubProviderOperationResultsState();
  const result = {
    github_provider_result_id: nextId(resultsState.results, "github-provider-result"),
    github_operation_id: operation.github_operation_id,
    provider_plugin: "github_provider",
    provider_action: providerResult.provider_action,
    provider_result: providerResult.provider_report,
    status: providerResult.status || "ok",
    created_at: now,
    updated_at: now
  };
  resultsState.results.push(result);
  resultsState.updated_at = now;
  writeGithubProviderOperationResultsState(resultsState);

  operation.provider_result = result;
  operation.executed_at = now;
  operation.status = "completed";
  operation.updated_at = now;
  writeGithubProviderOperationsState(state);

  recordGithubProviderEvidence({ ...operation, provider_result_id: result.github_provider_result_id }, appendAudit);
  recordGithubProviderAudit("github_provider.operation.executed", "github_provider_operation", operation.github_operation_id, `Executed GitHub provider operation ${operation.operation_type}`, { operation, result }, appendAudit);
  return {
    report_type: "multi_ai_github_provider_operation_executed",
    generated_at: now,
    status: "ok",
    operation,
    provider_result: result
  };
}

function createGovernedGithubProviderOperation(operationType, requestedAction, flags = {}, deps = {}, appendAudit = null, options = {}) {
  const request = buildGithubProviderOperationRequest(operationType, requestedAction, flags);
  const decision = evaluateGithubProviderPolicy(request, deps, appendAudit);
  request.governance_decision = decision;
  request.status = decision.decision === "allow" ? "approved" : decision.decision === "require_owner_approval" ? "pending_approval" : "blocked";
  persistGithubProviderOperation(request);
  if (decision.decision === "allow" && options.auto_execute !== false) {
    return executeGithubProviderOperation({ github_operation_id: request.github_operation_id }, deps, appendAudit);
  }
  if (decision.decision === "require_owner_approval") {
    recordGithubProviderApprovalRequest(request, decision, appendAudit);
  }
  return {
    report_type: "multi_ai_github_provider_operation_request",
    generated_at: new Date().toISOString(),
    operation: request,
    governance_decision: decision,
    next_action: decision.decision === "allow"
      ? "Execute the operation with `kvdf multi-ai github-provider operation execute`."
      : "Resolve the issue or obtain owner approval before execution."
  };
}

function buildGithubProviderOperationRequest(operationType, requestedAction, flags = {}) {
  const now = new Date().toISOString();
  const localProject = readLocalProjectContext();
  const repoMapState = readGithubProviderRepoMapState();
  const activeRepoMap = repoMapState.repo_mappings[repoMapState.repo_mappings.length - 1] || {};
  return {
    github_operation_id: nextOperationId(readGithubProviderOperationsState().operations),
    operation_type: normalizeOperationType(operationType),
    project_id: getFlag(flags, "project_id", "project-id", "projectId") || activeRepoMap.project_id || localProject.project.project_id || null,
    github_owner: getFlag(flags, "github_owner", "github-owner", "githubOwner", "owner") || activeRepoMap.github_owner || null,
    github_repo: getFlag(flags, "github_repo", "github-repo", "githubRepo", "repo") || activeRepoMap.github_repo || null,
    issue_number: getFlag(flags, "issue_number", "issue-number", "issueNumber", "issue") || null,
    pr_number: getFlag(flags, "pr_number", "pr-number", "prNumber", "pr") || null,
    branch_name: getFlag(flags, "branch_name", "branch-name", "branchName", "branch") || null,
    task_id: getFlag(flags, "task_id", "task-id", "taskId", "task") || null,
    agent_id: getFlag(flags, "agent_id", "agent-id", "agentId", "agent") || null,
    tool_id: getFlag(flags, "tool_id", "tool-id", "toolId", "tool") || null,
    actor_id: getFlag(flags, "actor_id", "actor-id", "actorId", "actor", "owner") || localProject.project.owner_id || null,
    requested_action: requestedAction || normalizeOperationType(operationType),
    payload_summary: buildPayloadSummary(flags),
    risk_level: normalizeRiskLevel(getFlag(flags, "risk_level", "risk-level", "riskLevel") || inferOperationRisk(operationType, flags)),
    requires_owner_approval: false,
    governance_decision: null,
    provider_result: null,
    created_at: now,
    executed_at: null,
    status: "requested"
  };
}

function buildPayloadSummary(flags = {}) {
  const payload = {
    title: getFlag(flags, "title") || null,
    body: getFlag(flags, "body") || null,
    labels: normalizeList(getFlag(flags, "labels") || []),
    comment: getFlag(flags, "comment") || null,
    check_name: getFlag(flags, "check_name", "check-name", "checkName") || null,
    release_tag: getFlag(flags, "release_tag", "release-tag", "releaseTag") || null
  };
  return JSON.stringify(payload);
}

function evaluateGithubProviderPolicy(input, deps = {}, appendAudit = null) {
  const now = new Date().toISOString();
  const opType = normalizeOperationType(input.operation_type || input.requested_action || "read_issue");
  const taskId = String(input.task_id || getFlag(input, "task_id", "task-id", "taskId", "task") || "").trim() || null;
  const projectId = String(input.project_id || getFlag(input, "project_id", "project-id", "projectId") || "").trim() || null;
  const githubOwner = String(input.github_owner || getFlag(input, "github_owner", "github-owner", "githubOwner", "owner") || "").trim() || null;
  const githubRepo = String(input.github_repo || getFlag(input, "github_repo", "github-repo", "githubRepo", "repo") || "").trim() || null;
  const branchName = String(input.branch_name || getFlag(input, "branch_name", "branch-name", "branchName", "branch") || "").trim() || null;
  const issueNumber = String(input.issue_number || getFlag(input, "issue_number", "issue-number", "issueNumber", "issue") || "").trim() || null;
  const prNumber = String(input.pr_number || getFlag(input, "pr_number", "pr-number", "prNumber", "pr") || "").trim() || null;
  const actorId = String(input.actor_id || getFlag(input, "actor_id", "actor-id", "actorId", "actor", "owner") || "").trim() || null;
  const agentId = String(input.agent_id || getFlag(input, "agent_id", "agent-id", "agentId", "agent") || "").trim() || null;
  const toolId = String(input.tool_id || getFlag(input, "tool_id", "tool-id", "toolId", "tool") || "").trim() || null;
  const provider = getGithubProviderRuntime(deps);
  const providerAvailable = Boolean(provider);
  let decision = "allow";
  let reason = "GitHub provider operation is permitted.";
  let riskLevel = normalizeRiskLevel(input.risk_level || inferOperationRisk(opType, input));
  let requiresOwnerApproval = false;

  if (!githubOwner || !githubRepo) {
    decision = "block";
    reason = "GitHub repo mapping is missing.";
    riskLevel = "high";
  } else if (!taskId && isWriteOperation(opType)) {
    decision = "block";
    reason = "GitHub provider writes require a linked KVDF task.";
    riskLevel = "high";
  } else if (GITHUB_PROVIDER_HIGH_RISK_OPERATIONS.has(opType) || isHighRiskGithubProviderPath(input) || /release|protect|branch/i.test(opType)) {
    decision = "require_owner_approval";
    reason = "High-risk GitHub provider operation requires owner approval.";
    requiresOwnerApproval = true;
    riskLevel = "high";
  } else if (!providerAvailable) {
    decision = isReadOperation(opType) ? "warn" : "block";
    reason = "github_provider is unavailable.";
    riskLevel = "high";
  }

  const decisionRecord = {
    github_provider_decision_id: nextId(readGithubProviderPolicyDecisionsState().decisions, "github-provider-decision"),
    decision,
    reason,
    risk_level: riskLevel,
    requires_owner_approval: requiresOwnerApproval,
    project_id: projectId || null,
    github_provider_connection_id: String(getFlag(input, "github_provider_connection_id", "github-provider-connection-id", "githubProviderConnectionId") || "").trim() || null,
    github_owner: githubOwner,
    github_repo: githubRepo,
    task_id: taskId,
    issue_number: issueNumber,
    pr_number: prNumber,
    branch_name: branchName,
    operation_type: opType,
    actor_id: actorId,
    agent_id: agentId,
    tool_id: toolId,
    provider_result_id: null,
    evidence_id: null,
    timestamp: now
  };

  if (decision === "require_owner_approval") {
    recordGithubProviderApprovalRequest({
      ...decisionRecord,
      status: "pending"
    }, decisionRecord, appendAudit);
  }

  const decisionsState = readGithubProviderPolicyDecisionsState();
  decisionsState.decisions.push(decisionRecord);
  decisionsState.updated_at = now;
  writeGithubProviderPolicyDecisionsState(decisionsState);
  recordGithubProviderAudit("github_provider.policy.checked", "github_provider_policy_decision", decisionRecord.github_provider_decision_id, `GitHub provider policy decision: ${decision}`, decisionRecord, appendAudit);
  if (decision === "allow" || decision === "warn" || decision === "require_owner_approval") {
    decisionRecord.evidence_id = recordGithubProviderEvidence(decisionRecord, appendAudit);
    writeGithubProviderPolicyDecisionsState(decisionsState);
  }

  return decisionRecord;
}

function buildGithubProviderOperationsReport(flags = {}) {
  const state = readGithubProviderOperationsState();
  const githubOwner = getFlag(flags, "github_owner", "github-owner", "githubOwner", "owner") || null;
  const githubRepo = getFlag(flags, "github_repo", "github-repo", "githubRepo", "repo") || null;
  const operations = (githubOwner || githubRepo)
    ? state.operations.filter((item) => (!githubOwner || item.github_owner === githubOwner) && (!githubRepo || item.github_repo === githubRepo))
    : state.operations;
  return {
    report_type: "multi_ai_github_provider_operations",
    generated_at: new Date().toISOString(),
    status: "ok",
    operations,
    counts: {
      total: state.operations.length,
      selected: operations.length,
      pending: state.operations.filter((item) => item.status === "requested").length,
      completed: state.operations.filter((item) => item.status === "completed").length
    }
  };
}

function buildGithubProviderApprovalStatusReport(flags = {}) {
  const state = readGithubProviderApprovalRequestsState();
  return {
    report_type: "multi_ai_github_provider_approval_status",
    generated_at: new Date().toISOString(),
    status: "ok",
    approval_requests: state.requests,
    counts: {
      total: state.requests.length,
      pending: state.requests.filter((item) => item.status === "pending").length
    }
  };
}

function buildGithubProviderAuditReport(flags = {}) {
  const state = readGithubProviderAuditLogState();
  return {
    report_type: "multi_ai_github_provider_audit",
    generated_at: new Date().toISOString(),
    status: "ok",
    events: state.events,
    counts: {
      total: state.events.length
    }
  };
}

function buildGithubProviderEvidenceReport(flags = {}) {
  const state = readGithubProviderEvidenceState();
  return {
    report_type: "multi_ai_github_provider_evidence",
    generated_at: new Date().toISOString(),
    status: "ok",
    evidence: state.evidence,
    counts: {
      total: state.evidence.length
    }
  };
}

function buildGithubProviderBlockedReport(message, action, extra = {}) {
  const now = new Date().toISOString();
  return {
    report_type: "multi_ai_github_provider_blocked",
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

function buildGithubProviderExecutionResult(operation, deps = {}) {
  const provider = getGithubProviderRuntime(deps);
  if (!provider) {
    return {
      provider_action: operation.operation_type,
      provider_report: buildUnavailableGithubProviderReport(operation.operation_type),
      status: "unavailable"
    };
  }
  const mode = mapOperationToProviderPlan(operation.operation_type);
  const payload = buildProviderPayload(operation);
  if (mode === "issue-plan" && typeof provider.buildGithubIssuePlan === "function") {
    return { provider_action: mode, provider_report: provider.buildGithubIssuePlan(payload), status: "ok" };
  }
  if (mode === "pr-plan" && typeof provider.buildGithubPrPlan === "function") {
    return { provider_action: mode, provider_report: provider.buildGithubPrPlan(payload), status: "ok" };
  }
  if (mode === "release-plan" && typeof provider.buildGithubReleasePlan === "function") {
    return { provider_action: mode, provider_report: provider.buildGithubReleasePlan(payload), status: "ok" };
  }
  if (mode === "sync-plan" && typeof provider.buildGithubSyncPlan === "function") {
    return { provider_action: mode, provider_report: provider.buildGithubSyncPlan(payload), status: "ok" };
  }
  if (mode === "readiness" && typeof provider.buildGithubProviderReadiness === "function") {
    return { provider_action: mode, provider_report: provider.buildGithubProviderReadiness(payload), status: "ok" };
  }
  if (mode === "status" && typeof provider.buildGithubProviderStatus === "function") {
    return { provider_action: mode, provider_report: provider.buildGithubProviderStatus(payload), status: "ok" };
  }
  if (typeof provider.buildGithubProviderStatus === "function") {
    return { provider_action: "status", provider_report: provider.buildGithubProviderStatus(payload), status: "ok" };
  }
  return {
    provider_action: mode,
    provider_report: buildUnavailableGithubProviderReport(operation.operation_type),
    status: "unavailable"
  };
}

function buildProviderPayload(operation) {
  return {
    cwd: repoRoot(),
    version: operation.release_tag || operation.branch_name || operation.github_repo || undefined,
    branch_name: operation.branch_name || undefined,
    title: operation.payload_summary || undefined,
    repo: operation.github_owner && operation.github_repo ? `${operation.github_owner}/${operation.github_repo}` : undefined
  };
}

function mapOperationToProviderPlan(operationType) {
  if (["create_issue", "update_issue", "comment_issue", "apply_label", "remove_label"].includes(operationType)) return "issue-plan";
  if (["read_pr", "create_pr", "update_pr", "comment_pr", "request_review"].includes(operationType)) return "pr-plan";
  if (["create_release", "update_release"].includes(operationType)) return "release-plan";
  if (["create_branch", "protect_branch"].includes(operationType)) return "sync-plan";
  if (["read_issue", "create_check_run", "update_check_run"].includes(operationType)) return "status";
  return "status";
}

function recordGithubProviderApprovalRequest(operation, decision, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readGithubProviderApprovalRequestsState();
  const request = {
    github_provider_approval_request_id: nextId(state.requests, "github-provider-approval"),
    github_provider_decision_id: decision.github_provider_decision_id || null,
    github_operation_id: operation.github_operation_id || null,
    project_id: operation.project_id || null,
    github_owner: operation.github_owner || null,
    github_repo: operation.github_repo || null,
    task_id: operation.task_id || null,
    reason: decision.reason || null,
    risk_level: decision.risk_level || "medium",
    status: "pending",
    created_at: now,
    updated_at: now
  };
  state.requests.push(request);
  state.updated_at = now;
  writeGithubProviderApprovalRequestsState(state);
  recordGithubProviderAudit("github_provider.approval.requested", "github_provider_approval_request", request.github_provider_approval_request_id, request.reason || "GitHub provider approval requested", request, appendAudit);
  return request;
}

function recordGithubProviderEvidence(data, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readGithubProviderEvidenceState();
  const record = {
    github_provider_evidence_id: nextId(state.evidence, "github-provider-evidence"),
    github_provider_decision_id: data.github_provider_decision_id || null,
    github_operation_id: data.github_operation_id || null,
    project_id: data.project_id || null,
    github_owner: data.github_owner || null,
    github_repo: data.github_repo || null,
    task_id: data.task_id || null,
    operation_type: data.operation_type || null,
    decision: data.decision || null,
    reason: data.reason || null,
    risk_level: data.risk_level || "medium",
    created_at: now,
    status: "recorded"
  };
  state.evidence.push(record);
  state.updated_at = now;
  writeGithubProviderEvidenceState(state);
  recordGithubProviderAudit("github_provider.evidence.recorded", "github_provider_evidence", record.github_provider_evidence_id, `GitHub provider evidence recorded for ${record.github_operation_id || "operation"}`, record, appendAudit);
  return record.github_provider_evidence_id;
}

function recordGithubProviderAudit(eventType, entityType, entityId, message, payload, appendAudit = null) {
  const now = new Date().toISOString();
  const state = readGithubProviderAuditLogState();
  const record = {
    github_provider_audit_event_id: nextId(state.events, "github-provider-audit"),
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    message,
    payload: payload || null,
    created_at: now
  };
  state.events.push(record);
  state.updated_at = now;
  writeGithubProviderAuditLogState(state);
  if (appendAudit) appendAudit(eventType, entityType, entityId, message, payload);
  return record;
}

function buildGithubProviderOperationResultReport(flags = {}) {
  const state = readGithubProviderOperationResultsState();
  return {
    report_type: "multi_ai_github_provider_operation_results",
    generated_at: new Date().toISOString(),
    status: "ok",
    results: state.results
  };
}

function buildGithubProviderRiskEventsReport(flags = {}) {
  const state = readGithubProviderRiskEventsState();
  return {
    report_type: "multi_ai_github_provider_risk_events",
    generated_at: new Date().toISOString(),
    status: "ok",
    events: state.events
  };
}

function buildGithubProviderRepoMapReport(flags = {}) {
  const state = readGithubProviderRepoMapState();
  return {
    report_type: "multi_ai_github_provider_repo_map",
    generated_at: new Date().toISOString(),
    status: "ok",
    repo_mappings: state.repo_mappings
  };
}

function buildGithubProviderConnectionReport(flags = {}) {
  const state = readGithubProviderConnectionsState();
  return {
    report_type: "multi_ai_github_provider_connections",
    generated_at: new Date().toISOString(),
    status: "ok",
    connections: state.connections
  };
}

function buildGithubProviderPolicyDecisionsReport(flags = {}) {
  const state = readGithubProviderPolicyDecisionsState();
  return {
    report_type: "multi_ai_github_provider_policy_decisions",
    generated_at: new Date().toISOString(),
    status: "ok",
    decisions: state.decisions
  };
}

function buildGithubProviderIssueSyncReport(flags = {}) {
  return readCollectionReport(GITHUB_PROVIDER_ISSUE_SYNC_FILE, "issue_sync_requests", "multi_ai_github_provider_issue_sync");
}

function buildGithubProviderPrSyncReport(flags = {}) {
  return readCollectionReport(GITHUB_PROVIDER_PR_SYNC_FILE, "pr_sync_requests", "multi_ai_github_provider_pr_sync");
}

function buildGithubProviderCheckRunsReport(flags = {}) {
  return readCollectionReport(GITHUB_PROVIDER_CHECK_RUNS_FILE, "check_runs", "multi_ai_github_provider_check_runs");
}

function buildGithubProviderCommentsReport(flags = {}) {
  return readCollectionReport(GITHUB_PROVIDER_COMMENTS_FILE, "comments", "multi_ai_github_provider_comments");
}

function buildGithubProviderLabelsReport(flags = {}) {
  return readCollectionReport(GITHUB_PROVIDER_LABELS_FILE, "labels", "multi_ai_github_provider_labels");
}

function readCollectionReport(file, recordsName, reportType) {
  const state = readJsonState(file, () => baseState(recordsName));
  return {
    report_type: reportType,
    generated_at: new Date().toISOString(),
    status: "ok",
    [recordsName]: state[recordsName] || []
  };
}

function writeGithubProviderIssueSyncRequest(record) {
  return appendToCollectionState(GITHUB_PROVIDER_ISSUE_SYNC_FILE, "issue_sync_requests", record);
}

function writeGithubProviderPrSyncRequest(record) {
  return appendToCollectionState(GITHUB_PROVIDER_PR_SYNC_FILE, "pr_sync_requests", record);
}

function writeGithubProviderCheckRunRequest(record) {
  return appendToCollectionState(GITHUB_PROVIDER_CHECK_RUNS_FILE, "check_runs", record);
}

function writeGithubProviderCommentRequest(record) {
  return appendToCollectionState(GITHUB_PROVIDER_COMMENTS_FILE, "comments", record);
}

function writeGithubProviderLabelRequest(record) {
  return appendToCollectionState(GITHUB_PROVIDER_LABELS_FILE, "labels", record);
}

function appendToCollectionState(file, recordsName, record) {
  const state = readJsonState(file, () => baseState(recordsName));
  state[recordsName] = Array.isArray(state[recordsName]) ? state[recordsName] : [];
  state[recordsName].push(record);
  state.updated_at = new Date().toISOString();
  writeJsonState(file, state);
  return record;
}

function persistGithubProviderOperation(operation) {
  const state = readGithubProviderOperationsState();
  upsertById(state.operations, operation, "github_operation_id");
  state.updated_at = new Date().toISOString();
  writeGithubProviderOperationsState(state);
  return operation;
}

function normalizeOperationType(value) {
  const candidate = String(value || "read_issue").trim().toLowerCase();
  return GITHUB_PROVIDER_OPERATION_TYPES.has(candidate) ? candidate : "read_issue";
}

function normalizeAction(value, flags = {}) {
  const candidate = value !== undefined && value !== null && value !== "" ? value : flags.action || flags.cmd || "";
  return String(candidate || "").trim().toLowerCase();
}

function normalizeRiskLevel(value) {
  const candidate = String(value || "medium").trim().toLowerCase();
  return ["low", "medium", "high", "critical"].includes(candidate) ? candidate : "medium";
}

function isWriteOperation(operationType) {
  return !["read_issue", "read_pr"].includes(operationType);
}

function isReadOperation(operationType) {
  return ["read_issue", "read_pr"].includes(operationType);
}

function inferOperationRisk(operationType, flags = {}) {
  if (GITHUB_PROVIDER_HIGH_RISK_OPERATIONS.has(operationType)) return "high";
  if (["create_issue", "update_issue", "comment_issue", "apply_label", "remove_label", "request_review"].includes(operationType)) return "medium";
  if (isReadOperation(operationType)) return "low";
  return "medium";
}

function isTruthyFlag(value) {
  return value === true || value === "true" || value === "1" || value === "yes" || value === "on";
}

function isHighRiskGithubProviderPath(input = {}) {
  const text = String(input.path || input.file || input.scope || input.branch_name || input.github_repo || "").toLowerCase();
  return [".env", "secret", "secrets", "auth", "security", "workflow", ".github/workflows", "release", "package.json", "plugin.json", "schema"].some((item) => text.includes(item));
}

function inferRepoRemote(flags = {}, context = {}) {
  const owner = getFlag(flags, "github_owner", "github-owner", "githubOwner", "owner") || context.project.owner_id || null;
  const repo = getFlag(flags, "github_repo", "github-repo", "githubRepo", "repo") || context.project.project_id || null;
  if (owner && repo) return `https://github.com/${owner}/${repo}.git`;
  return null;
}

function inferGithubOwner(repoRemote) {
  const match = String(repoRemote || "").match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/i);
  return match ? match[1] : null;
}

function inferGithubRepo(repoRemote) {
  const match = String(repoRemote || "").match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/i);
  return match ? match[2] : null;
}

function readLocalProjectContext() {
  return {
    project: localGovernance.readLocalProjectState(),
    machine: localGovernance.readLocalMachineState()
  };
}

function getGithubProviderRuntime(deps = {}) {
  if (typeof deps.loadRuntime === "function") {
    const runtime = deps.loadRuntime();
    if (runtime && typeof runtime === "object") return runtime;
  }
  return loadGithubProviderRuntime();
}

function readJsonState(file, fallback) {
  if (!fileExists(file)) {
    const initial = typeof fallback === "function" ? fallback() : fallback;
    writeJsonState(file, initial);
    return initial;
  }
  try {
    return readJsonFile(file);
  } catch {
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

function nextId(items, prefix) {
  return `${prefix}-${String((items || []).length + 1).padStart(3, "0")}`;
}

function nextOperationId(items) {
  githubProviderRuntimeCounter += 1;
  return `github-operation-${String((items || []).length + githubProviderRuntimeCounter).padStart(3, "0")}`;
}

function upsertById(items, record, key) {
  const index = items.findIndex((item) => item && item[key] === record[key]);
  if (index >= 0) items[index] = { ...items[index], ...record };
  else items.push(record);
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

function buildGithubProviderBlockedReport(message, action, extra = {}) {
  const now = new Date().toISOString();
  return {
    report_type: "multi_ai_github_provider_blocked",
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

function buildGithubProviderDecisionSummary(report) {
  return {
    decision: report.decision,
    reason: report.reason,
    risk_level: report.risk_level,
    requires_owner_approval: report.requires_owner_approval,
    provider_result_id: report.provider_result_id || null,
    evidence_id: report.evidence_id || null,
    timestamp: report.timestamp
  };
}

function renderGithubProviderReport(report) {
  if (!report || typeof report !== "object") return String(report || "");
  if (report.decision || report.report_type === "multi_ai_github_provider_policy_decision") {
    return JSON.stringify(buildGithubProviderDecisionSummary(report), null, 2);
  }
  return JSON.stringify(report, null, 2);
}

function recordCollectionEvent(file, recordsName, record) {
  const state = readJsonState(file, () => baseState(recordsName));
  state[recordsName] = Array.isArray(state[recordsName]) ? state[recordsName] : [];
  state[recordsName].push(record);
  state.updated_at = new Date().toISOString();
  writeJsonState(file, state);
  return record;
}

function recordRiskEvent(payload) {
  const now = new Date().toISOString();
  const state = readGithubProviderRiskEventsState();
  const record = {
    github_provider_risk_event_id: nextId(state.events, "github-provider-risk"),
    ...payload,
    created_at: now,
    status: payload.status || "recorded"
  };
  state.events.push(record);
  state.updated_at = now;
  writeGithubProviderRiskEventsState(state);
  return record;
}

function buildGithubProviderEvidenceRecord(payload) {
  const now = new Date().toISOString();
  const state = readGithubProviderEvidenceState();
  const record = {
    github_provider_evidence_id: nextId(state.evidence, "github-provider-evidence"),
    ...payload,
    created_at: now,
    status: "recorded"
  };
  state.evidence.push(record);
  state.updated_at = now;
  writeGithubProviderEvidenceState(state);
  return record;
}

function readGithubProviderConnectionsState() {
  return readJsonState(GITHUB_PROVIDER_CONNECTIONS_FILE, () => baseState("connections"));
}

function writeGithubProviderConnectionsState(state) {
  writeJsonState(GITHUB_PROVIDER_CONNECTIONS_FILE, state);
}

function readGithubProviderRepoMapState() {
  return readJsonState(GITHUB_PROVIDER_REPO_MAP_FILE, () => baseState("repo_mappings"));
}

function writeGithubProviderRepoMapState(state) {
  writeJsonState(GITHUB_PROVIDER_REPO_MAP_FILE, state);
}

function readGithubProviderSyncState() {
  return readJsonState(GITHUB_PROVIDER_SYNC_STATE_FILE, () => baseState("events"));
}

function writeGithubProviderSyncState(state) {
  writeJsonState(GITHUB_PROVIDER_SYNC_STATE_FILE, state);
}

function readGithubProviderOperationsState() {
  return readJsonState(GITHUB_PROVIDER_OPERATIONS_FILE, () => baseState("operations"));
}

function writeGithubProviderOperationsState(state) {
  writeJsonState(GITHUB_PROVIDER_OPERATIONS_FILE, state);
}

function readGithubProviderOperationResultsState() {
  return readJsonState(GITHUB_PROVIDER_OPERATION_RESULTS_FILE, () => baseState("results"));
}

function writeGithubProviderOperationResultsState(state) {
  writeJsonState(GITHUB_PROVIDER_OPERATION_RESULTS_FILE, state);
}

function readGithubProviderRiskEventsState() {
  return readJsonState(GITHUB_PROVIDER_RISK_EVENTS_FILE, () => baseState("events"));
}

function writeGithubProviderRiskEventsState(state) {
  writeJsonState(GITHUB_PROVIDER_RISK_EVENTS_FILE, state);
}

function readGithubProviderIssueSyncState() {
  return readJsonState(GITHUB_PROVIDER_ISSUE_SYNC_FILE, () => baseState("issue_sync_requests"));
}

function writeGithubProviderIssueSyncState(state) {
  writeJsonState(GITHUB_PROVIDER_ISSUE_SYNC_FILE, state);
}

function readGithubProviderPrSyncState() {
  return readJsonState(GITHUB_PROVIDER_PR_SYNC_FILE, () => baseState("pr_sync_requests"));
}

function writeGithubProviderPrSyncState(state) {
  writeJsonState(GITHUB_PROVIDER_PR_SYNC_FILE, state);
}

function readGithubProviderCheckRunsState() {
  return readJsonState(GITHUB_PROVIDER_CHECK_RUNS_FILE, () => baseState("check_runs"));
}

function writeGithubProviderCheckRunsState(state) {
  writeJsonState(GITHUB_PROVIDER_CHECK_RUNS_FILE, state);
}

function readGithubProviderCommentsState() {
  return readJsonState(GITHUB_PROVIDER_COMMENTS_FILE, () => baseState("comments"));
}

function writeGithubProviderCommentsState(state) {
  writeJsonState(GITHUB_PROVIDER_COMMENTS_FILE, state);
}

function readGithubProviderLabelsState() {
  return readJsonState(GITHUB_PROVIDER_LABELS_FILE, () => baseState("labels"));
}

function writeGithubProviderLabelsState(state) {
  writeJsonState(GITHUB_PROVIDER_LABELS_FILE, state);
}

function readGithubProviderPolicyDecisionsState() {
  return readJsonState(GITHUB_PROVIDER_POLICY_DECISIONS_FILE, () => baseState("decisions"));
}

function writeGithubProviderPolicyDecisionsState(state) {
  writeJsonState(GITHUB_PROVIDER_POLICY_DECISIONS_FILE, state);
}

function readGithubProviderApprovalRequestsState() {
  return readJsonState(GITHUB_PROVIDER_APPROVAL_REQUESTS_FILE, () => baseState("requests"));
}

function writeGithubProviderApprovalRequestsState(state) {
  writeJsonState(GITHUB_PROVIDER_APPROVAL_REQUESTS_FILE, state);
}

function readGithubProviderAuditLogState() {
  return readJsonState(GITHUB_PROVIDER_AUDIT_LOG_FILE, () => baseState("events"));
}

function writeGithubProviderAuditLogState(state) {
  writeJsonState(GITHUB_PROVIDER_AUDIT_LOG_FILE, state);
}

function readGithubProviderEvidenceState() {
  return readJsonState(GITHUB_PROVIDER_EVIDENCE_FILE, () => baseState("evidence"));
}

function writeGithubProviderEvidenceState(state) {
  writeJsonState(GITHUB_PROVIDER_EVIDENCE_FILE, state);
}

function buildProviderResultFileReport(file, recordsName, reportType) {
  const state = readJsonState(file, () => baseState(recordsName));
  return {
    report_type: reportType,
    generated_at: new Date().toISOString(),
    status: "ok",
    [recordsName]: state[recordsName] || []
  };
}

function inferGithubProviderCommandSurface() {
  return [
    "kvdf multi-ai github-provider status",
    "kvdf multi-ai github-provider map-repo",
    "kvdf multi-ai github-provider sync status",
    "kvdf multi-ai github-provider operation request",
    "kvdf multi-ai github-provider operation status",
    "kvdf multi-ai github-provider operation execute",
    "kvdf multi-ai github-provider risk check",
    "kvdf multi-ai github-provider issue sync",
    "kvdf multi-ai github-provider pr sync",
    "kvdf multi-ai github-provider check run",
    "kvdf multi-ai github-provider comment",
    "kvdf multi-ai github-provider label",
    "kvdf multi-ai github-provider policy check",
    "kvdf multi-ai github-provider approval status",
    "kvdf multi-ai github-provider audit",
    "kvdf multi-ai github-provider evidence"
  ];
}

function buildGithubProviderPathConflictHint(flags = {}) {
  return String(getFlag(flags, "path", "file", "scope", "branch_name", "branch") || "").toLowerCase();
}

function handleGithubProviderRiskCheck(flags = {}, deps = {}, appendAudit = null) {
  return evaluateGithubProviderPolicy(flags, deps, appendAudit);
}

function buildGithubProviderRiskCheckReport(flags = {}) {
  return buildGithubProviderRiskEventsReport(flags);
}

function buildGithubProviderApprovalStatus(flags = {}) {
  return buildGithubProviderApprovalStatusReport(flags);
}

function buildGithubProviderAudit(flags = {}) {
  return buildGithubProviderAuditReport(flags);
}

function buildGithubProviderEvidence(flags = {}) {
  return buildGithubProviderEvidenceReport(flags);
}

function buildGithubProviderDecisionReport(decisionRecord) {
  return {
    report_type: "multi_ai_github_provider_policy_decision",
    generated_at: new Date().toISOString(),
    ...decisionRecord
  };
}

module.exports = {
  multiAiGithubProviderGovernance,
  buildGithubProviderStatusReport,
  buildGithubProviderSyncStatusReport,
  mapGithubProviderRepo,
  requestGithubProviderOperation,
  executeGithubProviderOperation,
  evaluateGithubProviderPolicy,
  buildGithubProviderOperationsReport,
  buildGithubProviderApprovalStatusReport,
  buildGithubProviderAuditReport,
  buildGithubProviderEvidenceReport,
  buildGithubProviderIssueSyncReport,
  buildGithubProviderPrSyncReport,
  buildGithubProviderCheckRunsReport,
  buildGithubProviderCommentsReport,
  buildGithubProviderLabelsReport,
  buildGithubProviderPolicyDecisionsReport,
  buildGithubProviderOperationResultReport,
  buildGithubProviderRiskEventsReport,
  buildGithubProviderBlockedReport,
  buildGithubProviderDecisionSummary,
  renderGithubProviderReport,
  buildGithubProviderDecisionReport,
  buildGithubProviderConnectionReport,
  buildGithubProviderRepoMapReport,
  buildGithubProviderApprovalStatus,
  buildGithubProviderAudit,
  buildGithubProviderEvidence,
  buildProviderResultFileReport,
  inferGithubProviderCommandSurface,
  readGithubProviderConnectionsState,
  writeGithubProviderConnectionsState,
  readGithubProviderRepoMapState,
  writeGithubProviderRepoMapState,
  readGithubProviderSyncState,
  writeGithubProviderSyncState,
  readGithubProviderOperationsState,
  writeGithubProviderOperationsState,
  readGithubProviderOperationResultsState,
  writeGithubProviderOperationResultsState,
  readGithubProviderRiskEventsState,
  writeGithubProviderRiskEventsState,
  readGithubProviderIssueSyncState,
  writeGithubProviderIssueSyncState,
  readGithubProviderPrSyncState,
  writeGithubProviderPrSyncState,
  readGithubProviderCheckRunsState,
  writeGithubProviderCheckRunsState,
  readGithubProviderCommentsState,
  writeGithubProviderCommentsState,
  readGithubProviderLabelsState,
  writeGithubProviderLabelsState,
  readGithubProviderPolicyDecisionsState,
  writeGithubProviderPolicyDecisionsState,
  readGithubProviderApprovalRequestsState,
  writeGithubProviderApprovalRequestsState,
  readGithubProviderAuditLogState,
  writeGithubProviderAuditLogState,
  readGithubProviderEvidenceState,
  writeGithubProviderEvidenceState,
  recordGithubProviderAudit,
  recordGithubProviderEvidence,
  recordGithubProviderApprovalRequest
};
