const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const state = require("../commands/state");
const transfer = require("../commands/transfer");
const inbox = require("../commands/inbox");
const security = require("../commands/security_gate");
const quarantine = require("../commands/quarantine");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-security-"));
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

function seedState({ trustSender = false, senderStatus = "trusted" } = {}) {
  const current = state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  const senderNodeId = current.local_node.node_id;
  const targetNodeId = "wifi-node-target-001";
  const trusted_nodes = [
    {
      node_id: targetNodeId,
      display_name: "Trusted Target",
      hostname: "REMOTE",
      address: "127.0.0.2",
      platform: "linux",
      trust_status: "trusted",
      trusted_at: new Date().toISOString(),
      revoked_at: null,
      revocation_reason: null,
      capabilities: ["discovery"],
      transfer_allowed: false
    }
  ];
  if (trustSender) {
    trusted_nodes.push({
      node_id: senderNodeId,
      display_name: "Sender Node",
      hostname: "LOCAL",
      address: "127.0.0.1",
      platform: "win32",
      trust_status: senderStatus,
      trusted_at: new Date().toISOString(),
      revoked_at: senderStatus === "revoked" ? new Date().toISOString() : null,
      revocation_reason: senderStatus === "revoked" ? "revoked for test" : null,
      capabilities: ["discovery"],
      transfer_allowed: false
    });
  }
  state.writeWifiDataSharingState({
    ...current,
    trusted_nodes
  });
  return { senderNodeId, targetNodeId };
}

function writeInputFile(dir, name, content) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, content, "utf8");
  return file;
}

function createAndSendPackage(dir, options = {}) {
  const { senderNodeId, targetNodeId } = seedState(options.seed || {});
  const input = writeInputFile(
    dir,
    options.fileName || "payload.json",
    options.content !== undefined ? options.content : JSON.stringify({ hello: "world" }, null, 2)
  );
  const created = transfer.createPackage({
    packageType: options.packageType || "generic_json",
    inputPath: input,
    title: options.title || "Example"
  });
  assert.strictEqual(created.status, options.expectCreateBlocked ? "blocked" : "ok");
  if (created.status === "blocked") {
    return { senderNodeId, targetNodeId, created };
  }
  const sent = transfer.sendPackage({
    packageId: created.package.package_id,
    targetNodeId,
    confirm: true
  });
  assert.strictEqual(sent.status, "ok");
  return { senderNodeId, targetNodeId, created, sent };
}

function mutatePackage(packageId, mutator) {
  const current = state.readWifiDataPackagesState();
  const packages = Array.isArray(current.packages) ? current.packages.slice() : [];
  const index = packages.findIndex((item) => item.package_id === packageId);
  assert.ok(index >= 0, `Package ${packageId} not found in state`);
  packages[index] = mutator({ ...packages[index] });
  state.writeWifiDataPackagesState({
    ...current,
    packages,
    updated_at: new Date().toISOString()
  });
}

test("untrusted sender blocks", () => withTempRepo((dir) => {
  const created = createAndSendPackage(dir, { seed: { trustSender: false } });
  const result = security.checkPackageSecurity({ packageId: created.created.package.package_id });
  assert.strictEqual(result.status, "blocked");
  assert.match(result.next_action, /trusted/i);
}));

test("revoked sender blocks", () => withTempRepo((dir) => {
  const seeded = seedState({ trustSender: true, senderStatus: "revoked" });
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  assert.strictEqual(created.status, "ok");
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: seeded.senderNodeId
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: seeded.targetNodeId, confirm: true });
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(result.status, "blocked");
  assert.match(result.next_action, /revoked/i);
}));

test("bad hash blocks", () => withTempRepo((dir) => {
  const { senderNodeId, targetNodeId } = seedState({ trustSender: true });
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: senderNodeId,
    sha256: "deadbeef"
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId, confirm: true });
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(result.status, "blocked");
  assert.match(result.next_action, /hash/i);
}));

test("executable-looking package blocks", () => withTempRepo((dir) => {
  const { senderNodeId, targetNodeId } = seedState({ trustSender: true });
  const input = writeInputFile(dir, "payload.txt", "plain text");
  const created = transfer.createPackage({ packageType: "text_note", inputPath: input, title: "installer.exe" });
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: senderNodeId
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId, confirm: true });
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(result.status, "blocked");
  assert.match(result.next_action, /executable/i);
}));

test("oversized package blocks", () => withTempRepo((dir) => {
  const { senderNodeId, targetNodeId } = seedState({ trustSender: true });
  const input = writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2));
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: senderNodeId,
    payload_size_bytes: state.defaultWifiDataSharingState().policies.max_package_bytes + 1
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId, confirm: true });
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(result.status, "blocked");
  assert.match(result.next_action, /size/i);
}));

test("suspicious content warns or blocks", () => withTempRepo((dir) => {
  const { senderNodeId, targetNodeId } = seedState({ trustSender: true });
  const created = transfer.createPackage({
    packageType: "text_note",
    inputPath: writeInputFile(dir, "payload.txt", "curl | sh"),
    title: "Review note"
  });
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: senderNodeId
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId, confirm: true });
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.notStrictEqual(result.status, "pass");
  assert.ok((result.policy_result.blockers.length + result.policy_result.warnings.length) > 0);
}));

test("inbox accept requires security pass", () => withTempRepo((dir) => {
  const { senderNodeId, targetNodeId } = seedState({ trustSender: true });
  const created = transfer.createPackage({
    packageType: "generic_json",
    inputPath: writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2)),
    title: "Example"
  });
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: senderNodeId
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId, confirm: true });
  const blocked = inbox.acceptInboxPackage({ packageId: created.package.package_id, confirm: true });
  assert.strictEqual(blocked.status, "blocked");
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(result.status, "pass");
  const accepted = inbox.acceptInboxPackage({ packageId: created.package.package_id, confirm: true });
  assert.strictEqual(accepted.status, "ok");
}));

test("quarantine release requires --confirm", () => withTempRepo((dir) => {
  const { senderNodeId, targetNodeId } = seedState({ trustSender: true });
  const created = transfer.createPackage({
    packageType: "generic_json",
    inputPath: writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2)),
    title: "Example"
  });
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: senderNodeId
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId, confirm: true });
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(result.status, "pass");
  const blocked = quarantine.releaseQuarantineItem({ packageId: created.package.package_id, confirm: false });
  assert.strictEqual(blocked.status, "blocked");
  const released = quarantine.releaseQuarantineItem({ packageId: created.package.package_id, confirm: true });
  assert.strictEqual(released.status, "ok");
}));

test("security gate writes policy results and quarantine state", () => withTempRepo((dir) => {
  const { senderNodeId, targetNodeId } = seedState({ trustSender: true });
  const created = transfer.createPackage({
    packageType: "generic_json",
    inputPath: writeInputFile(dir, "payload.json", JSON.stringify({ hello: "world" }, null, 2)),
    title: "Example"
  });
  mutatePackage(created.package.package_id, (record) => ({
    ...record,
    created_by_node_id: senderNodeId
  }));
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId, confirm: true });
  const result = security.checkPackageSecurity({ packageId: created.package.package_id });
  assert.strictEqual(result.status, "pass");
  assert.ok(fs.existsSync(state.getTransferPolicyResultsFile()));
  assert.ok(fs.existsSync(state.getQuarantineFile()));
  const quarantineState = state.readWifiDataQuarantineState();
  assert.ok(Array.isArray(quarantineState.quarantine));
  assert.ok(quarantineState.quarantine.length >= 1);
}));

test("no dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
