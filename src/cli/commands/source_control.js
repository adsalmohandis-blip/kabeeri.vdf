const { buildSourceControlContextReport } = require("../services/source_control_context");

function sourceControl(action, value, flags = {}, rest = [], deps = {}) {
  const mode = normalizeSourceControlAction(action);
  if (!mode || mode === "context" || mode === "status" || mode === "show" || mode === "inspect") {
    const report = buildSourceControlContextReport({
      cwd: typeof deps.repoRoot === "function" ? deps.repoRoot() : process.cwd(),
      track: resolveSourceControlTrack(flags, value, rest),
      app: resolveSourceControlApp(flags, value, rest),
      appSlug: resolveSourceControlApp(flags, value, rest)
    });
    console.log(JSON.stringify(report, null, 2));
    return report;
  }

  throw new Error(`Unknown source-control action: ${action}`);
}

function normalizeSourceControlAction(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function resolveSourceControlTrack(flags = {}, value = "", rest = []) {
  const candidate = String(flags.track || value || rest[0] || "owner").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (candidate === "owner" || candidate === "framework_owner" || candidate === "framework-owner" || candidate === "kvdf") return "framework_owner";
  if (candidate === "vibe" || candidate === "viber" || candidate === "vibe_app_developer" || candidate === "vibe-app-developer" || candidate === "app") return "vibe_app_developer";
  if (candidate === "plugin" || candidate === "plugins") return "plugin";
  return "framework_owner";
}

function resolveSourceControlApp(flags = {}, value = "", rest = []) {
  return String(flags.app || flags.app_slug || flags["app-slug"] || value || rest[0] || "").trim().toLowerCase();
}

module.exports = {
  sourceControl
};
