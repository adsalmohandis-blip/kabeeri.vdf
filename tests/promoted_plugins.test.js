const assert = require("assert");

const appCategoryRegistry = require("../plugins/app_category_registry/bootstrap");
const appFolderStructure = require("../plugins/app_folder_structure/bootstrap");

assert.strictEqual(appCategoryRegistry.plugin_id, "app_category_registry");
assert.strictEqual(typeof appCategoryRegistry.appCategoryRegistry, "function");
assert.strictEqual(appFolderStructure.plugin_id, "app_folder_structure");
assert.strictEqual(typeof appFolderStructure.appFolderStructure, "function");
