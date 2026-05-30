const assert = require("assert");
const { getStatusReport } = require("../../src/services/status_service");

const report = getStatusReport();

assert.strictEqual(report.plugin, "app_category_registry");
assert.ok(Array.isArray(report.active_default_categories));
assert.ok(report.outputs.includes(".kabeeri/app_category_profile.yaml"));
assert.ok(report.outputs.includes(".kabeeri/source_map.yaml"));
assert.ok(report.outputs.includes(".kabeeri/micro_doc_contract.yaml"));
