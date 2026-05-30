const assert = require("assert");
const os = require("os");
const fs = require("fs");
const path = require("path");
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

test("workspace status fails safely when slug is missing", () => {
  assert.throws(() => pluginDev("workspace", "status", { json: true }, []));
});

test("workspace contract can report a path for a slug", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-dev-workspace-"));
  const cwd = process.cwd();
  process.chdir(tmp);
  try {
    const report = pluginDev("workspace", "contract", { json: true, slug: "demo-plugin" }, []);
    assert.strictEqual(report.report_type, "plugin_dev_workspace_contract");
    assert.strictEqual(report.plugin_slug, "demo_plugin");
    assert.match(report.workspace_root.replace(/\\/g, "/"), /workspaces\/plugins\/demo_plugin$/);
    assert.strictEqual(report.workspace_contract_source, "plugin_folder_structure");
  } finally {
    process.chdir(cwd);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
