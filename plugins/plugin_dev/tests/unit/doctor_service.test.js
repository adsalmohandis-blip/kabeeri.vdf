const assert = require("assert");
const { pluginDev } = require("../../src");

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

test("doctor returns a check list", () => {
  const report = pluginDev("doctor", null, { json: true }, []);
  assert.strictEqual(report.report_type, "plugin_dev_doctor");
  assert.ok(Array.isArray(report.checks));
  assert.ok(report.checks.some((item) => item.id === "plugin_folder_structure_installed"));
});
