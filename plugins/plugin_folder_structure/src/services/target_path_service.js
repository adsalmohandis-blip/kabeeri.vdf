const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { ensureDir, writeFileIfMissing, dirIsEmpty } = require("../utils/fs_safe");
const { isSafeSlug, slugify } = require("../utils/slugify");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { SHARED_SHELL_FOLDERS, WORKSPACE_GOVERNANCE_FOLDERS } = require("../core/constants");

function buildOwnerStructurePlan(slug) {
  const root = path.join(repoRoot(), "plugins", slug);
  const directories = [
    ...SHARED_SHELL_FOLDERS.map((folder) => path.join(root, folder)),
    path.join(root, "src", "commands"),
    path.join(root, "src", "core"),
    path.join(root, "src", "services"),
    path.join(root, "src", "utils"),
    path.join(root, "src", "adapters"),
    path.join(root, "src", "policies"),
    path.join(root, "schemas"),
    path.join(root, "tests"),
    path.join(root, "tests", "unit"),
    path.join(root, "tests", "contract"),
    path.join(root, "tests", "integration"),
    path.join(root, "tests", "smoke"),
    path.join(root, "docs")
  ];
  const files = [
    [path.join(root, "plugin.json"), defaultOwnerPluginJson(slug)],
    [path.join(root, "bootstrap.js"), defaultBootstrapJs()],
    [path.join(root, "README.md"), defaultReadme(slug)],
    [path.join(root, "CHANGELOG.md"), defaultChangelog()],
    [path.join(root, "plugin_manifest.json"), defaultOwnerManifest(slug)],
    [path.join(root, "docs", "README.md"), "# Docs\n"],
    [path.join(root, "docs", "OVERVIEW.md"), defaultOwnerDocsOverview()],
    [path.join(root, "docs", "TRACK_BOUNDARIES.md"), defaultTrackBoundaries()],
    [path.join(root, "docs", "COMMANDS.md"), defaultCommandsDoc()],
    [path.join(root, "docs", "ACCEPTANCE_CRITERIA.md"), defaultAcceptanceDoc()],
    [path.join(root, "docs", "OWNER_TRACK_DIRECT_PLUGIN_FLOW.md"), defaultOwnerFlowDoc()],
    [path.join(root, "docs", "PLUGIN_DEVELOPMENT_TRACK_FLOW.md"), defaultPluginDevFlowDoc()],
    [path.join(root, "docs", "VIBER_TRACK_BLOCKING_RULE.md"), defaultViberDoc()],
    [path.join(root, "docs", "GIT_LIBRARY_INPUTS.md"), defaultGitLibraryDoc()],
    [path.join(root, "docs", "INTEGRATIONS.md"), defaultIntegrationsMd()],
    [path.join(root, "docs", "PLUGIN_INTEGRATION_LAYER.md"), defaultIntegrationDoc()],
    [path.join(root, "docs", "MARKETPLACE_REQUEST_FLOW.md"), defaultMarketplaceDoc()],
    [path.join(root, "docs", "git_libraries", "README.md"), "# Git libraries\\n"],
    [path.join(root, "prompts", "README.md"), "# Prompts\n"],
    [path.join(root, "runtime", "README.md"), "# Runtime\n"],
    [path.join(root, "dashboard", "README.md"), "# Dashboard\n"],
    [path.join(root, "viber_blocking", "README.md"), "# Viber Blocking\n"],
    [path.join(root, "src", "index.js"), defaultOwnerIndexJs()],
    [path.join(root, "src", "commands", "status.js"), defaultStatusCommandJs()],
    [path.join(root, "src", "commands", "create.js"), defaultCreateCommandJs()],
    [path.join(root, "src", "commands", "register.js"), defaultRegisterCommandJs()],
    [path.join(root, "src", "core", "constants.js"), defaultConstantsJs()],
    [path.join(root, "src", "core", "errors.js"), defaultErrorsJs()],
    [path.join(root, "src", "core", "track_resolver.js"), defaultTrackResolverJs()],
    [path.join(root, "src", "core", "plugin_context.js"), defaultPluginContextJs()],
    [path.join(root, "src", "services", "status_service.js"), defaultStatusServiceJs()],
    [path.join(root, "src", "services", "target_path_service.js"), defaultTargetPathServiceJs()],
    [path.join(root, "src", "services", "validation_service.js"), defaultValidationServiceJs()],
    [path.join(root, "src", "services", "git_library_service.js"), defaultGitLibraryServiceJs()],
    [path.join(root, "src", "services", "integration_service.js"), defaultIntegrationServiceJs()],
    [path.join(root, "src", "services", "review_request_service.js"), defaultReviewRequestServiceJs()],
    [path.join(root, "src", "services", "source_service.js"), defaultSourceServiceJs()],
    [path.join(root, "src", "utils", "slugify.js"), defaultSlugifyJs()],
    [path.join(root, "src", "utils", "json_safe.js"), defaultJsonSafeJs()],
    [path.join(root, "src", "utils", "fs_safe.js"), defaultFsSafeJs()],
    [path.join(root, "src", "adapters", "index.js"), "module.exports = {};\n"],
    [path.join(root, "src", "policies", "index.js"), "module.exports = {};\n"],
    [path.join(root, "schemas", "plugin_folder_structure.status.schema.json"), defaultStatusSchema()],
    [path.join(root, "schemas", "git_library_inputs.schema.json"), defaultGitLibrarySchema()],
    [path.join(root, "schemas", "plugin_integration_contract.schema.json"), defaultIntegrationSchema()],
    [path.join(root, "tests", "unit", "status_service.test.js"), defaultUnitStatusTest()],
    [path.join(root, "tests", "unit", "target_path_service.test.js"), defaultUnitTargetPathTest()],
    [path.join(root, "tests", "contract", "plugin_contract.test.js"), defaultContractTest()]
  ];
  return { root, directories, files };
}

function buildWorkspaceStructurePlan(slug) {
  const root = path.join(repoRoot(), "workspaces", "plugins", slug);
  const directories = [
    ...SHARED_SHELL_FOLDERS.map((folder) => path.join(root, folder)),
    ...WORKSPACE_GOVERNANCE_FOLDERS.map((folder) => path.join(root, folder)),
    path.join(root, "inputs", "git_libraries", "library_analysis"),
    path.join(root, "inputs", "git_libraries", "license_review"),
    path.join(root, "inputs", "git_libraries", "security_review"),
    path.join(root, "inputs", "git_libraries", "compatibility_review"),
    path.join(root, "inputs", "git_libraries", "maintenance_review"),
    path.join(root, "source", slug),
    path.join(root, "roadmaps_plans", "integration_plan"),
    path.join(root, "specifications", "integration_specification"),
    path.join(root, "tests", "unit"),
    path.join(root, "tests", "integration"),
    path.join(root, "evidence_audit", "owner_approval_evidence"),
    path.join(root, "evidence_audit", "marketplace_request_evidence")
  ];
  const files = [
    [path.join(root, "plugin_workspace_manifest.json"), defaultWorkspaceManifest(slug)],
    [path.join(root, "README.md"), defaultWorkspaceReadme(slug)],
    [path.join(root, "docs", "README.md"), "# Docs\n"],
    [path.join(root, "prompts", "README.md"), "# Prompts\n"],
    [path.join(root, "runtime", "README.md"), "# Runtime\n"],
    [path.join(root, "dashboard", "README.md"), "# Dashboard\n"],
    [path.join(root, "viber_blocking", "README.md"), "# Viber Blocking\n"],
    [path.join(root, "src", "README.md"), "# Source\n"],
    [path.join(root, "schemas", "README.md"), "# Schemas\n"],
    [path.join(root, "tests", "README.md"), "# Tests\n"],
    [path.join(root, "inputs", "git_libraries", "libraries.md"), "# Git libraries\n"],
    [path.join(root, "inputs", "git_libraries", "selected_libraries.json"), "{\n  \"libraries\": []\n}\n"],
    [path.join(root, "inputs", "git_libraries", "adoption_decisions.md"), "# Adoption decisions\n"],
    [path.join(root, "source", "README.md"), "# Candidate source\n"],
    [path.join(root, "roadmaps_plans", "README.md"), "# Roadmaps and plans\n"],
    [path.join(root, "specifications", "README.md"), "# Specifications\n"],
    [path.join(root, "version_control", "README.md"), "# Version control\n"],
    [path.join(root, "evolutions", "README.md"), "# Evolutions\n"],
    [path.join(root, "task_punches", "README.md"), "# Task punches\n"],
    [path.join(root, "agents", "README.md"), "# Agents\n"],
    [path.join(root, "tests_quality", "README.md"), "# Tests quality\n"],
    [path.join(root, "evidence_audit", "README.md"), "# Evidence audit\n"],
    [path.join(root, "reviews_approvals", "README.md"), "# Reviews and approvals\n"],
    [path.join(root, "package_release", "README.md"), "# Package release\n"],
    [path.join(root, "documentation", "README.md"), "# Documentation\n"],
    [path.join(root, "archive", "README.md"), "# Archive\n"]
  ];
  return { root, directories, files };
}

function createTargetStructure(context, deps = {}) {
  const track = resolveTrack(context);
  const slug = slugify(context.plugin_slug || context.value || context.rest[0] || context.flags.slug || "");
  if (!isSafeSlug(slug)) throw pluginFolderError(`Invalid plugin slug: ${slug || "(empty)"}`);
  if (track === "viber") {
    throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  }

  const plan = track === "owner" ? buildOwnerStructurePlan(slug) : buildWorkspaceStructurePlan(slug);
  const exists = fs.existsSync(plan.root);
  if (exists && !dirIsEmpty(plan.root)) {
    throw pluginFolderError(`Target already exists and is not empty: ${plan.root}`);
  }

  for (const dir of plan.directories) {
    ensureDir(dir);
  }
  for (const [filePath, content] of plan.files) {
    writeFileIfMissing(filePath, content);
  }

  return {
    report_type: "plugin_folder_structure_create",
    status: "created",
    track,
    plugin_slug: slug,
    target_root: plan.root,
    message: track === "owner"
      ? `Created owner plugin at ./plugins/${slug}/`
      : `Created plugin development workspace at ./workspaces/plugins/${slug}/`
  };
}

function defaultOwnerPluginJson(slug) {
  return JSON.stringify({
    plugin_id: "plugin_folder_structure",
    id: "plugin_folder_structure",
    name: "Plugin Folder Structure",
    plugin_version: "1.0.0",
    version: "1.0.0",
    bundle_type: "removable",
    load_strategy: "manifest_driven",
    command_entrypoint: "plugins/plugin_folder_structure/bootstrap.js",
    runtime_entrypoint: "plugins/plugin_folder_structure/bootstrap.js",
    entry: "bootstrap.js",
    runtime_path: "plugins/plugin_folder_structure/bootstrap.js",
    removable: true,
    track: "framework_owner",
    plugin_family: "framework_plugin",
    plugin_type: "kvdf_core",
    type: "kvdf_core",
    status: "owner_direct_development",
    enabled_by_default: true,
    description: `Owner direct plugin shell for ${slug}.`,
    commands: ["status", "create", "validate", "readiness", "git-library", "integration", "request-owner-review", "request-marketplace-upload", "init-source"],
    depends_on: [],
    integrates_with: ["plugin_loader", "session_track", "planner", "evolution"],
    provides: ["track-aware plugin folder creation", "track-aware plugin workspace validation", "governed plugin promotion requests"],
    consumes: ["active track", "plugin slug", "git library input records", "integration records"],
    conflicts_with: ["viber_app_direct_plugin_creation"],
    permissions_required: ["filesystem_write", "workspace_state_read", "plugin_registry_read"],
    docs_surface: [
      "docs/README.md",
      "docs/OVERVIEW.md",
      "docs/TRACK_BOUNDARIES.md",
      "docs/COMMANDS.md",
      "docs/ACCEPTANCE_CRITERIA.md",
      "docs/OWNER_TRACK_DIRECT_PLUGIN_FLOW.md",
      "docs/PLUGIN_DEVELOPMENT_TRACK_FLOW.md",
      "docs/VIBER_TRACK_BLOCKING_RULE.md",
      "docs/GIT_LIBRARY_INPUTS.md",
      "docs/INTEGRATIONS.md",
      "docs/PLUGIN_INTEGRATION_LAYER.md",
      "docs/MARKETPLACE_REQUEST_FLOW.md",
      "docs/git_libraries/README.md"
    ],
    schemas: [
      "plugins/plugin_folder_structure/schemas/plugin_folder_structure.status.schema.json",
      "plugins/plugin_folder_structure/schemas/git_library_inputs.schema.json",
      "plugins/plugin_folder_structure/schemas/plugin_integration_contract.schema.json"
    ]
  }, null, 2) + "\n";
}

function defaultWorkspaceManifest(slug) {
  return JSON.stringify({
    plugin_slug: slug,
    track: "plugin_development_track",
    target_root: `./workspaces/plugins/${slug}/`,
    final_direct_install_target: `./plugins/${slug}/`,
    future_marketplace_target: `./marketplace/plugins/${slug}/`,
    status: "draft",
    installed: false,
    marketplace_published: false,
    owner_approval_required_for_promotion: true
  }, null, 2) + "\n";
}

function defaultOwnerManifest(slug) {
  return JSON.stringify({
    plugin_slug: slug,
    track: "owner_track",
    target_root: `./plugins/${slug}/`,
    status: "owner_direct_development",
    installed_path: `./plugins/${slug}/`,
    marketplace_published: false,
    owner_created_directly: true
  }, null, 2) + "\n";
}

function defaultReadme(slug) { return `# ${slug}\n`; }
function defaultWorkspaceReadme(slug) { return `# ${slug} workspace\n`; }
function defaultChangelog() { return "# Changelog\n\n## 1.0.0\n\n- Initial structure.\n"; }
function defaultBootstrapJs() { return `const { pluginFolderStructure } = require("./src");\n\nmodule.exports = {\n  plugin_id: "plugin_folder_structure",\n  name: "Plugin Folder Structure",\n  command_entrypoint: "plugins/plugin_folder_structure/bootstrap.js",\n  runtime_entrypoint: "plugins/plugin_folder_structure/bootstrap.js",\n  pluginFolderStructure\n};\n`; }
function defaultOwnerIndexJs() { return `const { registerPluginFolderStructure } = require("./commands/register");\n\nmodule.exports = {\n  registerPluginFolderStructure\n};\n`; }
function defaultStatusCommandJs() { return `const { buildStatusReport, renderStatusReport } = require("../services/status_service");\n\nmodule.exports = {\n  buildStatusReport,\n  renderStatusReport\n};\n`; }
function defaultCreateCommandJs() { return `const { createTargetStructure } = require("../services/target_path_service");\n\nmodule.exports = {\n  createTargetStructure\n};\n`; }
function defaultRegisterCommandJs() { return `function registerPluginFolderStructure() {\n  return { command: "plugin-folder" };\n}\n\nmodule.exports = {\n  registerPluginFolderStructure\n};\n`; }
function defaultConstantsJs() { return `const OWNER_ROOT = "plugins";\nconst WORKSPACE_ROOT = "workspaces/plugins";\nconst SHARED_SHELL_FOLDERS = ["docs", "prompts", "runtime", "dashboard", "viber_blocking", "src", "schemas", "tests"];\n\nmodule.exports = {\n  OWNER_ROOT,\n  WORKSPACE_ROOT,\n  SHARED_SHELL_FOLDERS\n};\n`; }
function defaultErrorsJs() { return `class PluginFolderError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = "PluginFolderError";\n  }\n}\n\nfunction pluginFolderError(message) {\n  return new PluginFolderError(message);\n}\n\nmodule.exports = {\n  PluginFolderError,\n  pluginFolderError\n};\n`; }
function defaultTrackResolverJs() { return `const { pluginFolderError } = require("./errors");\n\nfunction resolveTrack(context = {}) {\n  const value = String(context.flags && context.flags.track || "").trim().toLowerCase();\n  if (!value) return "owner";\n  if ([\"owner\", \"framework_owner\", \"owner_track\"].includes(value)) return \"owner\";\n  if ([\"plugin_dev\", \"plugin-development\", \"plugin_development\", \"plugin_development_track\"].includes(value)) return \"plugin_dev\";\n  if ([\"viber\", \"vibe\", \"vibe_app_developer\"].includes(value)) return \"viber\";\n  throw pluginFolderError(\`Invalid track: \${value}\`);\n}\n\nmodule.exports = {\n  resolveTrack\n};\n`; }
function defaultPluginContextJs() { return `const { resolveTrack } = require("./track_resolver");\n\nfunction buildPluginContext({ action, value, flags = {}, rest = [], deps = {} } = {}) {\n  return {\n    action,\n    value,\n    flags,\n    rest,\n    deps,\n    plugin_slug: String(flags.slug || value || rest[0] || "").trim(),\n    track: resolveTrack({ flags })\n  };\n}\n\nmodule.exports = {\n  buildPluginContext\n};\n`; }
function defaultStatusServiceJs() { return `module.exports = require("../services/status_service");\n`; }
function defaultTargetPathServiceJs() { return `module.exports = require("../services/target_path_service");\n`; }
function defaultValidationServiceJs() { return `module.exports = require("../services/validation_service");\n`; }
function defaultGitLibraryServiceJs() { return `module.exports = require("../services/git_library_service");\n`; }
function defaultIntegrationServiceJs() { return `module.exports = require("../services/integration_service");\n`; }
function defaultReviewRequestServiceJs() { return `module.exports = require("../services/review_request_service");\n`; }
function defaultSourceServiceJs() { return `module.exports = require("../services/source_service");\n`; }
function defaultSlugifyJs() { return `function slugify(value) {\n  const raw = String(value || \"\").trim().toLowerCase();\n  if (!raw) return \"\";\n  return raw\n    .replace(/[^a-z0-9]+/g, \"-\")\n    .replace(/-+/g, \"-\")\n    .replace(/^-|-$/g, \"\");\n}\n\nfunction isSafeSlug(value) {\n  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || \"\"));\n}\n\nmodule.exports = {\n  slugify,\n  isSafeSlug\n};\n`; }
function defaultJsonSafeJs() { return `const fs = require("fs");\nconst path = require("path");\n\nfunction readJson(filePath, fallback = null) {\n  if (!fs.existsSync(filePath)) return fallback;\n  return JSON.parse(fs.readFileSync(filePath, "utf8"));\n}\n\nfunction writeJson(filePath, value) {\n  fs.mkdirSync(path.dirname(filePath), { recursive: true });\n  fs.writeFileSync(filePath, \`\${JSON.stringify(value, null, 2)}\\n\`, "utf8");\n}\n\nmodule.exports = {\n  readJson,\n  writeJson\n};\n`; }
function defaultFsSafeJs() { return `const fs = require("fs");\nconst path = require("path");\n\nfunction ensureDir(dirPath) {\n  fs.mkdirSync(dirPath, { recursive: true });\n}\n\nfunction writeFileIfMissing(filePath, content) {\n  if (fs.existsSync(filePath)) return false;\n  ensureDir(path.dirname(filePath));\n  fs.writeFileSync(filePath, content, "utf8");\n  return true;\n}\n\nfunction dirIsEmpty(dirPath) {\n  if (!fs.existsSync(dirPath)) return true;\n  return fs.readdirSync(dirPath).length === 0;\n}\n\nmodule.exports = {\n  ensureDir,\n  writeFileIfMissing,\n  dirIsEmpty\n};\n`; }
function defaultOwnerDocsOverview() { return "# Overview\\n"; }
function defaultTrackBoundaries() { return "# Track Boundaries\\n"; }
function defaultCommandsDoc() { return "# Commands\\n"; }
function defaultAcceptanceDoc() { return "# Acceptance Criteria\\n"; }
function defaultOwnerFlowDoc() { return "# Owner Track Direct Plugin Flow\\n"; }
function defaultPluginDevFlowDoc() { return "# Plugin Development Track Flow\\n"; }
function defaultViberDoc() { return "# Viber/App Track Blocking Rule\\n"; }
function defaultGitLibraryDoc() { return "# Git Library Inputs\\n"; }
function defaultIntegrationsMd() { return "# Integrations\\n"; }
function defaultIntegrationDoc() { return "# Plugin Integration Layer\\n"; }
function defaultMarketplaceDoc() { return "# Marketplace Request Flow\\n"; }
function defaultStatusSchema() { return JSON.stringify({ type: "object" }, null, 2) + "\n"; }
function defaultGitLibrarySchema() { return JSON.stringify({ type: "object" }, null, 2) + "\n"; }
function defaultIntegrationSchema() { return JSON.stringify({ type: "object" }, null, 2) + "\n"; }
function defaultUnitStatusTest() { return "const assert = require('assert'); assert.ok(true);\n"; }
function defaultUnitTargetPathTest() { return "const assert = require('assert'); assert.ok(true);\n"; }
function defaultContractTest() { return "const assert = require('assert'); assert.ok(true);\n"; }

module.exports = {
  buildOwnerStructurePlan,
  buildWorkspaceStructurePlan,
  createTargetStructure
};
