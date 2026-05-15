const fs = require("fs");
const path = require("path");

const { packageRoot, repoRoot } = require("../fs_utils");
const { table } = require("../ui");

const FRAMEWORK_PROTECTED_PATHS = [
  "bin/kvdf.js",
  "src/cli/",
  "knowledge/",
  "packs/",
  "schemas/",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "OWNER_DEVELOPMENT_STATE.md"
];

function guard(action, value, flags = {}) {
  const selected = action || "status";
  if (selected === "status" || selected === "framework" || selected === "check") {
    const report = buildFrameworkGuardReport(flags);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderFrameworkGuardReport(report);
    if (report.status === "blocked") process.exitCode = 1;
    return;
  }
  throw new Error(`Unknown guard action: ${selected}`);
}

function buildFrameworkGuardReport(flags = {}) {
  const cwd = repoRoot();
  const mode = detectGuardMode(cwd);
  const protectedPresence = FRAMEWORK_PROTECTED_PATHS.map((item) => ({
    path: item,
    exists: fs.existsSync(path.join(cwd, item.replace(/\/$/, "")))
  }));
  const accidentalFrameworkSurface = protectedPresence
    .filter((item) => item.exists)
    .map((item) => item.path);
  const allowFrameworkEdits = Boolean(flags["allow-framework-edits"] || flags.owner || mode === "framework_source");
  const userWorkspaceHasFrameworkSurface = mode !== "framework_source" && accidentalFrameworkSurface.length > 0;
  const status = userWorkspaceHasFrameworkSurface && !allowFrameworkEdits ? "blocked" : "pass";
  const warnings = buildGuardWarnings({ mode, userWorkspaceHasFrameworkSurface, allowFrameworkEdits, accidentalFrameworkSurface });

  return {
    report_type: "framework_boundary_guard",
    generated_at: new Date().toISOString(),
    status,
    mode,
    current_root: cwd,
    kabeeri_engine_root: packageRoot(),
    protected_paths: FRAMEWORK_PROTECTED_PATHS,
    protected_paths_present: accidentalFrameworkSurface,
    allow_framework_edits: allowFrameworkEdits,
    warnings,
    next_actions: buildGuardNextActions({ mode, status, userWorkspaceHasFrameworkSurface })
  };
}

function assertNoProtectedFrameworkFiles(files = [], flags = {}) {
  const cwd = repoRoot();
  const mode = detectGuardMode(cwd);
  const allowFrameworkEdits = Boolean(flags["allow-framework-edits"] || flags.owner || flags.framework || mode === "framework_source");
  if (allowFrameworkEdits) return [];

  const blocked = findProtectedFrameworkFiles(files);
  if (blocked.length === 0) return [];

  throw new Error([
    `Framework-internal files are protected in user workspaces: ${blocked.join(", ")}.`,
    "Use kvdf commands for Kabeeri behavior, or pass --allow-framework-edits only for an intentional Kabeeri fork or Owner-approved framework development."
  ].join(" "));
}

function findProtectedFrameworkFiles(files = []) {
  const protectedPrefixes = FRAMEWORK_PROTECTED_PATHS.map(normalizeGuardPath);
  return uniqueList(files
    .map((file) => String(file || "").trim())
    .filter(Boolean)
    .map(normalizeGuardPath)
    .filter((file) => protectedPrefixes.some((protectedPath) => {
      if (protectedPath.endsWith("/")) return file.startsWith(protectedPath);
      return file === protectedPath || file.startsWith(`${protectedPath}/`);
    })));
}

function normalizeGuardPath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}

function detectGuardMode(cwd) {
  const packageData = readJson(path.join(cwd, "package.json"));
  const isFrameworkSource = packageData &&
    packageData.name === "kabeeri-vdf" &&
    fs.existsSync(path.join(cwd, "bin", "kvdf.js")) &&
    fs.existsSync(path.join(cwd, "src", "cli", "index.js")) &&
    fs.existsSync(path.join(cwd, "OWNER_DEVELOPMENT_STATE.md"));
  if (isFrameworkSource) return "framework_source";
  if (fs.existsSync(path.join(cwd, ".kabeeri"))) return "user_workspace";
  return "non_kabeeri_folder";
}

function buildGuardWarnings({ mode, userWorkspaceHasFrameworkSurface, allowFrameworkEdits, accidentalFrameworkSurface }) {
  const warnings = [];
  if (mode === "framework_source") {
    warnings.push("Framework source detected. Kabeeri internals may be edited only as framework-owner development.");
  }
  if (mode !== "framework_source") {
    warnings.push("User workspace detected. Kabeeri framework internals should be used through kvdf commands, not edited as app files.");
  }
  if (userWorkspaceHasFrameworkSurface && !allowFrameworkEdits) {
    warnings.push(`Framework-like paths found in a user folder: ${accidentalFrameworkSurface.join(", ")}.`);
  }
  if (allowFrameworkEdits && mode !== "framework_source") {
    warnings.push("Framework edit override is active. Use this only when intentionally working on a Kabeeri fork.");
  }
  return warnings;
}

function buildGuardNextActions({ mode, status, userWorkspaceHasFrameworkSurface }) {
  if (status === "blocked") {
    return [
      "Do not edit framework internals from this user workspace.",
      "Use installed/linkable kvdf commands for Kabeeri behavior.",
      "Move app work into application files and keep Kabeeri state under .kabeeri/.",
      "Use --allow-framework-edits only for an intentional Kabeeri fork or Owner-approved framework development."
    ];
  }
  if (mode === "framework_source") {
    return [
      "Continue only after kvdf resume and owner checkpoint review.",
      "Run npm test before behavior changes.",
      "Keep framework changes in src/cli, knowledge, packs, schemas, docs, and tests."
    ];
  }
  if (userWorkspaceHasFrameworkSurface) {
    return [
      "Framework-like paths are present but override is active.",
      "Document why this user workspace intentionally contains Kabeeri internals."
    ];
  }
  return [
    "Use kvdf commands for Kabeeri behavior.",
    "Keep project implementation inside the app root and runtime state inside .kabeeri/.",
    "Run kvdf resume before starting a new session."
  ];
}

function renderFrameworkGuardReport(report) {
  console.log("Kabeeri Framework Boundary Guard");
  console.log(table(["Field", "Value"], [
    ["Status", report.status],
    ["Mode", report.mode],
    ["Current root", report.current_root],
    ["Kabeeri engine root", report.kabeeri_engine_root],
    ["Allow framework edits", report.allow_framework_edits ? "yes" : "no"],
    ["Protected paths present", report.protected_paths_present.length ? report.protected_paths_present.join(", ") : "none"]
  ]));
  console.log("");
  console.log("Warnings:");
  for (const item of report.warnings.length ? report.warnings : ["None."]) console.log(`- ${item}`);
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

function uniqueList(items) {
  return [...new Set(items)];
}

module.exports = {
  guard,
  buildFrameworkGuardReport,
  assertNoProtectedFrameworkFiles,
  findProtectedFrameworkFiles
};
