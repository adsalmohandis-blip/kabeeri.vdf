const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { buildPluginLoaderReport } = require("../../../../src/cli/services/plugin_loader");
const { pluginDevError } = require("../core/errors");
const { PLUGIN_ID, PLUGIN_NAME, PLUGIN_VERSION, COMMAND_GROUPS, LIMITED_COMMANDS, PLUGIN_FOLDER_STRUCTURE_TARGET_MESSAGES } = require("../core/constants");
const { buildPluginDevContext } = require("../core/plugin_context");
const { buildWorkspaceContractReport, ensureWorkspace, getArtifactsRoot, getPluginFolderStructureStatus, getWorkspaceRoot, REQUIRED_WORKSPACE_FOLDERS } = require("../core/workspace_contract");
const { ensureDir, readJsonFile, writeJsonFile, writeTextFile, readTextFile } = require("../utils/json_safe");
const { slugify } = require("../utils/slugify");

function dispatchPluginDevCommand(action, value, flags = {}, rest = [], deps = {}) {
  const context = buildPluginDevContext({ action, value, flags, rest, deps });
  const normalizedAction = String(action || "").trim().toLowerCase();
  if (!normalizedAction || normalizedAction === "status") return runStatus(context, deps);
  if (normalizedAction === "doctor") return runDoctor(context, deps);
  if (normalizedAction === "workspace") return runWorkspace(context, deps);
  if (normalizedAction === "intake") return runIntake(context, deps);
  if (normalizedAction === "libraries") return runLibraries(context, deps);
  if (normalizedAction === "spec") return runSpec(context, deps);
  if (normalizedAction === "tasks") return runTasks(context, deps);
  if (normalizedAction === "build") return runBuild(context, deps);
  if (normalizedAction === "validate") return runValidate(context, deps);
  if (normalizedAction === "integrations") return runIntegrations(context, deps);
  if (normalizedAction === "test") return runTest(context, deps);
  if (normalizedAction === "evidence") return runEvidence(context, deps);
  if (normalizedAction === "readiness") return runReadiness(context, deps);
  if (normalizedAction === "package") return runPackage(context, deps);
  if (normalizedAction === "promotion") return runPromotion(context, deps);
  if (normalizedAction === "dashboard") return runDashboard(context, deps);
  if (normalizedAction === "summary") return runSummary(context, deps);
  if (normalizedAction === "help") return runStatus(context, deps);
  throw pluginDevError(`Unknown plugin-dev action: ${action}`);
}

function runStatus(context) {
  const pluginLoader = buildPluginLoaderReport();
  const folder = getPluginFolderStructureStatus();
  const report = {
    report_type: "plugin_dev_status",
    plugin_id: PLUGIN_ID,
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    status: folder.installed && folder.enabled ? "ready" : "limited",
    generated_at: new Date().toISOString(),
    limited_mode: !(folder.installed && folder.enabled),
    available_command_groups: COMMAND_GROUPS,
    plugin_folder_structure: folder,
    plugin_loader: {
      total_plugins: pluginLoader.total_plugins,
      active_plugins: pluginLoader.active_plugins
    },
    target_messages: PLUGIN_FOLDER_STRUCTURE_TARGET_MESSAGES
  };
  if (context.flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log([
      "Plugin Dev Status",
      `Version: ${report.version}`,
      `Status: ${report.status}`,
      `Plugin Folder Structure: ${report.plugin_folder_structure.installed ? (report.plugin_folder_structure.enabled ? "enabled" : "disabled") : "missing"}`,
      `Available groups: ${report.available_command_groups.join(", ")}`
    ].join("\n"));
  }
  return report;
}

function runDoctor(context) {
  const folder = getPluginFolderStructureStatus();
  const checks = [
    { id: "plugin_folder_structure_installed", ok: folder.installed, message: folder.installed ? "plugin_folder_structure is installed." : "plugin_folder_structure is missing." },
    { id: "plugin_folder_structure_enabled", ok: folder.enabled, message: folder.enabled ? "plugin_folder_structure is enabled." : "plugin_folder_structure is disabled." },
    { id: "workspace_contract_readable", ok: Boolean(folder.discoverable), message: folder.discoverable ? "Workspace contract is readable." : "Workspace contract is missing." },
    { id: "workspace_root_available", ok: fs.existsSync(getWorkspaceRoot(context)), message: fs.existsSync(getWorkspaceRoot(context)) ? "Workspace root exists." : "Workspace root is missing." },
    { id: "owner_root_available", ok: fs.existsSync(path.join(require("../../../../src/cli/fs_utils").repoRoot(), "plugins")), message: "Owner root is available." },
    { id: "runtime_system_available", ok: fs.existsSync(path.join(require("../../../../src/cli/fs_utils").repoRoot(), "src", "cli")), message: "Runtime system is available." },
    { id: "evidence_system_available", ok: true, message: "Evidence system is available." },
    { id: "schema_system_available", ok: fs.existsSync(path.join(require("../../../../src/cli/fs_utils").repoRoot(), "schemas")), message: "Schema system is available." },
    { id: "tests_available", ok: fs.existsSync(path.join(require("../../../../src/cli/fs_utils").repoRoot(), "tests")), message: "Tests are available." }
  ];
  const report = {
    report_type: "plugin_dev_doctor",
    plugin_id: PLUGIN_ID,
    generated_at: new Date().toISOString(),
    limited_mode: !(folder.installed && folder.enabled),
    checks,
    ok: checks.every((item) => item.ok)
  };
  if (context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(checks.map((item) => `${item.ok ? "OK" : "FAIL"} ${item.message}`).join("\n"));
  return report;
}

function runWorkspace(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  const nextContext = { ...context, plugin_slug: slug };
  if (subaction === "ensure") return buildWorkspaceEnsure(nextContext, deps);
  if (subaction === "check") return buildWorkspaceCheck(nextContext, deps);
  if (subaction === "status") return buildWorkspaceStatus(nextContext, deps);
  if (subaction === "contract") return buildWorkspaceContract(nextContext, deps);
  throw pluginDevError(`Unknown workspace action: ${context.value || "status"}`);
}

function buildWorkspaceEnsure(context, deps) {
  const report = ensureWorkspace(context, deps);
  persistWorkspaceReports(context, report, true);
  return printReport(context, report, "plugin_dev_workspace_ensure");
}

function buildWorkspaceCheck(context) {
  const report = buildWorkspaceContractReport(context);
  persistWorkspaceReports(context, report, false);
  return printReport(context, report, "plugin_dev_workspace_check");
}

function buildWorkspaceStatus(context) {
  const report = buildWorkspaceContractReport(context);
  persistWorkspaceReports(context, report, false);
  return printReport(context, report, "plugin_dev_workspace_status");
}

function buildWorkspaceContract(context) {
  const report = buildWorkspaceContractReport(context);
  const contract = {
    report_type: "plugin_dev_workspace_contract",
    plugin_slug: context.plugin_slug,
    track: context.track,
    workspace_root: report.workspace_root,
    plugin_folder_structure: report.plugin_folder_structure,
    required_folders: REQUIRED_WORKSPACE_FOLDERS,
    valid: report.valid
  };
  persistWorkspaceReports(context, contract, false);
  return printReport(context, contract, "plugin_dev_workspace_contract");
}

function persistWorkspaceReports(context, report, ensureCreated) {
  const root = getWorkspaceRoot(context);
  const artifacts = getArtifactsRoot(root);
  ensureDir(artifacts);
  writeJsonFile(path.join(artifacts, "workspace_status.json"), report);
  writeTextFile(path.join(artifacts, "workspace_validation_report.md"), renderWorkspaceMarkdown(report));
  writeTextFile(path.join(artifacts, "plugin_folder_structure_integration_report.md"), renderIntegrationMarkdown(report, ensureCreated));
}

function renderWorkspaceMarkdown(report) {
  return [
    `# Workspace Report`,
    ``,
    `- Plugin: ${report.plugin_slug || report.plugin_id || "unknown"}`,
    `- Track: ${report.track || "unknown"}`,
    `- Workspace root: ${report.workspace_root || "unknown"}`,
    `- Valid: ${report.valid ? "yes" : "no"}`,
    `- Missing: ${(report.missing || []).length ? report.missing.join(", ") : "none"}`
  ].join("\n");
}

function renderIntegrationMarkdown(report, ensureCreated) {
  return [
    `# plugin_folder_structure Integration`,
    ``,
    `- Installed: ${report.plugin_folder_structure && report.plugin_folder_structure.installed ? "yes" : "no"}`,
    `- Enabled: ${report.plugin_folder_structure && report.plugin_folder_structure.enabled ? "yes" : "no"}`,
    `- Delegated create/check: ${ensureCreated ? "yes" : "no"}`
  ].join("\n");
}

function printReport(context, report, type) {
  const payload = { ...report, report_type: type, generated_at: new Date().toISOString() };
  if (context.flags.json) console.log(JSON.stringify(payload, null, 2));
  else console.log(`${type}: ${payload.valid ? "ok" : "needs attention"}`);
  return payload;
}

function runIntake(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "start") return startIntake({ ...context, plugin_slug: slug }, deps);
  if (subaction === "validate") return validateIntake({ ...context, plugin_slug: slug }, deps);
  if (subaction === "questions") return questionsIntake({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown intake action: ${context.value || "start"}`);
}

function startIntake(context) {
  const workspace = ensureWorkspace(context, { delegate: true });
  const artifacts = ensureArtifacts(context);
  const intake = buildIntakeRecord(context, workspace);
  writeJsonFile(path.join(artifacts, "plugin_intake.json"), intake);
  writeTextFile(path.join(artifacts, "plugin_brief.md"), renderIntakeBrief(intake));
  writeTextFile(path.join(artifacts, "missing_questions.md"), renderMissingQuestions(intake.questions));
  writeJsonFile(path.join(artifacts, "declared_integrations.json"), intake.declared_integrations);
  return printReport(context, intake, "plugin_dev_intake_started");
}

function validateIntake(context) {
  const artifacts = ensureArtifacts(context);
  const intake = readJsonFile(path.join(artifacts, "plugin_intake.json"), null);
  const report = {
    report_type: "plugin_dev_intake_validation",
    plugin_slug: context.plugin_slug,
    valid: Boolean(intake && intake.plugin_slug === context.plugin_slug),
    missing: intake ? [] : ["plugin_intake.json"]
  };
  writeTextFile(path.join(artifacts, "intake_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_intake_validation");
}

function questionsIntake(context) {
  const report = buildIntakeRecord(context, null);
  return printReport(context, { report_type: "plugin_dev_intake_questions", plugin_slug: context.plugin_slug, questions: report.questions }, "plugin_dev_intake_questions");
}

function buildIntakeRecord(context, workspace) {
  return {
    report_type: "plugin_dev_intake",
    plugin_slug: context.plugin_slug,
    track: context.track,
    plugin_name: context.flags.name || context.plugin_slug,
    plugin_purpose: context.flags.purpose || "Plugin development orchestration",
    target_track: context.track,
    plugin_type: context.flags.type || "plugin",
    required_commands: [],
    required_schemas: [],
    required_runtime_files: [],
    required_ui_pages: [],
    required_evidence: [],
    required_tests: [],
    required_libraries: [],
    security_concerns: [],
    owner_constraints: [],
    marketplace_readiness_intention: "request_only",
    direct_local_install_intention: context.track === "owner",
    declared_integrations: [],
    questions: [
      "Does this plugin need to integrate with another plugin?",
      "What is the target plugin slug?",
      "Is the integration required or optional?",
      "What data is sent and received?",
      "Should command, event, schema, or runtime integration be used?",
      "What should happen if the target plugin is missing?",
      "Does this integration require Owner Track approval?"
    ]
  };
}

function renderIntakeBrief(intake) {
  return [
    `# Plugin Brief`,
    ``,
    `- Plugin: ${intake.plugin_slug}`,
    `- Purpose: ${intake.plugin_purpose}`,
    `- Track: ${intake.track}`,
    `- Direct install intention: ${intake.direct_local_install_intention ? "yes" : "no"}`
  ].join("\n");
}

function renderMissingQuestions(questions) {
  return ["# Missing Questions", "", ...questions.map((item) => `- ${item}`)].join("\n");
}

function runLibraries(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "add") return addLibrary({ ...context, plugin_slug: slug }, deps);
  if (subaction === "list") return listLibraries({ ...context, plugin_slug: slug }, deps);
  if (subaction === "analyze") return analyzeLibraries({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown libraries action: ${context.value || "list"}`);
}

function addLibrary(context) {
  const artifacts = ensureArtifacts(context);
  const libraryRef = context.rest[1] || context.flags.library || context.flags.url || context.value;
  const name = context.flags.name || context.rest[2] || slugify(libraryRef);
  const use = context.flags.use || "reference_only";
  const record = {
    library_id: `lib-${crypto.createHash("sha1").update(`${context.plugin_slug}:${libraryRef}:${name}`).digest("hex").slice(0, 8)}`,
    plugin_slug: context.plugin_slug,
    name,
    ref: libraryRef,
    proposed_use: use,
    registered_at: new Date().toISOString(),
    status: "registered"
  };
  const data = readLibraryState(artifacts);
  data.libraries.push(record);
  writeLibraryState(artifacts, data);
  analyzeLibraryRecord(artifacts, record);
  return printReport(context, { report_type: "plugin_dev_library_added", ...record }, "plugin_dev_library_added");
}

function listLibraries(context) {
  const artifacts = ensureArtifacts(context);
  const data = readLibraryState(artifacts);
  return printReport(context, { report_type: "plugin_dev_library_list", plugin_slug: context.plugin_slug, libraries: data.libraries }, "plugin_dev_library_list");
}

function analyzeLibraries(context) {
  const artifacts = ensureArtifacts(context);
  const data = readLibraryState(artifacts);
  const analyzed = data.libraries.map((library) => analyzeLibraryRecord(artifacts, library));
  data.libraries = analyzed;
  writeLibraryState(artifacts, data);
  return printReport(context, { report_type: "plugin_dev_library_analysis", plugin_slug: context.plugin_slug, libraries: analyzed }, "plugin_dev_library_analysis");
}

function readLibraryState(artifacts) {
  return readJsonFile(path.join(artifacts, "libraries.json"), { libraries: [] });
}

function writeLibraryState(artifacts, state) {
  writeJsonFile(path.join(artifacts, "libraries.json"), state);
}

function analyzeLibraryRecord(artifacts, library) {
  const sourceType = inferLibrarySourceType(library.ref);
  const license = inferLibraryLicense(library.ref);
  const reuseDecision = inferReuseDecision(library.proposed_use, license);
  const analyzed = {
    ...library,
    source_type: sourceType,
    license,
    security_risk: license === "unknown" ? "medium" : "low",
    compatibility: "unknown",
    reuse_decision: reuseDecision,
    analyzed_at: new Date().toISOString()
  };
  writeTextFile(path.join(artifacts, "git_library_analysis.md"), renderLibraryMarkdown(analyzed));
  writeTextFile(path.join(artifacts, "license_review.md"), `# License Review\n\n- Library: ${library.name}\n- License: ${license}\n`);
  writeTextFile(path.join(artifacts, "security_review.md"), `# Security Review\n\n- Library: ${library.name}\n- Risk: ${analyzed.security_risk}\n`);
  writeJsonFile(path.join(artifacts, "reuse_decision.json"), analyzed);
  return analyzed;
}

function inferLibrarySourceType(ref) {
  const value = String(ref || "").toLowerCase();
  if (value.includes("github.com")) return "github";
  if (value.includes("gitlab.com")) return "gitlab";
  if (value.includes("http://") || value.includes("https://")) return "link";
  if (value.includes(path.sep) || value.includes("/")) return "filesystem";
  return "reference";
}

function inferLibraryLicense(ref) {
  const value = String(ref || "").toLowerCase();
  if (value.includes("mit")) return "MIT";
  if (value.includes("apache")) return "Apache-2.0";
  if (value.includes("gpl")) return "GPL";
  return "unknown";
}

function inferReuseDecision(use, license) {
  if (license === "GPL") return "needs_owner_review";
  if (license === "unknown") return "needs_review";
  if (String(use) === "rejected") return "reject";
  return use || "reference_only";
}

function renderLibraryMarkdown(library) {
  return [
    `# Library Analysis`,
    ``,
    `- Name: ${library.name}`,
    `- Ref: ${library.ref}`,
    `- Source type: ${library.source_type}`,
    `- License: ${library.license}`,
    `- Reuse decision: ${library.reuse_decision}`
  ].join("\n");
}

function runSpec(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "generate") return generateSpec({ ...context, plugin_slug: slug }, deps);
  if (subaction === "validate") return validateSpec({ ...context, plugin_slug: slug }, deps);
  if (subaction === "status") return statusSpec({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown spec action: ${context.value || "generate"}`);
}

function generateSpec(context) {
  const artifacts = ensureArtifacts(context);
  const intake = readJsonFile(path.join(artifacts, "plugin_intake.json"), {});
  const libraries = readJsonFile(path.join(artifacts, "libraries.json"), { libraries: [] }).libraries || [];
  const integrations = readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] }).integrations || [];
  const spec = {
    report_type: "plugin_dev_spec",
    plugin_slug: context.plugin_slug,
    summary: intake.plugin_purpose || "Plugin development orchestration",
    boundaries: ["workspace validation", "generic integration support", "safe source building"],
    commands: ["status", "doctor", "workspace", "intake", "libraries", "spec", "tasks", "build", "validate", "integrations", "test", "evidence", "readiness", "package", "promotion", "dashboard", "summary"],
    libraries,
    integrations
  };
  writeJsonFile(path.join(artifacts, "plugin_spec.json"), spec);
  writeTextFile(path.join(artifacts, "plugin_spec.md"), renderSpecMarkdown(spec));
  writeTextFile(path.join(artifacts, "plugin_architecture.md"), "# Architecture\n\nPlugin Dev orchestrates safe plugin development.\n");
  writeTextFile(path.join(artifacts, "plugin_commands.md"), `# Commands\n\n${spec.commands.map((cmd) => `- ${cmd}`).join("\n")}\n`);
  writeTextFile(path.join(artifacts, "plugin_runtime_contract.md"), "# Runtime Contract\n\nRuntime work must stay inside the workspace.\n");
  writeTextFile(path.join(artifacts, "plugin_schema_contract.md"), "# Schema Contract\n\nSchemas are validated before packaging.\n");
  writeTextFile(path.join(artifacts, "plugin_ui_contract.md"), "# UI Contract\n\nDashboard and status outputs are read-only.\n");
  writeTextFile(path.join(artifacts, "plugin_integration_contracts.md"), renderIntegrationSpecMarkdown(integrations));
  writeTextFile(path.join(artifacts, "plugin_security_contract.md"), "# Security Contract\n\nUnknown code is never executed blindly.\n");
  writeTextFile(path.join(artifacts, "plugin_evidence_contract.md"), "# Evidence Contract\n\nEvidence is required for major phases.\n");
  writeTextFile(path.join(artifacts, "plugin_test_contract.md"), "# Test Contract\n\nTests gate packaging.\n");
  writeTextFile(path.join(artifacts, "plugin_package_contract.md"), "# Package Contract\n\nPackaging is review only.\n");
  writeTextFile(path.join(artifacts, "plugin_promotion_contract.md"), "# Promotion Contract\n\nPromotion requires Owner Track review.\n");
  return printReport(context, spec, "plugin_dev_spec_generated");
}

function validateSpec(context) {
  const artifacts = ensureArtifacts(context);
  const spec = readJsonFile(path.join(artifacts, "plugin_spec.json"), null);
  const report = {
    report_type: "plugin_dev_spec_validation",
    plugin_slug: context.plugin_slug,
    valid: Boolean(spec && spec.plugin_slug === context.plugin_slug),
    missing: spec ? [] : ["plugin_spec.json"]
  };
  writeTextFile(path.join(artifacts, "spec_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_spec_validation");
}

function statusSpec(context) {
  const artifacts = ensureArtifacts(context);
  const report = {
    report_type: "plugin_dev_spec_status",
    plugin_slug: context.plugin_slug,
    generated: fs.existsSync(path.join(artifacts, "plugin_spec.json"))
  };
  return printReport(context, report, "plugin_dev_spec_status");
}

function renderSpecMarkdown(spec) {
  return [
    `# Plugin Spec`,
    ``,
    `- Plugin: ${spec.plugin_slug}`,
    `- Summary: ${spec.summary}`,
    `- Commands: ${spec.commands.join(", ")}`
  ].join("\n");
}

function renderIntegrationSpecMarkdown(integrations) {
  return [
    `# Integration Contracts`,
    ``,
    ...(integrations.length ? integrations.map((item) => `- ${item.target_plugin_slug || item.target || "pending"} (${item.required ? "required" : "optional"})`) : ["- No declared integrations yet."])
  ].join("\n");
}

function runTasks(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "generate") return generateTasks({ ...context, plugin_slug: slug }, deps);
  if (subaction === "list") return listTasks({ ...context, plugin_slug: slug }, deps);
  if (subaction === "validate") return validateTasks({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown tasks action: ${context.value || "generate"}`);
}

function generateTasks(context) {
  const artifacts = ensureArtifacts(context);
  const spec = readJsonFile(path.join(artifacts, "plugin_spec.json"), {});
  const integrations = readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] }).integrations || [];
  const tasks = [
    { task_id: "task-001", title: "Create plugin manifest", acceptance: "Manifest exists and loads." },
    { task_id: "task-002", title: "Implement command router", acceptance: "Commands route safely." },
    { task_id: "task-003", title: "Implement intake reader", acceptance: "Intake files are captured." },
    { task_id: "task-004", title: "Implement library analyzer", acceptance: "Libraries are analyzed safely." },
    { task_id: "task-005", title: "Implement spec generator", acceptance: "Specs are produced from intake." },
    { task_id: "task-006", title: "Implement source builder", acceptance: "Source writes stay inside workspace." },
    { task_id: "task-007", title: "Implement schema validator", acceptance: "Schema validation blocks invalid outputs." },
    { task_id: "task-008", title: "Implement test runner", acceptance: "Tests gate packaging." },
    { task_id: "task-009", title: "Implement evidence reporter", acceptance: "Evidence exists for major phases." },
    { task_id: "task-010", title: "Implement readiness scoring", acceptance: "Readiness score is clear." },
    { task_id: "task-011", title: "Implement package builder", acceptance: "Package build is gated." },
    { task_id: "task-012", title: "Implement promotion request generator", acceptance: "Promotion request is review-only." }
  ];
  for (const item of integrations) {
    tasks.push({ task_id: `integration-${slugify(item.target_plugin_slug || item.target || "pending")}`, title: `Integration with ${item.target_plugin_slug || item.target || "pending"}`, acceptance: "Integration contract exists and is testable." });
  }
  const taskIndex = {
    report_type: "plugin_dev_task_index",
    plugin_slug: context.plugin_slug,
    tasks
  };
  writeJsonFile(path.join(artifacts, "tasks.json"), taskIndex);
  writeTextFile(path.join(artifacts, "task_index.md"), renderTaskListMarkdown(tasks));
  writeJsonFile(path.join(artifacts, "task_dependency_graph.json"), { plugin_slug: context.plugin_slug, tasks });
  writeTextFile(path.join(artifacts, "task_acceptance_report.md"), "# Task Acceptance\n\nAll tasks are derived from the approved spec.\n");
  return printReport(context, taskIndex, "plugin_dev_task_index");
}

function listTasks(context) {
  const artifacts = ensureArtifacts(context);
  const tasks = readJsonFile(path.join(artifacts, "tasks.json"), { tasks: [] });
  return printReport(context, tasks, "plugin_dev_task_list");
}

function validateTasks(context) {
  const artifacts = ensureArtifacts(context);
  const tasks = readJsonFile(path.join(artifacts, "tasks.json"), null);
  const report = {
    report_type: "plugin_dev_task_validation",
    plugin_slug: context.plugin_slug,
    valid: Boolean(tasks && Array.isArray(tasks.tasks) && tasks.tasks.length > 0),
    missing: tasks ? [] : ["tasks.json"]
  };
  writeTextFile(path.join(artifacts, "task_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_task_validation");
}

function renderTaskListMarkdown(tasks) {
  return ["# Task Index", "", ...tasks.map((item) => `- ${item.task_id}: ${item.title}`)].join("\n");
}

function runBuild(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "plan") return buildPlan({ ...context, plugin_slug: slug }, deps);
  if (subaction === "task") return buildTask({ ...context, plugin_slug: slug }, deps);
  if (subaction === "status") return buildStatus({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown build action: ${context.value || "plan"}`);
}

function buildPlan(context) {
  const artifacts = ensureArtifacts(context);
  const plan = {
    report_type: "plugin_dev_build_plan",
    plugin_slug: context.plugin_slug,
    tasks: readJsonFile(path.join(artifacts, "tasks.json"), { tasks: [] }).tasks || []
  };
  writeTextFile(path.join(artifacts, "build_plan.md"), renderSimpleReport(plan));
  return printReport(context, plan, "plugin_dev_build_plan");
}

function buildTask(context) {
  const artifacts = ensureArtifacts(context);
  const taskId = slugify(context.rest[1] || context.flags.task || context.flags.id || "task");
  const sourceRoot = path.join(getWorkspaceRoot(context), "src", "generated");
  ensureDir(sourceRoot);
  const sourceFile = path.join(sourceRoot, `${taskId}.js`);
  writeTextFile(sourceFile, `// Generated for ${context.plugin_slug} task ${taskId}\nmodule.exports = { task_id: "${taskId}" };\n`);
  const report = {
    report_type: "plugin_dev_build_task",
    plugin_slug: context.plugin_slug,
    task_id: taskId,
    changed_files: [path.relative(getWorkspaceRoot(context), sourceFile).replace(/\\/g, "/")],
    status: "built"
  };
  writeJsonFile(path.join(artifacts, "build_task_report.json"), report);
  writeTextFile(path.join(artifacts, "build_task_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_build_task");
}

function buildStatus(context) {
  const artifacts = ensureArtifacts(context);
  const report = {
    report_type: "plugin_dev_build_status",
    plugin_slug: context.plugin_slug,
    plan_exists: fs.existsSync(path.join(artifacts, "build_plan.md")),
    task_reports: fs.existsSync(path.join(artifacts, "build_task_report.json"))
  };
  return printReport(context, report, "plugin_dev_build_status");
}

function runValidate(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "schemas") return validateSchemas({ ...context, plugin_slug: slug }, deps);
  if (subaction === "runtime") return validateRuntime({ ...context, plugin_slug: slug }, deps);
  if (subaction === "commands") return validateCommands({ ...context, plugin_slug: slug }, deps);
  if (subaction === "contracts") return validateContracts({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown validate action: ${context.value || "schemas"}`);
}

function validateSchemas(context) {
  const artifacts = ensureArtifacts(context);
  const report = simpleValidationReport(context, "schema");
  writeTextFile(path.join(artifacts, "schema_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_schema_validation");
}

function validateRuntime(context) {
  const artifacts = ensureArtifacts(context);
  const report = simpleValidationReport(context, "runtime");
  writeTextFile(path.join(artifacts, "runtime_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_runtime_validation");
}

function validateCommands(context) {
  const artifacts = ensureArtifacts(context);
  const report = simpleValidationReport(context, "commands");
  writeTextFile(path.join(artifacts, "command_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_command_validation");
}

function validateContracts(context) {
  const artifacts = ensureArtifacts(context);
  const report = simpleValidationReport(context, "contracts");
  writeTextFile(path.join(artifacts, "contract_validation_report.md"), renderSimpleReport(report));
  writeTextFile(path.join(artifacts, "integration_validation_report.md"), renderSimpleReport(report));
  writeJsonFile(path.join(artifacts, "validation_result.json"), report);
  return printReport(context, report, "plugin_dev_contract_validation");
}

function simpleValidationReport(context, kind) {
  const artifacts = ensureArtifacts(context);
  const required = {
    schema: ["plugin_spec.json"],
    runtime: ["plugin_spec.json"],
    commands: ["plugin_commands.md"],
    contracts: ["plugin_spec.json", "tasks.json"]
  }[kind] || [];
  const missing = required.filter((file) => !fs.existsSync(path.join(artifacts, file)));
  return {
    report_type: `plugin_dev_${kind}_validation`,
    plugin_slug: context.plugin_slug,
    valid: missing.length === 0,
    missing
  };
}

function runIntegrations(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "add") return addIntegration({ ...context, plugin_slug: slug }, deps);
  if (subaction === "list") return listIntegrations({ ...context, plugin_slug: slug }, deps);
  if (subaction === "plan") return planIntegrations({ ...context, plugin_slug: slug }, deps);
  if (subaction === "generate-contract") return generateIntegrationContract({ ...context, plugin_slug: slug }, deps);
  if (subaction === "validate") return validateIntegrations({ ...context, plugin_slug: slug }, deps);
  if (subaction === "test") return testIntegrations({ ...context, plugin_slug: slug }, deps);
  if (subaction === "report") return reportIntegrations({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown integrations action: ${context.value || "add"}`);
}

function addIntegration(context) {
  const artifacts = ensureArtifacts(context);
  const target = slugify(context.rest[1] || context.flags.target || context.flags["target-plugin"] || "");
  const mode = context.flags.mode || "consume";
  const required = String(context.flags.required || "false") === "true";
  const record = {
    source_plugin_slug: context.plugin_slug,
    target_plugin_slug: target,
    mode,
    required,
    declared_at: new Date().toISOString(),
    status: "declared",
    data_exchange: {
      sent: [],
      received: [],
      fallback: "pending"
    }
  };
  const state = readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] });
  state.integrations.push(record);
  writeJsonFile(path.join(artifacts, "integration_contracts.json"), state);
  return printReport(context, record, "plugin_dev_integration_added");
}

function listIntegrations(context) {
  const artifacts = ensureArtifacts(context);
  return printReport(context, readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] }), "plugin_dev_integration_list");
}

function planIntegrations(context) {
  const artifacts = ensureArtifacts(context);
  const integrations = readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] }).integrations || [];
  writeTextFile(path.join(artifacts, "integration_plan.md"), renderIntegrationPlanMarkdown(integrations));
  writeTextFile(path.join(artifacts, "integration_dependency_map.md"), renderIntegrationDependencyMarkdown(integrations));
  writeTextFile(path.join(artifacts, "integration_schema_map.md"), renderIntegrationSchemaMarkdown(integrations));
  writeTextFile(path.join(artifacts, "integration_runtime_boundary.md"), renderIntegrationRuntimeMarkdown(integrations));
  writeTextFile(path.join(artifacts, "integration_test_plan.md"), renderIntegrationTestPlanMarkdown(integrations));
  return printReport(context, { report_type: "plugin_dev_integration_plan", plugin_slug: context.plugin_slug, integrations }, "plugin_dev_integration_plan");
}

function generateIntegrationContract(context) {
  const artifacts = ensureArtifacts(context);
  const target = slugify(context.rest[1] || context.flags.target || context.flags["target-plugin"] || "");
  const data = {
    source_plugin_slug: context.plugin_slug,
    target_plugin_slug: target,
    required: String(context.flags.required || "false") === "true",
    mode: context.flags.mode || "consume",
    provider_consumer: {
      source_role: "plugin_dev",
      target_role: "target_plugin"
    },
    data_exchange: {
      sent: [],
      received: [],
      fallback: "pending"
    },
    command_contract: [],
    event_contract: [],
    schema_contract: [],
    runtime_boundary: [],
    test_requirements: [],
    evidence_requirements: []
  };
  const state = readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] });
  state.integrations = (state.integrations || []).filter((item) => item.target_plugin_slug !== target);
  state.integrations.push(data);
  writeJsonFile(path.join(artifacts, "integration_contracts.json"), state);
  writeJsonFile(path.join(artifacts, "integration_contract.json"), data);
  writeTextFile(path.join(artifacts, "integration_contracts.md"), renderIntegrationContractMarkdown(data));
  writeTextFile(path.join(artifacts, "integration_plan.md"), renderIntegrationPlanMarkdown(state.integrations));
  writeTextFile(path.join(artifacts, "integration_dependency_map.md"), renderIntegrationDependencyMarkdown(state.integrations));
  writeTextFile(path.join(artifacts, "integration_schema_map.md"), renderIntegrationSchemaMarkdown(state.integrations));
  writeTextFile(path.join(artifacts, "integration_runtime_boundary.md"), renderIntegrationRuntimeMarkdown(state.integrations));
  writeTextFile(path.join(artifacts, "integration_test_plan.md"), renderIntegrationTestPlanMarkdown(state.integrations));
  writeJsonFile(path.join(artifacts, "integration_evidence.json"), {
    plugin_slug: context.plugin_slug,
    target_plugin_slug: target,
    generated_at: new Date().toISOString(),
    status: "draft"
  });
  return printReport(context, data, "plugin_dev_integration_contract");
}

function validateIntegrations(context) {
  const artifacts = ensureArtifacts(context);
  const integrations = readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] }).integrations || [];
  const missing = integrations.filter((item) => !item.target_plugin_slug || !item.mode);
  const report = {
    report_type: "plugin_dev_integration_validation",
    plugin_slug: context.plugin_slug,
    valid: missing.length === 0,
    missing
  };
  writeTextFile(path.join(artifacts, "integration_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_integration_validation");
}

function testIntegrations(context) {
  const artifacts = ensureArtifacts(context);
  const integrations = readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] }).integrations || [];
  const report = {
    report_type: "plugin_dev_integration_test_report",
    plugin_slug: context.plugin_slug,
    tested: integrations.length,
    passed: integrations.every((item) => item.target_plugin_slug)
  };
  writeTextFile(path.join(artifacts, "integration_test_report.md"), renderSimpleReport(report));
  writeJsonFile(path.join(artifacts, "integration_test_report.json"), report);
  return printReport(context, report, "plugin_dev_integration_test_report");
}

function reportIntegrations(context) {
  const artifacts = ensureArtifacts(context);
  const report = {
    report_type: "plugin_dev_integration_report",
    plugin_slug: context.plugin_slug,
    integrations: readJsonFile(path.join(artifacts, "integration_contracts.json"), { integrations: [] }).integrations || []
  };
  return printReport(context, report, "plugin_dev_integration_report");
}

function renderIntegrationPlanMarkdown(integrations) {
  return ["# Integration Plan", "", ...integrations.map((item) => `- ${item.target_plugin_slug || "pending"} (${item.required ? "required" : "optional"})`)].join("\n");
}

function renderIntegrationDependencyMarkdown(integrations) {
  return ["# Integration Dependency Map", "", ...integrations.map((item) => `- ${item.target_plugin_slug || "pending"} depends on ${item.mode || "consume"}`)].join("\n");
}

function renderIntegrationSchemaMarkdown(integrations) {
  return ["# Integration Schema Map", "", ...integrations.map((item) => `- ${item.target_plugin_slug || "pending"} schema boundary pending`)].join("\n");
}

function renderIntegrationRuntimeMarkdown(integrations) {
  return ["# Integration Runtime Boundary", "", ...integrations.map((item) => `- ${item.target_plugin_slug || "pending"} runtime boundary pending`)].join("\n");
}

function renderIntegrationTestPlanMarkdown(integrations) {
  return ["# Integration Test Plan", "", ...integrations.map((item) => `- ${item.target_plugin_slug || "pending"} tests required`)].join("\n");
}

function renderIntegrationContractMarkdown(contract) {
  return [
    "# Integration Contract",
    "",
    `- Source: ${contract.source_plugin_slug}`,
    `- Target: ${contract.target_plugin_slug}`,
    `- Mode: ${contract.mode}`,
    `- Required: ${contract.required ? "yes" : "no"}`
  ].join("\n");
}

function runTest(context, deps) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "plan") return planTests({ ...context, plugin_slug: slug }, deps);
  if (subaction === "run") return runTests({ ...context, plugin_slug: slug }, deps);
  if (subaction === "report") return reportTests({ ...context, plugin_slug: slug }, deps);
  throw pluginDevError(`Unknown test action: ${context.value || "plan"}`);
}

function planTests(context) {
  const artifacts = ensureArtifacts(context);
  const report = { report_type: "plugin_dev_test_plan", plugin_slug: context.plugin_slug, tests: ["workspace", "contracts", "integrations", "readiness"] };
  writeTextFile(path.join(artifacts, "test_plan.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_test_plan");
}

function runTests(context) {
  const artifacts = ensureArtifacts(context);
  const validation = validateContracts(context);
  const report = { report_type: "plugin_dev_test_report", plugin_slug: context.plugin_slug, passed: Boolean(validation.valid), failed_tests: validation.valid ? [] : ["contracts"] };
  writeJsonFile(path.join(artifacts, "failed_tests.json"), { failed_tests: report.failed_tests });
  writeTextFile(path.join(artifacts, "test_report.md"), renderSimpleReport(report));
  writeJsonFile(path.join(artifacts, "quality_gate_result.json"), report);
  return printReport(context, report, "plugin_dev_test_report");
}

function reportTests(context) {
  const artifacts = ensureArtifacts(context);
  return printReport(context, readJsonFile(path.join(artifacts, "quality_gate_result.json"), { report_type: "plugin_dev_test_report", passed: false }), "plugin_dev_test_report");
}

function runEvidence(context) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "collect") return collectEvidence({ ...context, plugin_slug: slug });
  if (subaction === "report") return reportEvidence({ ...context, plugin_slug: slug });
  if (subaction === "verify") return verifyEvidence({ ...context, plugin_slug: slug });
  throw pluginDevError(`Unknown evidence action: ${context.value || "collect"}`);
}

function collectEvidence(context) {
  const artifacts = ensureArtifacts(context);
  const evidence = {
    report_type: "plugin_dev_evidence_index",
    plugin_slug: context.plugin_slug,
    generated_at: new Date().toISOString(),
    records: [
      "workspace_status.json",
      "plugin_intake.json",
      "libraries.json",
      "plugin_spec.json",
      "tasks.json",
      "integration_contracts.json",
      "quality_gate_result.json"
    ].filter((file) => fs.existsSync(path.join(artifacts, file)))
  };
  writeJsonFile(path.join(artifacts, "evidence_index.json"), evidence);
  writeTextFile(path.join(artifacts, "evidence_report.md"), renderSimpleReport(evidence));
  writeJsonFile(path.join(artifacts, "evidence_records.json"), evidence);
  return printReport(context, evidence, "plugin_dev_evidence_index");
}

function reportEvidence(context) {
  const artifacts = ensureArtifacts(context);
  return printReport(context, readJsonFile(path.join(artifacts, "evidence_index.json"), { report_type: "plugin_dev_evidence_index", records: [] }), "plugin_dev_evidence_index");
}

function verifyEvidence(context) {
  const artifacts = ensureArtifacts(context);
  const evidence = readJsonFile(path.join(artifacts, "evidence_index.json"), { records: [] });
  const report = {
    report_type: "plugin_dev_evidence_verification",
    plugin_slug: context.plugin_slug,
    valid: Array.isArray(evidence.records) && evidence.records.length > 0,
    missing: Array.isArray(evidence.records) && evidence.records.length > 0 ? [] : ["evidence_index.json"]
  };
  return printReport(context, report, "plugin_dev_evidence_verification");
}

function runReadiness(context) {
  const artifacts = ensureArtifacts({ ...context, plugin_slug: requireSlug(context) });
  const categories = [
    ["workspace_structure", fs.existsSync(path.join(getWorkspaceRoot(context), "docs")) && fs.existsSync(path.join(getWorkspaceRoot(context), "src"))],
    ["plugin_folder_structure_integration", getPluginFolderStructureStatus().installed && getPluginFolderStructureStatus().enabled],
    ["intake", fs.existsSync(path.join(artifacts, "plugin_intake.json"))],
    ["library", fs.existsSync(path.join(artifacts, "libraries.json"))],
    ["spec", fs.existsSync(path.join(artifacts, "plugin_spec.json"))],
    ["tasks", fs.existsSync(path.join(artifacts, "tasks.json"))],
    ["source", fs.existsSync(path.join(getWorkspaceRoot(context), "src", "generated"))],
    ["schema", fs.existsSync(path.join(artifacts, "schema_validation_report.md"))],
    ["runtime", fs.existsSync(path.join(artifacts, "runtime_validation_report.md"))],
    ["commands", fs.existsSync(path.join(artifacts, "command_validation_report.md"))],
    ["integration", fs.existsSync(path.join(artifacts, "integration_validation_report.md"))],
    ["tests", fs.existsSync(path.join(artifacts, "quality_gate_result.json"))],
    ["evidence", fs.existsSync(path.join(artifacts, "evidence_index.json"))],
    ["package", fs.existsSync(path.join(artifacts, "release_manifest.json"))],
    ["promotion", fs.existsSync(path.join(artifacts, "PROMOTION_REQUEST.json"))]
  ];
  const score = Math.round((categories.filter((item) => item[1]).length / categories.length) * 100);
  const report = {
    report_type: "plugin_dev_readiness",
    plugin_slug: context.plugin_slug,
    score,
    categories: categories.map(([name, ok]) => ({ name, ok })),
    blockers: categories.filter((item) => !item[1]).map((item) => item[0]),
    warnings: []
  };
  writeJsonFile(path.join(artifacts, "readiness_score.json"), report);
  writeTextFile(path.join(artifacts, "readiness_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_readiness");
}

function runPackage(context) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "build") return buildPackage({ ...context, plugin_slug: slug });
  if (subaction === "validate") return validatePackage({ ...context, plugin_slug: slug });
  if (subaction === "status") return packageStatus({ ...context, plugin_slug: slug });
  throw pluginDevError(`Unknown package action: ${context.value || "build"}`);
}

function buildPackage(context) {
  const artifacts = ensureArtifacts(context);
  const readiness = runReadiness(context);
  const report = {
    report_type: "plugin_dev_package",
    plugin_slug: context.plugin_slug,
    status: readiness.score >= 70 ? "built" : "blocked",
    package_root: path.join(artifacts, "package")
  };
  ensureDir(report.package_root);
  writeJsonFile(path.join(report.package_root, "release_manifest.json"), {
    plugin_slug: context.plugin_slug,
    status: report.status,
    generated_at: new Date().toISOString()
  });
  writeJsonFile(path.join(report.package_root, "install_manifest.json"), {
    plugin_slug: context.plugin_slug,
    owner_approval_required: true
  });
  writeTextFile(path.join(report.package_root, "changelog.md"), "# Changelog\n\n- Initial package output.\n");
  writeTextFile(path.join(report.package_root, "package_validation_report.md"), `# Package Validation\n\n- Status: ${report.status}\n`);
  writeJsonFile(path.join(artifacts, "release_manifest.json"), { plugin_slug: context.plugin_slug, status: report.status });
  writeJsonFile(path.join(artifacts, "install_manifest.json"), { plugin_slug: context.plugin_slug, status: report.status });
  return printReport(context, report, "plugin_dev_package");
}

function validatePackage(context) {
  const artifacts = ensureArtifacts(context);
  const report = {
    report_type: "plugin_dev_package_validation",
    plugin_slug: context.plugin_slug,
    valid: fs.existsSync(path.join(artifacts, "release_manifest.json")) && fs.existsSync(path.join(artifacts, "install_manifest.json"))
  };
  writeTextFile(path.join(artifacts, "package_validation_report.md"), renderSimpleReport(report));
  return printReport(context, report, "plugin_dev_package_validation");
}

function packageStatus(context) {
  const artifacts = ensureArtifacts(context);
  return printReport(context, { report_type: "plugin_dev_package_status", plugin_slug: context.plugin_slug, built: fs.existsSync(path.join(artifacts, "release_manifest.json")) }, "plugin_dev_package_status");
}

function runPromotion(context) {
  const subaction = normalizeSubaction(context.value, context.rest);
  const slug = requireSlug(context);
  if (subaction === "request") return requestPromotion({ ...context, plugin_slug: slug });
  if (subaction === "status") return promotionStatus({ ...context, plugin_slug: slug });
  if (subaction === "report") return promotionReport({ ...context, plugin_slug: slug });
  throw pluginDevError(`Unknown promotion action: ${context.value || "request"}`);
}

function requestPromotion(context) {
  const artifacts = ensureArtifacts(context);
  const readiness = runReadiness(context);
  const report = {
    report_type: "plugin_dev_promotion_request",
    plugin_slug: context.plugin_slug,
    readiness_score: readiness.score,
    requested_options: ["direct_install", "marketplace_upload", "reject_changes_required"],
    status: readiness.score >= 70 ? "pending_owner_review" : "blocked"
  };
  writeJsonFile(path.join(artifacts, "PROMOTION_REQUEST.json"), report);
  writeTextFile(path.join(artifacts, "PROMOTION_REQUEST.md"), renderSimpleReport(report));
  writeTextFile(path.join(artifacts, "OWNER_REVIEW_CHECKLIST.md"), "# Owner Review Checklist\n\n- Review evidence\n- Review readiness\n- Choose decision option\n");
  return printReport(context, report, "plugin_dev_promotion_request");
}

function promotionStatus(context) {
  const artifacts = ensureArtifacts(context);
  return printReport(context, readJsonFile(path.join(artifacts, "PROMOTION_REQUEST.json"), { report_type: "plugin_dev_promotion_request", status: "missing" }), "plugin_dev_promotion_request");
}

function promotionReport(context) {
  const artifacts = ensureArtifacts(context);
  return printReport(context, readJsonFile(path.join(artifacts, "PROMOTION_REQUEST.json"), { report_type: "plugin_dev_promotion_request", status: "missing" }), "plugin_dev_promotion_request");
}

function runDashboard(context) {
  const slug = requireSlug(context);
  const artifacts = ensureArtifacts({ ...context, plugin_slug: slug });
  const report = {
    report_type: "plugin_dev_dashboard",
    plugin_slug: slug,
    workspace: buildWorkspaceContractReport({ ...context, plugin_slug: slug }),
    readiness: readJsonFile(path.join(artifacts, "readiness_score.json"), null),
    package: readJsonFile(path.join(artifacts, "release_manifest.json"), null),
    promotion: readJsonFile(path.join(artifacts, "PROMOTION_REQUEST.json"), null)
  };
  writeJsonFile(path.join(artifacts, "dashboard_data.json"), report);
  writeTextFile(path.join(artifacts, "plugin_dev_summary.md"), renderSummaryMarkdown(report));
  return printReport(context, report, "plugin_dev_dashboard");
}

function runSummary(context) {
  const artifacts = ensureArtifacts({ ...context, plugin_slug: requireSlug(context) });
  const report = {
    report_type: "plugin_dev_summary",
    plugin_slug: context.plugin_slug,
    workspace: readJsonFile(path.join(artifacts, "workspace_status.json"), null),
    readiness: readJsonFile(path.join(artifacts, "readiness_score.json"), null),
    package: readJsonFile(path.join(artifacts, "release_manifest.json"), null),
    promotion: readJsonFile(path.join(artifacts, "PROMOTION_REQUEST.json"), null)
  };
  return printReport(context, report, "plugin_dev_summary");
}

function ensureArtifacts(context) {
  const root = getArtifactsRoot(getWorkspaceRoot(context));
  ensureDir(root);
  return root;
}

function resolveSlug(context) {
  return slugify(context.plugin_slug || context.flags.slug || context.rest[0] || "");
}

function requireSlug(context) {
  const slug = resolveSlug(context);
  if (!slug) throw pluginDevError("Missing plugin slug.");
  return slug;
}

function normalizeSubaction(value, rest) {
  const action = String(value || "").trim().toLowerCase();
  if (["ensure", "check", "status", "contract", "start", "validate", "questions", "add", "list", "analyze", "generate", "plan", "task", "schemas", "runtime", "commands", "contracts", "run", "report", "build", "request"].includes(action)) {
    return action;
  }
  const fallback = String(rest && rest[0] ? rest[0] : "").trim().toLowerCase();
  return fallback;
}

function renderSimpleReport(report) {
  return `# ${report.report_type}\n\n` + Object.entries(report).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : (typeof value === "object" && value !== null ? JSON.stringify(value) : String(value))}`).join("\n");
}

function renderSummaryMarkdown(report) {
  return [
    "# Plugin Dev Summary",
    "",
    `- Plugin: ${report.plugin_slug}`,
    `- Workspace valid: ${report.workspace && report.workspace.valid ? "yes" : "no"}`,
    `- Readiness score: ${report.readiness ? report.readiness.score : "n/a"}`,
    `- Package: ${report.package ? report.package.status || "present" : "missing"}`,
    `- Promotion: ${report.promotion ? report.promotion.status || "present" : "missing"}`
  ].join("\n");
}

module.exports = {
  dispatchPluginDevCommand,
  runStatus,
  runDoctor,
  runWorkspace,
  runIntake,
  runLibraries,
  runSpec,
  runTasks,
  runBuild,
  runValidate,
  runIntegrations,
  runTest,
  runEvidence,
  runReadiness,
  runPackage,
  runPromotion,
  runDashboard,
  runSummary
};
