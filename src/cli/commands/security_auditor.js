const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");
const { buildPluginLoaderReport } = require("../services/plugin_loader");

function securityAuditor(action, value, flags = {}, rest = [], deps = {}) {
  const { table = () => "", ensureWorkspace = () => {}, appendAudit = () => {} } = deps;
  ensureWorkspace();
  const pluginReport = buildPluginLoaderReport();
  const plugin = pluginReport.plugins.find((item) => item.plugin_id === "security-auditor") || null;
  const pluginEnabled = Boolean(plugin && plugin.enabled);
  const runtimeRoot = repoRoot();
  const runtime = loadSecurityAuditorRuntime(runtimeRoot);
  ensureSecurityAuditorRuntimeState(runtimeRoot);
  const normalizedAction = normalizeSecurityAuditorAction(action);

  if (!normalizedAction || normalizedAction === "status") {
    const status = runtime.buildSecurityAuditorStatus({
      root: runtimeRoot,
      plugin_enabled: pluginEnabled,
      plugin_available: Boolean(plugin),
      track: flags.track || value || "owner"
    });
    const payload = { ...status, plugin: plugin ? { plugin_id: plugin.plugin_id, enabled: plugin.enabled, status: plugin.status } : null };
    if (flags.json) console.log(JSON.stringify(payload, null, 2));
    else console.log(renderSecurityAuditorStatus(payload, table));
    return;
  }

  if (!pluginEnabled) {
    throw new Error("Security Auditor plugin is not enabled. Run `kvdf plugins install security-auditor` first.");
  }

  if (normalizedAction === "scan") {
    const scan = runtime.runSecurityAuditorScan({
      root: runtimeRoot,
      track: flags.track || value || "owner",
      scope: flags.evolution ? "evolution" : (flags.task ? "task" : "workspace"),
      task: flags.task || null,
      evolution: flags.evolution || null,
      include: flags.include || flags.file || flags.files || null,
      exclude: flags.exclude || null,
      max_bytes: flags["max-bytes"] || flags.max_bytes || null
    });
    appendAudit("security_auditor.scan", "plugin", scan.scan_id, `Security Auditor scan completed: ${scan.status}`);
    if (flags.json) console.log(JSON.stringify(scan, null, 2));
    else console.log(renderSecurityAuditorScan(scan, table));
    return;
  }

  if (normalizedAction === "report") {
    const report = runtime.buildSecurityAuditorReport({
      root: runtimeRoot,
      plugin_enabled: pluginEnabled,
      plugin_available: Boolean(plugin),
      track: flags.track || value || "owner",
      task: flags.task || null,
      evolution: flags.evolution || null,
      scope: flags.evolution ? "evolution" : (flags.task ? "task" : "workspace")
    });
    appendAudit("security_auditor.report", "plugin", report.latest_scan ? report.latest_scan.scan_id : "security-auditor", `Security Auditor report generated: ${report.status}`);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderSecurityAuditorReport(report, table));
    return;
  }

  throw new Error(`Unknown security-auditor action: ${action}`);
}

function normalizeSecurityAuditorAction(action) {
  return String(action || "").trim().toLowerCase();
}

function loadSecurityAuditorRuntime(root) {
  const runtimePath = path.join(root, "plugins", "security_auditor", "runtime", "index.js");
  if (!fs.existsSync(runtimePath)) {
    throw new Error("Security Auditor plugin runtime is missing. Run `kvdf plugins install security-auditor` first.");
  }
  delete require.cache[require.resolve(runtimePath)];
  return require(runtimePath);
}

function ensureSecurityAuditorRuntimeState(root) {
  const statePath = path.join(root, ".kabeeri", "security", "security_auditor_scans.json");
  if (!fs.existsSync(statePath)) {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, `${JSON.stringify({ version: "1", scans: [] }, null, 2)}\n`, "utf8");
  }
}

function renderSecurityAuditorStatus(status, table) {
  return [
    "Security Auditor",
    `Plugin enabled: ${status.plugin_enabled ? "yes" : "no"}`,
    `Latest scan: ${status.latest_scan ? `${status.latest_scan.scan_id} (${status.latest_scan.status})` : "none"}`,
    `Track: ${status.track}`,
    `Scope: ${status.scope}`,
    `Next action: ${status.next_action}`,
    "",
    table(["Field", "Value"], [
      ["State file", status.state_file],
      ["Scans recorded", status.scans_total],
      ["External tools required", status.external_tools_required ? "yes" : "no"],
      ["Engine", status.engine]
    ])
  ].join("\n");
}

function renderSecurityAuditorScan(scan, table) {
  const findingRows = scan.findings.length ? scan.findings.map((finding) => [
    finding.severity,
    finding.rule_id,
    finding.file,
    finding.line,
    finding.message
  ]) : [["pass", "-", "-", 0, "No findings."]];
  return [
    "Security Auditor Scan",
    `Status: ${scan.status}`,
    `Track: ${scan.track}`,
    `Scope: ${scan.scope}`,
    `Files scanned: ${scan.summary.files_scanned}`,
    `Blocked: ${scan.summary.blocked}`,
    `Warnings: ${scan.summary.warnings}`,
    `Next action: ${scan.next_action}`,
    "",
    table(["Severity", "Rule", "File", "Line", "Message"], findingRows)
  ].join("\n");
}

function renderSecurityAuditorReport(report, table) {
  const latest = report.latest_scan;
  if (!latest) {
    return renderSecurityAuditorStatus(report, table);
  }
  return [
    "Security Auditor Report",
    `Status: ${report.status}`,
    `Latest scan: ${latest.scan_id}`,
    `Track: ${report.track}`,
    `Scope: ${report.scope}`,
    `Next action: ${report.next_action}`,
    "",
    table(["Severity", "Rule", "File", "Line", "Message"], latest.findings.length ? latest.findings.map((finding) => [
      finding.severity,
      finding.rule_id,
      finding.file,
      finding.line,
      finding.message
    ]) : [["pass", "-", "-", 0, "No findings."]])
  ].join("\n");
}

module.exports = {
  securityAuditor
};
