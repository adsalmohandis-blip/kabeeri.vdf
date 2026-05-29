const assert = require("assert");
const fs = require("fs");
const path = require("path");

const pluginDir = path.join(__dirname, "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.join(pluginDir, "plugin.json"), "utf8"));
const pluginManifest = JSON.parse(fs.readFileSync(path.join(pluginDir, "plugin_manifest.json"), "utf8"));
const bootstrap = require(path.join(pluginDir, "bootstrap.js"));

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

test("plugin manifest advertises the plugin_dev lifecycle", () => {
  assert.strictEqual(manifest.plugin_id, "plugin_dev");
  assert.strictEqual(manifest.id, "plugin_dev");
  assert.strictEqual(manifest.status, "draft");
  assert.ok(Array.isArray(manifest.commands));
  assert.ok(manifest.commands.includes("status"));
  assert.ok(manifest.commands.includes("doctor"));
  assert.ok(manifest.commands.includes("workspace"));
  assert.ok(manifest.commands.includes("integrations"));
  assert.ok(manifest.commands.includes("promotion"));
  assert.ok(Array.isArray(manifest.depends_on));
  assert.ok(manifest.depends_on.includes("plugin_folder_structure"));
  assert.ok(Array.isArray(manifest.integrates_with));
  assert.ok(manifest.integrates_with.includes("plugin_folder_structure"));
  assert.ok(Array.isArray(manifest.schemas));
  assert.ok(Array.isArray(manifest.docs_surface));
});

test("owner manifest marks plugin_dev as a development-track bundle", () => {
  assert.strictEqual(pluginManifest.plugin_slug, "plugin_dev");
  assert.strictEqual(pluginManifest.track, "plugin_development_track");
  assert.strictEqual(pluginManifest.status, "draft");
  assert.strictEqual(pluginManifest.owner_approval_required_for_promotion, true);
});

test("bootstrap exports the plugin entry", () => {
  assert.strictEqual(typeof bootstrap.pluginDev, "function");
});
