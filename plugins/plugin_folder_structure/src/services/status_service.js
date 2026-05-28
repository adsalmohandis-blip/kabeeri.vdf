const { STATUS_MESSAGE } = require("../core/constants");

function buildStatusReport(context = {}) {
  const track = context.track || "owner";
  return {
    report_type: "plugin_folder_structure_status",
    plugin_id: "plugin_folder_structure",
    generated_at: new Date().toISOString(),
    track,
    status: "ready",
    target_message: STATUS_MESSAGE[track] || STATUS_MESSAGE.owner,
    owner_direct_plugin_creation: true,
    plugin_dev_workspace_creation: true,
    viber_blocked: true,
    marketplace_published: false,
    owner_direct_install_allowed: true,
    plugin_dev_marketplace_upload: "request_only"
  };
}

function renderStatusReport(report) {
  return [
    "Plugin Folder Structure Status",
    `Track: ${report.track}`,
    report.target_message,
    `Marketplace publishing by plugin_folder_structure: ${report.marketplace_published}`,
    `Plugin Development Track marketplace upload: ${report.plugin_dev_marketplace_upload}`,
    `Owner Track direct local plugin creation: ${report.owner_direct_install_allowed}`,
    `Viber/App Track plugin creation: ${report.viber_blocked ? "blocked" : "allowed"}`
  ].join("\n");
}

module.exports = {
  buildStatusReport,
  renderStatusReport
};
