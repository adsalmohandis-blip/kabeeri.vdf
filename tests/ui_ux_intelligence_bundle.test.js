const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pluginRoot = path.join(repoRoot, "plugins", "ui_ux_intelligence");
const manifest = require(path.join(pluginRoot, "plugin.json"));
const bootstrap = require(path.join(pluginRoot, "bootstrap"));

assert.strictEqual(manifest.plugin_id, "ui_ux_intelligence");
assert.strictEqual(manifest.command_entrypoint, "plugins/ui_ux_intelligence/bootstrap.js");
assert.strictEqual(manifest.runtime_entrypoint, "plugins/ui_ux_intelligence/bootstrap.js");
assert.strictEqual(manifest.entry, "bootstrap.js");
assert.strictEqual(manifest.runtime_path, "plugins/ui_ux_intelligence/bootstrap.js");
assert.ok(fs.existsSync(path.join(pluginRoot, "README.md")), "Expected a root README.md");
assert.ok(fs.existsSync(path.join(pluginRoot, "bootstrap.js")), "Expected a root bootstrap.js");
assert.strictEqual(bootstrap.plugin_id, "ui_ux_intelligence");
assert.strictEqual(bootstrap.name, "UI UX Intelligence");
assert.ok(typeof bootstrap.getPluginStatus === "function" || typeof bootstrap.status === "function" || typeof bootstrap.buildMarkdownStatus === "function");

console.log("ui_ux_intelligence_bundle.test.js passed");
