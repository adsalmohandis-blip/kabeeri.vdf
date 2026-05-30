const assert = require("assert");
const { routeSourceIntake } = require("../../src/services/source_intake_router");

const result = routeSourceIntake([
  { id: "shot-1", type: "screenshots", original_location: "uploads/shot-1.png", confidence: 0.9 },
  { id: "brief-1", type: "client_brief", description: "Project brief" },
  { id: "unknown-1", type: "mystery" }
], { app_id: "demo" });

assert.strictEqual(result.sources.length, 3);
assert.ok(result.source_map.target_tracks.includes("uiux"));
assert.ok(result.source_map.target_tracks.includes("requirements"));
assert.strictEqual(result.sources[2].status, "unprocessed");
