const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const pluginRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(pluginRoot, "..", "..");
const bootstrap = require("../bootstrap");
const state = require("../commands/state");
const wifi = require("../commands/wifi_data_sharing");
const discovery = require("../commands/discovery");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-data-sharing-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("plugin manifest exists and declares wifi_data_sharing", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, "plugin.json"), "utf8"));
  assert.strictEqual(manifest.plugin_id, "wifi_data_sharing");
  assert.strictEqual(manifest.removable, true);
  assert.ok(Array.isArray(manifest.provides));
});

test("bootstrap exports wifiDataSharing", () => {
  assert.strictEqual(typeof bootstrap.wifiDataSharing, "function");
});

test("default state has network_default disabled", () => {
  const defaults = state.defaultWifiDataSharingState();
  assert.strictEqual(defaults.policies.network_default, "disabled");
  assert.strictEqual(defaults.discovery.enabled, false);
});

test("init creates a wifi node id prefix", () => {
  withTempRepo((dir) => {
    const previous = process.cwd();
    const previousRepoRoot = process.env.KVDF_REPO_ROOT;
    process.chdir(dir);
    process.env.KVDF_REPO_ROOT = dir;
    try {
      const initialized = state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
      assert.ok(/^wifi-node-[0-9a-f]{12}$/.test(initialized.local_node.node_id));
      assert.strictEqual(initialized.local_node.trust_role, "owner");
      assert.strictEqual(initialized.local_node.display_name, "Owner Laptop");
    } finally {
      if (previousRepoRoot === undefined) delete process.env.KVDF_REPO_ROOT;
      else process.env.KVDF_REPO_ROOT = previousRepoRoot;
      process.chdir(previous);
    }
  });
});

test("plugin state and runtime files are self-contained", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});

test("core wrapper is only routing and not implementing network logic", () => {
  const source = fs.readFileSync(path.join(repoRoot, "src", "cli", "commands", "wifi_data_sharing.js"), "utf8");
  assert.ok(source.includes("loadPluginBootstrap"));
  assert.ok(source.includes("getPluginRuntimeStatus"));
  assert.strictEqual(source.includes("dgram"), false);
  assert.strictEqual(source.includes("socket.send"), false);
});

test("discovery message builder and parser behave locally", () => {
  const stateFixture = state.defaultWifiDataSharingState();
  stateFixture.local_node.node_id = "wifi-node-abcdef123456";
  stateFixture.local_node.display_name = "Owner Laptop";
  stateFixture.local_node.hostname = "DESKTOP";
  stateFixture.local_node.platform = "win32";
  stateFixture.local_node.kvdf_version = "0.3.0-alpha";
  const message = discovery.buildDiscoveryMessageForTests(stateFixture, "announce", { sent_at: "2026-05-24T00:00:00.000Z" });
  assert.strictEqual(message.protocol, "kvdf-wifi-data-sharing");
  assert.strictEqual(message.message_type, "announce");
  assert.strictEqual(message.service_name, "wifi_data_sharing");
  assert.strictEqual(message.node_id, "wifi-node-abcdef123456");
  const parsed = discovery.parseDiscoveryMessageForTests(JSON.stringify(message));
  assert.ok(parsed);
  assert.strictEqual(parsed.node_id, "wifi-node-abcdef123456");
});

test("parser rejects malformed and foreign messages", () => {
  assert.strictEqual(discovery.parseDiscoveryMessageForTests("{"), null);
  assert.strictEqual(discovery.parseDiscoveryMessageForTests(JSON.stringify({ protocol: "other", protocol_version: "v1", message_type: "announce", service_name: "wifi_data_sharing" })), null);
});
