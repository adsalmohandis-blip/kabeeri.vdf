const { fileExists, readJsonFile, readTextFile } = require("../fs_utils");
const { outputLines, recordLines } = require("../services/report_output");

const VERSION = require("../../../package.json").version;

function productPackage(action, value, flags = {}) {
  const selected = action || "check";
  if (selected === "check" || selected === "status") {
    const report = buildPackageCheck();
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    const lines = renderPackageCheck(report);
    return outputLines(lines, flags.output);
  }
  if (selected === "guide") {
    return outputLines(readGuideLines("docs/production/PACKAGING_GUIDE.md"), flags.output);
  }
  throw new Error(`Unknown package action: ${selected}`);
}

function upgrade(action, value, flags = {}) {
  const selected = action || "guide";
  if (selected === "guide") {
    return outputLines(readGuideLines("docs/production/UPGRADE_GUIDE.md"), flags.output);
  }
  if (selected === "check" || selected === "status") {
    const report = buildUpgradeCheck();
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    return outputLines(renderUpgradeCheck(report), flags.output);
  }
  throw new Error(`Unknown upgrade action: ${selected}`);
}

function buildPackageCheck() {
  const packageData = readJsonFile("package.json");
  const requiredFiles = [
    "bin/kvdf.js",
    "src/cli/index.js",
    "src/cli/workspace.js",
    "src/cli/validate.js",
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
    "docs/production/PACKAGING_GUIDE.md",
    "docs/production/UPGRADE_GUIDE.md"
  ];
  const requiredPackageFields = ["name", "version", "description", "license", "bin", "files"];
  const checks = [];
  const warnings = [];
  const add = (id, ok, detail) => checks.push({ check_id: id, status: ok ? "pass" : "fail", detail });
  for (const field of requiredPackageFields) add(`package_field_${field}`, packageData[field] !== undefined, `${field} ${packageData[field] === undefined ? "missing" : "present"}`);
  add("bin_kvdf_configured", packageData.bin && packageData.bin.kvdf === "bin/kvdf.js", "bin.kvdf should point to bin/kvdf.js");
  add("node_engine_declared", packageData.engines && packageData.engines.node, "Node engine should be declared");
  add("pack_check_script", packageData.scripts && packageData.scripts["pack:check"], "npm run pack:check should exist");
  for (const file of requiredFiles) add(`file_${file.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`, fileExists(file), `${file} ${fileExists(file) ? "present" : "missing"}`);
  const fileList = packageData.files || [];
  for (const folder of ["bin/", "src/", "knowledge/", "packs/", "integrations/", "schemas/", "docs/", "cli/"]) {
    add(`package_files_${folder.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`, fileList.includes(folder), `${folder} ${fileList.includes(folder) ? "included" : "missing from package files"}`);
  }
  for (const forbidden of [".kabeeri/", "node_modules/", ".env"]) {
    if (fileList.includes(forbidden)) warnings.push(`${forbidden} should not be listed in package files.`);
  }
  const blockers = checks.filter((item) => item.status === "fail");
  return {
    report_id: `package-check-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    report_type: "package_check",
    generated_at: new Date().toISOString(),
    standalone: true,
    source_of_truth: "package.json and repository files",
    package: {
      name: packageData.name,
      version: packageData.version,
      bin: packageData.bin || {},
      files_count: fileList.length
    },
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "ready",
    blockers,
    warnings,
    checks,
    next_actions: buildPackageNextActions(blockers, warnings)
  };
}

function buildUpgradeCheck() {
  const compatibility = fileExists(".kabeeri/version_compatibility.json") ? readJsonFile(".kabeeri/version_compatibility.json") : null;
  const migrationState = fileExists(".kabeeri/migration_state.json") ? readJsonFile(".kabeeri/migration_state.json") : null;
  const workspaceVersion = compatibility && (compatibility.current_engine_version || compatibility.created_with_version);
  const migrationRequired = workspaceVersion ? compareSemver(workspaceVersion, VERSION) < 0 : false;
  const blockers = [];
  const warnings = [];
  if (!fileExists(".kabeeri")) warnings.push("No local .kabeeri workspace found; upgrade check is package-only.");
  if (migrationRequired) warnings.push(`Workspace engine version ${workspaceVersion} is older than CLI ${VERSION}.`);
  if (migrationState && migrationState.pending_migration) blockers.push(`Pending migration: ${migrationState.pending_migration}`);
  return {
    report_id: `upgrade-check-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    report_type: "upgrade_check",
    generated_at: new Date().toISOString(),
    standalone: true,
    source_of_truth: ".kabeeri/version_compatibility.json and .kabeeri/migration_state.json",
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "current",
    current_cli_version: VERSION,
    workspace_version: workspaceVersion || null,
    migration_required: migrationRequired,
    blockers,
    warnings,
    compatibility,
    migration_state: migrationState,
    next_actions: buildUpgradeNextActions(blockers, warnings, migrationRequired)
  };
}

function renderPackageCheck(report) {
  return [
    "# Kabeeri Product Packaging Check",
    "",
    `Report ID: ${report.report_id}`,
    `Generated at: ${report.generated_at}`,
    `Package: ${report.package.name}@${report.package.version}`,
    `Status: ${report.status}`,
    `Standalone: ${report.standalone ? "yes" : "no"}`,
    `Source of truth: ${report.source_of_truth}`,
    `Interpretation: ${report.status === "warning" && report.blockers.length === 0 ? "Warning means packaging can continue only after human review." : report.status === "blocked" ? "Blocked means package distribution should stop until blockers are resolved." : "Ready means package contract blockers or warnings were not detected."}`,
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item.check_id}: ${item.detail}`) : ["No packaging blockers detected."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["No packaging warnings detected."]),
    "",
    "## Checks",
    "",
    ...report.checks.map((item) => `- ${item.status}: ${item.check_id} - ${item.detail}`),
    "",
    "## Next Actions",
    "",
    ...recordLines(report.next_actions || [], (item) => item)
  ];
}

function renderUpgradeCheck(report) {
  return [
    "# Kabeeri Upgrade Check",
    "",
    `Report ID: ${report.report_id}`,
    `Generated at: ${report.generated_at}`,
    `CLI version: ${report.current_cli_version}`,
    `Workspace version: ${report.workspace_version || "none"}`,
    `Migration required: ${report.migration_required ? "yes" : "no"}`,
    `Status: ${report.status}`,
    `Standalone: ${report.standalone ? "yes" : "no"}`,
    `Source of truth: ${report.source_of_truth}`,
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["No upgrade blockers detected."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["No upgrade warnings detected."]),
    "",
    "## Next Actions",
    "",
    ...recordLines(report.next_actions || [], (item) => item)
  ];
}

function buildPackageNextActions(blockers, warnings) {
  if (blockers.length) return [
    "Fix failed package contract checks before npm dry-run or distribution.",
    "Run `kvdf package check` again after updating package.json or required files.",
    "Run `kvdf readiness report --target release --strict` before release review."
  ];
  if (warnings.length) return [
    "Review packaging warnings before distributing the package.",
    "Run `npm pack --dry-run` and inspect the file list manually.",
    "Keep local .kabeeri state, secrets, node_modules, and generated local outputs out of package files."
  ];
  return [
    "Run `npm pack --dry-run` and inspect the final file list.",
    "Attach package check, readiness, and governance evidence to release notes.",
    "Do not publish until Owner and policy gates approve."
  ];
}

function buildUpgradeNextActions(blockers, warnings, migrationRequired) {
  if (blockers.length) return [
    "Stop upgrade work until pending migration blockers are resolved.",
    "Review .kabeeri/migration_state.json and create a migration plan if needed.",
    "Run `kvdf upgrade check` and `kvdf validate` after migration work."
  ];
  if (warnings.length || migrationRequired) return [
    "Review workspace compatibility before continuing.",
    "Run `kvdf readiness report --target workspace` and `kvdf governance report --target workspace`.",
    "Record behavior-changing upgrade decisions in ADR or project memory."
  ];
  return [
    "Workspace appears compatible with the current CLI.",
    "Run validation and refresh live reports after any upgrade-related changes.",
    "Keep version compatibility state current for future upgrades."
  ];
}

function readGuideLines(file) {
  if (!fileExists(file)) throw new Error(`Guide not found: ${file}`);
  return readTextFile(file).replace(/\r\n/g, "\n").split("\n");
}

function compareSemver(left, right) {
  const a = String(left || "0.0.0").split(".").map((item) => Number.parseInt(item, 10) || 0);
  const b = String(right || "0.0.0").split(".").map((item) => Number.parseInt(item, 10) || 0);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

module.exports = {
  productPackage,
  upgrade,
  buildPackageCheck,
  buildUpgradeCheck
};
