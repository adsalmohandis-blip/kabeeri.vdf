const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const state = require("../commands/state");
const transfer = require("../commands/transfer");
const inbox = require("../commands/inbox");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-transfer-"));
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

function seedState() {
  const current = state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  state.writeWifiDataSharingState({
    ...current,
    trusted_nodes: [
      {
        node_id: "wifi-node-trusted-001",
        display_name: "Trusted Node",
        hostname: "REMOTE",
        address: "127.0.0.1",
        platform: "linux",
        trust_status: "trusted",
        trusted_at: new Date().toISOString(),
        revoked_at: null,
        revocation_reason: null,
        capabilities: ["discovery"],
        transfer_allowed: false
      },
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
  return state.readWifiDataSharingState();
}

function writeInputFile(dir, name, content) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, content, "utf8");
  return file;
}

test("package hash validates", () => withTempRepo((dir) => {
  seedState();
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  assert.strictEqual(created.status, "ok");
  assert.strictEqual(transfer.verifyPackageHash(created.package), true);
}));

test("wrong hash fails", () => withTempRepo((dir) => {
  seedState();
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  created.package.sha256 = "deadbeef";
  assert.strictEqual(transfer.verifyPackageHash(created.package), false);
}));

test("untrusted node blocked", () => withTempRepo((dir) => {
  seedState();
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  const sent = transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: "wifi-node-unknown", confirm: true });
  assert.strictEqual(sent.status, "blocked");
  assert.match(sent.next_action, /trusted/i);
}));

test("revoked node blocked", () => withTempRepo((dir) => {
  seedState();
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  const sent = transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: "wifi-node-revoked-001", confirm: true });
  assert.strictEqual(sent.status, "blocked");
}));

test("oversized payload blocked", () => withTempRepo((dir) => {
  seedState();
  const big = writeInputFile(dir, "big.txt", "x".repeat(state.defaultWifiDataSharingState().policies.max_package_bytes + 1));
  const created = transfer.createPackage({ packageType: "text_note", inputPath: big, title: "Big" });
  assert.strictEqual(created.status, "blocked");
  assert.match(created.next_action, /max size/i);
}));

test("unknown package type blocked", () => withTempRepo(() => {
  seedState();
  const created = transfer.createPackage({ packageType: "unknown_type", inputPath: __filename, title: "Bad" });
  assert.strictEqual(created.status, "blocked");
}));

test("inbox accept requires --confirm", () => withTempRepo((dir) => {
  seedState();
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  const sent = transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: "wifi-node-trusted-001", confirm: true });
  assert.strictEqual(sent.status, "ok");
  const rejected = inbox.acceptInboxPackage({ packageId: created.package.package_id, confirm: false });
  assert.strictEqual(rejected.status, "blocked");
}));

test("package is not auto-applied", () => withTempRepo((dir) => {
  const initial = seedState();
  const seededState = state.readWifiDataSharingState();
  state.writeWifiDataSharingState({
    ...seededState,
    trusted_nodes: [
      ...seededState.trusted_nodes,
      {
        node_id: initial.local_node.node_id,
        display_name: "Sender Node",
        hostname: initial.local_node.hostname,
        address: "127.0.0.1",
        platform: initial.local_node.platform,
        trust_status: "trusted",
        trusted_at: new Date().toISOString(),
        revoked_at: null,
        revocation_reason: null,
        capabilities: ["discovery"],
        transfer_allowed: false
      }
    ]
  });
  const snapshot = JSON.stringify({
    local_node: seededState.local_node,
    discovery: seededState.discovery,
    pairing_sessions: seededState.pairing_sessions,
    trusted_nodes: state.readWifiDataSharingState().trusted_nodes,
    policies: seededState.policies
  });
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: "wifi-node-trusted-001", confirm: true });
  const blockedBeforeSecurity = inbox.acceptInboxPackage({ packageId: created.package.package_id, confirm: true });
  assert.strictEqual(blockedBeforeSecurity.status, "blocked");
  const securityGate = require("../commands/security_gate");
  const policy = securityGate.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(policy.status, "pass");
  const accepted = inbox.acceptInboxPackage({ packageId: created.package.package_id, confirm: true });
  assert.strictEqual(accepted.status, "ok");
  const current = state.readWifiDataSharingState();
  assert.strictEqual(JSON.stringify({
    local_node: current.local_node,
    discovery: current.discovery,
    pairing_sessions: current.pairing_sessions,
    trusted_nodes: current.trusted_nodes,
    policies: current.policies
  }), snapshot);
  assert.strictEqual(initial.local_node.node_id.startsWith("wifi-node-"), true);
}));

test("plugin package has no wifi_data_sharing dependency", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
