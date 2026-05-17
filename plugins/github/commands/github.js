const fs = require("fs");
const path = require("path");

const { fileExists, readJsonFile, writeJsonFile, repoRoot } = require("../../../src/cli/fs_utils");
const { table } = require("../../../src/cli/ui");

function github(action, value, flags = {}, deps = {}) {
  const {
    githubConfig,
    findPlan,
    printGithubDryRun,
    printGithubLabels,
    printGithubMilestones,
    printGithubIssues,
    releaseCommand,
    getReleaseCommandDeps,
    runGithubWriteGate,
    syncGithubLabels,
    syncGithubMilestones,
    syncGithubIssues,
    runReleasePublishGates,
    publishGithubRelease,
    appendAudit
  } = deps;

  if (action === "config") {
    return githubConfig(value, flags);
  }
  if (action === "status") {
    const report = buildGithubTeamStatus(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderGithubTeamStatus(report);
    return;
  }
  if (action === "report") {
    const report = buildGithubIntegrationReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderGithubIntegrationReport(report);
    return;
  }
  if (action === "feedback") {
    const subaction = value || "list";
    if (subaction === "list") {
      const report = buildGithubTeamFeedbackReport(flags);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else renderGithubTeamFeedback(report);
      return;
    }
    if (subaction === "record") {
      const feedback = recordGithubTeamFeedback(flags);
      if (appendAudit) appendAudit("github.team_feedback.recorded", "github", feedback.feedback_id, `GitHub team feedback recorded: ${feedback.feedback_type}`);
      if (flags.json) console.log(JSON.stringify(feedback, null, 2));
      else console.log(`GitHub team feedback recorded: ${feedback.feedback_id}`);
      return;
    }
    throw new Error(`Unknown GitHub feedback action: ${subaction}`);
  }
  const subaction = value;
  const version = flags.version || "v4.0.0";
  const plan = findPlan(version);
  const confirmed = Boolean(flags.confirm);

  if (!confirmed || flags["dry-run"]) {
    if (!action || action === "plan") {
      return printGithubDryRun(plan, flags);
    }

    if (action === "label" && (!subaction || subaction === "sync")) {
      return printGithubLabels(plan, flags);
    }

    if (action === "milestone" && (!subaction || subaction === "sync")) {
      return printGithubMilestones(plan, flags);
    }

    if (action === "issue" && (!subaction || subaction === "sync")) {
      return printGithubIssues(plan, flags);
    }

    if (action === "release" && (!subaction || subaction === "prepare")) {
      return releaseCommand("notes", version, { ...flags, stdout: true }, getReleaseCommandDeps());
    }

    throw new Error(`Unknown GitHub dry-run command: github ${action} ${subaction || ""}`.trim());
  }

  if (action === "label" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubLabels(plan);
  }

  if (action === "milestone" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubMilestones(plan);
  }

  if (action === "issue" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    if (isTeamGithubMode()) recordGithubTeamFeedback({
      feedback_type: "issue_sync",
      subject_type: "release_plan",
      subject_id: version,
      message: `Synced GitHub issues for ${version}.`,
      source_action: "github issue sync"
    });
    return syncGithubIssues(plan);
  }

  if (action === "release" && subaction === "publish") {
    runReleasePublishGates(plan, flags);
    return publishGithubRelease(plan, { ...flags, publishGatesPassed: true });
  }

  throw new Error(`Unknown confirmed GitHub command: github ${action} ${subaction || ""}`.trim());
}

function buildGithubTeamStatus(flags = {}) {
  const config = readGithubSyncConfig();
  const feedback = readGithubTeamFeedback();
  const issueMap = readGithubIssueMap();
  const teamMode = isTeamGithubMode();
  const issueCount = issueMap.items.length;
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
      path: ".kabeeri/github/issue_map.json",
      total: issueCount,
      tasks: issueMap.tasks.length,
      conflicts: issueMap.conflicts.length
    },
    feedback: {
      path: ".kabeeri/github/team_feedback.json",
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

function buildGithubTeamStatusActions({ teamMode, config, issueCount, feedbackCount }) {
  const actions = [];
  if (!teamMode) actions.push("Team feedback remains local-only until the workspace is in team mode.");
  if (!config.repo) actions.push("Set `kvdf github config set --repo <owner/repo>` before expecting GitHub feedback sync.");
  if (teamMode && issueCount === 0) actions.push("Run `kvdf github issue sync --confirm` to seed issue tracking from the current plan.");
  if (teamMode && feedbackCount === 0) actions.push("Record a comment, issue, PR, or status feedback event with `kvdf github feedback record`.");
  if (!actions.length) actions.push("GitHub sync feedback is active; continue with the next governed task.");
  return actions;
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
      sync_config: ".kabeeri/github/sync_config.json",
      issue_map: ".kabeeri/github/issue_map.json",
      team_feedback: ".kabeeri/github/team_feedback.json"
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

function buildGithubIntegrationActions({ config, issueItems, feedbackItems, teamMode }) {
  const actions = [];
  if (!config.repo) actions.push("Set `kvdf github config set --repo owner/repo` before any confirmed write workflow.");
  if (issueItems.length === 0) actions.push("Run `kvdf github issue sync --dry-run` or `--confirm` to seed the issue map.");
  if (!teamMode) actions.push("Use team mode when you want GitHub feedback records to persist collaboration signals.");
  if (teamMode && feedbackItems.length === 0) actions.push("Record a status, issue, PR, or comment feedback event to trace collaboration history.");
  if (!actions.length) actions.push("GitHub integration is documented and traceable; continue with the next governed sync step.");
  return actions;
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
  const file = ".kabeeri/github/team_feedback.json";
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

function normalizeFeedbackType(value) {
  const normalized = String(value || "").toLowerCase();
  if (["issue", "pr", "status", "comment"].includes(normalized)) return normalized;
  return "status";
}

function readGithubSyncConfig() {
  return fileExists(".kabeeri/github/sync_config.json") ? readJsonFile(".kabeeri/github/sync_config.json") : {};
}

function readGithubIssueMap() {
  const data = fileExists(".kabeeri/github/issue_map.json")
    ? readJsonFile(".kabeeri/github/issue_map.json")
    : {};
  return {
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    conflicts: Array.isArray(data.conflicts) ? data.conflicts : [],
    items: Array.isArray(data.items) ? data.items : []
  };
}

function readGithubTeamFeedback() {
  const data = fileExists(".kabeeri/github/team_feedback.json")
    ? readJsonFile(".kabeeri/github/team_feedback.json")
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

module.exports = {
  github
};
