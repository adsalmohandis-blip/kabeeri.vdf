const assert = require("assert");
const { buildPackageStructureSummary, comparePackageStructure, resolveCategoryProfile } = require("../../src/services/package_structure_service");

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

test("package structure summary follows the canonical app workspace plan", () => {
  const summary = buildPackageStructureSummary("clinic-basic", { category: "web_app" });
  assert.strictEqual(summary.app_slug, "clinic_basic");
  assert.strictEqual(summary.category, "web_app");
  assert.strictEqual(summary.platform_type, "web");
  assert.deepStrictEqual(summary.top_level_dirs, [
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
  assert.ok(summary.folder_count > 0);
  assert.ok(summary.file_count > 0);
  assert.ok(Array.isArray(summary.categories));
});

test("package structure comparison is strict about owner and workspace parity", () => {
  const ownerPlan = {
    directories: ["plugins/example-plugin/src", "plugins/example-plugin/docs"],
    files: [["plugins/example-plugin/plugin.json", "{}\n"]]
  };
  const workspacePlan = {
    directories: ["workspaces/plugins/example_plugin/04_plugin_package/src", "workspaces/plugins/example_plugin/04_plugin_package/docs"],
    files: [["workspaces/plugins/example_plugin/04_plugin_package/plugin.json", "{}\n"]]
  };
  const comparison = comparePackageStructure(ownerPlan, workspacePlan);
  assert.strictEqual(comparison.same_directories, true);
  assert.strictEqual(comparison.same_files, true);
});

test("category profiles are available for the app-folder planner", () => {
  const profile = resolveCategoryProfile("web_app");
  assert.strictEqual(profile.category_id, "web_app");
  assert.strictEqual(profile.folder_structure_profile.source_plugin, "app_category_registry");
  assert.ok(profile.uiux_sections.includes("public_pages"));
});

