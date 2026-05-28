const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { pluginFolderError } = require("./errors");

function readActiveTrack() {
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
  const fromSession = readActiveTrack();
  if (fromSession) return fromSession;
  return "owner";
}

function normalizeTrack(track) {
  const value = String(track || "").trim().toLowerCase();
  if (!value) return null;
  if (["owner", "framework_owner", "owner_track", "owner-track"].includes(value)) return "owner";
  if (["plugin_dev", "plugin-development", "plugin_development", "plugin-development-track", "plugin_development_track"].includes(value)) return "plugin_dev";
  if (["viber", "vibe", "app", "vibe_app_developer", "viber_track"].includes(value)) return "viber";
  throw pluginFolderError(`Invalid track: ${track}`);
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
