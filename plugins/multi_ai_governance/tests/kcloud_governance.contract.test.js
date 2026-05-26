const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const kcloudGovernance = require("../commands/kcloud_governance");
const localGovernance = require("../commands/local_project_governance");
const wifiGovernance = require("../commands/wifi_lan_governance");
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-kcloud-"));
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

function registerLocalProject() {
  return localGovernance.registerLocalProject({
    project: "project-001",
    owner: "owner-001",
    repo_root: process.env.KVDF_REPO_ROOT
  }, {}, () => {});
}

function registerLocalLease(scope = "src/local/conflict.ts") {
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

function setupTrustedCloudNode({ nodeId = "cloud-node-001", projectId = "project-001", pathScope = "src/cloud/allowed.ts", actions = ["read_cloud_project_state"], deniedActions = [], approvalRequired = false, createLease = true } = {}) {
  kcloudGovernance.mapKcloudNode({
    kcloud_node_id: nodeId,
    governance_cloud_node_id: `gov-${nodeId}`,
    tenant_id: "tenant-001",
    organization_id: "org-001",
    project_id: projectId,
    cloud_project_id: "cloud-project-001",
    local_project_id: projectId,
    owner_id: "owner-001",
    user_id: "user-001",
    role_id: "reviewer",
    kcloud_peer_id: `${nodeId}-peer`,
    trust_status: "trusted",
    owner_approved: true,
    capabilities: ["read_cloud_project_state", "receive_cloud_task_packet"]
  }, () => {});

  kcloudGovernance.mapKcloudProject({
    cloud_project_id: "cloud-project-001",
    project_id: projectId,
    local_project_id: projectId,
    tenant_id: "tenant-001",
    organization_id: "org-001",
    owner_id: "owner-001",
    user_id: "user-001",
    role_id: "reviewer"
  }, () => {});

  kcloudGovernance.grantKcloudPermission({
    tenant_id: "tenant-001",
    organization_id: "org-001",
    project_id: projectId,
    cloud_project_id: "cloud-project-001",
    kcloud_node_id: nodeId,
    user_id: "user-001",
    role_id: "reviewer",
    task_id: "task-001",
    allowed_actions: actions,
    denied_actions: deniedActions,
    allowed_paths: [pathScope],
    denied_paths: [],
    allowed_cloud_channels: ["channel-a"],
    denied_cloud_channels: [],
    risk_level: approvalRequired ? "high" : "medium",
    approval_required: approvalRequired,
    status: "active"
  }, () => {});

  kcloudGovernance.issueKcloudTaskToken({
    kcloud_node_id: nodeId,
    tenant_id: "tenant-001",
    project_id: projectId,
    task_id: "task-001",
    agent_id: "agent-codex-001",
    tool_id: "codex",
    allowed_actions: actions,
    denied_actions: deniedActions,
    allowed_paths: [pathScope],
    denied_paths: [],
    max_runtime_seconds: 3600,
    max_cost: 5,
    risk_level: approvalRequired ? "high" : "medium",
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  }, () => {});

  if (createLease) {
    kcloudGovernance.createKcloudLease({
      kcloud_node_id: nodeId,
      task_id: "task-001",
      lease_type: "file",
      scope: pathScope,
      branch: "kcloud/TASK-001-cloud-fix",
      cloud_channel: "channel-a",
      allowed_paths: [pathScope],
      denied_paths: [],
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }, () => {});
  }
}

test("bootstrap exposes kcloud governance", () => {
  assert.ok(bootstrap.kcloudGovernance);
  assert.strictEqual(typeof bootstrap.buildMultiAiKcloudStatusReport, "function");
  assert.strictEqual(typeof bootstrap.renderMultiAiKcloudReport, "function");
});

test("multi-ai router routes kcloud status", () => withTempRepo(() => {
  const report = kcloudGovernance.multiAiKcloudGovernance("kcloud", "status", {}, [], {});
  assert.strictEqual(report.report_type, "multi_ai_kcloud_status");
}));

test("registering a cloud node and project persists governance state", () => withTempRepo(() => {
  const node = kcloudGovernance.mapKcloudNode({
    kcloud_node_id: "cloud-node-001",
    governance_cloud_node_id: "gov-cloud-node-001",
    tenant_id: "tenant-001",
    organization_id: "org-001",
    project_id: "project-001",
    cloud_project_id: "cloud-project-001",
    local_project_id: "project-001",
    owner_id: "owner-001",
    user_id: "user-001",
    role_id: "reviewer",
    kcloud_peer_id: "peer-001",
    trust_status: "trusted",
    owner_approved: true,
    capabilities: ["read_cloud_project_state"]
  }, () => {});
  const project = kcloudGovernance.mapKcloudProject({
    cloud_project_id: "cloud-project-001",
    project_id: "project-001",
    local_project_id: "project-001",
    tenant_id: "tenant-001",
    organization_id: "org-001",
    owner_id: "owner-001",
    user_id: "user-001",
    role_id: "reviewer"
  }, () => {});

  assert.strictEqual(node.kcloud_node.kcloud_node_id, "cloud-node-001");
  assert.strictEqual(project.mapping.cloud_project_id, "cloud-project-001");
  const nodesState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/kcloud_nodes.json");
  const projectMapState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/kcloud_project_map.json");
  assert.strictEqual(nodesState.nodes.length, 1);
  assert.strictEqual(projectMapState.project_mappings.length, 1);
}));

test("trusted cloud node can be granted permission and issue a token", () => withTempRepo(() => {
  registerLocalProject();
  setupTrustedCloudNode({ pathScope: "src/cloud/allowed.ts" });
  const permissions = kcloudGovernance.buildKcloudPermissionsReport({ kcloud_node_id: "cloud-node-001" });
  const tokens = kcloudGovernance.buildKcloudTokenStatusReport({ kcloud_node_id: "cloud-node-001" });
  assert.strictEqual(permissions.permissions.length, 1);
  assert.strictEqual(tokens.tokens.length, 1);
}));

test("cloud policy allows a permitted action and writes evidence", () => withTempRepo(() => {
  registerLocalProject();
  setupTrustedCloudNode({ pathScope: "src/cloud/allowed.ts" });
  const report = kcloudGovernance.evaluateKcloudPolicy({
    kcloud_node_id: "cloud-node-001",
    task_id: "task-001",
    action: "read_cloud_project_state",
    path: "src/cloud/allowed.ts",
    branch: "kcloud/TASK-001-cloud-fix",
    cloud_channel: "channel-a",
    packet_id: "packet-allow-001"
  }, () => {});
  assert.strictEqual(report.decision, "allow");
  assert.ok(report.evidence_id);
  const policyState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/kcloud_policy_decisions.json");
  const evidenceState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/kcloud_evidence.json");
  assert.ok(policyState.decisions.length >= 1);
  assert.ok(evidenceState.evidence.length >= 1);
}));

test("cloud policy blocks denied actions and denied paths", () => withTempRepo(() => {
  registerLocalProject();
  setupTrustedCloudNode({ pathScope: "src/cloud/allowed.ts", actions: ["read_cloud_project_state"], deniedActions: ["modify_secrets"] });
  const report = kcloudGovernance.evaluateKcloudPolicy({
    kcloud_node_id: "cloud-node-001",
    task_id: "task-001",
    action: "modify_secrets",
    path: ".env",
    branch: "kcloud/TASK-001-cloud-fix",
    cloud_channel: "channel-a",
    packet_id: "packet-deny-001"
  }, () => {});
  assert.strictEqual(report.decision, "block");
  assert.match(report.reason, /denied/i);
  const ungoverned = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/kcloud_ungoverned_packets.json");
  assert.strictEqual(ungoverned.packets.length >= 1, true);
}));

test("cloud policy warns when the packet is ungoverned by a lease", () => withTempRepo(() => {
  registerLocalProject();
  kcloudGovernance.mapKcloudNode({
    kcloud_node_id: "cloud-node-001",
    governance_cloud_node_id: "gov-cloud-node-001",
    tenant_id: "tenant-001",
    project_id: "project-001",
    local_project_id: "project-001",
    owner_id: "owner-001",
    trust_status: "trusted",
    owner_approved: true
  }, () => {});
  kcloudGovernance.grantKcloudPermission({
    tenant_id: "tenant-001",
    project_id: "project-001",
    cloud_project_id: "cloud-project-001",
    kcloud_node_id: "cloud-node-001",
    task_id: "task-001",
    allowed_actions: ["read_cloud_project_state"],
    allowed_paths: ["src/cloud/ungoverned.ts"],
    allowed_cloud_channels: ["channel-a"],
    risk_level: "medium",
    status: "active"
  }, () => {});
  kcloudGovernance.issueKcloudTaskToken({
    kcloud_node_id: "cloud-node-001",
    tenant_id: "tenant-001",
    project_id: "project-001",
    task_id: "task-001",
    allowed_actions: ["read_cloud_project_state"],
    allowed_paths: ["src/cloud/ungoverned.ts"],
    allowed_cloud_channels: ["channel-a"],
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  }, () => {});
  const report = kcloudGovernance.evaluateKcloudPolicy({
    kcloud_node_id: "cloud-node-001",
    task_id: "task-001",
    action: "read_cloud_project_state",
    path: "src/cloud/ungoverned.ts",
    branch: "kcloud/TASK-001-cloud-fix",
    cloud_channel: "channel-a",
    packet_id: "packet-warn-001",
    require_lease: true
  }, () => {});
  assert.strictEqual(report.decision, "warn");
  assert.match(report.reason, /lease/i);
}));

test("high-risk cloud actions require owner approval", () => withTempRepo(() => {
  registerLocalProject();
  setupTrustedCloudNode({ pathScope: "src/cloud/high-risk.ts", actions: ["trigger_deployment"], approvalRequired: true });
  const report = kcloudGovernance.evaluateKcloudPolicy({
    kcloud_node_id: "cloud-node-001",
    task_id: "task-001",
    action: "trigger_deployment",
    path: "src/cloud/high-risk.ts",
    branch: "kcloud/TASK-001-cloud-fix",
    cloud_channel: "channel-a",
    packet_id: "packet-approval-001"
  }, () => {});
  assert.strictEqual(report.decision, "require_owner_approval");
  const approvals = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/kcloud_approval_requests.json");
  assert.strictEqual(approvals.requests.length >= 1, true);
}));

test("cloud conflicts detect local and Wi-Fi lease collisions", () => withTempRepo(() => {
  registerLocalProject();
  registerLocalLease("src/shared/conflict.ts");
  wifiGovernance.mapWifiNode({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    project: "project-001",
    machine: "machine-001",
    node_type: "developer_machine",
    hostname: "WIFI",
    owner_approved: true,
    capabilities: ["read_project_state"]
  }, {}, () => {});
  wifiGovernance.requestWifiPairing({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    owner_id: "owner-001",
    requested_by: "owner-001",
    allowed_projects: ["project-001"],
    allowed_capabilities: ["read_project_state", "receive_task_packet", "send_task_result"]
  }, {}, () => {});
  wifiGovernance.approveWifiPairing({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    allowed_projects: ["project-001"],
    allowed_capabilities: ["read_project_state", "receive_task_packet", "send_task_result"]
  }, {}, () => {});
  wifiGovernance.issueWifiTaskToken({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task: "task-001",
    allowed_paths: ["src/shared/conflict.ts"],
    denied_paths: [],
    allowed_actions: ["receive_task_packet"],
    allowed_devices: [],
    allowed_services: [],
    allowed_ports: [],
    risk_level: "medium"
  }, {}, () => {});
  wifiGovernance.createWifiLease({
    wifi_node_id: "wifi-node-001",
    governance_node_id: "gov-wifi-node-001",
    task_id: "task-001",
    lease_type: "file",
    scope: "src/shared/conflict.ts",
    allowed_paths: ["src/shared/conflict.ts"]
  }, {}, () => {});

  setupTrustedCloudNode({ pathScope: "src/shared/conflict.ts", createLease: false });
  const report = kcloudGovernance.evaluateKcloudPolicy({
    kcloud_node_id: "cloud-node-001",
    task_id: "task-001",
    action: "read_cloud_project_state",
    path: "src/shared/conflict.ts",
    branch: "kcloud/TASK-001-cloud-fix",
    cloud_channel: "channel-a",
    packet_id: "packet-conflict-001"
  }, () => {});
  assert.strictEqual(report.decision, "block");
  const conflictState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/kcloud_conflicts.json");
  assert.strictEqual(conflictState.conflicts.length >= 1, true);
}));

test("bootstrap keeps case 1 to case 3 governance exports available", () => {
  assert.ok(bootstrap.ideWindowGovernance);
  assert.ok(bootstrap.localProjectGovernance);
  assert.ok(bootstrap.wifiLanGovernance);
});
