const { PLUGIN_ID, PLUGIN_NAME, PLUGIN_TRACK, PLUGIN_VERSION, APP_WORKSPACE_ROOT, SOURCE_PLUGIN, PROFILE_VERSION } = require("../core/constants");
const { listCategories } = require("../core/category_registry");

function buildStatusReport(context = {}, deps = {}) {
  const categoryCount = listCategories().length;
  return {
    report_type: "app_folder_structure_status",
    plugin_id: PLUGIN_ID,
    plugin_name: PLUGIN_NAME,
    plugin_version: PLUGIN_VERSION,
    track: PLUGIN_TRACK,
    generated_at: new Date().toISOString(),
    standard_plugin_structure: "one",
    workspace_root: `./${APP_WORKSPACE_ROOT}/<app-slug>/`,
    canonical_pipeline: [
      "00_viber_inputs",
      "01_category",
      "02_roadmaps_plans",
      "03_full_specifications",
      "04_version_control",
      "05_evolutions",
      "06_task_punches",
      "07_agents",
      "08_source",
      "09_tests_quality",
      "10_evidence_audit",
      "11_reviews_approvals",
      "12_releases_deployment",
      "13_owner_portal",
      "99_archive"
    ],
    source_plugin: SOURCE_PLUGIN,
    category_profiles_available: categoryCount,
    profile_version: PROFILE_VERSION,
    create_command: "kvdf app-folder create --app <app-slug> --category <category>",
    validate_command: "kvdf app-folder validate --app <app-slug>",
    repair_command: "kvdf app-folder repair --app <app-slug>",
    manifest_command: "kvdf app-folder manifest --app <app-slug>",
    print_command: "kvdf app-folder print --category <category>",
    viber_track_plugin_creation: false,
    marketplace_publish_by_app_folder_structure: false,
    owner_approval_required_for_promotion: true
  };
}

function renderStatusReport(report) {
  return [
    "App Folder Structure Status",
    `plugin_id: ${report.plugin_id}`,
    `plugin_name: ${report.plugin_name}`,
    `plugin_version: ${report.plugin_version}`,
    `track: ${report.track}`,
    `standard_plugin_structure: ${report.standard_plugin_structure}`,
    `workspace_root: ${report.workspace_root}`,
    `source_plugin: ${report.source_plugin}`,
    `category_profiles_available: ${report.category_profiles_available}`,
    `profile_version: ${report.profile_version}`,
    `viber_track_plugin_creation: ${report.viber_track_plugin_creation}`,
    `marketplace_publish_by_app_folder_structure: ${report.marketplace_publish_by_app_folder_structure}`,
    `owner_approval_required_for_promotion: ${report.owner_approval_required_for_promotion}`
  ].join("\n");
}

module.exports = {
  buildStatusReport,
  renderStatusReport
};
