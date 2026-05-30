const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");

const SESSION_TRACK_FILE = ".kabeeri/session_track.json";

const TRACK_SURFACES = Object.freeze({
  owner: {
    surface: "owner",
    session_track_id: "framework_owner",
    track_label: "Framework Owner Track",
    role_gate: "owner_only",
    route_command: "kvdf evolution priorities",
    follow_up_command: "kvdf evolution temp",
    activated_features: ["evolution", "evolution priorities", "evolution temp", "sync", "validate", "verify"],
    blocked_features: ["vibe", "ask", "capture", "task tracker", "app creation"],
    reason: "Show the ordered framework backlog first, then enter the active temporary queue for the current priority."
  },
  viber: {
    surface: "viber",
    session_track_id: "vibe_app_developer",
    track_label: "Vibe App Developer Track",
    role_gate: "app_only",
    route_command: "kvdf vibe brief",
    follow_up_command: "kvdf task tracker",
    activated_features: ["vibe", "ask", "capture", "temp", "task tracker", "blueprint"],
    blocked_features: ["evolution", "deferred restore", "framework edit surfaces", "owner-only verification"],
    reason: "Show the app context brief first, then move directly into governed application task execution."
  },
  plugin: {
    surface: "plugin",
    session_track_id: "plugin_development_track",
    track_label: "Plugin Development Track",
    role_gate: "plugin_development",
    route_command: "kvdf plugin-dev status",
    follow_up_command: "kvdf plugin-dev doctor",
    activated_features: ["plugin-dev", "workspace", "intake", "libraries", "spec", "tasks", "integrations", "test", "evidence", "readiness", "package", "promotion"],
    blocked_features: ["direct folder creation", "direct install", "marketplace publish", "owner bypass"],
    reason: "Enter the governed plugin-development lifecycle after workspace validation."
  },
  unclassified: {
    surface: "unclassified",
    session_track_id: "unclassified",
    track_label: "Unclassified Track",
    role_gate: "setup_required",
    route_command: "kvdf init",
    follow_up_command: "kvdf resume",
    activated_features: [],
    blocked_features: ["framework-owner track", "vibe app-developer track", "plugin-development track"],
    reason: "Initialize the workspace before choosing a framework-owner, app-developer, or plugin-development path."
  }
});

function normalizeTrackSurface(value) {
  const text = String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "_");
  if (!text) return null;
  if (["owner", "framework_owner", "framework-owner", "owner_track", "owner-track", "kvdf"].includes(text)) return "owner";
  if (["viber", "vibe", "app", "vibe_app_developer", "vibe-app-developer", "viber_track"].includes(text)) return "viber";
  if (["plugin", "plugins", "plugin_dev", "plugin-dev", "plugin_development", "plugin-development", "plugin_development_track", "plugin-development-track"].includes(text)) return "plugin";
  if (text === "unclassified") return "unclassified";
  return null;
}

function normalizeTrackAssignment(value) {
  const surface = normalizeTrackSurface(value);
  if (surface === "owner") return "framework_owner";
  if (surface === "viber") return "vibe_app_developer";
  if (surface === "plugin") return "plugin";
  return null;
}

function normalizeTrackMode(value) {
  const surface = normalizeTrackSurface(value);
  if (surface === "owner" || surface === "viber" || surface === "plugin") return surface;
  return null;
}

function getTrackDisplayLabel(value) {
  const surface = normalizeTrackSurface(value);
  if (surface === "owner") return "Owner Track";
  if (surface === "viber") return "Viber/App Track";
  if (surface === "plugin") return "Plugin Development Track";
  if (surface === "unclassified") return "Unclassified Track";
  return "Unclassified Track";
}

function getTrackDisplayShortLabel(value) {
  const surface = normalizeTrackSurface(value);
  if (surface === "owner") return "Owner";
  if (surface === "viber") return "Viber/App";
  if (surface === "plugin") return "Plugin Dev";
  if (surface === "unclassified") return "Unclassified";
  return "Unclassified";
}

function normalizeSessionTrackId(value) {
  const surface = normalizeTrackSurface(value);
  return surface ? TRACK_SURFACES[surface].session_track_id : null;
}

function readSessionTrackAssignment(cwd = repoRoot()) {
  const surface = readSessionTrackSurface(cwd);
  return surface ? normalizeTrackAssignment(surface) : null;
}

function readSessionTrackState(cwd = repoRoot()) {
  const file = path.join(path.resolve(cwd), SESSION_TRACK_FILE);
  if (!fs.existsSync(file)) {
    return {
      file,
      active: false,
      active_track: null,
      track_surface: null,
      valid: true
    };
  }
  try {
    const state = JSON.parse(fs.readFileSync(file, "utf8"));
    const rawTrack = state && state.active_track ? String(state.active_track).trim() : null;
    const activeTrack = normalizeSessionTrackId(rawTrack);
    const trackSurface = activeTrack ? normalizeTrackSurface(rawTrack) : (rawTrack === "onboarding" ? "unclassified" : null);
    const active = Boolean(state && state.active && (activeTrack || rawTrack === "onboarding"));
    return {
      file,
      ...state,
      active,
      active_track: rawTrack,
      normalized_active_track_id: activeTrack,
      track_surface: trackSurface,
      valid: Boolean(trackSurface || rawTrack === "onboarding" || !state.active),
      session_track_state: state
    };
  } catch {
    return {
      file,
      active: false,
      active_track: null,
      track_surface: null,
      valid: false,
      session_track_state: null
    };
  }
}

function readSessionTrackSurface(cwd = repoRoot()) {
  const state = readSessionTrackState(cwd);
  if (!state.active) return null;
  return ["owner", "viber", "plugin"].includes(state.track_surface) ? state.track_surface : null;
}

function resolveTrackSurface(options = {}) {
  const explicitRaw = typeof options.track !== "undefined"
    ? options.track
    : (options.flags && typeof options.flags.track !== "undefined" ? options.flags.track : undefined);
  if (typeof explicitRaw !== "undefined" && String(explicitRaw).trim()) {
    return normalizeTrackSurface(explicitRaw);
  }
  if (typeof explicitRaw !== "undefined") return null;
  const sessionSurface = readSessionTrackSurface(options.cwd || repoRoot());
  if (sessionSurface) return sessionSurface;
  const fallback = normalizeTrackSurface(options.fallback);
  return fallback || null;
}

function resolveTrackAssignment(options = {}) {
  const explicitRaw = typeof options.track !== "undefined"
    ? options.track
    : (options.flags && typeof options.flags.track !== "undefined" ? options.flags.track : undefined);
  if (typeof explicitRaw !== "undefined") {
    return normalizeTrackAssignment(explicitRaw);
  }
  const sessionAssignment = readSessionTrackAssignment(options.cwd || repoRoot());
  if (sessionAssignment) return sessionAssignment;
  const fallback = normalizeTrackAssignment(options.fallback);
  return fallback || null;
}

function buildTrackRoute(track) {
  const surface = normalizeTrackSurface(track) || "unclassified";
  const template = TRACK_SURFACES[surface] || TRACK_SURFACES.unclassified;
  return {
    track_id: template.session_track_id,
    track_surface: template.surface,
    track_label: template.track_label,
    role_gate: template.role_gate,
    route_command: template.route_command,
    follow_up_command: template.follow_up_command,
    activated_features: [...template.activated_features],
    blocked_features: [...template.blocked_features],
    reason: template.reason
  };
}

function deriveWorkspaceTrackSurface({ mode, hasWorkspace, appStack, hasOwnerState } = {}) {
  if (mode === "framework_owner_development" || hasOwnerState) return "owner";
  if (mode === "kabeeri_user_app_workspace" || mode === "application_without_kabeeri_workspace" || (Array.isArray(appStack) && appStack.length > 0)) {
    return "viber";
  }
  if (mode === "plugin_development_track" || mode === "plugin_dev") return "plugin";
  if (mode === "unknown_folder" && hasWorkspace) return null;
  return null;
}

function buildTrackSessionContext({
  cwd = repoRoot(),
  mode = "unknown_folder",
  hasWorkspace = false,
  appStack = [],
  hasOwnerState = false,
  pluginLoader = null
} = {}) {
  const sessionTrack = readSessionTrackState(cwd);
  const sessionTrackSurface = readSessionTrackSurface(cwd);
  const derivedTrackSurface = deriveWorkspaceTrackSurface({ mode, hasWorkspace, appStack, hasOwnerState });
  const effectiveTrackSurface = derivedTrackSurface || sessionTrackSurface || null;
  const ownerTrackPlugin = pluginLoader && Array.isArray(pluginLoader.plugins)
    ? pluginLoader.plugins.find((plugin) => plugin.plugin_id === "kvdf-dev")
    : null;
  const mismatch = Boolean(derivedTrackSurface && sessionTrackSurface && derivedTrackSurface !== sessionTrackSurface);
  return {
    mode,
    has_workspace: Boolean(hasWorkspace),
    has_owner_state: Boolean(hasOwnerState),
    session_track_active: Boolean(sessionTrack.active),
    session_track_surface: sessionTrackSurface,
    derived_track_surface: derivedTrackSurface,
    effective_track_surface: effectiveTrackSurface,
    lock_source: derivedTrackSurface ? "workspace_context" : (sessionTrackSurface ? "session_track" : "none"),
    mismatch,
    session_track_label: sessionTrack.track_label || null,
    session_role_gate: sessionTrack.role_gate || null,
    plugin_loader_active: pluginLoader ? Number(pluginLoader.active_plugins || 0) : 0,
    owner_track_plugin_enabled: ownerTrackPlugin ? Boolean(ownerTrackPlugin.enabled) : null,
    owner_track_plugin_status: ownerTrackPlugin ? ownerTrackPlugin.status : null
  };
}

function persistSessionTrackState({
  cwd = repoRoot(),
  route,
  report,
  source = "entry"
} = {}) {
  const normalizedRoute = route && route.track_surface ? buildTrackRoute(route.track_surface) : buildTrackRoute(route && route.track_id ? route.track_id : null);
  if (normalizedRoute.track_id === "unclassified" && source !== "onboarding") {
    throw new Error("Cannot persist an unclassified session track.");
  }
  const baseRoot = path.resolve(cwd);
  const filePath = path.join(baseRoot, SESSION_TRACK_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const now = new Date().toISOString();
  const payload = {
    version: "v1",
    active: source === "onboarding" ? true : normalizedRoute.track_id !== "unclassified",
    active_track: normalizedRoute.track_id !== "unclassified" ? normalizedRoute.track_id : (source === "onboarding" ? "onboarding" : null),
    track_surface: normalizedRoute.track_surface === "unclassified" ? null : normalizedRoute.track_surface,
    track_label: normalizedRoute.track_label,
    role_gate: normalizedRoute.role_gate,
    route_command: normalizedRoute.route_command,
    follow_up_command: normalizedRoute.follow_up_command,
    activated_features: normalizedRoute.activated_features,
    blocked_features: normalizedRoute.blocked_features,
    started_from_mode: report && report.mode ? report.mode : null,
    decision_source: source,
    active_root: report && report.current_root ? report.current_root : baseRoot,
    activated_at: now,
    updated_at: now
  };
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

module.exports = {
  SESSION_TRACK_FILE,
  TRACK_SURFACES,
  buildTrackRoute,
  buildTrackSessionContext,
  deriveWorkspaceTrackSurface,
  normalizeSessionTrackId,
  normalizeTrackAssignment,
  normalizeTrackMode,
  getTrackDisplayLabel,
  getTrackDisplayShortLabel,
  normalizeTrackSurface,
  persistSessionTrackState,
  readSessionTrackState,
  readSessionTrackAssignment,
  readSessionTrackSurface,
  resolveTrackAssignment,
  resolveTrackSurface
};
