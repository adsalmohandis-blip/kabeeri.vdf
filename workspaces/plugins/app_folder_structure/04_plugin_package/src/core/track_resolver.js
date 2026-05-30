function normalizeTrackValue(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function resolveTrack(context = {}) {
  const candidate = normalizeTrackValue(
    context.track ||
    context.flags?.track ||
    context.flags?.workspace_track ||
    context.flags?.mode ||
    context.value ||
    ""
  );

  if (!candidate) return "plugin_dev";
  if (["owner", "framework-owner", "owner-track"].includes(candidate)) return "owner";
  if (["plugin-dev", "plugin-development", "plugin-development-track"].includes(candidate)) return "plugin_dev";
  if (["viber", "vibe", "vibe-app", "vibe-app-developer", "app"].includes(candidate)) return "viber";
  throw new Error(`Invalid track: ${candidate}`);
}

module.exports = { normalizeTrackValue, resolveTrack };
