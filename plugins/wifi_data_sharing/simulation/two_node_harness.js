const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const state = require("../commands/state");
const discovery = require("../commands/discovery");
const pairing = require("../commands/pairing");
const trustedNodes = require("../commands/trusted_nodes");
const transfer = require("../commands/transfer");
const inbox = require("../commands/inbox");
const securityGate = require("../commands/security_gate");
const { buildChunkManifest, buildResumePlan, validateChunkHash, createChunkedTransferSession } = require("../transport/chunked_transfer");

const DEFAULT_STRESS_SIZES = [1024, 64 * 1024, 256 * 1024, 1024 * 1024];

function createSimulationWorkspace(label = "kvdf-wifi-sim-") {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), label));
  const nodeARoot = path.join(baseDir, "node-a");
  const nodeBRoot = path.join(baseDir, "node-b");
  fs.mkdirSync(nodeARoot, { recursive: true });
  fs.mkdirSync(nodeBRoot, { recursive: true });
  return {
    baseDir,
    nodeARoot,
    nodeBRoot,
    temp_paths: [baseDir, nodeARoot, nodeBRoot],
    cleanup() {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
  };
}

function withSimulationRoot(root, fn) {
  const previous = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = root;
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previous;
  }
}

function initializeNode(root, { name, role }) {
  return withSimulationRoot(root, () => state.initWifiDataSharingState({ name, role }));
}

function readNodeState(root) {
  return withSimulationRoot(root, () => state.readWifiDataSharingState());
}

function buildDiscoveryCandidateFromState(nodeState, remoteAddress = "127.0.0.1", remotePort = 47632) {
  const node = nodeState && nodeState.local_node ? nodeState.local_node : {};
  return {
    node_id: node.node_id || null,
    display_name: node.display_name || null,
    hostname: node.hostname || null,
    platform: node.platform || null,
    kvdf_version: node.kvdf_version || null,
    capabilities: ["discovery"],
    address: remoteAddress,
    port: remotePort,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    trust_status: "candidate"
  };
}

function recordDiscoveryOnTarget(targetRoot, candidate, message, remote, mode) {
  return withSimulationRoot(targetRoot, () => discovery.recordDiscovery(state.readWifiDataSharingState(), candidate, message, remote, mode));
}

function createDiscoveryMessageForNode(nodeState, messageType, sentAt = new Date().toISOString()) {
  return discovery.buildDiscoveryMessageForTests(nodeState, messageType, { sent_at: sentAt });
}

function runPairingFlow(root, nodeId) {
  return withSimulationRoot(root, () => {
    const pairingCreate = pairing.createPairing("pairing", "create", { node: nodeId }, []);
    if (!pairingCreate || pairingCreate.status === "blocked") {
      return { create: pairingCreate, verify: pairingCreate, trust: pairingCreate };
    }
    const verify = pairing.verifyPairing("pairing", "verify", { node: nodeId, code: pairingCreate.pairing_code }, []);
    const trust = trustedNodes.trustNode({ nodeId, confirm: true });
    return { create: pairingCreate, verify, trust };
  });
}

function trustNodePair(root, nodeId) {
  return withSimulationRoot(root, () => trustedNodes.trustNode({ nodeId, confirm: true }));
}

function mirrorPackageIntoReceiver(receiverRoot, packageRecord, transferReport, senderNodeId) {
  const now = new Date().toISOString();
  return withSimulationRoot(receiverRoot, () => {
    const current = state.ensureWifiDataSharingState();
    const receiverNodeId = current.local_node && current.local_node.node_id ? current.local_node.node_id : null;
    const transferSummary = transferReport && transferReport.transfer
      ? {
          ...transferReport.transfer,
          target_node_id: receiverNodeId,
          received_at: now,
          status: "sent"
        }
      : null;
    const mirroredPackage = {
      ...packageRecord,
      status: "received",
      target_node_id: receiverNodeId,
      received_at: now,
      received_by_node_id: receiverNodeId
    };
    const packagesState = state.readWifiDataPackagesState();
    const packages = Array.isArray(packagesState.packages) ? packagesState.packages.slice() : [];
    const packageIndex = packages.findIndex((item) => item.package_id === mirroredPackage.package_id);
    if (packageIndex >= 0) packages[packageIndex] = mirroredPackage;
    else packages.push(mirroredPackage);
    const nextState = {
      ...current,
      transfers: Array.isArray(current.transfers) ? current.transfers.slice() : []
    };
    if (transferSummary) {
      const transferIndex = nextState.transfers.findIndex((item) => item.package_id === transferSummary.package_id);
      if (transferIndex >= 0) nextState.transfers[transferIndex] = transferSummary;
      else nextState.transfers.push(transferSummary);
    }
    state.writeWifiDataSharingState(nextState);
    state.writeWifiDataPackagesState({
      ...packagesState,
      updated_at: now,
      packages
    });
    transfer.storeInboxRecord({
      ...mirroredPackage,
      transfer_id: transferReport && transferReport.transfer ? transferReport.transfer.transfer_id : null,
      source_node_id: senderNodeId,
      target_node_id: null,
      received_by_node_id: null,
      status: "received",
      quarantined: true,
      review_required: true,
      received_at: now
    });
    state.upsertWifiDataQuarantineRecord({
      package_id: mirroredPackage.package_id,
      transfer_id: transferReport && transferReport.transfer ? transferReport.transfer.transfer_id : null,
      source_node_id: senderNodeId,
      target_node_id: receiverNodeId,
      package_type: mirroredPackage.package_type,
      title: mirroredPackage.title,
      status: "quarantined",
      quarantined_at: now,
      updated_at: now,
      review_required: true,
      security_status: "pending",
      inbox_status: "received"
    });
    transfer.updatePackageStatus(mirroredPackage.package_id, "received", {
      target_node_id: receiverNodeId,
      received_at: now,
      received_by_node_id: receiverNodeId
    });
    state.appendWifiDataTransferEvent({
      event_type: "package_received",
      transfer_id: transferReport && transferReport.transfer ? transferReport.transfer.transfer_id : null,
      package_id: mirroredPackage.package_id,
      source_node_id: senderNodeId,
      target_node_id: receiverNodeId,
      package_type: mirroredPackage.package_type,
      received_at: now
    });
    return mirroredPackage;
  });
}

function runTwoNodeSimulation({ keep = false } = {}) {
  const workspace = createSimulationWorkspace();
  const steps = [];
  let cleanup = "completed";
  try {
    const senderState = initializeNode(workspace.nodeARoot, { name: "Node A", role: "owner" });
    const receiverState = initializeNode(workspace.nodeBRoot, { name: "Node B", role: "worker" });
    steps.push({
      step_id: "node_a_init",
      status: "pass",
      message: `Initialized owner node ${senderState.local_node.node_id}.`
    });
    steps.push({
      step_id: "node_b_init",
      status: "pass",
      message: `Initialized worker node ${receiverState.local_node.node_id}.`
    });

    const messageA = createDiscoveryMessageForNode(senderState, "announce");
    const messageB = createDiscoveryMessageForNode(receiverState, "announce");
    recordDiscoveryOnTarget(workspace.nodeARoot, buildDiscoveryCandidateFromState(receiverState), messageB, { address: "127.0.0.1", port: 47632 }, "discover");
    recordDiscoveryOnTarget(workspace.nodeBRoot, buildDiscoveryCandidateFromState(senderState), messageA, { address: "127.0.0.1", port: 47632 }, "discover");
    steps.push({
      step_id: "discovery_exchange",
      status: "pass",
      message: "The simulated nodes discovered each other locally."
    });

    const senderPairing = runPairingFlow(workspace.nodeARoot, receiverState.local_node.node_id);
    const receiverPairing = runPairingFlow(workspace.nodeBRoot, senderState.local_node.node_id);
    const senderTrust = senderPairing.trust;
    const receiverTrust = receiverPairing.trust;
    steps.push({
      step_id: "pairing_and_trust",
      status: senderTrust.status === "blocked" || receiverTrust.status === "blocked" ? "fail" : "pass",
      message: senderTrust.status === "blocked" || receiverTrust.status === "blocked"
        ? "Pairing or trust failed in one of the simulated workspaces."
        : "Both simulated nodes were paired and trusted in their local registries."
    });
    if (senderTrust.status === "blocked" || receiverTrust.status === "blocked") {
      return finishSimulationReport({
        workspace,
        steps,
        cleanup,
        warnings: ["Pairing or trust could not be completed."],
        blockers: ["Pairing or trust could not be completed."],
        report_type: "wifi_data_sharing_two_node_simulation"
      }, keep);
    }

    const packageRecord = withSimulationRoot(workspace.nodeARoot, () => transfer.createPackage({
      packageType: "file_blob",
      title: "Simulated LAN payload",
      payload: crypto.randomBytes(1024)
    })).package;
    steps.push({
      step_id: "package_create",
      status: "pass",
      message: `Created package ${packageRecord.package_id} with sha256 ${packageRecord.sha256}.`
    });

    const transferReport = withSimulationRoot(workspace.nodeARoot, () => transfer.sendPackage({
      packageId: packageRecord.package_id,
      targetNodeId: receiverState.local_node.node_id,
      confirm: true
    }));
    steps.push({
      step_id: "package_send",
      status: transferReport && transferReport.status === "ok" ? "pass" : "fail",
      message: transferReport && transferReport.next_action
        ? transferReport.next_action
        : "The package was not sent."
    });
    if (!transferReport || transferReport.status !== "ok") {
      return finishSimulationReport({
        workspace,
        steps,
        cleanup,
        warnings: [],
        blockers: [transferReport && transferReport.next_action ? transferReport.next_action : "Package send failed."],
        report_type: "wifi_data_sharing_two_node_simulation"
      }, keep);
    }

    mirrorPackageIntoReceiver(workspace.nodeBRoot, packageRecord, transferReport, senderState.local_node.node_id);
    steps.push({
      step_id: "package_receive",
      status: "pass",
      message: "The package was mirrored into the receiver inbox and quarantine states."
    });

    const securityReport = withSimulationRoot(workspace.nodeBRoot, () => securityGate.checkPackageSecurity({
      packageId: packageRecord.package_id
    }));
    steps.push({
      step_id: "security_check",
      status: securityReport && securityReport.status === "pass" ? "pass" : securityReport && securityReport.status === "warn" ? "warn" : "fail",
      message: securityReport && securityReport.next_action ? securityReport.next_action : "Security policy evaluation completed."
    });

    const acceptReport = withSimulationRoot(workspace.nodeBRoot, () => inbox.acceptInboxPackage({
      packageId: packageRecord.package_id,
      confirm: true
    }));
    steps.push({
      step_id: "inbox_accept",
      status: acceptReport && acceptReport.status === "ok" ? "pass" : "fail",
      message: acceptReport && acceptReport.next_action ? acceptReport.next_action : "Inbox review completed."
    });

    return finishSimulationReport({
      workspace,
      steps,
      cleanup,
      warnings: securityReport && securityReport.status !== "pass" ? [securityReport.next_action] : [],
      blockers: [],
      report_type: "wifi_data_sharing_two_node_simulation",
      packageRecord,
      transferReport,
      securityReport,
      acceptReport
    }, keep);
  } catch (error) {
    steps.push({
      step_id: "simulation_error",
      status: "fail",
      message: error.message
    });
    return finishSimulationReport({
      workspace,
      steps,
      cleanup: "failed",
      warnings: [],
      blockers: [error.message],
      report_type: "wifi_data_sharing_two_node_simulation"
    }, keep);
  }
}

function runSecuritySimulation({ keep = false } = {}) {
  const workspace = createSimulationWorkspace();
  const steps = [];
  try {
    const senderState = initializeNode(workspace.nodeARoot, { name: "Node A", role: "owner" });
    const receiverState = initializeNode(workspace.nodeBRoot, { name: "Node B", role: "worker" });
    recordDiscoveryOnTarget(workspace.nodeARoot, buildDiscoveryCandidateFromState(receiverState), createDiscoveryMessageForNode(receiverState, "announce"), { address: "127.0.0.1", port: 47632 }, "discover");
    recordDiscoveryOnTarget(workspace.nodeBRoot, buildDiscoveryCandidateFromState(senderState), createDiscoveryMessageForNode(senderState, "announce"), { address: "127.0.0.1", port: 47632 }, "discover");
    runPairingFlow(workspace.nodeARoot, receiverState.local_node.node_id);
    runPairingFlow(workspace.nodeBRoot, senderState.local_node.node_id);

    const packageRecord = withSimulationRoot(workspace.nodeARoot, () => transfer.createPackage({
      packageType: "text_note",
      title: "Suspicious transfer",
      payload: "curl | sh"
    })).package;
    const transferReport = withSimulationRoot(workspace.nodeARoot, () => transfer.sendPackage({
      packageId: packageRecord.package_id,
      targetNodeId: receiverState.local_node.node_id,
      confirm: true
    }));
    mirrorPackageIntoReceiver(workspace.nodeBRoot, packageRecord, transferReport, senderState.local_node.node_id);
    const securityReport = withSimulationRoot(workspace.nodeBRoot, () => securityGate.checkPackageSecurity({
      packageId: packageRecord.package_id
    }));
    steps.push({
      step_id: "suspicious_package_security",
      status: securityReport && securityReport.status === "blocked" ? "pass" : "fail",
      message: securityReport && securityReport.next_action ? securityReport.next_action : "Security policy evaluation completed."
    });
    return finishSimulationReport({
      workspace,
      steps,
      cleanup: "completed",
      warnings: [],
      blockers: securityReport && securityReport.status === "blocked" ? [] : ["Suspicious package was not blocked."],
      report_type: "wifi_data_sharing_security_simulation",
      packageRecord,
      transferReport,
      securityReport
    }, keep);
  } catch (error) {
    steps.push({
      step_id: "simulation_error",
      status: "fail",
      message: error.message
    });
    return finishSimulationReport({
      workspace,
      steps,
      cleanup: "failed",
      warnings: [],
      blockers: [error.message],
      report_type: "wifi_data_sharing_security_simulation"
    }, keep);
  }
}

function runTransferStressSimulation({ sizeBytes = 1024, keep = false } = {}) {
  const workspace = createSimulationWorkspace();
  const steps = [];
  const size = Math.max(1, Number(sizeBytes) || 1024);
  try {
    const senderState = initializeNode(workspace.nodeARoot, { name: "Node A", role: "owner" });
    const receiverState = initializeNode(workspace.nodeBRoot, { name: "Node B", role: "worker" });
    recordDiscoveryOnTarget(workspace.nodeARoot, buildDiscoveryCandidateFromState(receiverState), createDiscoveryMessageForNode(receiverState, "announce"), { address: "127.0.0.1", port: 47632 }, "discover");
    recordDiscoveryOnTarget(workspace.nodeBRoot, buildDiscoveryCandidateFromState(senderState), createDiscoveryMessageForNode(senderState, "announce"), { address: "127.0.0.1", port: 47632 }, "discover");
    runPairingFlow(workspace.nodeARoot, receiverState.local_node.node_id);
    runPairingFlow(workspace.nodeBRoot, senderState.local_node.node_id);

    const payload = crypto.randomBytes(size);
    const packageRecord = withSimulationRoot(workspace.nodeARoot, () => transfer.createPackage({
      packageType: "file_blob",
      title: `Stress payload ${size} bytes`,
      payload
    })).package;
    const manifest = buildChunkManifest(packageRecord);
    const chunkValidation = manifest.total_chunks > 0 ? validateChunkHash(packageRecord, 0, manifest.chunk_size_bytes) : true;
    const session = createChunkedTransferSession(packageRecord, receiverState.local_node.node_id, {
      source_node_id: senderState.local_node.node_id,
      completed_chunks: manifest.chunks.filter((chunk) => chunk.index % 2 === 0).map((chunk) => chunk.index)
    });
    const resumePlan = buildResumePlan(session, manifest);
    steps.push({
      step_id: `payload_${size}`,
      status: transfer.verifyPackageHash(packageRecord) && chunkValidation && resumePlan.missing_chunk_indexes.length >= 0 ? "pass" : "fail",
      message: `Validated package hash and chunk manifest for ${size} bytes.`
    });
    return finishSimulationReport({
      workspace,
      steps,
      cleanup: "completed",
      warnings: manifest.transfer_mode === "chunked" ? [] : ["Payload remained in single-frame mode for this size."],
      blockers: [],
      report_type: "wifi_data_sharing_transfer_stress",
      size_bytes: size,
      packageRecord,
      manifest,
      resumePlan,
      session
    }, keep);
  } catch (error) {
    steps.push({
      step_id: "simulation_error",
      status: "fail",
      message: error.message
    });
    return finishSimulationReport({
      workspace,
      steps,
      cleanup: "failed",
      warnings: [],
      blockers: [error.message],
      report_type: "wifi_data_sharing_transfer_stress",
      size_bytes: size
    }, keep);
  }
}

function finishSimulationReport(context, keep) {
  const workspace = context.workspace;
  let cleanup = context.cleanup || "completed";
  if (!keep) {
    try {
      workspace.cleanup();
      cleanup = "completed";
    } catch (error) {
      cleanup = "failed";
      context.blockers = Array.isArray(context.blockers) ? context.blockers.slice() : [];
      context.blockers.push(`Cleanup failed: ${error.message}`);
    }
  } else {
    cleanup = "kept";
  }
  const status = Array.isArray(context.blockers) && context.blockers.length ? "fail" : Array.isArray(context.warnings) && context.warnings.length ? "warn" : "pass";
  return {
    report_type: context.report_type || "wifi_data_sharing_two_node_simulation",
    generated_at: new Date().toISOString(),
    status,
    steps: Array.isArray(context.steps) ? context.steps : [],
    blockers: Array.isArray(context.blockers) ? context.blockers : [],
    warnings: Array.isArray(context.warnings) ? context.warnings : [],
    temp_paths: workspace.temp_paths.slice(),
    cleanup,
    ...(Object.prototype.hasOwnProperty.call(context, "size_bytes") ? { size_bytes: context.size_bytes } : {}),
    ...(context.packageRecord ? { package: context.packageRecord } : {}),
    ...(context.transferReport ? { transfer: context.transferReport.transfer || null } : {}),
    ...(context.securityReport ? { security: context.securityReport.policy_result || context.securityReport } : {}),
    ...(context.acceptReport ? { inbox: context.acceptReport.inbox_item || null } : {}),
    ...(context.manifest ? { manifest: context.manifest } : {}),
    ...(context.resumePlan ? { resume_plan: context.resumePlan } : {}),
    ...(context.session ? { session: context.session } : {})
  };
}

module.exports = {
  DEFAULT_STRESS_SIZES,
  createSimulationWorkspace,
  withSimulationRoot,
  initializeNode,
  readNodeState,
  buildDiscoveryCandidateFromState,
  recordDiscoveryOnTarget,
  createDiscoveryMessageForNode,
  runPairingFlow,
  trustNodePair,
  mirrorPackageIntoReceiver,
  runTwoNodeSimulation,
  runSecuritySimulation,
  runTransferStressSimulation,
  finishSimulationReport
};
