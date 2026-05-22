const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const {
  fileExists,
  readJsonFile,
  writeJsonFile,
  writeTextFile,
  repoRoot
} = require("../../../src/cli/fs_utils");
const { outputLines } = require("../../../src/cli/services/report_output");
const { table } = require("../../../src/cli/ui");
const { readGitRepositoryState, readGitHeadCommit } = require("../../../src/cli/services/git_snapshot");

const PLUGIN_ID = "github_provider";
const PLUGIN_ROOT = path.join(repoRoot(), "plugins", PLUGIN_ID);
const GH_CONFIG_FILE = ".kabeeri/github/sync_config.json";
const GH_ISSUE_MAP_FILE = ".kabeeri/github/issue_map.json";
const GH_TEAM_FEEDBACK_FILE = ".kabeeri/github/team_feedback.json";

function getPluginStatus() {
  const manifest = readManifest();
  const available = Boolean(manifest);
  return {
    report_type: "github_provider_status",
    plugin_id: PLUGIN_ID,
    status: available ? "available" : "warning",
    provider: "github",
    remote_provider: "github",
    enabled_by_default: false,
    writes_remote_by_default: false,
    canonical_provider: true,
    available,
    next_action: "Run kvdf github-provider readiness --json."
  };
}

function buildGithubProviderStatus(options = {}) {
  const cwd = resolveCwd(options);
  const gitState = readGitRepositoryState(cwd);
  const remoteUrls = readGitRemoteUrls(cwd);
  const githubRemoteDetected = remoteUrls.some((url) => isGithubRemoteUrl(url));
  const ghAvailable = hasGhCli();
  const warnings = [];
  const blockers = [];

  if (!gitState.is_repo) blockers.push("No Git repository detected.");
  if (!remoteUrls.length) warnings.push("No git remote URL detected.");
  if (remoteUrls.length && !githubRemoteDetected) warnings.push("Git remote exists, but it does not look like a GitHub remote.");
  if (githubRemoteDetected && !ghAvailable) warnings.push("gh CLI is not available locally; confirmed remote actions may be unavailable.");

  return {
    report_type: "github_provider_status",
    plugin_id: PLUGIN_ID,
    status: "available",
    provider: "github",
    remote_provider: "github",
    provider_plugin: PLUGIN_ID,
    enabled_by_default: false,
    core_dependency: false,
    writes_remote_by_default: false,
    canonical_provider: true,
    repo_detected: gitState.is_repo,
    git_remote_detected: remoteUrls.length > 0,
    github_remote_detected: githubRemoteDetected,
    auth_required: githubRemoteDetected ? "yes" : "no",
    available: true,
    warnings,
    blockers,
    next_action: githubRemoteDetected
      ? "Run kvdf github-provider readiness --json."
      : "Configure a GitHub remote if you want provider-backed PR or release planning."
  };
}

function buildGithubProviderReadiness(options = {}) {
  const cwd = resolveCwd(options);
  const gitState = readGitRepositoryState(cwd);
  const remoteUrls = readGitRemoteUrls(cwd);
  const githubRemoteDetected = remoteUrls.some((url) => isGithubRemoteUrl(url));
  const ghAvailable = hasGhCli();
  const blockers = [];
  const warnings = [];

  if (!gitState.is_repo) blockers.push("No Git repository detected.");
  if (!remoteUrls.length) warnings.push("No git remote URL detected.");
  if (remoteUrls.length && !githubRemoteDetected) warnings.push("Git remote exists, but it does not look like a GitHub remote.");
  if (githubRemoteDetected && !ghAvailable) warnings.push("gh CLI is not available locally; confirmed GitHub actions may be unavailable.");

  const status = blockers.length ? "blocked" : warnings.length ? "warning" : "pass";
  return {
    report_type: "github_provider_readiness",
    status,
    repo_detected: gitState.is_repo,
    git_remote_detected: remoteUrls.length > 0,
    github_remote_detected: githubRemoteDetected,
    auth_required: githubRemoteDetected ? "yes" : "no",
    write_mode: "dry_run",
    blockers,
    warnings,
    next_action: githubRemoteDetected
      ? "GitHub provider readiness is sufficient for dry-run planning; confirm remote actions only when policy gates allow it."
      : "Add a GitHub remote or keep using local Git/direct-to-main."
  };
}

function buildGithubSyncPlan(options = {}) {
  const cwd = resolveCwd(options);
  const gitState = readGitRepositoryState(cwd);
  const config = readGithubSyncConfig();
  const issueMap = readGithubIssueMap();
  const remoteUrls = readGitRemoteUrls(cwd);
  const githubRemoteDetected = remoteUrls.some((url) => isGithubRemoteUrl(url));
  const sourceControlMode = normalizeSourceControlMode(options.source_control_mode || options.mode || options["sc-mode"] || (gitState.is_repo ? "direct_main" : "local_only"));
  const plannedSyncActions = [];
  const blockers = [];
  const warnings = [];

  if (!gitState.is_repo) blockers.push("No Git repository detected.");
  if (!githubRemoteDetected) warnings.push("No GitHub remote detected; provider-backed sync remains dry-run only.");
  if (sourceControlMode === "branch_pr") plannedSyncActions.push("Prepare branch, push, and pull-request handoff after approval and materialization.");
  if (sourceControlMode === "branch") plannedSyncActions.push("Prepare a branch push after approval and materialization.");
  if (sourceControlMode === "direct_main") plannedSyncActions.push("Stay on direct-to-main and keep GitHub writes opt-in only.");
  if (config.repo) plannedSyncActions.push(`Use configured GitHub repo ${config.repo}.`);
  else plannedSyncActions.push("Configure a GitHub repo mapping before any confirmed remote action.");
  if (Array.isArray(issueMap.items) && issueMap.items.length === 0) plannedSyncActions.push("Seed the issue map in dry-run before confirming remote sync.");
  if (!plannedSyncActions.length) plannedSyncActions.push("Review local Git state and keep GitHub operations as dry-run only.");

  const status = blockers.length ? "blocked" : warnings.length ? "warning" : "pass";
  return {
    report_type: "github_provider_sync_plan",
    status,
    source_control_mode: sourceControlMode,
    provider: "github",
    remote_provider: "github",
    provider_plugin: PLUGIN_ID,
    planned_sync_actions: plannedSyncActions,
    dry_run: true,
    next_action: plannedSyncActions[0] || "Review the local Git and GitHub provider state before any remote action."
  };
}

function buildGithubIssuePlan(options = {}) {
  const config = readGithubSyncConfig();
  const issueMap = readGithubIssueMap();
  const plannedIssues = Array.isArray(issueMap.items)
    ? issueMap.items.map((item) => ({
      issue_key: item.issue_key || null,
      issue_number: item.issue_number || null,
      title: item.title || item.subject_id || null,
      milestone: item.milestone || null,
      labels: Array.isArray(item.labels) ? [...item.labels] : []
    }))
    : [];
  const status = config.repo || plannedIssues.length ? "warning" : "pass";
  return {
    report_type: "github_provider_issue_plan",
    provider: "github",
    remote_provider: "github",
    provider_plugin: PLUGIN_ID,
    planned_issues: plannedIssues,
    dry_run: true,
    next_action: plannedIssues.length
      ? "Review the issue plan and confirm only after owner approval."
      : "Seed issues from the approved plan when the repository and GitHub mapping are ready.",
    status
  };
}

function buildGithubPrPlan(options = {}) {
  const cwd = resolveCwd(options);
  const gitState = readGitRepositoryState(cwd);
  const remoteUrls = readGitRemoteUrls(cwd);
  const githubRemoteDetected = remoteUrls.some((url) => isGithubRemoteUrl(url));
  const branchName = gitState.current_branch || options.branch_name || options.branch || null;
  const status = !gitState.is_repo ? "blocked" : githubRemoteDetected ? "pass" : "warning";
  return {
    report_type: "github_provider_pr_plan",
    provider: "github",
    remote_provider: "github",
    provider_plugin: PLUGIN_ID,
    planned_pr: {
      branch_name: branchName,
      title: options.title || (branchName ? `PR for ${branchName}` : "GitHub pull request"),
      remote_provider: "github",
      provider_plugin: PLUGIN_ID,
      github_remote_detected: githubRemoteDetected,
      commit_sha: readGitHeadCommit(cwd) || null
    },
    dry_run: true,
    status,
    next_action: githubRemoteDetected
      ? "Use the branch/PR plan only after approval and materialization."
      : "Configure a GitHub remote before using branch/PR handoff planning."
  };
}

function buildGithubReleasePlan(options = {}) {
  const config = readGithubSyncConfig();
  const version = String(options.version || config.default_version || options.release_version || "").trim() || null;
  const status = version ? "warning" : "pass";
  return {
    report_type: "github_provider_release_plan",
    provider: "github",
    remote_provider: "github",
    provider_plugin: PLUGIN_ID,
    planned_release: {
      version,
      title: version ? `Kabeeri VDF ${version}` : null,
      notes_file: options.notes || (version ? `.kabeeri/releases/${version}.notes.md` : null),
      provider_plugin: PLUGIN_ID,
      remote_provider: "github",
      confirm_required: true
    },
    dry_run: true,
    status,
    next_action: version
      ? "Review release notes and confirm only after readiness and policy gates pass."
      : "Provide a version before preparing a GitHub release plan."
  };
}

function buildGithubHandoffPlan(options = {}) {
  const config = readGithubSyncConfig();
  const issueMap = readGithubIssueMap();
  const feedback = readGithubTeamFeedback();
  const handoffItems = [
    "Review the GitHub provider readiness report before any remote action.",
    "Keep remote writes as dry-run until owner approval and policy gates pass.",
    config.repo ? `Use configured GitHub repo ${config.repo}.` : "Configure the GitHub repo mapping when the workspace is ready.",
    Array.isArray(issueMap.items) && issueMap.items.length ? `Issue map entries available: ${issueMap.items.length}.` : "No issue map entries recorded yet.",
    Array.isArray(feedback.items) && feedback.items.length ? `Team feedback entries available: ${feedback.items.length}.` : "No team feedback entries recorded yet."
  ];
  return {
    report_type: "github_provider_handoff_plan",
    provider: "github",
    remote_provider: "github",
    provider_plugin: PLUGIN_ID,
    handoff_items: handoffItems,
    dry_run: true,
    next_action: "Use the handoff plan to keep GitHub operations optional and reviewable."
  };
}

function buildGithubPlannerProviderSummary(options = {}) {
  const readiness = buildGithubProviderReadiness(options);
  const status = readiness.status === "blocked" ? "blocked" : readiness.status === "warning" ? "warning" : "pass";
  return {
    report_type: "github_provider_planner_summary",
    plugin_id: PLUGIN_ID,
    status,
    provider: "github",
    remote_provider: "github",
    provider_plugin: PLUGIN_ID,
    core_dependency: false,
    canonical_provider: true,
    enabled_by_default: false,
    write_mode: "dry_run",
    next_action: readiness.next_action
  };
}

function buildGithubTeamStatus(flags = {}) {
  const config = readGithubSyncConfig();
  const feedback = readGithubTeamFeedback();
  const issueMap = readGithubIssueMap();
  const teamMode = isTeamGithubMode();
  const issueCount = Array.isArray(issueMap.items) ? issueMap.items.length : 0;
  const commentCount = feedback.items.filter((item) => item.feedback_type === "comment").length;
  const prCount = feedback.items.filter((item) => item.feedback_type === "pr").length;
  const statusCount = feedback.items.filter((item) => item.feedback_type === "status").length;
  const currentSyncPolicy = teamMode ? "team" : (config.dry_run_default === false ? "recommended" : "optional");
  const report = {
    report_type: "github_team_feedback_status",
    generated_at: new Date().toISOString(),
    team_mode: teamMode,
    collaboration_mode: teamMode ? "team" : "solo",
    repo: config.repo || null,
    branch: config.branch || null,
    issue_map: {
      path: GH_ISSUE_MAP_FILE,
      total: issueCount,
      tasks: issueMap.tasks.length,
      conflicts: issueMap.conflicts.length
    },
    feedback: {
      path: GH_TEAM_FEEDBACK_FILE,
      total: feedback.items.length,
      issues: feedback.items.filter((item) => item.feedback_type === "issue").length,
      prs: prCount,
      statuses: statusCount,
      comments: commentCount
    },
    sync_policy: currentSyncPolicy,
    next_actions: buildGithubTeamStatusActions({ teamMode, config, issueCount, feedbackCount: feedback.items.length })
  };
  if (flags.json) return report;
  return report;
}

function buildGithubIntegrationReport(flags = {}) {
  const config = readGithubSyncConfig();
  const issueMap = readGithubIssueMap();
  const feedback = readGithubTeamFeedback();
  const issueItems = Array.isArray(issueMap.items) ? issueMap.items : [];
  const issueTasks = Array.isArray(issueMap.tasks) ? issueMap.tasks : [];
  const issueConflicts = Array.isArray(issueMap.conflicts) ? issueMap.conflicts : [];
  const feedbackItems = Array.isArray(feedback.items) ? feedback.items : [];
  const teamMode = isTeamGithubMode();
  const confirmedWritePath = "kvdf github issue sync --confirm | kvdf github release publish --confirm";
  const report = {
    report_type: "github_integration_report",
    generated_at: new Date().toISOString(),
    source_of_truth: ".kabeeri",
    config: {
      repo: config.repo || null,
      branch: config.branch || null,
      dry_run_default: config.dry_run_default !== false,
      write_requires_confirmation: config.write_requires_confirmation !== false
    },
    state_files: {
      sync_config: GH_CONFIG_FILE,
      issue_map: GH_ISSUE_MAP_FILE,
      team_feedback: GH_TEAM_FEEDBACK_FILE
    },
    issue_map: {
      total: issueItems.length,
      tasks: issueTasks.length,
      conflicts: issueConflicts.length
    },
    team_feedback: {
      total: feedbackItems.length,
      issues: feedbackItems.filter((item) => item.feedback_type === "issue").length,
      prs: feedbackItems.filter((item) => item.feedback_type === "pr").length,
      statuses: feedbackItems.filter((item) => item.feedback_type === "status").length,
      comments: feedbackItems.filter((item) => item.feedback_type === "comment").length
    },
    traceability: {
      team_mode: teamMode,
      invocations: [
        "kvdf github status",
        "kvdf github feedback list",
        "kvdf github issue sync --dry-run",
        "kvdf github issue sync --confirm",
        "kvdf github release publish --confirm"
      ],
      confirmed_write_path: confirmedWritePath
    },
    next_actions: buildGithubIntegrationActions({ config, issueItems, feedbackItems, teamMode })
  };
  if (flags.json) return report;
  return report;
}

function renderGithubIntegrationReport(report) {
  console.log("Kabeeri GitHub Integration Report");
  console.log(table(["Field", "Value"], [
    ["Repo", report.config.repo || "none"],
    ["Branch", report.config.branch || "none"],
    ["Dry-run default", report.config.dry_run_default ? "yes" : "no"],
    ["Write requires confirm", report.config.write_requires_confirmation ? "yes" : "no"],
    ["Issue map entries", report.issue_map.total],
    ["Feedback entries", report.team_feedback.total],
    ["Team mode", report.traceability.team_mode ? "yes" : "no"]
  ]));
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
}

function buildGithubTeamFeedbackReport(flags = {}) {
  const report = buildGithubTeamStatus(flags);
  const feedback = readGithubTeamFeedback();
  return {
    ...report,
    report_type: "github_team_feedback_log",
    items: feedback.items,
    next_actions: report.next_actions
  };
}

function buildGithubIntegrationActions({ config, issueItems, feedbackItems, teamMode }) {
  const actions = [];
  if (!config.repo) actions.push("Set `kvdf github config set --repo owner/repo` before any confirmed write workflow.");
  if (issueItems.length === 0) actions.push("Run `kvdf github issue sync --dry-run` or `--confirm` to seed the issue map.");
  if (!teamMode) actions.push("Use team mode when you want GitHub feedback records to persist collaboration signals.");
  if (teamMode && feedbackItems.length === 0) actions.push("Record a status, issue, PR, or comment feedback event to trace collaboration history.");
  if (!actions.length) actions.push("GitHub integration is documented and traceable; continue with the next governed sync step.");
  return actions;
}

function buildGithubTeamStatusActions({ teamMode, config, issueCount, feedbackCount }) {
  const actions = [];
  if (!teamMode) actions.push("Team feedback remains local-only until the workspace is in team mode.");
  if (!config.repo) actions.push("Set `kvdf github config set --repo <owner/repo>` before expecting GitHub feedback sync.");
  if (teamMode && issueCount === 0) actions.push("Run `kvdf github issue sync --confirm` to seed issue tracking from the current plan.");
  if (teamMode && feedbackCount === 0) actions.push("Record a comment, issue, PR, or status feedback event with `kvdf github feedback record`.");
  if (!actions.length) actions.push("GitHub sync feedback is active; continue with the next governed task.");
  return actions;
}

function renderGithubTeamStatus(report) {
  console.log("Kabeeri GitHub Team Feedback Status");
  console.log(table(["Field", "Value"], [
    ["Team mode", report.team_mode ? "yes" : "no"],
    ["Collaboration mode", report.collaboration_mode],
    ["Repo", report.repo || "none"],
    ["Branch", report.branch || "none"],
    ["Issue map entries", report.issue_map.total],
    ["Team feedback entries", report.feedback.total],
    ["Sync policy", report.sync_policy]
  ]));
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
}

function renderGithubTeamFeedback(report) {
  console.log("Kabeeri GitHub Team Feedback Log");
  console.log(table(["Field", "Value"], [
    ["Total", report.items.length],
    ["Issues", report.feedback.issues],
    ["PRs", report.feedback.prs],
    ["Statuses", report.feedback.statuses],
    ["Comments", report.feedback.comments]
  ]));
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
}

function recordGithubTeamFeedback(flags = {}) {
  ensureGithubWorkspace();
  const teamMode = isTeamGithubMode();
  if (!teamMode) {
    throw new Error("GitHub team feedback recording is only available in team mode.");
  }
  const feedbackType = normalizeFeedbackType(flags.type || flags.feedback_type || "status");
  const subjectType = flags.subject_type || "task";
  const subjectId = flags.subject || flags.issue || flags.pr || flags.status || "unknown";
  const message = String(flags.message || flags.note || flags.comment || "").trim() || "GitHub team feedback recorded.";
  const file = GH_TEAM_FEEDBACK_FILE;
  const state = readGithubTeamFeedback();
  const feedback = {
    feedback_id: `github-feedback-${String(state.items.length + 1).padStart(3, "0")}`,
    feedback_type: feedbackType,
    subject_type: subjectType,
    subject_id: subjectId,
    message,
    source_action: flags.source_action || `github feedback ${feedbackType}`,
    created_at: new Date().toISOString()
  };
  state.items.push(feedback);
  writeJsonFile(file, state);
  return feedback;
}

function recordGithubPolicyResult(subjectId, status, message, checks = []) {
  ensureGithubWorkspace();
  const file = ".kabeeri/policies/policy_results.json";
  const state = fileExists(file) ? readJsonFile(file) : { results: [] };
  state.results = Array.isArray(state.results) ? state.results : [];
  const result = {
    result_id: `github-write-${Date.now()}`,
    policy_id: "github_write_policy",
    subject_type: "github_write",
    subject_id: subjectId,
    status,
    evaluated_at: new Date().toISOString(),
    stage: "confirmed",
    message,
    checks
  };
  state.results.push(result);
  writeJsonFile(file, state);
  return result;
}

function normalizeFeedbackType(value) {
  const normalized = String(value || "").toLowerCase();
  if (["issue", "pr", "status", "comment"].includes(normalized)) return normalized;
  return "status";
}

function readManifest() {
  const manifestPath = path.join(PLUGIN_ROOT, "plugin.json");
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

function readGithubSyncConfig() {
  return fileExists(GH_CONFIG_FILE) ? readJsonFile(GH_CONFIG_FILE) : {};
}

function readGithubIssueMap() {
  const data = fileExists(GH_ISSUE_MAP_FILE)
    ? readJsonFile(GH_ISSUE_MAP_FILE)
    : {};
  return {
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    conflicts: Array.isArray(data.conflicts) ? data.conflicts : [],
    items: Array.isArray(data.items) ? data.items : []
  };
}

function readGithubTeamFeedback() {
  const data = fileExists(GH_TEAM_FEEDBACK_FILE)
    ? readJsonFile(GH_TEAM_FEEDBACK_FILE)
    : {};
  return {
    items: Array.isArray(data.items) ? data.items : []
  };
}

function ensureGithubWorkspace() {
  if (!fileExists(".kabeeri")) {
    throw new Error("GitHub team feedback requires a .kabeeri workspace.");
  }
}

function isTeamGithubMode() {
  const cwd = repoRoot();
  const developerMode = readJsonAt(path.join(cwd, ".kabeeri", "developer_mode.json")) || {};
  const developers = (readJsonAt(path.join(cwd, ".kabeeri", "developers.json")) || {}).developers || [];
  const agents = (readJsonAt(path.join(cwd, ".kabeeri", "agents.json")) || {}).agents || [];
  const activeDevelopers = developers.filter((item) => item.status !== "inactive").length;
  const activeAgents = agents.filter((item) => item.status !== "inactive").length;
  return developerMode.mode !== "solo" && developerMode.mode !== "owner_developer" && activeDevelopers + activeAgents > 1;
}

function readJsonAt(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readGitRemoteUrls(cwd = repoRoot()) {
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

function isGithubRemoteUrl(url) {
  return /github\.com[:/]/i.test(String(url || ""));
}

function hasGhCli() {
  try {
    execFileSync("gh", ["--version"], { cwd: repoRoot(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return true;
  } catch {
    return false;
  }
}

function resolveCwd(options = {}) {
  return path.resolve(options.cwd || repoRoot());
}

function normalizeSourceControlMode(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized) return "local_only";
  if (["local_only", "direct_main", "branch", "branch_pr", "none"].includes(normalized)) return normalized;
  return "local_only";
}

function printGithubDryRun(plan, flags) {
  const lines = [
    `GitHub dry-run for ${plan.version}`,
    `Source: ${plan.file}`,
    "",
    `Labels: ${plan.data.labels.length}`,
    `Milestones: ${plan.data.milestones.length}`,
    `Issues: ${countIssues(plan.data)}`,
    "",
    "No remote GitHub changes were made."
  ];
  return outputLines(lines, flags.output);
}

function printGithubLabels(plan, flags) {
  const lines = [
    `GitHub label sync dry-run for ${plan.version}`,
    "",
    ...plan.data.labels.map((label) => `gh label create "${label.name}" --color "${label.color}" --description "${label.description}"`)
  ];
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function printGithubMilestones(plan, flags) {
  const lines = [
    `GitHub milestone sync dry-run for ${plan.version}`,
    "",
    ...plan.data.milestones.map((milestone) => `gh api repos/:owner/:repo/milestones -f title="${milestone.title}" -f description="${milestone.goal}"`)
  ];
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function printGithubIssues(plan, flags) {
  const lines = [`GitHub issue sync dry-run for ${plan.version}`, ""];
  for (const milestone of plan.data.milestones) {
    for (const issue of milestone.issues || []) {
      const labels = (issue.labels || []).join(",");
      lines.push(`gh issue create --title "${escapeShellText(issue.title)}" --milestone "${escapeShellText(milestone.title)}" --label "${escapeShellText(labels)}"`);
    }
  }
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function syncGithubLabels(plan) {
  if (!hasGhCli()) {
    throw new Error("Policy gate blocked: gh CLI is not available locally. Remote GitHub label sync remains dry-run only.");
  }
  ensureGhAvailable();
  let created = 0;
  let updated = 0;
  for (const label of plan.data.labels) {
    const create = runGh(["label", "create", label.name, "--color", label.color, "--description", label.description], { allowFailure: true });
    if (create.ok) {
      created += 1;
    } else {
      runGh(["label", "edit", label.name, "--color", label.color, "--description", label.description]);
      updated += 1;
    }
  }
  console.log(`GitHub labels synced for ${plan.version}: ${created} created, ${updated} updated.`);
}

function syncGithubMilestones(plan) {
  if (!hasGhCli()) {
    throw new Error("Policy gate blocked: gh CLI is not available locally. Remote GitHub milestone sync remains dry-run only.");
  }
  ensureGhAvailable();
  const existing = getGithubMilestoneTitles();
  let created = 0;
  let skipped = 0;
  for (const milestone of plan.data.milestones) {
    if (existing.has(milestone.title)) {
      skipped += 1;
      continue;
    }
    runGh(["api", "repos/:owner/:repo/milestones", "-f", `title=${milestone.title}`, "-f", `description=${milestone.goal}`]);
    created += 1;
  }
  console.log(`GitHub milestones synced for ${plan.version}: ${created} created, ${skipped} existing.`);
}

function syncGithubIssues(plan) {
  if (!hasGhCli()) {
    throw new Error("Policy gate blocked: gh CLI is not available locally. Remote GitHub issue sync remains dry-run only.");
  }
  ensureGhAvailable();
  const issueMap = loadIssueMap();
  let created = 0;
  let skipped = 0;

  for (const milestone of plan.data.milestones) {
    for (const issue of milestone.issues || []) {
      const issueKey = makePlanIssueKey(plan.version, milestone.title, issue.title);
      if (issueMap.items.some((item) => item.issue_key === issueKey && item.issue_number)) {
        skipped += 1;
        continue;
      }
      const labels = (issue.labels || []).join(",");
      const body = buildGithubIssueBody(plan, milestone, issue, issueKey);
      const args = ["issue", "create", "--title", issue.title, "--body", body, "--milestone", milestone.title];
      if (labels) args.push("--label", labels);
      const result = runGh(args);
      const issueNumber = parseIssueNumber(result.stdout);
      issueMap.items.push({
        issue_key: issueKey,
        issue_number: issueNumber,
        title: issue.title,
        milestone: milestone.title,
        labels: issue.labels || []
      });
      created += 1;
    }
  }
  saveIssueMap(issueMap);
  console.log(`GitHub issues synced for ${plan.version}: ${created} created, ${skipped} skipped.`);
}

function publishGithubRelease(plan, flags) {
  if (!flags.publishGatesPassed) {
    throw new Error("GitHub release publish requires publish gates to pass first.");
  }
  if (!hasGhCli()) {
    throw new Error("Release publish blocked by readiness: gh CLI is not available locally. Run `kvdf readiness report --target release --strict`.");
  }
  ensureGhAvailable();
  const notesFile = flags.notes || `.kabeeri/releases/${plan.version}.notes.md`;
  writeTextFile(notesFile, `${buildGithubReleaseNotes(plan).join("\n")}\n`);
  runGh(["release", "create", plan.version, "--title", `Kabeeri VDF ${plan.version}`, "--notes-file", notesFile]);
  console.log(`Published GitHub release ${plan.version}.`);
}

function buildGithubReleaseNotes(plan) {
  return [
    `# Kabeeri VDF ${plan.version} Release Notes`,
    "",
    "## Summary",
    "",
    `Release ${plan.version} is prepared through the GitHub provider plugin.`,
    "",
    "## Notes",
    "",
    "- Confirm owner approval before any remote write.",
    "- Keep dry-run as the default path.",
    "- GitHub remains optional and removable."
  ];
}

function ensureGhAvailable() {
  runGh(["--version"]);
}

function runGh(args, options = {}) {
  try {
    const stdout = execFileSync("gh", args, { cwd: repoRoot(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, stdout: String(stdout || "").trim() };
  } catch (error) {
    if (options.allowFailure) {
      return {
        ok: false,
        stdout: error && error.stdout ? String(error.stdout) : "",
        stderr: error && error.stderr ? String(error.stderr) : error.message
      };
    }
    const stderr = error && error.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`gh ${args.join(" ")} failed: ${stderr}`);
  }
}

function getGithubMilestoneTitles() {
  const result = runGh(["api", "repos/:owner/:repo/milestones", "--paginate", "--jq", ".[].title"]);
  return new Set(result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

function loadIssueMap() {
  if (!fileExists(".kabeeri")) return { items: [], workspace: false, tasks: [], conflicts: [] };
  const data = fileExists(GH_ISSUE_MAP_FILE) ? readJsonFile(GH_ISSUE_MAP_FILE) : {};
  return {
    workspace: true,
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    conflicts: Array.isArray(data.conflicts) ? data.conflicts : [],
    items: Array.isArray(data.items) ? data.items : []
  };
}

function saveIssueMap(issueMap) {
  if (!issueMap.workspace) return;
  writeJsonFile(GH_ISSUE_MAP_FILE, {
    tasks: issueMap.tasks || [],
    conflicts: issueMap.conflicts || [],
    items: issueMap.items || []
  });
}

function makePlanIssueKey(version, milestoneTitle, issueTitle) {
  return `${version}:${milestoneTitle}:${issueTitle}`;
}

function buildGithubIssueBody(plan, milestone, issue, issueKey) {
  return [
    "<!-- kabeeri-task-sync -->",
    `Plan: ${plan.version}`,
    `Issue key: ${issueKey}`,
    `Milestone goal: ${milestone.goal}`,
    "",
    "Labels:",
    ...(issue.labels || []).map((label) => `- ${label}`),
    "",
    "Generated by Kabeeri VDF CLI."
  ].join("\n");
}

function parseIssueNumber(output) {
  const match = String(output || "").match(/\/issues\/(\d+)/);
  return match ? Number(match[1]) : null;
}

function escapeShellText(value) {
  return String(value || "").replace(/"/g, '\\"');
}

function countIssues(planData) {
  return (planData.milestones || []).reduce((sum, milestone) => sum + (milestone.issues || []).length, 0);
}

function runGithubProvider(action, value, flags = {}, rest = [], deps = {}) {
  const compat = Boolean(flags.compatibility_surface || deps.compatibility_surface);
  const normalizedAction = normalizeAction(action);
  if (!normalizedAction || normalizedAction === "status") {
    const report = compat ? buildGithubTeamStatus(flags) : buildGithubProviderStatus({ cwd: deps.repo_root || repoRoot() });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else {
      if (compat) renderGithubTeamStatus(report);
      else console.log(JSON.stringify(report, null, 2));
    }
    return report;
  }
  if (!compat && normalizedAction === "readiness") {
    const report = buildGithubProviderReadiness({ cwd: deps.repo_root || repoRoot(), ...flags });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return report;
  }
  if (!compat && normalizedAction === "sync-plan") {
    const report = buildGithubSyncPlan({ cwd: deps.repo_root || repoRoot(), ...flags });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return report;
  }
  if (!compat && normalizedAction === "issue-plan") {
    const report = buildGithubIssuePlan({ cwd: deps.repo_root || repoRoot(), ...flags });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return report;
  }
  if (!compat && normalizedAction === "pr-plan") {
    const report = buildGithubPrPlan({ cwd: deps.repo_root || repoRoot(), ...flags });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return report;
  }
  if (!compat && normalizedAction === "release-plan") {
    const report = buildGithubReleasePlan({ cwd: deps.repo_root || repoRoot(), ...flags });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return report;
  }
  if (!compat && normalizedAction === "handoff-plan") {
    const report = buildGithubHandoffPlan({ cwd: deps.repo_root || repoRoot(), ...flags });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(JSON.stringify(report, null, 2));
    return report;
  }
  if (compat && normalizedAction === "config") {
    return githubConfig(value, flags);
  }
  if (compat && normalizedAction === "report") {
    const report = buildGithubIntegrationReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderGithubIntegrationReport(report);
    return report;
  }
  if (compat && normalizedAction === "feedback") {
    const subaction = value || "list";
    if (subaction === "list") {
      const report = buildGithubTeamFeedbackReport(flags);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else renderGithubTeamFeedback(report);
      return report;
    }
    if (subaction === "record") {
      const feedback = recordGithubTeamFeedback(flags);
      if (deps.appendAudit) deps.appendAudit("github.team_feedback.recorded", "github", feedback.feedback_id, `GitHub team feedback recorded: ${feedback.feedback_type}`);
      if (flags.json) console.log(JSON.stringify(feedback, null, 2));
      else console.log(`GitHub team feedback recorded: ${feedback.feedback_id}`);
      return feedback;
    }
    throw new Error(`Unknown GitHub feedback action: ${subaction}`);
  }

  const subaction = value;
  const version = flags.version || "v4.0.0";
  const plan = typeof deps.findPlan === "function" ? deps.findPlan(version) : buildPlanFallback(version);
  const confirmed = Boolean(flags.confirm);

  if (!confirmed || flags["dry-run"]) {
    if (!normalizedAction || normalizedAction === "plan") {
      return printGithubDryRun(plan, flags);
    }

    if (normalizedAction === "label" && (!subaction || subaction === "sync")) {
      return printGithubLabels(plan, flags);
    }

    if (normalizedAction === "milestone" && (!subaction || subaction === "sync")) {
      return printGithubMilestones(plan, flags);
    }

    if (normalizedAction === "issue" && (!subaction || subaction === "sync")) {
      return printGithubIssues(plan, flags);
    }

    if (normalizedAction === "release" && (!subaction || subaction === "prepare")) {
      return outputLines(buildGithubReleaseNotes(plan), flags.output);
    }

    throw new Error(`Unknown GitHub dry-run command: github ${normalizedAction} ${subaction || ""}`.trim());
  }

  if (normalizedAction === "label" && (!subaction || subaction === "sync")) {
    syncGithubLabels(plan);
    return { status: "ok", action: "label", version: plan.version };
  }

  if (normalizedAction === "milestone" && (!subaction || subaction === "sync")) {
    syncGithubMilestones(plan);
    return { status: "ok", action: "milestone", version: plan.version };
  }

  if (normalizedAction === "issue" && (!subaction || subaction === "sync")) {
    if (typeof deps.runGithubWriteGate === "function") {
      deps.runGithubWriteGate(action, subaction, plan, flags);
      syncGithubIssues(plan);
    } else {
      recordGithubPolicyResult("github issue sync", "blocked", "Policy gate blocked: GitHub issue sync requires a write gate before remote writes.", [
        { check_id: "github_write_policy", result: "fail" }
      ]);
      throw new Error("Policy gate blocked: GitHub issue sync requires a write gate before remote writes.");
    }
    return { status: "ok", action: "issue", version: plan.version };
  }

  if (normalizedAction === "release" && subaction === "publish") {
    if (typeof deps.runReleasePublishGates === "function") {
      deps.runReleasePublishGates(plan, flags);
    } else if (!flags.publishGatesPassed) {
      throw new Error("Release publish blocked by readiness: GitHub release publish requires publish gates before remote writes.");
    }
    publishGithubRelease(plan, { ...flags, publishGatesPassed: true });
    return { status: "ok", action: "release", version: plan.version };
  }

  throw new Error(`Unknown confirmed GitHub command: github ${normalizedAction} ${subaction || ""}`.trim());
}

function buildPlanFallback(version) {
  return {
    version,
    file: `.kabeeri/plans/${version}.json`,
    data: {
      labels: [],
      milestones: []
    }
  };
}

function githubConfig(action, flags = {}) {
  ensureGithubWorkspace();
  const file = GH_CONFIG_FILE;
  const data = fileExists(file) ? readJsonFile(file) : { dry_run_default: true, write_requires_confirmation: true };

  if (!action || action === "show") {
    console.log(JSON.stringify(data, null, 2));
    return data;
  }

  if (action === "set") {
    if (flags.repo) data.repo = flags.repo;
    if (flags.branch) data.branch = flags.branch;
    if (flags["default-version"]) data.default_version = flags["default-version"];
    if (flags.version) data.default_version = flags.version;
    if (flags["dry-run-default"] !== undefined) data.dry_run_default = flags["dry-run-default"] !== "false";
    data.write_requires_confirmation = true;
    data.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    if (flags.json) console.log(JSON.stringify(data, null, 2));
    else console.log("GitHub sync config updated.");
    return data;
  }

  throw new Error(`Unknown GitHub config action: ${action}`);
}

function normalizeAction(action) {
  return String(action || "").trim().toLowerCase();
}

module.exports = {
  getPluginStatus,
  runGithubProvider,
  buildGithubProviderStatus,
  buildGithubProviderReadiness,
  buildGithubSyncPlan,
  buildGithubIssuePlan,
  buildGithubPrPlan,
  buildGithubReleasePlan,
  buildGithubHandoffPlan,
  buildGithubPlannerProviderSummary,
  buildGithubTeamStatus,
  buildGithubIntegrationReport,
  renderGithubIntegrationReport,
  buildGithubTeamFeedbackReport,
  buildGithubIntegrationActions,
  buildGithubTeamStatusActions,
  buildGithubIssueBody,
  buildGithubReleaseNotes,
  githubConfig,
  printGithubDryRun,
  printGithubLabels,
  printGithubMilestones,
  printGithubIssues,
  syncGithubLabels,
  syncGithubMilestones,
  syncGithubIssues,
  publishGithubRelease,
  recordGithubTeamFeedback,
  readGithubSyncConfig,
  readGithubIssueMap,
  readGithubTeamFeedback,
  readGitRemoteUrls,
  isGithubRemoteUrl,
  hasGhCli,
  ensureGithubWorkspace,
  isTeamGithubMode,
  normalizeFeedbackType
};
