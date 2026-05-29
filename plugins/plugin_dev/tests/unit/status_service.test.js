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

test("status prints a structured report", () => {
  const report = pluginDev("status", null, { json: true }, []);
  assert.strictEqual(report.report_type, "plugin_dev_status");
  assert.strictEqual(report.plugin_id, "plugin_dev");
  assert.ok(Array.isArray(report.available_command_groups));
  assert.ok(report.available_command_groups.includes("workspace"));
  assert.ok(report.available_command_groups.includes("integrations"));
});
