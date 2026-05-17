const fs = require("fs");
const path = require("path");

const { packageRoot, repoRoot } = require("../fs_utils");
const { table } = require("../ui");
const { validateRepository } = require("../validate");

function conflict(action, value, flags = {}) {
  const selected = action || "scan";
  if (selected === "scan" || selected === "status" || selected === "check") {
    const report = buildConflictScanReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderConflictScanReport(report);
    if (report.status === "blocked") process.exitCode = 1;
    return;
  }
  throw new Error(`Unknown conflict action: ${selected}`);
}

function buildConflictScanReport(flags = {}) {
  const checks = [
    checkCliSurface(),
    checkGuardIntegration(),
    checkValidationScope("core"),
    checkValidationScope("runtime-schemas"),
    checkWorkspaceState()
  ];
  const blockers = checks.flatMap((check) => check.blockers || []);
  const warnings = checks.flatMap((check) => check.warnings || []);
  const status = blockers.length ? "blocked" : warnings.length ? "warning" : "pass";

  return {
    report_type: "framework_conflict_scan",
    generated_at: new Date().toISOString(),
    status,
    current_root: repoRoot(),
    kabeeri_engine_root: packageRoot(),
    checks,
    blockers,
    warnings,
    next_actions: buildConflictNextActions(status, flags)
  };
}

function checkCliSurface() {
  const index = readPackageText("src/cli/index.js");
  const ui = readPackageText("src/cli/ui.js");
  const required = [
    ["router:resume", /group === "resume"/, index],
    ["router:guard", /group === "guard"/, index],
    ["router:sync", /group === "sync"/, index],
    ["router:conflict", /group === "conflict"/, index],
    ["help:resume", /resume:\s*`Usage:/, ui],
    ["help:guard", /guard:\s*`Usage:/, ui],
    ["help:sync", /sync:\s*`Usage:/, ui],
    ["help:conflict", /conflict:\s*`Usage:/, ui],
    ["main-help:conflict", /conflict scan/, ui]
  ];
  const missing = required.filter(([, pattern, source]) => !pattern.test(source)).map(([id]) => id);
  return makeCheck({
    id: "cli_surface",
    status: missing.length ? "blocked" : "pass",
    summary: missing.length ? "CLI router/help surfaces are not aligned." : "CLI router/help surfaces are aligned for session safety commands.",
    blockers: missing.map((id) => `Missing CLI surface marker: ${id}`),
    details: { missing }
  });
}

function checkGuardIntegration() {
  const index = readPackageText("src/cli/index.js");
  const session = readPackageText("src/cli/commands/session.js");
  const occurrences = (index.match(/assertNoProtectedFrameworkFiles/g) || []).length + (session.match(/assertNoProtectedFrameworkFiles/g) || []).length;
  const requiredFlows = [
    ["capture", /function capturePostWork[\s\S]*assertNoProtectedFrameworkFiles/.test(index)],
    ["capture_convert", /if \(action === "convert"\)[\s\S]{0,220}assertNoProtectedFrameworkFiles/.test(index)],
    ["session_end", /item\.files_touched = parseCsv\(flags\.files\);[\s\S]{0,120}assertNoProtectedFrameworkFiles/.test(session)]
  ];
  const missing = requiredFlows.filter(([, present]) => !present).map(([id]) => id);
  return makeCheck({
    id: "framework_guard_integration",
    status: missing.length ? "blocked" : "pass",
    summary: missing.length ? "Framework boundary guard is not wired into all execution flows." : "Framework boundary guard is wired into capture and session file scopes.",
    blockers: missing.map((id) => `Framework guard missing from ${id}.`),
    details: { occurrences, missing }
  });
}

function checkValidationScope(scope) {
  const result = validateRepository(scope);
  const failures = result.lines.filter((line) => line.startsWith("FAIL "));
  const warnings = result.lines.filter((line) => line.startsWith("WARN "));
  return makeCheck({
    id: `validate_${scope}`,
    status: failures.length ? "blocked" : warnings.length ? "warning" : "pass",
    summary: failures.length ? `${scope} validation has failures.` : `${scope} validation passed.`,
    blockers: failures,
    warnings,
    details: {
      line_count: result.lines.length,
      failures,
      warnings
    }
  });
}

function checkWorkspaceState() {
  const root = repoRoot();
  const stateRoot = path.join(root, ".kabeeri");
  if (!fs.existsSync(stateRoot)) {
    return makeCheck({
      id: "workspace_state",
      status: "warning",
      summary: "No .kabeeri workspace state exists in the current root.",
      warnings: ["No .kabeeri workspace state exists; conflict scan is limited to framework/package checks."]
    });
  }

  const tasks = readWorkspaceArray("tasks.json", "tasks");
  const captures = readWorkspaceArray("interactions/post_work_captures.json", "captures");
  const sessions = readWorkspaceArray("sessions.json", "sessions");
  const locks = readWorkspaceArray("locks.json", "locks");
  const taskIds = new Set(tasks.map((task) => task.id).filter(Boolean));
  const blockers = [];
  const warnings = [];

  for (const duplicate of findDuplicates(tasks.map((task) => task.id).filter(Boolean))) {
    blockers.push(`Duplicate task id detected: ${duplicate}`);
  }
  for (const capture of captures) {
    if (capture.task_id && !taskIds.has(capture.task_id)) warnings.push(`Capture ${capture.capture_id || "(unknown)"} references missing task ${capture.task_id}.`);
  }
  for (const session of sessions) {
    if (session.task_id && !taskIds.has(session.task_id)) warnings.push(`Session ${session.session_id || "(unknown)"} references missing task ${session.task_id}.`);
  }
  for (const conflictItem of findActiveLockOverlaps(locks)) {
    blockers.push(`Active lock conflict: ${conflictItem.left} overlaps ${conflictItem.right}.`);
  }

  return makeCheck({
    id: "workspace_state",
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass",
    summary: blockers.length || warnings.length ? "Workspace state has possible inconsistency." : "Workspace state has no obvious task/capture/session/lock conflicts.",
    blockers,
    warnings,
    details: {
      tasks: tasks.length,
      captures: captures.length,
      sessions: sessions.length,
      locks: locks.length
    }
  });
}

function makeCheck({ id, status, summary, blockers = [], warnings = [], details = {} }) {
  return { id, status, summary, blockers, warnings, details };
}

function findDuplicates(items) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of items) {
    if (seen.has(item)) duplicates.add(item);
    seen.add(item);
  }
  return [...duplicates];
}

function findActiveLockOverlaps(locks) {
  const active = (locks || []).filter((lock) => lock.status === "active");
  const conflicts = [];
  for (let index = 0; index < active.length; index += 1) {
    for (let other = index + 1; other < active.length; other += 1) {
      if (locksOverlap(active[index], active[other])) {
        conflicts.push({ left: active[index].lock_id, right: active[other].lock_id });
      }
    }
  }
  return conflicts;
}

function locksOverlap(left, right) {
  const leftType = normalizeLockType(left.type);
  const rightType = normalizeLockType(right.type);
  const leftScope = normalizeScope(left.scope);
  const rightScope = normalizeScope(right.scope);
  if (!leftScope || !rightScope) return false;
  if (leftType === "workstream" || rightType === "workstream") return leftScope === rightScope;
  return leftScope === rightScope || leftScope.startsWith(`${rightScope}/`) || rightScope.startsWith(`${leftScope}/`);
}

function normalizeLockType(value) {
  return String(value || "").toLowerCase().replace(/[_-]/g, "");
}

function normalizeScope(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/$/, "").toLowerCase();
}

function readWorkspaceArray(relativePath, key) {
  const data = readWorkspaceJson(relativePath);
  return Array.isArray(data[key]) ? data[key] : [];
}

function readWorkspaceJson(relativePath) {
  try {
    const filePath = path.join(repoRoot(), ".kabeeri", relativePath);
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return {};
  }
}

function readPackageText(relativePath) {
  try {
    return fs.readFileSync(path.join(packageRoot(), relativePath), "utf8");
  } catch (_) {
    return "";
  }
}

function buildConflictNextActions(status) {
  if (status === "blocked") {
    return [
      "Resolve blockers before starting new framework development.",
      "Run `kvdf validate` after fixes.",
      "Run `npm test` before continuing feature work."
    ];
  }
  if (status === "warning") {
    return [
      "Review warnings before broad changes.",
      "Use `kvdf resume --scan` and `git status --short` to understand local context.",
      "Run `npm test` for behavior-changing work."
    ];
  }
  return [
    "Proceed with the next development slice.",
    "Keep conflict scan in the pre-development checklist.",
    "Run `npm test` before ending the session."
  ];
}

function renderConflictScanReport(report) {
  console.log("Kabeeri Conflict Scan");
  console.log(table(["Field", "Value"], [
    ["Status", report.status],
    ["Current root", report.current_root],
    ["Kabeeri engine root", report.kabeeri_engine_root],
    ["Checks", report.checks.length]
  ]));
  console.log("");
  console.log("Checks:");
  for (const check of report.checks) console.log(`- ${check.status}: ${check.id} - ${check.summary}`);
  console.log("");
  console.log("Blockers:");
  for (const item of report.blockers.length ? report.blockers : ["No blockers detected."]) console.log(`- ${item}`);
  console.log("");
  console.log("Warnings:");
  for (const item of report.warnings.length ? report.warnings : ["No warnings detected."]) console.log(`- ${item}`);
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
}

module.exports = {
  conflict,
  buildConflictScanReport
};
