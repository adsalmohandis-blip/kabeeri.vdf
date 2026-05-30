const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  buildTrackRoute,
  buildTrackSessionContext,
  normalizeTrackSurface,
  persistSessionTrackState,
  readSessionTrackState,
  readSessionTrackSurface,
  resolveTrackSurface
} = require("../src/cli/services/track_control");
const { normalizeTrack: normalizeWorkspaceBoundaryTrack } = require("../src/cli/services/workspace_boundary");
const { normalizeTrack: normalizeSourceControlTrack } = require("../src/cli/services/source_control_context");
const { normalizeTargetTrack } = require("../src/cli/services/source_truth");
const pluginFolderTrackResolver = require("../plugins/plugin_folder_structure/src/core/track_resolver");
const pluginDevTrackResolver = require("../plugins/plugin_dev/src/core/track_resolver");

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

function withTempRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-track-control-"));
  const previous = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    return fn(dir);
  } finally {
    if (previous === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previous;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("track control normalizes surfaces and routes consistently", () => {
  assert.strictEqual(normalizeTrackSurface("framework_owner"), "owner");
  assert.strictEqual(normalizeTrackSurface("vibe_app_developer"), "viber");
  assert.strictEqual(normalizeTrackSurface("plugin_dev"), "plugin");
  assert.strictEqual(normalizeWorkspaceBoundaryTrack("plugin_dev"), "plugin");
  assert.strictEqual(normalizeSourceControlTrack("plugin_dev"), "plugin");
  assert.strictEqual(normalizeTargetTrack("plugin_dev"), "plugin");
  assert.strictEqual(resolveTrackSurface({ track: "plugin_dev" }), "plugin");

  const ownerRoute = buildTrackRoute("owner");
  const pluginRoute = buildTrackRoute("plugin");
  const viberRoute = buildTrackRoute("viber");

  assert.strictEqual(ownerRoute.track_id, "framework_owner");
  assert.strictEqual(pluginRoute.track_id, "plugin_development_track");
  assert.strictEqual(viberRoute.track_id, "vibe_app_developer");
  assert.strictEqual(pluginRoute.track_surface, "plugin");
  assert.ok(pluginRoute.blocked_features.includes("direct install"));
});

test("track control persists and reads session state safely", () => {
  withTempRepo((dir) => {
    fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
    const report = { mode: "plugin_development_track", current_root: dir };
    const payload = persistSessionTrackState({
      cwd: dir,
      route: buildTrackRoute("plugin"),
      report,
      source: "entry"
    });
    assert.strictEqual(payload.active, true);
    assert.strictEqual(payload.active_track, "plugin_development_track");
    assert.strictEqual(payload.track_surface, "plugin");

    const state = readSessionTrackState(dir);
    assert.strictEqual(state.active, true);
    assert.strictEqual(state.active_track, "plugin_development_track");
    assert.strictEqual(state.track_surface, "plugin");
    assert.strictEqual(readSessionTrackSurface(dir), "plugin");

    const context = buildTrackSessionContext({
      cwd: dir,
      mode: "plugin_development_track",
      hasWorkspace: true,
      appStack: [],
      hasOwnerState: false
    });
    assert.strictEqual(context.session_track_surface, "plugin");
    assert.strictEqual(context.effective_track_surface, "plugin");

    assert.strictEqual(pluginFolderTrackResolver.resolveTrack({}), "plugin_dev");
    assert.strictEqual(pluginDevTrackResolver.resolveTrack({}), "plugin_dev");
    assert.throws(() => pluginFolderTrackResolver.resolveTrack({ flags: { track: "bogus" } }));
    assert.throws(() => pluginDevTrackResolver.resolveTrack({ flags: { track: "bogus" } }));
  });
});

test("track control rejects invalid active session tracks cleanly", () => {
  withTempRepo((dir) => {
    fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
    fs.writeFileSync(path.join(dir, ".kabeeri", "session_track.json"), JSON.stringify({
      version: "v1",
      active: true,
      active_track: "bogus-track",
      updated_at: new Date().toISOString()
    }, null, 2), "utf8");

    const state = readSessionTrackState(dir);
    assert.strictEqual(state.active, false);
    assert.strictEqual(state.valid, false);
    assert.strictEqual(state.track_surface, null);
    assert.strictEqual(readSessionTrackSurface(dir), null);
    assert.strictEqual(resolveTrackSurface({ cwd: dir, fallback: "owner" }), "owner");
  });
});
