const vibeService = require("../services/vibe");
const vibeInteractions = require("../services/vibe_interactions");

function vibe(action, value, flags = {}, rest = [], deps = {}) {
  return vibeService.vibe(action, value, flags, rest, {
    ...vibeInteractions,
    ...deps
  });
}

module.exports = { vibe };
