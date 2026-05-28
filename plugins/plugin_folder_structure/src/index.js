const { runStatus } = require("./commands/status");
const { runCreate } = require("./commands/create");
const { runValidation } = require("./services/validation_service");
const { runGitLibraryCommand } = require("./services/git_library_service");
const { runIntegrationCommand } = require("./services/integration_service");
const { runReviewRequestCommand } = require("./services/review_request_service");
const { runSourceCommand } = require("./services/source_service");
const { buildPluginContext } = require("./core/plugin_context");
const { resolveTrack } = require("./core/track_resolver");
const { pluginFolderError } = require("./core/errors");
const { slugify } = require("./utils/slugify");

function pluginFolderStructure(action, value, flags = {}, rest = [], deps = {}) {
  const context = buildPluginContext({ action, value, flags, rest, deps });
  context.plugin_slug = resolveSubjectSlug(action, value, flags, rest);
  const normalizedAction = String(action || "").trim().toLowerCase();

  if (!normalizedAction || normalizedAction === "status") {
    return runStatus(context, deps);
  }

  if (normalizedAction === "create") {
    return runCreate(context, deps);
  }

  if (normalizedAction === "validate") {
    return runValidation(context, deps);
  }

  if (normalizedAction === "readiness") {
    return runValidation(context, { ...deps, readiness: true });
  }

  if (normalizedAction === "git-library") {
    return runGitLibraryCommand(context, deps);
  }

  if (normalizedAction === "integration") {
    return runIntegrationCommand(context, deps);
  }

  if (normalizedAction === "request-owner-review" || normalizedAction === "request-marketplace-upload") {
    return runReviewRequestCommand(context, deps);
  }

  if (normalizedAction === "init-source") {
    return runSourceCommand(context, deps);
  }

  if (normalizedAction === "register") {
    return { registered: true, track: resolveTrack(context), command: "plugin-folder" };
  }

  throw pluginFolderError(`Unknown plugin-folder action: ${action}`);
}

function resolveSubjectSlug(action, value, flags = {}, rest = []) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  if (normalizedAction === "git-library" || normalizedAction === "integration") {
    return slugify(flags.slug || rest[0] || "");
  }
  if (normalizedAction === "request-owner-review" || normalizedAction === "request-marketplace-upload" || normalizedAction === "init-source") {
    return slugify(flags.slug || value || rest[0] || "");
  }
  if (normalizedAction === "create" || normalizedAction === "validate" || normalizedAction === "readiness") {
    return slugify(flags.slug || value || rest[0] || "");
  }
  return slugify(flags.slug || value || rest[0] || "");
}

module.exports = {
  pluginFolderStructure
};
