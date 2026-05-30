const fs = require("fs");
const path = require("path");

const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { readStateArray, summarizeBy } = require("../services/state_utils");
const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { buildSecurityGateState: buildSecurityGateStateService } = require("../services/security_gate");
const { normalizeTrackAssignment, getTrackDisplayLabel, getTrackDisplayShortLabel } = require("../services/track_control");

function security(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  const root = repoRoot();
  ensureSecurityState();
  const appendAudit = deps.appendAudit || (() => {});
  const file = ".kabeeri/security/security_scans.json";
  const data = readJsonFile(file);
  data.scans = data.scans || [];

  if (!action || action === "list") {
    console.log(table(["Scan", "Status", "Findings", "Critical", "High", "Generated"], data.scans.map((item) => [
      item.scan_id,
      item.status,
      item.findings_total,
      item.severity_counts.critical || 0,
      item.severity_counts.high || 0,
      item.generated_at
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value || (data.scans.length ? data.scans[data.scans.length - 1].scan_id : null);
    if (!id) throw new Error("No security scan exists yet.");
    const scan = data.scans.find((item) => item.scan_id === id);
    if (!scan) throw new Error(`Security scan not found: ${id}`);
    console.log(JSON.stringify(scan, null, 2));
    return;
  }

  if (action === "scan") {
    const scan = runSecurityScan(flags);
    data.scans.push(scan);
    writeJsonFile(file, data);
    writeJsonFile(".kabeeri/security/latest_security_scan.json", scan);
    writeTextFile(".kabeeri/security/latest_security_report.md", buildSecurityReport(scan));
    appendAudit("security.scan", "security", scan.scan_id, `Security scan completed: ${scan.status}`);
    console.log(JSON.stringify(scan, null, 2));
    return;
  }

  if (action === "report") {
    const id = flags.id || value || (data.scans.length ? data.scans[data.scans.length - 1].scan_id : null);
    if (!id) throw new Error("No security scan exists yet.");
    const scan = data.scans.find((item) => item.scan_id === id);
    if (!scan) throw new Error(`Security scan not found: ${id}`);
    const output = flags.output || `.kabeeri/security/${id}.security.md`;
    writeTextFile(output, buildSecurityReport(scan));
    appendAudit("security.report", "security", id, `Security report written: ${output}`);
    console.log(`Wrote security report: ${output}`);
    return;
  }

  if (action === "gate") {
    const gate = buildSecurityGateState({
      root,
      track: flags.track || value || "owner",
      scope: resolveSecurityGateScope(flags, value),
      task: flags.task || null,
      evolution: flags.evolution || null,
      handoff: Boolean(flags.handoff),
      required: resolveSecurityGateRequired(flags),
      strict: Boolean(flags.strict || flags["strict-security"] || flags["strict_security"]),
      persist: true
    });
    appendAudit("security.gate", "security", gate.last_scan ? gate.last_scan.scan_id : "security-gate", `Security gate evaluated: ${gate.status}`);
    if (flags.json) console.log(JSON.stringify(gate, null, 2));
    else console.log(renderSecurityGateState(gate, table));
    return;
  }

  throw new Error(`Unknown security action: ${action}`);
}

function ensureSecurityState() {
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "security"), { recursive: true });
  if (!fileExists(".kabeeri/security/security_scans.json")) writeJsonFile(".kabeeri/security/security_scans.json", { scans: [] });
  if (!fileExists(".kabeeri/security/security_readiness.json")) writeJsonFile(".kabeeri/security/security_readiness.json", { checks: [] });
}

function buildSecurityGateState(options = {}) {
  return buildSecurityGateStateService({
    ...options,
    root: options.root || repoRoot()
  });
}

function normalizeSecurityGateTrack(value, fallback = "owner") {
  const normalized = normalizeTrackAssignment(value);
  if (normalized === "framework_owner") return "owner";
  if (normalized === "vibe_app_developer") return "vibe";
  if (normalized === "plugin") return "plugin";
  return fallback;
}

function resolveSecurityGateScope(flags = {}, value = "") {
  if (flags.task || flags["task-id"]) return "task";
  if (flags.evolution) return "evolution";
  if (flags.handoff || flags.package || flags.audience) return "handoff";
  if (String(value || "").toLowerCase() === "task") return "task";
  if (String(value || "").toLowerCase() === "evolution") return "evolution";
  if (String(value || "").toLowerCase() === "handoff") return "handoff";
  return "workspace";
}

function resolveSecurityGateRequired(flags = {}) {
  return Boolean(flags.required || flags.strict || flags["security-required"] || flags.security_required || flags["strict-security"]);
}

function inferSecurityGateTrack(options = {}, root = repoRoot()) {
  const taskId = options.task || options.task_id || null;
  if (taskId && fileExists(".kabeeri/tasks.json")) {
    const tasks = readJsonFile(".kabeeri/tasks.json").tasks || [];
    const task = tasks.find((item) => item.id === taskId) || null;
    if (task) {
      if (Array.isArray(task.app_usernames) && task.app_usernames.length) return "vibe";
      const track = normalizeSecurityGateTrack(task.track || task.evolution_track || task.workspace_track || "");
      if (track) return track;
    }
  }
  const evolutionId = options.evolution || options.evolution_id || null;
  if (evolutionId && fileExists(".kabeeri/evolution.json")) {
    const evolution = readJsonFile(".kabeeri/evolution.json");
    const currentChange = evolution.current_change_id && Array.isArray(evolution.changes)
      ? evolution.changes.find((item) => item.change_id === evolution.current_change_id)
      : null;
    if (currentChange) {
      const track = normalizeSecurityGateTrack(currentChange.track || currentChange.audience || "");
      if (track) return track;
    }
  }
  if (fileExists(".kabeeri/project.json")) {
    const project = readJsonFile(".kabeeri/project.json");
    if (String(project.workspace_kind || "").toLowerCase() === "developer_app") return "vibe";
  }
  return path.basename(root) ? "owner" : "owner";
}

function normalizeSecurityScans(scans = [], source = "core") {
  return (Array.isArray(scans) ? scans : []).map((scan) => normalizeSecurityScan(scan, source)).filter(Boolean);
}

function normalizeSecurityScan(scan, source) {
  if (!scan || typeof scan !== "object") return null;
  const summary = scan.summary && typeof scan.summary === "object"
    ? {
        blocked: Number(scan.summary.blocked || 0),
        warnings: Number(scan.summary.warnings || 0),
        files_scanned: Number(scan.summary.files_scanned || 0)
      }
    : {
        blocked: Array.isArray(scan.blockers) ? scan.blockers.length : 0,
        warnings: scan.status === "warning" ? Math.max(1, Number(scan.findings_total || (Array.isArray(scan.findings) ? scan.findings.length : 0))) : 0,
        files_scanned: Number(scan.files_scanned || 0)
      };
  const findingsTotal = Number(scan.findings_total || (Array.isArray(scan.findings) ? scan.findings.length : 0) || summary.blocked + summary.warnings);
  return {
    scan_id: scan.scan_id || scan.id || `${source}-security-scan-${Date.now()}`,
    source,
    status: scan.status || "unknown",
    generated_at: scan.generated_at || null,
    track: normalizeSecurityGateTrack(scan.track || "owner"),
    scope: String(scan.scope || "workspace").toLowerCase(),
    task_id: scan.task_id || null,
    evolution: scan.evolution || null,
    summary,
    files_scanned: Number(scan.files_scanned || summary.files_scanned || 0),
    findings_total: findingsTotal,
    next_action: scan.next_action || null,
    engine: scan.engine || (source === "plugin" ? "security-auditor" : "core"),
    findings: Array.isArray(scan.findings) ? scan.findings : []
  };
}

function selectLatestSecurityScan(scans = [], options = {}) {
  const filters = {
    track: options.track ? normalizeSecurityGateTrack(options.track) : null,
    scope: options.scope ? String(options.scope).toLowerCase() : null,
    task_id: options.task || options.task_id || null,
    evolution: resolveSecurityGateEvolutionRef(options)
  };
  const filtered = (Array.isArray(scans) ? scans : []).filter((scan) => {
    if (!scan) return false;
    if (filters.track && scan.track !== filters.track) return false;
    if (filters.scope && scan.scope !== filters.scope) return false;
    if (filters.task_id && scan.task_id !== filters.task_id) return false;
    if (filters.evolution && scan.evolution !== filters.evolution) return false;
    return true;
  });
  const pool = filtered.length ? filtered : scans;
  return pool.slice().sort((left, right) => {
    const leftTime = Date.parse(left.generated_at || "") || 0;
    const rightTime = Date.parse(right.generated_at || "") || 0;
    if (leftTime !== rightTime) return leftTime - rightTime;
    return String(left.scan_id || "").localeCompare(String(right.scan_id || ""));
  }).pop() || null;
}

function resolveSecurityGateEvolutionRef(options = {}) {
  if (options.evolution && options.evolution !== "current") return String(options.evolution);
  if (!fileExists(".kabeeri/evolution.json")) return null;
  try {
    const evolution = readJsonFile(".kabeeri/evolution.json");
    const currentChangeId = evolution.current_change_id || null;
    if (!currentChangeId) return null;
    const current = Array.isArray(evolution.changes) ? evolution.changes.find((item) => item.change_id === currentChangeId) : null;
    return current ? String(current.change_id || currentChangeId) : String(currentChangeId);
  } catch (error) {
    return null;
  }
}

function summarizeSecurityGateFindings(scan) {
  if (!scan) {
    return { blocked: 0, warnings: 0, files_scanned: 0 };
  }
  return {
    blocked: Number(scan.summary && scan.summary.blocked !== undefined ? scan.summary.blocked : (scan.status === "blocked" ? Math.max(1, scan.findings_total || 0) : 0)),
    warnings: Number(scan.summary && scan.summary.warnings !== undefined ? scan.summary.warnings : (scan.status === "warning" ? Math.max(1, scan.findings_total || 0) : 0)),
    files_scanned: Number(scan.summary && scan.summary.files_scanned !== undefined ? scan.summary.files_scanned : scan.files_scanned || 0)
  };
}

function resolveSecurityGateStatus({ required, plugin, lastScan, findingsSummary }) {
  if (!lastScan) {
    if (required) return "blocked";
    return plugin.enabled ? "unavailable" : "not_required";
  }
  if (lastScan.status === "blocked") return "blocked";
  if (lastScan.status === "warning") return "warning";
  if (lastScan.status === "pass") return "pass";
  if (required) return "blocked";
  return plugin.enabled ? "unavailable" : "not_required";
}

function resolveSecurityGateNextAction({ status, required, plugin, lastScan }) {
  if (status === "pass") return "Security gate is clear. Continue with the current workflow.";
  if (status === "warning") return "Review the warning findings and rerun the relevant security scan before release or handoff.";
  if (status === "blocked") {
    if (!plugin.installed || !plugin.enabled) {
      return required
        ? "Install or enable security-auditor, or run kvdf security scan, before closing the required gate."
        : "Install or enable security-auditor to make security gate results available for this scope.";
    }
    return lastScan && lastScan.scan_id
      ? `Address blocker findings and rerun the scan that produced ${lastScan.scan_id}.`
      : "Run a security scan to capture the blocker findings and then address them.";
  }
  if (status === "unavailable") {
    return plugin.installed && plugin.enabled
      ? "Run a security scan to refresh the gate state."
      : "Install or enable security-auditor, or run kvdf security scan, to refresh the gate state.";
  }
  return "Security gate is optional for this scope.";
}

function renderSecurityGateState(gate, tableRenderer = () => "") {
  const rows = [
    ["Status", gate.status || "unknown", gate.next_action || "n/a"],
    ["Track", getTrackDisplayShortLabel(gate.track || "owner"), gate.required ? "Required by policy" : "Optional for this scope"],
    ["Scope", gate.scope || "workspace", gate.target && (gate.target.task_id || gate.target.evolution_id || gate.target.handoff_id) ? JSON.stringify(gate.target) : "No recorded target"],
    ["Plugin", gate.plugin && gate.plugin.plugin_id ? gate.plugin.plugin_id : "security-auditor", `${gate.plugin && gate.plugin.installed ? "installed" : "missing"} / ${gate.plugin && gate.plugin.enabled ? "enabled" : "disabled"} / ${gate.plugin && gate.plugin.available ? "available" : "unavailable"} / ${gate.plugin && gate.plugin.active ? "active" : "inactive"}`],
    ["Policy", gate.policy_source || "default", `${gate.policy_path || ".kabeeri/policies/security_gate_policy.json"}${gate.strict_blocking ? " / strict" : ""}`],
    ["Blocked findings", String(gate.findings_summary && gate.findings_summary.blocked || 0), `Warnings: ${gate.findings_summary && gate.findings_summary.warnings || 0}`],
    ["Files scanned", String(gate.findings_summary && gate.findings_summary.files_scanned || 0), gate.last_scan && gate.last_scan.generated_at ? gate.last_scan.generated_at : ""]
  ];
  return [
    "Security Gate",
    `Status: ${gate.status || "unknown"}`,
    `Track: ${getTrackDisplayLabel(gate.track || "owner")}`,
    `Scope: ${gate.scope || "workspace"}`,
    `Required: ${gate.required ? "yes" : "no"}`,
    `Strict blocking: ${gate.strict_blocking ? "yes" : "no"}`,
    `Next action: ${gate.next_action || "n/a"}`,
    "",
    tableRenderer(["Field", "Value", "Details"], rows)
  ].join("\n");
}

function runSecurityScan(flags = {}) {
  const root = repoRoot();
  const include = parseCsv(flags.include || "");
  const exclude = new Set([
    ".git",
    "node_modules",
    ".kabeeri/security",
    ".kabeeri/site",
    "vendor",
    "storage/logs",
    "dist",
    "build",
    "coverage",
    ...parseCsv(flags.exclude || "")
  ].map(normalizeScanPath));
  const files = [];
  const maxBytes = Number(flags["max-bytes"] || 300000);

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relative = normalizeScanPath(path.relative(root, fullPath));
      if (!relative) continue;
      if (isScanExcluded(relative, exclude)) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        if (include.length > 0 && !include.some((item) => relative.startsWith(normalizeScanPath(item)))) continue;
        if (isLikelyTextFile(relative) && fs.statSync(fullPath).size <= maxBytes) files.push({ fullPath, relative });
      }
    }
  }

  walk(root);
  const findings = [];
  for (const fileItem of files) {
    const fileName = fileItem.relative.split("/").pop() || "";
    if (fileName === ".env") {
      findings.push({
        finding_id: `finding-${String(findings.length + 1).padStart(3, "0")}`,
        rule_id: "env_file_committed",
        severity: "high",
        file: fileItem.relative,
        line: 1,
        message: "A real .env file should not be committed or shared with AI tools.",
        evidence: "[file path only]"
      });
    }
    const content = fs.readFileSync(fileItem.fullPath, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const rule of securityScanRules()) {
        if (rule.pattern.test(line)) {
          findings.push({
            finding_id: `finding-${String(findings.length + 1).padStart(3, "0")}`,
            rule_id: rule.id,
            severity: rule.severity,
            file: fileItem.relative,
            line: index + 1,
            message: rule.message,
            evidence: redactSecretEvidence(line)
          });
        }
      }
    });
  }

  const severityCounts = summarizeBy(findings, "severity");
  const blockers = findings.filter((item) => ["critical", "high"].includes(item.severity));
  return {
    scan_id: flags.id || `security-scan-${Date.now()}`,
    generated_at: new Date().toISOString(),
    status: blockers.length > 0 ? "blocked" : findings.length > 0 ? "warning" : "pass",
    files_scanned: files.length,
    findings_total: findings.length,
    severity_counts: severityCounts,
    blockers,
    findings,
    rules: securityScanRules().map((rule) => ({ rule_id: rule.id, severity: rule.severity, message: rule.message })),
    notes: [
      "This is a lightweight KVDF pattern scan, not a replacement for a professional security scanner.",
      "Do not send files with blocker findings to AI tools until reviewed."
    ]
  };
}

function securityScanRules() {
  return [
    { id: "private_key", severity: "critical", message: "Private key material appears in a file.", pattern: /-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i },
    { id: "openai_api_key", severity: "critical", message: "OpenAI-style API key appears in a file.", pattern: /\bsk-(proj-)?[A-Za-z0-9_-]{20,}\b/ },
    { id: "stripe_secret_key", severity: "critical", message: "Stripe secret key appears in a file.", pattern: /\bsk_(live|test)_[A-Za-z0-9]{16,}\b/ },
    { id: "github_token", severity: "critical", message: "GitHub token appears in a file.", pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/ },
    { id: "aws_access_key", severity: "critical", message: "AWS access key appears in a file.", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
    { id: "env_file_committed", severity: "high", message: "A real .env file should not be committed or shared with AI tools.", pattern: /a^/ },
    { id: "generic_secret_assignment", severity: "high", message: "Potential secret assignment found.", pattern: /\b(password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret|db[_-]?password)\b\s*[:=]\s*['"]?[^'"\s]{8,}/i }
  ];
}

function normalizeScanPath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/$/, "");
}

function isScanExcluded(relative, exclude) {
  const normalized = normalizeScanPath(relative);
  return [...exclude].some((item) => normalized === item || normalized.startsWith(`${item}/`));
}

function isLikelyTextFile(relative) {
  const name = relative.split("/").pop() || "";
  if (name === ".env" || name.startsWith(".env.")) return true;
  const blocked = /\.(png|jpg|jpeg|gif|webp|ico|pdf|zip|gz|tar|7z|exe|dll|bin|woff|woff2|ttf|docx|xlsx|pptx)$/i;
  return !blocked.test(relative);
}

function redactSecretEvidence(line) {
  const trimmed = String(line || "").trim();
  if (trimmed.length <= 12) return "[redacted]";
  return `${trimmed.slice(0, 8)}...[redacted]...${trimmed.slice(-4)}`;
}

function buildSecurityReport(scan) {
  const lines = [
    `# Security Scan Report - ${scan.scan_id}`,
    "",
    `Generated at: ${scan.generated_at}`,
    `Status: ${scan.status}`,
    `Files scanned: ${scan.files_scanned}`,
    `Findings: ${scan.findings_total}`,
    "",
    "## Severity Counts",
    "",
    `- critical: ${scan.severity_counts.critical || 0}`,
    `- high: ${scan.severity_counts.high || 0}`,
    `- medium: ${scan.severity_counts.medium || 0}`,
    `- low: ${scan.severity_counts.low || 0}`,
    "",
    "## Findings",
    "",
    "| Severity | Rule | File | Line | Message | Evidence |",
    "| --- | --- | --- | ---: | --- | --- |"
  ];
  if (scan.findings.length === 0) {
    lines.push("| pass | - | - | 0 | No findings. | - |");
  } else {
    for (const finding of scan.findings) {
      lines.push(`| ${finding.severity} | ${finding.rule_id} | ${finding.file} | ${finding.line} | ${finding.message} | ${finding.evidence.replace(/\|/g, "\\|")} |`);
    }
  }
  lines.push("", "## Guidance", "", "- Rotate any real secret that was committed or shared.", "- Add real secrets to local environment stores, not repository files.", "- Use `.env.example` for safe placeholder values only.", "- Do not send blocker files to AI tools until reviewed.");
  return `${lines.join("\n")}\n`;
}

function getLatestSecurityScan() {
  const scans = readStateArray(".kabeeri/security/security_scans.json", "scans");
  return scans.length ? scans[scans.length - 1] : null;
}

function parseCsv(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(parseCsv);
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

module.exports = {
  security,
  getLatestSecurityScan,
  buildSecurityGateState,
  renderSecurityGateState
};
