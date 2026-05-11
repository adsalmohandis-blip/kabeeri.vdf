const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { packageRoot, repoRoot } = require("../fs_utils");
const { table } = require("../ui");

function resume(action, value, flags = {}) {
  const report = buildResumeReport({ scan: Boolean(flags.scan || flags.check || action === "scan") });
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  renderResumeReport(report);
}

function buildResumeReport(options = {}) {
  const cwd = repoRoot();
  const engineRoot = packageRoot();
  const localPackage = readLocalJson(path.join(cwd, "package.json"));
  const workspaceProject = readLocalJson(path.join(cwd, ".kabeeri", "project.json"));
  const hasWorkspace = fs.existsSync(path.join(cwd, ".kabeeri"));
  const hasOwnerState = fs.existsSync(path.join(cwd, "OWNER_DEVELOPMENT_STATE.md"));
  const isFrameworkSource = Boolean(
    localPackage &&
    localPackage.name === "kabeeri-vdf" &&
    fs.existsSync(path.join(cwd, "bin", "kvdf.js")) &&
    fs.existsSync(path.join(cwd, "src", "cli", "index.js"))
  );
  const appStack = detectAppStack(localPackage);
  const git = readGitStatus(cwd);
  const mode = detectSessionMode({ isFrameworkSource, hasOwnerState, hasWorkspace, appStack });
  const rootRoles = buildRootRoles({ cwd, engineRoot, mode, appStack });
  const warnings = buildResumeWarnings({ mode, isFrameworkSource, hasWorkspace, appStack, git });
  const checks = options.scan ? buildResumeScan({ cwd, mode, hasWorkspace }) : [];
  const evolution = mode === "framework_owner_development" ? readEvolutionSnapshot(cwd) : null;
  const ownerCheckpoint = mode === "framework_owner_development" ? readOwnerCheckpoint(cwd) : null;
  const gitSummary = summarizeGitStatus(git);
  const nextExactAction = buildNextExactAction({ mode, evolution, ownerCheckpoint, hasWorkspace, appStack, git });

  return {
    report_type: "session_resume",
    generated_at: new Date().toISOString(),
    mode,
    current_root: cwd,
    kabeeri_engine_root: engineRoot,
    has_kabeeri_workspace: hasWorkspace,
    has_owner_development_state: hasOwnerState,
    detected_app_stack: appStack,
    package_name: localPackage ? localPackage.name || null : null,
    workspace_project: workspaceProject ? {
      product_name: workspaceProject.product_name || "",
      profile: workspaceProject.profile || null,
      delivery_mode: workspaceProject.delivery_mode || null,
      language: workspaceProject.language || null
    } : null,
    git,
    git_summary: gitSummary,
    root_roles: rootRoles,
    warnings,
    evolution,
    owner_checkpoint: ownerCheckpoint,
    next_exact_action: nextExactAction,
    next_actions: buildResumeNextActions({ mode, hasWorkspace, git, appStack }),
    recommended_commands: buildResumeCommands({ mode, hasWorkspace, appStack }),
    scan: checks
  };
}

function detectSessionMode({ isFrameworkSource, hasOwnerState, hasWorkspace, appStack }) {
  if (isFrameworkSource && hasOwnerState) return "framework_owner_development";
  if (hasWorkspace && appStack.length) return "kabeeri_user_app_workspace";
  if (hasWorkspace) return "kabeeri_user_workspace";
  if (appStack.length) return "application_without_kabeeri_workspace";
  return "unknown_folder";
}

function detectAppStack(packageData) {
  if (!packageData) return [];
  const deps = { ...(packageData.dependencies || {}), ...(packageData.devDependencies || {}) };
  const stacks = [];
  if (deps.next) stacks.push("nextjs");
  if (deps.react) stacks.push("react");
  if (deps.vue) stacks.push("vue");
  if (deps["@angular/core"]) stacks.push("angular");
  if (deps.expo) stacks.push("react_native_expo");
  if (deps.vite) stacks.push("vite");
  if (deps.express) stacks.push("express");
  if (packageData.scripts && packageData.scripts.dev) stacks.push("npm_app");
  return Array.from(new Set(stacks));
}

function buildRootRoles({ cwd, engineRoot, mode, appStack }) {
  const roles = [
    { role: "current_root", path: cwd, meaning: "The folder this command is running in." },
    { role: "kabeeri_engine_root", path: engineRoot, meaning: "Where the kvdf engine code is loaded from." }
  ];
  if (mode === "framework_owner_development") {
    roles.push({ role: "npm_root", path: cwd, meaning: "Run Kabeeri framework npm commands here." });
  } else if (appStack.length) {
    roles.push({ role: "app_npm_root", path: cwd, meaning: "Run the user's application npm commands here; do not treat this as Kabeeri framework source." });
  }
  return roles;
}

function buildResumeWarnings({ mode, isFrameworkSource, hasWorkspace, appStack, git }) {
  const warnings = [];
  if (mode === "framework_owner_development") {
    warnings.push("This is Kabeeri framework source. Natural phrases like 'start development' should mean framework development only after reading OWNER_DEVELOPMENT_STATE.md.");
  }
  if (mode === "kabeeri_user_app_workspace" || mode === "kabeeri_user_workspace") {
    warnings.push("This is a user workspace. Do not edit Kabeeri framework internals unless the owner explicitly says this is framework development.");
  }
  if (!isFrameworkSource && appStack.includes("nextjs")) {
    warnings.push("Next.js app detected. npm commands belong to the app root; Kabeeri should be used as a CLI engine, not as the app source root.");
  }
  if (!hasWorkspace && mode !== "framework_owner_development") {
    warnings.push("No .kabeeri workspace found. Run kvdf init before governed project development.");
  }
  if (git.changed_files > 0) {
    warnings.push(`Working tree has ${git.changed_files} changed file(s). Review before starting new work.`);
  }
  return warnings;
}

function buildResumeNextActions({ mode, hasWorkspace, git, appStack }) {
  if (mode === "framework_owner_development") {
    return [
      "Read OWNER_DEVELOPMENT_STATE.md.",
      "Review git status and current uncommitted changes.",
      "Run npm test before behavior changes.",
      "Continue the first relevant item in Next Actions or record a new framework development task."
    ];
  }
  if (hasWorkspace) {
    const actions = [
      "Run kvdf reports live --json or kvdf vibe brief to understand the project state.",
      "Continue an approved task or ask the missing product questions before implementation.",
      "Keep application npm commands inside the app root."
    ];
    if (appStack.includes("nextjs")) actions.push("For Next.js work, run npm install/dev/build only in this application root.");
    if (git.changed_files > 0) actions.push("Use kvdf capture before continuing if changed files are not linked to a governed task.");
    return actions;
  }
  return [
    "Decide whether this folder should become a Kabeeri workspace.",
    "If yes, run kvdf init with the appropriate profile and goal.",
    "If this is only an app folder, avoid editing Kabeeri framework files here."
  ];
}

function buildResumeCommands({ mode, hasWorkspace, appStack }) {
  if (mode === "framework_owner_development") {
    return ["git status --short", "npm test", "npm run test:smoke", "kvdf validate", "kvdf reports live --json"];
  }
  if (hasWorkspace) {
    const commands = ["kvdf reports live --json", "kvdf task tracker", "kvdf vibe brief", "kvdf vibe next", "kvdf validate workspace"];
    if (appStack.includes("nextjs")) commands.push("npm run dev");
    return commands;
  }
  return ["kvdf init --profile standard --goal \"Describe the application\"", "kvdf doctor"];
}

function buildResumeScan({ cwd, mode, hasWorkspace }) {
  const checks = [];
  checks.push(runCheck("git status --short", ["git", "status", "--short"], cwd));
  if (mode === "framework_owner_development") {
    checks.push(runCheck("kvdf evolution priorities --json", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "evolution", "priorities", "--json"], cwd));
    checks.push(runCheck("kvdf conflict scan --json", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "conflict", "scan", "--json"], cwd));
    checks.push(runCheck("npm test", [process.execPath, path.join(cwd, "tests", "cli.integration.test.js")], cwd));
  }
  if (hasWorkspace) {
    checks.push(runCheck("kvdf validate workspace", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "validate", "workspace"], cwd));
    checks.push(runCheck("kvdf reports live --json", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "reports", "live", "--json"], cwd));
  }
  return checks;
}

function readEvolutionSnapshot(cwd) {
  const state = readLocalJson(path.join(cwd, ".kabeeri", "evolution.json"));
  if (!state) return null;
  const priorities = Array.isArray(state.development_priorities) ? state.development_priorities : [];
  const openPriorities = priorities.filter((item) => !["done", "deferred", "rejected"].includes(item.status));
  return {
    changes_total: Array.isArray(state.changes) ? state.changes.length : 0,
    priorities_total: priorities.length,
    open_priorities: openPriorities.length,
    top_priorities: openPriorities.slice(0, 5),
    next_priority: openPriorities[0] || null,
    current_change_id: state.current_change_id || null,
    priorities_last_reviewed_at: state.priorities_last_reviewed_at || null
  };
}

function readOwnerCheckpoint(cwd) {
  const filePath = path.join(cwd, "OWNER_DEVELOPMENT_STATE.md");
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  return {
    path: "OWNER_DEVELOPMENT_STATE.md",
    current_state: parseOwnerCurrentState(text),
    next_actions: parseMarkdownListAfterHeading(text, "Next Actions").slice(0, 12),
    recent_notes: parseRecentOwnerNotes(text).slice(0, 8)
  };
}

function parseOwnerCurrentState(text) {
  const lines = sectionLines(text, "Current State");
  const state = {};
  for (const line of lines) {
    const match = line.match(/^-\s*([^:]+):\s*(.+)$/);
    if (match) state[slugKey(match[1])] = match[2].trim();
  }
  return state;
}

function parseMarkdownListAfterHeading(text, heading) {
  return sectionLines(text, heading)
    .map((line) => line.trim())
    .filter((line) => /^(\d+\.|-)\s+/.test(line))
    .map((line) => line.replace(/^(\d+\.|-)\s+/, "").trim())
    .filter(Boolean);
}

function parseRecentOwnerNotes(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^-\s*20\d\d-\d\d-\d\d:/.test(line))
    .map((line) => line.replace(/^-\s*/, ""))
    .slice(-12)
    .reverse();
}

function sectionLines(text, heading) {
  const lines = String(text || "").split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return [];
  const output = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    output.push(lines[index]);
  }
  return output;
}

function slugKey(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function summarizeGitStatus(git) {
  const entries = git.entries || [];
  const summary = {
    changed_files: git.changed_files || 0,
    modified: 0,
    added: 0,
    deleted: 0,
    untracked: 0,
    renamed: 0,
    entries_preview: entries.slice(0, 8)
  };
  for (const entry of entries) {
    const code = entry.slice(0, 2);
    if (code.includes("M")) summary.modified += 1;
    if (code.includes("A")) summary.added += 1;
    if (code.includes("D")) summary.deleted += 1;
    if (code.includes("R")) summary.renamed += 1;
    if (code === "??") summary.untracked += 1;
  }
  return summary;
}

function buildNextExactAction({ mode, evolution, ownerCheckpoint, hasWorkspace, appStack, git }) {
  if (mode === "framework_owner_development") {
    if (evolution && evolution.next_priority) {
      return `Continue ${evolution.next_priority.id}: ${evolution.next_priority.title}.`;
    }
    if (ownerCheckpoint && ownerCheckpoint.next_actions.length) return ownerCheckpoint.next_actions[0];
    return git.changed_files ? "Review current diff, then run npm test." : "Pick the next Evolution Steward priority.";
  }
  if (hasWorkspace) {
    if (git.changed_files > 0) return "Run kvdf capture or link changed files to a governed task before new implementation.";
    return appStack.length ? "Open the current task context, then run app commands in the app root." : "Run kvdf reports live --json and continue the next governed task.";
  }
  return "Run kvdf init if this folder should become a Kabeeri workspace.";
}

function runCheck(label, command, cwd) {
  const [exe, ...args] = command;
  const result = spawnSync(exe, args, { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 16 });
  return {
    label,
    status: result.status === 0 ? "pass" : "fail",
    exit_code: result.status,
    stdout_summary: summarizeOutput(result.stdout),
    stderr_summary: summarizeOutput(result.stderr)
  };
}

function summarizeOutput(value) {
  return String(value || "").split(/\r?\n/).filter(Boolean).slice(0, 8);
}

function readGitStatus(cwd) {
  if (shouldUseLocalGitSnapshot()) {
    return readLocalGitStatus(cwd);
  }
  const result = spawnSync("git", ["status", "--short"], { cwd, encoding: "utf8" });
  if (result.status !== 0) return { available: false, changed_files: 0, entries: [] };
  const entries = result.stdout.split(/\r?\n/).filter(Boolean);
  return { available: true, changed_files: entries.length, entries };
}

function shouldUseLocalGitSnapshot() {
  const value = String(process.env.KVDF_DISABLE_GIT_SPAWN || "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function readLocalGitStatus(cwd) {
  const gitDir = path.join(cwd, ".git");
  if (!fs.existsSync(gitDir)) return { available: false, changed_files: 0, entries: [] };
  const entries = [];
  walk(cwd, cwd);
  return { available: true, changed_files: entries.length, entries };

  function walk(root, current) {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const fullPath = path.join(current, entry.name);
      const relative = path.relative(root, fullPath).replace(/\\/g, "/");
      if (entry.isDirectory()) walk(root, fullPath);
      else if (entry.isFile()) entries.push(`?? ${relative}`);
    }
  }
}

function readLocalJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

function renderResumeReport(report) {
  console.log("Kabeeri Session Resume");
  console.log(table(["Field", "Value"], [
    ["Mode", report.mode],
    ["Current root", report.current_root],
    ["Kabeeri engine root", report.kabeeri_engine_root],
    [".kabeeri workspace", report.has_kabeeri_workspace ? "present" : "missing"],
    ["Owner state", report.has_owner_development_state ? "present" : "missing"],
    ["App stack", report.detected_app_stack.length ? report.detected_app_stack.join(", ") : "none"],
    ["Git changed files", report.git.changed_files]
  ]));
  console.log("");
  console.log("Root roles:");
  console.log(table(["Role", "Path", "Meaning"], report.root_roles.map((item) => [item.role, item.path, item.meaning])));
  console.log("");
  console.log("Warnings:");
  for (const item of report.warnings.length ? report.warnings : ["None."]) console.log(`- ${item}`);
  console.log("");
  console.log(`Next exact action: ${report.next_exact_action}`);
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
  if (report.owner_checkpoint) {
    console.log("");
    console.log("Owner checkpoint:");
    console.log(table(["Field", "Value"], [
      ["Date", report.owner_checkpoint.current_state.date || ""],
      ["Branch", report.owner_checkpoint.current_state.branch || ""],
      ["Latest commit", report.owner_checkpoint.current_state.latest_known_commit || ""],
      ["Checkpoint next", report.owner_checkpoint.next_actions[0] || "none"]
    ]));
  }
  if (report.evolution) {
    console.log("");
    console.log("Evolution Steward:");
    console.log(table(["Field", "Value"], [
      ["Changes", report.evolution.changes_total],
      ["Open priorities", `${report.evolution.open_priorities}/${report.evolution.priorities_total}`],
      ["Next priority", report.evolution.next_priority ? report.evolution.next_priority.title : "none"],
      ["Current change", report.evolution.current_change_id || "none"]
    ]));
    if (report.evolution.top_priorities && report.evolution.top_priorities.length) {
      console.log("");
      console.log("Top development priorities:");
      console.log(table(["#", "ID", "Status", "Title"], report.evolution.top_priorities.map((item) => [
        item.priority,
        item.id,
        item.status,
        item.title
      ])));
    }
  }
  console.log("");
  console.log("Recommended commands:");
  for (const item of report.recommended_commands) console.log(`- ${item}`);
  if (report.scan.length) {
    console.log("");
    console.log("Scan:");
    console.log(table(["Check", "Status", "Exit"], report.scan.map((item) => [item.label, item.status, item.exit_code])));
  }
}

module.exports = {
  resume,
  buildResumeReport
};
