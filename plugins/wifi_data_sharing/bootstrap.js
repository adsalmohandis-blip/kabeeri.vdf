const runtime = require("./commands/wifi_data_sharing");
const state = require("./commands/state");
const discovery = require("./commands/discovery");
const pairing = require("./commands/pairing");
const trustedNodes = require("./commands/trusted_nodes");
const transfer = require("./commands/transfer");
const inbox = require("./commands/inbox");
const securityGate = require("./commands/security_gate");
const quarantine = require("./commands/quarantine");
const outbox = require("./commands/outbox");
const retry = require("./commands/retry");
const apply = require("./commands/apply");
const applied = require("./commands/applied");
const health = require("./commands/health");
const release = require("./commands/release");
const backup = require("./commands/backup");
const restore = require("./commands/restore");
const provider = require("./commands/provider");
const readiness = require("./commands/readiness");
const dashboard = require("./commands/dashboard");
const audit = require("./commands/audit");
const evidence = require("./commands/evidence");
const simulate = require("./commands/simulate");
const providerApi = require("./provider");

module.exports = {
  plugin_id: "wifi_data_sharing",
  name: "Wi-Fi Data Sharing",
  command_entrypoint: "plugins/wifi_data_sharing/bootstrap.js",
  runtime_entrypoint: "plugins/wifi_data_sharing/bootstrap.js",
  providerApi,
  wifiDataSharing: runtime.wifiDataSharing,
  state,
  discovery,
  pairing,
  trustedNodes,
  transfer,
  inbox,
  securityGate,
  quarantine,
  outbox,
  retry,
  apply,
  applied,
  health,
  release,
  backup,
  restore,
  provider,
  readiness,
  dashboard,
  audit,
  evidence,
  simulate,
  getProviderInfo: providerApi.getProviderInfo,
  ensureState: providerApi.ensureState,
  getLocalNode: providerApi.getLocalNode,
  listCandidates: providerApi.listCandidates,
  listTrustedNodes: providerApi.listTrustedNodes,
  canSendPackage: providerApi.canSendPackage,
  createPackage: providerApi.createPackage,
  sendPackage: providerApi.sendPackage,
  listInbox: providerApi.listInbox,
  getPackage: providerApi.getPackage,
  buildWifiDataSharingProviderReport: providerApi.buildProviderReport,
  buildWifiDataSharingReadinessReport: providerApi.buildReadinessReport,
  buildWifiDataSharingStatusReport: runtime.buildWifiDataSharingStatusReport,
  buildWifiDataSharingPolicyReport: runtime.buildWifiDataSharingPolicyReport,
  buildWifiDataSharingStateReport: runtime.buildWifiDataSharingStateReport,
  buildWifiDataSharingCandidatesReport: runtime.buildWifiDataSharingCandidatesReport,
  buildWifiDataSharingPairingReport: pairing.buildPairingReport,
  buildWifiDataSharingTrustedNodesReport: trustedNodes.buildTrustedNodesReport,
  buildWifiDataSharingPackagesReport: transfer.buildPackagesReport,
  buildWifiDataSharingInboxReport: inbox.buildInboxReport,
  buildWifiDataSharingSecurityReport: securityGate.buildSecurityResultsReport,
  buildWifiDataSharingQuarantineReport: quarantine.buildQuarantineReport,
  buildWifiDataSharingOutboxReport: outbox.buildOutboxReport,
  buildWifiDataSharingTransferSessionsReport: retry.buildTransferSessionsReport,
  buildWifiDataSharingApplyReport: apply.buildApplyReport,
  buildWifiDataSharingAppliedReport: applied.buildAppliedReport,
  buildWifiDataSharingHealthReport: health.buildHealthReport,
  buildWifiDataSharingReleaseReport: release.buildReleaseReport,
  buildWifiDataSharingIntegrityReport: release.buildIntegrityReport,
  buildWifiDataSharingBackupReport: backup.buildBackupReport,
  buildWifiDataSharingRestoreReport: restore.buildRestoreReport,
  buildWifiDataSharingTransfersReport: transfer.buildTransfersReport,
  buildWifiDataSharingServerReport: transfer.buildServerReport,
  buildWifiDataSharingProviderReport: provider.buildProviderReport,
  buildWifiDataSharingReadinessReport: readiness.buildReadinessReport,
  buildWifiDataSharingDashboardReport: dashboard.buildDashboardReport,
  buildWifiDataSharingAuditReport: audit.buildAuditReport,
  buildWifiDataSharingEvidenceReport: evidence.buildEvidenceReport,
  buildWifiDataSharingSimulationReport: simulate.buildWifiDataSharingSimulationReport,
  buildWifiDataSharingTwoNodeSimulationReport: simulate.buildTwoNodeSimulationReport,
  buildWifiDataSharingTransferStressReport: simulate.buildTransferStressReport,
  buildWifiDataSharingSecuritySimulationReport: simulate.buildSecuritySimulationReport
};
