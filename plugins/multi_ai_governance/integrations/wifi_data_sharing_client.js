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
    next_action: "Use the wifi data sharing provider to create, send, and review local governance packets."
  };
}

function listTrustedWifiNodes() {
  const provider = getWifiDataSharingProvider();
  if (!provider || typeof provider.listTrustedNodes !== "function") return [];
  return provider.listTrustedNodes();
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
  canSendGovernancePacket,
  sendGovernancePacket,
  buildUnavailableIntegrationStatus,
  normalizeGovernancePacket
};
