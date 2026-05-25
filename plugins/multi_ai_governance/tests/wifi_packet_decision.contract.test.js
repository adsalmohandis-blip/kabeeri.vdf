const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const wifiPackets = require("../commands/wifi_packets");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-wifi-decision-"));
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

function buildGovernanceState() {
  return {
    version: "v1",
    active_leader_session_id: "multi-ai-leader-001",
    leader_sessions: [
      {
        session_id: "multi-ai-leader-001",
        leader_ai_id: "owner-ai",
        leader_name: "Owner AI",
        provider: "codex",
        model: "gpt-5",
        role: "orchestrator",
        status: "active",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    worker_queues: [
      {
        queue_id: "multi-ai-queue-001",
        ai_id: "worker-ai-001",
        title: "Review queue",
        status: "active",
        assignment_mode: "temporary_priority_distribution",
        current_slice_id: "slice-001",
        slices: [
          {
            slice_id: "slice-001",
            title: "Review packet",
            description: "Review the packet workflow.",
            state: "active"
          }
        ]
      }
    ],
    merge_bundles: [],
    agent_entries: [],
    call_inbox: [],
    evolution_governor: {},
    updated_at: new Date().toISOString()
  };
}

test("packet consume requires an explicit decision", () => withTempRepo(() => {
  const created = wifiPackets.buildWifiPacketCreateReport({
    packetType: "assignment_packet",
    queueId: "multi-ai-queue-001",
    governanceState: buildGovernanceState()
  });
  const report = wifiPackets.buildWifiPacketConsumeReport({
    identifier: created.packet.packet_id,
    confirm: true,
    decision: null,
    governanceState: buildGovernanceState()
  });
  assert.strictEqual(report.status, "blocked");
  assert.match(report.next_action, /decision/i);
}));

test("packet consume approve records an explicit approval decision", () => withTempRepo(() => {
  const created = wifiPackets.buildWifiPacketCreateReport({
    packetType: "assignment_packet",
    queueId: "multi-ai-queue-001",
    governanceState: buildGovernanceState()
  });
  const governanceFile = path.join(process.env.KVDF_REPO_ROOT, ".kabeeri", "multi_ai_governance.json");
  assert.strictEqual(fs.existsSync(governanceFile), false);
  const report = wifiPackets.buildWifiPacketConsumeReport({
    identifier: created.packet.packet_id,
    confirm: true,
    decision: "approve",
    reason: "safe to record",
    decidedBy: "owner-ai",
    governanceState: buildGovernanceState()
  });
  assert.strictEqual(report.status, "ok");
  assert.strictEqual(report.decision, "approved");
  assert.strictEqual(report.packet.status, "approved");
  assert.strictEqual(report.packet.application_decision.decision, "approved");
  assert.strictEqual(report.packet.application_decision.application_applied, false);
  assert.strictEqual(report.packet.application_decision.authority_model, "multi_ai_governance");
  assert.strictEqual(fs.existsSync(governanceFile), false);
}));

test("packet consume reject records an explicit rejection decision", () => withTempRepo(() => {
  const created = wifiPackets.buildWifiPacketCreateReport({
    packetType: "assignment_packet",
    queueId: "multi-ai-queue-001",
    governanceState: buildGovernanceState()
  });
  const report = wifiPackets.buildWifiPacketConsumeReport({
    identifier: created.packet.packet_id,
    confirm: true,
    decision: "reject",
    reason: "policy blocked",
    decidedBy: "owner-ai",
    governanceState: buildGovernanceState()
  });
  assert.strictEqual(report.status, "ok");
  assert.strictEqual(report.decision, "rejected");
  assert.strictEqual(report.packet.status, "rejected");
  assert.strictEqual(report.packet.application_decision.decision, "rejected");
  assert.strictEqual(report.packet.application_decision.application_applied, false);
  assert.strictEqual(report.packet.application_decision.effect, "do_not_apply");
}));
