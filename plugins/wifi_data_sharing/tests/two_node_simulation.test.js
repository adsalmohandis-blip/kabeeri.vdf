const assert = require("assert");
const fs = require("fs");
const path = require("path");

const simulate = require("../commands/simulate");
const harness = require("../simulation/two_node_harness");

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

test("simulation command module exports the phase 9 entry points", () => {
  assert.strictEqual(typeof simulate.wifiDataSharingSimulate, "function");
  assert.strictEqual(typeof simulate.buildWifiDataSharingSimulationReport, "function");
  assert.strictEqual(typeof simulate.buildTransferStressReport, "function");
  assert.strictEqual(typeof simulate.buildSecuritySimulationReport, "function");
});

test("two-node harness creates isolated temp states", () => {
  const workspace = harness.createSimulationWorkspace();
  try {
    const nodeA = harness.initializeNode(workspace.nodeARoot, { name: "Owner Laptop", role: "owner" });
    const nodeB = harness.initializeNode(workspace.nodeBRoot, { name: "Worker Laptop", role: "worker" });
    assert.ok(/^wifi-node-[0-9a-f]{12}$/.test(nodeA.local_node.node_id));
    assert.ok(/^wifi-node-[0-9a-f]{12}$/.test(nodeB.local_node.node_id));
    assert.notStrictEqual(nodeA.local_node.node_id, nodeB.local_node.node_id);
    assert.ok(fs.existsSync(path.join(workspace.nodeARoot, ".kabeeri", "wifi_data_sharing.json")));
    assert.ok(fs.existsSync(path.join(workspace.nodeBRoot, ".kabeeri", "wifi_data_sharing.json")));
    const readA = harness.readNodeState(workspace.nodeARoot);
    const readB = harness.readNodeState(workspace.nodeBRoot);
    assert.strictEqual(readA.local_node.display_name, "Owner Laptop");
    assert.strictEqual(readB.local_node.display_name, "Worker Laptop");
  } finally {
    workspace.cleanup();
  }
});

test("pairing flow works in simulation", () => {
  const workspace = harness.createSimulationWorkspace();
  try {
    const nodeA = harness.initializeNode(workspace.nodeARoot, { name: "Owner Laptop", role: "owner" });
    const nodeB = harness.initializeNode(workspace.nodeBRoot, { name: "Worker Laptop", role: "worker" });
    harness.recordDiscoveryOnTarget(
      workspace.nodeARoot,
      harness.buildDiscoveryCandidateFromState(nodeB),
      harness.createDiscoveryMessageForNode(nodeB, "announce"),
      { address: "127.0.0.1", port: 47632 },
      "discover"
    );
    harness.recordDiscoveryOnTarget(
      workspace.nodeBRoot,
      harness.buildDiscoveryCandidateFromState(nodeA),
      harness.createDiscoveryMessageForNode(nodeA, "announce"),
      { address: "127.0.0.1", port: 47632 },
      "discover"
    );
    const resultA = harness.runPairingFlow(workspace.nodeARoot, nodeB.local_node.node_id);
    const resultB = harness.runPairingFlow(workspace.nodeBRoot, nodeA.local_node.node_id);
    assert.notStrictEqual(resultA.create.status, "blocked");
    assert.notStrictEqual(resultB.create.status, "blocked");
    const trustedA = harness.readNodeState(workspace.nodeARoot).trusted_nodes || [];
    const trustedB = harness.readNodeState(workspace.nodeBRoot).trusted_nodes || [];
    assert.ok(trustedA.some((entry) => entry.node_id === nodeB.local_node.node_id && entry.trust_status === "trusted"));
    assert.ok(trustedB.some((entry) => entry.node_id === nodeA.local_node.node_id && entry.trust_status === "trusted"));
  } finally {
    workspace.cleanup();
  }
});

test("package hash, inbox, and quarantine lifecycle work in simulation", () => {
  const report = harness.runTwoNodeSimulation({ keep: false });
  assert.strictEqual(report.report_type, "wifi_data_sharing_two_node_simulation");
  assert.ok(["pass", "warn"].includes(report.status));
  assert.ok(report.package && /^wifi-pkg-/.test(report.package.package_id));
  assert.ok(report.package.sha256);
  assert.ok(report.transfer && report.transfer.transfer_id);
  assert.ok(report.security && report.security.status !== "blocked");
  assert.ok(report.inbox && report.inbox.package_id === report.package.package_id);
  assert.ok(report.steps.some((step) => step.step_id === "package_receive" && step.status === "pass"));
  assert.ok(report.steps.some((step) => step.step_id === "inbox_accept" && step.status === "pass"));
});

test("security simulation blocks suspicious content", () => {
  const report = harness.runSecuritySimulation({ keep: false });
  assert.strictEqual(report.report_type, "wifi_data_sharing_security_simulation");
  assert.strictEqual(report.status, "pass");
  assert.ok(report.security && report.security.status === "blocked");
  assert.ok(report.steps.some((step) => step.step_id === "suspicious_package_security" && step.status === "pass"));
});

test("wifi data sharing package dependency is not added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});
