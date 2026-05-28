const { getPluginRuntimeStatus } = require("../../../src/cli/services/plugin_loader");
const { loadPluginBootstrap } = require("../../../src/cli/services/plugin_mounts");

function isWifiDataSharingAvailable() {
  const plugin = getPluginRuntimeStatus("wifi_data_sharing");
  return Boolean(plugin && plugin.available && plugin.enabled);
}

function getWifiDataSharingProvider() {
  if (!isWifiDataSharingAvailable()) return null;
  const bootstrap = loadPluginBootstrap("wifi_data_sharing", { allowSourceFallback: true });
  return bootstrap && (bootstrap.providerApi || bootstrap.provider) ? (bootstrap.providerApi || bootstrap.provider) : null;
}

function buildWifiDataSharingIntegrationStatus() {
  const provider = getWifiDataSharingProvider();
  if (!provider) {
    return buildUnavailableIntegrationStatus();
  }
  const providerInfo = typeof provider.getProviderInfo === "function" ? provider.getProviderInfo() : null;
  const trustedNodes = typeof provider.listTrustedNodes === "function" ? provider.listTrustedNodes() : [];
  const bootstrapPeers = typeof provider.listBootstrapPeers === "function" ? provider.listBootstrapPeers() : [];
  const localNode = typeof provider.getLocalNode === "function" ? provider.getLocalNode() : null;
  return {
    report_type: "multi_ai_wifi_data_sharing_integration",
    plugin_id: "multi_ai_governance",
    dependency_plugin_id: "wifi_data_sharing",
    status: "available",
    available: true,
    provider: providerInfo,
    local_node: localNode,
    trusted_nodes_count: Array.isArray(trustedNodes) ? trustedNodes.length : 0,
    bootstrap_peers_count: Array.isArray(bootstrapPeers) ? bootstrapPeers.length : 0,
    next_action: "Use the wifi data sharing provider to create, send, and review local governance packets."
  };
}

function listTrustedWifiNodes() {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.listTrustedNodes !== "function") return [];
  return provider.listTrustedNodes();
}

function listWifiDataSharingCandidates() {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.listCandidates !== "function") return [];
  return provider.listCandidates();
}

function listWifiDataSharingBootstrapPeers() {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.listBootstrapPeers !== "function") return [];
  return provider.listBootstrapPeers();
}

function listWifiDataSharingInbox() {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.listInbox !== "function") return [];
  return provider.listInbox({ limit: 100 });
}

function refreshWifiDataSharingDiscovery(mode = "discover", flags = {}) {
  const bootstrap = loadPluginBootstrap("wifi_data_sharing", { allowSourceFallback: true });
  if (!bootstrap) {
    return {
      status: "blocked",
      available: false,
      next_action: "wifi_data_sharing is not available."
    };
  }
  const discovery = bootstrap.discovery;
  if (!discovery) {
    return {
      status: "blocked",
      available: false,
      next_action: "wifi_data_sharing discovery commands are unavailable."
    };
  }
  const startAndForget = (task) => {
    if (!task || typeof task.then !== "function") return null;
    task.catch(() => {});
    return task;
  };
  const buildStartedReport = (currentMode, nextAction, extras = {}) => ({
    status: "ok",
    available: true,
    mode: currentMode,
    discovery_started: Boolean(extras.discover_started),
    advertise_started: Boolean(extras.advertise_started),
    candidates: listWifiDataSharingCandidates(),
    trusted_nodes: listTrustedWifiNodes(),
    next_action: nextAction,
    ...extras
  });
  if (mode === "master") {
    const advertiseResult = typeof discovery.runAdvertiseCommand === "function"
      ? startAndForget(discovery.runAdvertiseCommand(flags))
      : null;
    const discoverResult = typeof discovery.runDiscoverCommand === "function"
      ? startAndForget(discovery.runDiscoverCommand(flags))
      : null;
    return buildStartedReport(mode, "The master laptop advertises itself and scans for trusted worker nodes.", {
      advertise_started: Boolean(advertiseResult),
      discover_started: Boolean(discoverResult),
      advertise_result: advertiseResult ? { status: "started", mode: "advertise" } : null,
      discover_result: discoverResult ? { status: "started", mode: "discover" } : null
    });
  }
  if (mode === "worker") {
    const discoverResult = typeof discovery.runDiscoverCommand === "function"
      ? startAndForget(discovery.runDiscoverCommand(flags))
      : null;
    const advertiseResult = typeof discovery.runAdvertiseCommand === "function"
      ? startAndForget(discovery.runAdvertiseCommand(flags))
      : null;
    return buildStartedReport(mode, "The worker laptop advertises itself, discovers the master laptop, and waits for a trusted join.", {
      discover_started: Boolean(discoverResult),
      advertise_started: Boolean(advertiseResult),
      discover_result: discoverResult ? { status: "started", mode: "discover" } : null,
      advertise_result: advertiseResult ? { status: "started", mode: "advertise" } : null
    });
  }
  if (mode === "advertise" && typeof discovery.runAdvertiseCommand === "function") {
    const advertiseResult = startAndForget(discovery.runAdvertiseCommand(flags));
    return buildStartedReport(mode, "The node advertises itself on Wi-Fi/LAN.", {
      advertise_started: Boolean(advertiseResult),
      advertise_result: advertiseResult ? { status: "started", mode: "advertise" } : null
    });
  }
  if (mode === "discover" && typeof discovery.runDiscoverCommand === "function") {
    const discoverResult = startAndForget(discovery.runDiscoverCommand(flags));
    return buildStartedReport(mode, "The node scans the LAN for trusted candidates.", {
      discover_started: Boolean(discoverResult),
      discover_result: discoverResult ? { status: "started", mode: "discover" } : null
    });
  }
  if (typeof discovery.runDiscoverCommand === "function") {
    const discoverResult = startAndForget(discovery.runDiscoverCommand(flags));
    return buildStartedReport("discover", "The node scans the LAN for trusted candidates.", {
      discover_started: Boolean(discoverResult),
      discover_result: discoverResult ? { status: "started", mode: "discover" } : null
    });
  }
  return {
    status: "blocked",
    available: false,
    next_action: "wifi_data_sharing discovery commands are unavailable."
  };
}

function sendWorkerJoinRequest(packet, targetNodeId, options = {}) {
  return sendWorkerSessionPacket("worker_join_request", packet, targetNodeId, options);
}

function sendWorkerHeartbeat(packet, targetNodeId, options = {}) {
  return sendWorkerSessionPacket("worker_heartbeat", packet, targetNodeId, options);
}

function sendWorkerResult(packet, targetNodeId, options = {}) {
  return sendWorkerSessionPacket("worker_result", packet, targetNodeId, options);
}

function sendWorkerSessionPacket(packetType, packet, targetNodeId, options = {}) {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.canSendPackage !== "function" || typeof provider.createPackage !== "function" || (typeof provider.sendPackage !== "function" && typeof provider.sendBootstrapPacket !== "function")) {
    return {
      status: "blocked",
      available: false,
      next_action: "wifi_data_sharing is not available."
    };
  }
  const payload = normalizeWorkerSessionPacket(packetType, packet);
  const bootstrapPacket = ["worker_join_request", "worker_heartbeat", "worker_result"].includes(String(packetType || "").trim().toLowerCase());
  const packageDescriptor = {
    packet_type: packetType,
    title: payload.title,
    payload,
    payload_encoding: "json"
  };
  const allowed = provider.canSendPackage(packageDescriptor, targetNodeId, {
    ...options,
    bootstrap: bootstrapPacket || Boolean(options.bootstrap)
  });
  if (!allowed || allowed.status === "blocked" || allowed.can_send === false) {
    return allowed || {
      status: "blocked",
      can_send: false,
      next_action: `The ${packetType} cannot be sent.`
    };
  }
  const created = provider.createPackage({
    packageType: packetType,
    title: payload.title,
    payload,
    payloadEncoding: "json"
  }, {
    ...options,
    bootstrap: bootstrapPacket || Boolean(options.bootstrap)
  });
  if (!created || created.status === "blocked") return created;
  if (bootstrapPacket && !targetNodeId && typeof provider.sendBootstrapPacket === "function") {
    return provider.sendBootstrapPacket(created.package.package_id, targetNodeId, {
      ...options,
      confirm: true
    });
  }
  if (typeof provider.sendPackage !== "function") {
    return {
      status: "blocked",
      available: false,
      next_action: `The ${packetType} cannot be sent.`
    };
  }
  return provider.sendPackage(created.package.package_id, targetNodeId, {
    ...options,
    bootstrap: bootstrapPacket || Boolean(options.bootstrap)
  });
}

function normalizeWorkerJoinRequest(packet = {}) {
  return normalizeWorkerSessionPacket("worker_join_request", packet);
}

function normalizeWorkerSessionPacket(packetType, packet = {}) {
  const payload = packet && typeof packet === "object" ? packet : {};
  const normalizedType = String(packetType || "worker_session").trim().toLowerCase();
  return {
    report_type: `multi_ai_evolution_${normalizedType}`,
    title: payload.title || `Evolution ${normalizedType.replace(/_/g, " ")}`,
    request_id: payload.request_id || null,
    session_role: payload.session_role || "worker",
    session_id: payload.session_id || null,
    packet_type: normalizedType,
    worker_ai_ids: Array.isArray(payload.worker_ai_ids) ? payload.worker_ai_ids.slice() : [],
    worker_pool: payload.worker_pool && typeof payload.worker_pool === "object" ? { ...payload.worker_pool } : null,
    assignment_signature: payload.assignment_signature || null,
    assignment_id: payload.assignment_id || null,
    worker_prompt: payload.worker_prompt || null,
    ready_flag: payload.ready_flag === undefined ? true : Boolean(payload.ready_flag),
    source_machine: payload.source_machine && typeof payload.source_machine === "object" ? { ...payload.source_machine } : null,
    result_status: payload.result_status || null,
    result_summary: payload.result_summary || null,
    result_artifacts: Array.isArray(payload.result_artifacts) ? payload.result_artifacts.slice() : [],
    changed_files: Array.isArray(payload.changed_files) ? payload.changed_files.slice() : [],
    tests: Array.isArray(payload.tests) ? payload.tests.slice() : [],
    requested_at: payload.requested_at || new Date().toISOString(),
    status: payload.status || "requested"
  };
}

function canSendGovernancePacket(packet, targetNodeId, options = {}) {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.canSendPackage !== "function") {
    return {
      status: "blocked",
      available: false,
      can_send: false,
      next_action: "wifi_data_sharing is not available."
    };
  }
  const packageDescriptor = normalizeGovernancePacket(packet);
  return provider.canSendPackage(packageDescriptor, targetNodeId, options);
}

function sendGovernancePacket(packet, targetNodeId, options = {}) {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.createPackage !== "function" || typeof provider.sendPackage !== "function") {
    return {
      status: "blocked",
      available: false,
      next_action: "wifi_data_sharing is not available."
    };
  }
  const packageInput = normalizeGovernancePacket(packet);
  const created = provider.createPackage({
    packageType: packageInput.package_type,
    title: packageInput.title,
    payload: packageInput.payload,
    payload_encoding: packageInput.payload_encoding
  }, options);
  if (!created || created.status === "blocked") return created;
  return provider.sendPackage(created.package.package_id, targetNodeId, options);
}

function normalizeGovernancePacket(packet) {
  const payload = packet && Object.prototype.hasOwnProperty.call(packet, "payload") ? packet.payload : packet || {};
  const packetType = String(packet && (packet.packet_type || packet.package_type) ? (packet.packet_type || packet.package_type) : "generic_json").trim().toLowerCase();
  return {
    package_type: packetType,
    title: packet && packet.title ? String(packet.title) : String(packetType || "governance packet"),
    payload,
    payload_encoding: packet && packet.payload_encoding ? packet.payload_encoding : "json",
    package_id: packet && (packet.package_id || packet.packet_id) ? String(packet.package_id || packet.packet_id) : null,
    sha256: packet && packet.sha256 ? String(packet.sha256) : null
  };
}

function buildUnavailableIntegrationStatus() {
  return {
    report_type: "multi_ai_wifi_data_sharing_integration",
    plugin_id: "multi_ai_governance",
    dependency_plugin_id: "wifi_data_sharing",
    status: "unavailable",
    available: false,
    provider: null,
    local_node: null,
    trusted_nodes_count: 0,
    next_action: "Install or enable wifi_data_sharing to use LAN packet transport."
  };
}

module.exports = {
  isWifiDataSharingAvailable,
  getWifiDataSharingProvider,
  buildWifiDataSharingIntegrationStatus,
  listTrustedWifiNodes,
  listWifiDataSharingCandidates,
  listWifiDataSharingBootstrapPeers,
  listWifiDataSharingInbox,
  refreshWifiDataSharingDiscovery,
  sendWorkerJoinRequest,
  sendWorkerHeartbeat,
  sendWorkerResult,
  canSendGovernancePacket,
  sendGovernancePacket,
  buildUnavailableIntegrationStatus,
  normalizeGovernancePacket,
  normalizeWorkerSessionPacket
};
