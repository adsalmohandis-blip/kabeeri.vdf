const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const provider = require("../provider");
const state = require("../commands/state");
const transfer = require("../commands/transfer");
const multiAiBootstrap = require("../../multi_ai_governance/bootstrap");
const wifiClientPath = "../../multi_ai_governance/integrations/wifi_data_sharing_client";

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-provider-"));
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

test("provider exports all required functions", () => {
  assert.strictEqual(typeof provider.getProviderInfo, "function");
  assert.strictEqual(typeof provider.ensureState, "function");
  assert.strictEqual(typeof provider.getLocalNode, "function");
  assert.strictEqual(typeof provider.listCandidates, "function");
  assert.strictEqual(typeof provider.listTrustedNodes, "function");
  assert.strictEqual(typeof provider.canSendPackage, "function");
  assert.strictEqual(typeof provider.createPackage, "function");
  assert.strictEqual(typeof provider.sendPackage, "function");
  assert.strictEqual(typeof provider.listInbox, "function");
  assert.strictEqual(typeof provider.getPackage, "function");
  assert.strictEqual(typeof provider.buildProviderReport, "function");
  assert.strictEqual(typeof provider.buildReadinessReport, "function");
});

test("provider report works with empty state", () => withTempRepo(() => {
  const report = provider.buildProviderReport();
  assert.strictEqual(report.report_type, "wifi_data_sharing_provider");
  assert.strictEqual(report.summary.local_node_initialized, false);
  assert.strictEqual(report.summary.candidates_count, 0);
  assert.strictEqual(report.summary.trusted_nodes_count, 0);
  assert.ok(Array.isArray(report.warnings));
  assert.ok(fs.existsSync(path.join(process.env.KVDF_REPO_ROOT, ".kabeeri", "reports", "wifi_data_sharing_provider.json")));
}));

test("canSendPackage blocks untrusted node", () => withTempRepo((dir) => {
  state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  const input = path.join(dir, "payload.json");
  fs.writeFileSync(input, JSON.stringify({ hello: "world" }, null, 2), "utf8");
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  const report = provider.canSendPackage(created.package, "wifi-node-unknown");
  assert.strictEqual(report.status, "blocked");
  assert.strictEqual(report.can_send, false);
  assert.match(report.next_action, /trusted/i);
}));

test("canSendPackage blocks revoked node", () => withTempRepo((dir) => {
  const current = state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  state.writeWifiDataSharingState({
    ...current,
    trusted_nodes: [
      {
        node_id: "wifi-node-revoked-001",
        display_name: "Revoked Node",
        hostname: "REMOTE",
        address: "127.0.0.2",
        platform: "linux",
        trust_status: "revoked",
        trusted_at: new Date().toISOString(),
        revoked_at: new Date().toISOString(),
        revocation_reason: "revoked for test",
        capabilities: ["discovery"],
        transfer_allowed: false
      }
    ]
  });
  const input = path.join(dir, "payload.json");
  fs.writeFileSync(input, JSON.stringify({ hello: "world" }, null, 2), "utf8");
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  const report = provider.canSendPackage(created.package, "wifi-node-revoked-001");
  assert.strictEqual(report.status, "blocked");
  assert.strictEqual(report.can_send, false);
}));

test("multi_ai_governance manifest has optional wifi_data_sharing integration", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "multi_ai_governance", "plugin.json"), "utf8"));
  const optional = Array.isArray(manifest.optional_integrations) ? manifest.optional_integrations : [];
  assert.ok(optional.some((item) => item.plugin_id === "wifi_data_sharing"));
});

test("multi_ai_governance client returns unavailable safely when plugin missing", () => {
  const client = require(wifiClientPath);
  const previousCwd = process.cwd();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-client-missing-"));
  try {
    process.chdir(tempDir);
    assert.strictEqual(client.isWifiDataSharingAvailable(), false);
    const status = client.buildWifiDataSharingIntegrationStatus();
    assert.strictEqual(status.status, "unavailable");
    assert.strictEqual(status.available, false);
    assert.doesNotThrow(() => client.listTrustedWifiNodes());
    assert.doesNotThrow(() => client.canSendGovernancePacket({ packet_type: "assignment_packet", payload: { hello: "world" } }, "wifi-node-unknown"));
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("no hard dependency introduced", () => {
  assert.strictEqual(Object.prototype.hasOwnProperty.call(multiAiBootstrap, "wifiDataSharingClient"), true);
  assert.strictEqual(typeof multiAiBootstrap.wifiDataSharingClient.buildWifiDataSharingIntegrationStatus, "function");
});

test("no package dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
