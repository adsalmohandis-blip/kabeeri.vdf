const { repoRoot } = require("../../../../src/cli/fs_utils");
const { normalizeTrackSurface, readSessionTrackSurface } = require("../../../../src/cli/services/track_control");
const { pluginFolderError } = require("./errors");

function readActiveTrack() {
  const surface = readSessionTrackSurface(repoRoot());
  if (!surface) return null;
  if (surface === "owner") return "owner";
  if (surface === "viber") return "viber";
  if (surface === "plugin") return "plugin_dev";
  return null;
}

function resolveTrack(context = {}) {
  const explicit = normalizeTrack(context.flags && context.flags.track);
  if (explicit) return explicit;
  const fromSession = readActiveTrack();
  if (fromSession) return fromSession;
  return "owner";
}

function normalizeTrack(track) {
  const value = String(track || "").trim();
  if (!value) return null;
  const surface = normalizeTrackSurface(value);
  if (!surface) throw pluginFolderError(`Invalid track: ${track}`);
  if (surface === "owner") return "owner";
  if (surface === "viber") return "viber";
  if (surface === "plugin") return "plugin_dev";
  return null;
}

function resolveTargetRoot(slug, track) {
  const normalized = resolveTrack({ flags: { track } });
  if (normalized === "owner") return path.join(repoRoot(), "plugins", slug);
  if (normalized === "plugin_dev") return path.join(repoRoot(), "workspaces", "plugins", slug);
  throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
}

module.exports = {
  resolveTrack,
  normalizeTrack,
  resolveTargetRoot,
  readActiveTrack
};
