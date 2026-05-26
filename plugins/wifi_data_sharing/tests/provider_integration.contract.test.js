const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const provider = require("../provider");
const state = require("../commands/state");
const transfer = require("../commands/transfer");
const udpDiscovery = require("../transport/udp_discovery");
const multiAiBootstrap = require("../../multi_ai_governance/bootstrap");
const wifiClientPath = "../../multi_ai_governance/integrations/wifi_data_sharing_client";

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-provider-"));
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

test("provider exports all required functions", () => {
  assert.strictEqual(typeof provider.getProviderInfo, "function");
  assert.strictEqual(typeof provider.ensureState, "function");
  assert.strictEqual(typeof provider.getLocalNode, "function");
  assert.strictEqual(typeof provider.listCandidates, "function");
  assert.strictEqual(typeof provider.listTrustedNodes, "function");
  assert.strictEqual(typeof provider.canSendPackage, "function");
  assert.strictEqual(typeof provider.createPackage, "function");
  assert.strictEqual(typeof provider.sendPackage, "function");
  assert.strictEqual(typeof provider.listInbox, "function");
  assert.strictEqual(typeof provider.getPackage, "function");
  assert.strictEqual(typeof provider.buildProviderReport, "function");
  assert.strictEqual(typeof provider.buildReadinessReport, "function");
});

test("provider report works with empty state", () => withTempRepo(() => {
  const report = provider.buildProviderReport();
  assert.strictEqual(report.report_type, "wifi_data_sharing_provider");
  assert.strictEqual(report.summary.local_node_initialized, false);
  assert.strictEqual(report.summary.candidates_count, 0);
  assert.strictEqual(report.summary.trusted_nodes_count, 0);
  assert.ok(Array.isArray(report.warnings));
  assert.ok(fs.existsSync(path.join(process.env.KVDF_REPO_ROOT, ".kabeeri", "reports", "wifi_data_sharing_provider.json")));
}));

test("canSendPackage blocks untrusted node", () => withTempRepo((dir) => {
  state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  const input = path.join(dir, "payload.json");
  fs.writeFileSync(input, JSON.stringify({ hello: "world" }, null, 2), "utf8");
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  const report = provider.canSendPackage(created.package, "wifi-node-unknown");
  assert.strictEqual(report.status, "blocked");
  assert.strictEqual(report.can_send, false);
  assert.match(report.next_action, /trusted/i);
}));

test("canSendPackage blocks revoked node", () => withTempRepo((dir) => {
  const current = state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  state.writeWifiDataSharingState({
    ...current,
    trusted_nodes: [
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
  const input = path.join(dir, "payload.json");
  fs.writeFileSync(input, JSON.stringify({ hello: "world" }, null, 2), "utf8");
  const created = transfer.createPackage({ packageType: "generic_json", inputPath: input, title: "Example" });
  const report = provider.canSendPackage(created.package, "wifi-node-revoked-001");
  assert.strictEqual(report.status, "blocked");
  assert.strictEqual(report.can_send, false);
}));

test("worker join bootstrap packets can target a discovered master without pre-existing trust", () => withTempRepo((dir) => {
  const current = state.initWifiDataSharingState({ name: "Worker Laptop", role: "worker" });
  state.writeWifiDataSharingState({
    ...current,
    discovery: {
      ...(current.discovery || {}),
      enabled: true,
      mode: "advertise",
      known_candidates: [
        {
          node_id: "wifi-node-master",
          display_name: "Master Laptop",
          hostname: "MASTER",
          platform: "win32",
          trust_role: "owner",
          trust_status: "candidate",
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString()
        }
      ]
    },
    trusted_nodes: []
  });
  const joinPacket = transfer.createPackage({
    packageType: "worker_join_request",
    title: "Worker join request",
    payload: {
      report_type: "multi_ai_evolution_worker_join_request",
      session_id: "session-001",
      sender_node_id: current.local_node.node_id,
      target_node_id: "wifi-node-master",
      ready_flag: true
    },
    payloadEncoding: "json"
  });
  const blocked = provider.canSendPackage(joinPacket.package, "wifi-node-master");
  assert.strictEqual(blocked.status, "blocked");
  assert.match(blocked.next_action, /trusted/i);
  const allowed = provider.canSendPackage(joinPacket.package, "wifi-node-master", { bootstrap: true });
  assert.ok(["pass", "warn"].includes(allowed.status));
  assert.strictEqual(allowed.can_send, true);
  assert.strictEqual(allowed.bootstrap_packet, true);
  const sent = provider.sendPackage(joinPacket.package.package_id, "wifi-node-master", { bootstrap: true, confirm: true });
  assert.strictEqual(sent.status, "ok");
}));

test("worker join bootstrap packets can be broadcast without a discovered master target", () => withTempRepo((dir) => {
  const current = state.initWifiDataSharingState({ name: "Worker Laptop", role: "worker" });
  const input = path.join(dir, "payload.json");
  fs.writeFileSync(input, JSON.stringify({ ready: true }, null, 2), "utf8");
  const created = transfer.createPackage({
    packageType: "worker_join_request",
    inputPath: input,
    title: "Worker join request"
  });
  const report = provider.canSendPackage(created.package, null, { bootstrap: true });
  assert.ok(["pass", "warn"].includes(report.status));
  assert.strictEqual(report.can_send, true);
  assert.strictEqual(report.bootstrap_packet, true);
  assert.strictEqual(report.target_node_id, null);
  const sent = provider.sendPackage(created.package.package_id, null, { bootstrap: true, confirm: true, loopback: true });
  assert.strictEqual(sent.status, "ok");
}));

test("discovery targets include subnet-directed broadcast addresses when interface broadcast is missing", () => {
  const originalInterfaces = os.networkInterfaces;
  os.networkInterfaces = () => ({
    WiFi: [
      {
        address: "192.168.1.5",
        netmask: "255.255.255.0",
        family: "IPv4",
        mac: "ec:63:d7:db:88:f5",
        internal: false,
        cidr: "192.168.1.5/24"
      }
    ]
  });
  try {
    const targets = udpDiscovery.resolveDiscoveryTargets();
    assert.ok(targets.some((item) => item && item.host === "192.168.1.255"));
  } finally {
    os.networkInterfaces = originalInterfaces;
  }
});

test("discovery subnet probes include local-subnet host addresses when broadcast is insufficient", () => {
  const probes = udpDiscovery.computeIpv4SubnetProbeAddresses("192.168.1.5", "255.255.255.0");
  assert.ok(Array.isArray(probes));
  assert.ok(probes.includes("192.168.1.1"));
  assert.ok(!probes.includes("192.168.1.5"));
});

test("multi_ai_governance manifest has optional wifi_data_sharing integration", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "multi_ai_governance", "plugin.json"), "utf8"));
  const optional = Array.isArray(manifest.optional_integrations) ? manifest.optional_integrations : [];
  assert.ok(optional.some((item) => item.plugin_id === "wifi_data_sharing"));
});

test("multi_ai_governance client returns unavailable safely when plugin missing", () => {
  const client = require(wifiClientPath);
  const previousCwd = process.cwd();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-client-missing-"));
  try {
    process.chdir(tempDir);
    assert.strictEqual(client.isWifiDataSharingAvailable(), false);
    const status = client.buildWifiDataSharingIntegrationStatus();
    assert.strictEqual(status.status, "unavailable");
    assert.strictEqual(status.available, false);
    assert.doesNotThrow(() => client.listTrustedWifiNodes());
    assert.doesNotThrow(() => client.canSendGovernancePacket({ packet_type: "assignment_packet", payload: { hello: "world" } }, "wifi-node-unknown"));
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("no hard dependency introduced", () => {
  assert.strictEqual(Object.prototype.hasOwnProperty.call(multiAiBootstrap, "wifiDataSharingClient"), true);
  assert.strictEqual(typeof multiAiBootstrap.wifiDataSharingClient.buildWifiDataSharingIntegrationStatus, "function");
});

test("no package dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
