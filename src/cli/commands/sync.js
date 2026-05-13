const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");
const { table } = require("../ui");

function sync(action, value, flags = {}) {
  const selected = action || "status";
  if (selected === "status" || selected === "check") {
    const report = buildSyncStatus(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderSyncStatus(report);
    return;
  }

  if (selected === "pull") {
    return syncPull(flags);
  }

  if (selected === "push") {
    return syncPush(flags);
  }

  throw new Error(`Unknown sync action: ${selected}`);
}

function buildSyncStatus(flags = {}) {
  const cwd = repoRoot();
  const gitAvailable = runGit(["--version"], cwd).ok;
  if (!gitAvailable) {
    return {
      report_type: "github_team_sync_status",
      generated_at: new Date().toISOString(),
      status: "blocked",
      git_available: false,
      warnings: ["git is not available."],
      next_actions: ["Install git before using team sync."]
    };
  }

  if (flags.fetch || flags.refresh) {
    runGit(["fetch", "--prune"], cwd);
  }

  const branch = gitText(["branch", "--show-current"], cwd) || null;
  const remoteName = gitText(["config", "--get", `branch.${branch}.remote`], cwd) || "origin";
  const mergeRef = gitText(["config", "--get", `branch.${branch}.merge`], cwd);
  const upstream = branch && mergeRef ? `${remoteName}/${mergeRef.replace(/^refs\/heads\//, "")}` : gitText(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], cwd);
  const remoteUrl = gitText(["remote", "get-url", remoteName], cwd) || null;
  const statusEntries = gitText(["status", "--short"], cwd).split(/\r?\n/).filter(Boolean);
  const aheadBehind = upstream ? readAheadBehind(upstream, cwd) : { ahead: null, behind: null, available: false };
  const hasWorkspace = fs.existsSync(path.join(cwd, ".kabeeri"));
  const collaboration = detectCollaborationMode(cwd, hasWorkspace);
  const githubTeamFeedback = collaboration.mode === "team" ? readGitHubTeamFeedback(cwd) : { items: [] };
  const status = decideSyncStatus({ statusEntries, aheadBehind, upstream });
  const warnings = buildSyncWarnings({ statusEntries, aheadBehind, upstream, remoteUrl, hasWorkspace, collaboration, githubTeamFeedback });

  return {
    report_type: "github_team_sync_status",
    generated_at: new Date().toISOString(),
    status,
    git_available: true,
    branch,
    remote: remoteName,
    remote_url: remoteUrl,
    upstream: upstream || null,
    ahead: aheadBehind.ahead,
    behind: aheadBehind.behind,
    changed_files: statusEntries.length,
    changed_entries: statusEntries,
    has_kabeeri_workspace: hasWorkspace,
    collaboration_mode: collaboration.mode,
    sync_policy: collaboration.sync_policy,
    team_signals: collaboration.signals,
    team_counts: collaboration.counts,
    github_team_feedback: collaboration.mode === "team" ? {
      total: githubTeamFeedback.items.length,
      issue_feedback: githubTeamFeedback.items.filter((item) => item.feedback_type === "issue").length,
      pr_feedback: githubTeamFeedback.items.filter((item) => item.feedback_type === "pr").length,
      status_feedback: githubTeamFeedback.items.filter((item) => item.feedback_type === "status").length,
      comment_feedback: githubTeamFeedback.items.filter((item) => item.feedback_type === "comment").length
    } : null,
    warnings,
    next_actions: buildSyncNextActions({ statusEntries, aheadBehind, upstream, hasWorkspace, collaboration }),
    recommended_commands: [
      "kvdf sync status --fetch",
      "kvdf sync pull",
      "kvdf sync push",
      "kvdf reports live --json"
    ]
  };
}

function syncPull(flags = {}) {
  const report = buildSyncStatus(flags);
  const command = ["git", "pull", "--ff-only"];
  if (!flags.confirm) {
    return renderSyncDryRun("pull", command, report, [
      "No local files were changed.",
      "Add --confirm only after reviewing status, branch, upstream, and local changes."
    ]);
  }
  if (report.changed_files > 0) throw new Error("Refusing confirmed sync pull with local changes. Commit, stash, or resolve changes first.");
  const result = runGit(["pull", "--ff-only"], repoRoot());
  if (!result.ok) throw new Error(`git pull failed:\n${result.stderr || result.stdout}`);
  console.log(result.stdout.trim() || "Git pull completed.");
}

function syncPush(flags = {}) {
  const report = buildSyncStatus(flags);
  const command = ["git", "push"];
  if (!flags.confirm) {
    return renderSyncDryRun("push", command, report, [
      "No remote GitHub changes were made.",
      "Add --confirm only after tests, validation, and owner review."
    ]);
  }
  if (report.behind && report.behind > 0) throw new Error("Refusing confirmed sync push while local branch is behind upstream. Run kvdf sync pull first.");
  const result = runGit(["push"], repoRoot());
  if (!result.ok) throw new Error(`git push failed:\n${result.stderr || result.stdout}`);
  console.log(result.stdout.trim() || "Git push completed.");
}

function decideSyncStatus({ statusEntries, aheadBehind, upstream }) {
  if (!upstream) return "needs_upstream";
  if (aheadBehind.behind && aheadBehind.behind > 0) return "needs_pull";
  if (aheadBehind.ahead && aheadBehind.ahead > 0) return statusEntries.length ? "local_changes_and_ahead" : "needs_push";
  if (statusEntries.length) return "local_changes";
  return "synced";
}

function detectCollaborationMode(cwd, hasWorkspace) {
  if (!hasWorkspace) {
    return {
      mode: "unknown",
      sync_policy: "optional",
      signals: ["no_kabeeri_workspace"],
      counts: { developers: 0, agents: 0, active_identities: 0 }
    };
  }

  const developerMode = readJson(path.join(cwd, ".kabeeri", "developer_mode.json")) || {};
  const developers = (readJson(path.join(cwd, ".kabeeri", "developers.json")) || {}).developers || [];
  const agents = (readJson(path.join(cwd, ".kabeeri", "agents.json")) || {}).agents || [];
  const githubConfig = readJson(path.join(cwd, ".kabeeri", "github", "sync_config.json")) || {};
  const activeDevelopers = developers.filter((item) => item.status !== "inactive");
  const activeAgents = agents.filter((item) => item.status !== "inactive");
  const activeCount = activeDevelopers.length + activeAgents.length;
  const signals = [];

  if (developerMode.mode === "solo" || developerMode.mode === "owner_developer") signals.push(`developer_mode:${developerMode.mode}`);
  if (activeCount > 1) signals.push("multiple_active_identities");
  if (githubConfig.repo) signals.push("github_repo_configured");

  if (developerMode.mode === "solo" || developerMode.mode === "owner_developer") {
    return {
      mode: "solo",
      sync_policy: activeCount > 1 ? "recommended" : "optional",
      signals: signals.length ? signals : ["solo_local_workspace"],
      counts: { developers: activeDevelopers.length, agents: activeAgents.length, active_identities: activeCount }
    };
  }

  if (activeCount > 1) {
    return {
      mode: "team",
      sync_policy: "recommended",
      signals,
      counts: { developers: activeDevelopers.length, agents: activeAgents.length, active_identities: activeCount }
    };
  }

  return {
    mode: activeCount === 1 ? "single_developer" : "unknown",
    sync_policy: githubConfig.repo ? "recommended" : "optional",
    signals: signals.length ? signals : [activeCount === 1 ? "single_active_identity" : "no_registered_identities"],
    counts: { developers: activeDevelopers.length, agents: activeAgents.length, active_identities: activeCount }
  };
}

function buildSyncWarnings({ statusEntries, aheadBehind, upstream, remoteUrl, hasWorkspace, collaboration, githubTeamFeedback }) {
  const warnings = [];
  if (!remoteUrl) warnings.push("No git remote URL detected.");
  if (!upstream) warnings.push("No upstream branch detected for the current branch.");
  if (aheadBehind.behind && aheadBehind.behind > 0) warnings.push(`Local branch is behind upstream by ${aheadBehind.behind} commit(s).`);
  if (aheadBehind.ahead && aheadBehind.ahead > 0) warnings.push(`Local branch is ahead of upstream by ${aheadBehind.ahead} commit(s).`);
  if (statusEntries.length) warnings.push(`Working tree has ${statusEntries.length} changed file(s).`);
  if (!hasWorkspace) warnings.push("No .kabeeri workspace found; team sync can only report git state.");
  if (collaboration.mode !== "team" && collaboration.sync_policy === "optional") warnings.push("Team sync is optional for solo or single-developer local workspaces.");
  if (collaboration.mode === "team" && githubTeamFeedback.items.length === 0) warnings.push("GitHub team feedback is empty; issue/PR/status/comment sync can seed the log.");
  return warnings;
}

function buildSyncNextActions({ statusEntries, aheadBehind, upstream, hasWorkspace, collaboration }) {
  const actions = [];
  if (collaboration.mode !== "team" && collaboration.sync_policy === "optional") actions.push("Use sync as a manual safety check; it is not required after every local solo action.");
  if (collaboration.mode === "team") actions.push("Use `kvdf sync status` before starting team-scoped work and after task/session/capture changes.");
  if (collaboration.mode === "team") actions.push("Use `kvdf github status` to review issue, PR, status, and comment feedback before coordinating remote work.");
  if (!upstream) actions.push("Set an upstream branch before team sync can compare local and remote progress.");
  if (aheadBehind.behind && aheadBehind.behind > 0) actions.push("Run `kvdf sync pull` to preview the safe pull command; use --confirm only after reviewing local changes.");
  if (statusEntries.length) actions.push("Capture, commit, or intentionally ignore local changes before pulling team updates.");
  if (aheadBehind.ahead && aheadBehind.ahead > 0) actions.push("Run tests and validation before `kvdf sync push --confirm`.");
  if (hasWorkspace) actions.push("Run `kvdf reports live --json` after pulling or pushing to refresh team-visible state.");
  if (!actions.length) actions.push("Local git state appears synced. Continue with the next governed task.");
  return actions;
}

function renderSyncStatus(report) {
  console.log("Kabeeri GitHub Team Sync Status");
  console.log(table(["Field", "Value"], [
    ["Status", report.status],
    ["Branch", report.branch || "none"],
    ["Remote", report.remote || "none"],
    ["Upstream", report.upstream || "none"],
    ["Ahead", report.ahead ?? "unknown"],
    ["Behind", report.behind ?? "unknown"],
    ["Changed files", report.changed_files ?? 0],
    [".kabeeri workspace", report.has_kabeeri_workspace ? "present" : "missing"],
    ["Collaboration mode", report.collaboration_mode || "unknown"],
    ["Sync policy", report.sync_policy || "optional"]
  ]));
  if (report.github_team_feedback) {
    console.log("");
    console.log(table(["GitHub Team Feedback", "Value"], [
      ["Total", report.github_team_feedback.total],
      ["Issue feedback", report.github_team_feedback.issue_feedback],
      ["PR feedback", report.github_team_feedback.pr_feedback],
      ["Status feedback", report.github_team_feedback.status_feedback],
      ["Comment feedback", report.github_team_feedback.comment_feedback]
    ]));
  }
  console.log("");
  console.log("Warnings:");
  for (const item of report.warnings.length ? report.warnings : ["None."]) console.log(`- ${item}`);
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
}

function renderSyncDryRun(kind, command, report, notes) {
  console.log(`Kabeeri sync ${kind} dry-run`);
  console.log("");
  console.log(`Status: ${report.status}`);
  console.log(`Would run: ${command.join(" ")}`);
  console.log("");
  for (const note of notes) console.log(note);
}

function readAheadBehind(upstream, cwd) {
  const result = runGit(["rev-list", "--left-right", "--count", `HEAD...${upstream}`], cwd);
  if (!result.ok) return { ahead: null, behind: null, available: false };
  const [ahead, behind] = result.stdout.trim().split(/\s+/).map((item) => Number.parseInt(item, 10));
  return { ahead: Number.isFinite(ahead) ? ahead : null, behind: Number.isFinite(behind) ? behind : null, available: true };
}

function gitText(args, cwd) {
  const result = runGit(args, cwd);
  return result.ok ? result.stdout.trim() : "";
}

function runGit(args, cwd) {
  if (shouldUseLocalGitSnapshot()) {
    return runLocalGit(args, cwd);
  }
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function shouldUseLocalGitSnapshot() {
  const value = String(process.env.KVDF_DISABLE_GIT_SPAWN || "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function runLocalGit(args, cwd) {
  const command = Array.isArray(args) ? args : [];
  const [main, sub] = command;
  if (main === "--version") {
    return { ok: true, status: 0, stdout: "git version 2.0.0\n", stderr: "" };
  }
  if (main === "fetch") {
    return { ok: true, status: 0, stdout: "", stderr: "" };
  }
  if (main === "pull" || main === "push") {
    return { ok: true, status: 0, stdout: "", stderr: "" };
  }

  const gitDir = path.join(cwd, ".git");
  if (!fs.existsSync(gitDir)) {
    return { ok: false, status: 1, stdout: "", stderr: "not a git repository" };
  }
  const config = readGitConfig(path.join(gitDir, "config"));
  const head = readGitHead(path.join(gitDir, "HEAD"));
  const branch = head.branch || null;
  const remoteName = config.branch?.[branch || ""]?.remote || "origin";
  const mergeRef = config.branch?.[branch || ""]?.merge || "";

  if (main === "branch" && sub === "--show-current") {
    return { ok: true, status: 0, stdout: `${branch || ""}\n`, stderr: "" };
  }
  if (main === "config" && sub === "--get") {
    const key = command[2] || "";
    if (key === `branch.${branch}.remote`) {
      return { ok: true, status: 0, stdout: `${config.branch?.[branch || ""]?.remote || ""}\n`, stderr: "" };
    }
    if (key === `branch.${branch}.merge`) {
      return { ok: true, status: 0, stdout: `${config.branch?.[branch || ""]?.merge || ""}\n`, stderr: "" };
    }
    return { ok: false, status: 1, stdout: "", stderr: "" };
  }
  if (main === "remote" && sub === "get-url") {
    const remote = command[2] || remoteName;
    return { ok: true, status: 0, stdout: `${config.remote?.[remote] || ""}\n`, stderr: "" };
  }
  if (main === "status" && sub === "--short") {
    const entries = listLocalChanges(cwd);
    return { ok: true, status: 0, stdout: entries.join("\n") ? `${entries.join("\n")}\n` : "", stderr: "" };
  }
  if (main === "rev-parse" && command.includes("@{u}")) {
    if (!branch || !mergeRef) return { ok: false, status: 1, stdout: "", stderr: "" };
    return { ok: true, status: 0, stdout: `${remoteName}/${mergeRef.replace(/^refs\/heads\//, "")}\n`, stderr: "" };
  }
  if (main === "rev-list" && sub === "--left-right" && command.includes("--count")) {
    return { ok: true, status: 0, stdout: "0\t0\n", stderr: "" };
  }
  return { ok: true, status: 0, stdout: "", stderr: "" };
}

function readGitConfig(filePath) {
  const config = { remote: {}, branch: {} };
  if (!fs.existsSync(filePath)) return config;
  let current = null;
  for (const raw of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(";")) continue;
    const section = line.match(/^\[(.+?)\]$/);
    if (section) {
      current = section[1];
      continue;
    }
    const match = line.match(/^([^=]+)=\s*(.+)$/);
    if (!match || !current) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    const remoteMatch = current.match(/^remote "(.+)"$/);
    const branchMatch = current.match(/^branch "(.+)"$/);
    if (remoteMatch) {
      config.remote[remoteMatch[1]] = config.remote[remoteMatch[1]] || {};
      config.remote[remoteMatch[1]][key] = value;
    } else if (branchMatch) {
      config.branch[branchMatch[1]] = config.branch[branchMatch[1]] || {};
      config.branch[branchMatch[1]][key] = value;
    }
  }
  for (const [name, entry] of Object.entries(config.remote)) {
    if (typeof entry === "object" && entry.url) config.remote[name] = entry.url;
  }
  return config;
}

function readGitHead(filePath) {
  if (!fs.existsSync(filePath)) return { branch: null };
  const text = fs.readFileSync(filePath, "utf8").trim();
  const match = text.match(/^ref:\s+refs\/heads\/(.+)$/);
  return { branch: match ? match[1] : null };
}

function listLocalChanges(cwd) {
  const entries = [];
  walk(cwd, cwd);
  return entries;

  function walk(root, current) {
    if (!fs.existsSync(current)) return;
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      if (item.name === ".git" || item.name === "node_modules") continue;
      const full = path.join(current, item.name);
      const relative = path.relative(root, full).replace(/\\/g, "/");
      if (item.isDirectory()) {
        walk(root, full);
      } else if (item.isFile()) {
        entries.push(`?? ${relative}`);
      }
    }
  }
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

function readGitHubTeamFeedback(cwd) {
  return readJson(path.join(cwd, ".kabeeri", "github", "team_feedback.json")) || { items: [] };
}

module.exports = {
  sync,
  buildSyncStatus
};
