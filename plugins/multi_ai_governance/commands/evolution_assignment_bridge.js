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
const ideWindowGovernance = require("./ide_window_governance");
const localProjectGovernance = require("./local_project_governance");
const wifiGovernance = require("./wifi_lan_governance");
const kcloudGovernance = require("./kcloud_governance");
const githubProviderGovernance = require("./github_provider_governance");

const STATE_FILE = ".kabeeri/multi_ai_governance/evolution_assignments.json";
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
        "Report changed files, tests, blockers, and risks back to the master laptop."
      ],
      prompt: workerPrompt
    },
    master_checklist: masterChecklist,
    worker_prompt: workerPrompt,
    next_action: bridgeReport.next_action
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
    "1. Accept only the assigned task scope.",
    "2. Edit only leased files.",
    "3. Run the relevant tests.",
    "4. Report changed files, results, blockers, and risks.",
    "5. Wait for the master laptop to review and push."
  ].join("\n");
}

function localFileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot(), relativePath));
}

module.exports = {
  buildEvolutionAssignmentBridgeReport,
  buildEvolutionAssignmentBridgeAssignReport,
  buildEvolutionAssignmentWorkflowReport,
  renderEvolutionAssignmentBridgeReport,
  renderEvolutionAssignmentWorkflowReport,
  readEvolutionAssignmentBridgeState,
  defaultEvolutionAssignmentBridgeState,
  ensureEvolutionAssignmentBridgeState,
  markEvolutionAssignmentApplied
};
