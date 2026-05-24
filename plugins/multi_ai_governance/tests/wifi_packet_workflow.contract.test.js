const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const wifiPackets = require("../commands/wifi_packets");
const multiAiBootstrap = require("../bootstrap");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-wifi-"));
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

function buildWifiClientStub(callLog = []) {
  return {
    buildWifiDataSharingIntegrationStatus() {
      return {
        report_type: "multi_ai_wifi_data_sharing_integration",
        available: true,
        status: "available",
        provider: {
          plugin_id: "wifi_data_sharing",
          plugin_version: "0.5.0"
        },
        local_node: {
          node_id: "wifi-node-owner-001"
        },
        trusted_nodes_count: 1,
        next_action: "Ready"
      };
    },
    getWifiDataSharingProvider() {
      return {
        getProviderInfo() {
          return {
            plugin_id: "wifi_data_sharing",
            plugin_version: "0.5.0"
          };
        },
        listTrustedNodes() {
          return [
            {
              node_id: "wifi-node-worker-001",
              trust_status: "trusted"
            }
          ];
        },
        listCandidates() {
          return [];
        },
        getLocalNode() {
          return {
            node_id: "wifi-node-owner-001"
          };
        },
        canSendPackage(packageDescriptor, targetNodeId) {
          callLog.push({ type: "canSendPackage", packageDescriptor, targetNodeId });
          return {
            status: "ok",
            can_send: true,
            transfer_mode: "single_frame",
            next_action: "Ready to send"
          };
        },
        createPackage(packageInput) {
          callLog.push({ type: "createPackage", packageInput });
          return {
            status: "ok",
            package: {
              package_id: "wifi-pkg-001",
              package_type: packageInput.packageType || packageInput.package_type || "generic_json",
              title: packageInput.title || "Packet",
              payload: packageInput.payload || {},
              payload_encoding: packageInput.payload_encoding || "json",
              payload_size_bytes: JSON.stringify(packageInput.payload || {}).length,
              sha256: "a".repeat(64),
              created_at: new Date().toISOString(),
              status: "created"
            }
          };
        },
        sendPackage(packageId, targetNodeId) {
          callLog.push({ type: "sendPackage", packageId, targetNodeId });
          return {
            status: "ok",
            transfer: {
              transfer_id: "wifi-transfer-001",
              package_id: packageId,
              target_node_id: targetNodeId,
              status: "sent",
              sent_at: new Date().toISOString()
            },
            inbox_record: {
              package_id: packageId,
              status: "quarantined"
            },
            outbox: {
              package_id: packageId,
              status: "sent"
            }
          };
        },
        listInbox() {
          return [];
        },
        getPackage(packageId) {
          return {
            package_id: packageId,
            package_type: "assignment_packet",
            title: "Packet",
            payload: {
              packet_id: packageId,
              packet_type: "assignment_packet",
              source: "multi_ai_governance",
              target_plugin: "multi_ai_governance",
              queue_id: "multi-ai-queue-001",
              leader_session_id: "multi-ai-leader-001",
              created_by_node_id: "owner-ai"
            },
            created_at: new Date().toISOString(),
            status: "received"
          };
        }
      };
    },
    canSendGovernancePacket(packet, targetNodeId) {
      return this.getWifiDataSharingProvider().canSendPackage(packet, targetNodeId);
    },
    sendGovernancePacket(packet, targetNodeId) {
      const provider = this.getWifiDataSharingProvider();
      const created = provider.createPackage({
        packageType: packet.packet_type || packet.package_type,
        title: packet.title,
        payload: packet.payload,
        payload_encoding: "json"
      });
      return provider.sendPackage(created.package.package_id, targetNodeId, { confirm: true });
    }
  };
}

test("wifi status works when wifi_data_sharing is unavailable", () => {
  const report = wifiPackets.buildWifiStatusReport({
    wifiClient: {
      buildWifiDataSharingIntegrationStatus() {
        return {
          report_type: "multi_ai_wifi_data_sharing_integration",
          available: false,
          status: "unavailable",
          next_action: "Install wifi_data_sharing."
        };
      }
    },
    governanceState: buildGovernanceState(),
    packetState: wifiPackets.defaultPacketState()
  });
  assert.strictEqual(report.report_type, "multi_ai_wifi_status");
  assert.strictEqual(report.wifi_data_sharing.available, false);
  assert.strictEqual(report.status, "unavailable");
});

test("packet creation fails safely for missing queue id", () => {
  const report = wifiPackets.buildWifiPacketCreateReport({
    governanceState: buildGovernanceState(),
    packetState: wifiPackets.defaultPacketState()
  });
  assert.strictEqual(report.report_type, "multi_ai_wifi_packet_blocked");
  assert.strictEqual(report.status, "blocked");
  assert.match(report.next_action, /type/i);
});

test("packet shape validates", () => withTempRepo(() => {
  const report = wifiPackets.buildWifiPacketCreateReport({
    packetType: "assignment_packet",
    queueId: "multi-ai-queue-001",
    governanceState: buildGovernanceState()
  });
  assert.strictEqual(report.status, "ok");
  assert.strictEqual(report.packet.packet_type, "assignment_packet");
  assert.strictEqual(report.packet.source, "multi_ai_governance");
  assert.strictEqual(report.packet.target_plugin, "multi_ai_governance");
  assert.strictEqual(report.packet.queue_id, "multi-ai-queue-001");
  assert.strictEqual(report.packet.status, "created");
}));

test("packet send delegates to wifi_data_sharing client/provider", () => withTempRepo(() => {
  const callLog = [];
  const wifiClient = buildWifiClientStub(callLog);
  const created = wifiPackets.buildWifiPacketCreateReport({
    packetType: "assignment_packet",
    queueId: "multi-ai-queue-001",
    governanceState: buildGovernanceState()
  });
  const report = wifiPackets.buildWifiPacketSendReport({
    packetId: created.packet.packet_id,
    targetNodeId: "wifi-node-worker-001",
    confirm: true,
    wifiClient,
    governanceState: buildGovernanceState()
  });
  assert.strictEqual(report.status, "ok");
  assert.strictEqual(report.packet.status, "sent");
  assert.ok(callLog.some((entry) => entry.type === "canSendPackage"));
  assert.ok(callLog.some((entry) => entry.type === "createPackage"));
  assert.ok(callLog.some((entry) => entry.type === "sendPackage"));
}));

test("packet inspect does not mutate governance state", () => withTempRepo(() => {
  const created = wifiPackets.buildWifiPacketCreateReport({
    packetType: "assignment_packet",
    queueId: "multi-ai-queue-001",
    governanceState: buildGovernanceState()
  });
  const governanceFile = path.join(process.env.KVDF_REPO_ROOT, ".kabeeri", "multi_ai_governance.json");
  assert.strictEqual(fs.existsSync(governanceFile), false);
  const report = wifiPackets.buildWifiPacketInspectReport({
    identifier: created.packet.packet_id,
    wifiClient: buildWifiClientStub([]),
    governanceState: buildGovernanceState()
  });
  assert.strictEqual(report.status, "ok");
  assert.strictEqual(fs.existsSync(governanceFile), false);
}));

test("packet consume requires --confirm", () => withTempRepo(() => {
  const created = wifiPackets.buildWifiPacketCreateReport({
    packetType: "assignment_packet",
    queueId: "multi-ai-queue-001",
    governanceState: buildGovernanceState()
  });
  const report = wifiPackets.buildWifiPacketConsumeReport({
    identifier: created.packet.packet_id,
    confirm: false,
    wifiClient: buildWifiClientStub([]),
    governanceState: buildGovernanceState()
  });
  assert.strictEqual(report.status, "blocked");
  assert.match(report.next_action, /confirm/i);
}));

test("no hard dependency introduced", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "plugin.json"), "utf8"));
  const optional = Array.isArray(manifest.optional_integrations) ? manifest.optional_integrations : [];
  assert.ok(optional.some((item) => item.plugin_id === "wifi_data_sharing"));
  assert.strictEqual(typeof multiAiBootstrap.wifiDataSharingClient.buildWifiDataSharingIntegrationStatus, "function");
});

test("no package dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
