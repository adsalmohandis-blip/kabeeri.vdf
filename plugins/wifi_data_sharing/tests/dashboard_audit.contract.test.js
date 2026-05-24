const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const bootstrap = require("../bootstrap");
const provider = require("../provider");
const dashboard = require("../commands/dashboard");
const audit = require("../commands/audit");
const evidence = require("../commands/evidence");
const state = require("../commands/state");

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

function withTempRepo(fn, { stubWrapper = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-audit-"));
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    if (stubWrapper) {
      const wrapperFile = path.join(dir, "src", "cli", "commands", "wifi_data_sharing.js");
      fs.mkdirSync(path.dirname(wrapperFile), { recursive: true });
      fs.writeFileSync(wrapperFile, 'module.exports = { loadPluginBootstrap: function () { return loadPluginBootstrap("wifi_data_sharing", { allowSourceFallback: true }); } };', "utf8");
    }
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("bootstrap exports dashboard audit evidence and readiness", () => {
  assert.strictEqual(typeof bootstrap.buildWifiDataSharingDashboardReport, "function");
  assert.strictEqual(typeof bootstrap.buildWifiDataSharingAuditReport, "function");
  assert.strictEqual(typeof bootstrap.buildWifiDataSharingEvidenceReport, "function");
  assert.strictEqual(typeof bootstrap.buildWifiDataSharingReadinessReport, "function");
});

test("plugin manifest includes audit and evidence commands", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "plugin.json"), "utf8"));
  const commands = Array.isArray(manifest.command_surface) ? manifest.command_surface : [];
  assert.ok(commands.some((item) => item.includes("kvdf wifi-data-sharing audit")));
  assert.ok(commands.some((item) => item.includes("kvdf wifi-data-sharing evidence")));
});

test("dashboard builder works with empty state", () => withTempRepo((dir) => {
  const report = dashboard.buildDashboardReport();
  assert.strictEqual(report.report_type, "wifi_data_sharing_dashboard");
  assert.strictEqual(report.summary.local_node_initialized, false);
  assert.strictEqual(report.summary.candidates_count, 0);
  assert.strictEqual(report.summary.trusted_nodes_count, 0);
  assert.strictEqual(report.summary.outbox_count, 0);
  assert.strictEqual(report.summary.inbox_count, 0);
  assert.ok(Array.isArray(report.latest_policy_results));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "wifi_data_sharing_dashboard.json")));
}));

test("readiness reports blocked if local node uninitialized", () => withTempRepo((dir) => {
  const report = provider.buildReadinessReport();
  assert.strictEqual(report.report_type, "wifi_data_sharing_readiness");
  assert.strictEqual(report.status, "blocked");
  const localNodeCheck = report.checks.find((check) => check.check_id === "local_node_initialized");
  assert.ok(localNodeCheck);
  assert.strictEqual(localNodeCheck.status, "fail");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "wifi_data_sharing_readiness.json")));
}, { stubWrapper: true }));

test("evidence handles missing files safely", () => withTempRepo(() => {
  const report = evidence.buildEvidenceReport({ packageId: "wifi-pkg-999" });
  assert.strictEqual(report.report_type, "wifi_data_sharing_evidence");
  assert.strictEqual(report.package_id, "wifi-pkg-999");
  assert.ok(Array.isArray(report.warnings));
  assert.ok(report.status === "partial" || report.status === "ok");
}));

test("audit does not execute network code", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "commands", "audit.js"), "utf8");
  assert.strictEqual(source.includes("dgram"), false);
  assert.strictEqual(source.includes("net"), false);
  assert.strictEqual(source.includes("socket.send"), false);
  assert.strictEqual(source.includes("server.listen"), false);
});

test("no dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
