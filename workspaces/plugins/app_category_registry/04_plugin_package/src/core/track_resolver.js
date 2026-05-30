const VALID_TRACKS = new Set(["owner", "plugin_dev", "viber"]);

function resolveTrack(input, fallback = "plugin_dev") {
  const value = String(input || fallback).trim().toLowerCase();
  if (!VALID_TRACKS.has(value)) {
    throw new Error(`Unsupported track: ${input}`);
  }
  return value;
}

module.exports = { VALID_TRACKS, resolveTrack };
