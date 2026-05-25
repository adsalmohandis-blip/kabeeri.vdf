const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const state = require("../commands/state");
const release = require("../commands/release");
const backup = require("../commands/backup");
const restore = require("../commands/restore");
const health = require("../commands/health");

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

function withTempRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-release-"));
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("integrity and release reports work in an empty temp workspace", () => withTempRepo((dir) => {
  const report = release.buildIntegrityReport({ persist: false });
  assert.strictEqual(report.report_type, "wifi_data_sharing_integrity");
  assert.ok(Array.isArray(report.checks));
  assert.ok(report.status === "blocked" || report.status === "partial" || report.status === "ok");

  const releaseReport = release.buildReleaseReport();
  assert.strictEqual(releaseReport.report_type, "wifi_data_sharing_release_report");
  assert.ok(Array.isArray(releaseReport.checks));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "wifi_data_release_report.json")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "wifi_data_integrity.json")));
}));

test("backup create makes a manifest and restore requires confirm", () => withTempRepo((dir) => {
  const initialized = state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  const backupReport = backup.createBackup({ label: "phase-13" });
  assert.strictEqual(backupReport.report_type, "wifi_data_sharing_backup");
  assert.ok(backupReport.backup.backup_id);
  const manifestPath = path.join(backupReport.backup_dir, "manifest.json");
  assert.ok(fs.existsSync(manifestPath));

  const blockedRestore = restore.buildRestoreReport({ backupId: backupReport.backup.backup_id, confirm: false });
  assert.strictEqual(blockedRestore.status, "blocked");

  const stateFile = state.getStateFile();
  const altered = {
    ...initialized,
    local_node: {
      ...initialized.local_node,
      display_name: "Changed Name"
    }
  };
  state.writeWifiDataSharingState(altered);
  const restored = restore.buildRestoreReport({ backupId: backupReport.backup.backup_id, confirm: true });
  assert.strictEqual(restored.status, "ok");
  const restoredState = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  assert.strictEqual(restoredState.local_node.display_name, "Owner Laptop");
}));

test("health reports local hardening status", () => withTempRepo(() => {
  state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  const report = health.buildHealthReport();
  assert.strictEqual(report.report_type, "wifi_data_sharing_health");
  assert.ok(Array.isArray(report.checks));
  assert.ok(report.summary.local_node_initialized);
}));

test("no dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
