const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot } = require("../../../src/cli/fs_utils");
const {
  buildEvolutionTemporaryPrioritiesReport,
  ensureEvolutionDevelopmentPriorities,
  buildEvolutionPriorityExecutionDetails
} = require("../../../src/cli/services/evolution");
const {
  buildGovernanceCandidatePool,
  resolvePlannedAiCandidateFromList,
  resolvePlannedWorkersForDistribution: resolvePlannedWorkersForDistributionService
} = require("../../../src/cli/services/ai_planner");
const { watchMultiAiRelay } = require("../../../src/cli/services/multi_ai_relay");
const ideWindowGovernance = require("./ide_window_governance");
const localProjectGovernance = require("./local_project_governance");
const wifiGovernance = require("./wifi_lan_governance");
const kcloudGovernance = require("./kcloud_governance");
const githubProviderGovernance = require("./github_provider_governance");
const wifiDataSharingClient = require("../integrations/wifi_data_sharing_client");

const STATE_FILE = ".kabeeri/multi_ai_governance/evolution_assignments.json";
const SESSION_FILE = ".kabeeri/multi_ai_governance/evolution_sessions.json";
const EVOLUTION_FILE = ".kabeeri/evolution.json";
const MULTI_AI_FILE = ".kabeeri/multi_ai_governance.json";

function buildEvolutionAssignmentBridgeReport(state = {}, flags = {}, deps = {}, options = {}) {
  ensureWorkspace();
  const generatedAt = new Date().toISOString();
  const multiAiState = normalizeMultiAiState(state);
  const evolutionSnapshot = readEvolutionSnapshot();
  const activePriority = evolutionSnapshot.active_priority || null;
  const temporaryQueue = evolutionSnapshot.temporary_queue || null;
  const activeLeaderSession = getActiveLeaderSession(multiAiState);
  const leaderSession = activeLeaderSession || null;
  const caseMatrix = buildCaseMatrix(flags, deps);
  const localContext = localProjectGovernance.readLocalProjectState ? {
    project: localProjectGovernance.readLocalProjectState(),
    machine: localProjectGovernance.readLocalMachineState ? localProjectGovernance.readLocalMachineState() : null
  } : {
    project: null,
    machine: null
  };
  const candidatePool = buildGovernanceCandidatePool(multiAiState);
  const leaderAiId = leaderSession
    ? leaderSession.leader_ai_id
    : resolvePlannedAiCandidateFromList(candidatePool, {
        title: activePriority ? activePriority.title : flags.title,
        name: activePriority ? activePriority.title : flags.name,
        label: flags.label,
        description: activePriority ? activePriority.summary : flags.description,
        summary: activePriority ? activePriority.summary : flags.summary,
        topic: activePriority ? activePriority.title : flags.topic
      }, {
        searchKeys: ["title", "name", "label", "description", "summary", "topic"]
      });
  const plannedWorkerAis = resolvePlannedWorkersForDistributionService(multiAiState, leaderSession || (leaderAiId ? { leader_ai_id: leaderAiId } : null), temporaryQueue, flags);
  const executionDetails = activePriority ? buildEvolutionPriorityExecutionDetails(activePriority, {
    appMode: resolveEvolutionTrackName(evolutionSnapshot).includes("vibe")
  }) : null;
  const decision = evaluateBridgeDecision(caseMatrix, activePriority, plannedWorkerAis, flags, executionDetails);
  const assignmentMode = plannedWorkerAis.length && (decision.decision === "allow" || decision.decision === "warn")
    ? "master_worker_split"
    : "master_only";
  const assignmentSignature = buildAssignmentSignature({
    evolutionPriorityId: activePriority ? activePriority.id : null,
    leaderAiId,
    workerAiIds: plannedWorkerAis,
    decision,
    caseMatrix
  });
  const currentAssignment = persistBridgeAssignment({
    assignment_signature: assignmentSignature,
    evolution_priority_id: activePriority ? activePriority.id : null,
    evolution_priority_title: activePriority ? activePriority.title : null,
    track: resolveEvolutionTrackName(evolutionSnapshot),
    leader_ai_id: leaderAiId || null,
    leader_session_id: leaderSession ? leaderSession.session_id : null,
    worker_ai_ids: plannedWorkerAis,
    assignment_mode: assignmentMode,
    publication_policy: {
      canonical_output_owner: "master_laptop",
      worker_output_mode: "patch_only",
      merge_authority: "master_laptop",
      push_authority: "master_laptop"
    },
    push_policy: {
      master_only: true,
      worker_push_allowed: false
    },
    case_summary: caseMatrix,
    blocked_cases: caseMatrix.filter((item) => item.blocking || item.requires_owner_approval).map((item) => item.case_id),
    requires_owner_approval: decision.decision === "require_owner_approval",
    risk_level: decision.risk_level,
    status: decision.decision,
    reason: decision.reason,
    next_action: buildNextAction(decision, plannedWorkerAis.length),
    generated_at: generatedAt
  });

  return {
    report_type: "multi_ai_evolution_assignment_bridge",
    generated_at: generatedAt,
    operation: options.operation || "status",
    status: decision.decision === "allow" ? "ready" : decision.decision === "warn" ? "attention" : decision.decision === "require_owner_approval" ? "approval_required" : "blocked",
    decision: decision.decision,
    reason: decision.reason,
    risk_level: decision.risk_level,
    requires_owner_approval: decision.decision === "require_owner_approval",
    evolution_priority: activePriority,
    evolution_execution_details: executionDetails,
    evolution_temporary_priority_queue: temporaryQueue,
    leader_session: leaderSession,
    master_context: localContext,
    candidate_pool: {
      total: candidatePool.length,
      leader_ai_id: leaderAiId || null,
      worker_ai_ids: plannedWorkerAis
    },
    assignment_policy: {
      assignment_mode: assignmentMode,
      canonical_output_owner: "master_laptop",
      worker_output_mode: "patch_only",
      merge_authority: "master_laptop",
      push_authority: "master_laptop",
      owner_track: "framework_owner",
      developer_track: "vibe_app_developer"
    },
    case_matrix: caseMatrix,
    distribution_plan: {
      should_distribute: decision.decision === "allow" || decision.decision === "warn",
      leader_ai_id: leaderAiId || null,
      worker_ai_ids: plannedWorkerAis,
      worker_count: plannedWorkerAis.length,
      assignment_mode: assignmentMode
    },
    current_assignment: currentAssignment,
    next_action: buildNextAction(decision, plannedWorkerAis.length)
  };
}

function buildEvolutionAssignmentBridgeAssignReport(state = {}, flags = {}, deps = {}, options = {}) {
  const report = buildEvolutionAssignmentBridgeReport(state, flags, deps, {
    ...options,
    operation: "assign"
  });
  return report;
}

function buildEvolutionAssignmentWorkflowReport(state = {}, flags = {}, deps = {}, options = {}) {
  const bridgeReport = buildEvolutionAssignmentBridgeReport(state, flags, deps, {
    ...options,
    operation: "workflow"
  });
  const assignment = bridgeReport.current_assignment || {};
  const workerIds = Array.isArray(assignment.worker_ai_ids) ? assignment.worker_ai_ids : [];
  const masterChecklist = [
    "Keep this laptop as the only push authority.",
    "Run `kvdf multi-ai evolution status` to review the live assignment.",
    "Run `kvdf multi-ai evolution assign` only when the bridge decision is allow or warn.",
    "Run `kvdf multi-ai evolution session master --watch` to broadcast approved assignments automatically.",
    "Give the worker laptop only the approved file or folder lease.",
    "Review the worker diff and run the relevant tests here.",
    "Commit and push only from this laptop."
  ];
  const workerPrompt = buildWorkerPrompt(bridgeReport, workerIds);
  return {
    report_type: "multi_ai_evolution_assignment_workflow",
    generated_at: bridgeReport.generated_at,
    decision: bridgeReport.decision,
    status: bridgeReport.status,
    risk_level: bridgeReport.risk_level,
    requires_owner_approval: bridgeReport.requires_owner_approval,
    current_assignment: assignment,
    master_laptop: {
      machine_id: bridgeReport.master_context && bridgeReport.master_context.machine ? bridgeReport.master_context.machine.machine_id : null,
      repo_root: bridgeReport.master_context && bridgeReport.master_context.project ? bridgeReport.master_context.project.repo_root : repoRoot(),
      role: "canonical_output_owner",
      push_authority: "master_laptop",
      responsibilities: masterChecklist
    },
    worker_laptop: {
      worker_ai_ids: workerIds,
      role: "worker_only",
      push_authority: "none",
      responsibilities: [
      "Edit only the leased scope.",
      "Do not push to GitHub.",
      "Do not widen scope.",
      "Report changed files, tests, blockers, and risks back to the master laptop.",
      "Start `kvdf multi-ai evolution session worker --watch` on the worker laptop."
      ],
      prompt: workerPrompt
    },
    master_checklist: masterChecklist,
    worker_prompt: workerPrompt,
    next_action: bridgeReport.next_action
  };
}

function buildEvolutionAssignmentSessionReport(state = {}, flags = {}, deps = {}, options = {}) {
  const bridgeReport = buildEvolutionAssignmentBridgeReport(state, flags, deps, {
    ...options,
    operation: "session"
  });
  const generatedAt = bridgeReport.generated_at;
  const appendAudit = typeof deps.appendAudit === "function" ? deps.appendAudit : null;
  const wifiClient = resolveEvolutionWifiClient(deps);
  const sessionState = ensureEvolutionAssignmentSessionState(readEvolutionAssignmentSessionState());
  const sessionRole = resolveEvolutionSessionRole(flags, options);
  const sessionRecord = ensureEvolutionSessionRecord(sessionState, sessionRole);
  const discoveryResult = refreshEvolutionSessionDiscovery({
    wifiClient,
    sessionRole,
    sessionRecord,
    flags
  });
  const transportStatus = wifiClient && wifiClient.buildWifiDataSharingIntegrationStatus
    ? wifiClient.buildWifiDataSharingIntegrationStatus()
    : { available: false, status: "unavailable", next_action: "Enable wifi_data_sharing first." };
  const workerPrompt = buildWorkerPrompt(bridgeReport, Array.isArray(bridgeReport.current_assignment && bridgeReport.current_assignment.worker_ai_ids)
    ? bridgeReport.current_assignment.worker_ai_ids
    : []);
  const masterChecklist = [
    "Keep this laptop as the canonical output owner and only GitHub pusher.",
    "Keep the assignment bridge decision aligned with all five governance cases.",
    "Discover trusted worker nodes, process worker join requests, then broadcast only the approved assignment packet to those ready nodes.",
    "Do not widen scope beyond the current Evolution assignment.",
    "Review the worker result here before any merge or push."
  ];
  const localNode = transportStatus && transportStatus.local_node ? transportStatus.local_node : null;
  const discoveredNodes = wifiClient && wifiClient.listWifiDataSharingCandidates ? wifiClient.listWifiDataSharingCandidates() : [];
  const trustedNodes = wifiClient && wifiClient.listTrustedWifiNodes ? wifiClient.listTrustedWifiNodes() : [];
  const workerJoinRequests = wifiClient && wifiClient.listWifiDataSharingInbox
    ? extractEvolutionWorkerJoinRequests(wifiClient.listWifiDataSharingInbox(), localNode)
    : [];
  const workerPool = buildEvolutionWorkerPool({
    localNode,
    trustedNodes,
    discoveredNodes,
    join_requests: workerJoinRequests,
    flags,
    bridgeReport,
    sessionRecord
  });
  const targetNodeIds = Array.isArray(workerPool.target_node_ids) && workerPool.target_node_ids.length
    ? workerPool.target_node_ids.slice()
    : resolveEvolutionWorkerTargets({
        localNode,
        trustedNodes,
        discoveredNodes,
        flags,
        bridgeReport,
        sessionRecord
      });
  const targetNodeId = targetNodeIds.length ? targetNodeIds[0] : null;
  const targetNode = targetNodeId
    ? workerPool.ready_workers.find((node) => node && node.node_id === targetNodeId)
      || workerPool.trusted_workers.find((node) => node && node.node_id === targetNodeId)
      || workerPool.discovered_workers.find((node) => node && node.node_id === targetNodeId)
      || null
    : null;
  const assignmentPacketPayload = buildEvolutionSessionPacketPayload({
    bridgeReport,
    workerPrompt,
    masterChecklist,
    sessionRole,
    targetNodeId,
    targetNodeIds,
    workerPool,
    options
  });
  sessionRecord.worker_pool = workerPool;
  sessionRecord.target_node_ids = targetNodeIds.slice();
  sessionRecord.target_node_id = targetNodeId || null;
  sessionRecord.join_requests = workerJoinRequests.slice();
  let broadcastResult = null;
  let broadcastResults = [];
  let receiptResult = null;
  let joinRequestResult = null;

  if (sessionRole === "worker") {
    joinRequestResult = refreshEvolutionWorkerJoinRequest({
      bridgeReport,
      sessionRecord,
      wifiClient,
      transportStatus,
      workerPool,
      flags,
      generatedAt,
      workerPrompt
    });
    if (joinRequestResult && joinRequestResult.packet_id) {
      sessionRecord.join_request_status = joinRequestResult.status || "requested";
      sessionRecord.join_request_packet_id = joinRequestResult.packet_id || null;
      sessionRecord.join_request_target_node_id = joinRequestResult.target_node_id || null;
      sessionRecord.join_request_at = joinRequestResult.sent_at || generatedAt;
      sessionState.join_requests.push({
        packet_id: joinRequestResult.packet_id || null,
        target_node_id: joinRequestResult.target_node_id || null,
        assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
        assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
        created_at: generatedAt,
        status: joinRequestResult.status || "requested"
      });
      if (appendAudit) {
        appendAudit("multi_ai.evolution_worker_join_requested", "multi_ai_evolution_assignment", sessionRecord.session_id, `Worker join request sent to ${joinRequestResult.target_node_id || "master"}`, {
          packet_id: joinRequestResult.packet_id || null,
          target_node_id: joinRequestResult.target_node_id || null,
          status: joinRequestResult.status || "requested"
        });
      }
    }
  }

  if (sessionRole === "master" && shouldBroadcastEvolutionSession(bridgeReport, sessionRecord, flags, targetNodeIds)) {
    for (const workerNodeId of targetNodeIds) {
      const result = broadcastEvolutionSessionPacket({
        packetPayload: assignmentPacketPayload,
        targetNodeId: workerNodeId,
        flags,
        bridgeReport,
        wifiClient
      });
      broadcastResults.push({
        target_node_id: workerNodeId,
        ...result
      });
      if (result && result.status !== "blocked") {
        broadcastResult = broadcastResult || result;
        sessionState.broadcasts.push({
          packet_id: result.package_id || result.packet_id || null,
          assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
          assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
          target_node_id: workerNodeId,
          created_at: generatedAt,
          status: result.status || "sent"
        });
        if (appendAudit) {
          appendAudit("multi_ai.evolution_session_broadcast", "multi_ai_evolution_assignment", sessionRecord.session_id, `Evolution assignment broadcast to ${workerNodeId}`, {
            assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
            assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
            target_node_id: workerNodeId,
            packet_id: result.package_id || result.packet_id || null,
            status: result.status || "sent"
          });
        }
      }
    }
    if (broadcastResult) {
      sessionRecord.last_broadcast_signature = bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null;
      sessionRecord.last_broadcast_packet_id = broadcastResult ? (broadcastResult.package_id || broadcastResult.packet_id || null) : null;
      sessionRecord.last_broadcast_packet_ids = broadcastResults.map((item) => item.package_id || item.packet_id || null).filter(Boolean);
      sessionRecord.last_broadcast_targets = targetNodeIds.slice();
      sessionRecord.last_broadcast_at = generatedAt;
      sessionRecord.status = "active";
      sessionRecord.mode = "master";
      sessionRecord.watch_mode = Boolean(isTruthyFlag(flags.watch) || isTruthyFlag(flags["watch-mode"]) || options.operation === "watch");
      sessionRecord.target_node_id = targetNodeId || null;
      sessionRecord.target_node_ids = targetNodeIds.slice();
    } else {
      sessionRecord.status = "attention";
      sessionRecord.mode = "master";
      sessionRecord.watch_mode = Boolean(isTruthyFlag(flags.watch) || isTruthyFlag(flags["watch-mode"]) || options.operation === "watch");
      sessionRecord.target_node_id = targetNodeId || null;
      sessionRecord.target_node_ids = targetNodeIds.slice();
    }
  }

  if (sessionRole === "worker") {
    receiptResult = receiveEvolutionSessionPacket({
      bridgeReport,
      sessionRecord,
      flags,
      wifiClient
    });
    if (receiptResult && receiptResult.packet_id) {
      sessionRecord.last_received_packet_id = receiptResult.packet_id;
      sessionRecord.last_received_signature = receiptResult.assignment_signature || null;
      sessionRecord.last_received_at = receiptResult.received_at || generatedAt;
      sessionRecord.applied_assignment_id = receiptResult.applied_assignment_id || null;
      sessionRecord.status = receiptResult.status === "applied" ? "active" : "attention";
      sessionRecord.mode = "worker";
      sessionRecord.watch_mode = Boolean(isTruthyFlag(flags.watch) || isTruthyFlag(flags["watch-mode"]) || options.operation === "watch");
      sessionState.receipts.push({
        packet_id: receiptResult.packet_id || receiptResult.package_id || null,
        assignment_id: receiptResult.applied_assignment_id || null,
        assignment_signature: receiptResult.assignment_signature || null,
        created_at: generatedAt,
        status: receiptResult.status || "received"
      });
      if (appendAudit) {
        appendAudit("multi_ai.evolution_session_received", "multi_ai_evolution_assignment", sessionRecord.session_id, `Evolution assignment packet received by worker session`, {
          packet_id: receiptResult.packet_id || receiptResult.package_id || null,
          assignment_id: receiptResult.applied_assignment_id || null,
          assignment_signature: receiptResult.assignment_signature || null,
          status: receiptResult.status || "received"
        });
      }
    } else if (joinRequestResult && joinRequestResult.status && joinRequestResult.status !== "blocked") {
      sessionRecord.status = "ready";
      sessionRecord.mode = "worker";
      sessionRecord.watch_mode = Boolean(isTruthyFlag(flags.watch) || isTruthyFlag(flags["watch-mode"]) || options.operation === "watch");
    }
  }

      sessionRecord.updated_at = generatedAt;
      sessionState.updated_at = generatedAt;
      writeJsonFile(SESSION_FILE, sessionState);

  const inbox = sessionRole === "worker" && receiptResult
    ? [receiptResult]
    : [];
  const dispatchBoard = sessionRole === "master"
    ? [{
        session_role: "master",
        assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
        assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
        target_node_id: targetNodeId || null,
        target_node_ids: targetNodeIds.slice(),
        ready_worker_count: workerPool.ready_worker_count,
        trusted_worker_count: workerPool.trusted_worker_count,
        discovered_worker_count: workerPool.discovered_worker_count,
        broadcast_status: broadcastResult ? broadcastResult.status || "sent" : "waiting",
        last_broadcast_packet_id: sessionRecord.last_broadcast_packet_id || null,
        last_broadcast_packet_ids: Array.isArray(sessionRecord.last_broadcast_packet_ids) ? sessionRecord.last_broadcast_packet_ids.slice() : []
      }]
    : [{
        session_role: "worker",
        assignment_id: receiptResult ? receiptResult.applied_assignment_id || null : bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
        last_received_packet_id: sessionRecord.last_received_packet_id || null,
        applied: Boolean(receiptResult && receiptResult.status === "applied"),
        worker_prompt: receiptResult && receiptResult.worker_prompt ? receiptResult.worker_prompt : workerPrompt
      }];

  return {
    report_type: "multi_ai_evolution_assignment_session",
    generated_at: generatedAt,
    operation: options.operation || "session",
    status: sessionRole === "master"
      ? (broadcastResult
        ? (broadcastResult.status === "blocked" ? "blocked" : bridgeReport.status)
        : "attention")
      : ((receiptResult && receiptResult.status === "applied") || sessionRecord.last_received_signature || (joinRequestResult && joinRequestResult.status && joinRequestResult.status !== "blocked")) ? "ready" : "attention",
    decision: bridgeReport.decision,
    role: sessionRole,
    watch_mode: Boolean(isTruthyFlag(flags.watch) || isTruthyFlag(flags["watch-mode"]) || options.operation === "watch"),
    transport_status: transportStatus,
    discovery_result: discoveryResult,
    target_node_id: targetNodeId || null,
    target_node_ids: targetNodeIds.slice(),
    target_node: targetNode,
    worker_pool: workerPool,
    current_assignment: bridgeReport.current_assignment,
    master_laptop: bridgeReport.master_laptop ? bridgeReport.master_laptop : {
      machine_id: bridgeReport.master_context && bridgeReport.master_context.machine ? bridgeReport.master_context.machine.machine_id : null,
      repo_root: bridgeReport.master_context && bridgeReport.master_context.project ? bridgeReport.master_context.project.repo_root : repoRoot(),
      role: "canonical_output_owner",
      push_authority: "master_laptop",
      responsibilities: masterChecklist
    },
    worker_laptop: bridgeReport.worker_laptop ? bridgeReport.worker_laptop : {
      worker_ai_ids: Array.isArray(bridgeReport.current_assignment && bridgeReport.current_assignment.worker_ai_ids) ? bridgeReport.current_assignment.worker_ai_ids : [],
      role: "worker_only",
      push_authority: "none",
      responsibilities: [
        "Edit only the leased scope.",
        "Do not push to GitHub.",
        "Do not widen scope.",
        "Report changed files, tests, blockers, and risks back to the master laptop."
      ],
      prompt: workerPrompt
    },
    master_checklist: masterChecklist,
    worker_prompt: workerPrompt,
    broadcast_result: broadcastResult,
    broadcast_results: broadcastResults,
    join_request_result: joinRequestResult,
    receipt_result: receiptResult,
    inbox,
    dispatch_board: dispatchBoard,
    next_action: buildEvolutionSessionNextAction(sessionRole, broadcastResult, receiptResult, targetNodeIds)
  };
}

function renderEvolutionAssignmentBridgeReport(report) {
  const assignment = report.current_assignment || {};
  const workerIds = Array.isArray(assignment.worker_ai_ids) ? assignment.worker_ai_ids : [];
  const cases = Array.isArray(report.case_matrix) ? report.case_matrix : [];
  const lines = [
    "Evolution Assignment Bridge",
    "",
    `Status: ${report.status}`,
    `Decision: ${report.decision}`,
    `Priority: ${report.evolution_priority ? `${report.evolution_priority.id} - ${report.evolution_priority.title}` : "none"}`,
    `Leader AI: ${assignment.leader_ai_id || "none"}`,
    `Worker AIs: ${workerIds.length ? workerIds.join(", ") : "none"}`,
    `Assignment mode: ${assignment.assignment_mode || "master_only"}`,
    `Canonical output owner: ${assignment.publication_policy ? assignment.publication_policy.canonical_output_owner : "master_laptop"}`,
    `Push authority: ${assignment.push_policy && assignment.push_policy.master_only ? "master_only" : "shared"}`,
    `Owner approval: ${report.requires_owner_approval ? "required" : "not required"}`,
    `Risk level: ${report.risk_level || "low"}`,
    "",
    "Case matrix:"
  ];
  for (const item of cases) {
    lines.push(`- [${item.case_id}] ${item.case_name}: ${item.readiness_state}${item.blocking ? " (blocking)" : ""}${item.requires_owner_approval ? " (approval)" : ""}`);
  }
  if (!cases.length) lines.push("- none");
  lines.push("", `Next action: ${report.next_action || "Review the bridge report."}`);
  return lines.join("\n");
}

function renderEvolutionAssignmentWorkflowReport(report) {
  const assignment = report.current_assignment || {};
  const workerIds = Array.isArray(assignment.worker_ai_ids) ? assignment.worker_ai_ids : [];
  const lines = [
    "Evolution Two-Laptop Workflow",
    "",
    `Status: ${report.status}`,
    `Decision: ${report.decision}`,
    `Risk level: ${report.risk_level || "low"}`,
    `Owner approval: ${report.requires_owner_approval ? "required" : "not required"}`,
    `Master laptop push authority: ${report.master_laptop ? report.master_laptop.push_authority : "master_laptop"}`,
    `Worker laptops: ${workerIds.length ? workerIds.join(", ") : "none"}`,
    "",
    "Master checklist:"
  ];
  for (const item of Array.isArray(report.master_checklist) ? report.master_checklist : []) {
    lines.push(`- ${item}`);
  }
  lines.push("", "Worker prompt:");
  lines.push(report.worker_prompt || "No worker prompt available.");
  lines.push("", `Next action: ${report.next_action || "Review the workflow report."}`);
  return lines.join("\n");
}

function renderEvolutionAssignmentSessionReport(report) {
  const masterRole = report.role === "master";
  const workerPool = report.worker_pool || {};
  const targetNodeIds = Array.isArray(report.target_node_ids) ? report.target_node_ids : [];
  const broadcastResults = Array.isArray(report.broadcast_results) ? report.broadcast_results : [];
  const lines = [
    "Evolution Two-Laptop Session",
    "",
    `Role: ${report.role || "unknown"}`,
    `Status: ${report.status}`,
    `Decision: ${report.decision}`,
    `Watch mode: ${report.watch_mode ? "on" : "off"}`,
    `Transport: ${report.transport_status && report.transport_status.status ? report.transport_status.status : "unavailable"}`,
    `Discovery: ${report.discovery_result && report.discovery_result.status ? report.discovery_result.status : "not-run"}`,
    `Target node(s): ${targetNodeIds.length ? targetNodeIds.join(", ") : report.target_node_id || "auto"}`,
    ""
  ];
  if (masterRole) {
    lines.push(
      `Worker pool: ${workerPool.ready_worker_count || 0} ready / ${workerPool.trusted_worker_count || 0} trusted / ${workerPool.discovered_worker_count || 0} discovered`
    );
    if (Array.isArray(workerPool.ready_workers) && workerPool.ready_workers.length) {
      lines.push("Ready workers:");
      for (const worker of workerPool.ready_workers) {
        lines.push(`- ${worker.node_id}${worker.display_name ? ` (${worker.display_name})` : ""}`);
      }
    }
    lines.push("");
    lines.push("Master checklist:");
    for (const item of Array.isArray(report.master_checklist) ? report.master_checklist : []) {
      lines.push(`- ${item}`);
    }
    lines.push("", "Broadcast:");
    if (broadcastResults.length) {
      for (const result of broadcastResults) {
        lines.push(`- ${result.target_node_id || "worker"}: ${result.status || "sent"}`);
      }
    } else {
      lines.push(report.broadcast_result ? JSON.stringify(report.broadcast_result, null, 2) : "No broadcast yet.");
    }
  } else {
    lines.push(
      `Worker pool view: ${workerPool.ready_worker_count || 0} ready / ${workerPool.trusted_worker_count || 0} trusted / ${workerPool.discovered_worker_count || 0} discovered`
    );
    lines.push(`Join request: ${report.join_request_result ? report.join_request_result.status || "requested" : sessionRecordStatusFromReport(report)}`);
    lines.push("Worker prompt:");
    lines.push(report.worker_prompt || "No worker prompt available.");
    lines.push("", "Inbox:");
    const inbox = Array.isArray(report.inbox) ? report.inbox : [];
    if (!inbox.length) {
      lines.push("- none");
    } else {
      for (const item of inbox) {
        lines.push(`- ${item.packet_id || item.package_id || "packet"} (${item.status || "received"})`);
      }
    }
  }
  lines.push("", `Next action: ${report.next_action || "Keep the session running."}`);
  return lines.join("\n");
}

function sessionRecordStatusFromReport(report) {
  const session = report && report.role === "worker" ? report : null;
  if (!session) return "waiting";
  if (session.join_request_result && session.join_request_result.status && session.join_request_result.status !== "blocked") {
    return session.join_request_result.status;
  }
  return "waiting";
}

function readEvolutionAssignmentBridgeState() {
  ensureWorkspace();
  if (!localFileExists(STATE_FILE)) {
    writeJsonFile(STATE_FILE, defaultEvolutionAssignmentBridgeState());
  }
  const state = readJsonFile(STATE_FILE);
  return ensureEvolutionAssignmentBridgeState(state);
}

function defaultEvolutionAssignmentBridgeState() {
  return {
    version: "v1",
    current_assignment: null,
    assignments: [],
    updated_at: null
  };
}

function ensureEvolutionAssignmentBridgeState(state) {
  const defaults = defaultEvolutionAssignmentBridgeState();
  state.version = state.version || defaults.version;
  state.current_assignment = state.current_assignment || null;
  state.assignments = Array.isArray(state.assignments) ? state.assignments : [];
  state.updated_at = state.updated_at || null;
  return state;
}

function persistBridgeAssignment(record) {
  const state = readEvolutionAssignmentBridgeState();
  const now = new Date().toISOString();
  const existing = state.current_assignment && state.current_assignment.assignment_signature === record.assignment_signature
    ? state.current_assignment
    : state.assignments.find((item) => item.assignment_signature === record.assignment_signature) || null;
  const assignment = {
    assignment_id: existing ? existing.assignment_id : nextAssignmentId(state),
    created_at: existing ? existing.created_at || now : now,
    updated_at: now,
    ...record
  };
  if (existing && existing.status === "applied") {
    assignment.status = "applied";
    assignment.applied_at = existing.applied_at || assignment.applied_at || now;
    if (existing.distribution_result && !assignment.distribution_result) {
      assignment.distribution_result = existing.distribution_result;
    }
  }
  const filtered = state.assignments.filter((item) => item.assignment_id !== assignment.assignment_id);
  filtered.push(assignment);
  state.assignments = filtered;
  state.current_assignment = assignment;
  state.updated_at = now;
  writeJsonFile(STATE_FILE, state);
  return assignment;
}

function readEvolutionAssignmentSessionState() {
  ensureWorkspace();
  if (!localFileExists(SESSION_FILE)) {
    writeJsonFile(SESSION_FILE, defaultEvolutionAssignmentSessionState());
  }
  const state = readJsonFile(SESSION_FILE);
  return ensureEvolutionAssignmentSessionState(state);
}

function defaultEvolutionAssignmentSessionState() {
  return {
    version: "v1",
    master_session: null,
    worker_session: null,
    broadcasts: [],
    join_requests: [],
    receipts: [],
    updated_at: null
  };
}

function ensureEvolutionAssignmentSessionState(state) {
  const defaults = defaultEvolutionAssignmentSessionState();
  state.version = state.version || defaults.version;
  state.master_session = state.master_session && typeof state.master_session === "object" ? state.master_session : null;
  state.worker_session = state.worker_session && typeof state.worker_session === "object" ? state.worker_session : null;
  state.broadcasts = Array.isArray(state.broadcasts) ? state.broadcasts : [];
  state.join_requests = Array.isArray(state.join_requests) ? state.join_requests : [];
  state.receipts = Array.isArray(state.receipts) ? state.receipts : [];
  state.updated_at = state.updated_at || null;
  return state;
}

function ensureEvolutionSessionRecord(state, role) {
  const now = new Date().toISOString();
  const normalizedRole = role === "worker" ? "worker" : "master";
  const key = normalizedRole === "worker" ? "worker_session" : "master_session";
  const current = state[key] && typeof state[key] === "object" ? state[key] : null;
  const next = {
    session_id: current && current.session_id ? current.session_id : nextEvolutionAssignmentSessionId(state, normalizedRole),
    role: normalizedRole,
    mode: current && current.mode ? current.mode : normalizedRole,
    status: current && current.status ? current.status : "active",
    watch_mode: current && typeof current.watch_mode === "boolean" ? current.watch_mode : false,
    last_broadcast_signature: current && current.last_broadcast_signature ? current.last_broadcast_signature : null,
    last_broadcast_packet_id: current && current.last_broadcast_packet_id ? current.last_broadcast_packet_id : null,
    last_broadcast_at: current && current.last_broadcast_at ? current.last_broadcast_at : null,
    last_broadcast_packet_ids: Array.isArray(current && current.last_broadcast_packet_ids) ? current.last_broadcast_packet_ids.slice() : [],
    last_broadcast_targets: Array.isArray(current && current.last_broadcast_targets) ? current.last_broadcast_targets.slice() : [],
    last_received_signature: current && current.last_received_signature ? current.last_received_signature : null,
    last_received_packet_id: current && current.last_received_packet_id ? current.last_received_packet_id : null,
    last_received_at: current && current.last_received_at ? current.last_received_at : null,
    applied_assignment_id: current && current.applied_assignment_id ? current.applied_assignment_id : null,
    target_node_id: current && current.target_node_id ? current.target_node_id : null,
    target_node_ids: Array.isArray(current && current.target_node_ids) ? current.target_node_ids.slice() : [],
    worker_pool: current && typeof current.worker_pool === "object" ? { ...current.worker_pool } : null,
    last_discovery_mode: current && current.last_discovery_mode ? current.last_discovery_mode : null,
    last_discovery_at: current && current.last_discovery_at ? current.last_discovery_at : null,
    join_request_status: current && current.join_request_status ? current.join_request_status : null,
    join_request_packet_id: current && current.join_request_packet_id ? current.join_request_packet_id : null,
    join_request_target_node_id: current && current.join_request_target_node_id ? current.join_request_target_node_id : null,
    join_request_at: current && current.join_request_at ? current.join_request_at : null,
    created_at: current && current.created_at ? current.created_at : now,
    updated_at: now
  };
  state[key] = next;
  return next;
}

function nextEvolutionAssignmentSessionId(state, role) {
  const suffix = role === "worker" ? "worker" : "master";
  const collection = state && state[suffix === "worker" ? "receipts" : "broadcasts"];
  const count = Array.isArray(collection) ? collection.length + 1 : 1;
  return `multi-ai-evolution-session-${suffix}-${String(count).padStart(3, "0")}`;
}

function resolveEvolutionSessionRole(flags = {}, options = {}) {
  const candidates = [
    options.role,
    flags.role,
    flags.mode,
    flags.side,
    flags.actor,
    flags.session_role,
    flags["session-role"]
  ];
  for (const candidate of candidates) {
    const normalized = String(candidate || "").trim().toLowerCase();
    if (normalized === "master" || normalized === "worker") return normalized;
  }
  return "master";
}

function resolveEvolutionWorkerTarget({ localNode, trustedNodes, flags = {}, bridgeReport = {} } = {}) {
  const targets = resolveEvolutionWorkerTargets({
    localNode,
    trustedNodes,
    discoveredNodes: [],
    flags,
    bridgeReport,
    sessionRecord: null
  });
  return targets.length ? targets[0] : null;
}

function resolveEvolutionWorkerTargets({ localNode, trustedNodes, discoveredNodes = [], flags = {}, bridgeReport = {}, sessionRecord = null } = {}) {
  const explicitTarget = String(flags.to || flags.target || flags.node || flags.node_id || flags["target-node"] || "").trim();
  const trusted = normalizeEvolutionWifiNodeList(trustedNodes, "trusted", localNode);
  const discovered = normalizeEvolutionWifiNodeList(discoveredNodes, "discovered", localNode);
  const readyWorkers = trusted.filter((node) => node.ready !== false);
  if (explicitTarget) {
    return [explicitTarget];
  }
  if (isTruthyFlag(flags["single-target"]) || isTruthyFlag(flags.single_target) || isTruthyFlag(flags.single)) {
    const primary = readyWorkers[0] || trusted[0] || null;
    return primary && primary.node_id ? [primary.node_id] : [];
  }
  const pool = readyWorkers.length ? readyWorkers : trusted;
  const targetIds = pool
    .filter((node) => node && node.node_id && (!localNode || node.node_id !== localNode.node_id))
    .map((node) => node.node_id);
  return dedupeStrings(targetIds);
}

function buildEvolutionWorkerPool({ localNode, trustedNodes, discoveredNodes = [], join_requests = [], flags = {}, bridgeReport = {}, sessionRecord = null } = {}) {
  const trustedWorkers = normalizeEvolutionWifiNodeList(trustedNodes, "trusted", localNode);
  const discoveredWorkers = normalizeEvolutionWifiNodeList(discoveredNodes, "discovered", localNode);
  const joinRequests = Array.isArray(join_requests) ? join_requests : [];
  const readyWorkers = trustedWorkers.filter((node) => node.ready !== false);
  const readyWorkerIds = dedupeStrings(readyWorkers.map((node) => node.node_id).filter(Boolean));
  const discoveredWorkerIds = dedupeStrings(discoveredWorkers.map((node) => node.node_id).filter(Boolean));
  const joinRequestWorkerIds = dedupeStrings(joinRequests.map((item) => item.node_id || item.target_node_id || item.sender_node_id).filter(Boolean));
  const targetNodeIds = resolveEvolutionWorkerTargets({
    localNode,
    trustedNodes: trustedWorkers,
    discoveredNodes: discoveredWorkers,
    flags,
    bridgeReport,
    sessionRecord
  });
  const singleTarget = targetNodeIds.length ? targetNodeIds[0] : null;
  return {
    local_node_id: localNode && localNode.node_id ? localNode.node_id : null,
    discovered_worker_count: discoveredWorkers.length,
    trusted_worker_count: trustedWorkers.length,
    ready_worker_count: readyWorkers.length,
    join_request_count: joinRequests.length,
    discovered_workers: discoveredWorkers,
    trusted_workers: trustedWorkers,
    ready_workers: readyWorkers,
    join_requests: joinRequests,
    ready_worker_ids: readyWorkerIds,
    discovered_worker_ids: discoveredWorkerIds,
    join_request_worker_ids: joinRequestWorkerIds,
    target_node_ids: targetNodeIds,
    target_node_id: singleTarget,
    worker_pool_mode: targetNodeIds.length > 1 ? "multi_target" : targetNodeIds.length === 1 ? "single_target" : "wait",
    ready_to_assign: readyWorkers.length > 0,
    last_updated_at: new Date().toISOString(),
    assignment_signature: bridgeReport && bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
    session_role: sessionRecord && sessionRecord.role ? sessionRecord.role : "master"
  };
}

function normalizeEvolutionWifiNodeList(nodes = [], source = "trusted", localNode = null) {
  return (Array.isArray(nodes) ? nodes : [])
    .map((node) => normalizeEvolutionWifiNode(node, source))
    .filter((node) => node && node.node_id && (!localNode || node.node_id !== localNode.node_id));
}

function normalizeEvolutionWifiNode(node, source = "trusted") {
  if (!node || typeof node !== "object") return null;
  const trustStatus = String(node.trust_status || "").trim().toLowerCase();
  const ready = trustStatus === "trusted" || trustStatus === "ready" || trustStatus === "paired";
  return {
    node_id: node.node_id || node.wifi_node_id || null,
    display_name: node.display_name || node.hostname || node.name || null,
    hostname: node.hostname || null,
    trust_status: trustStatus || "candidate",
    ready,
    source,
    capabilities: Array.isArray(node.capabilities) ? node.capabilities.slice() : [],
    last_seen_at: node.last_seen_at || null,
    paired_at: node.paired_at || null,
    owner_approved: Boolean(node.owner_approved),
    status: node.status || (ready ? "ready" : "available")
  };
}

function dedupeStrings(values = []) {
  const seen = new Set();
  const result = [];
  for (const value of Array.isArray(values) ? values : []) {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function refreshEvolutionSessionDiscovery({ wifiClient, sessionRole, sessionRecord, flags = {} } = {}) {
  const shouldRefresh = !sessionRecord || !sessionRecord.last_discovery_at;
  if (!shouldRefresh) {
    return sessionRecord && sessionRecord.last_discovery_mode ? {
      status: "cached",
      mode: sessionRecord.last_discovery_mode,
      last_discovery_at: sessionRecord.last_discovery_at
    } : null;
  }
  if (!wifiClient || typeof wifiClient.refreshWifiDataSharingDiscovery !== "function") {
    return null;
  }
  const mode = sessionRole === "worker" ? "advertise" : "discover";
  const result = wifiClient.refreshWifiDataSharingDiscovery(mode, flags);
  if (result && result.status && sessionRecord) {
    sessionRecord.last_discovery_mode = mode;
    sessionRecord.last_discovery_at = new Date().toISOString();
    sessionRecord.updated_at = sessionRecord.last_discovery_at;
  }
  return result || null;
}

function extractEvolutionWorkerJoinRequests(inbox = [], localNode = null) {
  return (Array.isArray(inbox) ? inbox : [])
    .map((item) => {
      const payload = item && typeof item.payload === "object" ? item.payload : {};
      const packetType = String(item && (item.packet_type || item.package_type) || payload.packet_type || payload.report_type || "").trim().toLowerCase();
      const reportType = String(payload.report_type || "").trim().toLowerCase();
      if (!["worker_join_request", "assignment_packet"].includes(packetType) && reportType !== "multi_ai_evolution_worker_join_request") return null;
      const targetNodeId = item.target_node_id || payload.target_node_id || null;
      if (localNode && targetNodeId && targetNodeId !== localNode.node_id) return null;
      return {
        packet_id: item.packet_id || item.package_id || null,
        node_id: item.sender_node_id || payload.sender_node_id || (payload.source_machine && payload.source_machine.node_id) || null,
        target_node_id: targetNodeId,
        sender_node_id: item.sender_node_id || payload.sender_node_id || (payload.source_machine && payload.source_machine.node_id) || null,
        assignment_id: payload.assignment_id || null,
        assignment_signature: payload.assignment_signature || null,
        worker_ai_ids: Array.isArray(payload.worker_ai_ids) ? payload.worker_ai_ids.slice() : [],
        ready_flag: payload.ready_flag !== false,
        requested_at: payload.requested_at || item.created_at || item.received_at || null,
        status: item.status || payload.status || "requested",
        source_machine: payload.source_machine && typeof payload.source_machine === "object" ? { ...payload.source_machine } : null
      };
    })
    .filter(Boolean);
}

function resolveEvolutionMasterTargetNode(nodes = [], localNode = null) {
  const list = Array.isArray(nodes) ? nodes : [];
  const ownerNode = list.find((node) => {
    const trustRole = String(node && (node.trust_role || node.role || "")).trim().toLowerCase();
    return node && node.node_id && (!localNode || node.node_id !== localNode.node_id) && trustRole === "owner";
  });
  return ownerNode || list.find((node) => node && node.node_id && (!localNode || node.node_id !== localNode.node_id)) || null;
}

function refreshEvolutionWorkerJoinRequest({ bridgeReport, sessionRecord, wifiClient, transportStatus, workerPool, flags = {}, generatedAt, workerPrompt } = {}) {
  if (!wifiClient || typeof wifiClient.sendWorkerJoinRequest !== "function") {
    return {
      status: "blocked",
      next_action: "wifi_data_sharing is unavailable."
    };
  }
  const localNode = transportStatus && transportStatus.local_node ? transportStatus.local_node : null;
  const trustedWorkers = Array.isArray(workerPool && workerPool.trusted_workers) ? workerPool.trusted_workers : [];
  const discoveredWorkers = Array.isArray(workerPool && workerPool.discovered_workers) ? workerPool.discovered_workers : [];
  const masterTargetNode = resolveEvolutionMasterTargetNode([
    ...trustedWorkers,
    ...discoveredWorkers
  ], localNode);
  if (!masterTargetNode || !masterTargetNode.node_id) {
    return {
      status: "waiting",
      next_action: "Discover the master laptop first, then join the worker session."
    };
  }
  if (sessionRecord.join_request_target_node_id && sessionRecord.join_request_target_node_id === masterTargetNode.node_id && sessionRecord.join_request_status === "requested") {
    return {
      status: "cached",
      packet_id: sessionRecord.join_request_packet_id || null,
      target_node_id: sessionRecord.join_request_target_node_id || null,
      sent_at: sessionRecord.join_request_at || generatedAt,
      next_action: "Worker join request already sent. Keep waiting for the master assignment."
    };
  }
  const packet = {
    packet_type: "worker_join_request",
    title: `Worker join request :: ${bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : "assignment"}`,
    payload: {
      report_type: "multi_ai_evolution_worker_join_request",
      title: `Worker join request :: ${bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : "assignment"}`,
      session_role: "worker",
      session_id: sessionRecord.session_id,
      ready_flag: true,
      sender_node_id: localNode ? localNode.node_id || null : null,
      target_node_id: masterTargetNode.node_id,
      worker_ai_ids: Array.isArray(bridgeReport.current_assignment && bridgeReport.current_assignment.worker_ai_ids) ? bridgeReport.current_assignment.worker_ai_ids.slice() : [],
      worker_pool: workerPool || null,
      assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
      assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
      worker_prompt: workerPrompt,
      source_machine: localNode ? {
        node_id: localNode.node_id || null,
        display_name: localNode.display_name || null,
        hostname: localNode.hostname || null
      } : null,
      requested_at: generatedAt,
      status: "requested"
    },
    payload_encoding: "json"
  };
  const result = wifiClient.sendWorkerJoinRequest(packet, masterTargetNode.node_id, {
    confirm: true,
    ownerApproved: Boolean(isTruthyFlag(flags["owner-approved"]) || isTruthyFlag(flags.approved))
  });
  if (!result || result.status === "blocked") {
    return result || {
      status: "blocked",
      next_action: "The worker join request could not be sent."
    };
  }
  return {
    status: "requested",
    packet_id: result.package_id || result.packet_id || null,
    target_node_id: masterTargetNode.node_id,
    sent_at: generatedAt,
    next_action: "Worker join request sent. Wait for the master to assign the next evolution task."
  };
}

function resolveEvolutionWifiClient(deps = {}) {
  return deps && (deps.wifiClient || deps.wifiDataSharingClient) ? (deps.wifiClient || deps.wifiDataSharingClient) : wifiDataSharingClient;
}

function buildEvolutionSessionPacketPayload({ bridgeReport, workerPrompt, masterChecklist, sessionRole, targetNodeId, targetNodeIds = [], workerPool = null, options = {} } = {}) {
  return {
    report_type: "multi_ai_evolution_assignment_session_packet",
    packet_kind: "assignment_packet",
    session_role: sessionRole,
    target_node_id: targetNodeId || null,
    target_node_ids: Array.isArray(targetNodeIds) ? targetNodeIds.slice() : [],
    assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
    assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
    current_assignment: bridgeReport.current_assignment || null,
    worker_prompt: workerPrompt,
    master_checklist: masterChecklist,
    worker_pool: workerPool || null,
    workflow_report: {
      report_type: "multi_ai_evolution_assignment_workflow",
      generated_at: bridgeReport.generated_at,
      decision: bridgeReport.decision,
      status: bridgeReport.status,
      risk_level: bridgeReport.risk_level,
      requires_owner_approval: bridgeReport.requires_owner_approval,
      current_assignment: bridgeReport.current_assignment || null
    },
    generated_at: bridgeReport.generated_at
  };
}

function shouldBroadcastEvolutionSession(bridgeReport, sessionRecord, flags = {}, targetNodeIds = []) {
  if (!bridgeReport || !bridgeReport.current_assignment) return false;
  if (!Array.isArray(targetNodeIds) || !targetNodeIds.length) return false;
  if (bridgeReport.decision === "block") return false;
  if (bridgeReport.decision === "require_owner_approval" && !isTruthyFlag(flags["owner-approved"]) && !isTruthyFlag(flags.approved)) return false;
  return sessionRecord.last_broadcast_signature !== bridgeReport.current_assignment.assignment_signature;
}

function broadcastEvolutionSessionPacket({ packetPayload, targetNodeId, flags = {}, bridgeReport = {}, wifiClient = wifiDataSharingClient } = {}) {
  const packet = {
    packet_type: "assignment_packet",
    title: `Evolution session :: ${bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : "assignment"}`,
    payload: packetPayload,
    payload_encoding: "json"
  };
  const providerStatus = wifiClient && wifiClient.buildWifiDataSharingIntegrationStatus ? wifiClient.buildWifiDataSharingIntegrationStatus() : null;
  if (!providerStatus || !providerStatus.available) {
    return {
      status: "blocked",
      next_action: "Enable wifi_data_sharing before broadcasting the session packet."
    };
  }
  const allowed = wifiClient && wifiClient.canSendGovernancePacket
    ? wifiClient.canSendGovernancePacket(packet, targetNodeId, { confirm: true })
    : { status: "blocked", can_send: false, next_action: "wifi_data_sharing is unavailable." };
  if (!allowed || allowed.status === "blocked" || allowed.can_send === false) {
    return allowed || { status: "blocked", next_action: "The session packet cannot be sent." };
  }
  const sent = wifiClient && wifiClient.sendGovernancePacket
    ? wifiClient.sendGovernancePacket(packet, targetNodeId, { confirm: true })
    : { status: "blocked", next_action: "wifi_data_sharing is unavailable." };
  return sent;
}

function receiveEvolutionSessionPacket({ bridgeReport, sessionRecord, flags = {}, wifiClient = wifiDataSharingClient } = {}) {
  const providerStatus = wifiClient && wifiClient.buildWifiDataSharingIntegrationStatus ? wifiClient.buildWifiDataSharingIntegrationStatus() : null;
  if (!providerStatus || !providerStatus.available) {
    return {
      status: "blocked",
      next_action: "Enable wifi_data_sharing before reading session packets."
    };
  }
  const provider = wifiClient && wifiClient.getWifiDataSharingProvider ? wifiClient.getWifiDataSharingProvider() : null;
  if (!provider || typeof provider.listInbox !== "function") {
    return {
      status: "blocked",
      next_action: "wifi_data_sharing inbox is unavailable."
    };
  }
  const inbox = provider.listInbox({ limit: 50 }) || [];
  const relevantPackets = inbox.filter((item) => {
    const payload = item && typeof item.payload === "object" ? item.payload : null;
    const type = String(item.packet_type || item.package_type || payload && payload.report_type || "").trim().toLowerCase();
    const targetPlugin = String(item.target_plugin || payload && payload.target_plugin || "multi_ai_governance").trim().toLowerCase();
    return (type === "assignment_packet" || payload && payload.report_type === "multi_ai_evolution_assignment_session_packet") && targetPlugin === "multi_ai_governance";
  });
  const nextPacket = [...relevantPackets].reverse().find((item) => {
    const payload = item && typeof item.payload === "object" ? item.payload : {};
    const assignmentSignature = payload.assignment_signature || null;
    if (!assignmentSignature) return false;
    if (assignmentSignature === sessionRecord.last_received_signature) return false;
    if (bridgeReport.current_assignment && assignmentSignature !== bridgeReport.current_assignment.assignment_signature) return false;
    return true;
  });
  if (!nextPacket) {
    return {
      status: "waiting",
      next_action: "Waiting for the master laptop to broadcast the next assignment packet.",
      inbox: relevantPackets.slice(-5).reverse()
    };
  }
  const payload = nextPacket.payload && typeof nextPacket.payload === "object" ? nextPacket.payload : {};
  const assignment = payload.current_assignment || bridgeReport.current_assignment || null;
  let appliedAssignment = null;
  if (assignment && assignment.assignment_id) {
    appliedAssignment = markEvolutionAssignmentApplied(assignment.assignment_id, {
      status: "applied",
      applied_at: new Date().toISOString(),
      distribution_result: {
        source: "wifi_data_sharing",
        packet_id: nextPacket.package_id || nextPacket.packet_id || null
      },
      next_action: "Worker session synced from the master broadcast packet."
    });
  }
  return {
    status: appliedAssignment ? "applied" : "received",
    packet_id: nextPacket.packet_id || nextPacket.package_id || null,
    package_id: nextPacket.package_id || null,
    assignment_signature: payload.assignment_signature || null,
    applied_assignment_id: appliedAssignment ? appliedAssignment.assignment_id : assignment && assignment.assignment_id ? assignment.assignment_id : null,
    received_at: nextPacket.received_at || new Date().toISOString(),
    worker_prompt: payload.worker_prompt || buildWorkerPrompt(bridgeReport, Array.isArray(bridgeReport.current_assignment && bridgeReport.current_assignment.worker_ai_ids) ? bridgeReport.current_assignment.worker_ai_ids : []),
    inbox_packet: nextPacket,
    inbox: relevantPackets.slice(-5).reverse()
  };
}

function buildEvolutionSessionNextAction(sessionRole, broadcastResult, receiptResult, targetNodeIds = []) {
  if (sessionRole === "master") {
    if (broadcastResult && broadcastResult.status === "blocked") return broadcastResult.next_action || "Resolve the transport blocker before broadcasting.";
    if (!Array.isArray(targetNodeIds) || !targetNodeIds.length) return "Pair and trust at least one worker node, or pass --to <node-id> for the broadcast.";
    if (targetNodeIds.length === 1) return "Keep the master session running so it can rebroadcast when the assignment changes.";
    return `Keep the master session running so it can rebroadcast to ${targetNodeIds.length} ready worker nodes when the assignment changes.`;
  }
  if (receiptResult && receiptResult.status === "applied") {
    return "Worker session is synced. Keep it running so new broadcasts are applied automatically.";
  }
  if (receiptResult && receiptResult.status === "blocked") {
    return receiptResult.next_action || "Resolve the transport blocker before reading packets.";
  }
  return "Keep the worker session running and wait for the master broadcast.";
}

function markEvolutionAssignmentApplied(assignmentId, patch = {}) {
  const state = readEvolutionAssignmentBridgeState();
  const now = new Date().toISOString();
  const index = state.assignments.findIndex((item) => item.assignment_id === assignmentId);
  if (index < 0) return null;
  const updated = {
    ...state.assignments[index],
    ...patch,
    assignment_id: assignmentId,
    status: patch.status || "applied",
    applied_at: patch.applied_at || now,
    updated_at: now
  };
  state.assignments[index] = updated;
  state.current_assignment = updated;
  state.updated_at = now;
  writeJsonFile(STATE_FILE, state);
  return updated;
}

function nextAssignmentId(state) {
  return `multi-ai-evolution-assignment-${String((state.assignments || []).length + 1).padStart(3, "0")}`;
}

function buildAssignmentSignature(input = {}) {
  return [
    input.evolutionPriorityId || "none",
    input.leaderAiId || "none",
    Array.isArray(input.workerAiIds) ? input.workerAiIds.join(",") : "none",
    input.decision ? input.decision.decision : "unknown",
    Array.isArray(input.caseMatrix) ? input.caseMatrix.map((item) => `${item.case_id}:${item.readiness_state}`).join("|") : "none"
  ].join("::");
}

function buildCaseMatrix(flags = {}, deps = {}) {
  const reports = [
    {
      case_id: "case_1",
      case_name: "IDE Window Governance",
      report: ideWindowGovernance.buildIdeStatusReport(flags, deps)
    },
    {
      case_id: "case_2",
      case_name: "Local Project Governance",
      report: localProjectGovernance.buildLocalStatusReport(flags, deps)
    },
    {
      case_id: "case_3",
      case_name: "Wi-Fi / LAN Governance",
      report: wifiGovernance.buildWifiStatusReport(flags, deps)
    },
    {
      case_id: "case_4",
      case_name: "KCloud Governance",
      report: kcloudGovernance.buildKcloudStatusReport(flags)
    },
    {
      case_id: "case_5",
      case_name: "GitHub Provider Governance",
      report: githubProviderGovernance.buildGithubProviderStatusReport(flags, deps)
    }
  ];
  return reports.map((item) => summarizeCaseReport(item.case_id, item.case_name, item.report));
}

function summarizeCaseReport(caseId, caseName, report) {
  const counts = report && report.counts && typeof report.counts === "object" ? report.counts : {};
  const openConflicts = Number(counts.open_conflicts || counts.conflicts || 0);
  const openApprovals = Number(counts.pending_approvals || counts.approval_requests || counts.open_approvals || 0);
  const explicitDecision = String(report && report.decision || "").trim().toLowerCase();
  const integrationStatus = String(report && report.integration && report.integration.status || "").trim().toLowerCase();
  const integrationUnavailable = ["unavailable", "missing", "not_installed", "disabled"].includes(integrationStatus);
  const realConflict = openConflicts > 0 && !integrationUnavailable;
  const status = realConflict || (explicitDecision === "block" && !integrationUnavailable)
    ? "blocked"
    : explicitDecision === "require_owner_approval" || openApprovals > 0
      ? "approval_required"
      : integrationUnavailable || (report && ["unavailable", "missing", "partial"].includes(String(report.status || "").toLowerCase()))
        ? "degraded"
        : "ready";
  return {
    case_id: caseId,
    case_name: caseName,
    status,
    readiness_state: status,
    open_conflicts: openConflicts,
    open_approvals: openApprovals,
    requires_owner_approval: status === "approval_required",
    blocking: status === "blocked",
    available: Boolean(report),
    integration_status: report && report.integration && report.integration.status ? report.integration.status : null,
    next_action: report && report.next_action ? report.next_action : null
  };
}

function evaluateBridgeDecision(caseMatrix, activePriority, workerAiIds, flags = {}, executionDetails = null) {
  const hasBlockingCases = caseMatrix.some((item) => item.blocking);
  const requiresApprovalCases = caseMatrix.some((item) => item.requires_owner_approval);
  const degradedCases = caseMatrix.filter((item) => item.status === "degraded");
  const priorityText = String([
    activePriority ? activePriority.title : "",
    activePriority ? activePriority.summary : "",
    executionDetails && Array.isArray(executionDetails.included_surfaces) ? executionDetails.included_surfaces.join(" ") : "",
    executionDetails && Array.isArray(executionDetails.implementation_notes) ? executionDetails.implementation_notes.join(" ") : ""
  ].join(" ")).toLowerCase();
  const highRiskPriority = /(release|github|merge|push|deploy|schema|manifest|runtime|\.kabeeri|cloud|wifi|permission|secret|auth|lock|token)/.test(priorityText) || Boolean(flags.high_risk) || Boolean(flags["owner-approval-required"]);
  if (hasBlockingCases) {
    return {
      decision: "block",
      reason: "One or more governance cases reported active conflicts.",
      risk_level: "high"
    };
  }
  if (requiresApprovalCases || highRiskPriority) {
    return {
      decision: "require_owner_approval",
      reason: "The current assignment is high-risk or needs owner approval before distribution.",
      risk_level: "high"
    };
  }
  if (degradedCases.length) {
    return {
      decision: "warn",
      reason: "One or more governance layers are degraded, so the assignment should stay master-led and reviewable.",
      risk_level: "medium"
    };
  }
  if (!workerAiIds.length) {
    return {
      decision: "allow",
      reason: "No worker candidates were available, so the master can keep the assignment local.",
      risk_level: "low"
    };
  }
  return {
    decision: "allow",
    reason: "Evolution assignment is aligned and can be distributed safely.",
    risk_level: "low"
  };
}

function buildNextAction(decision, workerCount) {
  if (decision.decision === "block") {
    return "Resolve the conflicting governance cases before distributing the evolution assignment.";
  }
  if (decision.decision === "require_owner_approval") {
    return "Request owner approval before the worker split is materialized.";
  }
  if (workerCount > 0) {
    return "Run `kvdf multi-ai evolution assign` to materialize the master/worker split.";
  }
  return "Keep the current priority on the master laptop until a worker candidate is registered.";
}

function readEvolutionSnapshot() {
  ensureWorkspace();
  if (!localFileExists(EVOLUTION_FILE)) {
    const state = { development_priorities: [], temporary_priorities: null };
    ensureEvolutionDevelopmentPriorities(state);
    return {
      state,
      active_priority: state.development_priorities.find((item) => item.status === "in_progress") || state.development_priorities.find((item) => item.priority === 1) || null,
      temporary_queue: null
    };
  }
  const state = readJsonFile(EVOLUTION_FILE);
  ensureEvolutionDevelopmentPriorities(state);
  const priorities = Array.isArray(state.development_priorities) ? state.development_priorities : [];
  const activePriority = priorities.find((item) => item.status === "in_progress") || priorities.find((item) => item.priority === 1) || null;
  const temporaryReport = buildEvolutionTemporaryPrioritiesReport(state);
  return {
    state,
    active_priority: activePriority,
    temporary_queue: temporaryReport && temporaryReport.queue ? temporaryReport.queue : null
  };
}

function getActiveLeaderSession(state) {
  const sessions = Array.isArray(state && state.leader_sessions) ? state.leader_sessions : [];
  if (!sessions.length) return null;
  const activeById = state && state.active_leader_session_id
    ? sessions.find((item) => item.session_id === state.active_leader_session_id && item.status === "active")
    : null;
  if (activeById) return activeById;
  return sessions.find((item) => item.status === "active") || null;
}

function normalizeMultiAiState(input = {}) {
  return {
    leader_sessions: Array.isArray(input.leader_sessions) ? input.leader_sessions : [],
    active_leader_session_id: input.active_leader_session_id || null,
    agent_entries: Array.isArray(input.agent_entries) ? input.agent_entries : [],
    worker_queues: Array.isArray(input.worker_queues) ? input.worker_queues : [],
    evolution_governor: input.evolution_governor && typeof input.evolution_governor === "object" ? input.evolution_governor : {},
    updated_at: input.updated_at || null
  };
}

function resolveEvolutionTrackName(evolutionSnapshot = {}) {
  const stateTrack = String(evolutionSnapshot && evolutionSnapshot.state && evolutionSnapshot.state.track || "").trim().toLowerCase();
  if (stateTrack) return stateTrack;
  const priorityTrack = String(evolutionSnapshot && evolutionSnapshot.active_priority && evolutionSnapshot.active_priority.track || "").trim().toLowerCase();
  if (priorityTrack) return priorityTrack;
  return "framework_owner";
}

function buildWorkerPrompt(report, workerIds = []) {
  const assignment = report.current_assignment || {};
  const workerList = workerIds.length ? workerIds.join(", ") : "the worker laptop";
  return [
    "You are the worker laptop for kabeeri.vdf.",
    "",
    "Authority rules:",
    "- multi_ai_governance is the authority.",
    "- .kabeeri is the local runtime source of truth.",
    "- GitHub is source control only.",
    "- You do not push to GitHub.",
    "- You do not self-approve work.",
    "- You do not change files outside the assigned lease.",
    "",
    `Active assignment mode: ${assignment.assignment_mode || "master_only"}`,
    `Canonical output owner: ${assignment.publication_policy ? assignment.publication_policy.canonical_output_owner : "master_laptop"}`,
    `Push authority: ${assignment.push_policy && assignment.push_policy.master_only ? "master_laptop only" : "shared"}`,
    `Worker AI targets: ${workerList}`,
    "",
    "Worker steps:",
    "1. Start `kvdf multi-ai evolution session worker --watch` on the worker laptop.",
    "2. Accept only the assigned task scope.",
    "3. Edit only leased files.",
    "4. Run the relevant tests.",
    "5. Report changed files, results, blockers, and risks.",
    "6. Wait for the master laptop to review and push."
  ].join("\n");
}

function localFileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot(), relativePath));
}

function isTruthyFlag(value) {
  return value === true || value === "true" || value === "1" || value === "yes" || value === "on";
}

module.exports = {
  buildEvolutionAssignmentBridgeReport,
  buildEvolutionAssignmentBridgeAssignReport,
  buildEvolutionAssignmentWorkflowReport,
  buildEvolutionAssignmentSessionReport,
  renderEvolutionAssignmentBridgeReport,
  renderEvolutionAssignmentWorkflowReport,
  renderEvolutionAssignmentSessionReport,
  readEvolutionAssignmentBridgeState,
  readEvolutionAssignmentSessionState,
  defaultEvolutionAssignmentBridgeState,
  ensureEvolutionAssignmentBridgeState,
  defaultEvolutionAssignmentSessionState,
  ensureEvolutionAssignmentSessionState,
  markEvolutionAssignmentApplied
};
