const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const bootstrap = require("../bootstrap");
const multiAiGovernance = require("../commands/multi_ai_governance");
const ideGovernance = require("../commands/ide_window_governance");
const localGovernance = require("../commands/local_project_governance");
const pluginLoader = require("../../../src/cli/services/plugin_loader");
const pluginMounts = require("../../../src/cli/services/plugin_mounts");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-evolution-"));
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    initGitRepo(dir);
    fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function initGitRepo(dir) {
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "kvdf@example.com"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "KVDF Test"], { cwd: dir, stdio: "ignore" });
  fs.writeFileSync(path.join(dir, ".gitignore"), ".kabeeri/\nnode_modules/\n");
  execFileSync("git", ["add", ".gitignore"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", "init"], { cwd: dir, stdio: "ignore" });
}

function readState(dir, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(dir, relativePath), "utf8"));
}

function appendAudit(entries) {
  return (eventType, entityType, entityId, summary, metadata) => {
    entries.push({ eventType, entityType, entityId, summary, metadata });
  };
}

function silenceConsole(fn) {
  const original = console.log;
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = original;
  }
}

function withPatchedWifiClientBootstrap(patch, fn) {
  const wifiClientPath = require.resolve("../integrations/wifi_data_sharing_client");
  const originalGetStatus = pluginLoader.getPluginRuntimeStatus;
  const originalLoadBootstrap = pluginMounts.loadPluginBootstrap;
  delete require.cache[wifiClientPath];
  pluginLoader.getPluginRuntimeStatus = patch.getPluginRuntimeStatus || originalGetStatus;
  pluginMounts.loadPluginBootstrap = patch.loadPluginBootstrap || originalLoadBootstrap;
  try {
    const wifiClient = require("../integrations/wifi_data_sharing_client");
    return fn(wifiClient);
  } finally {
    pluginLoader.getPluginRuntimeStatus = originalGetStatus;
    pluginMounts.loadPluginBootstrap = originalLoadBootstrap;
    delete require.cache[wifiClientPath];
  }
}

function seedEvolutionPriority(dir, title, summary) {
  const state = {
    development_priorities: [
      {
        id: "evo-auto-044-task-trash-system",
        priority: 1,
        title,
        summary,
        source: "test",
        status: "in_progress",
        track: "framework_owner"
      }
    ],
    temporary_priorities: null
  };
  fs.writeFileSync(path.join(dir, ".kabeeri/evolution.json"), JSON.stringify(state, null, 2));
}

function registerBaseWorkspace(dir) {
  localGovernance.registerLocalProject({
    project: "project-001",
    owner: "owner-001",
    repo_root: dir
  }, {}, () => {});
  multiAiGovernance.multiAiGovernance("agent", "register", {
    ai: "agent-master",
    name: "Master AI",
    provider: "codex",
    model: "gpt-5.4-mini",
    role: "leader",
    leader_eligible: true,
    capabilities: ["planning", "governance"]
  }, {}, { appendAudit: () => {} });
  multiAiGovernance.multiAiGovernance("agent", "register", {
    ai: "agent-worker",
    name: "Worker AI",
    provider: "codex",
    model: "gpt-5.4-mini",
    role: "worker",
    worker_only: true,
    capabilities: ["implementation", "testing"]
  }, {}, { appendAudit: () => {} });
}

test("bootstrap exposes the evolution assignment bridge", () => {
  assert.strictEqual(typeof bootstrap.buildMultiAiEvolutionAssignmentBridgeReport, "function");
  assert.strictEqual(typeof bootstrap.buildMultiAiEvolutionAssignmentBridgeAssignReport, "function");
  assert.strictEqual(typeof bootstrap.renderMultiAiEvolutionAssignmentBridgeReport, "function");
  assert.strictEqual(typeof bootstrap.buildMultiAiEvolutionAssignmentWorkflowReport, "function");
  assert.strictEqual(typeof bootstrap.renderMultiAiEvolutionAssignmentWorkflowReport, "function");
  assert.strictEqual(typeof bootstrap.buildMultiAiEvolutionAssignmentSessionReport, "function");
  assert.strictEqual(typeof bootstrap.renderMultiAiEvolutionAssignmentSessionReport, "function");
});

test("wifi worker discovery bootstrap scans and advertises together", () => {
  const calls = [];
  return withPatchedWifiClientBootstrap({
    getPluginRuntimeStatus: () => ({ available: true, enabled: true }),
    loadPluginBootstrap: () => ({
      discovery: {
        runDiscoverCommand: () => {
          calls.push("discover");
          return Promise.resolve({
            status: "ok",
            mode: "discover",
            candidates: [{ node_id: "wifi-node-master", trust_role: "owner" }]
          });
        },
        runAdvertiseCommand: () => {
          calls.push("advertise");
          return Promise.resolve({
            status: "ok",
            mode: "advertise",
            candidates: [{ node_id: "wifi-node-worker", trust_role: "worker" }]
          });
        }
      },
      providerApi: {
        getProviderInfo: () => ({ provider_id: "wifi_data_sharing" }),
        listCandidates: () => [{ node_id: "wifi-node-master", trust_role: "owner" }],
        listTrustedNodes: () => [{ node_id: "wifi-node-master", trust_role: "owner" }]
      }
    })
  }, (wifiClient) => {
    const result = wifiClient.refreshWifiDataSharingDiscovery("worker", { watch: true });
    assert.strictEqual(result.status, "ok");
    assert.strictEqual(result.mode, "worker");
    assert.ok(result.discover_result);
    assert.ok(result.advertise_result);
    assert.strictEqual(result.discover_result.status, "started");
    assert.strictEqual(result.advertise_result.status, "started");
    assert.deepStrictEqual(result.candidates, [{ node_id: "wifi-node-master", trust_role: "owner" }]);
    assert.deepStrictEqual(result.trusted_nodes, [{ node_id: "wifi-node-master", trust_role: "owner" }]);
    assert.deepStrictEqual(calls, ["discover", "advertise"]);
  });
});

test("safe evolution priorities can be assigned to the master/worker bridge", () => withTempRepo((dir) => {
  const audit = [];
  const auditAppend = appendAudit(audit);
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const statusReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "status", {
    json: true
  }, {}, { appendAudit: auditAppend }));
  const assignReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "assign", {
    json: true
  }, {}, { appendAudit: auditAppend }));

  assert.strictEqual(statusReport.report_type, "multi_ai_evolution_assignment_bridge");
  assert.ok(["allow", "warn"].includes(statusReport.decision));
  assert.strictEqual(statusReport.assignment_policy.canonical_output_owner, "master_laptop");
  assert.strictEqual(statusReport.assignment_policy.push_authority, "master_laptop");
  assert.ok(statusReport.distribution_plan.worker_ai_ids.includes("agent-worker"));
  assert.ok(statusReport.master_summary);
  assert.strictEqual(statusReport.master_summary.active_workers, 1);
  assert.strictEqual(statusReport.master_summary.stale_workers, 0);
  assert.strictEqual(statusReport.master_summary.pending_assignments, 1);
  assert.strictEqual(statusReport.session_badge, "attention / fresh");
  assert.strictEqual(statusReport.session_health, "attention");
  assert.strictEqual(statusReport.assignment_freshness, "fresh");
  assert.match(bootstrap.renderMultiAiEvolutionAssignmentBridgeReport(statusReport), /Session badge:/i);
  assert.match(bootstrap.renderMultiAiEvolutionAssignmentBridgeReport(statusReport), /Session health:/i);

  assert.strictEqual(assignReport.report_type, "multi_ai_evolution_assignment_bridge");
  assert.ok(assignReport.distribution_plan.should_distribute);
  assert.ok(assignReport.distribution_result);
  assert.ok(/Master summary:/i.test(bootstrap.renderMultiAiEvolutionAssignmentBridgeReport(statusReport)));

  const bridgeState = readState(dir, ".kabeeri/multi_ai_governance/evolution_assignments.json");
  assert.ok(bridgeState.current_assignment);
  assert.strictEqual(bridgeState.current_assignment.status, "applied");
  assert.ok(bridgeState.current_assignment.worker_ai_ids.includes("agent-worker"));
  assert.ok(audit.some((entry) => entry.eventType === "multi_ai.evolution_assignment_distributed"));
}));

test("an IDE conflict blocks the evolution bridge from distributing work", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Keep the distribution safe.");

  ideGovernance.registerIdeWindowSession({
    window: "ide-window-master",
    workspace: "workspace-001",
    project: "project-001",
    repo_root: dir,
    owner: "owner-001"
  }, {}, () => {});
  ideGovernance.registerToolPresence({
    tool: "codex",
    agent: "agent-master",
    session: "ide-session-master",
    task: "task-001",
    status: "active"
  }, {}, () => {});
  ideGovernance.registerIdeWindowSession({
    window: "ide-window-worker",
    workspace: "workspace-001",
    project: "project-001",
    repo_root: dir,
    owner: "owner-001"
  }, {}, () => {});
  ideGovernance.registerToolPresence({
    tool: "codex",
    agent: "agent-worker",
    session: "ide-session-worker",
    task: "task-002",
    status: "active"
  }, {}, () => {});
  ideGovernance.createIdeLease({
    type: "file",
    scope: "src/app/page.ts",
    tool: "codex",
    agent: "agent-master",
    task: "task-001",
    window: "ide-window-master",
    workspace: "workspace-001",
    project: "project-001"
  }, {}, () => {});
  ideGovernance.createIdeLease({
    type: "file",
    scope: "src/app/page.ts",
    tool: "cursor_agent",
    agent: "agent-worker",
    task: "task-002",
    window: "ide-window-worker",
    workspace: "workspace-001",
    project: "project-001"
  }, {}, () => {});

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "status", {
    json: true
  }, {}, { appendAudit: () => {} }));

  assert.strictEqual(report.decision, "block");
  assert.ok(report.case_matrix.some((item) => item.case_id === "case_1" && item.blocking));
  assert.strictEqual(report.distribution_plan.should_distribute, false);
}));

test("high-risk evolution priorities require owner approval before worker distribution", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Prepare a release approval handoff.");

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "status", {
    json: true,
    high_risk: true
  }, {}, { appendAudit: () => {} }));

  assert.strictEqual(report.decision, "require_owner_approval");
  assert.strictEqual(report.requires_owner_approval, true);
  assert.strictEqual(report.distribution_plan.should_distribute, false);
}));

test("evolution workflow command renders the master checklist and worker prompt", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "workflow", {
    json: true
  }, {}, { appendAudit: () => {} }));

  assert.strictEqual(report.report_type, "multi_ai_evolution_assignment_workflow");
  assert.ok(Array.isArray(report.master_checklist));
  assert.ok(report.master_checklist.some((item) => /push authority/i.test(item)));
  assert.strictEqual(report.session_badge, "attention / fresh");
  assert.match(report.worker_prompt, /You are the worker laptop/i);
  assert.match(report.worker_prompt, /Do not push to GitHub/i);
  assert.match(report.worker_prompt, /Edit only leased files/i);
  assert.strictEqual(report.master_laptop.push_authority, "master_laptop");
  assert.strictEqual(report.worker_laptop.role, "worker_only");
}));

test("evolution session master automatically broadcasts the assignment packet to the worker node", () => withTempRepo((dir) => {
  const wire = { sent: [] };
  const audit = [];
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop" },
        next_action: "ok"
      };
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_status: "trusted" }
      ];
    },
    canSendGovernancePacket(packet, targetNodeId) {
      assert.strictEqual(targetNodeId, "wifi-node-worker");
      assert.strictEqual(packet.packet_type, "assignment_packet");
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket(packet, targetNodeId) {
      const packageId = `pkg-${String(wire.sent.length + 1).padStart(3, "0")}`;
      wire.sent.push({ packet, targetNodeId, packageId });
      return {
        status: "ok",
        package_id: packageId,
        packet_id: packageId,
        transfer: {
          package_id: packageId,
          sent_at: new Date().toISOString()
        },
        outbox: { package_id: packageId },
        inbox_record: { package_id: packageId }
      };
    },
    getWifiDataSharingProvider() {
      return null;
    }
  };

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "master"
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: appendAudit(audit)
  }));

  assert.strictEqual(report.report_type, "multi_ai_evolution_assignment_session");
  assert.strictEqual(report.role, "master");
  assert.strictEqual(report.broadcast_result.status, "ok");
  assert.strictEqual(wire.sent.length, 1);
  const sessionState = readState(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json");
  assert.ok(sessionState.master_session);
  assert.strictEqual(sessionState.master_session.last_broadcast_packet_id, "pkg-001");
  assert.ok(Array.isArray(sessionState.broadcasts));
  assert.strictEqual(sessionState.broadcasts.length, 1);
  assert.ok(audit.some((entry) => entry.eventType === "multi_ai.evolution_session_broadcast"));
}));

test("evolution session master discovers and broadcasts to all ready worker nodes", () => withTempRepo((dir) => {
  const wire = { sent: [] };
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop" },
        next_action: "ok"
      };
    },
    refreshWifiDataSharingDiscovery(mode) {
      return {
        status: "ok",
        mode,
        candidates: [
          { node_id: "wifi-node-worker-a", display_name: "Worker A", trust_status: "trusted" },
          { node_id: "wifi-node-worker-b", display_name: "Worker B", trust_status: "trusted" }
        ]
      };
    },
    listCandidates() {
      return [
        { node_id: "wifi-node-worker-a", display_name: "Worker A", trust_status: "candidate" },
        { node_id: "wifi-node-worker-b", display_name: "Worker B", trust_status: "candidate" }
      ];
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker-a", display_name: "Worker A", trust_status: "trusted" },
        { node_id: "wifi-node-worker-b", display_name: "Worker B", trust_status: "trusted" }
      ];
    },
    canSendGovernancePacket(packet, targetNodeId) {
      assert.ok(["wifi-node-worker-a", "wifi-node-worker-b"].includes(targetNodeId));
      assert.strictEqual(packet.packet_type, "assignment_packet");
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket(packet, targetNodeId) {
      const packageId = `pkg-${String(wire.sent.length + 1).padStart(3, "0")}`;
      wire.sent.push({ packet, targetNodeId, packageId });
      return {
        status: "ok",
        package_id: packageId,
        packet_id: packageId,
        transfer: {
          package_id: packageId,
          sent_at: new Date().toISOString()
        },
        outbox: { package_id: packageId },
        inbox_record: { package_id: packageId }
      };
    },
    getWifiDataSharingProvider() {
      return null;
    }
  };

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "master"
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: () => {}
  }));

  assert.strictEqual(report.report_type, "multi_ai_evolution_assignment_session");
  assert.strictEqual(report.role, "master");
  assert.strictEqual(report.worker_pool.ready_worker_count, 2);
  assert.deepStrictEqual(report.target_node_ids.sort(), ["wifi-node-worker-a", "wifi-node-worker-b"]);
  assert.strictEqual(report.broadcast_results.length, 2);
  assert.strictEqual(wire.sent.length, 2);
  const sessionState = readState(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json");
  assert.ok(sessionState.master_session);
  assert.deepStrictEqual((sessionState.master_session.target_node_ids || []).sort(), ["wifi-node-worker-a", "wifi-node-worker-b"]);
  assert.ok(Array.isArray(sessionState.broadcasts));
  assert.strictEqual(sessionState.broadcasts.length, 2);
}));

test("evolution session watch mode keeps the master broadcast loop alive", () => withTempRepo((dir) => {
  const wire = { sent: [] };
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop" },
        next_action: "ok"
      };
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_status: "trusted" }
      ];
    },
    canSendGovernancePacket(packet, targetNodeId) {
      assert.strictEqual(targetNodeId, "wifi-node-worker");
      assert.strictEqual(packet.packet_type, "assignment_packet");
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket(packet, targetNodeId) {
      const packageId = `pkg-${String(wire.sent.length + 1).padStart(3, "0")}`;
      wire.sent.push({ packet, targetNodeId, packageId });
      return {
        status: "ok",
        package_id: packageId,
        packet_id: packageId,
        transfer: { package_id: packageId, sent_at: new Date().toISOString() },
        outbox: { package_id: packageId },
        inbox_record: { package_id: packageId }
      };
    },
    getWifiDataSharingProvider() {
      return null;
    }
  };

  const watchReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "watch", {
    json: true,
    role: "master",
    iterations: 1
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: () => {}
  }));

  assert.strictEqual(watchReport.report_type, "multi_ai_relay_watch");
  assert.strictEqual(watchReport.render_count, 1);
  assert.strictEqual(wire.sent.length, 1);
  const sessionState = readState(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json");
  assert.ok(sessionState.master_session);
  assert.strictEqual(sessionState.master_session.last_broadcast_packet_id, "pkg-001");
}));

test("evolution session worker applies the assignment packet from the inbox without manual paste", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const wire = { sent: [] };
  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop" },
        next_action: "ok"
      };
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_status: "trusted" }
      ];
    },
    canSendGovernancePacket() {
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket(packet, targetNodeId) {
      const packageId = `pkg-${String(wire.sent.length + 1).padStart(3, "0")}`;
      const payload = packet.payload || {};
      wire.sent.push({ packet, targetNodeId, packageId, payload });
      return {
        status: "ok",
        package_id: packageId,
        packet_id: packageId,
        transfer: { package_id: packageId, sent_at: new Date().toISOString() },
        outbox: { package_id: packageId },
        inbox_record: {
          package_id: packageId,
          packet_id: packageId,
          package_type: packet.packet_type,
          target_plugin: "multi_ai_governance",
          target_node_id: targetNodeId,
          payload,
          received_at: new Date().toISOString(),
          status: "received"
        }
      };
    },
    getWifiDataSharingProvider() {
      return null;
    }
  };

  const masterReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "master"
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: () => {}
  }));

  const workerWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-worker", display_name: "Worker Laptop" },
        next_action: "ok"
      };
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-master", display_name: "Master Laptop", trust_status: "trusted" }
      ];
    },
    canSendGovernancePacket() {
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket() {
      return { status: "ok" };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return wire.sent.map(({ packageId, payload, targetNodeId }) => ({
            package_id: packageId,
            packet_id: packageId,
            package_type: "assignment_packet",
            target_plugin: "multi_ai_governance",
            target_node_id: targetNodeId,
            payload,
            received_at: new Date().toISOString(),
            status: "received"
          }));
        }
      };
    }
  };

  const workerReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "worker"
  }, {
    wifiClient: workerWifiClient
  }, {
    appendAudit: () => {}
  }));

  assert.strictEqual(masterReport.role, "master");
  assert.strictEqual(workerReport.role, "worker");
  assert.strictEqual(workerReport.receipt_result.status, "applied");
  const bridgeState = readState(dir, ".kabeeri/multi_ai_governance/evolution_assignments.json");
  assert.strictEqual(bridgeState.current_assignment.status, "applied");
  const sessionState = readState(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json");
  assert.ok(sessionState.worker_session);
  assert.strictEqual(sessionState.worker_session.last_received_packet_id, "pkg-001");
  assert.strictEqual(sessionState.worker_session.applied_assignment_id, bridgeState.current_assignment.assignment_id);
}));

test("evolution session worker sends a join request and master sees the ready worker", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Allow the worker laptop to raise its ready flag.");

  const wire = { joinRequests: [] };
  const workerWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker" },
        next_action: "ok"
      };
    },
    refreshWifiDataSharingDiscovery(mode) {
      return {
        status: "ok",
        mode,
        candidates: [
          { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
        ]
      };
    },
    listCandidates() {
      return [
        { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
      ];
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
      ];
    },
    listWifiDataSharingInbox() {
      return [];
    },
    canSendGovernancePacket(packet, targetNodeId) {
      assert.strictEqual(targetNodeId, "wifi-node-master");
      assert.strictEqual(packet.packet_type, "worker_join_request");
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendWorkerJoinRequest(packet, targetNodeId) {
      const packageId = `join-${String(wire.joinRequests.length + 1).padStart(3, "0")}`;
      wire.joinRequests.push({
        packet_id: packageId,
        package_id: packageId,
        packet_type: "worker_join_request",
        target_node_id: targetNodeId,
        sender_node_id: packet.payload.sender_node_id,
        payload: packet.payload,
        received_at: new Date().toISOString(),
        status: "requested"
      });
      return {
        status: "ok",
        package_id: packageId,
        packet_id: packageId,
        inbox_record: {
          package_id: packageId,
          packet_id: packageId,
          package_type: "worker_join_request",
          target_plugin: "multi_ai_governance",
          target_node_id: targetNodeId,
          payload: packet.payload,
          received_at: new Date().toISOString(),
          status: "requested"
        }
      };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return [];
        }
      };
    }
  };

  const workerReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "worker"
  }, {
    wifiClient: workerWifiClient
  }, {
    appendAudit: () => {}
  }));

  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner" },
        next_action: "ok"
      };
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted" }
      ];
    },
    listWifiDataSharingInbox() {
      return wire.joinRequests.map((request) => ({
        packet_id: request.packet_id,
        package_id: request.package_id,
        packet_type: request.packet_type,
        target_node_id: request.target_node_id,
        sender_node_id: request.sender_node_id,
        payload: request.payload,
        status: request.status,
        received_at: request.received_at
      }));
    },
    canSendGovernancePacket() {
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket() {
      return { status: "ok", package_id: "pkg-001", packet_id: "pkg-001" };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return wire.joinRequests.map((request) => ({
            packet_id: request.packet_id,
            package_id: request.package_id,
            packet_type: request.packet_type,
            target_node_id: request.target_node_id,
            sender_node_id: request.sender_node_id,
            payload: request.payload,
            status: request.status,
            received_at: request.received_at
          }));
        }
      };
    }
  };

  const masterReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "master"
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: () => {}
  }));

  assert.strictEqual(workerReport.join_request_result.status, "requested");
  assert.strictEqual(wire.joinRequests.length, 1);
  assert.strictEqual(masterReport.worker_pool.join_request_count, 1);
  assert.deepStrictEqual(masterReport.worker_pool.join_request_worker_ids, ["wifi-node-worker"]);
  assert.strictEqual(masterReport.target_node_ids[0], "wifi-node-worker");
}));

test("evolution session worker rejoins after timeout and the master records recovery", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Allow a stale worker to rejoin safely.");

  const wire = { joinRequests: [], heartbeats: [] };
  const workerWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker" },
        next_action: "ok"
      };
    },
    refreshWifiDataSharingDiscovery(mode) {
      return {
        status: "ok",
        mode,
        candidates: [
          { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
        ]
      };
    },
    listCandidates() {
      return [
        { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
      ];
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
      ];
    },
    listWifiDataSharingInbox() {
      return [];
    },
    sendWorkerJoinRequest(packet, targetNodeId) {
      const packageId = `join-${String(wire.joinRequests.length + 1).padStart(3, "0")}`;
      wire.joinRequests.push({
        packet_id: packageId,
        package_id: packageId,
        packet_type: "worker_join_request",
        target_node_id: targetNodeId,
        sender_node_id: packet.payload.sender_node_id,
        payload: packet.payload,
        received_at: new Date().toISOString(),
        status: "requested"
      });
      return { status: "ok", package_id: packageId, packet_id: packageId };
    },
    sendWorkerHeartbeat(packet, targetNodeId) {
      const packageId = `beat-${String(wire.heartbeats.length + 1).padStart(3, "0")}`;
      wire.heartbeats.push({
        packet_id: packageId,
        package_id: packageId,
        packet_type: "worker_heartbeat",
        target_node_id: targetNodeId,
        sender_node_id: packet.payload.sender_node_id,
        payload: packet.payload,
        received_at: new Date().toISOString(),
        status: "alive"
      });
      return { status: "ok", package_id: packageId, packet_id: packageId };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return [];
        }
      };
    }
  };

  const firstWorkerReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "worker"
  }, {
    wifiClient: workerWifiClient
  }, {
    appendAudit: () => {}
  }));

  const staleSessionState = readState(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json");
  staleSessionState.master_session = {
    ...(staleSessionState.master_session || {}),
    session_id: "multi-ai-evolution-session-master-001",
    role: "master",
    worker_pool: {
      stale_worker_ids: ["wifi-node-worker"],
      stale_workers: [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", stale: true }
      ]
    },
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  };
  staleSessionState.worker_session = {
    ...(staleSessionState.worker_session || {}),
    join_request_status: "requested",
    join_request_packet_id: firstWorkerReport.join_request_result.packet_id,
    join_request_target_node_id: "wifi-node-master",
    join_request_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    heartbeat_status: "alive",
    heartbeat_packet_id: firstWorkerReport.heartbeat_result.packet_id,
    heartbeat_target_node_id: "wifi-node-master",
    last_heartbeat_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  };
  fs.writeFileSync(path.join(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json"), JSON.stringify(staleSessionState, null, 2));

  const secondWorkerReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "worker",
    join_request_timeout_ms: 1000,
    heartbeat_timeout_ms: 1000
  }, {
    wifiClient: workerWifiClient
  }, {
    appendAudit: () => {}
  }));

  const wireJoinCountAfterRecovery = wire.joinRequests.length;
  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner" },
        next_action: "ok"
      };
    },
    refreshWifiDataSharingDiscovery(mode) {
      return {
        status: "ok",
        mode,
        candidates: [
          { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: new Date().toISOString() }
        ]
      };
    },
    listCandidates() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: new Date().toISOString() }
      ];
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: new Date().toISOString() }
      ];
    },
    listWifiDataSharingInbox() {
      return [
        ...wire.joinRequests.map((request) => ({
          packet_id: request.packet_id,
          package_id: request.package_id,
          packet_type: request.packet_type,
          target_node_id: request.target_node_id,
          sender_node_id: request.sender_node_id,
          payload: request.payload,
          status: request.status,
          received_at: request.received_at
        })),
        ...wire.heartbeats.map((heartbeat) => ({
          packet_id: heartbeat.packet_id,
          package_id: heartbeat.package_id,
          packet_type: heartbeat.packet_type,
          target_node_id: heartbeat.target_node_id,
          sender_node_id: heartbeat.sender_node_id,
          payload: heartbeat.payload,
          status: heartbeat.status,
          received_at: heartbeat.received_at
        }))
      ];
    },
    canSendGovernancePacket() {
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket() {
      return { status: "ok", package_id: "pkg-001", packet_id: "pkg-001" };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return [
            ...wire.joinRequests.map((request) => ({
              packet_id: request.packet_id,
              package_id: request.package_id,
              packet_type: request.packet_type,
              target_node_id: request.target_node_id,
              sender_node_id: request.sender_node_id,
              payload: request.payload,
              status: request.status,
              received_at: request.received_at
            })),
            ...wire.heartbeats.map((heartbeat) => ({
              packet_id: heartbeat.packet_id,
              package_id: heartbeat.package_id,
              packet_type: heartbeat.packet_type,
              target_node_id: heartbeat.target_node_id,
              sender_node_id: heartbeat.sender_node_id,
              payload: heartbeat.payload,
              status: heartbeat.status,
              received_at: heartbeat.received_at
            }))
          ];
        }
      };
    }
  };

  const masterReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "master"
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: () => {}
  }));

  assert.strictEqual(firstWorkerReport.join_request_result.status, "requested");
  assert.strictEqual(firstWorkerReport.heartbeat_result.status, "sent");
  assert.strictEqual(secondWorkerReport.join_request_result.status, "requested");
  assert.ok(wireJoinCountAfterRecovery > 1);
  assert.strictEqual(masterReport.recovery_result.status, "recovered");
  assert.ok(Array.isArray(masterReport.recovery_result.recovered_worker_ids));
  assert.deepStrictEqual(masterReport.recovery_result.recovered_worker_ids, ["wifi-node-worker"]);
  const workerRendered = bootstrap.renderMultiAiEvolutionAssignmentSessionReport(secondWorkerReport);
  assert.match(workerRendered, /Master overview:/i);
  assert.match(workerRendered, /pending|completed/i);
  const sessionState = readState(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json");
  assert.ok(Array.isArray(sessionState.recovery_events));
  assert.ok(sessionState.recovery_events.some((item) => item && item.target_node_id === "wifi-node-worker"));
}));

test("evolution session worker sends heartbeat and completion packets and the master acknowledges them", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Keep the worker heartbeat and completion flow auditable.");

  const wire = { joinRequests: [], heartbeats: [], results: [] };
  const workerWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker" },
        next_action: "ok"
      };
    },
    refreshWifiDataSharingDiscovery(mode) {
      return {
        status: "ok",
        mode,
        candidates: [
          { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
        ]
      };
    },
    listCandidates() {
      return [
        { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
      ];
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner", trust_status: "trusted" }
      ];
    },
    listWifiDataSharingInbox() {
      return [];
    },
    sendWorkerJoinRequest(packet, targetNodeId) {
      const packageId = `join-${String(wire.joinRequests.length + 1).padStart(3, "0")}`;
      wire.joinRequests.push({
        packet_id: packageId,
        package_id: packageId,
        packet_type: "worker_join_request",
        target_node_id: targetNodeId,
        sender_node_id: packet.payload.sender_node_id,
        payload: packet.payload,
        received_at: new Date().toISOString(),
        status: "requested"
      });
      return {
        status: "ok",
        package_id: packageId,
        packet_id: packageId
      };
    },
    sendWorkerHeartbeat(packet, targetNodeId) {
      const packageId = `beat-${String(wire.heartbeats.length + 1).padStart(3, "0")}`;
      wire.heartbeats.push({
        packet_id: packageId,
        package_id: packageId,
        packet_type: "worker_heartbeat",
        target_node_id: targetNodeId,
        sender_node_id: packet.payload.sender_node_id,
        payload: packet.payload,
        received_at: new Date().toISOString(),
        status: "alive"
      });
      return {
        status: "ok",
        package_id: packageId,
        packet_id: packageId
      };
    },
    sendWorkerResult(packet, targetNodeId) {
      const packageId = `done-${String(wire.results.length + 1).padStart(3, "0")}`;
      wire.results.push({
        packet_id: packageId,
        package_id: packageId,
        packet_type: "worker_result",
        target_node_id: targetNodeId,
        sender_node_id: packet.payload.sender_node_id,
        payload: packet.payload,
        received_at: new Date().toISOString(),
        status: packet.payload.result_status || "completed"
      });
      return {
        status: "completed",
        result_status: packet.payload.result_status || "completed",
        package_id: packageId,
        packet_id: packageId
      };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return [];
        }
      };
    }
  };

  const workerReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "worker",
    complete: true,
    summary: "Finished the worker task",
    tests: "node tests/service.unit.test.js"
  }, {
    wifiClient: workerWifiClient
  }, {
    appendAudit: () => {}
  }));

  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner" },
        next_action: "ok"
      };
    },
    refreshWifiDataSharingDiscovery(mode) {
      return {
        status: "ok",
        mode,
        candidates: [
          { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: new Date().toISOString() }
        ]
      };
    },
    listCandidates() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: new Date().toISOString() }
      ];
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: new Date().toISOString() }
      ];
    },
    listWifiDataSharingInbox() {
      return [
        ...wire.joinRequests.map((request) => ({
          packet_id: request.packet_id,
          package_id: request.package_id,
          packet_type: request.packet_type,
          target_node_id: request.target_node_id,
          sender_node_id: request.sender_node_id,
          payload: request.payload,
          status: request.status,
          received_at: request.received_at
        })),
        ...wire.heartbeats.map((heartbeat) => ({
          packet_id: heartbeat.packet_id,
          package_id: heartbeat.package_id,
          packet_type: heartbeat.packet_type,
          target_node_id: heartbeat.target_node_id,
          sender_node_id: heartbeat.sender_node_id,
          payload: heartbeat.payload,
          status: heartbeat.status,
          received_at: heartbeat.received_at
        })),
        ...wire.results.map((result) => ({
          packet_id: result.packet_id,
          package_id: result.package_id,
          packet_type: result.packet_type,
          target_node_id: result.target_node_id,
          sender_node_id: result.sender_node_id,
          payload: result.payload,
          status: result.status,
          received_at: result.received_at
        }))
      ];
    },
    canSendGovernancePacket() {
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket() {
      return { status: "ok", package_id: "pkg-001", packet_id: "pkg-001" };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return [
            ...wire.joinRequests.map((request) => ({
              packet_id: request.packet_id,
              package_id: request.package_id,
              packet_type: request.packet_type,
              target_node_id: request.target_node_id,
              sender_node_id: request.sender_node_id,
              payload: request.payload,
              status: request.status,
              received_at: request.received_at
            })),
            ...wire.heartbeats.map((heartbeat) => ({
              packet_id: heartbeat.packet_id,
              package_id: heartbeat.package_id,
              packet_type: heartbeat.packet_type,
              target_node_id: heartbeat.target_node_id,
              sender_node_id: heartbeat.sender_node_id,
              payload: heartbeat.payload,
              status: heartbeat.status,
              received_at: heartbeat.received_at
            })),
            ...wire.results.map((result) => ({
              packet_id: result.packet_id,
              package_id: result.package_id,
              packet_type: result.packet_type,
              target_node_id: result.target_node_id,
              sender_node_id: result.sender_node_id,
              payload: result.payload,
              status: result.status,
              received_at: result.received_at
            }))
          ];
        }
      };
    }
  };

  const masterReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "master"
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: () => {}
  }));

  assert.strictEqual(workerReport.join_request_result.status, "requested");
  assert.strictEqual(workerReport.heartbeat_result.status, "sent");
  assert.strictEqual(workerReport.completion_result.status, "completed");
  assert.strictEqual(workerReport.session_badge, "attention / fresh");
  assert.strictEqual(workerReport.session_health, "attention");
  assert.strictEqual(workerReport.assignment_freshness, "fresh");
  assert.strictEqual(wire.joinRequests.length, 1);
  assert.strictEqual(wire.heartbeats.length, 1);
  assert.strictEqual(wire.results.length, 1);
  assert.strictEqual(masterReport.worker_pool.ready_worker_count, 1);
  assert.ok(Array.isArray(masterReport.heartbeats) && masterReport.heartbeats.length >= 1);
  assert.ok(Array.isArray(masterReport.results) && masterReport.results.length >= 1);
  assert.strictEqual(masterReport.session_health, "attention");
  assert.strictEqual(masterReport.assignment_freshness, "fresh");
  assert.strictEqual(masterReport.session_badge, "attention / fresh");
  assert.strictEqual(masterReport.current_assignment.status, "completed");
  assert.strictEqual(masterReport.completion_result.result_status, "completed");
  assert.match(bootstrap.renderMultiAiEvolutionAssignmentSessionReport(workerReport), /Session badge:/i);
  assert.match(bootstrap.renderMultiAiEvolutionAssignmentSessionReport(workerReport), /Session health:/i);
  const bridgeState = readState(dir, ".kabeeri/multi_ai_governance/evolution_assignments.json");
  assert.strictEqual(bridgeState.current_assignment.status, "completed");
  const sessionState = readState(dir, ".kabeeri/multi_ai_governance/evolution_sessions.json");
  assert.ok(sessionState.master_session);
  assert.ok(Array.isArray(sessionState.completed_assignment_ids) || Array.isArray(sessionState.master_session.completed_assignment_ids));
  assert.strictEqual(sessionState.master_session.last_result_status, "completed");
}));

test("stale evolution workers are requeued instead of being assigned again", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Keep stale worker nodes out of the active pool.");

  const staleAt = "2000-01-01T00:00:00.000Z";
  const masterWifiClient = {
    buildWifiDataSharingIntegrationStatus() {
      return {
        available: true,
        status: "available",
        local_node: { node_id: "wifi-node-master", display_name: "Master Laptop", trust_role: "owner" },
        next_action: "ok"
      };
    },
    refreshWifiDataSharingDiscovery(mode) {
      return {
        status: "ok",
        mode,
        candidates: [
          { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: staleAt }
        ]
      };
    },
    listCandidates() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: staleAt }
      ];
    },
    listTrustedWifiNodes() {
      return [
        { node_id: "wifi-node-worker", display_name: "Worker Laptop", trust_role: "worker", trust_status: "trusted", last_seen_at: staleAt }
      ];
    },
    listWifiDataSharingInbox() {
      return [];
    },
    canSendGovernancePacket() {
      return { status: "ok", can_send: true, next_action: "ok" };
    },
    sendGovernancePacket() {
      return { status: "ok", package_id: "pkg-001", packet_id: "pkg-001" };
    },
    getWifiDataSharingProvider() {
      return {
        listInbox() {
          return [];
        }
      };
    }
  };

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "session", {
    json: true,
    role: "master"
  }, {
    wifiClient: masterWifiClient
  }, {
    appendAudit: () => {}
  }));

  assert.strictEqual(report.worker_pool.stale_worker_count, 1);
  assert.strictEqual(report.worker_pool.ready_worker_count, 0);
  assert.strictEqual(report.session_badge, "attention / stale");
  assert.strictEqual(report.session_health, "attention");
  assert.strictEqual(report.assignment_freshness, "stale");
  assert.match(report.next_action, /Stale worker heartbeats detected/i);
}));
