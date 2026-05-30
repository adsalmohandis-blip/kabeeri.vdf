const assert = require("assert");
const { appCategoryRegistryApi, appCategoryRegistryCommand, registerAppCategoryRegistry } = require("../../src");

const status = appCategoryRegistryApi.getStatusReport();
const packageStructure = appCategoryRegistryApi.getPackageStructureReport();
const workspacePlan = appCategoryRegistryApi.getWorkspaceTargetPlan("example_plugin");

assert.strictEqual(status.plugin, "app_category_registry");
assert.ok(packageStructure.standard_dirs.includes("docs"));
assert.strictEqual(workspacePlan.plugin_slug, "example_plugin");
assert.strictEqual(typeof appCategoryRegistryCommand, "function");
assert.strictEqual(registerAppCategoryRegistry().command, "app-category");
