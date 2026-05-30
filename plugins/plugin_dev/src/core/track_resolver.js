const { repoRoot } = require("../../../../src/cli/fs_utils");
const { normalizeTrackSurface, readSessionTrackSurface } = require("../../../../src/cli/services/track_control");
const { pluginDevError } = require("./errors");

function normalizeTrack(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const surface = normalizeTrackSurface(text);
  if (!surface) throw pluginDevError(`Invalid track: ${value}`);
  if (surface === "owner") return "owner";
  if (surface === "plugin") return "plugin_dev";
  if (surface === "viber") return "viber";
  return null;
}

function readSessionTrack() {
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
  const fromSession = readSessionTrack();
  if (fromSession) return fromSession;
  return "plugin_dev";
}

module.exports = {
  normalizeTrack,
  readSessionTrack,
  resolveTrack
};
