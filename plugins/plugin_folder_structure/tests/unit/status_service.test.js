const assert = require("assert");
const { buildStatusReport, renderStatusReport } = require("../../src/services/status_service");

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test("status report describes the one standard plugin structure", () => {
  const report = buildStatusReport();
  assert.strictEqual(report.report_type, "plugin_folder_structure_status");
  assert.strictEqual(report.plugin_id, "plugin_folder_structure");
  assert.strictEqual(report.standard_plugin_structure, "one");
  assert.strictEqual(report.owner_track_target, "./plugins/<plugin-slug>/");
  assert.strictEqual(report.plugin_dev_track_target, "./workspaces/plugins/<plugin-slug>/04_plugin_package/");
  assert.strictEqual(report.canonical_full_set_enabled, true);
  assert.strictEqual(report.actual_candidate_plugin_package, "./workspaces/plugins/<plugin-slug>/04_plugin_package/");
  assert.strictEqual(report.canonical_package_folder, "04_plugin_package");
  assert.strictEqual(report.previous_package_folder, "03_plugin_package");
  assert.strictEqual(report.removed_redundant_source_folder, true);
  assert.strictEqual(report.viber_track_plugin_creation, "blocked");
  assert.strictEqual(report.deep_nested_plugin_root, "disabled");
  assert.strictEqual(report.marketplace_publish_by_plugin_folder_structure, false);
  assert.strictEqual(report.owner_approval_required_for_plugin_dev_promotion, true);
  assert.strictEqual(report.compact_backward_compatibility, true);
});

test("status renderer includes the key guardrails", () => {
  const report = buildStatusReport();
  const text = renderStatusReport(report);
  assert.ok(text.includes("standard_plugin_structure: one"));
  assert.ok(text.includes("owner_track_target: ./plugins/<plugin-slug>/"));
  assert.ok(text.includes("plugin_dev_track_target: ./workspaces/plugins/<plugin-slug>/04_plugin_package/"));
  assert.ok(text.includes("canonical_full_set_enabled: true"));
  assert.ok(text.includes("actual_candidate_plugin_package: ./workspaces/plugins/<plugin-slug>/04_plugin_package/"));
  assert.ok(text.includes("canonical_package_folder: 04_plugin_package"));
  assert.ok(text.includes("previous_package_folder: 03_plugin_package"));
  assert.ok(text.includes("removed_redundant_source_folder: true"));
  assert.ok(text.includes("Viber/App Track plugin creation: blocked"));
});

