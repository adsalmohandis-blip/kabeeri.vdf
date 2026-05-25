const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const state = require("../commands/state");
const apply = require("../commands/apply");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-apply-"));
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

function writeApprovedPacketFile(dir, packet) {
  const file = path.join(dir, ".kabeeri", "multi_ai_wifi_packets.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify({ packets: [packet] }, null, 2)}\n`, "utf8");
}

test("apply requires confirm and approved packet", () => withTempRepo((dir) => {
  state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  writeApprovedPacketFile(dir, {
    packet_id: "multi-ai-wifi-packet-001",
    package_id: "wifi-pkg-001",
    packet_type: "assignment_packet",
    source: "multi_ai_governance",
    target_plugin: "multi_ai_governance",
    queue_id: "multi-ai-queue-001",
    created_by_node_id: "wifi-node-owner-001",
    payload: { hello: "world" },
    created_at: new Date().toISOString(),
    status: "approved",
    application_decision: {
      decision: "approved",
      decided_by: "owner-ai",
      reason: "approved for bridge",
      application_applied: false,
      authority_model: "multi_ai_governance"
    }
  });

  const blocked = apply.buildApplyReport({
    packageId: "multi-ai-wifi-packet-001",
    confirm: false
  });
  assert.strictEqual(blocked.status, "blocked");

  const report = apply.buildApplyReport({
    packageId: "multi-ai-wifi-packet-001",
    confirm: true,
    approvedBy: "owner-ai",
    reason: "approved bridge"
  });
  assert.strictEqual(report.status, "ok");
  assert.strictEqual(report.applied_record.status, "applied");
  assert.strictEqual(report.applied_record.packet_id, "multi-ai-wifi-packet-001");
  assert.strictEqual(report.applied_record.authority_model, "multi_ai_governance");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "wifi_data_applied.json")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "wifi_data_apply_events.jsonl")));
}));

test("applied records can be inspected and updated explicitly", () => withTempRepo((dir) => {
  state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  writeApprovedPacketFile(dir, {
    packet_id: "multi-ai-wifi-packet-002",
    package_id: "wifi-pkg-002",
    packet_type: "evidence_packet",
    source: "multi_ai_governance",
    target_plugin: "multi_ai_governance",
    queue_id: "multi-ai-queue-001",
    created_by_node_id: "wifi-node-owner-001",
    payload: { evidence: true },
    created_at: new Date().toISOString(),
    status: "approved",
    application_decision: {
      decision: "approved",
      decided_by: "owner-ai",
      reason: "approved for bridge",
      application_applied: false,
      authority_model: "multi_ai_governance"
    }
  });

  const created = apply.buildApplyReport({
    packageId: "multi-ai-wifi-packet-002",
    confirm: true
  });
  const listed = apply.buildAppliedReport();
  assert.strictEqual(listed.counts.total, 1);
  assert.strictEqual(listed.applied[0].apply_id, created.applied_record.apply_id);

  const rejected = apply.buildApplyActionReport({
    action: "reject",
    packageId: "multi-ai-wifi-packet-002",
    confirm: true,
    reason: "policy blocked"
  });
  assert.strictEqual(rejected.status, "ok");
  assert.strictEqual(state.findWifiDataAppliedRecord("multi-ai-wifi-packet-002").status, "rejected");

  const cancelled = apply.buildApplyActionReport({
    action: "cancel",
    packageId: "multi-ai-wifi-packet-002",
    confirm: true,
    reason: "test cancel"
  });
  assert.strictEqual(cancelled.status, "ok");
  assert.strictEqual(state.findWifiDataAppliedRecord("multi-ai-wifi-packet-002").status, "cancelled");
}));

test("no dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
