const assert = require("assert");
const { buildStatusReport } = require("../../src/services/status_service");

function test(label, fn) {
  try {
    fn();
    console.log(`OK ${label}`);
  } catch (error) {
    console.error(`FAIL ${label}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test("status report exposes the canonical app-folder policy", () => {
  const report = buildStatusReport();
  assert.strictEqual(report.plugin_id, "app_folder_structure");
  assert.strictEqual(report.standard_plugin_structure, "one");
  assert.strictEqual(report.workspace_root, "./workspaces/apps/<app-slug>/");
  assert.deepStrictEqual(report.canonical_pipeline, [
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
  ]);
  assert.strictEqual(report.pipeline_contract_required, true);
  assert.strictEqual(report.viber_track_plugin_creation, false);
  assert.strictEqual(report.marketplace_publish_by_app_folder_structure, false);
  assert.strictEqual(report.owner_approval_required_for_promotion, true);
  assert.ok(report.create_command.includes("kvdf app-folder create"));
});
