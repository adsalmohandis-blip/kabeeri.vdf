const fs = require("fs");
const path = require("path");

const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { readStateArray, summarizeBy } = require("../services/state_utils");

function security(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
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
    const scan = runSecurityScan(flags);
    data.scans.push(scan);
    writeJsonFile(file, data);
    writeJsonFile(".kabeeri/security/latest_security_scan.json", scan);
    writeTextFile(".kabeeri/security/latest_security_report.md", buildSecurityReport(scan));
    appendAudit("security.gate", "security", scan.scan_id, `Security gate evaluated: ${scan.status}`);
    if (scan.status === "blocked") {
      throw new Error(`Security gate blocked: ${scan.blockers.length} blocker finding(s). Run kvdf security report --id ${scan.scan_id}.`);
    }
    console.log(`Security gate passed: ${scan.scan_id}`);
    return;
  }

  throw new Error(`Unknown security action: ${action}`);
}

function ensureSecurityState() {
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "security"), { recursive: true });
  if (!fileExists(".kabeeri/security/security_scans.json")) writeJsonFile(".kabeeri/security/security_scans.json", { scans: [] });
  if (!fileExists(".kabeeri/security/security_readiness.json")) writeJsonFile(".kabeeri/security/security_readiness.json", { checks: [] });
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
  getLatestSecurityScan
};
