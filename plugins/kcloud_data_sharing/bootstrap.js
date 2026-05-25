const runtime = require("./src/index");

module.exports = {
  plugin_id: "kcloud_data_sharing",
  name: "KCloud Data Sharing",
  command_entrypoint: "plugins/kcloud_data_sharing/bootstrap.js",
  runtime_entrypoint: "plugins/kcloud_data_sharing/bootstrap.js",
  kcloudDataSharing: runtime.kcloudDataSharing,
  command: runtime.kcloudDataSharing,
  runtime,
  buildKcloudDataSharingStatusReport: runtime.buildKcloudStatusReport,
  buildKcloudDataSharingInitReport: runtime.initKcloudConfig,
  renderKcloudDataSharingReport: runtime.renderKcloudReport
};
