const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const bootstrap = require("../bootstrap");
const kcloudCommand = require("../../../src/cli/commands/kcloud");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-kcloud-data-sharing-"));
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["config", "user.email", "kvdf@example.com"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["config", "user.name", "KVDF Test"], { cwd: dir, stdio: "ignore" });
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function readConfig(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "kcloud", "config.json"), "utf8"));
}

test("bootstrap exposes the kcloud data sharing shell", () => {
  assert.ok(bootstrap.kcloudDataSharing);
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingStatusReport, "function");
  assert.strictEqual(typeof bootstrap.renderKcloudDataSharingReport, "function");
});

test("status reports the authority split and runtime path", () => withTempRepo(() => {
  const report = kcloudCommand.kcloudDataSharing("status", null, {}, [], {});
  assert.strictEqual(report.report_type, "kcloud_data_sharing_status");
  assert.strictEqual(report.authority_plugin, "multi_ai_governance");
  assert.strictEqual(report.local_runtime_state_path, ".kabeeri/kcloud");
  assert.strictEqual(report.transmit_status, "disabled");
  assert.strictEqual(report.receive_status, "disabled");
}));

test("init creates the local cloud config contract", () => withTempRepo((dir) => {
  const report = kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  assert.strictEqual(report.report_type, "kcloud_data_sharing_initialized");
  const config = readConfig(dir);
  assert.strictEqual(config.project_id, "project-001");
  assert.strictEqual(config.cloud_project_id, null);
  assert.strictEqual(config.transmit_enabled, false);
  assert.strictEqual(config.receive_enabled, false);
  assert.strictEqual(config.authority_plugin, "multi_ai_governance");
  assert.ok(config.created_at);
  assert.ok(config.updated_at);
}));
