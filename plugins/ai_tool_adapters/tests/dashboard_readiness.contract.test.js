const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "plugins", "ai_tool_adapters", "plugin.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const bootstrap = require("../bootstrap");
const dashboard = require("../commands/dashboard");
const readiness = require("../commands/readiness");
const evidence = require("../commands/evidence");
const audit = require("../commands/audit");

assert.strictEqual(manifest.plugin_id, "ai_tool_adapters");
assert.strictEqual(manifest.name, "AI Tool Adapter");
assert.strictEqual(typeof bootstrap.aiToolAdapters, "function");
assert.strictEqual(typeof bootstrap.buildAiToolAdaptersDashboardReport, "function");
assert.strictEqual(typeof bootstrap.buildAiToolAdaptersReadinessReport, "function");
assert.strictEqual(typeof bootstrap.buildAiToolAdaptersEvidenceReport, "function");
assert.strictEqual(typeof bootstrap.buildAiToolAdaptersAuditReport, "function");
assert.strictEqual(typeof dashboard.buildDashboardReport, "function");
assert.strictEqual(typeof readiness.buildReadinessReport, "function");
assert.strictEqual(typeof evidence.buildEvidenceReport, "function");
assert.strictEqual(typeof audit.buildAuditReport, "function");
assert.ok(!packageJson.dependencies || !Object.keys(packageJson.dependencies).length);
assert.ok(!packageJson.devDependencies || !Object.keys(packageJson.devDependencies).length);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-tool-visibility-"));
const previousCwd = process.cwd();
try {
  process.chdir(tempDir);

  const dashboardReport = dashboard.buildDashboardReport();
  assert.strictEqual(dashboardReport.report_type, "ai_tool_adapters_dashboard");
  assert.strictEqual(dashboardReport.summary.tools_count, 0);
  assert.strictEqual(dashboardReport.summary.runs_count, 0);
  assert.strictEqual(dashboardReport.summary.policy_results_count, 0);
  assert.ok(Array.isArray(dashboardReport.warnings));
  assert.ok(fs.existsSync(path.join(tempDir, ".kabeeri", "reports", "ai_tool_adapters_dashboard.json")));

  const readinessReport = readiness.buildReadinessReport();
  assert.strictEqual(readinessReport.report_type, "ai_tool_adapters_readiness");
  assert.ok(["partial", "blocked"].includes(readinessReport.status));
  assert.ok(Array.isArray(readinessReport.checks));
  assert.ok(readinessReport.checks.some((check) => check.check_id === "registry_state_exists"));
  assert.ok(fs.existsSync(path.join(tempDir, ".kabeeri", "reports", "ai_tool_adapters_readiness.json")));

  const evidenceReport = evidence.buildEvidenceReport();
  assert.strictEqual(evidenceReport.report_type, "ai_tool_adapters_evidence");
  assert.strictEqual(evidenceReport.count, 0);
  assert.strictEqual(evidenceReport.run, null);
  assert.ok(Array.isArray(evidenceReport.latest_runs));

  const filteredEvidence = evidence.buildEvidenceReport({ runId: "ai-tool-run-999" });
  assert.strictEqual(filteredEvidence.report_type, "ai_tool_adapters_evidence");
  assert.strictEqual(filteredEvidence.filter_run_id, "ai-tool-run-999");
  assert.strictEqual(filteredEvidence.run, null);

  const auditReport = audit.buildAuditReport();
  assert.strictEqual(auditReport.report_type, "ai_tool_adapters_audit");
  assert.strictEqual(auditReport.summary.tools_count, 0);
  assert.ok(Array.isArray(auditReport.findings));
  assert.ok(auditReport.findings.some((finding) => finding.finding_id === "provider-api"));
  assert.strictEqual(fs.existsSync(path.join(tempDir, ".kabeeri", "ai_tool_runs.jsonl")), false);
} finally {
  process.chdir(previousCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
}
