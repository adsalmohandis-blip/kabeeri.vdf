const { buildResumeReport, buildSessionEntryRoute, entry: entryCommand } = require("./resume");
const { table } = require("../ui");

function track(action, value, flags = {}) {
  if (action === "route" || action === "start" || action === "entry" || action === "activate") {
    return entryCommand(action, value, flags);
  }

  const report = buildResumeReport({ scan: Boolean(flags.scan || flags.check || action === "scan") });
  const route = buildSessionEntryRoute(report);
  const payload = {
    report_type: "session_track_status",
    generated_at: new Date().toISOString(),
    mode: report.mode,
    current_root: report.current_root,
    primary_track: report.primary_track,
    track_context: report.track_context,
    session_track: report.session_track,
    entry_route: route,
    next_exact_action: report.next_exact_action,
    recommended_commands: report.recommended_commands,
    warnings: report.warnings
  };

  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  renderTrackStatus(payload);
}

function renderTrackStatus(payload) {
  console.log("Kabeeri Track Status");
  console.log(table(["Field", "Value"], [
    ["Mode", payload.mode],
    ["Current root", payload.current_root],
    ["Primary track", payload.primary_track ? payload.primary_track.label : "unknown"],
    ["Session track", payload.session_track && payload.session_track.active_track ? payload.session_track.active_track : "none"],
    ["Role gate", payload.session_track && payload.session_track.role_gate ? payload.session_track.role_gate : "unknown"],
    ["Effective surface", payload.track_context && payload.track_context.effective_track_surface ? payload.track_context.effective_track_surface : "none"],
    ["Lock source", payload.track_context && payload.track_context.lock_source ? payload.track_context.lock_source : "none"],
    ["Mismatch", payload.track_context && payload.track_context.mismatch ? "yes" : "no"],
    ["Route command", payload.entry_route ? payload.entry_route.route_command : ""],
    ["Follow-up", payload.entry_route ? payload.entry_route.follow_up_command : ""]
  ]));
  console.log("");
  console.log("Track summary:");
  console.log(payload.primary_track && payload.primary_track.summary ? payload.primary_track.summary : "No active track detected.");
  console.log("");
  console.log("Activated features:");
  for (const item of (payload.entry_route && payload.entry_route.activated_features) || []) console.log(`- ${item}`);
  console.log("");
  console.log("Blocked features:");
  for (const item of (payload.entry_route && payload.entry_route.blocked_features) || []) console.log(`- ${item}`);
  console.log("");
  console.log("Warnings:");
  for (const item of payload.warnings && payload.warnings.length ? payload.warnings : ["None."]) console.log(`- ${item}`);
  if (payload.track_context && payload.track_context.mismatch) {
    console.log("- Session track differs from current workspace context. Workspace context wins.");
  }
  console.log("");
  console.log(`Next exact action: ${payload.next_exact_action}`);
  console.log("");
  console.log("Recommended commands:");
  for (const item of payload.recommended_commands || []) console.log(`- ${item}`);
}

module.exports = { track };
