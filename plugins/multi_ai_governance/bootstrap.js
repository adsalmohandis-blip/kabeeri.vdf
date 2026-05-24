const governance = require("./commands/multi_ai_governance");
const communications = require("./commands/multi_ai_communications");
const wifiPackets = require("./commands/wifi_packets");
const wifiDataSharingClient = require("./integrations/wifi_data_sharing_client");

module.exports = {
  plugin_id: "multi_ai_governance",
  name: "Multi-AI Governance Bundle",
  command_entrypoint: "plugins/multi_ai_governance/bootstrap.js",
  runtime_entrypoint: null,
  multiAiGovernance: governance.multiAiGovernance,
  multiAiCommunications: communications.multiAiCommunications,
  wifiPackets,
  governance,
  communications,
  wifiDataSharingClient,
  buildMultiAiWifiStatusReport: wifiPackets.buildWifiStatusReport,
  buildMultiAiWifiNodesReport: wifiPackets.buildWifiNodesReport,
  buildMultiAiWifiPacketCreateReport: wifiPackets.buildWifiPacketCreateReport,
  buildMultiAiWifiPacketSendReport: wifiPackets.buildWifiPacketSendReport,
  buildMultiAiWifiPacketInboxReport: wifiPackets.buildWifiPacketInboxReport,
  buildMultiAiWifiPacketInspectReport: wifiPackets.buildWifiPacketInspectReport,
  buildMultiAiWifiPacketConsumeReport: wifiPackets.buildWifiPacketConsumeReport,
  buildMultiAiWifiPacketWorkflowReport: wifiPackets.buildWifiPacketWorkflowReport,
  renderMultiAiWifiPacketReport: wifiPackets.renderWifiPacketsReport
};
