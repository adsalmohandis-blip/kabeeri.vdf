const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { repoRoot } = require("../fs_utils");
const { reconcileRuntimeTruth } = require("./truth_registry");
const { buildWorkspaceBoundaryReport } = require("./workspace_boundary");

function readJsonFileIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readTextFileIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function readGitMetadata(cwd = repoRoot()) {
  const root = path.resolve(cwd);
  const gitDir = path.join(root, ".git");
  const exists = fs.existsSync(gitDir);
  if (!exists) {
    return {
      available: false,
      root,
      current_branch: null,
      default_branch: null,
      latest_main_commit: null,
      remote_urls: [],
      merge_history: [],
      status: [],
      head_commit: null
    };
  }

  const headPath = path.join(gitDir, "HEAD");
  const headText = readTextFileIfExists(headPath).trim();
  const branchMatch = headText.match(/^ref:\s*refs\/heads\/(.+)$/i);
  const currentBranch = branchMatch ? branchMatch[1].trim() : null;
  const headCommit = branchMatch ? readTextFileIfExists(path.join(gitDir, "refs", "heads", currentBranch)).trim() || null : headText || null;
  const mainCommit = readTextFileIfExists(path.join(gitDir, "refs", "heads", "main")).trim() || null;
  const remoteUrls = parseGitRemoteUrls(readTextFileIfExists(path.join(gitDir, "config")));
  const status = readGitStatusLines(root);
  const mergeHistory = readGitMergeHistory(root);

  return {
    available: true,
    root,
    current_branch: currentBranch,
    default_branch: "main",
    latest_main_commit: mainCommit,
    remote_urls: remoteUrls,
    merge_history: mergeHistory,
    status,
    head_commit: headCommit
  };
}

function parseGitRemoteUrls(configText = "") {
  const urls = [];
  const lines = String(configText || "").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*url\s*=\s*(.+)\s*$/i);
    if (match) urls.push(match[1].trim());
  }
  return [...new Set(urls)];
}

function readGitStatusLines(cwd) {
  const result = spawnSync("git", ["status", "--short"], { cwd, encoding: "utf8" });
  if (result.status !== 0 || result.error) return [];
  return String(result.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readGitMergeHistory(cwd) {
  const result = spawnSync("git", ["log", "--merges", "--oneline", "-20"], { cwd, encoding: "utf8" });
  if (result.status !== 0 || result.error) return [];
  return String(result.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function listRoadmapAndReportCandidates(cwd = repoRoot()) {
  const root = path.resolve(cwd);
  const candidates = [];
  const roadmapRoot = path.join(root, "docs", "roadmap");
  if (fs.existsSync(roadmapRoot)) {
    for (const item of fs.readdirSync(roadmapRoot, { withFileTypes: true })) {
      if (item.isFile()) candidates.push(path.join("docs", "roadmap", item.name).replace(/\\/g, "/"));
    }
  }
  const rootRoadmap = path.join(root, "ROADMAP.md");
  if (fs.existsSync(rootRoadmap)) candidates.push("ROADMAP.md");
  const reportsRoot = path.join(root, "docs", "reports");
  if (fs.existsSync(reportsRoot)) {
    for (const item of fs.readdirSync(reportsRoot, { withFileTypes: true })) {
      if (!item.isFile()) continue;
      if (/roadmap|evolution|report|pipeline/i.test(item.name)) candidates.push(path.join("docs", "reports", item.name).replace(/\\/g, "/"));
    }
  }
  const runtimeReportsRoot = path.join(root, ".kabeeri", "reports");
  if (fs.existsSync(runtimeReportsRoot)) {
    for (const item of fs.readdirSync(runtimeReportsRoot, { withFileTypes: true })) {
      if (item.isFile()) candidates.push(path.join(".kabeeri", "reports", item.name).replace(/\\/g, "/"));
    }
  }
  return [...new Set(candidates)];
}

function classifyStaleState(cwd = repoRoot()) {
  const runtimeRecon = reconcileRuntimeTruth(cwd);
  const roadmapFiles = listRoadmapAndReportCandidates(cwd);
  const reportItems = roadmapFiles.filter((file) => /docs\/reports|\.kabeeri\/reports/.test(file)).map((file) => ({
    path: file,
    classification: file.startsWith(".kabeeri/reports/") ? "historical" : "historical",
    reason: file.startsWith(".kabeeri/reports/") ? "runtime snapshot" : "generated report snapshot"
  }));
  const roadmapItems = roadmapFiles.filter((file) => file.startsWith("docs/roadmap/") || file === "ROADMAP.md").map((file) => ({
    path: file,
    classification: "historical",
    reason: "planning or generated history"
  }));
  const runtimeItems = [...runtimeRecon.stale_planned, ...runtimeRecon.stale_recommended, ...runtimeRecon.runtime_only_evolutions].map((item) => ({
    id: item.id || item.change_id || item.title || "runtime-item",
    title: item.title || item.id || "runtime item",
    classification: item.matched_feature ? (item.kind === "recommended" ? "stale" : "superseded") : "unknown",
    reason: item.matched_feature ? `Superseded by ${item.matched_feature}` : "Runtime item has no source-level implementation evidence."
  }));
  const supersededItems = runtimeItems.filter((item) => item.classification === "superseded" || item.classification === "stale");
  const activeItems = runtimeRecon.findings.filter((item) => String(item.status || "").toLowerCase() === "implemented").map((item) => ({
    id: item.feature_id || item.id || "feature",
    title: item.title || item.feature_id || "feature",
    classification: "active",
    reason: "Source-level evidence is implemented and current."
  }));
  const unknownItems = runtimeItems.filter((item) => item.classification === "unknown");
  const status = supersededItems.length || unknownItems.length ? "warning" : "pass";
  return {
    status,
    roadmap_files: roadmapFiles,
    roadmap_items: roadmapItems,
    reports: reportItems,
    runtime_items: runtimeItems,
    superseded_items: supersededItems,
    historical_items: [...reportItems, ...roadmapItems],
    active_items: activeItems,
    unknown_items: unknownItems
  };
}

function normalizeTargetTrack(value, fallback = "unknown") {
  const text = String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "_");
  if (text === "owner" || text === "framework_owner" || text === "kvdf") return "framework_owner";
  if (text === "vibe" || text === "viber" || text === "vibe_app_developer" || text === "app") return "vibe_app_developer";
  if (text === "plugin" || text === "plugins") return "plugin";
  return fallback;
}

function buildSourceTruthReport(options = {}) {
  const cwd = path.resolve(options.cwd || repoRoot());
  const packageJson = readJsonFileIfExists(path.join(cwd, "package.json"));
  const readme = readTextFileIfExists(path.join(cwd, "README.md"));
  const git = readGitMetadata(cwd);
  const boundary = buildWorkspaceBoundaryReport({
    cwd,
    targetTrack: options.targetTrack,
    appSlug: options.appSlug,
    pluginId: options.pluginId
  });
  const staleState = classifyStaleState(cwd);
  const repoName = packageJson && packageJson.name ? packageJson.name : path.basename(cwd);
  const primary = git.available && git.latest_main_commit
    ? "latest_main"
    : git.current_branch
      ? "current_branch"
      : boundary.workspace.kind !== "unknown"
        ? "workspace_files"
        : "unknown";
  const secondary = [
    git.merge_history.length ? "merged_pr_history" : null,
    packageJson ? "package_json" : null,
    readme ? "README.md" : null,
    boundary.workspace.kind !== "unknown" ? "workspace_files" : null
  ].filter(Boolean);
  const staleCandidates = [
    ...staleState.roadmap_files,
    ...staleState.reports.map((item) => item.path),
    ...staleState.runtime_items.map((item) => item.id)
  ];
  return {
    report_type: "kvdf_source_truth",
    generated_at: new Date().toISOString(),
    repo: {
      root: cwd,
      name: repoName,
      package_name: packageJson && packageJson.name ? packageJson.name : null,
      default_branch: git.default_branch || "main",
      current_branch: git.current_branch || null,
      latest_main_commit: git.latest_main_commit || null,
      merge_history: git.merge_history,
      remote_urls: git.remote_urls,
      status: git.status
    },
    workspace: boundary.workspace,
    track: {
      active_track: boundary.workspace.kind === "kvdf_core"
        ? "framework_owner"
        : boundary.workspace.kind === "viber_app"
          ? "vibe_app_developer"
          : boundary.workspace.kind === "plugin"
            ? "plugin"
            : "unknown",
      target_track: options.targetTrack
        ? normalizeTargetTrack(options.targetTrack, "unknown")
        : boundary.workspace.kind === "kvdf_core"
          ? "framework_owner"
          : boundary.workspace.kind === "viber_app"
            ? "vibe_app_developer"
            : boundary.workspace.kind === "plugin"
              ? "plugin"
              : "unknown",
      track_confidence: boundary.workspace.kind === "unknown" ? "low" : "high"
    },
    source_of_truth: {
      primary,
      secondary,
      stale_candidates: staleCandidates
    },
    current_state: {
      repo: repoName,
      workspace_kind: boundary.workspace.kind,
      current_branch: git.current_branch || null,
      latest_main_commit: git.latest_main_commit || null
    },
    stale_state: staleState,
    write_policy: boundary.write_policy,
    allowed_paths: boundary.allowed_paths,
    forbidden_paths: boundary.forbidden_paths,
    next_action: staleState.status === "warning"
      ? "Reconcile stale roadmap, report, and runtime files before planning."
      : boundary.status === "blocked"
        ? "Confirm the target repo and workspace identity."
        : "Proceed with file-first planning against the current source tree."
  };
}

function buildCurrentStateReport(options = {}) {
  return {
    ...buildSourceTruthReport(options),
    report_type: "kvdf_current_state_report"
  };
}

function buildStaleStateReport(options = {}) {
  const cwd = path.resolve(options.cwd || repoRoot());
  const staleState = classifyStaleState(cwd);
  return {
    report_type: "kvdf_stale_state_report",
    generated_at: new Date().toISOString(),
    status: staleState.status,
    stale_plans: staleState.superseded_items.map((item) => ({
      ...item,
      classification: item.classification || "superseded"
    })),
    stale_reports: staleState.reports,
    stale_runtime_items: staleState.runtime_items,
    superseded_items: staleState.superseded_items,
    historical_items: staleState.historical_items,
    active_items: staleState.active_items || [],
    unknown_items: staleState.unknown_items || [],
    next_action: staleState.status === "warning"
      ? "Review the stale roadmap, runtime, and generated report items before trusting the next plan."
      : "No stale-state warnings found."
  };
}

module.exports = {
  buildCurrentStateReport,
  buildSourceTruthReport,
  buildStaleStateReport,
  readGitMetadata,
  classifyStaleState,
  normalizeTargetTrack
};
