const { ensureTaskTrashState, taskTrashSummary, buildTaskArchivePolicy } = require("../services/task_trash");
const { normalizeTrackAssignment, getTrackDisplayLabel, getTrackDisplayShortLabel } = require("../services/track_control");

const LIFECYCLE_STAGES = ["intake", "ready", "execution", "validation", "closure", "blocked", "archived"];

function buildTaskLifecycleState(taskItem, options = {}) {
  const status = String(taskItem && taskItem.status ? taskItem.status : "unknown").toLowerCase();
  const stage = normalizeTaskLifecycleStage(taskItem, options);
  const archived = stage === "archived";
  const trashedAt = archived ? (taskItem.trashed_at || options.trashed_at || null) : null;
  const evolution = extractTaskEvolutionContext(taskItem, options.evolution_state || null);
  const taskTrack = resolveLifecycleTaskTrack(taskItem, options.workspace_track || options.track || options.workspace_kind || "framework_owner");
  const archivePolicy = buildLifecycleArchivePolicy(taskTrack, stage, options, evolution);
  const nextStatuses = getNextLifecycleStatuses(stage, status, archived);
  return {
    task_id: taskItem && (taskItem.id || taskItem.task_id) ? (taskItem.id || taskItem.task_id) : null,
    title: taskItem && taskItem.title ? taskItem.title : "",
    status: taskItem && taskItem.status ? taskItem.status : (archived ? "trashed" : "unknown"),
    current_stage: stage,
    stage_label: getLifecycleStageLabel(stage),
    stage_order: LIFECYCLE_STAGES,
    stage_index: Math.max(0, LIFECYCLE_STAGES.indexOf(stage)),
    next_statuses: nextStatuses,
    next_action: getLifecycleNextAction(stage, status, archived, taskTrack),
    blockers: Array.isArray(taskItem && taskItem.blockers) ? taskItem.blockers : [],
    assignee_id: taskItem && taskItem.assignee_id ? taskItem.assignee_id : "",
    reviewer_id: taskItem && taskItem.reviewer_id ? taskItem.reviewer_id : "",
    acceptance_criteria_count: Array.isArray(taskItem && taskItem.acceptance_criteria) ? taskItem.acceptance_criteria.length : 0,
    active_tokens: Array.isArray(taskItem && taskItem.active_tokens) ? taskItem.active_tokens : [],
    active_locks: Array.isArray(taskItem && taskItem.active_locks) ? taskItem.active_locks : [],
    active_sessions: Array.isArray(taskItem && taskItem.active_sessions) ? taskItem.active_sessions : [],
    evolution_change_id: evolution.evolution_change_id,
    evolution_milestone_id: evolution.evolution_milestone_id,
    evolution_milestone_title: evolution.evolution_milestone_title,
    track: evolution.track,
    track_label: getTrackDisplayLabel(evolution.track),
    branch_name: evolution.branch_name,
    merge_target_branch: evolution.merge_target_branch,
    sync_policy: evolution.sync_policy,
    github_sync_enabled: evolution.github_sync_enabled,
    review_gate: evolution.review_gate,
    task_trash_policy: evolution.task_trash_policy,
    archive_after_completion: taskTrack === "vibe_app_developer" ? false : evolution.archive_after_completion,
    archive_status: evolution.archive_status,
    archive_policy: archivePolicy,
    trashed_at: trashedAt,
    trashed_reason: archived ? (taskItem.trashed_reason || options.trashed_reason || null) : null,
    original_status: archived ? (taskItem.original_status || options.original_status || status) : null,
    lifecycle_path: archived
      ? ["intake", "ready", "execution", "validation", "closure", "archived"]
      : ["intake", "ready", "execution", "validation", "closure"]
  };
}

function buildTaskLifecycleBoard(tasks = [], options = {}) {
  const trashState = ensureTaskTrashState();
  const workspaceTrack = normalizeLifecycleTrack(options.workspace_track || options.track || options.workspace_kind || "framework_owner");
  const activeRows = (tasks || [])
    .filter((taskItem) => resolveLifecycleTaskTrack(taskItem, workspaceTrack) === workspaceTrack)
    .map((taskItem) => buildLifecycleRow(taskItem, options));
  const archivedRows = (trashState.trash || []).map((trashItem) => buildLifecycleRow({
    ...trashItem,
    status: "trashed",
    trashed_at: trashItem.trashed_at || null,
    trashed_reason: trashItem.trashed_reason || null,
    original_status: trashItem.original_status || trashItem.status || null
  }, { ...options, archived: true }));
  const rows = [...activeRows, ...archivedRows];
  const summary = summarizeLifecycleRows(rows);
  const byStage = groupLifecycleRows(rows);
  return {
    report_type: "task_lifecycle_board",
    generated_at: new Date().toISOString(),
    source: ".kabeeri/tasks.json",
    summary,
    by_stage: byStage,
    tasks: rows
  };
}

function buildLifecycleRow(taskItem, options = {}) {
  const lifecycle = buildTaskLifecycleState(taskItem, options);
  return {
    id: lifecycle.task_id,
    title: lifecycle.title,
    status: lifecycle.status,
    track: lifecycle.track || resolveLifecycleTaskTrack(taskItem, normalizeLifecycleTrack(options.workspace_track || options.track || options.workspace_kind || "framework_owner")),
    lifecycle_stage: lifecycle.current_stage,
    lifecycle_stage_label: lifecycle.stage_label,
    lifecycle_next_action: lifecycle.next_action,
    track: lifecycle.track || null,
    assignee_id: lifecycle.assignee_id,
    reviewer_id: lifecycle.reviewer_id,
    evolution_milestone_id: lifecycle.evolution_milestone_id || null,
    evolution_milestone_title: lifecycle.evolution_milestone_title || null,
    branch_name: lifecycle.branch_name || null,
    merge_target_branch: lifecycle.merge_target_branch || null,
    sync_policy: lifecycle.sync_policy || null,
    github_sync_enabled: typeof lifecycle.github_sync_enabled === "boolean" ? lifecycle.github_sync_enabled : null,
    review_gate: lifecycle.review_gate || null,
    task_trash_policy: lifecycle.task_trash_policy || null,
    archive_after_completion: typeof lifecycle.archive_after_completion === "boolean" ? lifecycle.archive_after_completion : null,
    archive_status: lifecycle.archive_status || null,
    archive_policy: lifecycle.archive_policy || null,
    blockers: Array.isArray(lifecycle.blockers) ? lifecycle.blockers : [],
    archived: lifecycle.current_stage === "archived",
    trashed_at: lifecycle.trashed_at || null
  };
}

function renderTaskLifecycleState(state) {
  return [
    `Task Lifecycle: ${state.task_id || "unknown"}`,
    `Title: ${state.title || "n/a"}`,
    `Status: ${state.status || "unknown"}`,
    `Stage: ${state.current_stage || "intake"}${state.stage_label ? ` (${state.stage_label})` : ""}`,
    state.evolution_milestone_id ? `Evolution: ${state.evolution_milestone_id}${state.evolution_milestone_title ? ` (${state.evolution_milestone_title})` : ""}` : "Evolution: n/a",
    `Track: ${state.track_label || getTrackDisplayLabel(state.track)}`,
    state.branch_name ? `Branch: ${state.branch_name}` : "Branch: n/a",
    state.merge_target_branch ? `Merge target: ${state.merge_target_branch}` : "Merge target: n/a",
    state.sync_policy ? `Sync policy: ${state.sync_policy}${state.github_sync_enabled === false ? " (local-only)" : ""}` : "Sync policy: n/a",
    state.review_gate ? `Review gate: ${state.review_gate}` : "Review gate: n/a",
    state.task_trash_policy ? `Task trash policy: ${typeof state.task_trash_policy === "string" ? state.task_trash_policy : JSON.stringify(state.task_trash_policy)}` : "Task trash policy: n/a",
    typeof state.archive_after_completion === "boolean" ? `Archive after completion: ${state.archive_after_completion ? "yes" : "no"}` : null,
    state.archive_status ? `Archive status: ${state.archive_status}` : null,
    state.archive_policy ? `Archive policy: ${state.archive_policy.warning || JSON.stringify(state.archive_policy)}` : null,
    state.archive_policy && state.archive_policy.requires_explicit_request
      ? "Viber tasks are not archived automatically after closure."
      : null,
    state.archive_policy && state.archive_policy.requires_confirmation
      ? "Archive/trash requires explicit Viber confirmation."
      : null,
    `Next action: ${state.next_action || "inspect task status and choose next governed action"}`,
    `Assignee: ${state.assignee_id || "n/a"}`,
    `Reviewer: ${state.reviewer_id || "n/a"}`,
    `Acceptance criteria: ${Number(state.acceptance_criteria_count || 0)}`,
    `Active tokens: ${(state.active_tokens || []).length}`,
    `Active locks: ${(state.active_locks || []).length}`,
    `Active sessions: ${(state.active_sessions || []).length}`,
    state.trashed_at ? `Trashed at: ${state.trashed_at}` : null,
    state.trashed_reason ? `Trashed reason: ${state.trashed_reason}` : null,
    "",
    "Lifecycle path:",
    ...renderLifecyclePath(state)
  ].filter(Boolean).join("\n");
}

function renderTaskLifecycleBoard(board) {
  const stageRows = Object.entries(board.summary.by_stage || {}).map(([stage, count]) => [
    stage,
    String(count || 0),
    getLifecycleStageLabel(stage),
    getLifecycleNextAction(stage)
  ]);
  const recentRows = (board.tasks || [])
    .slice()
    .sort((a, b) => String(b.trashed_at || b.status || "").localeCompare(String(a.trashed_at || a.status || "")))
    .slice(0, 12)
    .map((item) => [
      item.id || "",
      item.title || "",
      item.status || "",
      item.lifecycle_stage || "",
      getTrackDisplayShortLabel(item.track),
      item.evolution_milestone_id || "",
      item.branch_name || "",
      item.review_gate || "",
      item.lifecycle_next_action || ""
    ]);
  return [
    "Task Lifecycle Board",
    "",
    `Generated at: ${board.generated_at || "unknown"}`,
    `Total items: ${board.summary.total || 0}`,
    `Active: ${board.summary.active_total || 0}`,
    `Archived: ${board.summary.archived_total || 0}`,
    "",
    "Stages:",
    stageRows.length ? require("./../ui").table(["Stage", "Count", "Label", "Next Action"], stageRows) : "No lifecycle data.",
    "",
    "Recent lifecycle rows:",
    recentRows.length ? require("./../ui").table(["ID", "Title", "Status", "Stage", "Track", "Evolution", "Branch", "Review", "Next Action"], recentRows) : "No recent tasks."
  ].join("\n");
}

function normalizeTaskLifecycleStage(taskItem, options = {}) {
  if (options.archived || taskItem && (taskItem.trashed_at || taskItem.source_collection === "tasks.json" && taskItem.trashed_reason)) return "archived";
  const status = String(taskItem && taskItem.status ? taskItem.status : "").toLowerCase();
  if (["proposed", "todo", "draft", "suggested", "intake", "backlog"].includes(status)) return "intake";
  if (["approved", "ready", "assigned"].includes(status)) return "ready";
  if (["in_progress", "working", "executing", "implementation"].includes(status)) return "execution";
  if (["review", "owner_verified", "verified", "accepted"].includes(status)) return "validation";
  if (["done", "closed", "completed"].includes(status)) return "closure";
  if (["blocked", "rejected", "deferred"].includes(status)) return "blocked";
  return status === "trashed" ? "archived" : "intake";
}

function getLifecycleStageLabel(stage) {
  const labels = {
    intake: "Intake",
    ready: "Ready",
    execution: "Execution",
    validation: "Validation",
    closure: "Closure",
    blocked: "Blocked",
    archived: "Archived"
  };
  return labels[stage] || "Intake";
}

function getLifecycleNextAction(stage, status = "", archived = false, track = "framework_owner") {
  if (archived || stage === "archived" || status === "trashed") return "restore from trash or purge after retention";
  if (stage === "intake") return "approve or refine task scope";
  if (stage === "ready") return "assign the task and issue a scoped token";
  if (stage === "execution") return "continue execution, record evidence, then move to review";
  if (stage === "validation") return "review acceptance evidence and Owner verify or reject";
  if (stage === "closure") {
    if (track === "vibe_app_developer") {
      return "Task is closed. Archive only if the Viber explicitly requests it and confirms the 30-day trash retention warning.";
    }
    return "archive the completed task, tokens, and locks";
  }
  if (stage === "blocked") return "resolve blockers or reopen with a clearer scope";
  return "inspect task status and choose next governed action";
}

function getNextLifecycleStatuses(stage, status, archived = false) {
  if (archived || stage === "archived" || status === "trashed") return ["restore", "purge"];
  if (stage === "intake") return ["approved", "ready"];
  if (stage === "ready") return ["assigned", "in_progress"];
  if (stage === "execution") return ["review"];
  if (stage === "validation") return ["owner_verified", "rejected"];
  if (stage === "closure") return ["closed"];
  if (stage === "blocked") return ["reopened", "ready"];
  return [];
}

function renderLifecyclePath(state) {
  const path = state.lifecycle_path || ["intake", "ready", "execution", "validation", "closure"];
  const current = state.current_stage || "intake";
  return path.map((stage) => {
    const marker = stage === current ? ">" : " ";
    return `${marker} ${stage}${stage === current ? " (current)" : ""}`;
  });
}

function buildLifecycleArchivePolicy(track, stage, options = {}, evolution = {}) {
  const isViberTrack = track === "vibe_app_developer";
  const retentionDays = Number(
    options.trash_retention_days ||
      (options.task_trash_policy && options.task_trash_policy.trash_retention_days) ||
      (evolution.task_trash_policy && evolution.task_trash_policy.trash_retention_days) ||
      30
  ) || 30;
  if (isViberTrack) {
    return buildTaskArchivePolicy({
      retentionDays,
      requiresConfirmation: true,
      autoArchive: false
    });
  }
  if (stage === "closure") {
    return buildTaskArchivePolicy({
      retentionDays,
      requiresConfirmation: false,
      autoArchive: Boolean(options.archive_after_completion !== false)
    });
  }
  return buildTaskArchivePolicy({
    retentionDays,
    requiresConfirmation: false,
    autoArchive: false
  });
}

function summarizeLifecycleRows(rows) {
  const byStage = Object.fromEntries(LIFECYCLE_STAGES.map((stage) => [stage, 0]));
  let archivedTotal = 0;
  for (const row of rows) {
    const stage = row.lifecycle_stage || "intake";
    byStage[stage] = (byStage[stage] || 0) + 1;
    if (stage === "archived") archivedTotal += 1;
  }
  return {
    total: rows.length,
    active_total: rows.length - archivedTotal,
    archived_total: archivedTotal,
    by_stage: byStage
  };
}

function groupLifecycleRows(rows) {
  return rows.reduce((groups, row) => {
    const stage = row.lifecycle_stage || "intake";
    groups[stage] = groups[stage] || [];
    groups[stage].push({
      id: row.id,
      title: row.title,
      status: row.status,
      next_action: row.lifecycle_next_action,
      milestone_id: row.evolution_milestone_id || null,
      branch_name: row.branch_name || null,
      review_gate: row.review_gate || null,
      archived: row.archived || false,
      trashed_at: row.trashed_at || null
    });
    return groups;
  }, {});
}

function extractTaskEvolutionContext(taskItem = {}, evolutionState = null) {
  const evolutionIndex = buildEvolutionChangeIndex(evolutionState);
  const evolutionMatch = resolveTaskEvolutionChange(taskItem, evolutionIndex);
  const taskTrashPolicy = taskItem && taskItem.task_trash_policy && typeof taskItem.task_trash_policy === "object"
    ? taskItem.task_trash_policy
    : taskItem && taskItem.task_trash_policy && typeof taskItem.task_trash_policy === "string"
      ? taskItem.task_trash_policy
      : null;
  const milestone = evolutionMatch || {};
  const fallbackMilestoneId = taskItem.evolution_milestone_id || taskItem.milestone_id || taskItem.evolution_change_id || taskItem.change_id || milestone.milestone_id || milestone.change_id || null;
  const fallbackBranchName = milestone.branch_name || (fallbackMilestoneId ? `evo/${String(fallbackMilestoneId).toLowerCase()}` : "");
  const fallbackMergeTargetBranch = milestone.merge_target_branch || (fallbackMilestoneId ? "main" : "");
  const fallbackSyncPolicy = milestone.sync_policy || (fallbackMilestoneId ? "local_only" : "");
  const fallbackGithubSyncEnabled = typeof milestone.github_sync_enabled === "boolean"
    ? milestone.github_sync_enabled
    : fallbackMilestoneId ? false : null;
  const fallbackReviewGate = milestone.review_gate || (fallbackMilestoneId ? "viber_review_required" : "");
  const fallbackTaskTrashPolicy = taskTrashPolicy || milestone.task_trash_policy || (fallbackMilestoneId ? { archive_status: "trashed" } : null);
  return {
    evolution_change_id: taskItem.evolution_change_id || taskItem.change_id || taskItem.evolution_id || milestone.change_id || fallbackMilestoneId || null,
    evolution_milestone_id: taskItem.evolution_milestone_id || taskItem.milestone_id || taskItem.evolution_change_id || taskItem.change_id || milestone.milestone_id || milestone.change_id || fallbackMilestoneId || null,
    evolution_milestone_title: taskItem.evolution_milestone_title || taskItem.milestone_title || milestone.title || "",
    branch_name: taskItem.branch_name || milestone.branch_name || fallbackBranchName || "",
    merge_target_branch: taskItem.merge_target_branch || milestone.merge_target_branch || fallbackMergeTargetBranch || "",
    sync_policy: taskItem.sync_policy || milestone.sync_policy || fallbackSyncPolicy || "",
    github_sync_enabled: typeof taskItem.github_sync_enabled === "boolean"
      ? taskItem.github_sync_enabled
      : typeof milestone.github_sync_enabled === "boolean"
        ? milestone.github_sync_enabled
        : fallbackGithubSyncEnabled,
    review_gate: taskItem.review_gate || milestone.review_gate || fallbackReviewGate || "",
    task_trash_policy: fallbackTaskTrashPolicy,
    archive_after_completion: typeof taskItem.archive_after_completion === "boolean"
      ? taskItem.archive_after_completion
      : typeof milestone.archive_after_completion === "boolean"
        ? milestone.archive_after_completion
        : fallbackMilestoneId ? true : null,
    archive_status: taskItem.archive_status || milestone.archive_status || (fallbackMilestoneId ? "trashed" : ""),
    track: normalizeLifecycleTrack(taskItem.track || taskItem.evolution_track || taskItem.workspace_track || milestone.audience || taskItem.source || "")
  };
}

function normalizeLifecycleTrack(value = "") {
  const normalized = normalizeTrackAssignment(value);
  if (normalized) return normalized;
  return String(value || "").trim().toLowerCase() === "shared" ? "shared" : "framework_owner";
}

function resolveLifecycleTaskTrack(taskItem = {}, fallbackTrack = "framework_owner") {
  const explicit = normalizeLifecycleTrack(taskItem.track || taskItem.evolution_track || taskItem.workspace_track || "");
  if (explicit && explicit !== "framework_owner") return explicit;
  if (typeof taskItem.source === "string" && taskItem.source.startsWith("evolution:")) return fallbackTrack;
  return fallbackTrack;
}

function buildEvolutionChangeIndex(evolutionState = null) {
  const changes = Array.isArray(evolutionState && evolutionState.changes) ? evolutionState.changes : [];
  const index = new Map();
  for (const change of changes) {
    if (!change) continue;
    if (change.change_id) index.set(String(change.change_id), change);
    if (change.milestone_id) index.set(String(change.milestone_id), change);
  }
  if (evolutionState && evolutionState.current_change_id) {
    const current = changes.find((item) => item && item.change_id === evolutionState.current_change_id);
    if (current && !index.has(String(current.change_id))) index.set(String(current.change_id), current);
  }
  return index;
}

function resolveTaskEvolutionChange(taskItem = {}, evolutionIndex = new Map()) {
  const candidateIds = [
    taskItem.evolution_change_id,
    taskItem.change_id,
    taskItem.evolution_id,
    taskItem.evolution_milestone_id,
    taskItem.milestone_id
  ].filter(Boolean).map((value) => String(value));
  for (const id of candidateIds) {
    if (evolutionIndex.has(id)) return evolutionIndex.get(id);
  }
  return null;
}

function readTaskLifecycleTrash(taskId) {
  const trash = ensureTaskTrashState();
  const record = (trash.trash || []).find((item) => item.id === taskId);
  return record ? taskTrashSummary(record) : null;
}

module.exports = {
  buildTaskLifecycleState,
  buildTaskLifecycleBoard,
  normalizeTaskLifecycleStage,
  getLifecycleStageLabel,
  getLifecycleNextAction,
  readTaskLifecycleTrash,
  renderTaskLifecycleState,
  renderTaskLifecycleBoard
};
