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
  const masterSummary = buildEvolutionMasterSummary({
    current_assignment: currentAssignment,
    worker_pool: {
      ready_worker_count: plannedWorkerAis.length,
      stale_worker_count: 0,
      trusted_worker_count: plannedWorkerAis.length,
      discovered_worker_count: plannedWorkerAis.length
    },
    recovery_result: null
  });
  const assignmentFreshness = buildEvolutionAssignmentFreshness({
    current_assignment: currentAssignment,
    worker_pool: {
      stale_worker_count: 0
    },
    recovery_result: null
  });
  const sessionHealth = buildEvolutionSessionHealth({
    status: decision.decision === "allow" ? "ready" : decision.decision === "warn" ? "attention" : decision.decision === "require_owner_approval" ? "attention" : "blocked",
    decision: decision.decision,
    worker_pool: {
      stale_worker_count: 0
    },
    master_summary: masterSummary,
    recovery_result: null,
    current_assignment: currentAssignment
  });
  const sessionBadge = buildEvolutionSessionBadge({
    session_health: sessionHealth.health,
    session_health_reason: sessionHealth.reason,
    assignment_freshness: assignmentFreshness.freshness,
    assignment_freshness_reason: assignmentFreshness.reason
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
    master_summary: masterSummary,
    session_badge: sessionBadge.badge,
    session_badge_reason: sessionBadge.reason,
    assignment_freshness: assignmentFreshness.freshness,
    assignment_freshness_reason: assignmentFreshness.reason,
    session_health: sessionHealth.health,
    session_health_reason: sessionHealth.reason,
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
  const sessionBadge = bridgeReport.session_badge
    ? {
        badge: bridgeReport.session_badge,
        reason: bridgeReport.session_badge_reason || ""
      }
    : buildEvolutionSessionBadge({
        session_health: bridgeReport.session_health,
        session_health_reason: bridgeReport.session_health_reason,
        assignment_freshness: bridgeReport.assignment_freshness,
        assignment_freshness_reason: bridgeReport.assignment_freshness_reason
      });
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
    session_badge: sessionBadge.badge,
    session_badge_reason: sessionBadge.reason,
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
  const sessionInbox = wifiClient && wifiClient.listWifiDataSharingInbox ? wifiClient.listWifiDataSharingInbox() : [];
  const workerJoinRequests = extractEvolutionWorkerJoinRequests(sessionInbox, localNode);
  const workerHeartbeats = extractEvolutionWorkerHeartbeats(sessionInbox, localNode);
  const workerResults = extractEvolutionWorkerResults(sessionInbox, localNode);
  const workerPool = buildEvolutionWorkerPool({
    localNode,
    trustedNodes,
    discoveredNodes,
    join_requests: workerJoinRequests,
    heartbeats: workerHeartbeats,
    results: workerResults,
    flags,
    bridgeReport,
    sessionRecord
  });
  const recoveryResult = resolveEvolutionWorkerRecovery(sessionRecord.worker_pool, workerPool, workerJoinRequests, workerHeartbeats, workerResults, generatedAt);
  const masterSummary = buildEvolutionMasterSummary({
    worker_pool: workerPool,
    current_assignment: bridgeReport.current_assignment,
    recovery_result: recoveryResult,
    completed_assignment_ids: sessionRecord.completed_assignment_ids
  });
  const assignmentFreshness = buildEvolutionAssignmentFreshness({
    current_assignment: bridgeReport.current_assignment,
    worker_pool: workerPool,
    recovery_result: recoveryResult,
    recovery_status: sessionRecord.recovery_status || null
  });
  const sessionHealth = buildEvolutionSessionHealth({
    status: sessionRole === "master"
      ? (workerPool.stale_worker_count > 0 ? "attention" : (bridgeReport.status || "ready"))
      : (sessionRecord.last_result_status || sessionRecord.last_received_signature || sessionRecord.join_request_status ? "ready" : "attention"),
    decision: bridgeReport.decision,
    role: sessionRole,
    worker_pool: workerPool,
    master_summary: masterSummary,
    assignment_freshness: assignmentFreshness.freshness,
    assignment_freshness_reason: assignmentFreshness.reason,
    recovery_result: recoveryResult,
    recovery_status: sessionRecord.recovery_status || null,
    current_assignment: bridgeReport.current_assignment,
    completed_assignment_ids: sessionRecord.completed_assignment_ids,
    session_record: sessionRecord
  });
  const sessionBadge = buildEvolutionSessionBadge({
    session_health: sessionHealth.health,
    session_health_reason: sessionHealth.reason,
    assignment_freshness: assignmentFreshness.freshness,
    assignment_freshness_reason: assignmentFreshness.reason
  });
  let completionResult = null;
  if (sessionRole === "master") {
    for (const heartbeat of workerHeartbeats) {
      if (!sessionState.heartbeats.some((item) => item && item.packet_id && item.packet_id === heartbeat.packet_id)) {
        sessionState.heartbeats.push({
          packet_id: heartbeat.packet_id || null,
          target_node_id: heartbeat.target_node_id || null,
          assignment_id: heartbeat.assignment_id || null,
          assignment_signature: heartbeat.assignment_signature || null,
          created_at: heartbeat.requested_at || generatedAt,
          status: heartbeat.status || "alive"
        });
      }
    }
    for (const result of workerResults) {
      if (!sessionState.results.some((item) => item && item.packet_id && item.packet_id === result.packet_id)) {
        sessionState.results.push({
          packet_id: result.packet_id || null,
          target_node_id: result.target_node_id || null,
          assignment_id: result.assignment_id || null,
          assignment_signature: result.assignment_signature || null,
          created_at: result.requested_at || generatedAt,
          status: result.result_status || result.status || "completed"
        });
      }
    }
    const matchingResult = [...workerResults].reverse().find((item) => {
      const currentSignature = bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null;
      const currentAssignmentId = bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null;
      return item && item.assignment_signature && currentSignature && item.assignment_signature === currentSignature && (!currentAssignmentId || !item.assignment_id || item.assignment_id === currentAssignmentId) && ["completed", "done", "applied"].includes(String(item.result_status || item.status || "").toLowerCase());
    });
    if (matchingResult && bridgeReport.current_assignment && bridgeReport.current_assignment.assignment_id) {
      const acknowledgedCompletion = markEvolutionAssignmentCompleted(bridgeReport.current_assignment.assignment_id, {
        status: "completed",
        completed_at: matchingResult.requested_at || generatedAt,
        completion_result: matchingResult
      });
      if (acknowledgedCompletion) {
        bridgeReport.current_assignment = acknowledgedCompletion;
        completionResult = {
          status: "acknowledged",
          result_status: matchingResult.result_status || matchingResult.status || "completed",
          packet_id: matchingResult.packet_id || null,
          target_node_id: matchingResult.target_node_id || null,
          sent_at: matchingResult.requested_at || generatedAt,
          next_action: "Worker completion acknowledged by the master session."
        };
        sessionRecord.completion_status = matchingResult.result_status || matchingResult.status || "completed";
        sessionRecord.last_result_packet_id = matchingResult.packet_id || null;
        sessionRecord.last_result_at = matchingResult.requested_at || generatedAt;
        sessionRecord.last_result_status = matchingResult.result_status || matchingResult.status || "completed";
        sessionRecord.completed_assignment_ids = dedupeStrings([...(sessionRecord.completed_assignment_ids || []), acknowledgedCompletion.assignment_id]);
      }
    }
    if (recoveryResult && Array.isArray(recoveryResult.recovered_worker_ids) && recoveryResult.recovered_worker_ids.length) {
      sessionRecord.recovered_worker_ids = dedupeStrings([...(sessionRecord.recovered_worker_ids || []), ...recoveryResult.recovered_worker_ids]);
      sessionRecord.last_recovery_at = generatedAt;
      sessionRecord.recovery_status = "recovered";
      for (const event of Array.isArray(recoveryResult.recovery_events) ? recoveryResult.recovery_events : []) {
        if (!sessionState.recovery_events.some((item) => item && item.packet_id && item.packet_id === event.packet_id)) {
          sessionState.recovery_events.push(event);
        }
      }
      if (appendAudit) {
        appendAudit("multi_ai.evolution_worker_recovered", "multi_ai_evolution_assignment", sessionRecord.session_id, `Recovered worker node(s): ${recoveryResult.recovered_worker_ids.join(", ")}`, {
          recovered_worker_ids: recoveryResult.recovered_worker_ids.slice(),
          recovery_count: recoveryResult.recovery_count || recoveryResult.recovered_worker_ids.length
        });
      }
    }
  }
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
  sessionRecord.heartbeats = Array.isArray(sessionRecord.heartbeats) ? sessionRecord.heartbeats : [];
  sessionRecord.results = Array.isArray(sessionRecord.results) ? sessionRecord.results : [];
  sessionRecord.recovered_worker_ids = Array.isArray(sessionRecord.recovered_worker_ids) ? sessionRecord.recovered_worker_ids : [];
  let broadcastResult = null;
  let broadcastResults = [];
  let receiptResult = null;
  let joinRequestResult = null;
  let heartbeatResult = null;

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
    heartbeatResult = refreshEvolutionWorkerHeartbeat({
      bridgeReport,
      sessionRecord,
      wifiClient,
      transportStatus,
      workerPool,
      flags,
      generatedAt,
      workerPrompt
    });
    if (heartbeatResult && heartbeatResult.packet_id) {
      sessionRecord.last_heartbeat_at = heartbeatResult.sent_at || generatedAt;
      sessionRecord.heartbeat_status = heartbeatResult.status || "sent";
      sessionRecord.heartbeat_packet_id = heartbeatResult.packet_id || null;
      sessionRecord.heartbeat_target_node_id = heartbeatResult.target_node_id || null;
      sessionState.heartbeats.push({
        packet_id: heartbeatResult.packet_id || null,
        target_node_id: heartbeatResult.target_node_id || null,
        assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
        assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
        created_at: generatedAt,
        status: heartbeatResult.status || "sent"
      });
      if (appendAudit) {
        appendAudit("multi_ai.evolution_worker_heartbeat", "multi_ai_evolution_assignment", sessionRecord.session_id, `Worker heartbeat sent to ${heartbeatResult.target_node_id || "master"}`, {
          packet_id: heartbeatResult.packet_id || null,
          target_node_id: heartbeatResult.target_node_id || null,
          status: heartbeatResult.status || "sent"
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
    completionResult = maybeSendEvolutionWorkerCompletion({
      bridgeReport,
      sessionRecord,
      wifiClient,
      transportStatus,
      workerPool,
      flags,
      generatedAt,
      workerPrompt,
      appendAudit,
      sessionState,
      options
    });
    if (completionResult && completionResult.packet_id) {
      sessionRecord.last_result_packet_id = completionResult.packet_id || null;
      sessionRecord.last_result_at = completionResult.sent_at || generatedAt;
      sessionRecord.last_result_status = completionResult.result_status || "completed";
      sessionRecord.status = completionResult.status === "blocked" ? "attention" : "active";
      sessionRecord.mode = "worker";
      sessionRecord.watch_mode = Boolean(isTruthyFlag(flags.watch) || isTruthyFlag(flags["watch-mode"]) || options.operation === "watch");
      sessionState.results.push({
        packet_id: completionResult.packet_id || null,
        target_node_id: completionResult.target_node_id || null,
        assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
        assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
        created_at: generatedAt,
        status: completionResult.result_status || "completed"
      });
      if (appendAudit) {
        appendAudit("multi_ai.evolution_worker_result", "multi_ai_evolution_assignment", sessionRecord.session_id, `Worker result sent to ${completionResult.target_node_id || "master"}`, {
          packet_id: completionResult.packet_id || null,
          target_node_id: completionResult.target_node_id || null,
          status: completionResult.result_status || "completed"
        });
      }
    }
  }

      sessionRecord.updated_at = generatedAt;
      sessionState.heartbeats = sessionState.heartbeats.slice(-100);
      sessionState.results = sessionState.results.slice(-100);
      sessionState.join_requests = sessionState.join_requests.slice(-100);
      sessionState.broadcasts = sessionState.broadcasts.slice(-100);
      sessionState.receipts = sessionState.receipts.slice(-100);
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
        stale_worker_count: workerPool.stale_worker_count,
        broadcast_status: broadcastResult ? broadcastResult.status || "sent" : "waiting",
        last_broadcast_packet_id: sessionRecord.last_broadcast_packet_id || null,
        last_broadcast_packet_ids: Array.isArray(sessionRecord.last_broadcast_packet_ids) ? sessionRecord.last_broadcast_packet_ids.slice() : []
      }]
    : [{
        session_role: "worker",
        assignment_id: receiptResult ? receiptResult.applied_assignment_id || null : bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
        last_received_packet_id: sessionRecord.last_received_packet_id || null,
        applied: Boolean(receiptResult && receiptResult.status === "applied"),
        heartbeat_status: sessionRecord.heartbeat_status || null,
        heartbeat_packet_id: sessionRecord.heartbeat_packet_id || null,
        last_heartbeat_at: sessionRecord.last_heartbeat_at || null,
        completion_status: sessionRecord.last_result_status || null,
        last_result_packet_id: sessionRecord.last_result_packet_id || null,
        worker_prompt: receiptResult && receiptResult.worker_prompt ? receiptResult.worker_prompt : workerPrompt
      }];

  return {
    report_type: "multi_ai_evolution_assignment_session",
    generated_at: generatedAt,
    operation: options.operation || "session",
    status: sessionRole === "master"
      ? (broadcastResult
        ? (broadcastResult.status === "blocked" ? "blocked" : (workerPool.stale_worker_count > 0 ? "attention" : bridgeReport.status))
        : (workerPool.stale_worker_count > 0 ? "attention" : "attention"))
      : (completionResult && completionResult.status && completionResult.status !== "blocked")
        ? "completed"
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
    master_summary: masterSummary,
    session_badge: sessionBadge.badge,
    session_badge_reason: sessionBadge.reason,
    assignment_freshness: assignmentFreshness.freshness,
    assignment_freshness_reason: assignmentFreshness.reason,
    session_health: sessionHealth.health,
    session_health_reason: sessionHealth.reason,
    current_assignment: bridgeReport.current_assignment,
    heartbeats: Array.isArray(sessionState.heartbeats) ? sessionState.heartbeats.slice(-10).reverse() : [],
    results: Array.isArray(sessionState.results) ? sessionState.results.slice(-10).reverse() : [],
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
    heartbeat_result: heartbeatResult,
    completion_result: completionResult,
    recovery_result: recoveryResult,
    inbox,
    dispatch_board: dispatchBoard,
    next_action: buildEvolutionSessionNextAction(sessionRole, broadcastResult, receiptResult, targetNodeIds, workerPool, completionResult)
  };
}

function buildEvolutionMasterSummary(report = {}) {
  const workerPool = report.worker_pool || {};
  const currentAssignment = report.current_assignment || {};
  const currentStatus = String(currentAssignment.status || "").trim().toLowerCase();
  const activeWorkers = Number(workerPool.ready_worker_count || 0);
  const staleWorkers = Number(workerPool.stale_worker_count || 0);
  const recoveredWorkers = Array.isArray(report.recovered_worker_ids)
    ? report.recovered_worker_ids.length
    : Array.isArray(report.recovery_result && report.recovery_result.recovered_worker_ids)
      ? report.recovery_result.recovered_worker_ids.length
      : 0;
  const pendingAssignments = currentAssignment && currentAssignment.assignment_id && !["applied", "completed"].includes(currentStatus) ? 1 : 0;
  const completedAssignments = Array.isArray(report.completed_assignment_ids)
    ? report.completed_assignment_ids.length
    : currentStatus === "completed"
      ? 1
      : 0;
  return {
    active_workers: activeWorkers,
    stale_workers: staleWorkers,
    recovered_workers: recoveredWorkers,
    pending_assignments: pendingAssignments,
    completed_assignments: completedAssignments
  };
}

function buildEvolutionSessionHealth(report = {}) {
  const workerPool = report.worker_pool || {};
  const masterSummary = report.master_summary || buildEvolutionMasterSummary(report);
  const recoveryResult = report.recovery_result || null;
  const sessionStatus = String(report.status || "").trim().toLowerCase();
  const decision = String(report.decision || "").trim().toLowerCase();
  const recoveredWorkerCount = Array.isArray(recoveryResult && recoveryResult.recovered_worker_ids) ? recoveryResult.recovered_worker_ids.length : 0;
  const staleWorkerCount = Number(workerPool.stale_worker_count || masterSummary.stale_workers || 0);
  if (recoveredWorkerCount > 0 || String(report.recovery_status || "").trim().toLowerCase() === "recovered") {
    return {
      health: "recovery",
      reason: "A worker rejoined after a timeout and the session recorded a recovery event."
    };
  }
  if (sessionStatus === "blocked" || decision === "block") {
    return {
      health: "attention",
      reason: "The bridge or session is blocked and needs a review before continuing."
    };
  }
  if (staleWorkerCount > 0) {
    return {
      health: "attention",
      reason: "One or more workers are stale and should be requeued or refreshed."
    };
  }
  if (sessionStatus === "attention") {
    return {
      health: "attention",
      reason: "The session needs review before the next assignment moves forward."
    };
  }
  if (sessionStatus === "completed") {
    return {
      health: "healthy",
      reason: "The session completed its latest worker result and is ready for the next assignment."
    };
  }
  return {
    health: "healthy",
    reason: "Workers are fresh, the assignment is governed, and no recovery is in progress."
  };
}

function buildEvolutionAssignmentFreshness(report = {}) {
  const assignment = report.current_assignment || {};
  const assignmentStatus = String(assignment.status || "").trim().toLowerCase();
  const workerPool = report.worker_pool || {};
  const recoveryResult = report.recovery_result || null;
  const recoveredWorkerCount = Array.isArray(recoveryResult && recoveryResult.recovered_worker_ids) ? recoveryResult.recovered_worker_ids.length : 0;
  if (recoveredWorkerCount > 0 || String(report.recovery_status || "").trim().toLowerCase() === "recovered") {
    return {
      freshness: "recovered",
      reason: "The current assignment was reactivated after a worker recovery event."
    };
  }
  if (["completed", "applied"].includes(assignmentStatus)) {
    return {
      freshness: "fresh",
      reason: "The current assignment is up to date and has a final applied or completed state."
    };
  }
  if (Number(workerPool.stale_worker_count || 0) > 0) {
    return {
      freshness: "stale",
      reason: "The current assignment is still active, but one or more assigned workers are stale."
    };
  }
  return {
    freshness: "fresh",
    reason: "The current assignment is active and has not fallen behind."
  };
}

function buildEvolutionSessionBadge(report = {}) {
  const sessionHealth = typeof report.session_health === "string" && report.session_health
    ? String(report.session_health).trim().toLowerCase()
    : buildEvolutionSessionHealth(report).health;
  const assignmentFreshness = typeof report.assignment_freshness === "string" && report.assignment_freshness
    ? String(report.assignment_freshness).trim().toLowerCase()
    : buildEvolutionAssignmentFreshness(report).freshness;
  const sessionReason = typeof report.session_health_reason === "string" && report.session_health_reason
    ? String(report.session_health_reason).trim()
    : buildEvolutionSessionHealth(report).reason;
  const freshnessReason = typeof report.assignment_freshness_reason === "string" && report.assignment_freshness_reason
    ? String(report.assignment_freshness_reason).trim()
    : buildEvolutionAssignmentFreshness(report).reason;
  const badge = `${sessionHealth || "healthy"} / ${assignmentFreshness || "fresh"}`;
  const reasonParts = [sessionReason, freshnessReason].filter(Boolean);
  return {
    badge,
    reason: reasonParts.join(" ")
  };
}

function renderEvolutionAssignmentBridgeReport(report) {
  const assignment = report.current_assignment || {};
  const workerIds = Array.isArray(assignment.worker_ai_ids) ? assignment.worker_ai_ids : [];
  const cases = Array.isArray(report.case_matrix) ? report.case_matrix : [];
  const masterSummary = report.master_summary || buildEvolutionMasterSummary(report);
  const sessionBadge = report.session_badge
    ? {
        badge: report.session_badge,
        reason: report.session_badge_reason || ""
      }
    : buildEvolutionSessionBadge({
        session_health: report.session_health,
        session_health_reason: report.session_health_reason,
        assignment_freshness: report.assignment_freshness,
        assignment_freshness_reason: report.assignment_freshness_reason
      });
  const assignmentFreshness = report.assignment_freshness || buildEvolutionAssignmentFreshness(report);
  const sessionHealth = report.session_health || buildEvolutionSessionHealth(report);
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
    `Session badge: ${sessionBadge.badge || "healthy / fresh"}${sessionBadge.reason ? ` - ${sessionBadge.reason}` : ""}`,
    `Assignment freshness: ${assignmentFreshness.freshness || "fresh"}${assignmentFreshness.reason ? ` - ${assignmentFreshness.reason}` : ""}`,
    `Session health: ${sessionHealth.health || "healthy"}${sessionHealth.reason ? ` - ${sessionHealth.reason}` : ""}`,
    "",
    "Master summary:",
    `- Active workers: ${masterSummary.active_workers}`,
    `- Stale workers: ${masterSummary.stale_workers}`,
    `- Recovered workers: ${masterSummary.recovered_workers}`,
    `- Pending assignments: ${masterSummary.pending_assignments}`,
    `- Completed assignments: ${masterSummary.completed_assignments}`,
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
  const sessionBadge = report.session_badge
    ? {
        badge: report.session_badge,
        reason: report.session_badge_reason || ""
      }
    : buildEvolutionSessionBadge({
        session_health: report.session_health,
        session_health_reason: report.session_health_reason,
        assignment_freshness: report.assignment_freshness,
        assignment_freshness_reason: report.assignment_freshness_reason
      });
  const lines = [
    "Evolution Two-Laptop Workflow",
    "",
    `Status: ${report.status}`,
    `Decision: ${report.decision}`,
    `Session badge: ${report.session_badge || sessionBadge.badge || "healthy / fresh"}${sessionBadge.reason ? ` - ${sessionBadge.reason}` : ""}`,
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
  const masterSummary = report.master_summary || buildEvolutionMasterSummary(report);
  const sessionBadge = report.session_badge
    ? {
        badge: report.session_badge,
        reason: report.session_badge_reason || ""
      }
    : buildEvolutionSessionBadge({
        session_health: report.session_health,
        session_health_reason: report.session_health_reason,
        assignment_freshness: report.assignment_freshness,
        assignment_freshness_reason: report.assignment_freshness_reason
      });
  const assignmentFreshness = report.assignment_freshness || buildEvolutionAssignmentFreshness(report);
  const sessionHealth = report.session_health || buildEvolutionSessionHealth(report);
  const targetNodeIds = Array.isArray(report.target_node_ids) ? report.target_node_ids : [];
  const broadcastResults = Array.isArray(report.broadcast_results) ? report.broadcast_results : [];
  const heartbeats = Array.isArray(report.heartbeats) ? report.heartbeats : [];
  const results = Array.isArray(report.results) ? report.results : [];
  const lines = [
    "Evolution Two-Laptop Session",
    "",
    `Role: ${report.role || "unknown"}`,
    `Status: ${report.status}`,
    `Decision: ${report.decision}`,
    `Session badge: ${sessionBadge.badge || "healthy / fresh"}${sessionBadge.reason ? ` - ${sessionBadge.reason}` : ""}`,
    `Session health: ${sessionHealth.health || "healthy"}${sessionHealth.reason ? ` - ${sessionHealth.reason}` : ""}`,
    `Watch mode: ${report.watch_mode ? "on" : "off"}`,
    `Transport: ${report.transport_status && report.transport_status.status ? report.transport_status.status : "unavailable"}`,
    `Discovery: ${report.discovery_result && report.discovery_result.status ? report.discovery_result.status : "not-run"}`,
    `Target node(s): ${targetNodeIds.length ? targetNodeIds.join(", ") : report.target_node_id || "auto"}`,
    ""
  ];
  if (masterRole) {
    lines.push(
      `Worker pool: ${workerPool.ready_worker_count || 0} ready / ${workerPool.trusted_worker_count || 0} trusted / ${workerPool.discovered_worker_count || 0} discovered / ${workerPool.stale_worker_count || 0} stale`
    );
    lines.push(
      `Master summary: ${masterSummary.active_workers || 0} active / ${masterSummary.stale_workers || 0} stale / ${masterSummary.recovered_workers || 0} recovered / ${masterSummary.pending_assignments || 0} pending / ${masterSummary.completed_assignments || 0} completed`
    );
    lines.push(
      `Assignment freshness: ${assignmentFreshness.freshness || "fresh"}${assignmentFreshness.reason ? ` - ${assignmentFreshness.reason}` : ""}`
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
    lines.push("", "Worker heartbeats:");
    if (heartbeats.length) {
      for (const heartbeat of heartbeats) {
        lines.push(`- ${heartbeat.target_node_id || heartbeat.packet_id || "worker"}: ${heartbeat.status || "alive"}`);
      }
    } else {
      lines.push("- none");
    }
    lines.push("", "Worker results:");
    if (results.length) {
      for (const result of results) {
        lines.push(`- ${result.target_node_id || result.packet_id || "worker"}: ${result.status || "completed"}`);
      }
    } else {
      lines.push("- none");
    }
  } else {
    lines.push(
      `Worker pool view: ${workerPool.ready_worker_count || 0} ready / ${workerPool.trusted_worker_count || 0} trusted / ${workerPool.discovered_worker_count || 0} discovered / ${workerPool.stale_worker_count || 0} stale`
    );
    lines.push(
      `Master overview: ${masterSummary.active_workers || 0} active / ${masterSummary.stale_workers || 0} stale / ${masterSummary.recovered_workers || 0} recovered / ${masterSummary.pending_assignments || 0} pending / ${masterSummary.completed_assignments || 0} completed`
    );
    lines.push(`Join request: ${report.join_request_result ? report.join_request_result.status || "requested" : sessionRecordStatusFromReport(report)}`);
    lines.push(`Heartbeat: ${report.heartbeat_result ? report.heartbeat_result.status || "sent" : "waiting"}`);
    lines.push(`Completion: ${report.completion_result ? report.completion_result.status || "sent" : "waiting"}`);
    lines.push(`Recovery: ${report.recovery_result && report.recovery_result.recovered_worker_ids && report.recovery_result.recovered_worker_ids.length ? `recovered ${report.recovery_result.recovered_worker_ids.join(", ")}` : "waiting"}`);
    lines.push(`Assignment freshness: ${assignmentFreshness.freshness || "fresh"}${assignmentFreshness.reason ? ` - ${assignmentFreshness.reason}` : ""}`);
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
    heartbeats: [],
    receipts: [],
    results: [],
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
  state.heartbeats = Array.isArray(state.heartbeats) ? state.heartbeats : [];
  state.receipts = Array.isArray(state.receipts) ? state.receipts : [];
  state.results = Array.isArray(state.results) ? state.results : [];
  state.recovery_events = Array.isArray(state.recovery_events) ? state.recovery_events : [];
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
    last_heartbeat_at: current && current.last_heartbeat_at ? current.last_heartbeat_at : null,
    heartbeat_status: current && current.heartbeat_status ? current.heartbeat_status : null,
    heartbeat_packet_id: current && current.heartbeat_packet_id ? current.heartbeat_packet_id : null,
    heartbeat_target_node_id: current && current.heartbeat_target_node_id ? current.heartbeat_target_node_id : null,
    last_result_packet_id: current && current.last_result_packet_id ? current.last_result_packet_id : null,
    last_result_at: current && current.last_result_at ? current.last_result_at : null,
    last_result_status: current && current.last_result_status ? current.last_result_status : null,
    target_node_id: current && current.target_node_id ? current.target_node_id : null,
    target_node_ids: Array.isArray(current && current.target_node_ids) ? current.target_node_ids.slice() : [],
    worker_pool: current && typeof current.worker_pool === "object" ? { ...current.worker_pool } : null,
    last_discovery_mode: current && current.last_discovery_mode ? current.last_discovery_mode : null,
    last_discovery_at: current && current.last_discovery_at ? current.last_discovery_at : null,
    join_request_status: current && current.join_request_status ? current.join_request_status : null,
    join_request_packet_id: current && current.join_request_packet_id ? current.join_request_packet_id : null,
    join_request_target_node_id: current && current.join_request_target_node_id ? current.join_request_target_node_id : null,
    join_request_at: current && current.join_request_at ? current.join_request_at : null,
    join_request_timeout_ms: current && current.join_request_timeout_ms ? current.join_request_timeout_ms : null,
    completion_status: current && current.completion_status ? current.completion_status : null,
    completed_assignment_ids: Array.isArray(current && current.completed_assignment_ids) ? current.completed_assignment_ids.slice() : [],
    recovered_worker_ids: Array.isArray(current && current.recovered_worker_ids) ? current.recovered_worker_ids.slice() : [],
    last_recovery_at: current && current.last_recovery_at ? current.last_recovery_at : null,
    recovery_status: current && current.recovery_status ? current.recovery_status : null,
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

function resolveEvolutionWorkerTargets({ localNode, trustedNodes, discoveredNodes = [], stale_worker_ids = [], flags = {}, bridgeReport = {}, sessionRecord = null } = {}) {
  const explicitTarget = String(flags.to || flags.target || flags.node || flags.node_id || flags["target-node"] || "").trim();
  const trusted = normalizeEvolutionWifiNodeList(trustedNodes, "trusted", localNode);
  const discovered = normalizeEvolutionWifiNodeList(discoveredNodes, "discovered", localNode);
  const staleIds = new Set(Array.isArray(stale_worker_ids) ? stale_worker_ids.map((value) => String(value).trim()).filter(Boolean) : []);
  const readyWorkers = trusted.filter((node) => node.ready !== false && !staleIds.has(node.node_id));
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

function buildEvolutionWorkerPool({ localNode, trustedNodes, discoveredNodes = [], join_requests = [], heartbeats = [], results = [], flags = {}, bridgeReport = {}, sessionRecord = null } = {}) {
  const trustedWorkers = normalizeEvolutionWifiNodeList(trustedNodes, "trusted", localNode);
  const discoveredWorkers = normalizeEvolutionWifiNodeList(discoveredNodes, "discovered", localNode);
  const joinRequests = Array.isArray(join_requests) ? join_requests : [];
  const heartbeatPackets = Array.isArray(heartbeats) ? heartbeats : [];
  const resultPackets = Array.isArray(results) ? results : [];
  const heartbeatIndex = new Map();
  for (const heartbeat of heartbeatPackets) {
    const nodeId = String(heartbeat && (heartbeat.node_id || heartbeat.sender_node_id || heartbeat.target_node_id) || "").trim();
    if (!nodeId) continue;
    const current = heartbeatIndex.get(nodeId) || null;
    const currentTime = Date.parse(heartbeat && heartbeat.requested_at ? heartbeat.requested_at : heartbeat && heartbeat.created_at ? heartbeat.created_at : null);
    const previousTime = current && Date.parse(current.requested_at || current.created_at || 0);
    if (!current || (!Number.isFinite(previousTime) || (Number.isFinite(currentTime) && currentTime >= previousTime))) {
      heartbeatIndex.set(nodeId, heartbeat);
    }
  }
  const resultIndex = new Map();
  for (const result of resultPackets) {
    const nodeId = String(result && (result.node_id || result.sender_node_id || result.target_node_id) || "").trim();
    if (!nodeId) continue;
    const current = resultIndex.get(nodeId) || null;
    const currentTime = Date.parse(result && result.requested_at ? result.requested_at : result && result.created_at ? result.created_at : null);
    const previousTime = current && Date.parse(current.requested_at || current.created_at || 0);
    if (!current || (!Number.isFinite(previousTime) || (Number.isFinite(currentTime) && currentTime >= previousTime))) {
      resultIndex.set(nodeId, result);
    }
  }
  const staleAfterMs = resolveEvolutionWorkerHeartbeatTimeoutMs(flags, sessionRecord);
  const now = Date.now();
  const trustedWorkersWithFreshness = trustedWorkers.map((node) => {
    const fresh = resolveEvolutionWorkerFreshness(node, heartbeatIndex, staleAfterMs, now);
    const result = resultIndex.get(fresh.node_id) || null;
    return {
      ...fresh,
      last_result_packet_id: result && result.packet_id ? result.packet_id : null,
      last_result_status: result && result.result_status ? result.result_status : null,
      last_result_at: result && result.requested_at ? result.requested_at : null,
      completion_status: result && result.result_status ? result.result_status : null,
      ready: Boolean(fresh.ready && !fresh.stale && (fresh.ready !== false))
    };
  });
  const discoveredWorkersWithFreshness = discoveredWorkers.map((node) => {
    const fresh = resolveEvolutionWorkerFreshness(node, heartbeatIndex, staleAfterMs, now);
    const result = resultIndex.get(fresh.node_id) || null;
    return {
      ...fresh,
      last_result_packet_id: result && result.packet_id ? result.packet_id : null,
      last_result_status: result && result.result_status ? result.result_status : null,
      last_result_at: result && result.requested_at ? result.requested_at : null,
      completion_status: result && result.result_status ? result.result_status : null
    };
  });
  const readyWorkers = trustedWorkersWithFreshness.filter((node) => node.ready !== false && !node.stale);
  const staleWorkerIds = dedupeStrings([
    ...trustedWorkersWithFreshness.filter((node) => node.stale).map((node) => node.node_id),
    ...discoveredWorkersWithFreshness.filter((node) => node.stale).map((node) => node.node_id)
  ].filter(Boolean));
  const readyWorkerIds = dedupeStrings(readyWorkers.map((node) => node.node_id).filter(Boolean));
  const discoveredWorkerIds = dedupeStrings(discoveredWorkers.map((node) => node.node_id).filter(Boolean));
  const joinRequestWorkerIds = dedupeStrings(joinRequests.map((item) => item.node_id || item.target_node_id || item.sender_node_id).filter(Boolean));
  const targetNodeIds = resolveEvolutionWorkerTargets({
    localNode,
    trustedNodes: trustedWorkersWithFreshness,
    discoveredNodes: discoveredWorkersWithFreshness,
    stale_worker_ids: staleWorkerIds,
    flags,
    bridgeReport,
    sessionRecord
  });
  const singleTarget = targetNodeIds.length ? targetNodeIds[0] : null;
  return {
    local_node_id: localNode && localNode.node_id ? localNode.node_id : null,
    discovered_worker_count: discoveredWorkersWithFreshness.length,
    trusted_worker_count: trustedWorkersWithFreshness.length,
    ready_worker_count: readyWorkers.length,
    stale_worker_count: staleWorkerIds.length,
    join_request_count: joinRequests.length,
    discovered_workers: discoveredWorkersWithFreshness,
    trusted_workers: trustedWorkersWithFreshness,
    ready_workers: readyWorkers,
    stale_workers: trustedWorkersWithFreshness.filter((node) => node.stale).concat(discoveredWorkersWithFreshness.filter((node) => node.stale)),
    join_requests: joinRequests,
    heartbeats: heartbeatPackets,
    results: resultPackets,
    ready_worker_ids: readyWorkerIds,
    discovered_worker_ids: discoveredWorkerIds,
    join_request_worker_ids: joinRequestWorkerIds,
    stale_worker_ids: staleWorkerIds,
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
  const discoveryIntervalMs = Math.max(1000, Number(flags.discovery_interval_ms || flags["discovery-interval-ms"] || 5000) || 5000);
  const lastDiscoveryAt = sessionRecord && sessionRecord.last_discovery_at ? Date.parse(sessionRecord.last_discovery_at) : NaN;
  const elapsed = Number.isFinite(lastDiscoveryAt) ? Date.now() - lastDiscoveryAt : Infinity;
  const shouldRefresh = !sessionRecord || !sessionRecord.last_discovery_at || Boolean(flags.refresh || flags.force_refresh || flags["force-refresh"] || flags.watch) || elapsed >= discoveryIntervalMs;
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
  const mode = sessionRole === "worker" ? "advertise" : "master";
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

function extractEvolutionWorkerHeartbeats(inbox = [], localNode = null) {
  return (Array.isArray(inbox) ? inbox : [])
    .map((item) => {
      const payload = item && typeof item.payload === "object" ? item.payload : {};
      const packetType = String(item && (item.packet_type || item.package_type) || payload.packet_type || payload.report_type || "").trim().toLowerCase();
      const reportType = String(payload.report_type || "").trim().toLowerCase();
      if (!["worker_heartbeat", "assignment_heartbeat"].includes(packetType) && !["multi_ai_evolution_worker_heartbeat", "multi_ai_evolution_assignment_heartbeat"].includes(reportType)) return null;
      const targetNodeId = item.target_node_id || payload.target_node_id || null;
      if (localNode && targetNodeId && targetNodeId !== localNode.node_id) return null;
      return {
        packet_id: item.packet_id || item.package_id || null,
        node_id: item.sender_node_id || payload.sender_node_id || (payload.source_machine && payload.source_machine.node_id) || null,
        target_node_id: targetNodeId,
        sender_node_id: item.sender_node_id || payload.sender_node_id || (payload.source_machine && payload.source_machine.node_id) || null,
        assignment_id: payload.assignment_id || null,
        assignment_signature: payload.assignment_signature || null,
        heartbeat_status: payload.status || item.status || "alive",
        ready_flag: payload.ready_flag !== false,
        requested_at: payload.requested_at || item.created_at || item.received_at || null,
        status: item.status || payload.status || "alive",
        source_machine: payload.source_machine && typeof payload.source_machine === "object" ? { ...payload.source_machine } : null
      };
    })
    .filter(Boolean);
}

function extractEvolutionWorkerResults(inbox = [], localNode = null) {
  return (Array.isArray(inbox) ? inbox : [])
    .map((item) => {
      const payload = item && typeof item.payload === "object" ? item.payload : {};
      const packetType = String(item && (item.packet_type || item.package_type) || payload.packet_type || payload.report_type || "").trim().toLowerCase();
      const reportType = String(payload.report_type || "").trim().toLowerCase();
      if (!["worker_result", "assignment_result", "completion_packet"].includes(packetType) && !["multi_ai_evolution_worker_result", "multi_ai_evolution_assignment_result", "multi_ai_evolution_completion_packet"].includes(reportType)) return null;
      const targetNodeId = item.target_node_id || payload.target_node_id || null;
      if (localNode && targetNodeId && targetNodeId !== localNode.node_id) return null;
      return {
        packet_id: item.packet_id || item.package_id || null,
        node_id: item.sender_node_id || payload.sender_node_id || (payload.source_machine && payload.source_machine.node_id) || null,
        target_node_id: targetNodeId,
        sender_node_id: item.sender_node_id || payload.sender_node_id || (payload.source_machine && payload.source_machine.node_id) || null,
        assignment_id: payload.assignment_id || null,
        assignment_signature: payload.assignment_signature || null,
        result_status: payload.result_status || payload.status || item.status || "completed",
        result_summary: payload.result_summary || null,
        result_artifacts: Array.isArray(payload.result_artifacts) ? payload.result_artifacts.slice() : [],
        changed_files: Array.isArray(payload.changed_files) ? payload.changed_files.slice() : [],
        tests: Array.isArray(payload.tests) ? payload.tests.slice() : [],
        requested_at: payload.requested_at || item.created_at || item.received_at || null,
        status: item.status || payload.status || "completed",
        source_machine: payload.source_machine && typeof payload.source_machine === "object" ? { ...payload.source_machine } : null
      };
    })
    .filter(Boolean);
}

function resolveEvolutionWorkerHeartbeatTimeoutMs(flags = {}, sessionRecord = null) {
  const candidates = [
    flags.heartbeat_timeout_ms,
    flags["heartbeat-timeout-ms"],
    flags.worker_timeout_ms,
    flags["worker-timeout-ms"],
    sessionRecord && sessionRecord.heartbeat_timeout_ms
  ];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value > 0) return Math.max(1000, value);
  }
  return 120000;
}

function resolveEvolutionWorkerFreshness(node, heartbeatIndex = new Map(), timeoutMs = 120000, now = Date.now()) {
  const nodeId = node && node.node_id ? node.node_id : null;
  const heartbeat = nodeId ? heartbeatIndex.get(nodeId) || null : null;
  const lastSeenAt = heartbeat && heartbeat.requested_at ? Date.parse(heartbeat.requested_at) : (node && node.last_seen_at ? Date.parse(node.last_seen_at) : NaN);
  const hasFreshnessSignal = Number.isFinite(lastSeenAt);
  const fresh = hasFreshnessSignal ? (now - lastSeenAt) <= timeoutMs : node && node.ready === false ? false : true;
  return {
    ...node,
    last_heartbeat_at: heartbeat && heartbeat.requested_at ? heartbeat.requested_at : node.last_seen_at || null,
    heartbeat_packet_id: heartbeat && heartbeat.packet_id ? heartbeat.packet_id : null,
    heartbeat_status: heartbeat && heartbeat.status ? heartbeat.status : null,
    result_packet_id: heartbeat && heartbeat.result_packet_id ? heartbeat.result_packet_id : null,
    result_status: heartbeat && heartbeat.result_status ? heartbeat.result_status : null,
    ready: Boolean(node.ready !== false && fresh),
    stale: !fresh,
    status: fresh ? (node.status || "ready") : "stale"
  };
}

function resolveEvolutionWorkerRecovery(previousPool = null, currentPool = null, joinRequests = [], heartbeats = [], results = [], generatedAt = new Date().toISOString()) {
  const previousStaleIds = new Set(dedupeStrings([
    ...(Array.isArray(previousPool && previousPool.stale_worker_ids) ? previousPool.stale_worker_ids : []),
    ...(Array.isArray(previousPool && previousPool.stale_workers) ? previousPool.stale_workers.map((item) => item && item.node_id ? item.node_id : null) : [])
  ]));
  const currentFreshIds = new Set(dedupeStrings([
    ...(Array.isArray(currentPool && currentPool.ready_worker_ids) ? currentPool.ready_worker_ids : []),
    ...(Array.isArray(currentPool && currentPool.ready_workers) ? currentPool.ready_workers.map((item) => item && item.node_id ? item.node_id : null) : [])
  ]));
  const activityIds = new Set(dedupeStrings([
    ...(Array.isArray(joinRequests) ? joinRequests.map((item) => item && (item.node_id || item.sender_node_id || item.target_node_id)) : []),
    ...(Array.isArray(heartbeats) ? heartbeats.map((item) => item && (item.node_id || item.sender_node_id || item.target_node_id)) : []),
    ...(Array.isArray(results) ? results.map((item) => item && (item.node_id || item.sender_node_id || item.target_node_id)) : [])
  ]));
  const recoveredWorkerIds = dedupeStrings([...previousStaleIds].filter((nodeId) => currentFreshIds.has(nodeId) && activityIds.has(nodeId)));
  const recoveryEvents = recoveredWorkerIds.map((nodeId, index) => ({
    packet_id: `multi-ai-evolution-recovery-${String(index + 1).padStart(3, "0")}`,
    target_node_id: nodeId,
    assignment_id: currentPool && currentPool.assignment_signature ? currentPool.assignment_signature : null,
    assignment_signature: currentPool && currentPool.assignment_signature ? currentPool.assignment_signature : null,
    created_at: generatedAt,
    status: "recovered"
  }));
  return {
    status: recoveredWorkerIds.length ? "recovered" : "idle",
    recovery_count: recoveredWorkerIds.length,
    recovered_worker_ids: recoveredWorkerIds,
    recovery_events: recoveryEvents,
    next_action: recoveredWorkerIds.length ? `Recovered worker node(s): ${recoveredWorkerIds.join(", ")}.` : "No worker recovery detected."
  };
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
  const joinRequestTimeoutMs = resolveEvolutionWorkerJoinRequestTimeoutMs(flags, sessionRecord);
  const recentJoinRequest = sessionRecord.join_request_at && Number.isFinite(Date.parse(sessionRecord.join_request_at))
    ? (Date.now() - Date.parse(sessionRecord.join_request_at)) < joinRequestTimeoutMs
    : false;
  if (sessionRecord.join_request_target_node_id && sessionRecord.join_request_target_node_id === masterTargetNode.node_id && sessionRecord.join_request_status === "requested" && recentJoinRequest) {
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

function resolveEvolutionWorkerJoinRequestTimeoutMs(flags = {}, sessionRecord = null) {
  const candidates = [
    flags.join_request_timeout_ms,
    flags["join-request-timeout-ms"],
    sessionRecord && sessionRecord.join_request_timeout_ms,
    flags.heartbeat_timeout_ms,
    flags["heartbeat-timeout-ms"]
  ];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value > 0) return Math.max(1000, value);
  }
  return 120000;
}

function refreshEvolutionWorkerHeartbeat({ bridgeReport, sessionRecord, wifiClient, transportStatus, workerPool, flags = {}, generatedAt, workerPrompt } = {}) {
  if (!wifiClient || typeof wifiClient.sendWorkerHeartbeat !== "function") {
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
      next_action: "Discover the master laptop first, then send the worker heartbeat."
    };
  }
  const recentHeartbeat = sessionRecord.last_heartbeat_at && Date.now() - Date.parse(sessionRecord.last_heartbeat_at) < Math.max(1000, Number(flags.heartbeat_interval_ms || flags["heartbeat-interval-ms"] || 5000));
  if (recentHeartbeat && sessionRecord.heartbeat_target_node_id === masterTargetNode.node_id) {
    return {
      status: "cached",
      packet_id: sessionRecord.heartbeat_packet_id || null,
      target_node_id: sessionRecord.heartbeat_target_node_id || null,
      sent_at: sessionRecord.last_heartbeat_at || generatedAt,
      next_action: "Worker heartbeat already sent recently. Keep the session running."
    };
  }
  const packet = {
    packet_type: "worker_heartbeat",
    title: `Worker heartbeat :: ${bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : "assignment"}`,
    payload: {
      report_type: "multi_ai_evolution_worker_heartbeat",
      title: `Worker heartbeat :: ${bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : "assignment"}`,
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
      status: "alive"
    },
    payload_encoding: "json"
  };
  const result = wifiClient.sendWorkerHeartbeat(packet, masterTargetNode.node_id, {
    confirm: true,
    ownerApproved: Boolean(isTruthyFlag(flags["owner-approved"]) || isTruthyFlag(flags.approved))
  });
  if (!result || result.status === "blocked") {
    return result || {
      status: "blocked",
      next_action: "The worker heartbeat could not be sent."
    };
  }
  return {
    status: "sent",
    packet_id: result.package_id || result.packet_id || null,
    target_node_id: masterTargetNode.node_id,
    sent_at: generatedAt,
    next_action: "Worker heartbeat sent. Keep the worker session running."
  };
}

function maybeSendEvolutionWorkerCompletion({ bridgeReport, sessionRecord, wifiClient, transportStatus, workerPool, flags = {}, generatedAt, workerPrompt, appendAudit, sessionState, options = {} } = {}) {
  const completionRequested = Boolean(
    isTruthyFlag(flags.complete) ||
    isTruthyFlag(flags.done) ||
    isTruthyFlag(flags.result) ||
    isTruthyFlag(flags.completed) ||
    (Array.isArray(options.rest) && options.rest.some((item) => ["complete", "completed", "done", "result"].includes(String(item).trim().toLowerCase())))
  );
  if (!completionRequested) {
    return null;
  }
  if (sessionRecord.last_result_packet_id && sessionRecord.last_result_status && bridgeReport.current_assignment && sessionRecord.applied_assignment_id === bridgeReport.current_assignment.assignment_id) {
    return {
      status: sessionRecord.last_result_status,
      packet_id: sessionRecord.last_result_packet_id,
      target_node_id: sessionRecord.heartbeat_target_node_id || null,
      sent_at: sessionRecord.last_result_at || generatedAt,
      result_status: sessionRecord.last_result_status,
      next_action: "Worker completion already submitted. Keep waiting for the master review."
    };
  }
  if (!wifiClient || typeof wifiClient.sendWorkerResult !== "function") {
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
      next_action: "Discover the master laptop first, then send the worker completion packet."
    };
  }
  const resultStatus = String(flags.result_status || flags.status || "completed").trim().toLowerCase() || "completed";
  const packet = {
    packet_type: "worker_result",
    title: `Worker result :: ${bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : "assignment"}`,
    payload: {
      report_type: "multi_ai_evolution_worker_result",
      title: `Worker result :: ${bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : "assignment"}`,
      session_role: "worker",
      session_id: sessionRecord.session_id,
      sender_node_id: localNode ? localNode.node_id || null : null,
      target_node_id: masterTargetNode.node_id,
      worker_ai_ids: Array.isArray(bridgeReport.current_assignment && bridgeReport.current_assignment.worker_ai_ids) ? bridgeReport.current_assignment.worker_ai_ids.slice() : [],
      worker_pool: workerPool || null,
      assignment_signature: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_signature : null,
      assignment_id: bridgeReport.current_assignment ? bridgeReport.current_assignment.assignment_id : null,
      worker_prompt: workerPrompt,
      result_status: resultStatus,
      result_summary: flags.summary || flags.result_summary || flags.note || null,
      result_artifacts: parseCsvLike(flags.artifacts || flags.result_artifacts),
      changed_files: parseCsvLike(flags.changed || flags.changed_files),
      tests: parseCsvLike(flags.tests || flags.test_results),
      source_machine: localNode ? {
        node_id: localNode.node_id || null,
        display_name: localNode.display_name || null,
        hostname: localNode.hostname || null
      } : null,
      completed_at: generatedAt,
      requested_at: generatedAt,
      status: resultStatus
    },
    payload_encoding: "json"
  };
  const result = wifiClient.sendWorkerResult(packet, masterTargetNode.node_id, {
    confirm: true,
    ownerApproved: Boolean(isTruthyFlag(flags["owner-approved"]) || isTruthyFlag(flags.approved))
  });
  if (!result || result.status === "blocked") {
    return result || {
      status: "blocked",
      next_action: "The worker completion packet could not be sent."
    };
  }
  if (appendAudit) {
    appendAudit("multi_ai.evolution_worker_result_packet", "multi_ai_evolution_assignment", sessionRecord.session_id, `Worker result packet sent to ${masterTargetNode.node_id}`, {
      packet_id: result.package_id || result.packet_id || null,
      target_node_id: masterTargetNode.node_id,
      result_status: resultStatus
    });
  }
  return {
    status: resultStatus,
    result_status: resultStatus,
    packet_id: result.package_id || result.packet_id || null,
    target_node_id: masterTargetNode.node_id,
    sent_at: generatedAt,
    next_action: "Worker result sent to the master laptop."
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

function buildEvolutionSessionNextAction(sessionRole, broadcastResult, receiptResult, targetNodeIds = [], workerPool = null, completionResult = null) {
  if (sessionRole === "master") {
    if (broadcastResult && broadcastResult.status === "blocked") return broadcastResult.next_action || "Resolve the transport blocker before broadcasting.";
    if (workerPool && Number(workerPool.stale_worker_count || 0) > 0) {
      return `Stale worker heartbeats detected (${workerPool.stale_worker_count}). Requeue the assignment to a fresh ready worker or wait for a heartbeat update.`;
    }
    if (completionResult && completionResult.status && completionResult.status !== "blocked") return "Worker completion acknowledged. Keep the master session running for the next assignment.";
    if (!Array.isArray(targetNodeIds) || !targetNodeIds.length) return "Pair and trust at least one worker node, or pass --to <node-id> for the broadcast.";
    if (targetNodeIds.length === 1) return "Keep the master session running so it can rebroadcast when the assignment changes.";
    return `Keep the master session running so it can rebroadcast to ${targetNodeIds.length} ready worker nodes when the assignment changes.`;
  }
  if (completionResult && completionResult.status && completionResult.status !== "blocked") {
    return "Worker completion sent. Keep the worker session running and wait for the next broadcast.";
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

function markEvolutionAssignmentCompleted(assignmentId, patch = {}) {
  const state = readEvolutionAssignmentBridgeState();
  const now = new Date().toISOString();
  const index = state.assignments.findIndex((item) => item.assignment_id === assignmentId);
  if (index < 0) return null;
  const updated = {
    ...state.assignments[index],
    ...patch,
    assignment_id: assignmentId,
    status: patch.status || "completed",
    completed_at: patch.completed_at || now,
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
    "2. Keep advertising readiness and actively discover the master laptop on Wi-Fi/LAN.",
    "3. Accept only the assigned task scope after the master is visible.",
    "4. Edit only leased files.",
    "5. Run the relevant tests.",
    "6. Report changed files, results, blockers, and risks.",
    "7. If the work is complete, send the worker completion packet to the master laptop.",
    "8. Wait for the master laptop to review and push."
  ].join("\n");
}

function parseCsvLike(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  markEvolutionAssignmentApplied,
  markEvolutionAssignmentCompleted
};
