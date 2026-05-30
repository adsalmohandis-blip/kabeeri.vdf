const { runStatus } = require("./commands/status");
const { runCreate } = require("./commands/create");
const { runValidation } = require("./services/validation_service");
const { runGitLibraryCommand } = require("./services/git_library_service");
const { runIntegrationCommand } = require("./services/integration_service");
const { runReviewRequestCommand } = require("./services/review_request_service");
const { runArchiveCommand } = require("./services/archive_service");
const { runLifecycleCommand } = require("./services/lifecycle_service");
const { runAuditCommand } = require("./services/audit_service");
const { runSourceCommand } = require("./services/source_service");
const { runFixNumberingCommand } = require("./services/numbering_migration_service");
const { buildPluginContext } = require("./core/plugin_context");
const { resolveTrack } = require("./core/track_resolver");
const { pluginFolderError } = require("./core/errors");
const { slugify, workspaceSlugify } = require("./utils/slugify");

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

  if (normalizedAction === "upgrade-full-set") {
    return runCreate(context, deps);
  }

  if (normalizedAction === "fix-numbering") {
    return runFixNumberingCommand(context, deps);
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

  if (normalizedAction === "request-direct-install") {
    return runReviewRequestCommand({ ...context, action: "request-direct-install" }, deps);
  }

  if (normalizedAction === "archive-evidence" || (normalizedAction === "archive" && String(value || "").trim().toLowerCase() === "evidence")) {
    return runArchiveCommand(context, deps);
  }

  if (normalizedAction === "lifecycle") {
    return runLifecycleCommand(context, deps);
  }

  if (normalizedAction === "audit") {
    return runAuditCommand(context, deps);
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
  const track = resolveTrack({ flags });
  const useWorkspaceSlug = track === "plugin_dev" || track === "viber";
  if (normalizedAction === "git-library" || normalizedAction === "integration") {
    return useWorkspaceSlug ? workspaceSlugify(flags.slug || rest[0] || "") : slugify(flags.slug || rest[0] || "");
  }
  if (normalizedAction === "request-owner-review" || normalizedAction === "request-marketplace-upload" || normalizedAction === "init-source" || normalizedAction === "fix-numbering") {
    return useWorkspaceSlug ? workspaceSlugify(flags.slug || value || rest[0] || "") : slugify(flags.slug || value || rest[0] || "");
  }
  if (normalizedAction === "create" || normalizedAction === "validate" || normalizedAction === "readiness") {
    return useWorkspaceSlug ? workspaceSlugify(flags.slug || value || rest[0] || "") : slugify(flags.slug || value || rest[0] || "");
  }
  return useWorkspaceSlug ? workspaceSlugify(flags.slug || value || rest[0] || "") : slugify(flags.slug || value || rest[0] || "");
}

module.exports = {
  pluginFolderStructure
};
