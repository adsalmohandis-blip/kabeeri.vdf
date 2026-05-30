const assert = require("assert");

const { appFolderStructure, registerAppFolderStructure } = require("../../src");
const { buildAppWorkspacePlan, comparePackageStructure } = require("../../src/core/standard_plugin_structure");
const { buildPluginManifest, buildPluginPackageManifest } = require("../../src/services/manifest_service");

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

test("plugin contract exposes the app-folder command group", () => {
  const contract = registerAppFolderStructure();
  assert.strictEqual(contract.command, "app-folder");
  assert.ok(contract.actions.includes("status"));
  assert.ok(contract.actions.includes("create"));
  assert.ok(contract.actions.includes("validate"));
  assert.ok(contract.actions.includes("repair"));
});

test("plugin bootstrap exposes the appFolderStructure runtime", () => {
  assert.strictEqual(typeof appFolderStructure, "function");
  const status = appFolderStructure("status", null, { json: true }, [], {});
  assert.strictEqual(status.plugin_id, "app_folder_structure");
  assert.strictEqual(status.standard_plugin_structure, "one");
});

test("workspace plan encodes the canonical full app folder structure", () => {
  const plan = buildAppWorkspacePlan("clinic-basic", { category: "web_app" });
  assert.strictEqual(plan.slug, "clinic_basic");
  assert.ok(plan.directories.some((item) => item.endsWith("00_viber_inputs")));
  assert.ok(plan.directories.some((item) => item.endsWith("13_owner_portal")));
  assert.ok(plan.files.some(([filePath]) => normalize(filePath).endsWith("03_full_specifications/handover_package.md")));
  assert.ok(plan.files.some(([filePath]) => normalize(filePath).endsWith("08_source/source_manifest.json")));
});

test("owner and plugin-dev package contracts stay structurally aligned", () => {
  const ownerManifest = buildPluginManifest("clinic_basic", "/tmp/workspaces/plugins/clinic_basic", null);
  const workspaceManifest = buildPluginPackageManifest("clinic_basic", "/tmp/workspaces/plugins/clinic_basic", null);
  assert.strictEqual(ownerManifest.plugin_slug, "clinic_basic");
  assert.strictEqual(workspaceManifest.plugin_id, "app_folder_structure");
  assert.deepStrictEqual(ownerManifest.compatibility.canonical_full_set_enabled, true);
  assert.deepStrictEqual(workspaceManifest.commands, ["status", "create", "validate", "repair", "print", "manifest", "readiness"]);
});

test("comparePackageStructure can compare owner and workspace package layouts", () => {
  const comparison = comparePackageStructure(
    {
      directories: ["plugins/example_plugin/src", "plugins/example_plugin/docs"],
      files: [["plugins/example_plugin/plugin.json", "{}\n"]]
    },
    {
      directories: ["workspaces/plugins/example_plugin/04_plugin_package/src", "workspaces/plugins/example_plugin/04_plugin_package/docs"],
      files: [["workspaces/plugins/example_plugin/04_plugin_package/plugin.json", "{}\n"]]
    }
  );
  assert.strictEqual(comparison.same_directories, true);
  assert.strictEqual(comparison.same_files, true);
});

function pathJoin(...parts) {
  return parts.join("/");
}

function normalize(value) {
  return String(value || "").replace(/\\/g, "/");
}

