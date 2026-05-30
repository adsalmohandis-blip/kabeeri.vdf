const path = require("path");
const { repoRoot } = require("../fs_utils");

const { resolveTrackSurface } = require("./track_control");
const { normalizeWorkspaceSlug } = require("./workspace_naming");

const SCAFFOLD_TARGET_KINDS = ["app_workspace", "plugin_bundle", "plugin_workspace"];
const TARGET_KIND_TRACK_RULES = Object.freeze({
  app_workspace: new Set(["viber", "plugin"]),
  plugin_bundle: new Set(["owner"]),
  plugin_workspace: new Set(["plugin"])
});

function normalizeTargetKind(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) throw new Error("Missing scaffold target kind.");
  if (!SCAFFOLD_TARGET_KINDS.includes(normalized)) {
    throw new Error(`Invalid scaffold target kind: ${value}. Allowed kinds: ${SCAFFOLD_TARGET_KINDS.join(", ")}`);
  }
  return normalized;
}

function resolveScaffoldTarget(options = {}) {
  const targetKind = normalizeTargetKind(options.targetKind || options.target_kind);
  const rawSlug = options.slug || options.appSlug || options.pluginSlug || options.name || "";
  const slug = targetKind === "app_workspace" || targetKind === "plugin_workspace"
    ? normalizeWorkspaceSlug(rawSlug)
    : normalizeSlug(rawSlug);
  if (!slug) throw new Error("Missing scaffold slug.");

  const baseRoot = path.resolve(options.repoRootPath || repoRoot());
  const resolvedTrack = resolveTrackSurface({
    track: options.track,
    flags: options.flags,
    cwd: baseRoot,
    fallback: options.fallbackTrack
  });
  const trackSurface = resolvedTrack || null;
  const allowedTracks = TARGET_KIND_TRACK_RULES[targetKind] || new Set();
  if (!trackSurface) {
    throw new Error(`Missing active track for scaffold target ${targetKind}.`);
  }
  if (!allowedTracks.has(trackSurface)) {
    const expectedTracks = Array.from(allowedTracks).join(", ");
    throw new Error(`Scaffold target ${targetKind} is not allowed on track ${trackSurface}. Expected track(s): ${expectedTracks}.`);
  }

  const expectedRoot = targetKind === "app_workspace"
    ? path.join(baseRoot, "workspaces", "apps", slug)
    : targetKind === "plugin_workspace"
      ? path.join(baseRoot, "workspaces", "plugins", slug)
      : path.join(baseRoot, "plugins", slug);

  const explicitRoot = options.targetRoot || options.target_root || null;
  if (explicitRoot) {
    const resolvedExplicitRoot = path.resolve(baseRoot, explicitRoot);
    assertWithinRepo(baseRoot, resolvedExplicitRoot, targetKind);
    if (normalizePath(resolvedExplicitRoot) !== normalizePath(expectedRoot)) {
      throw new Error(`Scaffold root mismatch for ${targetKind}: expected ${path.relative(baseRoot, expectedRoot).replace(/\\/g, "/")} but received ${path.relative(baseRoot, resolvedExplicitRoot).replace(/\\/g, "/")}.`);
    }
  }

  return {
    target_kind: targetKind,
    track_surface: trackSurface,
    slug,
    canonical_root: expectedRoot,
    canonical_root_relative: path.relative(baseRoot, expectedRoot).replace(/\\/g, "/")
  };
}

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase();
}

function assertWithinRepo(baseRoot, targetRoot, targetKind) {
  const normalizedBase = normalizePath(baseRoot);
  const normalizedTarget = normalizePath(targetRoot);
  if (normalizedTarget !== normalizedBase && !normalizedTarget.startsWith(`${normalizedBase}/`)) {
    throw new Error(`Refusing to scaffold outside the repository root for ${targetKind}.`);
  }
}

module.exports = {
  SCAFFOLD_TARGET_KINDS,
  normalizeTargetKind,
  resolveScaffoldTarget
};
