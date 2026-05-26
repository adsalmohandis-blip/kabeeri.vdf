const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const wifiLanGovernance = require("../commands/wifi_lan_governance");
const localGovernance = require("../commands/local_project_governance");
const ideGovernance = require("../commands/ide_window_governance");
const bootstrap = require("../bootstrap");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-wifi-lan-"));
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

function wifiClientStub() {
  return {
    buildWifiDataSharingIntegrationStatus() {
      return {
        report_type: "multi_ai_wifi_data_sharing_integration",
        available: true,
        status: "available",
        provider: { plugin_id: "wifi_data_sharing" },
        local_node: { node_id: "wifi-node-owner-001" },
        trusted_nodes_count: 1,
        next_action: "Ready"
      };
    },
    getWifiDataSharingProvider() {
      return {
        getLocalNode() {
          return {
            node_id: "wifi-node-owner-001",
            hostname: "Owner Laptop",
            address: "192.168.1.10",
            capabilities: ["read_project_state"]
          };
        },
        listTrustedNodes() {
          return [
            {
              node_id: "wifi-node-peer-001",
              display_name: "Peer Node",
              hostname: "PEER",
              address: "192.168.1.11",
              capabilities: ["receive_task_packet", "send_task_result"]
            }
          ];
        },
        listCandidates() {
          return [
            {
              node_id: "wifi-node-candidate-001",
              display_name: "Candidate Node",
              hostname: "CANDIDATE",
              address: "192.168.1.12"
            }
          ];
        }
      };
    }
  };
}

function registerLocalProject(dir) {
  return localGovernance.registerLocalProject({
    project: "project-001",
    owner: "owner-001",
    repo_root: dir
  }, {}, () => {});
}

function registerLocalLease(dir, scope = "src/shared/file.ts") {
  localGovernance.registerLocalClient({
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});
  localGovernance.registerLocalSession({
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});
  return localGovernance.createLocalLease({
    type: "file",
    scope,
    allowed_paths: [scope],
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});
}

function trustedWifiNode(nodeId, overrides = {}) {
  wifiLanGovernance.mapWifiNode({
    wifi_node_id: nodeId,
    governance_node_id: overrides.governance_node_id || `gov-${nodeId}`,
    project: "project-001",
    machine: "machine-001",
    node_type: overrides.node_type || "developer_machine",
    hostname: overrides.hostname || nodeId,
    local_ip: overrides.local_ip || "192.168.1.20",
    wifi_data_sharing_peer_id: overrides.peer_id || `${nodeId}-peer`,
    owner_approved: true,
    capabilities: overrides.capabilities || ["read_project_state", "receive_task_packet"]
  }, {}, () => {});
  wifiLanGovernance.requestWifiPairing({
    wifi_node_id: nodeId,
    governance_node_id: overrides.governance_node_id || `gov-${nodeId}`,
    owner_id: "owner-001",
    requested_by: "owner-001",
    allowed_projects: ["project-001"],
    allowed_capabilities: overrides.allowed_capabilities || ["read_project_state", "receive_task_packet", "send_task_result"],
    denied_capabilities: overrides.denied_capabilities || [],
    risk_level: overrides.risk_level || "medium"
  }, {}, () => {});
  wifiLanGovernance.approveWifiPairing({
    wifi_node_id: nodeId,
    governance_node_id: overrides.governance_node_id || `gov-${nodeId}`,
    allowed_projects: ["project-001"],
    allowed_capabilities: overrides.allowed_capabilities || ["read_project_state", "receive_task_packet", "send_task_result"],
    denied_capabilities: overrides.denied_capabilities || []
  }, {}, () => {});
}

test("builds Wi-Fi/LAN status and node reports from wifi_data_sharing visibility", () => withTempRepo(() => {
  const report = wifiLanGovernance.buildWifiStatusReport({}, { wifiClient: wifiClientStub() });
  assert.strictEqual(report.report_type, "multi_ai_wifi_lan_status");
  assert.ok(report.counts.governance_nodes >= 1);
  const nodes = wifiLanGovernance.buildWifiNodesReport({}, { wifiClient: wifiClientStub() });
  assert.strictEqual(nodes.report_type, "multi_ai_wifi_nodes");
  assert.ok(nodes.counts.total >= 1);
}));

test("mapping a wifi_data_sharing node to governance identity persists state", () => withTempRepo(() => {
  const report = wifiLanGovernance.mapWifiNode({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-node-001",
    project: "project-001",
    machine: "machine-001",
    node_type: "owner_machine",
    hostname: "OWNER",
    local_ip: "192.168.1.10",
    wifi_data_sharing_peer_id: "peer-001",
    owner_approved: true,
    capabilities: ["read_project_state", "sync_files"]
  }, {}, () => {});

  assert.strictEqual(report.report_type, "multi_ai_wifi_node_mapped");
  const nodesState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_nodes.json");
  const mapState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_node_identity_map.json");
  const trustState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_trust.json");
  assert.strictEqual(nodesState.nodes.length, 1);
  assert.strictEqual(mapState.mappings.length, 1);
  assert.strictEqual(trustState.trust_records.length, 1);
  assert.strictEqual(nodesState.nodes[0].trust_status, "untrusted");
}));

test("mapping cannot directly grant Wi-Fi trust without pairing approval", () => withTempRepo(() => {
  const report = wifiLanGovernance.mapWifiNode({
    wifi_node_id: "wifi-node-trusted-attempt",
    governance_node_id: "gov-node-trusted-attempt",
    project: "project-001",
    machine: "machine-001",
    node_type: "developer_machine",
    hostname: "NODE-TRUST-ATTEMPT",
    trust_status: "trusted",
    owner_approved: true
  }, {}, () => {});

  assert.strictEqual(report.wifi_node.trust_status, "untrusted");
  assert.strictEqual(report.wifi_node.requested_trust_status, "trusted");
  const trust = wifiLanGovernance.buildWifiTrustStatusReport({ wifi_node_id: "wifi-node-trusted-attempt" });
  assert.strictEqual(trust.trust_records[0].trust_status, "untrusted");
  assert.strictEqual(trust.trust_records[0].requested_trust_status, "trusted");
}));

test("pairing request approval promotes trust and permissions", () => withTempRepo(() => {
  wifiLanGovernance.mapWifiNode({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-node-001",
    project: "project-001",
    machine: "machine-001",
    node_type: "developer_machine",
    hostname: "NODE-1",
    owner_approved: false
  }, {}, () => {});
  const requested = wifiLanGovernance.requestWifiPairing({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-node-001",
    owner_id: "owner-001",
    requested_by: "owner-001",
    allowed_projects: ["project-001"],
    allowed_capabilities: ["read_project_state", "receive_task_packet"],
    denied_capabilities: ["modify_secrets"]
  }, {}, () => {});
  const approved = wifiLanGovernance.approveWifiPairing({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-node-001",
    allowed_projects: ["project-001"],
    allowed_capabilities: ["read_project_state", "receive_task_packet"],
    denied_capabilities: ["modify_secrets"]
  }, {}, () => {});

  assert.strictEqual(requested.pairing_request.approval_status, "requested");
  assert.strictEqual(approved.pairing_request.approval_status, "approved");
  const trust = wifiLanGovernance.buildWifiTrustStatusReport({ wifi_node_id: "wifi-node-001" });
  assert.strictEqual(trust.trust_records[0].trust_status, "trusted");
  const permissions = wifiLanGovernance.buildWifiPermissionsReport({ wifi_node_id: "wifi-node-001" });
  assert.strictEqual(permissions.permissions.length, 1);
  assert.strictEqual(permissions.permissions[0].allowed_capabilities.includes("read_project_state"), true);
}));

test("an untrusted Wi-Fi node is blocked", () => withTempRepo(() => {
  wifiLanGovernance.mapWifiNode({
    wifi_node_id: "wifi-node-untrusted",
    governance_node_id: "gov-node-untrusted",
    project: "project-001",
    machine: "machine-001",
    node_type: "unknown_node",
    hostname: "UNKNOWN"
  }, {}, () => {});
  const report = wifiLanGovernance.evaluateWifiPolicy({
    wifi_node_id: "wifi-node-untrusted",
    governance_node_id: "gov-node-untrusted",
    path: "src/app/page.ts",
    action: "write_project_files"
  }, {}, () => {});
  assert.strictEqual(report.decision, "block");
  assert.match(report.reason, /untrusted/i);
}));

test("issuing a Wi-Fi task token and file lease persists runtime state", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  trustedWifiNode("wifi-node-001");
  const token = wifiLanGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    allowed_paths: ["src/shared/file.ts"],
    denied_paths: ["src/shared/secret.ts"],
    allowed_actions: ["read_project_state", "write_project_files"]
  }, {}, () => {});
  const lease = wifiLanGovernance.createWifiLease({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    lease_type: "file",
    scope: "src/shared/file.ts",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});

  assert.strictEqual(token.wifi_task_token.status, "active");
  assert.strictEqual(lease.lease.status, "active");
  const tokenState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_task_tokens.json");
  const leaseState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_leases.json");
  assert.strictEqual(tokenState.tokens.length, 1);
  assert.strictEqual(leaseState.leases.length, 1);
}));

test("same-file Wi-Fi lease conflicts are detected across nodes", () => withTempRepo(() => {
  trustedWifiNode("wifi-node-a");
  trustedWifiNode("wifi-node-b");
  wifiLanGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-a",
    governance_node_id: "gov-wifi-node-a",
    task: "task-001",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  wifiLanGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-b",
    governance_node_id: "gov-wifi-node-b",
    task: "task-002",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  const first = wifiLanGovernance.createWifiLease({
    wifi_node_id: "wifi-node-a",
    governance_node_id: "gov-wifi-node-a",
    task: "task-001",
    lease_type: "file",
    scope: "src/shared/file.ts",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  const second = wifiLanGovernance.createWifiLease({
    wifi_node_id: "wifi-node-b",
    governance_node_id: "gov-wifi-node-b",
    task: "task-002",
    lease_type: "file",
    scope: "src/shared/file.ts",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});

  assert.strictEqual(first.status, "ok");
  assert.strictEqual(second.status, "blocked");
  assert.ok(second.conflicts.some((item) => item.conflict_type === "same_file"));
}));

test("Wi-Fi leases conflict with Case 2 local project leases", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  registerLocalLease(process.env.KVDF_REPO_ROOT, "src/shared/file.ts");
  trustedWifiNode("wifi-node-001");
  wifiLanGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  const report = wifiLanGovernance.createWifiLease({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    lease_type: "file",
    scope: "src/shared/file.ts",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  assert.strictEqual(report.status, "blocked");
  assert.ok(report.conflicts.some((item) => item.conflict_type === "local_lease_conflict"));
}));

test("Wi-Fi policy blocks denied paths and denied actions", () => withTempRepo(() => {
  trustedWifiNode("wifi-node-001", {
    denied_capabilities: ["modify_secrets"]
  });
  wifiLanGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    allowed_paths: ["src/shared/file.ts"],
    denied_paths: ["src/shared/secret.ts"],
    denied_actions: ["modify_secrets"]
  }, {}, () => {});
  const deniedPath = wifiLanGovernance.evaluateWifiPolicy({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    path: "src/shared/secret.ts",
    action: "write_project_files"
  }, {}, () => {});
  const deniedAction = wifiLanGovernance.evaluateWifiPolicy({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    path: "src/shared/file.ts",
    action: "modify_secrets"
  }, {}, () => {});
  assert.strictEqual(deniedPath.decision, "block");
  assert.strictEqual(deniedAction.decision, "block");
}));

test("unguarded Wi-Fi packets are warned and recorded", () => withTempRepo(() => {
  trustedWifiNode("wifi-node-001");
  const report = wifiLanGovernance.evaluateWifiPolicy({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    packet_id: "wifi-packet-001",
    path: "src/shared/file.ts",
    action: "receive_task_packet"
  }, {}, () => {});
  assert.strictEqual(report.decision, "warn");
  const ungoverned = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_ungoverned_packets.json");
  assert.strictEqual(ungoverned.packets.length, 1);
}));

test("high-risk Wi-Fi actions require owner approval", () => withTempRepo(() => {
  trustedWifiNode("wifi-node-001");
  wifiLanGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  const report = wifiLanGovernance.evaluateWifiPolicy({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    path: ".kabeeri/owner_auth.json",
    action: "write_project_files"
  }, {}, () => {});
  assert.strictEqual(report.decision, "require_owner_approval");
  assert.strictEqual(report.requires_owner_approval, true);
  const approvals = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_approval_requests.json");
  assert.strictEqual(approvals.requests.length, 1);
}));

test("Wi-Fi audit records capture governance actions", () => withTempRepo(() => {
  trustedWifiNode("wifi-node-001");
  wifiLanGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  wifiLanGovernance.createWifiLease({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    lease_type: "file",
    scope: "src/shared/file.ts",
    allowed_paths: ["src/shared/file.ts"]
  }, {}, () => {});
  wifiLanGovernance.evaluateWifiPolicy({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    path: "src/shared/file.ts",
    action: "write_project_files"
  }, {}, () => {});
  const audit = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/wifi_audit_log.json");
  assert.ok(audit.records.some((item) => item.event_type === "wifi.node.mapped"));
  assert.ok(audit.records.some((item) => item.event_type === "wifi.pair.requested"));
  assert.ok(audit.records.some((item) => item.event_type === "wifi.pair.approved"));
  assert.ok(audit.records.some((item) => item.event_type === "wifi.token.issued"));
  assert.ok(audit.records.some((item) => item.event_type === "wifi.lease.created"));
  assert.ok(audit.records.some((item) => item.event_type === "wifi.policy.decision"));
}));

test("Case 1 and Case 2 remain usable alongside Case 3", () => withTempRepo(() => {
  const ide = ideGovernance.registerIdeWindowSession({
    window: "ide-window-001",
    workspace: "workspace-001",
    project: "project-001",
    task: "task-001",
    owner: "owner-001",
    repo_root: process.env.KVDF_REPO_ROOT,
    status: "active"
  }, {}, () => {});
  const local = localGovernance.registerLocalProject({
    project: "project-001",
    owner: "owner-001",
    repo_root: process.env.KVDF_REPO_ROOT
  }, {}, () => {});
  assert.strictEqual(ide.report_type, "multi_ai_ide_window_registered");
  assert.strictEqual(local.report_type, "multi_ai_local_project_registered");
  assert.strictEqual(typeof bootstrap.buildMultiAiWifiStatusReport, "function");
}));
