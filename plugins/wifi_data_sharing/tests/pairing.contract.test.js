const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const state = require("../commands/state");
const pairing = require("../commands/pairing");
const trustedNodes = require("../commands/trusted_nodes");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-pairing-"));
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
  current.discovery.known_candidates = [
    {
      node_id: "wifi-node-candidate-001",
      display_name: "Worker Node",
      hostname: "REMOTE",
      address: "127.0.0.1",
      platform: "linux",
      capabilities: ["discovery"]
    }
  ];
  state.writeWifiDataSharingState(current);
  return current;
}

test("pairing code hash validates correct code and rejects wrong code", () => withTempRepo(() => {
  seedState();
  const created = pairing.createPairingSession({ nodeId: "wifi-node-candidate-001" });
  assert.strictEqual(created.status, "ok");
  const wrong = pairing.verifyPairingCode({ nodeId: "wifi-node-candidate-001", code: "000-000" });
  assert.strictEqual(wrong.status, "blocked");
  const verified = pairing.verifyPairingCode({ nodeId: "wifi-node-candidate-001", code: created.pairing_code });
  assert.strictEqual(verified.status, "ok");
  assert.strictEqual(verified.pairing_verified, true);
}));

test("expired pairing code fails", () => withTempRepo(() => {
  seedState();
  const created = pairing.createPairingSession({ nodeId: "wifi-node-candidate-001" });
  const current = state.readWifiDataSharingState();
  current.pairing_sessions[0].expires_at = new Date(Date.now() - 1000).toISOString();
  state.writeWifiDataSharingState(current);
  const expired = pairing.verifyPairingCode({ nodeId: "wifi-node-candidate-001", code: created.pairing_code });
  assert.strictEqual(expired.status, "blocked");
  assert.match(expired.next_action, /expired/);
}));

test("trust requires verified pairing and confirm", () => withTempRepo(() => {
  seedState();
  const unverifiedTrust = trustedNodes.trustNode({ nodeId: "wifi-node-candidate-001", confirm: true });
  assert.strictEqual(unverifiedTrust.status, "blocked");
  const created = pairing.createPairingSession({ nodeId: "wifi-node-candidate-001" });
  const withoutConfirm = trustedNodes.trustNode({ nodeId: "wifi-node-candidate-001", confirm: false });
  assert.strictEqual(withoutConfirm.status, "blocked");
  pairing.verifyPairingCode({ nodeId: "wifi-node-candidate-001", code: created.pairing_code });
  const trusted = trustedNodes.trustNode({ nodeId: "wifi-node-candidate-001", confirm: true });
  assert.strictEqual(trusted.status, "ok");
  assert.strictEqual(trusted.trust_status, "trusted");
}));

test("revoked node cannot be trusted without new pairing", () => withTempRepo(() => {
  seedState();
  const created = pairing.createPairingSession({ nodeId: "wifi-node-candidate-001" });
  pairing.verifyPairingCode({ nodeId: "wifi-node-candidate-001", code: created.pairing_code });
  trustedNodes.trustNode({ nodeId: "wifi-node-candidate-001", confirm: true });
  const revoked = trustedNodes.revokeNode({ nodeId: "wifi-node-candidate-001", reason: "rotated node" });
  assert.strictEqual(revoked.status, "ok");
  const blocked = trustedNodes.trustNode({ nodeId: "wifi-node-candidate-001", confirm: true });
  assert.strictEqual(blocked.status, "blocked");
  assert.match(blocked.next_action, /new pairing/i);
}));

test("plugin package has no wifi_data_sharing dependency", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
