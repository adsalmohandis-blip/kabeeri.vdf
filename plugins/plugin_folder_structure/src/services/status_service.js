function buildStatusReport() {
  return {
    report_type: "plugin_folder_structure_status",
    plugin_id: "plugin_folder_structure",
    generated_at: new Date().toISOString(),
    standard_plugin_structure: "one",
    owner_track_target: "./plugins/<plugin-slug>/",
    plugin_dev_track_target: "./workspaces/plugins/<plugin-slug>/04_plugin_package/",
    canonical_full_set_enabled: true,
    actual_candidate_plugin_package: "./workspaces/plugins/<plugin-slug>/04_plugin_package/",
    canonical_package_folder: "04_plugin_package",
    previous_package_folder: "03_plugin_package",
    removed_redundant_source_folder: true,
    viber_track_plugin_creation: "blocked",
    deep_nested_plugin_root: "disabled",
    marketplace_publish_by_plugin_folder_structure: false,
    owner_approval_required_for_plugin_dev_promotion: true,
    compact_backward_compatibility: true
  };
}

function renderStatusReport(report) {
  return [
    "Plugin Folder Structure Status",
    `standard_plugin_structure: ${report.standard_plugin_structure}`,
    `owner_track_target: ${report.owner_track_target}`,
    `plugin_dev_track_target: ${report.plugin_dev_track_target}`,
    `canonical_full_set_enabled: ${report.canonical_full_set_enabled}`,
    `actual_candidate_plugin_package: ${report.actual_candidate_plugin_package}`,
    `canonical_package_folder: ${report.canonical_package_folder}`,
    `previous_package_folder: ${report.previous_package_folder}`,
    `removed_redundant_source_folder: ${report.removed_redundant_source_folder}`,
    `Viber/App Track plugin creation: ${report.viber_track_plugin_creation}`,
    `viber_track_plugin_creation: ${report.viber_track_plugin_creation}`,
    `deep_nested_plugin_root: ${report.deep_nested_plugin_root}`,
    `marketplace_publish_by_plugin_folder_structure: ${report.marketplace_publish_by_plugin_folder_structure}`,
    `owner_approval_required_for_plugin_dev_promotion: ${report.owner_approval_required_for_plugin_dev_promotion}`,
    `compact_backward_compatibility: ${report.compact_backward_compatibility}`
  ].join("\n");
}

module.exports = {
  buildStatusReport,
  renderStatusReport
};

