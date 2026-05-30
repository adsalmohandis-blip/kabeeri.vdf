const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");
const { buildCurrentStateReport, buildStaleStateReport } = require("../services/source_truth");
const { reconcileRuntimeTruth } = require("../services/truth_registry");
const {
  readGitRepositoryState,
  readGitStatus,
  readGitHeadCommit,
  readGitRecentCommits,
  readGitLatestTags
} = require("../services/git_snapshot");
const { buildGitContext } = require("../services/source_control_context");
const { normalizeTrackAssignment, getTrackDisplayLabel } = require("../services/track_control");

const CURRENT_STATE_REPORT_PATH = ".kabeeri/state_resync/current_state_report.json";
const STATE_RESYNC_HISTORY_PATH = ".kabeeri/state_resync/state_resync_history.json";
const MAX_HISTORY_ENTRIES = 25;
const REPORT_FRESHNESS_MS = 30 * 60 * 1000;

function stateResync(action, value, flags = {}, rest = [], deps = {}) {
  const track = resolveStateResyncTrack(flags, value, rest);
  const pluginId = resolveStateResyncPluginId(flags);
  const cwd = deps.repo_root || repoRoot();
  const actionName = String(action || "resync").toLowerCase();

  if (actionName === "status") {
    const report = loadStateResyncReport(cwd);
    const payload = report || buildStateResyncReport({ cwd, track, pluginId, persist: false });
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const report = buildStateResyncReport({ cwd, track, pluginId, persist: true });
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

function buildStateResyncReport(options = {}) {
  const cwd = path.resolve(options.cwd || repoRoot());
  const track = resolveStateResyncTrack({ track: options.track });
  const pluginId = resolveStateResyncPluginId({ plugin: options.pluginId || options.plugin_id || options.plugin });
  const generatedAt = new Date().toISOString();
  const currentState = buildCurrentStateReport({
    cwd,
    targetTrack: track,
    pluginId
  });
  const gitRepository = readGitRepositoryState(cwd);
  const gitStatus = readGitStatus(cwd);
  const headCommit = readGitHeadCommit(cwd);
  const recentCommits = readGitRecentCommits(cwd, 8);
  const latestTags = readGitLatestTags(cwd, 8);
  const runtimeEvolution = readJsonIfExists(path.join(cwd, ".kabeeri", "evolution.json")) || {
    changes: [],
    development_priorities: [],
    deferred_ideas: [],
    current_change_id: null
  };
  const runtimeTasks = readJsonIfExists(path.join(cwd, ".kabeeri", "tasks.json")) || { tasks: [] };
  const runtimeTruth = reconcileRuntimeTruth(cwd);
  const staleState = buildStaleStateReport({ cwd });
  const sourceTruthPriority = buildSourceOfTruthPriority(track);
  const fileState = buildFileState(track, pluginId, cwd);
  const runtimeSummary = summarizeRuntimeState(runtimeEvolution, runtimeTasks);
  const staleDocs = collectStaleDocs(staleState, runtimeTruth);
  const conflicts = collectStateConflicts({
    currentState,
    runtimeTruth,
    staleState,
    runtimeEvolution,
    runtimeTasks,
    headCommit
  });
  const freshness = evaluateStateResyncFreshness({
    generated_at: generatedAt,
    repo: {
      root: cwd,
      branch: gitRepository.current_branch || null,
      latest_commit: headCommit || null
    },
    conflicts
  }, {
    cwd,
    current_branch: gitRepository.current_branch || null,
    head_commit: headCommit || null
  });
  const activeEvolution = selectActiveEvolution(runtimeEvolution);
  const plannedEvolutions = selectPlannedEvolutions(runtimeEvolution);
  const completedEvolutions = selectCompletedEvolutions(runtimeEvolution);
  const futureOnlyEvolutions = selectFutureOnlyEvolutions(runtimeEvolution);
  const recommendedNextEvolution = recommendNextEvolution({
    track,
    activeEvolution,
    plannedEvolutions,
    completedEvolutions,
    fileState,
    conflicts,
    runtimeSummary
  });
  const ownerQuestions = buildOwnerQuestions({
    track,
    currentState,
    freshness,
    conflicts,
    recommendedNextEvolution
  });
  const status = conflicts.some((item) => item.severity === "blocking")
    ? "blocked"
    : freshness.state_freshness === "current"
      ? "current"
      : "warning";
  const report = {
    report_type: "kvdf_current_state_report",
    generated_at: generatedAt,
    status,
    track: track === "vibe_app_developer" ? "vibe_app_developer" : track === "plugin" ? "plugin" : "framework_owner",
    track_label: getTrackDisplayLabel(track),
    state_freshness: freshness.state_freshness,
    repo: {
      root: cwd,
      branch: gitRepository.current_branch || null,
      status_clean: gitStatus.changed_files === 0,
      latest_commit: headCommit || null
    },
    source_control: buildSourceControlSummary({ cwd, track, gitRepository, headCommit }),
    source_of_truth_priority: sourceTruthPriority,
    file_state: fileState,
    git_evidence: {
      available: gitRepository.available,
      recent_commits: recentCommits,
      latest_tags: latestTags,
      status: gitStatus.entries || []
    },
    remote_evidence: {
      available: false,
      provider: "none",
      notes: ["GitHub is optional secondary provider/plugin evidence only when enabled."]
    },
    runtime_state: {
      available: true,
      supporting_only: true,
      evolution_summary: runtimeSummary.evolution_summary,
      task_summary: runtimeSummary.task_summary,
      current_state_report_path: CURRENT_STATE_REPORT_PATH
    },
    completed_evolutions: completedEvolutions,
    active_evolution: activeEvolution,
    planned_evolutions: plannedEvolutions,
    future_only_evolutions: futureOnlyEvolutions,
    stale_docs: staleDocs,
    conflicts,
    recommended_next_evolution: recommendedNextEvolution,
    do_not_proceed: status === "blocked" || freshness.state_freshness === "stale" || freshness.state_freshness === "unknown",
    owner_questions: ownerQuestions,
    next_action: buildNextAction(status, freshness, recommendedNextEvolution),
    current_state: currentState
  };

  if (options.persist !== false) {
    persistStateResyncArtifacts(report, cwd);
  }

  return report;
}

function persistStateResyncArtifacts(report, cwd = repoRoot()) {
  fs.mkdirSync(path.dirname(path.join(cwd, CURRENT_STATE_REPORT_PATH)), { recursive: true });
  fs.writeFileSync(path.join(cwd, CURRENT_STATE_REPORT_PATH), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const historyFile = path.join(cwd, STATE_RESYNC_HISTORY_PATH);
  const history = readJsonIfExists(historyFile) || { report_type: "kvdf_state_resync_state", generated_at: report.generated_at, entries: [] };
  history.report_type = "kvdf_state_resync_state";
  history.generated_at = report.generated_at;
  history.current_state_report_path = CURRENT_STATE_REPORT_PATH;
  history.entries = Array.isArray(history.entries) ? history.entries : [];
  history.entries.unshift({
    generated_at: report.generated_at,
    track: report.track,
    status: report.status,
    state_freshness: report.state_freshness,
    repo: report.repo,
    recommended_next_evolution: report.recommended_next_evolution
  });
  history.entries = history.entries.slice(0, MAX_HISTORY_ENTRIES);
  fs.writeFileSync(historyFile, `${JSON.stringify(history, null, 2)}\n`, "utf8");
}

function loadStateResyncReport(cwd = repoRoot()) {
  return readJsonIfExists(path.join(cwd, CURRENT_STATE_REPORT_PATH));
}

function loadStateResyncHistory(cwd = repoRoot()) {
  return readJsonIfExists(path.join(cwd, STATE_RESYNC_HISTORY_PATH));
}

function evaluateStateResyncFreshness(report, evidence = {}) {
  if (!report) {
    return {
      state_freshness: "unknown",
      fresh: false,
      reasons: ["No current-state report exists."]
    };
  }
  const reasons = [];
  const currentBranch = String(evidence.current_branch || report.repo && report.repo.branch || "").trim() || null;
  const currentHead = String(evidence.head_commit || report.repo && report.repo.latest_commit || "").trim() || null;
  const reportRoot = String(report.repo && report.repo.root || "").trim() || null;
  const cwd = String(evidence.cwd || "").trim() || null;
  if (cwd && reportRoot && path.resolve(cwd) !== path.resolve(reportRoot)) reasons.push("Repo root does not match the current workspace.");
  if (currentBranch && report.repo && report.repo.branch && currentBranch !== report.repo.branch) reasons.push("Branch does not match the current workspace.");
  if (currentHead && report.repo && report.repo.latest_commit && currentHead !== report.repo.latest_commit) reasons.push("Latest commit does not match HEAD.");
  if (report.generated_at) {
    const age = Date.now() - new Date(report.generated_at).getTime();
    if (Number.isFinite(age) && age > REPORT_FRESHNESS_MS) reasons.push("Current-state report is stale for this session.");
  }
  const blockingConflicts = Array.isArray(report.conflicts)
    ? report.conflicts.filter((item) => item && item.severity === "blocking")
    : [];
  if (blockingConflicts.length) reasons.push("Blocking conflicts remain unresolved.");
  const fresh = reasons.length === 0;
  return {
    state_freshness: fresh ? "current" : reasons.some((item) => /stale|mismatch|does not match/i.test(item)) ? "stale" : "unknown",
    fresh,
    reasons
  };
}

function resolveStateResyncTrack(flags = {}, value = "", rest = []) {
  return normalizeTrackAssignment(flags.track || flags["planner-track"] || value || rest[0] || "owner") || "framework_owner";
}

function resolveStateResyncPluginId(flags = {}) {
  const plugin = String(flags.plugin || flags.plugin_id || flags["plugin-id"] || "").trim();
  return plugin || null;
}

function buildSourceOfTruthPriority(track) {
  if (track === "vibe_app_developer") {
    return [
      "Current app docs and requirements files",
      "Current app manifests/specs/configs",
      "Current app source structure",
      "Current app tests",
      "Local Git history if available",
      "Release/tag history if available",
      "Remote provider history such as GitHub only if enabled",
      ".kabeeri/ runtime state as supporting state only",
      "Chat history as supporting context only"
    ];
  }
  if (track === "plugin") {
    return [
      "Current plugin docs and manifest",
      "Current plugin runtime and source",
      "Current plugin tests",
      "Local Git history if available",
      "Release/tag history if available",
      "Remote provider history such as GitHub only if enabled",
      ".kabeeri/ runtime state as supporting state only",
      "Chat history as supporting context only"
    ];
  }
  return [
    "Current KVDF source files and docs",
    "Current branch and latest main",
    "Git commit history",
    "Release/tag history if available",
    "Current roadmap/docs",
    "Current manifests/specs/configs",
    ".kabeeri/ runtime state as supporting state only",
    "GitHub only if enabled as remote/provider plugin",
    "Chat history as supporting context only"
  ];
}

function buildSourceControlSummary({ cwd, track, gitRepository, headCommit }) {
  const remoteUrls = readGitRemoteUrls(cwd);
  const gitContext = buildGitContext({ cwd, track, gitRepository });
  const mode = track === "vibe_app_developer"
    ? "local_first"
    : track === "plugin"
      ? "provider_optional"
      : "git_direct_to_main";
  return {
    enabled: Boolean(gitRepository && gitRepository.available),
    provider: "git",
    remote_provider: remoteUrls.length ? "github" : "none",
    provider_plugin: remoteUrls.length ? "github_provider" : null,
    mode,
    branching_enabled: mode !== "git_direct_to_main",
    pr_enabled: mode !== "git_direct_to_main" && remoteUrls.length > 0,
    default_branch: "main",
    current_branch: gitRepository.current_branch || null,
    latest_main_commit: headCommit || null,
    requires_owner_approval: track !== "framework_owner",
    replaceable_provider: true,
    git_context: gitContext,
    notes: remoteUrls.length
      ? ["GitHub is optional secondary provider/plugin evidence only when enabled."]
      : ["State Resync is file-first, not GitHub-first."]
  };
}

function readGitRemoteUrls(cwd) {
  const result = [];
  const configPath = path.join(cwd, ".git", "config");
  if (!fs.existsSync(configPath)) return result;
  const text = String(fs.readFileSync(configPath, "utf8") || "");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*url\s*=\s*(.+)\s*$/i);
    if (match) result.push(match[1].trim());
  }
  return [...new Set(result)];
}

function buildFileState(track, pluginId, cwd) {
  if (track === "vibe_app_developer") {
    return {
      docs_inspected: [
        "workspaces/apps/<app-slug>/docs/",
        "workspaces/apps/<app-slug>/requirements/",
        "workspaces/apps/<app-slug>/system-design/",
        "docs/workflows/KVDF_STATE_RESYNC.md",
        "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
        "docs/workflows/CURRENT_STATE_REPORT_TEMPLATE.md"
      ],
      manifests_inspected: [
        "package.json",
        ".kabeeri/project.json",
        ".kabeeri/questionnaires/answers.json"
      ],
      source_summary: {
        current_app_files_first: true,
        source_order: "app docs -> manifests/specs/configs -> source -> tests -> git history -> releases -> remote provider -> .kabeeri -> chat"
      },
      tests_summary: {
        inspected: ["tests/cli.integration.test.js", "npm test"],
        current_app_tests_primary: true
      }
    };
  }
  if (track === "plugin") {
    return {
      docs_inspected: [
        `plugins/${pluginId || "plugin"}/docs/`,
        "docs/workflows/KVDF_STATE_RESYNC.md",
        "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
        "docs/workflows/CURRENT_STATE_REPORT_TEMPLATE.md"
      ],
      manifests_inspected: [
        `plugins/${pluginId || "plugin"}/plugin.json`,
        "package.json",
        "schemas/runtime/schema_registry.json"
      ],
      source_summary: {
        current_plugin_files_first: true,
        source_order: "plugin docs -> plugin manifest/specs -> plugin source -> plugin tests -> git history -> releases -> remote provider -> .kabeeri -> chat"
      },
      tests_summary: {
        inspected: ["tests/cli.integration.test.js", "npm test"],
        current_plugin_tests_primary: true
      }
    };
  }
  return {
    docs_inspected: [
      "knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md",
      "docs/workflows/KVDF_STATE_RESYNC.md",
      "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
      "docs/workflows/CURRENT_STATE_REPORT_TEMPLATE.md",
      "docs/cli/CLI_COMMAND_REFERENCE.md",
      "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
      "README.md"
    ],
    manifests_inspected: [
      "package.json",
      "schemas/runtime/schema_registry.json",
      "schemas/runtime/current-state-report.schema.json",
      "schemas/runtime/state-resync-state.schema.json"
    ],
    source_summary: {
      current_source_files_first: true,
      source_order: "core source -> current main -> git history -> releases/tags -> roadmap/docs -> manifests/specs/configs -> .kabeeri -> remote provider -> chat"
    },
    tests_summary: {
      inspected: ["tests/cli.integration.test.js", "tests/service.unit.test.js", "node bin/kvdf.js validate", "npm test"],
      current_core_tests_primary: true
    }
  };
}

function summarizeRuntimeState(evolutionState, taskState) {
  const changes = Array.isArray(evolutionState.changes) ? evolutionState.changes : [];
  const tasks = Array.isArray(taskState.tasks) ? taskState.tasks : [];
  return {
    evolution_summary: {
      changes_total: changes.length,
      current_change_id: evolutionState.current_change_id || null,
      active_evolutions: changes.filter((change) => !["done", "verified", "closed"].includes(String(change.status || "").toLowerCase())).length,
      planned_evolutions: changes.filter((change) => ["planned", "proposed", "recommended"].includes(String(change.status || "").toLowerCase())).length,
      future_only_evolutions: Array.isArray(evolutionState.deferred_ideas) ? evolutionState.deferred_ideas.length : 0
    },
    task_summary: {
      tasks_total: tasks.length,
      open_tasks: tasks.filter((task) => !["done", "closed", "rejected", "owner_verified"].includes(String(task.status || "").toLowerCase())).length,
      linked_tasks: tasks.filter((task) => Boolean(task.evolution_change_id)).length
    }
  };
}

function selectActiveEvolution(evolutionState) {
  const changes = Array.isArray(evolutionState.changes) ? evolutionState.changes : [];
  if (evolutionState.current_change_id) {
    const current = changes.find((change) => change.change_id === evolutionState.current_change_id) || null;
    if (current && !["done", "verified", "closed"].includes(String(current.status || "").toLowerCase())) {
      return current;
    }
  }
  return changes.find((change) => !["done", "verified", "closed"].includes(String(change.status || "").toLowerCase())) || null;
}

function selectPlannedEvolutions(evolutionState) {
  return (Array.isArray(evolutionState.development_priorities) ? evolutionState.development_priorities : [])
    .filter((item) => ["planned", "proposed", "recommended"].includes(String(item.status || "").toLowerCase()));
}

function selectCompletedEvolutions(evolutionState) {
  return (Array.isArray(evolutionState.changes) ? evolutionState.changes : [])
    .filter((change) => ["done", "verified", "closed"].includes(String(change.status || "").toLowerCase()));
}

function selectFutureOnlyEvolutions(evolutionState) {
  return (Array.isArray(evolutionState.deferred_ideas) ? evolutionState.deferred_ideas : []).map((item) => item);
}

function collectStaleDocs(staleState, runtimeTruth) {
  const items = [];
  for (const item of Array.isArray(staleState.historical_items) ? staleState.historical_items : []) {
    if (item && item.path) items.push(item.path);
  }
  for (const item of Array.isArray(staleState.reports) ? staleState.reports : []) {
    if (item && item.path) items.push(item.path);
  }
  for (const item of Array.isArray(runtimeTruth.stale_planned) ? runtimeTruth.stale_planned : []) {
    if (item && (item.change_id || item.id || item.title)) items.push(item.change_id || item.id || item.title);
  }
  return [...new Set(items)];
}

function collectStateConflicts({ currentState, runtimeTruth, staleState, runtimeEvolution, runtimeTasks, headCommit }) {
  const conflicts = [];
  if (Array.isArray(runtimeTruth.stale_planned) && runtimeTruth.stale_planned.length) {
    for (const item of runtimeTruth.stale_planned) {
      conflicts.push({
        severity: "warning",
        source: "runtime_state",
        description: `${item.change_id || item.id || "planned item"} is stale against current source evidence.`
      });
    }
  }
  if (Array.isArray(runtimeTruth.stale_recommended) && runtimeTruth.stale_recommended.length) {
    for (const item of runtimeTruth.stale_recommended) {
      conflicts.push({
        severity: "warning",
        source: "runtime_state",
        description: `${item.change_id || item.id || "recommended item"} is stale against current source evidence.`
      });
    }
  }
  if (Array.isArray(runtimeTruth.runtime_only_evolutions) && runtimeTruth.runtime_only_evolutions.length) {
    for (const item of runtimeTruth.runtime_only_evolutions) {
      conflicts.push({
        severity: "blocking",
        source: "runtime_state",
        description: `${item.title || item.id || "runtime-only evolution"} lacks source-level evidence.`
      });
    }
  }
  const currentChange = currentState && currentState.current_state && currentState.current_state.current_plan_id ? currentState.current_state.current_plan_id : null;
  if (currentChange && runtimeEvolution.current_change_id && currentChange !== runtimeEvolution.current_change_id) {
    conflicts.push({
      severity: "warning",
      source: "evolution_state",
      description: "Current planner state and runtime evolution state disagree."
    });
  }
  if (Array.isArray(staleState.superseded_items) && staleState.superseded_items.length) {
    for (const item of staleState.superseded_items) {
      conflicts.push({
        severity: "warning",
        source: "stale_state",
        description: `${item.path || item.id || "stale item"} is superseded by newer evidence.`
      });
    }
  }
  if (Array.isArray(runtimeTasks.tasks) && runtimeTasks.tasks.some((task) => String(task.status || "").toLowerCase() === "proposed") && headCommit) {
    conflicts.push({
      severity: "info",
      source: "tasks",
      description: "Proposed tasks are present and should not outrank current source evidence."
    });
  }
  return conflicts;
}

function recommendNextEvolution({ track, activeEvolution, plannedEvolutions, conflicts, runtimeSummary }) {
  if (track === "vibe_app_developer") {
    return plannedEvolutions[0] || activeEvolution || null;
  }
  if (track === "plugin") {
    return plannedEvolutions[0] || activeEvolution || null;
  }
  if (activeEvolution && activeEvolution.change_id === "owner-dashboard-planner" && runtimeSummary.task_summary.open_tasks > 0) {
    return {
      change_id: "owner-dashboard-planner-tests",
      title: "owner-dashboard-planner-tests",
      reason: "It is the live task memory and closes the remaining planner-layer evidence gap.",
      evidence: [
        "Current .kabeeri/evolution state",
        "Current .kabeeri/tasks.json task memory",
        "Current owner-track planner docs and tests"
      ]
    };
  }
  return plannedEvolutions[0] || activeEvolution || null;
}

function buildOwnerQuestions({ track, conflicts, recommendedNextEvolution }) {
  const questions = [];
  if (track === "framework_owner" && !recommendedNextEvolution) {
    questions.push("Confirm the next owner-track Evolution before planning continues.");
  }
  if (conflicts.some((item) => item.severity === "blocking")) {
    questions.push("Resolve the blocking source conflict before using the next Evolution.");
  }
  return questions;
}

function buildNextAction(status, freshness, recommendedNextEvolution) {
  if (status === "blocked") return "Run `kvdf state resync --track owner --json`, reconcile the blocking conflicts, then retry planning.";
  if (freshness.state_freshness !== "current") return "Run `kvdf state resync --track owner --json` again before recommending the next Evolution.";
  if (recommendedNextEvolution && recommendedNextEvolution.title) return `Use the evidence-backed next Evolution: ${recommendedNextEvolution.title}.`;
  return "Review the current-state report, then recommend the next evidence-backed Evolution.";
}

function readJsonIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

module.exports = {
  buildStateResyncReport,
  CURRENT_STATE_REPORT_PATH,
  STATE_RESYNC_HISTORY_PATH,
  evaluateStateResyncFreshness,
  loadStateResyncHistory,
  loadStateResyncReport,
  stateResync
};
