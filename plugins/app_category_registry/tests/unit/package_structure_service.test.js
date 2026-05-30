const assert = require("assert");
const { getPackageStructureReport } = require("../../src/services/package_structure_service");

const report = getPackageStructureReport();

assert.ok(report.standard_dirs.includes("plugin.json"));
assert.ok(report.standard_dirs.includes("src"));
assert.ok(report.standard_source_dirs.includes("src/core"));
