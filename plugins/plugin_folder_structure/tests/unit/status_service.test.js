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

test("status report describes the track-aware plugin rules", () => {
  const report = buildStatusReport({ track: "owner" });
  assert.strictEqual(report.report_type, "plugin_folder_structure_status");
  assert.strictEqual(report.plugin_id, "plugin_folder_structure");
  assert.strictEqual(report.track, "owner");
  assert.strictEqual(report.owner_direct_plugin_creation, true);
  assert.strictEqual(report.plugin_dev_workspace_creation, true);
  assert.strictEqual(report.viber_blocked, true);
  assert.strictEqual(report.marketplace_published, false);
});

test("status renderer includes the key guardrails", () => {
  const report = buildStatusReport({ track: "plugin_dev" });
  const text = renderStatusReport(report);
  assert.ok(text.includes("Plugin Folder Structure Status"));
  assert.ok(text.includes("Owner Track direct local plugin creation: true"));
  assert.ok(text.includes("Viber/App Track plugin creation: blocked"));
});
