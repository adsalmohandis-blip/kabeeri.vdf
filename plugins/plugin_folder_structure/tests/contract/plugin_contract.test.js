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

test("plugin manifest advertises the track-aware shell", () => {
  assert.strictEqual(manifest.plugin_id, "plugin_folder_structure");
  assert.strictEqual(manifest.id, "plugin_folder_structure");
  assert.strictEqual(manifest.version, "1.0.0");
  assert.strictEqual(manifest.type, "kvdf_core");
  assert.strictEqual(manifest.status, "owner_direct_development");
  assert.strictEqual(manifest.entry, "bootstrap.js");
  assert.strictEqual(manifest.runtime_path, "plugins/plugin_folder_structure/bootstrap.js");
  assert.ok(Array.isArray(manifest.commands));
  assert.ok(manifest.commands.includes("status"));
  assert.ok(manifest.commands.includes("create"));
  assert.ok(manifest.commands.includes("upgrade-full-set"));
  assert.ok(Array.isArray(manifest.depends_on));
  assert.ok(Array.isArray(manifest.integrates_with));
  assert.ok(Array.isArray(manifest.provides));
  assert.ok(Array.isArray(manifest.consumes));
  assert.ok(Array.isArray(manifest.conflicts_with));
  assert.ok(Array.isArray(manifest.permissions_required));
  assert.ok(Array.isArray(manifest.schemas));
  assert.ok(manifest.docs_surface.every((item) => item.startsWith("plugins/plugin_folder_structure/docs/")));
  assert.ok(manifest.docs_surface.includes("plugins/plugin_folder_structure/docs/INTEGRATIONS.md"));
  assert.ok(manifest.docs_surface.includes("plugins/plugin_folder_structure/docs/git_libraries/README.md"));
});

test("owner manifest marks direct owner development", () => {
  assert.strictEqual(pluginManifest.plugin_slug, "plugin_folder_structure");
  assert.strictEqual(pluginManifest.track, "owner_track");
  assert.strictEqual(pluginManifest.status, "owner_direct_development");
  assert.strictEqual(pluginManifest.owner_created_directly, true);
});

test("bootstrap exports the plugin entry", () => {
  assert.strictEqual(typeof bootstrap.pluginFolderStructure, "function");
});
