const assert = require("assert");
const path = require("path");

const { resolveScaffoldTarget, normalizeTargetKind } = require("../src/cli/services/scaffold_target");

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

test("scaffold target kind normalization is explicit", () => {
  assert.strictEqual(normalizeTargetKind("app_workspace"), "app_workspace");
  assert.strictEqual(normalizeTargetKind("plugin_bundle"), "plugin_bundle");
  assert.throws(() => normalizeTargetKind(""), /Missing scaffold target kind/);
  assert.throws(() => normalizeTargetKind("mystery"), /Invalid scaffold target kind/);
});

test("app workspaces resolve only to workspaces/apps/<slug>", () => {
  const target = resolveScaffoldTarget({
    targetKind: "app_workspace",
    slug: "clinic-basic",
    track: "plugin",
    targetRoot: path.join("workspaces", "apps", "clinic_basic")
  });
  assert.strictEqual(target.target_kind, "app_workspace");
  assert.strictEqual(target.track_surface, "plugin");
  assert.match(target.canonical_root_relative.replace(/\\/g, "/"), /workspaces\/apps\/clinic_basic$/);
});

test("plugin workspaces resolve only to workspaces/plugins/<slug> on plugin track", () => {
  const target = resolveScaffoldTarget({
    targetKind: "plugin_workspace",
    slug: "app-folder-structure",
    track: "plugin",
    targetRoot: path.join("workspaces", "plugins", "app_folder_structure")
  });
  assert.strictEqual(target.target_kind, "plugin_workspace");
  assert.strictEqual(target.track_surface, "plugin");
  assert.match(target.canonical_root_relative.replace(/\\/g, "/"), /workspaces\/plugins\/app_folder_structure$/);
});

test("scaffold root mismatch fails closed", () => {
  assert.throws(() => resolveScaffoldTarget({
    targetKind: "app_workspace",
    slug: "clinic-basic",
    track: "plugin",
    targetRoot: path.join("plugins", "clinic-basic")
  }), /Scaffold root mismatch/);
});

test("track mismatch fails closed before writing", () => {
  assert.throws(() => resolveScaffoldTarget({
    targetKind: "plugin_workspace",
    slug: "app-folder-structure",
    track: "owner",
    targetRoot: path.join("workspaces", "plugins", "app-folder-structure")
  }), /not allowed on track owner/);
});
