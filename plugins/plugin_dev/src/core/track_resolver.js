const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { pluginDevError } = require("./errors");

function normalizeTrack(value) {
  const track = String(value || "").trim().toLowerCase();
  if (!track) return null;
  if (["owner", "framework_owner", "owner_track"].includes(track)) return "owner";
  if (["plugin_dev", "plugin-development", "plugin_development", "plugin_development_track", "plugin-development-track"].includes(track)) return "plugin_dev";
  if (["viber", "vibe", "app", "vibe_app_developer", "viber_track"].includes(track)) return "viber";
  throw pluginDevError(`Invalid track: ${value}`);
}

function readSessionTrack() {
  const file = path.join(repoRoot(), ".kabeeri", "session_track.json");
  if (!fs.existsSync(file)) return null;
  try {
    const state = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!state || !state.active) return null;
    if (state.active_track === "framework_owner") return "owner";
    if (state.active_track === "vibe_app_developer") return "viber";
    if (state.active_track === "plugin_development_track" || state.active_track === "plugin_dev") return "plugin_dev";
  } catch {
    return null;
  }
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
