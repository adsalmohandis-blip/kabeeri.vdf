const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const { run } = require("../src/cli");
const { release } = require("../src/cli/commands/release");
const { plannerVisual } = require("../src/cli/commands/planner_visual");
const { buildPluginLoaderReport } = require("../src/cli/services/plugin_loader");
const evolutionService = require("../src/cli/services/evolution");
const wordpressStateService = require("../src/cli/services/wordpress");
const wordpressPlanService = require("../src/cli/services/wordpress_plans");
const { buildAppDocsPackageTemplates } = require("../src/cli/workspace");
const appPluginCatalog = require("../src/cli/services/app_plugin_catalog");
const { buildMultiAiRelayReport, watchMultiAiRelay } = require("../src/cli/commands/multi_ai_communications");
const { resolveDashboardScope } = require("../src/cli/commands/site");
const plannerVisualRenderer = require("../plugins/planner_visual/runtime");
const { version: packageVersion } = require("../package.json");

const repoRoot = path.resolve(__dirname, "..");
const PLUGIN_BUNDLE_DIRS = {
  "ai-learning": "ai_learning",
  "booking-builder": "booking_builder",
  "bootstrap_ui": "bootstrap_ui",
  "company-profile": "company_profile",
  "ecommerce-builder": "ecommerce_builder",
  "ecommerce-mobile-app": "ecommerce_mobile_app",
  "kvdf-dev": "kvdf_dev",
  "news-website": "news_website",
  "planner-visual": "planner_visual",
  "ui_ux_intelligence": "ui_ux_intelligence",
  "security-auditor": "security_auditor",
  "vibe-maintainer": "vibe_maintainer"
};

const UI_UX_INTELLIGENCE_FLAT_FILES = [
  "products.csv",
  "styles.csv",
  "colors.csv",
  "typography.csv",
  "ui-reasoning.csv",
  "ux-guidelines.csv",
  "charts.csv",
  "landing.csv",
  "icons.csv",
  "app-interface.csv",
  "react-performance.csv",
  "angular.csv",
  "astro.csv",
  "flutter.csv",
  "html-tailwind.csv",
  "jetpack-compose.csv",
  "laravel.csv",
  "nextjs.csv",
  "nuxt-ui.csv",
  "nuxtjs.csv",
  "react-native.csv",
  "react.csv",
  "shadcn.csv",
  "svelte.csv",
  "swiftui.csv",
  "threejs.csv",
  "vue.csv",
  "core.py",
  "search.py",
  "design_system.py",
  "quick-reference.md",
  "skill-content.md"
];

function getPluginBundleDir(pluginId) {
  return PLUGIN_BUNDLE_DIRS[pluginId] || pluginId;
}

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function runKvdf(args, options = {}) {
  const cwd = options.cwd || repoRoot;
  const previousCwd = process.cwd();
  const mergedEnv = { ...(options.env || {}) };
  mergedEnv.KVDF_DISABLE_GIT_SPAWN = "1";
  mergedEnv.KVDF_NO_OPEN = "1";
  const previousEnv = {};
  const previousLog = console.log;
  const previousError = console.error;
  const previousExitCode = process.exitCode;
  const stdout = [];
  const stderr = [];
  let status = 0;
  let thrown = null;
  process.chdir(cwd);
  process.exitCode = undefined;
  for (const [key, value] of Object.entries(mergedEnv)) {
    previousEnv[key] = Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : undefined;
    process.env[key] = String(value);
  }
  console.log = (...values) => stdout.push(util.format(...values));
  console.error = (...values) => stderr.push(util.format(...values));
  try {
    run(args);
  } catch (error) {
    status = 1;
    thrown = error;
    stderr.push(`Error: ${error.message}`);
  } finally {
    if (status === 0 && typeof process.exitCode === "number" && process.exitCode !== 0) {
      status = process.exitCode;
    }
    console.log = previousLog;
    console.error = previousError;
    process.chdir(previousCwd);
    process.exitCode = previousExitCode;
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
  const result = {
    status,
    stdout: stdout.join("\n") ? `${stdout.join("\n")}\n` : "",
    stderr: stderr.join("\n") ? `${stderr.join("\n")}\n` : ""
  };
  if (thrown && !options.expectFailure) {
    assert.fail(`kvdf ${args.join(" ")} failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  }
  if (options.expectFailure) {
    assert.notStrictEqual(status, 0, `Expected failure for kvdf ${args.join(" ")}`);
    return result;
  }
  assert.strictEqual(status, 0, `kvdf ${args.join(" ")} failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  return result;
}

function writeFakeGitRepo(dir, { remoteUrl = null, branch = "main", mergeRef = null } = {}) {
  const gitDir = path.join(dir, ".git");
  fs.mkdirSync(path.join(gitDir, "refs", "heads"), { recursive: true });
  fs.writeFileSync(path.join(gitDir, "HEAD"), `ref: refs/heads/${branch}\n`, "utf8");
  fs.writeFileSync(path.join(gitDir, "refs", "heads", branch), "0000000000000000000000000000000000000000\n", "utf8");
  const remoteSection = remoteUrl ? `\n[remote "origin"]\n\turl = ${remoteUrl}\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n` : "";
  const branchSection = mergeRef ? `\n[branch "${branch}"]\n\tremote = origin\n\tmerge = ${mergeRef}\n` : "";
  fs.writeFileSync(path.join(gitDir, "config"), `[core]\n\trepositoryformatversion = 0\n\tbare = false\n${remoteSection}${branchSection}`, "utf8");
}

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-test-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyPluginBundle(dir, pluginId) {
  fs.mkdirSync(path.join(dir, "plugins"), { recursive: true });
  const bundleDir = PLUGIN_BUNDLE_DIRS[pluginId] || pluginId;
  fs.cpSync(path.join(repoRoot, "plugins", bundleDir), path.join(dir, "plugins", bundleDir), { recursive: true });
}

function copyRepoFile(dir, relativePath) {
  const source = path.join(repoRoot, relativePath);
  const target = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function writeJsonFixture(dir, relativePath, data) {
  const target = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function seedViberEvolutionOrderFixture(dir, { appSlug = "storefront-web", slices = [] } = {}) {
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });

  const appRoot = path.join(dir, "workspaces", "apps", appSlug);
  fs.mkdirSync(path.join(appRoot, "docs"), { recursive: true });
  fs.mkdirSync(path.join(appRoot, "src"), { recursive: true });
  fs.mkdirSync(path.join(appRoot, "tests"), { recursive: true });
  fs.writeFileSync(path.join(appRoot, "README.md"), `# ${appSlug}\n`, "utf8");
  fs.writeFileSync(path.join(appRoot, "package.json"), JSON.stringify({ name: appSlug, private: true, version: "0.0.0" }, null, 2), "utf8");
  fs.writeFileSync(path.join(appRoot, "docs", "00-executive-summary.md"), "# Executive Summary\n", "utf8");
  fs.writeFileSync(path.join(appRoot, "docs", "01-overview.md"), "# Overview\n", "utf8");
  fs.writeFileSync(path.join(appRoot, "docs", "05-ux-principles.md"), "# UX Principles\n", "utf8");
  fs.writeFileSync(path.join(appRoot, "docs", "12-architecture-overview.md"), "# Architecture Overview\n", "utf8");
  fs.writeFileSync(path.join(appRoot, "src", "index.js"), "module.exports = {};\n", "utf8");
  fs.writeFileSync(path.join(appRoot, "tests", "app.test.js"), "const assert = require('assert');\nassert.ok(true);\n", "utf8");

  writeJsonFixture(dir, ".kabeeri/design_sources/sources.json", {
    sources: [
      {
        source_id: "source-001",
        title: "App docs",
        source_mode: "manual",
        recorded_at: new Date().toISOString()
      }
    ]
  });

  writeJsonFixture(dir, ".kabeeri/questionnaires/adaptive_intake_plan.json", {
    current_plan_id: "questionnaire-intake-001",
    plans: [
      {
        plan_id: "questionnaire-intake-001",
        approval_status: "approved",
        review_status: "reviewed",
        require_all_answers: true,
        generated_questions: [],
        created_at: new Date().toISOString()
      }
    ]
  });
  writeJsonFixture(dir, ".kabeeri/questionnaires/answers.json", { answers: [] });
  writeJsonFixture(dir, ".kabeeri/evolution.json", {
    changes: slices,
    impact_plans: [],
    current_change_id: null
  });
}

function makeViberEvolutionSlice(changeId, category, overrides = {}) {
  return {
    change_id: changeId,
    title: `${category} slice`,
    description: `${category} slice`,
    status: "approved",
    approval_status: "approved",
    audience: "vibe_app_developer",
    track: "vibe_app_developer",
    categories: [category],
    ...overrides
  };
}

function readViberEvolutionOrderReport(dir, slices = [], flags = {}) {
  const appSlug = flags.appSlug || "storefront-web";
  seedViberEvolutionOrderFixture(dir, { appSlug, slices });
  const args = ["evolution", "validate-order", "--app", appSlug, "--json"];
  if (flags.extraArgs) args.push(...flags.extraArgs);
  return JSON.parse(runKvdf(args, { cwd: dir }).stdout);
}

function loadPluginSmokeCases(pluginId) {
  const bundleDir = PLUGIN_BUNDLE_DIRS[pluginId] || pluginId;
  const smokePath = path.join(repoRoot, "plugins", bundleDir, "tests", "smoke-cases.json");
  return JSON.parse(fs.readFileSync(smokePath, "utf8"));
}

function runAppPluginSmokeCase(dir, pluginId, spec, smokeCase) {
  const bundleDir = PLUGIN_BUNDLE_DIRS[pluginId] || pluginId;
  copyPluginBundle(dir, pluginId);

  const projectSchema = JSON.parse(fs.readFileSync(path.join(dir, "plugins", bundleDir, "schemas", "project.schema.json"), "utf8"));
  assert.strictEqual(projectSchema.oneOf.length, (spec.supported_modes || []).length);
  assert.deepStrictEqual(
    projectSchema.oneOf.map((item) => item.properties.mode.const),
    spec.supported_modes || []
  );
  const briefSchema = JSON.parse(fs.readFileSync(path.join(dir, "plugins", bundleDir, "schemas", "brief.schema.json"), "utf8"));
  assert.deepStrictEqual(briefSchema.oneOf.map((item) => item.properties.mode.const), spec.supported_modes || []);
  const tasksSchema = JSON.parse(fs.readFileSync(path.join(dir, "plugins", bundleDir, "schemas", "tasks.schema.json"), "utf8"));
  assert.ok(Array.isArray(tasksSchema.properties.proposed_tasks.items.required));
  const designSchema = JSON.parse(fs.readFileSync(path.join(dir, "plugins", bundleDir, "schemas", "design.schema.json"), "utf8"));
  assert.deepStrictEqual(designSchema.oneOf.map((item) => item.properties.mode.const), spec.supported_modes || []);
  const approvalSchema = JSON.parse(fs.readFileSync(path.join(dir, "plugins", bundleDir, "schemas", "approval.schema.json"), "utf8"));
  assert.deepStrictEqual(approvalSchema.oneOf.map((item) => item.properties.mode.const), spec.supported_modes || []);

  const initialStatus = JSON.parse(runKvdf([pluginId, "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(initialStatus.plugin_enabled, false);
  assert.strictEqual(initialStatus.next_action, `kvdf plugins install ${pluginId}`);

  runKvdf(["plugins", "install", pluginId], { cwd: dir });

  const enabledStatus = JSON.parse(runKvdf([pluginId, "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(enabledStatus.plugin_enabled, true);
  assert.strictEqual(enabledStatus.next_action, `kvdf ${pluginId} init`);

  const mode = smokeCase.mode || spec.default_mode;
  runKvdf([pluginId, "init", "--mode", mode, "--name", smokeCase.project_name || spec.display_name, "--json"], { cwd: dir });

  if (smokeCase.kind === "blocked") {
    const blockedAction = smokeCase.blocked_action || "brief";
    const expectedError = smokeCase.expected_error || `${spec.display_name} ${blockedAction} blocked`;
    assert.match(runKvdf([pluginId, blockedAction, "--json"], { cwd: dir, expectFailure: true }).stderr, new RegExp(expectedError));
    runKvdf(["plugins", "uninstall", pluginId], { cwd: dir });
    const disabledStatus = JSON.parse(runKvdf([pluginId, "status", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(disabledStatus.plugin_enabled, false);
    assert.strictEqual(disabledStatus.next_action, `kvdf plugins install ${pluginId}`);
    return;
  }

  const questionIds = [
    ...(spec.common_questions || []).map((_, index) => `${pluginId}.common.${String(index + 1).padStart(2, "0")}`),
    ...((spec.mode_questions && spec.mode_questions[mode]) || []).map((_, index) => `${pluginId}.${mode}.${String(index + 1).padStart(2, "0")}`)
  ];
  const answers = questionIds.map((questionId) => `${questionId}:${questionId} answer`);

  const questionnaire = JSON.parse(runKvdf([pluginId, "questionnaire", "--answer", answers.join(","), "--json"], { cwd: dir }).stdout);
  assert.strictEqual(questionnaire.current_project.stage, "questionnaire");
  assert.strictEqual(questionnaire.current_project.blockers.length, 0);
  assert.strictEqual(questionnaire.current_project.questions, questionIds.length);
  assert.strictEqual(questionnaire.current_project.answers, questionIds.length);

  const brief = JSON.parse(runKvdf([pluginId, "brief", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(brief.current_project.stage, "brief");
  const briefState = JSON.parse(fs.readFileSync(path.join(dir, spec.state_file), "utf8"));
  assert.ok(briefState.projects[0].brief);

  const design = JSON.parse(runKvdf([pluginId, "design", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(design.current_project.stage, "design");
  const designState = JSON.parse(fs.readFileSync(path.join(dir, spec.state_file), "utf8"));
  assert.ok(designState.projects[0].design);

  const modules = JSON.parse(runKvdf([pluginId, "modules", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(modules.current_project.stage, "modules");
  assert.ok(modules.current_project.modules > 0);

  const planningReview = JSON.parse(runKvdf([pluginId, "review", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(planningReview.current_project.stage, "review");
  assert.strictEqual(planningReview.current_project.planning_review.status, "approved");

  const tasks = JSON.parse(runKvdf([pluginId, "tasks", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(tasks.current_project.stage, "tasks");
  assert.ok(tasks.current_project.tasks > 0);

  const approval = JSON.parse(runKvdf([pluginId, "approve", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(approval.current_project.stage, "approval");
  assert.strictEqual(approval.current_project.batches, 1);

  const report = JSON.parse(runKvdf([pluginId, "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.stage, "approval");
  assert.ok(report.next_actions.length > 0);

  const state = JSON.parse(fs.readFileSync(path.join(dir, spec.state_file), "utf8"));
  assert.strictEqual(state.current_project_id, approval.current_project.project_id);
  assert.strictEqual(state.projects[0].stage, smokeCase.expected_final_stage || "approval");

  runKvdf(["plugins", "uninstall", pluginId], { cwd: dir });
  const disabledStatus = JSON.parse(runKvdf([pluginId, "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(disabledStatus.plugin_enabled, false);
  assert.strictEqual(disabledStatus.next_action, `kvdf plugins install ${pluginId}`);
  assert.match(runKvdf([pluginId, "brief"], { cwd: dir, expectFailure: true }).stderr, new RegExp(`${spec.display_name} plugin blocked`));
}

test("root commands validate repository assets", () => {
  assert.match(runKvdf(["--version"]).stdout, new RegExp(`kvdf ${packageVersion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(runKvdf(["--help"]).stdout, /Kabeeri VDF CLI/);
  assert.match(runKvdf(["create", "--help"]).stdout, /kvdf create --profile lite/);
  for (const command of ["resume", "entry", "track", "guard", "conflict", "sync", "sprint", "session", "multi-ai", "acceptance", "developer", "agent", "lock", "pricing", "usage", "release", "design", "policy", "workstream", "vibe", "ask", "capture", "package", "upgrade", "cleaner", "maintenance", "vibe-maintainer", "readiness", "governance", "reports", "context-pack", "preflight", "model-route", "handoff", "security", "migration", "adr", "ai-run", "structure", "blueprint", "data-design", "evolution", "planner", "truth", "batch-exe", "pipeline", "company-profile", "news-website", "blog", "ecommerce-mobile-app", "crm", "pos", "ecommerce", "booking", "wordpress", "docs", "source-package", "capability"]) {
    const help = runKvdf([command, "--help"]).stdout;
    assert.match(help, /Usage:/, `${command} help should include usage`);
    assert.doesNotMatch(help, /No detailed help/, `${command} should have detailed help`);
  }
  assert.match(runKvdf(["evolution", "--help"]).stdout, /kvdf evolution scorecards/);
  assert.match(runKvdf(["validate"]).stdout, /plans.*valid|totals valid/s);
  assert.match(runKvdf(["validate", "runtime-schemas"]).stdout, /runtime schema registry checked/);
  assert.match(runKvdf(["validate", "foldering"]).stdout, /foldering map checked/);
  assert.match(runKvdf(["structure", "map"]).stdout, /Kabeeri Repository Foldering Map/);
  assert.match(runKvdf(["structure", "show", "standard_systems"]).stdout, /knowledge/);
  assert.match(runKvdf(["package", "check"]).stdout, /Kabeeri Product Packaging Check/);
  const rootResume = JSON.parse(runKvdf(["resume", "--json"]).stdout);
  assert.strictEqual(rootResume.mode, "framework_owner_development");
  assert.strictEqual(rootResume.primary_track.id, "framework_owner");
  assert.strictEqual(rootResume.evolution.next_priority, null);
  assert.ok(rootResume.owner_checkpoint);
  assert.strictEqual(rootResume.next_exact_action, "Run validation, commit intended KVDF Core changes on main, then push origin main.");
  assert.ok(rootResume.git_summary);
  const rootEntry = JSON.parse(runKvdf(["entry", "--json"]).stdout);
  assert.strictEqual(rootEntry.entry_route.track_id, "framework_owner");
  assert.strictEqual(rootEntry.entry_route.role_gate, "owner_only");
  assert.strictEqual(rootEntry.entry_route.route_command, "kvdf evolution priorities");
  assert.ok(rootEntry.entry_route.activated_features.includes("evolution temp"));
  assert.ok(rootEntry.entry_route.blocked_features.includes("app creation"));
  assert.strictEqual(JSON.parse(runKvdf(["guard", "--json"]).stdout).mode, "framework_source");
  assert.strictEqual(JSON.parse(runKvdf(["conflict", "scan", "--json"]).stdout).report_type, "framework_conflict_scan");
  const cleanerHelp = runKvdf(["cleaner", "--help"]).stdout;
  assert.match(cleanerHelp, /cleanup workflow/);
  assert.match(cleanerHelp, /cleaner relocate review/);
  assert.match(cleanerHelp, /--threshold 0\.9/);
  assert.match(cleanerHelp, /cleaner relocate/);
  const maintenanceHelp = runKvdf(["maintenance", "--help"]).stdout;
  assert.match(maintenanceHelp, /maintenance fast/);
  assert.match(maintenanceHelp, /maintenance slow/);
  const maintenanceFast = JSON.parse(runKvdf(["maintenance", "fast", "--json"]).stdout);
  assert.strictEqual(maintenanceFast.report_type, "kvdf_system_cleanup_audit");
  assert.strictEqual(maintenanceFast.workflow_mode, "fast");
  const maintenanceSlow = JSON.parse(runKvdf(["maintenance", "slow", "--json"]).stdout);
  assert.strictEqual(maintenanceSlow.report_type, "kvdf_system_cleanup_audit");
  assert.strictEqual(maintenanceSlow.workflow_mode, "slow");
  assert.strictEqual(maintenanceSlow.maintenance_relocation.review_mode, true);
  assert.match(runKvdf(["sync", "status"]).stdout, /Kabeeri GitHub Team Sync Status/);
  assert.match(runKvdf(["docs", "path"]).stdout, /docs[\\/]site[\\/]index\.html/);
  const sourcePackageHelp = runKvdf(["source-package", "--help"]).stdout;
  assert.match(sourcePackageHelp, /KVDF_New_Features_Docs/);
  assert.match(sourcePackageHelp, /source-package normalize/);
  assert.match(runKvdf(["capability", "--help"]).stdout, /kvdf capability search/);
  const sourcePackageSummary = JSON.parse(runKvdf(["source-package", "--json"]).stdout);
  assert.strictEqual(sourcePackageSummary.report_type, "kvdf_source_package_summary");
  assert.strictEqual(sourcePackageSummary.source_package, "KVDF_New_Features_Docs");
  assert.ok(sourcePackageSummary.source_package_roles.some((item) => /Software Design System/.test(item)));
  assert.strictEqual(sourcePackageSummary.normalization_report, "docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md");
  const sourcePackageInventory = JSON.parse(runKvdf(["source-package", "inventory", "--json"]).stdout);
  assert.strictEqual(sourcePackageInventory.report_type, "kvdf_source_package_inventory");
  assert.strictEqual(sourcePackageInventory.systems.length, 2);
  assert.ok(sourcePackageInventory.systems.some((item) => item.title === "Software Design System"));
  const sourcePackageMap = JSON.parse(runKvdf(["source-package", "map", "--json"]).stdout);
  assert.strictEqual(sourcePackageMap.report_type, "kvdf_source_package_destination_map");
  assert.strictEqual(sourcePackageMap.destinations.length, 2);
  assert.ok(sourcePackageMap.destinations.some((item) => item.destinations.includes("knowledge/design_system/software_design_reference/")));
  assert.ok(sourcePackageMap.destinations.some((item) => item.destinations.includes("knowledge/documentation_generator/")));
  const sourcePackageCapabilityMap = JSON.parse(runKvdf(["source-package", "source-map", "--json"]).stdout);
  assert.strictEqual(sourcePackageCapabilityMap.report_type, "kvdf_source_capability_mapping");
  assert.strictEqual(sourcePackageCapabilityMap.mappings.length, 2);
  assert.ok(sourcePackageCapabilityMap.mappings.some((item) => item.capability_surface.includes("kvdf capability registry")));
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageCapabilityMap.report_path)));
  const sourcePackagePlacement = JSON.parse(runKvdf(["source-package", "placement", "--json"]).stdout);
  assert.strictEqual(sourcePackagePlacement.report_type, "kvdf_source_package_placement_plan");
  assert.ok(sourcePackagePlacement.routes.some((item) => item.destination === "knowledge/design_system/software_design_reference/"));
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackagePlacement.report_path)));
  const sourcePackageNormalization = JSON.parse(runKvdf(["source-package", "normalize", "--json"]).stdout);
  assert.strictEqual(sourcePackageNormalization.report_type, "kvdf_source_package_normalization_map");
  assert.strictEqual(sourcePackageNormalization.source_folder_exists, false);
  assert.strictEqual(sourcePackageNormalization.normalized_roots.length, 0);
  assert.ok(sourcePackageNormalization.sections.some((item) => item.normalized_source_root === "software-design-system-to-follow"));
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageNormalization.report_path)));
  const sourcePackageCompare = JSON.parse(runKvdf(["source-package", "compare", "--json"]).stdout);
  assert.strictEqual(sourcePackageCompare.report_type, "kvdf_source_package_duplicate_analysis");
  assert.ok(sourcePackageCompare.top_matches.length > 0);
  assert.ok(sourcePackageCompare.top_matches.some((item) => item.area_key === "documentation"));
  assert.strictEqual(sourcePackageCompare.report_path, "docs/reports/KVDF_NEW_FEATURES_DOCS_DUPLICATE_ANALYSIS.md");
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageCompare.report_path)));
  const sourcePackageCleanup = JSON.parse(runKvdf(["source-package", "cleanup", "--json"]).stdout);
  assert.strictEqual(sourcePackageCleanup.report_type, "kvdf_source_package_cleanup_plan");
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageCleanup.report_path)));
  assert.ok(["completed", "decommissioned"].includes(sourcePackageCleanup.status));
  const sourcePackageDecommission = JSON.parse(runKvdf(["source-package", "decommission", "--json"]).stdout);
  assert.strictEqual(sourcePackageDecommission.report_type, "kvdf_source_package_decommission_request");
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageDecommission.report_path)));
  assert.strictEqual(sourcePackageDecommission.confirmation_required, true);
  assert.ok(["recorded", "pending_manual_removal"].includes(sourcePackageDecommission.status));
  const sourcePackageDecommissionConfirmed = JSON.parse(runKvdf(["source-package", "decommission", "--confirm-remove", "--json"]).stdout);
  assert.strictEqual(sourcePackageDecommissionConfirmed.confirmed, true);
  assert.strictEqual(sourcePackageDecommissionConfirmed.status, "recorded");
  assert.match(runKvdf(["software-design", "--help"]).stdout, /Software Design System Reference/);
  const softwareDesignReference = JSON.parse(runKvdf(["software-design", "index", "--json"]).stdout);
  assert.strictEqual(softwareDesignReference.reference_type, "software_design_reference");
  assert.ok(softwareDesignReference.files.some((item) => item.path.includes("SOFTWARE_DESIGN_SYSTEM_PATTERNS.md")));
  const softwareDesignMap = JSON.parse(runKvdf(["software-design", "map", "--json"]).stdout);
  assert.strictEqual(softwareDesignMap.catalog.catalog_type, "software_design_system_reference_catalog");
  assert.ok(softwareDesignMap.catalog.sections.some((item) => item.title === "Core Extraction Rules"));
  assert.ok(softwareDesignMap.catalog.sections.some((item) => item.title === "Duplicate Analysis Guardrails"));
  const softwareDesignCompare = JSON.parse(runKvdf(["software-design", "compare", "--json"]).stdout);
  assert.strictEqual(softwareDesignCompare.report_type, "software_design_reference_duplicate_analysis");
  assert.ok(softwareDesignCompare.top_matches.length > 0);
  assert.ok(softwareDesignCompare.top_matches.some((item) => item.area_key === "documentation"));
  assert.ok(fs.existsSync(path.join(repoRoot, softwareDesignCompare.report_path)));
  assert.match(runKvdf(["docs-generator", "--help"]).stdout, /Documentation Generator Reference/);
  const docsGeneratorReference = JSON.parse(runKvdf(["docs-generator", "index", "--json"]).stdout);
  assert.strictEqual(docsGeneratorReference.reference_type, "documentation_generator_reference");
  assert.ok(docsGeneratorReference.files.some((item) => item.path.includes("DOCS_GENERATION_REFERENCE.md")));
  const docsGeneratorMap = JSON.parse(runKvdf(["docs-generator", "map", "--json"]).stdout);
  assert.strictEqual(docsGeneratorMap.catalog.catalog_type, "documentation_generation_reference_catalog");
  assert.ok(docsGeneratorMap.catalog.sections.some((item) => item.title === "Lifecycle Stages"));
  assert.ok(docsGeneratorMap.catalog.sections.some((item) => item.title === "Duplicate Analysis Guardrails"));
  const docsGeneratorCompare = JSON.parse(runKvdf(["docs-generator", "compare", "--json"]).stdout);
  assert.strictEqual(docsGeneratorCompare.report_type, "documentation_generator_reference_duplicate_analysis");
  assert.ok(docsGeneratorCompare.top_matches.length > 0);
  assert.ok(docsGeneratorCompare.top_matches.some((item) => item.area_key === "documentation"));
  assert.ok(fs.existsSync(path.join(repoRoot, docsGeneratorCompare.report_path)));
  const sourcePackageMigration = JSON.parse(runKvdf(["source-package", "migration", "--json"]).stdout);
  assert.strictEqual(sourcePackageMigration.report_type, "kvdf_source_package_migration_state");
  assert.ok(sourcePackageMigration.permanent_targets.some((item) => item.title === "Software Design System Reference"));
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageMigration.report_path)));
  const sourcePackageManifest = JSON.parse(runKvdf(["source-package", "manifest", "--json"]).stdout);
  assert.strictEqual(sourcePackageManifest.report_type, "kvdf_source_package_relocation_manifest");
  assert.ok(sourcePackageManifest.sections.some((item) => item.title === "Software Design System"));
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageManifest.report_path)));
  assert.match(runKvdf(["onboarding"]).stdout, /Kabeeri Onboarding/);
  const docsGenerate = runKvdf(["docs", "generate"]);
  assert.match(docsGenerate.stdout, /Generated documentation site templates, pages, manifest, contracts, coverage, and workflow report/);
  const docsCoverage = JSON.parse(runKvdf(["docs", "coverage", "--json"]).stdout);
  assert.strictEqual(docsCoverage.report_type, "docs_site_deep_publishing_coverage");
  assert.strictEqual(docsCoverage.coverage.total_families, docsCoverage.coverage.complete_families);
  assert.ok(fs.existsSync(path.join(repoRoot, docsCoverage.report_path)));
  const docsSync = JSON.parse(runKvdf(["docs", "sync", "--json"]).stdout);
  assert.strictEqual(docsSync.report_type, "docs_site_sync_report");
  assert.strictEqual(docsSync.coverage.partial_families, 0);
  assert.ok(fs.existsSync(path.join(repoRoot, docsSync.report_path)));
  const siteManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "site", "site-manifest.json"), "utf8"));
  const pageContracts = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "site", "page-contracts.json"), "utf8"));
  assert.strictEqual(siteManifest.page_count, siteManifest.pages.length);
  assert.strictEqual(pageContracts.page_count, pageContracts.contracts.length);
  assert.strictEqual(pageContracts.contracts.length, siteManifest.page_count * 2);
  assert.ok(pageContracts.contracts.some((item) => item.slug === "what-is" && item.language === "en"));
  assert.match(runKvdf(["plan", "list"]).stdout, /v4\.0\.0/);
  assert.match(runKvdf(["plan", "list"]).stdout, /v5\.0\.0/);
  assert.match(runKvdf(["prompt-pack", "list"]).stdout, /react/i);
  assert.match(runKvdf(["prompt-pack", "show", "react-native-expo"]).stdout, /React Native Expo/);
  assert.match(runKvdf(["taks"], { expectFailure: true }).stderr, /Did you mean "task"/);
  assert.match(runKvdf(["evoltion"], { expectFailure: true }).stderr, /Did you mean "evolution"/);
});

test("onboarding persists enter route and resume guidance", () => withTempDir((dir) => {
  const onboarding = JSON.parse(runKvdf(["onboarding", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(onboarding.report_type, "session_onboarding");
  assert.ok(
    ["kvdf init --profile standard --goal \"Describe the application\"", "kvdf resume --json"].includes(onboarding.enter_command),
    "Onboarding should offer either the new-workspace or app-workspace enter command"
  );
  assert.strictEqual(onboarding.route_command, "kvdf entry");
  assert.strictEqual(onboarding.resume_command, "kvdf resume");
  assert.ok(fs.existsSync(path.join(dir, onboarding.report_path)));
  const saved = JSON.parse(fs.readFileSync(path.join(dir, onboarding.report_path), "utf8"));
  assert.strictEqual(saved.report_type, "session_onboarding");
  assert.strictEqual(saved.report_path, onboarding.report_path);
  assert.ok(saved.guide.first_steps.some((step) => /Enter with kvdf resume --json/.test(step) || /Use kvdf entry/.test(step)));
  const sessionTrack = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "session_track.json"), "utf8"));
  assert.strictEqual(sessionTrack.decision_source, "onboarding");
  assert.ok(["unknown_folder", "kabeeri_user_workspace"].includes(sessionTrack.started_from_mode));
  assert.ok(["kvdf init", "kvdf vibe brief"].includes(sessionTrack.route_command));
  assert.strictEqual(sessionTrack.active, true);
  const persisted = JSON.parse(runKvdf(["onboarding", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(persisted.report_type, "session_onboarding");
  assert.strictEqual(persisted.report_path, onboarding.report_path);
  assert.ok(persisted.recommended_commands.includes("kvdf entry"));
}));

test("resume persists a durable session track for workspace resumes", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  const report = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.mode, "kabeeri_user_workspace");
  assert.ok(report.next_exact_action);
  assert.match(runKvdf(["resume"], { cwd: dir }).stdout, /Next exact action:/);
  const sessionTrack = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "session_track.json"), "utf8"));
  assert.strictEqual(sessionTrack.decision_source, "resume");
  assert.strictEqual(sessionTrack.started_from_mode, "kabeeri_user_workspace");
  assert.strictEqual(sessionTrack.active_track, "vibe_app_developer");
  assert.strictEqual(sessionTrack.route_command, "kvdf vibe brief");
  assert.strictEqual(sessionTrack.active, true);
}));

test("resume separates Kabeeri framework source from user app npm roots", () => withTempDir((dir) => {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "customer-next-app",
    scripts: { dev: "next dev" },
    dependencies: { next: "15.0.0", react: "19.0.0" }
  }, null, 2));
  runKvdf(["init", "--profile", "standard", "--mode", "agile", "--no-intake"], { cwd: dir });
  const report = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.mode, "kabeeri_user_app_workspace");
  assert.strictEqual(report.primary_track.id, "vibe_app_developer");
  assert.ok(report.detected_app_stack.includes("nextjs"));
  assert.ok(report.root_roles.some((role) => role.role === "app_npm_root" && role.path === dir));
  assert.ok(report.warnings.some((warning) => /npm commands belong to the app root/.test(warning)));
  assert.ok(report.next_actions.some((action) => /Next\.js/.test(action)));
  const entryRoute = JSON.parse(runKvdf(["entry", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(entryRoute.entry_route.track_id, "vibe_app_developer");
  assert.strictEqual(entryRoute.entry_route.role_gate, "app_only");
  assert.strictEqual(entryRoute.entry_route.route_command, "kvdf vibe brief");
  assert.ok(entryRoute.entry_route.activated_features.includes("capture"));
  assert.ok(entryRoute.entry_route.blocked_features.includes("evolution"));
  const appTrack = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "session_track.json"), "utf8"));
  assert.strictEqual(appTrack.active_track, "vibe_app_developer");
  assert.strictEqual(appTrack.role_gate, "app_only");
  const startAlias = JSON.parse(runKvdf(["start", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(startAlias.report_type, "session_entry_route");
  assert.strictEqual(startAlias.entry_route.track_id, "vibe_app_developer");
}));

test("session replay reconstructs task memory and archive state", () => withTempDir((dir) => {
  fs.mkdirSync(path.join(dir, ".kabeeri", "reports"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "sessions.json"), JSON.stringify({
    sessions: [
      {
        session_id: "session-001",
        task_id: "task-001",
        sprint_id: "sprint-001",
        developer_id: "agent-001",
        token_id: "token-001",
        provider: "openai",
        model: "gpt-session",
        status: "completed",
        started_at: "2026-05-14T00:00:00.000Z",
        ended_at: "2026-05-14T00:10:00.000Z",
        session_trace_path: ".kabeeri/reports/session-001.trace.json",
        task_memory: {
          memory_type: "task_memory",
          version: 1,
          task_id: "task-001",
          title: "Replay task",
          status: "approved",
          purpose: "Replay the last governed line of work",
          summary: "Replay task memory block",
          scope: "Type: general. Workstreams: backend. Allowed files: src/cli/commands/session.js",
          source_of_truth: {
            source: "evolution:evo-007",
            workstreams: ["backend"],
            app_usernames: [],
            app_paths: [],
            allowed_files: ["src/cli/commands/session.js"]
          },
          acceptance_criteria: ["Replay output includes task memory and archive state"],
          required_inputs: ["Task id: task-001"],
          expected_outputs: ["The task task-001 is resumable from this memory block."],
          do_not_change: ["Do not edit files outside allowed_files."],
          resume_steps: ["Read the task memory for task-001 before editing anything."],
          verification_commands: ["npm test"],
          handoff_note: "Replay the last line of work."
        },
        scope: {
          workstreams: ["backend"],
          app_usernames: [],
          app_paths: [],
          allowed_files: ["src/cli/commands/session.js"]
        },
        output_contract: null,
        handoff_evidence: [],
        handoff_report_path: null
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "reports", "session-001.trace.json"), JSON.stringify({
    trace_type: "ai_session_trace",
    version: 1,
    session_id: "session-001",
    task_id: "task-001",
    developer_id: "agent-001",
    task_memory: {
      memory_type: "task_memory",
      version: 1,
      task_id: "task-001",
      title: "Replay task from trace",
      status: "approved",
      purpose: "Replay the last governed line of work",
      summary: "Replay task memory block from trace",
      scope: "Type: general. Workstreams: backend. Allowed files: src/cli/commands/session.js",
      source_of_truth: {
        source: "evolution:evo-007",
        workstreams: ["backend"],
        app_usernames: [],
        app_paths: [],
        allowed_files: ["src/cli/commands/session.js"]
      },
      acceptance_criteria: ["Replay output includes task memory and archive state"],
      required_inputs: ["Task id: task-001"],
      expected_outputs: ["The task task-001 is resumable from this memory block."],
      do_not_change: ["Do not edit files outside allowed_files."],
      resume_steps: ["Read the task memory for task-001 before editing anything."],
      verification_commands: ["npm test"],
      handoff_note: "Replay the last line of work."
    }
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri", "task_trash.json"), JSON.stringify({
    trash: [
      {
        id: "task-001",
        title: "Replay task",
        status: "done",
        trashed_at: "2026-05-14T00:20:00.000Z",
        trash_expires_at: "2026-06-14T00:20:00.000Z",
        trashed_reason: "completed",
        trashed_by: "owner-001",
        original_position: 0,
        original_status: "owner_verified",
        source_collection: "tasks.json",
        trash_retention_days: 30
      }
    ],
    retention_days: 30,
    last_sweep_at: "2026-05-14T00:30:00.000Z"
  }, null, 2));
  const replay = JSON.parse(runKvdf(["session", "replay", "session-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(replay.report_type, "session_replay");
  assert.strictEqual(replay.session_id, "session-001");
  assert.strictEqual(replay.task_id, "task-001");
  assert.strictEqual(replay.archive_state.archived_task_present, true);
  assert.strictEqual(replay.archive_state.archived_task.id, "task-001");
  assert.ok(replay.replay_summary.includes("Session session-001 replayed for task task-001."));
  assert.ok(replay.replay_summary.includes("Archive state retains task-001"));
  assert.strictEqual(replay.next_action, "open the handoff report or start the next governed task");
  assert.ok(fs.existsSync(path.join(dir, replay.replay_path)));
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, replay.replay_path), "utf8"));
  assert.strictEqual(persisted.report_type, "session_replay");
  assert.strictEqual(persisted.archive_state.total, 1);
  assert.ok(persisted.task_memory);
}));

test("track status and route expose the active session track", () => withTempDir((dir) => {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "customer-next-app",
    scripts: { dev: "next dev" },
    dependencies: { next: "15.0.0", react: "19.0.0" }
  }, null, 2));
  runKvdf(["init", "--profile", "standard", "--mode", "agile", "--no-intake"], { cwd: dir });
  const status = JSON.parse(runKvdf(["track", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.report_type, "session_track_status");
  assert.strictEqual(status.primary_track.id, "vibe_app_developer");
  assert.strictEqual(status.entry_route.track_id, "vibe_app_developer");
  assert.strictEqual(status.entry_route.role_gate, "app_only");
  assert.strictEqual(status.entry_route.route_command, "kvdf vibe brief");
  assert.strictEqual(status.entry_route.follow_up_command, "kvdf task tracker");
  assert.ok(status.recommended_commands.length > 0);
  const route = JSON.parse(runKvdf(["track", "route", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(route.report_type, "session_entry_route");
  assert.strictEqual(route.entry_route.track_id, "vibe_app_developer");
  const sessionTrack = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "session_track.json"), "utf8"));
  assert.strictEqual(sessionTrack.active_track, "vibe_app_developer");
  assert.strictEqual(sessionTrack.role_gate, "app_only");
}));

test("track status reflects framework owner sessions in the repository root", () => {
  const status = JSON.parse(runKvdf(["track", "status", "--json"]).stdout);
  assert.strictEqual(status.primary_track.id, "framework_owner");
  assert.strictEqual(status.entry_route.track_id, "framework_owner");
  assert.ok(status.entry_route.activated_features.includes("evolution"));
});

test("owner track initiates the framework owner system development route", () => withTempDir((dir) => {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "kabeeri-vdf",
    private: true
  }, null, 2));
  fs.mkdirSync(path.join(dir, "bin"), { recursive: true });
  fs.writeFileSync(path.join(dir, "bin", "kvdf.js"), "#!/usr/bin/env node\n", "utf8");
  fs.mkdirSync(path.join(dir, "src", "cli"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "cli", "index.js"), "module.exports = {};\n", "utf8");
  fs.writeFileSync(path.join(dir, "OWNER_DEVELOPMENT_STATE.md"), "# Owner Development State\n", "utf8");
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  const report = JSON.parse(runKvdf(["owner", "track", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "owner_track_initiated");
  assert.strictEqual(report.session_track.active_track, "framework_owner");
  assert.strictEqual(report.session_track.role_gate, "owner_only");
  assert.strictEqual(report.session_track.route_command, "kvdf evolution priorities");
  assert.strictEqual(report.session_track.follow_up_command, "kvdf evolution temp");
  assert.ok(report.session_track.activated_features.includes("evolution"));
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "session_track.json"), "utf8"));
  assert.strictEqual(persisted.decision_source, "owner_track");
  assert.strictEqual(persisted.active_track, "framework_owner");
  assert.strictEqual(persisted.route_command, "kvdf evolution priorities");
  const status = JSON.parse(runKvdf(["track", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.primary_track.id, "framework_owner");
  assert.strictEqual(status.entry_route.track_id, "framework_owner");
}));

test("track lock ignores stale session track state when workspace context says owner", () => {
  const sessionTrackPath = path.join(repoRoot, ".kabeeri", "session_track.json");
  const original = fs.readFileSync(sessionTrackPath, "utf8");
  try {
    fs.writeFileSync(sessionTrackPath, JSON.stringify({
      active: true,
      active_track: "vibe_app_developer",
      track_label: "Vibe App Developer Track",
      role_gate: "app_only",
      route_command: "kvdf track route",
      follow_up_command: "kvdf track status",
      activated_features: ["vibe"],
      blocked_features: ["evolution"],
      started_from_mode: "kabeeri_user_app_workspace",
      active_root: repoRoot,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, null, 2));
    const resume = JSON.parse(runKvdf(["resume", "--json"]).stdout);
    assert.strictEqual(resume.primary_track.id, "framework_owner");
    assert.strictEqual(resume.track_context.derived_track_surface, "owner");
    assert.strictEqual(resume.track_context.effective_track_surface, "owner");
    assert.strictEqual(
      resume.track_context.mismatch,
      resume.track_context.session_track_surface !== resume.track_context.derived_track_surface
    );
    const status = JSON.parse(runKvdf(["track", "status", "--json"]).stdout);
    assert.strictEqual(status.track_context.effective_track_surface, "owner");
    assert.ok(typeof status.track_context.mismatch === "boolean");
    assert.strictEqual(status.entry_route.track_id, "framework_owner");
  } finally {
    fs.writeFileSync(sessionTrackPath, original);
  }
});

test("framework guard blocks accidental framework internals inside user workspaces", () => withTempDir((dir) => {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "customer-app",
    dependencies: { next: "15.0.0" }
  }, null, 2));
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "src", "cli"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "cli", "index.js"), "module.exports = {};\n");
  const blocked = runKvdf(["guard", "--json"], { cwd: dir, expectFailure: true });
  const blockedReport = JSON.parse(blocked.stdout);
  assert.strictEqual(blockedReport.status, "blocked");
  assert.strictEqual(blockedReport.mode, "user_workspace");
  assert.ok(blockedReport.protected_paths_present.includes("src/cli/"));
  const allowed = JSON.parse(runKvdf(["guard", "--json", "--allow-framework-edits"], { cwd: dir }).stdout);
  assert.strictEqual(allowed.status, "pass");
  assert.strictEqual(allowed.allow_framework_edits, true);
}));

test("framework guard is enforced by capture and session file scopes", () => withTempDir((dir) => {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "customer-app",
    dependencies: { next: "15.0.0" }
  }, null, 2));
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "src", "cli"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "cli", "index.js"), "module.exports = {};\n");

  assert.match(
    runKvdf(["capture", "--summary", "Touched framework internals", "--files", "src/cli/index.js"], { cwd: dir, expectFailure: true }).stderr,
    /Framework-internal files are protected/
  );
  const allowedCapture = JSON.parse(runKvdf([
    "capture",
    "--summary", "Intentional fork edit",
    "--files", "src/cli/index.js",
    "--allow-framework-edits"
  ], { cwd: dir }).stdout);
  assert.strictEqual(allowedCapture.files_changed[0], "src/cli/index.js");

  runKvdf(["task", "create", "--id", "task-guard", "--title", "Guard task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "assign", "task-guard", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-guard", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-guard", "--task", "task-guard", "--developer", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["session", "end", "session-guard", "--files", "src/cli/index.js", "--summary", "Touched framework internals"], { cwd: dir, expectFailure: true }).stderr,
    /Framework-internal files are protected/
  );
}));

test("conflict scan reports validation and workspace drift before development", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  const report = JSON.parse(runKvdf(["conflict", "scan", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "framework_conflict_scan");
  assert.ok(["pass", "warning"].includes(report.status));
  assert.ok(report.checks.some((check) => check.id === "cli_surface" && check.status === "pass"));
  assert.ok(report.checks.some((check) => check.id === "framework_guard_integration" && check.status === "pass"));
  assert.ok(report.checks.some((check) => check.id === "validate_runtime-schemas" && check.status === "pass"));

  const tasksFile = path.join(dir, ".kabeeri/tasks.json");
  fs.writeFileSync(tasksFile, JSON.stringify({
    tasks: [
      { id: "task-dup", title: "One" },
      { id: "task-dup", title: "Two" }
    ]
  }, null, 2));
  const blocked = JSON.parse(runKvdf(["conflict", "scan", "--json"], { cwd: dir, expectFailure: true }).stdout);
  assert.strictEqual(blocked.status, "blocked");
  assert.ok(blocked.blockers.some((item) => /Duplicate task id/.test(item)));
}));

test("sync status reports local git state and keeps pull push dry-run by default", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  fs.writeFileSync(path.join(dir, "README.md"), "# App\n");
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  const status = JSON.parse(runKvdf(["sync", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.report_type, "github_team_sync_status");
  assert.strictEqual(status.status, "needs_upstream");
  assert.strictEqual(status.remote, "origin");
  assert.strictEqual(status.sync_policy, "optional");
  assert.ok(status.changed_files > 0);
  const pull = runKvdf(["sync", "pull"], { cwd: dir }).stdout;
  assert.match(pull, /dry-run/);
  assert.match(pull, /Would run: git pull --ff-only/);
  const push = runKvdf(["sync", "push"], { cwd: dir }).stdout;
  assert.match(push, /dry-run/);
  assert.match(push, /Would run: git push/);
}));

test("sync policy is optional for solo work and recommended for team work", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri/developer_mode.json"), JSON.stringify({
    mode: "solo",
    solo_developer_id: "dev-001",
    workstreams: ["backend", "public_frontend"]
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri/developers.json"), JSON.stringify({
    developers: [{ id: "dev-001", name: "Solo Dev", role: "Full-stack Developer", status: "active" }]
  }, null, 2));
  const solo = JSON.parse(runKvdf(["sync", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(solo.collaboration_mode, "solo");
  assert.strictEqual(solo.sync_policy, "optional");
  assert.ok(solo.next_actions.some((item) => /not required after every local solo action/.test(item)));

  fs.writeFileSync(path.join(dir, ".kabeeri/developer_mode.json"), JSON.stringify({
    mode: "team",
    solo_developer_id: null,
    workstreams: []
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri/developers.json"), JSON.stringify({
    developers: [
      { id: "dev-001", name: "Backend Dev", role: "Developer", status: "active" },
      { id: "dev-002", name: "Frontend Dev", role: "Developer", status: "active" }
    ]
  }, null, 2));
  const team = JSON.parse(runKvdf(["sync", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(team.collaboration_mode, "team");
  assert.strictEqual(team.sync_policy, "recommended");
  assert.ok(team.team_signals.includes("multiple_active_identities"));
  assert.ok(team.next_actions.some((item) => /team-scoped work/.test(item)));
}));

test("github team status and feedback records surface issue PR status and comment integration", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri/developer_mode.json"), JSON.stringify({
    mode: "team",
    solo_developer_id: null,
    workstreams: []
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri/developers.json"), JSON.stringify({
    developers: [
      { id: "dev-001", name: "Backend Dev", role: "Developer", status: "active" },
      { id: "dev-002", name: "Frontend Dev", role: "Developer", status: "active" }
    ]
  }, null, 2));
  fs.mkdirSync(path.join(dir, ".kabeeri", "github"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri/github/sync_config.json"), JSON.stringify({
    repo: "owner/repo",
    branch: "main",
    dry_run_default: true,
    write_requires_confirmation: true
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri/github/issue_map.json"), JSON.stringify({
    tasks: ["task-001"],
    conflicts: [],
    items: [{ issue_key: "v4.0.0:Milestone:Issue", issue_number: 7, title: "Issue" }]
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri/github/team_feedback.json"), JSON.stringify({
    items: [
      { feedback_id: "github-feedback-001", feedback_type: "issue", subject_type: "issue", subject_id: "7", message: "Tracked issue", created_at: new Date().toISOString() },
      { feedback_id: "github-feedback-002", feedback_type: "pr", subject_type: "pr", subject_id: "88", message: "PR ready", created_at: new Date().toISOString() },
      { feedback_id: "github-feedback-003", feedback_type: "comment", subject_type: "comment", subject_id: "7", message: "Please review", created_at: new Date().toISOString() }
    ]
  }, null, 2));

  const status = JSON.parse(runKvdf(["github", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.report_type, "github_team_feedback_status");
  assert.strictEqual(status.team_mode, true);
  assert.strictEqual(status.feedback.total, 3);
  assert.strictEqual(status.feedback.comments, 1);
  assert.ok(status.next_actions.some((item) => /feedback/i.test(item)));

  const feedback = JSON.parse(runKvdf(["github", "feedback", "list", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(feedback.report_type, "github_team_feedback_log");
  assert.strictEqual(feedback.items.length, 3);

  const recorded = JSON.parse(runKvdf(["github", "feedback", "record", "--type", "status", "--subject", "task-001", "--message", "Ready for review", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(recorded.feedback_type, "status");
  assert.strictEqual(recorded.subject_id, "task-001");

  const sync = JSON.parse(runKvdf(["sync", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(sync.github_team_feedback);
  assert.strictEqual(sync.github_team_feedback.total, 4);
  assert.strictEqual(sync.github_team_feedback.status_feedback, 1);
}));

test("init creates workspace state files", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--mode", "structured"], { cwd: dir });
  for (const file of [
    ".kabeeri/project.json",
    ".kabeeri/delivery_mode.json",
    ".kabeeri/tasks.json",
    ".kabeeri/task_trash.json",
    ".kabeeri/customer_apps.json",
    ".kabeeri/workstreams.json",
    ".kabeeri/questionnaires/answers.json",
    ".kabeeri/questionnaires/adaptive_intake_plan.json",
    ".kabeeri/questionnaires/coverage_matrix.json",
    ".kabeeri/version_compatibility.json",
    ".kabeeri/migration_state.json",
    ".kabeeri/delivery_decisions.json",
    ".kabeeri/product_blueprints.json",
    ".kabeeri/data_design.json",
    ".kabeeri/wordpress.json",
    ".kabeeri/evolution.json",
    ".kabeeri/memory/decisions.jsonl",
    ".kabeeri/adr/records.json",
    ".kabeeri/ai_runs/prompt_runs.jsonl",
    ".kabeeri/ai_runs/accepted_runs.jsonl",
    ".kabeeri/ai_runs/rejected_runs.jsonl",
    ".kabeeri/prompt_layer/compositions.json",
    ".kabeeri/tokens.json",
    ".kabeeri/session_track.json",
    ".kabeeri/multi_ai_communications.json",
    ".kabeeri/app_workspaces.json",
    ".kabeeri/metadata/milestones.json",
    ".kabeeri/metadata/team.json",
    ".kabeeri/metadata/decisions.json",
    ".kabeeri/metadata/changelog.json",
    ".kabeeri/owner_auth.json",
    ".kabeeri/owner_docs_tokens.json",
    ".kabeeri/owner_transfer_tokens.json",
    ".kabeeri/ai_usage/usage_events.jsonl",
    ".kabeeri/ai_usage/context_packs.json",
    ".kabeeri/ai_usage/cost_preflights.json",
    ".kabeeri/ai_usage/model_routing.json",
    ".kabeeri/policies/policy_results.json",
    ".kabeeri/policies/task_verification_policy.json",
    ".kabeeri/policies/release_policy.json",
    ".kabeeri/policies/handoff_policy.json",
    ".kabeeri/policies/security_policy.json",
    ".kabeeri/policies/migration_policy.json",
    ".kabeeri/policies/github_write_policy.json",
    ".kabeeri/reports/live_reports_state.json",
    ".kabeeri/dashboard/task_tracker_state.json",
    ".kabeeri/dashboard/agile_state.json",
    ".kabeeri/dashboard/structured_state.json",
    ".kabeeri/dashboard/ux_audits.json",
    ".kabeeri/interactions/suggested_tasks.json",
    ".kabeeri/interactions/post_work_captures.json",
    ".kabeeri/interactions/vibe_sessions.json",
    ".kabeeri/interactions/context_briefs.json",
    ".kabeeri/interactions/user_intents.jsonl",
    ".kabeeri/agile.json",
    ".kabeeri/structured.json",
    ".kabeeri/handoff/packages.json",
    ".kabeeri/handoff/CLIENT_HANDOFF_PACKAGE_TEMPLATE.md",
    ".kabeeri/security/security_scans.json",
    ".kabeeri/security/security_readiness.json",
    ".kabeeri/migrations/migration_plans.json",
    ".kabeeri/migrations/rollback_plans.json",
    ".kabeeri/migrations/migration_checks.json",
    ".kabeeri/migrations/migration_audit.json",
    ".kabeeri/design_sources/sources.json",
    ".kabeeri/design_sources/text_specs.json",
    ".kabeeri/design_sources/page_specs.json",
    ".kabeeri/design_sources/component_contracts.json",
    ".kabeeri/design_sources/missing_reports.json",
    ".kabeeri/design_sources/visual_reviews.json",
    ".kabeeri/design_sources/audit_reports.json",
    ".kabeeri/design_sources/governance_reports.json",
    ".kabeeri/design_sources/ui_advisor.json",
    ".kabeeri/design_sources/ui_ux_reference.json"
  ]) {
    assert.ok(fs.existsSync(path.join(dir, file)), `${file} should exist`);
  }
  assert.ok(fs.existsSync(path.join(dir, "workspaces")), "workspaces should exist");
  assert.ok(fs.existsSync(path.join(dir, "workspaces", "apps")), "workspaces/apps should exist");
  assert.ok(fs.existsSync(path.join(dir, "plugins", "kvdf_dev", "docs", "index.md")), "kvdf dev docs index should exist");
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /workspace present/);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /runtime schema validation checked/);
  const upgrade = JSON.parse(runKvdf(["upgrade", "check", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(upgrade.report_type, "upgrade_check");
  assert.strictEqual(upgrade.current_cli_version, packageVersion);
}));

test("init goal creates adaptive questions and planning pack review before implementation", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--goal", "Build ecommerce store with Laravel backend and Next.js frontend"], { cwd: dir });
  const plans = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/questionnaires/adaptive_intake_plan.json"), "utf8"));
  assert.strictEqual(plans.plans.length, 1);
  assert.ok(plans.plans[0].generated_questions.length > 0);
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.phase === "docs_first" && task.type === "documentation"));
  runKvdf(["task", "create", "--id", "task-implementation", "--title", "Build checkout API", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "assign", "task-implementation", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-implementation", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--task", "task-implementation", "--type", "folder", "--scope", "src/api/checkout", "--owner", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["task", "start", "task-implementation"], { cwd: dir, expectFailure: true }).stderr,
    /Docs-first gate blocks implementation/
  );
}));

test("task assessment creates structured readiness gates for large work", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build checkout API", "--workstream", "backend"], { cwd: dir });
  const assessment = JSON.parse(runKvdf([
    "task",
    "assessment",
    "task-001",
    "--json",
    "--goal",
    "Build checkout API",
    "--workstream",
    "backend",
    "--allowed-files",
    "src/api/checkout.js,src/routes/checkout.js",
    "--acceptance",
    "Returns 200 OK,Has tests,Has docs",
    "--checks",
    "npm test,node .\\bin\\kvdf.js conflict scan"
  ], { cwd: dir }).stdout);
  assert.strictEqual(assessment.task_id, "task-001");
  assert.strictEqual(assessment.readiness, "ready");
  assert.strictEqual(assessment.status, "ready");
  assert.ok(assessment.recommended_next_actions.length > 0);
  const assessmentsState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/task_assessments.json"), "utf8"));
  assert.strictEqual(assessmentsState.assessments.length, 1);
  const task = JSON.parse(runKvdf(["task", "status", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(task.assessment_id, assessment.assessment_id);
  assert.strictEqual(task.assessment_status, "ready");
  assert.ok(task.assessment_summary);
}));

test("task coverage report materializes the full execution path and persists coverage state", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build checkout API", "--workstream", "backend"], { cwd: dir });
  runKvdf([
    "task",
    "assessment",
    "task-001",
    "--json",
    "--goal",
    "Build checkout API",
    "--workstream",
    "backend",
    "--allowed-files",
    "src/api/checkout.js,src/routes/checkout.js",
    "--acceptance",
    "Returns 200 OK,Has tests,Has docs",
    "--checks",
    "npm test,node .\\bin\\kvdf.js conflict scan"
  ], { cwd: dir });
  const tasksPath = path.join(dir, ".kabeeri/tasks.json");
  const tasksState = JSON.parse(fs.readFileSync(tasksPath, "utf8"));
  tasksState.tasks[0].status = "in_progress";
  tasksState.tasks[0].updated_at = new Date().toISOString();
  fs.writeFileSync(tasksPath, `${JSON.stringify(tasksState, null, 2)}\n`);
  const temp = JSON.parse(runKvdf(["temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(temp.report_type, "task_temporary_queue");
  assert.strictEqual(temp.queue.coverage_policy, "full_task_coverage");
  const coverage = JSON.parse(runKvdf(["task", "coverage", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(coverage.report_type, "task_full_coverage_report");
  assert.strictEqual(coverage.coverage_policy, "full_task_coverage");
  assert.strictEqual(coverage.planned_slices.length, 5);
  assert.ok(coverage.materialized_queue);
  assert.strictEqual(coverage.coverage.materialized, true);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/task_coverage_task-001.json")));
  const task = JSON.parse(runKvdf(["task", "status", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(task.coverage_report_path, ".kabeeri/reports/task_coverage_task-001.json");
  assert.strictEqual(task.coverage_state, "materialized");
  assert.ok(task.coverage_open_slices > 0);
  const board = JSON.parse(runKvdf(["task", "coverage", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(board.report_type, "task_full_coverage_board");
  assert.strictEqual(board.summary.total, 1);
  assert.strictEqual(board.tasks[0].coverage_state, "materialized");
}));

test("traceability report links tasks assessments adrs ai runs docs and tests", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build checkout API", "--workstream", "backend"], { cwd: dir });
  const tasksPath = path.join(dir, ".kabeeri/tasks.json");
  const tasksState = JSON.parse(fs.readFileSync(tasksPath, "utf8"));
  tasksState.tasks[0].source = "evolution:evo-026";
  tasksState.tasks[0].source_reference = "evo-026";
  tasksState.tasks[0].verification_commands = ["npm test", "node .\\bin\\kvdf.js validate docs-source-truth --json"];
  tasksState.tasks[0].related_adrs = ["adr-001"];
  tasksState.tasks[0].related_ai_runs = ["ai-run-001"];
  fs.writeFileSync(tasksPath, `${JSON.stringify(tasksState, null, 2)}\n`);

  runKvdf([
    "task",
    "assessment",
    "task-001",
    "--json",
    "--goal",
    "Build checkout API",
    "--workstream",
    "backend",
    "--allowed-files",
    "src/api/checkout.js,src/routes/checkout.js",
    "--acceptance",
    "Returns 200 OK,Has tests,Has docs",
    "--checks",
    "npm test,node .\\bin\\kvdf.js conflict scan",
    "--gates",
    "docs-source-truth"
  ], { cwd: dir });

  const adrDir = path.join(dir, ".kabeeri/adr");
  fs.mkdirSync(adrDir, { recursive: true });
  fs.writeFileSync(path.join(adrDir, "records.json"), JSON.stringify({
    adrs: [
      {
        adr_id: "adr-001",
        title: "Choose checkout API shape",
        status: "approved",
        impact: "high",
        context: "Checkout API scope needs a durable decision.",
        decision: "Use a governed REST boundary.",
        related_tasks: ["task-001"],
        related_ai_runs: ["ai-run-001"]
      }
    ]
  }, null, 2));

  const aiRunDir = path.join(dir, ".kabeeri/ai_runs");
  fs.mkdirSync(aiRunDir, { recursive: true });
  fs.writeFileSync(path.join(aiRunDir, "prompt_runs.jsonl"), `${JSON.stringify({
    run_id: "ai-run-001",
    task_id: "task-001",
    status: "accepted",
    related_adrs: ["adr-001"],
    total_tokens: 1200,
    cost: 0.14,
    source_reference: "traceability-test"
  })}\n`);

  const trace = JSON.parse(runKvdf(["trace", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(trace.report_type, "traceability_report");
  assert.strictEqual(trace.summary.tasks_total, 1);
  assert.strictEqual(trace.summary.tasks_with_assessments, 1);
  assert.strictEqual(trace.summary.tasks_with_verification, 1);
  assert.strictEqual(trace.summary.adrs_total, 1);
  assert.strictEqual(trace.summary.ai_runs_total, 1);
  assert.ok(trace.summary.trace_edges_total > 0);
  assert.ok(trace.docs_state.command_reference);
  assert.ok(trace.docs_state.capability_reference);
  assert.ok(trace.links.edges.some((edge) => edge.from_type === "task" && edge.to_type === "assessment"));
  assert.ok(trace.links.edges.some((edge) => edge.from_type === "adr" && edge.to_type === "ai_run"));
  assert.ok(trace.links.edges.some((edge) => edge.from_type === "task" && edge.to_type === "test"));
  assert.ok(Array.isArray(trace.next_actions));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/traceability_report.json")));
  const traceStatus = JSON.parse(runKvdf(["trace", "status", "--json"], { cwd: dir }).stdout);
  assert.match(traceStatus.trace_id, /^traceability-\d{14}$/);
})); 

test("change control report consolidates evolution changes risks and requests", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const evolutionPath = path.join(dir, ".kabeeri/evolution.json");
  const structuredPath = path.join(dir, ".kabeeri/structured.json");
  const evolutionState = JSON.parse(fs.readFileSync(evolutionPath, "utf8"));
  evolutionState.changes = [
    {
      change_id: "evo-001",
      title: "Update traceability layer",
      description: "Link tasks and docs",
      status: "planned",
      impacted_areas: ["implementation", "docs"],
      task_ids: ["task-001"],
      duplicate_risk: "review_required"
    }
  ];
  evolutionState.current_change_id = "evo-001";
  fs.writeFileSync(evolutionPath, `${JSON.stringify(evolutionState, null, 2)}\n`);
  fs.writeFileSync(structuredPath, JSON.stringify({
    requirements: [],
    phases: [],
    milestones: [],
    deliverables: [],
    approvals: [],
    change_requests: [
      {
        change_id: "change-001",
        title: "Approve traceability report",
        requirement_id: null,
        phase_id: null,
        impact: "high",
        status: "proposed",
        reason: "Need owner review",
        scope_delta: ["docs", "tests"],
        decision: null,
        created_at: new Date().toISOString()
      }
    ],
    risks: [
      {
        risk_id: "risk-001",
        title: "Traceability gaps remain",
        severity: "high",
        status: "open",
        owner_id: "owner-001",
        mitigation: "Add explicit links",
        phase_id: null,
        requirement_id: null,
        created_at: new Date().toISOString()
      }
    ],
    gates: []
  }, null, 2));

  const report = JSON.parse(runKvdf(["change", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "change_control_report");
  assert.strictEqual(report.summary.evolution_changes_total, 1);
  assert.strictEqual(report.summary.open_evolution_changes, 1);
  assert.strictEqual(report.summary.structured_change_requests_total, 1);
  assert.strictEqual(report.summary.open_change_requests, 1);
  assert.strictEqual(report.summary.risks_total, 1);
  assert.strictEqual(report.summary.open_risks, 1);
  assert.strictEqual(report.summary.high_risk_open, 1);
  assert.ok(Array.isArray(report.next_actions));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/change_control_report.json")));
  const alias = JSON.parse(runKvdf(["risk", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(alias.report_type, report.report_type);
  assert.strictEqual(alias.summary.high_risk_open, report.summary.high_risk_open);
}));

test("task completion archives to trash and restore returns to active tasks", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Archive me", "--workstream", "backend", "--acceptance", "Archived task"], { cwd: dir });
  const lifecycleIntake = JSON.parse(runKvdf(["task", "lifecycle", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lifecycleIntake.current_stage, "intake");
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  const lifecycleReady = JSON.parse(runKvdf(["task", "lifecycle", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lifecycleReady.current_stage, "ready");
  runKvdf(["acceptance", "create", "--task", "task-001"], { cwd: dir });
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--evidence", "Archived task"], { cwd: dir });
  runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir });
  const lifecycleValidation = JSON.parse(runKvdf(["task", "lifecycle", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lifecycleValidation.current_stage, "validation");
  const evolutionPath = path.join(dir, ".kabeeri", "evolution.json");
  fs.writeFileSync(evolutionPath, JSON.stringify({
    changes: [
      {
        change_id: "evo-001",
        title: "Archive sync regression",
        description: "Keep task and evolution ledgers aligned",
        status: "planned",
        task_ids: ["task-001"],
        track: "framework_owner",
        workspace_kind: "framework_owner",
        created_at: new Date().toISOString()
      }
    ],
    impact_plans: [],
    current_change_id: "evo-001",
    temporary_priorities: null,
    development_priorities: [],
    deferred_ideas: [],
    scorecards: [],
    workspace_kind: "framework_owner",
    track: "framework_owner",
    updated_at: new Date().toISOString()
  }, null, 2));
  const completed = JSON.parse(runKvdf(["task", "complete", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout);
  assert.strictEqual(completed.status, "trashed");
  assert.strictEqual(completed.task.id, "task-001");
  assert.strictEqual(completed.completed_task.status, "done");
  const activeTasksAfterComplete = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(!activeTasksAfterComplete.some((task) => task.id === "task-001"));
  const trashState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/task_trash.json"), "utf8"));
  assert.strictEqual(trashState.trash.length, 1);
  assert.strictEqual(trashState.trash[0].id, "task-001");
  assert.match(runKvdf(["task", "trash", "list"], { cwd: dir }).stdout, /task-001/);
  const schedulerAfterComplete = JSON.parse(runKvdf(["schedule", "status", "--json"], { cwd: dir }).stdout);
  const trashLineage = schedulerAfterComplete.task_lineage.find((item) => item.task_id === "task-001");
  assert.ok(trashLineage);
  assert.strictEqual(trashLineage.current_location, "trash");
  assert.ok(trashLineage.route_count >= 1);
  assert.strictEqual(trashLineage.restore_hint.command, "kvdf task trash restore task-001");
  assert.ok(schedulerAfterComplete.trash_recovery.items.some((item) => item.restore_command === "kvdf task trash restore task-001"));
  const statusFromTrash = JSON.parse(runKvdf(["task", "status", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(statusFromTrash.id, "task-001");
  assert.strictEqual(statusFromTrash.trashed_reason, "completed");
  assert.strictEqual(statusFromTrash.lifecycle.current_stage, "archived");
  assert.ok(statusFromTrash.scheduler_history);
  assert.strictEqual(statusFromTrash.scheduler_history.current_location, "trash");
  const lifecycleArchived = JSON.parse(runKvdf(["task", "lifecycle", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lifecycleArchived.current_stage, "archived");
  assert.ok(lifecycleArchived.trashed_at);
  const evolutionState = JSON.parse(fs.readFileSync(evolutionPath, "utf8"));
  const archivedEvolution = evolutionState.changes.find((item) => item.change_id === "evo-001");
  assert.ok(archivedEvolution);
  assert.strictEqual(archivedEvolution.status, "done");
  assert.strictEqual(archivedEvolution.archived, true);
  assert.ok(archivedEvolution.archived_at);
  assert.ok(!archivedEvolution.open_task_ids || archivedEvolution.open_task_ids.length === 0);
  const lifecycleBoard = JSON.parse(runKvdf(["task", "lifecycle", "--json"], { cwd: dir }).stdout);
  assert.ok(lifecycleBoard.summary.by_stage.intake >= 0);
  assert.ok(lifecycleBoard.summary.by_stage.archived >= 1);
  const tracker = JSON.parse(runKvdf(["task", "tracker", "--json"], { cwd: dir }).stdout);
  assert.ok(tracker.lifecycle);
  assert.ok(tracker.summary.lifecycle_by_stage.intake >= 0);
  const restored = JSON.parse(runKvdf(["task", "trash", "restore", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(restored.status, "restored");
  const schedulerAfterRestore = JSON.parse(runKvdf(["schedule", "status", "--json"], { cwd: dir }).stdout);
  const restoredLineage = schedulerAfterRestore.task_lineage.find((item) => item.task_id === "task-001");
  assert.ok(restoredLineage);
  assert.strictEqual(restoredLineage.current_location, "tasks");
  assert.ok(restoredLineage.route_count >= 2);
  assert.strictEqual(restoredLineage.restore_hint, null);
  const restoredTasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(restoredTasks.some((task) => task.id === "task-001"));
}));

test("viber task completion stays in closure until explicit archive confirmation", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri", "project.json"), JSON.stringify({
    workspace_kind: "developer_app"
  }, null, 2));
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["task", "create", "--id", "task-vibe-001", "--title", "Viber closure policy", "--workstream", "backend", "--acceptance", "Closure must stay local until archive is explicit"], { cwd: dir });
  runKvdf(["task", "approve", "task-vibe-001"], { cwd: dir });
  runKvdf(["acceptance", "create", "--task", "task-vibe-001"], { cwd: dir });
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--evidence", "Closure must stay local until archive is explicit"], { cwd: dir });
  runKvdf(["task", "verify", "task-vibe-001", "--owner", "owner-001"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    changes: [
      {
        change_id: "evo-vibe-001",
        title: "Viber closure policy",
        description: "Keep Viber completed tasks in closure until explicit archive confirmation.",
        status: "planned",
        task_ids: ["task-vibe-001"],
        track: "vibe_app_developer",
        workspace_kind: "developer_app",
        created_at: new Date().toISOString()
      }
    ],
    impact_plans: [],
    current_change_id: "evo-vibe-001",
    temporary_priorities: null,
    development_priorities: [],
    deferred_ideas: [],
    scorecards: [],
    workspace_kind: "developer_app",
    track: "vibe_app_developer",
    updated_at: new Date().toISOString()
  }, null, 2));
  const completed = JSON.parse(runKvdf(["task", "complete", "task-vibe-001", "--owner", "owner-001"], { cwd: dir }).stdout);
  assert.strictEqual(completed.status, "closed");
  assert.strictEqual(completed.current_stage, "closure");
  assert.strictEqual(completed.archive_after_completion, false);
  assert.ok(completed.archive_policy);
  assert.strictEqual(completed.archive_policy.auto_archive, false);
  assert.strictEqual(completed.archive_policy.requires_explicit_request, true);
  assert.strictEqual(completed.archive_policy.requires_confirmation, true);
  assert.strictEqual(completed.archive_policy.trash_retention_days, 30);
  assert.match(completed.archive_policy.warning, /Task trash is recoverable until retention expires/i);
  assert.match(completed.next_action, /Archive only if the Viber explicitly requests it/i);
  assert.strictEqual(completed.completed_task.status, "done");
  const activeTasksAfterComplete = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  const completedTask = activeTasksAfterComplete.find((task) => task.id === "task-vibe-001");
  assert.ok(completedTask);
  assert.strictEqual(completedTask.status, "done");
  const trashStateAfterComplete = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/task_trash.json"), "utf8"));
  assert.ok(!trashStateAfterComplete.trash.some((task) => task.id === "task-vibe-001"));
  const lifecycleJson = JSON.parse(runKvdf(["task", "lifecycle", "task-vibe-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lifecycleJson.current_stage, "closure");
  assert.strictEqual(lifecycleJson.archive_after_completion, false);
  assert.match(lifecycleJson.next_action, /Archive only if the Viber explicitly requests it/i);
  assert.ok(lifecycleJson.archive_policy);
  const lifecycleHuman = runKvdf(["task", "lifecycle", "task-vibe-001"], { cwd: dir }).stdout;
  assert.match(lifecycleHuman, /Viber tasks are not archived automatically after closure/i);
  assert.match(lifecycleHuman, /Task trash is recoverable until retention expires/i);
  const archiveRejected = runKvdf(["task", "archive", "task-vibe-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true });
  assert.match(archiveRejected.stderr, /Archive\/trash requires explicit Viber confirmation/i);
  const archived = JSON.parse(runKvdf(["task", "archive", "task-vibe-001", "--owner", "owner-001", "--confirm"], { cwd: dir }).stdout);
  assert.strictEqual(archived.status, "trashed");
  assert.strictEqual(archived.retention_days, 30);
  assert.match(archived.warning, /recoverable until retention expires/i);
  assert.ok(archived.archive_policy);
  assert.strictEqual(archived.archive_policy.auto_archive, false);
  assert.strictEqual(archived.archive_policy.requires_explicit_request, true);
  assert.strictEqual(archived.archive_policy.requires_confirmation, true);
  assert.strictEqual(archived.archive_policy.trash_retention_days, 30);
  const trashState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "task_trash.json"), "utf8"));
  assert.strictEqual(trashState.trash.length, 1);
  assert.strictEqual(trashState.trash[0].id, "task-vibe-001");
  const restored = JSON.parse(runKvdf(["task", "trash", "restore", "task-vibe-001"], { cwd: dir }).stdout);
  assert.strictEqual(restored.status, "restored");
  const restoredTasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(restoredTasks.some((task) => task.id === "task-vibe-001"));
}));

test("resume sweeps expired task trash records on session start", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const expired = {
    trash: [
      {
        id: "task-old",
        title: "Expired trash task",
        status: "done",
        trashed_at: "2026-01-01T00:00:00.000Z",
        trash_expires_at: "2026-01-02T00:00:00.000Z",
        trashed_reason: "completed",
        trashed_by: "owner-001",
        original_position: 0,
        original_status: "owner_verified",
        source_collection: "tasks.json",
        trash_retention_days: 30
      },
      {
        id: "task-live",
        title: "Live trash task",
        status: "done",
        trashed_at: "2026-05-10T00:00:00.000Z",
        trash_expires_at: "2026-06-10T00:00:00.000Z",
        trashed_reason: "completed",
        trashed_by: "owner-001",
        original_position: 1,
        original_status: "owner_verified",
        source_collection: "tasks.json",
        trash_retention_days: 30
      }
    ],
    retention_days: 30,
    last_sweep_at: null
  };
  fs.writeFileSync(path.join(dir, ".kabeeri/task_trash.json"), `${JSON.stringify(expired, null, 2)}\n`);
  const report = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.ok(report.task_trash_sweep);
  assert.strictEqual(report.task_trash_sweep.purged_count, 1);
  assert.ok(report.task_tracker_memory);
  assert.ok(report.archive_state);
  assert.ok(report.session_trace);
  assert.strictEqual(report.session_trace.trace_path, ".kabeeri/reports/session_trace.json");
  const sweepState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/task_trash.json"), "utf8"));
  assert.strictEqual(sweepState.trash.length, 1);
  assert.strictEqual(sweepState.trash[0].id, "task-live");
  assert.ok(sweepState.last_sweep_at);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "session_trace.json")));
}));

test("temp queue serves application task execution not just evolution priorities", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["app", "create", "--username", "storefront-web", "--name", "Storefront Web"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "docs"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-app-001", "--title", "Document storefront checkout flow", "--type", "documentation", "--workstream", "docs", "--app", "storefront-web", "--source", "init_intake:app_goal"], { cwd: dir });
  runKvdf(["task", "assign", "task-app-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-app-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "apps/storefront-web", "--task", "task-app-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-app-001", "--actor", "agent-001"], { cwd: dir });
  const temp = JSON.parse(runKvdf(["temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(temp.report_type, "task_temporary_queue");
  assert.strictEqual(temp.active_task.id, "task-app-001");
  assert.strictEqual(temp.queue.coverage_policy, "full_task_coverage");
  assert.strictEqual(temp.queue.slices.length, 5);
  assert.match(temp.queue.slices[0].title, /full task coverage/i);
  assert.match(temp.queue.slices[2].description, /no leftover execution remainder/i);
  const advanced = JSON.parse(runKvdf(["temp", "advance", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(advanced.report_type, "task_temporary_queue_advanced");
  assert.strictEqual(advanced.completed_slice.order, 1);
  assert.strictEqual(advanced.next_slice.order, 2);
  const completed = JSON.parse(runKvdf(["temp", "complete", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(completed.report_type, "task_temporary_queue_completed");
  assert.strictEqual(completed.status, "completed");
}));

test("task memory persists detailed resume context and feeds the temporary queue", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-002", "--name", "AI Developer", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-memory-001", "--title", "Build checkout API", "--type", "feature", "--workstream", "backend", "--allowed-files", "src/api/checkout,src/cli/index.js", "--purpose", "Implement the checkout execution path", "--required-inputs", "API contract,Database schema", "--expected-outputs", "Endpoint,Tests", "--do-not-change", "Other workstreams,Public UI", "--verification-commands", "npm test,kvdf validate"], { cwd: dir });
  runKvdf(["task", "assign", "task-memory-001", "--assignee", "agent-002"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-memory-001", "--assignee", "agent-002"], { cwd: dir });
  runKvdf(["lock", "create", "--task", "task-memory-001", "--type", "folder", "--scope", "src/api/checkout", "--owner", "agent-002"], { cwd: dir });
  runKvdf(["task", "start", "task-memory-001", "--actor", "agent-002"], { cwd: dir });
  const resume = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.ok(resume.task_tracker_memory);
  assert.strictEqual(resume.task_tracker_memory.focus_task.id, "task-memory-001");
  assert.ok(resume.archive_state);
  assert.ok(resume.session_trace);
  const memory = JSON.parse(runKvdf(["task", "memory", "task-memory-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(memory.task_id, "task-memory-001");
  assert.strictEqual(memory.purpose, "Implement the checkout execution path");
  assert.ok(memory.source_of_truth.allowed_files.includes("src/api/checkout"));
  assert.ok(memory.resume_steps.length >= 4);
  assert.ok(memory.required_inputs.some((item) => item.includes("API contract")));
  assert.ok(memory.do_not_change.some((item) => item.includes("KVDF_New_Features_Docs")));
  const temp = JSON.parse(runKvdf(["temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(temp.active_task.id, "task-memory-001");
  assert.strictEqual(temp.active_task.memory.task_id, "task-memory-001");
  assert.match(temp.queue.slices[0].description, /task memory/i);
  assert.match(temp.queue.slices[1].description, /src\/api\/checkout/i);
  assert.match(temp.queue.slices[4].description, /npm test/i);
}));

test("ai learning memory captures repeated failure patterns and increments seen count", () => withTempDir((dir) => {
  const captureOne = JSON.parse(runKvdf([
    "learn",
    "capture",
    "--title",
    "Dashboard assertion drift",
    "--problem",
    "Test still expects the old dashboard markup",
    "--fix",
    "Update the assertion to match the rendered dashboard",
    "--category",
    "test_failure",
    "--track",
    "owner",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(captureOne.report_type, "ai_learning_pattern_captured");
  assert.strictEqual(captureOne.pattern.seen_count, 1);
  assert.strictEqual(captureOne.pattern.applies_to_tracks[0], "owner");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "ai_learning", "failure_patterns.json")));

  const captureTwo = JSON.parse(runKvdf([
    "learn",
    "capture",
    "--title",
    "Dashboard assertion drift",
    "--problem",
    "Test still expects the old dashboard markup",
    "--fix",
    "Keep the assertion aligned with rendered HTML",
    "--category",
    "test_failure",
    "--track",
    "owner",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(captureTwo.pattern.seen_count, 2);
  assert.match(captureTwo.pattern.prompt_warning, /dashboard assertion drift/i);
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "ai_learning", "failure_patterns.json"), "utf8"));
  assert.strictEqual(persisted.patterns.length, 1);
  assert.strictEqual(persisted.patterns[0].seen_count, 2);
  assert.strictEqual(persisted.patterns[0].status, "active");
}));

test("ai learning memory records fast paths, lists state, and returns track-specific prompt context", () => withTempDir((dir) => {
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Owner validation order",
    "--problem",
    "The owner flow forgot to run checks in order",
    "--fix",
    "Run validation before commit and push",
    "--category",
    "test_failure",
    "--track",
    "owner",
    "--json"
  ], { cwd: dir });
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Vibe scope confusion",
    "--problem",
    "The app prompt mixed owner core work into app delivery",
    "--fix",
    "Keep app prompts local-first and app-only",
    "--category",
    "track_confusion",
    "--track",
    "vibe",
    "--json"
  ], { cwd: dir });
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Plugin manifest safety",
    "--problem",
    "Plugin work touched unrelated runtime files",
    "--fix",
    "Keep plugin prompts scoped to manifest, runtime, docs, schema, and tests",
    "--category",
    "scope_violation",
    "--track",
    "plugin",
    "--json"
  ], { cwd: dir });
  const fastPath = JSON.parse(runKvdf([
    "learn",
    "fast-path",
    "--title",
    "Dashboard fix path",
    "--steps",
    "node --check src/cli/commands/dashboard_site.js,npm test,npm run check",
    "--validation",
    "npm test,npm run check",
    "--track",
    "owner",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(fastPath.report_type, "ai_learning_fast_path_recorded");
  assert.deepStrictEqual(fastPath.fast_path.validation_commands, ["npm test", "npm run check"]);

  const listed = JSON.parse(runKvdf(["learn", "list", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(listed.report_type, "ai_learning_memory_state");
  assert.strictEqual(listed.patterns.length, 3);
  assert.strictEqual(listed.fast_paths.length, 1);
  assert.strictEqual(listed.summary.active_patterns, 3);
  assert.strictEqual(listed.summary.active_fast_paths, 1);

  const ownerContext = JSON.parse(runKvdf(["learn", "prompt-context", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(ownerContext.track, "owner");
  assert.ok(ownerContext.prompt_warnings.some((warning) => /owner validation order/i.test(warning)));
  assert.strictEqual(ownerContext.active_fast_paths.length, 1);

  const vibeContext = JSON.parse(runKvdf(["learn", "prompt-context", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(vibeContext.track, "vibe");
  assert.ok(vibeContext.prompt_warnings.some((warning) => /vibe scope confusion/i.test(warning)));

  const pluginContext = JSON.parse(runKvdf(["learn", "prompt-context", "--track", "plugin", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginContext.track, "plugin");
  assert.ok(pluginContext.prompt_warnings.some((warning) => /plugin manifest safety/i.test(warning)));
}));

test("ai learning memory supports combined all-track prompt context and expanded categories", () => withTempDir((dir) => {
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Dashboard separation warning",
    "--problem",
    "The prompt mixed owner and viber dashboard products",
    "--fix",
    "Keep owner and viber dashboards separate and track-aware",
    "--category",
    "dashboard_confusion",
    "--track",
    "all",
    "--applies-to-tracks",
    "all",
    "--json"
  ], { cwd: dir });
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Execution loop warning",
    "--problem",
    "The prompt stayed in inspection mode instead of patching the failure",
    "--fix",
    "Inspect the exact failure and then patch the smallest safe surface",
    "--category",
    "execution_loop",
    "--track",
    "vibe",
    "--json"
  ], { cwd: dir });

  const allContext = JSON.parse(runKvdf(["learn", "prompt-context", "--track", "all", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(allContext.track, "all");
  assert.ok(allContext.active_warning_rules.length >= 2);
  assert.ok(allContext.prompt_warnings.some((warning) => /dashboard separation warning/i.test(warning)));
  assert.ok(allContext.prompt_warnings.some((warning) => /execution loop warning/i.test(warning)));
}));

test("ai learning exchange exports sanitized packages imports candidates and promotes approved shared learning", () => withTempDir((dir) => {
  const patternCapture = JSON.parse(runKvdf([
    "learn",
    "capture",
    "--title",
    "Shared prompt warning",
    "--problem",
    "The planner prompt forgot the current AI learning warning",
    "--fix",
    "Inject the active warning into the prompt context",
    "--category",
    "track_confusion",
    "--track",
    "vibe",
    "--json"
  ], { cwd: dir }).stdout);

  const fastPathCapture = JSON.parse(runKvdf([
    "learn",
    "fast-path",
    "--title",
    "Planner verification",
    "--steps",
    "run prompt-context,inspect warnings,update prompt",
    "--validation",
    "npm test",
    "--track",
    "vibe",
    "--json"
  ], { cwd: dir }).stdout);

  const exportPath = path.join(dir, "docs", "kvdf-learning", "learning-export.json");
  const exported = JSON.parse(runKvdf([
    "learn",
    "export",
    "--track",
    "vibe",
    "--output",
    "docs/kvdf-learning/learning-export.json",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(exported.report_type, "kvdf_ai_learning_export");
  assert.strictEqual(exported.cloud_ready, false);
  assert.strictEqual(exported.consent_required, true);
  assert.strictEqual(exported.anonymized, true);
  assert.ok(exported.patterns.length >= 1);
  assert.ok(exported.fast_paths.length >= 1);
  assert.ok(exported.promotion_candidates.length >= 2);
  assert.ok(fs.existsSync(exportPath));
  assert.ok(fs.existsSync(exportPath.replace(/\.json$/, ".md")));

  const repoHarvestPath = path.join(repoRoot, ".kabeeri", "learning_harvest", "candidates.json");
  assert.strictEqual(fs.existsSync(repoHarvestPath), false);

  const imported = JSON.parse(runKvdf([
    "learn",
    "import",
    "--track",
    "owner",
    "--from",
    "docs/kvdf-learning/learning-export.json",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(imported.report_type, "ai_learning_import");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "learning_harvest", "candidates.json")));
  assert.ok(imported.candidates.length >= 2);
  assert.match(imported.next_action, /kvdf learn review --json/);

  const review = JSON.parse(runKvdf(["learn", "review", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.report_type, "ai_learning_harvest_review");
  assert.ok(review.candidates.some((candidate) => candidate.classification === "reusable" || candidate.classification === "needs_review"));

  const patternCandidate = review.candidates.find((candidate) => candidate.item_type === "pattern");
  const fastPathCandidate = review.candidates.find((candidate) => candidate.item_type === "fast-path");
  assert.ok(patternCandidate);
  assert.ok(fastPathCandidate);

  const promoteBlocked = runKvdf(["learn", "promote", patternCandidate.candidate_id, "--confirm", "--track", "vibe", "--json"], { cwd: dir, expectFailure: true });
  assert.match(promoteBlocked.stderr, /owner-track only/i);

  const reject = JSON.parse(runKvdf([
    "learn",
    "reject",
    fastPathCandidate.candidate_id,
    "--track",
    "owner",
    "--reason",
    "App-specific workaround",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(reject.report_type, "ai_learning_candidate_rejected");
  assert.strictEqual(reject.candidate.rejected, true);
  assert.strictEqual(reject.candidate.rejection_reason, "App-specific workaround");

  const promoteNeedsConfirm = runKvdf(["learn", "promote", patternCandidate.candidate_id, "--track", "owner", "--json"], { cwd: dir, expectFailure: true });
  assert.match(promoteNeedsConfirm.stderr, /Missing --confirm/i);

  const promotion = JSON.parse(runKvdf([
    "learn",
    "promote",
    patternCandidate.candidate_id,
    "--confirm",
    "--track",
    "owner",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(promotion.report_type, "ai_learning_promotion");
  assert.ok(promotion.promotion.cloud_ready_metadata);
  assert.strictEqual(promotion.promotion.cloud_ready_metadata.cloud_ready, false);
  assert.ok(promotion.state.shared_patterns.length >= 1);

  const shared = JSON.parse(runKvdf(["learn", "shared", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(shared.report_type, "ai_learning_shared_learning_state");
  assert.ok(shared.shared_patterns.some((item) => item.approved_by === "owner"));

  const plannerPrompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Re-use the shared warning", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.ok(plannerPrompt.ai_learning);
  assert.ok(plannerPrompt.prompt.includes("## AI Learning Context"));
  assert.ok(plannerPrompt.ai_learning.prompt_warnings.some((warning) => /shared prompt warning/i.test(warning)));
  assert.ok(plannerPrompt.prompt.includes("shared prompt warning"));

  const cacheHome = path.join(dir, "home");
  const cacheUpdate = JSON.parse(runKvdf([
    "learn",
    "cache",
    "update",
    "--from-export",
    "docs/kvdf-learning/learning-export.json",
    "--track",
    "owner",
    "--json"
  ], { cwd: dir, env: { HOME: cacheHome, USERPROFILE: cacheHome } }).stdout);
  assert.strictEqual(cacheUpdate.report_type, "kvdf_ai_learning_cache");
  assert.ok(fs.existsSync(path.join(cacheHome, ".kabeeri", "learning", "shared_patterns.json")));

  const cacheList = JSON.parse(runKvdf(["learn", "cache", "list", "--track", "owner", "--json"], { cwd: dir, env: { HOME: cacheHome, USERPROFILE: cacheHome } }).stdout);
  assert.strictEqual(cacheList.report_type, "kvdf_ai_learning_cache");
  assert.ok(cacheList.summary.shared_patterns_total >= 1);

  assert.ok(patternCapture.pattern.pattern_id);
  assert.ok(fastPathCapture.fast_path.fast_path_id);
}));

test("ai learning memory writes runtime state only in the active workspace", () => withTempDir((dir) => {
  const repoLearningStatePath = path.join(repoRoot, ".kabeeri", "ai_learning", "failure_patterns.json");
  const repoLearningStateExistsBefore = fs.existsSync(repoLearningStatePath);
  const capture = JSON.parse(runKvdf([
    "learn",
    "capture",
    "--title",
    "Temp workspace guard",
    "--problem",
    "This test should only write runtime state in the temp dir",
    "--fix",
    "Keep the runtime file inside the temp workspace",
    "--category",
    "runtime_state",
    "--track",
    "owner",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(capture.report_type, "ai_learning_pattern_captured");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "ai_learning", "failure_patterns.json")));
  assert.strictEqual(fs.existsSync(repoLearningStatePath), repoLearningStateExistsBefore);
}));

test("ai learning plugin bundle is discoverable in plugin status", () => {
  const report = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: repoRoot }).stdout);
  assert.strictEqual(report.report_type, "plugin_loader_status");
  assert.ok(report.plugins.some((plugin) => plugin.plugin_id === "ai-learning"));
});

test("ai learning memory auto-syncs into planner prompts, resume guidance, and prompt packs", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Planner assertion drift",
    "--problem",
    "The planner prompt forgot the current AI learning warning",
    "--fix",
    "Inject the learned warning into the generated prompt",
    "--category",
    "test_failure",
    "--track",
    "owner",
    "--applies-to-tracks",
    "owner",
    "--json"
  ], { cwd: dir });
  runKvdf([
    "learn",
    "fast-path",
    "--title",
    "Planner prompt fast path",
    "--steps",
    "node --check src/cli/commands/planner.js,npm test,npm run check",
    "--validation",
    "node --check src/cli/commands/planner.js,npm test,npm run check",
    "--track",
    "owner",
    "--applies-to-tracks",
    "owner",
    "--json"
  ], { cwd: dir });

  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Add planner memory sync", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });

  const plannerPrompt = JSON.parse(runKvdf(["planner", "prompt", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(plannerPrompt.report_type, "kvdf_planner_codex_prompt");
  assert.ok(plannerPrompt.ai_learning);
  assert.match(plannerPrompt.prompt, /AI Learning Context/);
  assert.ok(plannerPrompt.ai_learning.active_warning_rules.length >= 0);

  const resume = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.ok(resume.ai_learning);
  assert.ok(Array.isArray(resume.ai_learning.active_warning_rules));
  assert.ok(Array.isArray(resume.ai_learning.fast_path_summaries));
  assert.ok(Array.isArray(resume.warnings));

  runKvdf(["task", "create", "--id", "task-001", "--title", "Build React settings component", "--workstream", "public_frontend", "--acceptance", "Settings can be saved"], { cwd: dir });
  runKvdf(["context-pack", "create", "--task", "task-001", "--allowed-files", "src/settings/", "--specs", "frontend_specs/settings.md"], { cwd: dir });
  const composition = JSON.parse(runKvdf(["prompt-pack", "compose", "react", "--task", "task-001", "--context", "ctx-001"], { cwd: dir }).stdout);
  assert.ok(composition.compact_guidance.ai_learning);
  assert.ok(fs.existsSync(path.join(dir, composition.output_path)));
  const prompt = fs.readFileSync(path.join(dir, composition.output_path), "utf8");
  assert.match(prompt, /AI Learning Memory/);
}));

test("dashboard state reflects canonical task statuses and next actions", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-state-001",
        title: "Draft task tracker update",
        status: "proposed",
        type: "feature",
        workstream: "docs",
        workstreams: ["docs"],
        source: "evolution:evo-004",
        allowed_files: ["docs/"],
        acceptance_criteria: ["Task tracker reflects the requested state behavior."],
        created_at: "2026-05-13T00:00:00.000Z"
      },
      {
        id: "task-state-002",
        title: "Verify task tracker update",
        status: "owner_verified",
        type: "feature",
        workstream: "docs",
        workstreams: ["docs"],
        source: "evolution:evo-004",
        allowed_files: ["docs/"],
        acceptance_criteria: ["Task tracker reflects the requested state behavior."],
        created_at: "2026-05-13T01:00:00.000Z"
      }
    ]
  }, null, 2), "utf8");

  const tracker = JSON.parse(runKvdf(["dashboard", "task-tracker"], { cwd: dir }).stdout);
  assert.strictEqual(tracker.summary.by_status.proposed, 1);
  assert.strictEqual(tracker.summary.by_status.owner_verified, 1);
  assert.strictEqual(tracker.summary.open, 1);
  assert.strictEqual(tracker.board.proposed[0].next_action, "approve or refine task scope");
  assert.strictEqual(tracker.tasks.find((task) => task.id === "task-state-001").next_action, "approve or refine task scope");
  assert.deepStrictEqual(tracker.tasks.find((task) => task.id === "task-state-002").blockers, []);
}));

test("task scheduler routes tasks across temp trash and agents with durable history", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "Scheduler Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-002", "--name", "Backup Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-sched-001", "--title", "Implement scheduler route", "--workstream", "backend", "--acceptance", "Scheduler route is recorded"], { cwd: dir });
  runKvdf(["task", "assign", "task-sched-001", "--assignee", "agent-001"], { cwd: dir });
  const tempRoute = JSON.parse(runKvdf(["schedule", "route", "task-sched-001", "--to", "temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(tempRoute.report_type, "task_scheduler_route_completed");
  assert.strictEqual(tempRoute.route, "temp");
  assert.ok(tempRoute.queue);
  const handoffRoute = JSON.parse(runKvdf(["schedule", "route", "task-sched-001", "--to", "agent", "--agent", "agent-002", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(handoffRoute.route, "agent");
  assert.strictEqual(handoffRoute.agent.id, "agent-002");
  const trashRoute = JSON.parse(runKvdf(["schedule", "route", "task-sched-001", "--to", "trash", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(trashRoute.route, "trash");
  assert.strictEqual(trashRoute.task.id, "task-sched-001");
  const history = JSON.parse(runKvdf(["schedule", "history", "--json"], { cwd: dir }).stdout);
  assert.ok(history.routes.length >= 3);
  assert.strictEqual(history.routes[history.routes.length - 1].to, "trash");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "task_scheduler.json"), "utf8"));
  assert.ok(state.routes.length >= 3);
}));

test("v5 adaptive questionnaire creates coverage and provenance tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["capability", "list"], { cwd: dir }).stdout, /Payments \/ Billing/);
  const capabilityMap = JSON.parse(runKvdf(["capability", "map"], { cwd: dir }).stdout);
  assert.strictEqual(capabilityMap.areas.length, 53);
  assert.match(runKvdf(["questionnaire", "flow"], { cwd: dir }).stdout, /progressive_expansion/);
  runKvdf(["questionnaire", "answer", "entry.project_type", "--value", "saas"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_users", "--value", "yes"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_admin", "--value", "yes"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_payments", "--value", "unknown"], { cwd: dir });
  const coverage = JSON.parse(runKvdf(["questionnaire", "coverage"], { cwd: dir }).stdout);
  assert.strictEqual(coverage.areas.length, 53);
  assert.ok(coverage.areas.some((area) => area.area_key === "authentication" && area.status === "required"));
  assert.ok(coverage.areas.some((area) => area.area_key === "payments_billing" && area.status === "needs_follow_up"));
  const missing = JSON.parse(runKvdf(["questionnaire", "missing"], { cwd: dir }).stdout);
  assert.ok(missing.follow_up.some((area) => area.area_key === "payments_billing"));
  const plan = JSON.parse(runKvdf(["questionnaire", "plan", "Build ecommerce store with Laravel backend React frontend payments shipping and customer mobile app", "--json"], { cwd: dir }).stdout);
  answerAllGeneratedQuestionnaireQuestions(dir, plan);
  runKvdf(["questionnaire", "review"], { cwd: dir });
  runKvdf(["questionnaire", "approve", "--confirm"], { cwd: dir });
  runKvdf(["questionnaire", "generate-tasks"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.source === "questionnaire_coverage"));
  assert.ok(tasks.some((task) => task.provenance && task.provenance.system_area_key === "payments_billing"));
  runKvdf(["memory", "add", "--type", "decision", "--text", "Use PostgreSQL for primary data"], { cwd: dir });
  assert.match(runKvdf(["memory", "list", "--type", "decision"], { cwd: dir }).stdout, /PostgreSQL/);
  const memorySummary = JSON.parse(runKvdf(["memory", "summary"], { cwd: dir }).stdout);
  assert.strictEqual(memorySummary.totals.decisions, 1);
  assert.match(runKvdf(["validate", "questionnaire"], { cwd: dir }).stdout, /coverage areas checked/);
}));

test("product blueprints map market systems to compact AI context", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["blueprint", "list"], { cwd: dir }).stdout, /eCommerce/);
  const ecommerce = JSON.parse(runKvdf(["blueprint", "show", "ecommerce"], { cwd: dir }).stdout);
  assert.ok(ecommerce.ai_context_summary.backend_modules.includes("checkout"));
  assert.ok(ecommerce.ai_context_summary.frontend_pages.includes("product_details"));
  assert.ok(ecommerce.ai_context_summary.database_entities.includes("orders"));
  const recommendation = JSON.parse(runKvdf(["blueprint", "recommend", "Build ecommerce store with catalog cart checkout payments shipping and customer mobile app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(recommendation.matches[0].blueprint_key, "ecommerce");
  assert.ok(recommendation.ai_context_summary.database_entities.includes("orders"));
  const selection = JSON.parse(runKvdf(["blueprint", "select", "ecommerce", "--delivery", "structured", "--reason", "Large catalog and payment scope"], { cwd: dir }).stdout);
  assert.strictEqual(selection.blueprint_key, "ecommerce");
  assert.strictEqual(selection.delivery_mode, "structured");
  const project = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project.json"), "utf8"));
  assert.strictEqual(project.product_blueprint, "ecommerce");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/product_blueprints.json"), "utf8"));
  assert.strictEqual(state.current_blueprint, "ecommerce");
  assert.strictEqual(state.recommendations.length, 1);
}));

test("data design blueprints create database modeling context from product blueprints", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["data-design", "principles"], { cwd: dir }).stdout, /workflow_first/);
  const commerce = JSON.parse(runKvdf(["data-design", "module", "commerce"], { cwd: dir }).stdout);
  assert.ok(commerce.entities.includes("orders"));
  const context = JSON.parse(runKvdf(["data-design", "context", "ecommerce", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(context.blueprint_key, "ecommerce");
  assert.ok(context.modules.includes("commerce"));
  assert.ok(context.entities.includes("order_items"));
  assert.ok(context.must_have.includes("snapshots_on_order_items"));
  assert.ok(context.risk_flags.includes("payment_idempotency"));
  const review = JSON.parse(runKvdf(["data-design", "review", "orders table with price float and items json"], { cwd: dir }).stdout);
  assert.strictEqual(review.status, "needs_attention");
  assert.ok(review.findings.some((item) => item.includes("float")));
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/data_design.json"), "utf8"));
  assert.strictEqual(state.contexts.length, 1);
  assert.strictEqual(state.reviews.length, 1);
  assert.match(runKvdf(["validate", "data-design"], { cwd: dir }).stdout, /data design catalog checked/);
}));

test("evolution steward creates impact plans and dependent follow-up tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["evolution", "priority", "evo-auto-047-owner-developer-cli-separation", "--status", "done", "--note", "Test isolation", "--json"], { cwd: dir });
  const preview = JSON.parse(runKvdf(["evolution", "plan", "Add dashboard live JSON docs update", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(preview.report_type, "evolution_feature_request_placement");
  assert.strictEqual(preview.requires_confirmation, true);
  assert.strictEqual(preview.awaiting_decision, true);
  assert.strictEqual(preview.status, "placement_required");
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8")).changes.length, 0);
  const result = JSON.parse(runKvdf(["evolution", "plan", "Add dashboard live JSON docs update", "--confirm-placement", "--priority-position", "4", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(result.change.change_id, "evo-001");
  assert.strictEqual(result.change.milestone_id, "evo-001");
  assert.strictEqual(result.change.sync_policy, "local_only");
  assert.strictEqual(result.change.github_sync_enabled, false);
  assert.strictEqual(result.change.review_gate, "viber_review_required");
  assert.match(result.change.branch_name, /^evo\//);
  assert.ok(result.change.impacted_areas.includes("dashboard"));
  assert.ok(result.change.impacted_areas.includes("docs"));
  assert.ok(result.change.impacted_areas.includes("capabilities"));
  assert.ok(["none", "review_required"].includes(result.change.duplicate_risk));
  assert.ok(result.tasks.length >= 6);
  assert.strictEqual(result.tasks[0].evolution_milestone_id, "evo-001");
  assert.strictEqual(result.tasks[0].sync_policy, "local_only");
  assert.strictEqual(result.tasks[0].github_sync_enabled, false);
  assert.strictEqual(result.tasks[0].archive_after_completion, true);
  assert.strictEqual(result.impact_plan.branch_name, result.change.branch_name);
  assert.strictEqual(result.impact_plan.review_gate, "viber_review_required");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8"));
  assert.strictEqual(state.changes.length, 1);
  assert.strictEqual(state.impact_plans.length, 1);
  assert.strictEqual(state.development_priorities.length, 47);
  const priorities = JSON.parse(runKvdf(["evolution", "priorities", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(priorities.report_type, "evolution_development_priorities");
  assert.strictEqual(priorities.next_priority.id, "evo-auto-046-task-scheduler");
  assert.ok(priorities.next_priority.execution_details.resume_steps.length >= 4);
  const next = JSON.parse(runKvdf(["evolution", "next", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(next.next.id, "evo-auto-046-task-scheduler");
  assert.ok(next.next_action);
  const updatedPriority = JSON.parse(runKvdf(["evolution", "priority", "evo-auto-044-task-trash-system", "--status", "done", "--note", "Finished workflow", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(updatedPriority.status, "done");
  const nextAfterUpdate = JSON.parse(runKvdf(["evolution", "next", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(nextAfterUpdate.next.id, "evo-auto-046-task-scheduler");
  assert.ok(nextAfterUpdate.next_action);
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  const dashboardTask = tasks.find((task) => task.source === "evolution:evo-001" && task.evolution_area === "dashboard");
  assert.ok(dashboardTask);
  assert.match(dashboardTask.execution_summary, /evo-001/);
  assert.ok(dashboardTask.resume_steps.length >= 4);
  assert.ok(dashboardTask.expected_outputs.length >= 3);
  assert.ok(dashboardTask.do_not_change.some((item) => item.includes("outside allowed_files")));
  assert.ok(dashboardTask.verification_commands.includes("npm run kvdf -- dashboard state"));
  const impactTask = state.impact_plans[0].tasks.find((task) => task.task_id === dashboardTask.id);
  assert.match(impactTask.execution_summary, /dashboard/);
  assert.ok(impactTask.resume_steps.length >= 4);
  const summary = JSON.parse(runKvdf(["evolution", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(summary.changes_total, 1);
  assert.strictEqual(summary.milestone_changes_total, 1);
  assert.strictEqual(summary.milestone_local_only_total, 1);
  assert.strictEqual(summary.task_trash_total, 0);
  assert.ok(summary.current_milestone);
  assert.ok(summary.open_follow_up_tasks > 0);
  assert.ok(summary.next_priority);
  assert.strictEqual(summary.feature_restructure_work_order.total_steps, 7);
  const resume = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(resume.evolution, null);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const dashboard = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(dashboard, /KVDF Viber Dashboard/);
  assert.match(dashboard, /Viber\/App Track/);
  assert.doesNotMatch(dashboard, /KVDF Owner Dashboard/);
  const reports = JSON.parse(runKvdf(["reports", "live", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(reports.reports.evolution.changes_total, 1);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /evolution\.json matches/);
}));

test("evolution steward can create a github-linked milestone without making github mandatory", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["evolution", "priority", "evo-auto-047-owner-developer-cli-separation", "--status", "done", "--note", "Test isolation", "--json"], { cwd: dir });
  const result = JSON.parse(runKvdf(["evolution", "plan", "Add optional GitHub branch and PR flow", "--confirm-placement", "--priority-position", "4", "--github-sync", "--merge-target-branch", "develop", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(result.change.sync_policy, "github_optional");
  assert.strictEqual(result.change.github_sync_enabled, true);
  assert.strictEqual(result.change.merge_target_branch, "develop");
  assert.strictEqual(result.change.source_control, "github-linked");
  assert.strictEqual(result.tasks[0].github_sync_enabled, true);
  assert.strictEqual(result.tasks[0].merge_target_branch, "develop");
  assert.strictEqual(result.tasks[0].sync_policy, "github_optional");
  const summary = JSON.parse(runKvdf(["evolution", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(summary.milestone_github_linked_total, 1);
}));

test("evolution scorecards build a review-only scorecard report", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const report = JSON.parse(runKvdf(["evolution", "scorecards", "--actor", "owner-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kabeeri_scorecards");
  assert.strictEqual(report.scorecards.length, 6);
  assert.ok(Array.isArray(report.scorecard_plans));
  assert.strictEqual(report.scorecard_plans.length, 0);
  assert.ok(Array.isArray(report.scorecard_tasks));
  assert.strictEqual(report.scorecard_tasks.length, 0);
  assert.strictEqual(report.summary.scorecards_materialized, false);
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "evolution.json"), "utf8"));
  assert.strictEqual(state.scorecards.length, 6);
  assert.strictEqual(state.changes.length, 0);
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_SCORECARDS.md")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "kabeeri_scorecards.json")));
  const summary = JSON.parse(runKvdf(["evolution", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(summary.scorecards_total >= 6);
}));

test("runtime schema validation accepts task completion and coverage report patterns", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".kabeeri", "reports"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "reports", "task-501.completion.json"), JSON.stringify({
    report_type: "task_completion_report",
    task_id: "task-501",
    status: "done"
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "reports", "task_coverage_task-501.json"), JSON.stringify({
    report_type: "task_full_coverage_report",
    task_id: "task-501",
    coverage: {
      state: "planned",
      materialized: false,
      planned_slices: 1,
      completed_slices: 0,
      open_slices: 1,
      remainder_free: false
    }
  }, null, 2), "utf8");
  const output = runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout;
  assert.match(output, /runtime schema validation checked/);
  assert.match(output, /task-501\.completion\.json matches KVDF Generic Report State/);
}));

test("evolution batch-exe reports ready and blocked tasks through both aliases", () => withTempDir((dir) => {
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "developers.json"), JSON.stringify({
    developers: [
      {
        id: "owner-001",
        display_name: "Test Owner",
        role: "Owner",
        status: "active",
        workstreams: []
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-ready-001",
        title: "Prepare catalog",
        status: "approved",
        workstream: "backend",
        workstreams: ["backend"],
        assignee_id: "agent-001",
        allowed_files: ["src/cli/commands/evolution.js"],
        created_at: "2026-05-14T00:00:00.000Z"
      },
      {
        id: "task-ready-002",
        title: "Publish docs",
        status: "ready",
        workstream: "docs",
        workstreams: ["docs"],
        allowed_files: ["docs/SYSTEM_CAPABILITIES_REFERENCE.md"],
        created_at: "2026-05-14T00:01:00.000Z"
      },
      {
        id: "task-blocked-001",
        title: "Missing assignee",
        status: "approved",
        workstream: "backend",
        workstreams: ["backend"],
        allowed_files: ["src/cli/index.js"],
        created_at: "2026-05-14T00:02:00.000Z"
      }
    ]
  }, null, 2), "utf8");
  const rootReport = JSON.parse(runKvdf(["batch-exe", "--actor", "owner-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(rootReport.report_type, "evolution_batch_execution");
  assert.strictEqual(rootReport.summary.total_candidates, 3);
  assert.strictEqual(rootReport.summary.ready_total, 3);
  assert.strictEqual(rootReport.summary.blocked_total, 0);
  assert.strictEqual(rootReport.status, "ready");
  assert.strictEqual(rootReport.summary.next_task_id, "task-ready-001");
  assert.ok(rootReport.next_actions.length > 0);
  assert.strictEqual(rootReport.auto_assignee_id, "codex");
  assert.deepStrictEqual(rootReport.auto_assigned_task_ids, ["task-ready-002", "task-blocked-001"]);
  assert.ok(fs.existsSync(path.join(dir, rootReport.batch_state_path)));
  assert.strictEqual(rootReport.blocked_tasks.length, 0);
  const tasksState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8"));
  assert.strictEqual(tasksState.tasks.find((item) => item.id === "task-blocked-001").assignee_id, "codex");
  const evolutionReport = JSON.parse(runKvdf(["evolution", "batch-exe", "--actor", "owner-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(evolutionReport.report_type, "evolution_batch_execution");
  assert.strictEqual(evolutionReport.summary.ready_total, 3);
  assert.strictEqual(evolutionReport.auto_assignee_id, null);
  assert.strictEqual(evolutionReport.batch_state_path, ".kabeeri/reports/evolution_batch_execution.json");
}));

test("evolution batch-exe auto-assigns missing tasks to the active multi-ai leader when present", () => withTempDir((dir) => {
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "developers.json"), JSON.stringify({
    developers: [
      {
        id: "owner-001",
        display_name: "Test Owner",
        role: "Owner",
        status: "active",
        workstreams: []
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-leader-001",
        title: "Leader owned task",
        status: "approved",
        workstream: "backend",
        workstreams: ["backend"],
        allowed_files: ["src/cli/index.js"],
        created_at: "2026-05-14T00:00:00.000Z"
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "multi_ai_governance.json"), JSON.stringify({
    version: "v1",
    active_leader_session_id: "leader-session-001",
    leader_sessions: [
      {
        session_id: "leader-session-001",
        leader_ai_id: "agent-leader-001",
        status: "active"
      }
    ],
    agent_entries: [],
    worker_queues: [],
    call_inbox: [],
    merge_bundles: []
  }, null, 2), "utf8");
  const report = JSON.parse(runKvdf(["batch-exe", "--actor", "owner-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.auto_assignee_id, "agent-leader-001");
  assert.deepStrictEqual(report.auto_assigned_task_ids, ["task-leader-001"]);
  const tasksState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8"));
  assert.strictEqual(tasksState.tasks[0].assignee_id, "agent-leader-001");
  assert.strictEqual(report.status, "ready");
}));

test("task batch-run executes approved tasks to completion and creates execution artifacts", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "plugins"), { recursive: true });
  fs.cpSync(path.join(repoRoot, "plugins", "kvdf_dev"), path.join(dir, "plugins", "kvdf_dev"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-batch-001",
        title: "Prepare catalog",
        status: "approved",
        source: "manual:test",
        workstream: "backend",
        workstreams: ["backend"],
        allowed_files: ["src/cli/index.js"],
        created_at: "2026-05-14T00:00:00.000Z"
      },
      {
        id: "task-batch-002",
        title: "Publish docs",
        status: "approved",
        source: "manual:test",
        workstream: "docs",
        workstreams: ["docs"],
        allowed_files: ["docs/SYSTEM_CAPABILITIES_REFERENCE.md"],
        created_at: "2026-05-14T00:01:00.000Z"
      }
    ]
  }, null, 2), "utf8");
  runKvdf(["questionnaire", "plan", "Build a booking workspace with approved execution tasks", "--blueprint", "booking", "--json"], { cwd: dir });
  const report = JSON.parse(runKvdf(["task", "batch-run", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "task_batch_run");
  assert.strictEqual(report.summary.total_candidates, 2);
  assert.strictEqual(report.summary.started_total, 2);
  assert.strictEqual(report.summary.completed_total, 2);
  assert.strictEqual(report.summary.blocked_total, 0);
  assert.strictEqual(report.status, "completed");
  assert.strictEqual(report.auto_assignee_id, "codex");
  assert.deepStrictEqual(report.started_tasks.map((item) => item.id), ["task-batch-001", "task-batch-002"]);
  assert.deepStrictEqual(report.completed_tasks.map((item) => item.id), ["task-batch-001", "task-batch-002"]);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "task_batch_run.json")));
  const tasksState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8"));
  assert.strictEqual(tasksState.tasks.some((item) => item.id === "task-batch-001"), false);
  assert.strictEqual(tasksState.tasks.some((item) => item.id === "task-batch-002"), false);
  const tokens = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tokens.json"), "utf8"));
  assert.strictEqual(tokens.tokens.filter((item) => item.task_id === "task-batch-001" && item.status === "revoked").length, 1);
  assert.strictEqual(tokens.tokens.filter((item) => item.task_id === "task-batch-002" && item.status === "revoked").length, 1);
  const locks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "locks.json"), "utf8"));
  assert.strictEqual(locks.locks.filter((item) => item.task_id === "task-batch-001" && item.status === "released").length, 1);
  assert.strictEqual(locks.locks.filter((item) => item.task_id === "task-batch-002" && item.status === "released").length, 1);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "task-batch-001.verification.md")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "task-batch-001.completion.json")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "task-batch-002.verification.md")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "task-batch-002.completion.json")));
}));

test("task packet compiles a durable control-plane packet from intake, briefs, and approved tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    current_change_id: "evo-006",
    changes: [
      {
        change_id: "evo-006",
        task_ids: ["task-packet-001", "task-packet-002"]
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-packet-001",
        title: "Prepare packet compiler",
        status: "approved",
        created_at: "2026-05-14T00:00:00.000Z"
      },
      {
        id: "task-packet-002",
        title: "Review packet output",
        status: "approved",
        assignee_id: "agent-002",
        created_at: "2026-05-14T00:01:00.000Z"
      },
      {
        id: "task-packet-003",
        title: "Later execution work",
        status: "in_progress",
        created_at: "2026-05-14T00:02:00.000Z"
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "interactions", "context_briefs.json"), JSON.stringify({
    briefs: [
      {
        brief_id: "brief-001",
        generated_at: "2026-05-14T00:00:00.000Z",
        current_vibe_session: "vibe-session-001",
        latest_intent: {
          intent_id: "intent-001",
          language: "en",
          text: "Build a booking website with onboarding, modules, and approval-ready tasks",
          intent_type: "project_start",
          confidence: 0.92,
          risk_level: "medium",
          missing_details: ["hosting choice"],
          suggested_next_action: "ask_clarifying_question"
        },
        open_suggestions: [],
        open_tasks: [],
        recent_captures: []
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "questionnaires", "answers.json"), JSON.stringify({
    answers: [
      {
        answer_id: "answer-001",
        question_id: "adaptive.product.blueprint_confirmation",
        value: "booking",
        area_ids: ["product_business"],
        answered_at: "2026-05-14T00:00:00.000Z",
        confidence: "confirmed"
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "product_blueprints.json"), JSON.stringify({
    selected_blueprints: [
      {
        blueprint_key: "booking",
        blueprint_name: "Booking",
        backend_modules: ["booking", "availability"],
        frontend_pages: ["landing", "booking-flow"],
        database_entities: ["bookings", "timeslots"]
      }
    ],
    recommendations: [],
    current_blueprint: {
      blueprint_key: "booking",
      blueprint_name: "Booking",
      backend_modules: ["booking", "availability"],
      frontend_pages: ["landing", "booking-flow"],
      database_entities: ["bookings", "timeslots"]
    }
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "data_design.json"), JSON.stringify({
    contexts: [
      {
        context_id: "data-context-001",
        modules: ["booking", "availability", "payments"],
        entities: ["bookings", "timeslots", "payments"]
      }
    ],
    reviews: [],
    current_context: {
      context_id: "data-context-001",
      modules: ["booking", "availability", "payments"],
      entities: ["bookings", "timeslots", "payments"]
    }
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "delivery_decisions.json"), JSON.stringify({
    recommendations: [
      {
        delivery_id: "delivery-001",
        mode: "structured",
        title: "Structured delivery"
      }
    ],
    decisions: [
      {
        delivery_id: "delivery-001",
        mode: "structured",
        title: "Structured delivery",
        status: "selected"
      }
    ],
    current_mode: {
      delivery_id: "delivery-001",
      mode: "structured",
      title: "Structured delivery",
      status: "selected"
    }
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "interactions", "suggested_tasks.json"), JSON.stringify({
    suggested_tasks: [
      {
        suggestion_id: "suggestion-001",
        title: "Design booking intake",
        workstream: "backend",
        task_type: "foundation",
        status: "suggested",
        risk_level: "medium",
        approval_required: false
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "questionnaires", "adaptive_intake_plan.json"), JSON.stringify({
    plans: [
      {
        plan_id: "plan-001",
        created_at: "2026-05-14T00:05:00.000Z",
        description: "Build a booking website with onboarding, modules, and approval-ready tasks",
        input_language: "en",
        output_language: "en",
        blueprint: {
          key: "booking",
          name: "Booking"
        },
        module_plan: {
          module_plan_id: "module-plan-001"
        },
        delivery_map: {
          delivery_map_id: "delivery-map-001",
          active_mode: "structured",
          phases: [{ phase_id: "phase-001", modules: ["booking"] }],
          module_batches: [{ batch_id: "batch-001", modules: ["booking"] }]
        },
        task_generation_contract: {
          source_plan_id: "plan-001",
          module_plan_id: "module-plan-001",
          delivery_map_id: "delivery-map-001",
          task_generation_mode: "coverage",
          source_of_truth: "adaptive_intake_plan"
        }
      }
    ],
    current_plan_id: "plan-001"
  }, null, 2), "utf8");
  const report = JSON.parse(runKvdf(["task", "packet", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "task_control_plane_packet");
  assert.strictEqual(report.summary.candidate_total, 2);
  assert.strictEqual(report.status, "ready");
  assert.strictEqual(report.next_action, "kvdf task assign task-packet-001 --assignee codex");
  assert.strictEqual(report.next_exact_action, report.next_action);
  assert.match(runKvdf(["task", "packet"], { cwd: dir }).stdout, /Next exact action:/);
  assert.strictEqual(report.source_snapshot.vibe_intent.text, "Build a booking website with onboarding, modules, and approval-ready tasks");
  assert.strictEqual(report.source_snapshot.questionnaire.total_answers, 1);
  assert.strictEqual(report.source_snapshot.brief.brief_id, "brief-001");
  assert.strictEqual(report.source_snapshot.blueprints.current_blueprint.blueprint_key, "booking");
  assert.strictEqual(report.source_snapshot.data_design.current_context_id, "data-context-001");
  assert.strictEqual(report.source_snapshot.delivery.current_mode.mode, "structured");
  assert.strictEqual(report.source_snapshot.traceability.complete, true);
  assert.deepStrictEqual(report.source_snapshot.traceability.missing_steps, []);
  assert.ok(report.source_snapshot.traceability.chain.includes("vibe_brief"));
  assert.ok(report.source_snapshot.traceability.chain.includes("questionnaire_answers"));
  assert.ok(report.source_snapshot.traceability.chain.includes("module_plan"));
  assert.ok(report.source_snapshot.traceability.chain.includes("delivery_map"));
  assert.ok(report.source_snapshot.traceability.chain.includes("blueprint"));
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_TASK_CONTROL_PLANE_PACKET.json")));
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_TASK_CONTROL_PLANE_PACKET.md")));
}));

test("task executor contract derives a packet-only AI boundary from the control-plane packet", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "docs", "reports"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-contract-001",
        title: "Implement executor boundary",
        status: "approved",
        assignee_id: "codex",
        allowed_files: ["src/cli/index.js", "plugins/kvdf_dev/runtime/"],
        acceptance_criteria: ["Compile executor contract", "Document allowed files"],
        created_at: "2026-05-14T00:00:00.000Z"
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, "docs", "reports", "KVDF_TASK_CONTROL_PLANE_PACKET.json"), JSON.stringify({
    report_type: "task_control_plane_packet",
    generated_at: "2026-05-14T00:00:00.000Z",
    packet_id: "task-packet-001",
    status: "ready",
    message: "ready",
    packet_state_path: "docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json",
    recommended_assignee_id: "codex",
    next_action: "kvdf task start task-contract-001 --actor codex",
    next_command: "kvdf task start task-contract-001 --actor codex",
    execution_queue: [
      {
        id: "task-contract-001",
        title: "Implement executor boundary",
        status: "approved",
        assignee_id: "codex",
        next_action: "continue execution",
        allowed_files: ["src/cli/index.js", "plugins/kvdf_dev/runtime/"],
        acceptance_criteria_count: 2
      }
    ]
  }, null, 2), "utf8");

  const report = JSON.parse(runKvdf(["task", "executor-contract", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "task_executor_contract");
  assert.strictEqual(report.packet_id, "task-packet-001");
  assert.strictEqual(report.current_task_id, "task-contract-001");
  assert.ok(report.allowed_files.includes("src/cli/index.js"));
  assert.ok(report.forbidden_actions.includes("change task priority"));
  assert.strictEqual(report.packet_hints.next_command, "kvdf task start task-contract-001 --actor codex");
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_TASK_EXECUTOR_CONTRACT.json")));
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_TASK_EXECUTOR_CONTRACT.md")));
}));

test("task batch-run supports dry-run and review modes without starting tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "kvdf-dev");
  const pluginBeforeInstall = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(pluginBeforeInstall.plugins.find((item) => item.plugin_id === "kvdf-dev"));
  runKvdf(["plugins", "disable", "kvdf-dev"], { cwd: dir });
  const pluginAfterDisable = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginAfterDisable.plugins.find((item) => item.plugin_id === "kvdf-dev").status, "disabled");
  runKvdf(["plugins", "install", "kvdf-dev"], { cwd: dir });
  const pluginAfterInstall = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginAfterInstall.plugins.find((item) => item.plugin_id === "kvdf-dev").status, "enabled");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-mode-001",
        title: "Preview batch mode",
        status: "approved",
        assignee_id: "codex",
        allowed_files: ["src/cli/index.js"],
        acceptance_criteria: ["Preview", "Review"],
        created_at: "2026-05-14T00:00:00.000Z"
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "interactions", "context_briefs.json"), JSON.stringify({
    briefs: [
      {
        brief_id: "brief-001",
        generated_at: "2026-05-14T00:00:00.000Z",
        current_vibe_session: "vibe-session-001",
        latest_intent: {
          intent_id: "intent-001",
          language: "en",
          text: "Preview batch mode with governed execution",
          intent_type: "project_start",
          confidence: 0.92,
          risk_level: "medium",
          missing_details: [],
          suggested_next_action: "ask_clarifying_question"
        },
        open_suggestions: [],
        open_tasks: [],
        recent_captures: []
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "questionnaires", "answers.json"), JSON.stringify({
    answers: [
      {
        answer_id: "answer-001",
        question_id: "adaptive.product.blueprint_confirmation",
        value: "booking",
        area_ids: ["product_business"],
        answered_at: "2026-05-14T00:00:00.000Z",
        confidence: "confirmed"
      }
    ]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "product_blueprints.json"), JSON.stringify({
    selected_blueprints: [
      {
        blueprint_key: "booking",
        blueprint_name: "Booking",
        backend_modules: ["booking", "availability"],
        frontend_pages: ["landing", "booking-flow"],
        database_entities: ["bookings", "timeslots"]
      }
    ],
    recommendations: [],
    current_blueprint: {
      blueprint_key: "booking",
      blueprint_name: "Booking",
      backend_modules: ["booking", "availability"],
      frontend_pages: ["landing", "booking-flow"],
      database_entities: ["bookings", "timeslots"]
    }
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "data_design.json"), JSON.stringify({
    contexts: [
      {
        context_id: "data-context-001",
        modules: ["booking", "availability", "payments"],
        entities: ["bookings", "timeslots", "payments"]
      }
    ],
    reviews: [],
    current_context: {
      context_id: "data-context-001",
      modules: ["booking", "availability", "payments"],
      entities: ["bookings", "timeslots", "payments"]
    }
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "delivery_decisions.json"), JSON.stringify({
    recommendations: [
      {
        delivery_id: "delivery-001",
        mode: "structured",
        title: "Structured delivery"
      }
    ],
    decisions: [
      {
        delivery_id: "delivery-001",
        mode: "structured",
        title: "Structured delivery",
        status: "selected"
      }
    ],
    current_mode: {
      delivery_id: "delivery-001",
      mode: "structured",
      title: "Structured delivery",
      status: "selected"
    }
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "questionnaires", "adaptive_intake_plan.json"), JSON.stringify({
    plans: [
      {
        plan_id: "plan-001",
        created_at: "2026-05-14T00:05:00.000Z",
        description: "Preview batch mode with governed execution",
        input_language: "en",
        output_language: "en",
        blueprint: {
          key: "booking",
          name: "Booking"
        },
        module_plan: {
          module_plan_id: "module-plan-001"
        },
        delivery_map: {
          delivery_map_id: "delivery-map-001",
          active_mode: "structured",
          phases: [{ phase_id: "phase-001", modules: ["booking"] }],
          module_batches: [{ batch_id: "batch-001", modules: ["booking"] }]
        },
        task_generation_contract: {
          source_plan_id: "plan-001",
          module_plan_id: "module-plan-001",
          delivery_map_id: "delivery-map-001",
          task_generation_mode: "coverage",
          source_of_truth: "adaptive_intake_plan"
        }
      }
    ],
    current_plan_id: "plan-001"
  }, null, 2), "utf8");

  const dryRun = JSON.parse(runKvdf(["task", "batch-run", "--mode", "dry-run", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(dryRun.mode, "dry-run");
  assert.strictEqual(dryRun.status, "preview");
  assert.strictEqual(dryRun.summary.started_total, 0);
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_TASK_CONTROL_PLANE_PACKET.json")));

  const review = JSON.parse(runKvdf(["task", "batch-run", "--mode", "review", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.mode, "review");
  assert.strictEqual(review.status, "preview");
  assert.strictEqual(review.summary.started_total, 0);
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_TASK_EXECUTOR_CONTRACT.json")));
}));

test("evolution roadmap exposes the canonical seven-step restructure order", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "kvdf-dev");
  const pluginBeforeInstall = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(pluginBeforeInstall.plugins.find((item) => item.plugin_id === "kvdf-dev"));
  runKvdf(["plugins", "disable", "kvdf-dev"], { cwd: dir });
  const pluginAfterDisable = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginAfterDisable.plugins.find((item) => item.plugin_id === "kvdf-dev").status, "disabled");
  runKvdf(["plugins", "install", "kvdf-dev"], { cwd: dir });
  const pluginAfterInstall = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginAfterInstall.plugins.find((item) => item.plugin_id === "kvdf-dev").status, "enabled");
  const roadmap = JSON.parse(runKvdf(["evolution", "roadmap", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(roadmap.report_type, "kvdf_feature_restructure_roadmap");
  assert.strictEqual(roadmap.roadmap.length, 7);
  assert.strictEqual(roadmap.roadmap[0].title, "Capability Registry and Source Mapping");
  assert.strictEqual(roadmap.roadmap[6].title, "Source Folder Normalization and Preservation");
  const priorities = JSON.parse(runKvdf(["evolution", "priorities", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(priorities.roadmap.roadmap.length, 7);
  assert.strictEqual(priorities.priorities.length, 47);
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 4).title, "Capability Partition Matrix");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 5).title, "Core Shared Layer and Plugin Loader");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 6).title, "Owner Plugin Packaging and Load Control");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 7).title, "Developer App Workspace Layout");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 8).title, "Owner and Developer CLI Separation");
  assert.ok(priorities.priorities.find((item) => item.id === "evo-auto-047-owner-developer-cli-separation").included_surfaces.length >= 3);
  assert.ok(priorities.priorities.find((item) => item.id === "evo-auto-050-core-shared-layer-and-plugin-loader").tree_view.length >= 3);
  assert.ok(priorities.priorities.find((item) => item.id === "evo-auto-048-developer-app-workspace-layout").acceptance_criteria.length >= 3);
  assert.ok(priorities.priorities.find((item) => item.id === "evo-auto-049-owner-plugin-packaging").implementation_notes.length >= 3);
  const capabilityPartition = priorities.priorities.find((item) => item.id === "evo-auto-051-capability-partition-matrix");
  assert.ok(capabilityPartition.tree_view.length >= 4);
  assert.ok(capabilityPartition.partition_rules.length >= 4);
  assert.ok(capabilityPartition.acceptance_criteria.length >= 4);
  const partitionMatrix = JSON.parse(runKvdf(["evolution", "partition", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(partitionMatrix.report_type, "kvdf_capability_partition_matrix");
  assert.strictEqual(partitionMatrix.total_capabilities, 53);
  assert.strictEqual(partitionMatrix.bucket_totals.core, 25);
  assert.strictEqual(partitionMatrix.bucket_totals.owner_plugin, 8);
  assert.strictEqual(partitionMatrix.bucket_totals.app_workspace, 20);
  assert.ok(partitionMatrix.buckets.find((bucket) => bucket.bucket_id === "kabeeri-core").capabilities.some((item) => item.title === "CLI Engine"));
  assert.ok(partitionMatrix.buckets.find((bucket) => bucket.bucket_id === "plugins/kvdf_dev").capabilities.some((item) => item.title === "KVDF Dev System / Evolution Steward"));
  assert.ok(partitionMatrix.buckets.find((bucket) => bucket.bucket_id === "workspaces/apps/<app-slug>").capabilities.some((item) => item.title === "Vibe App Developer Track"));
  assert.match(runKvdf(["evolution", "partition"], { cwd: dir }).stdout, /KVDF Capability Partition Matrix/);
  const pluginsStatus = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsStatus.report_type, "plugin_loader_status");
  assert.strictEqual(pluginsStatus.total_plugins, 1);
  assert.strictEqual(pluginsStatus.active_plugins, 1);
  assert.strictEqual(pluginsStatus.plugins[0].plugin_id, "kvdf-dev");
  assert.strictEqual(pluginsStatus.plugins[0].status, "enabled");
  assert.strictEqual(pluginsStatus.plugins[0].bundle_contract.status, "ready");
  assert.ok(pluginsStatus.plugins[0].bundle_contract.next_exact_action.length > 0);
  const pluginsShow = JSON.parse(runKvdf(["plugins", "show", "kvdf-dev", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsShow.plugin_id, "kvdf-dev");
  const pluginsDisabled = JSON.parse(runKvdf(["plugins", "disable", "kvdf-dev", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsDisabled.active_plugins, 0);
  assert.strictEqual(pluginsDisabled.plugins[0].status, "disabled");
  const pluginsEnabled = JSON.parse(runKvdf(["plugins", "enable", "kvdf-dev", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsEnabled.active_plugins, 1);
  assert.strictEqual(pluginsEnabled.plugins[0].status, "enabled");
  fs.cpSync(path.join(repoRoot, "plugins", "multi_ai_governance"), path.join(dir, "plugins", "multi_ai_governance"), { recursive: true });
  const pluginsWithMultiAi = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsWithMultiAi.total_plugins, 2);
  assert.strictEqual(pluginsWithMultiAi.active_plugins, 1);
  assert.strictEqual(pluginsWithMultiAi.plugins.find((item) => item.plugin_id === "multi_ai_governance").status, "disabled");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 1).title, "Task Trash System");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 2).title, "AI Agent Hub and Leader Lease");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 3).title, "Task Scheduler System");
  assert.strictEqual(priorities.priorities.find((item) => item.id === "evo-auto-018-capability-registry").title, "Capability Registry");
  assert.strictEqual(priorities.priorities.find((item) => item.id === "evo-auto-041-execution-reports").title, "Execution Reports");
  assert.match(runKvdf(["evolution", "priorities"], { cwd: dir }).stdout, /KVDF Feature Restructure Roadmap/);
}));

test("security auditor plugin installs scans clean workspaces and blocks fake secrets", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "security-auditor");

  const loader = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  const auditor = loader.plugins.find((item) => item.plugin_id === "security-auditor");
  assert.ok(auditor);
  assert.strictEqual(auditor.status, "disabled");

  const initialStatus = JSON.parse(runKvdf(["security-auditor", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(initialStatus.report_type, "security_auditor_status");
  assert.strictEqual(initialStatus.plugin_enabled, false);
  assert.strictEqual(initialStatus.external_tools_required, false);

  runKvdf(["plugins", "install", "security-auditor"], { cwd: dir });
  const installedLoader = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(installedLoader.plugins.find((item) => item.plugin_id === "security-auditor").status, "enabled");

  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "ok.js"), "const ok = true;\n", "utf8");
  const cleanScan = JSON.parse(runKvdf(["security-auditor", "scan", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(cleanScan.report_type, "security_auditor_scan");
  assert.strictEqual(cleanScan.status, "pass");
  assert.strictEqual(cleanScan.summary.blocked, 0);
  assert.strictEqual(cleanScan.summary.warnings, 0);
  assert.strictEqual(cleanScan.summary.files_scanned > 0, true);
  assert.strictEqual(cleanScan.track, "owner");

  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "leak.js"), 'const password = "secretpassword123456";\n', "utf8");
  const blockedScan = JSON.parse(runKvdf(["security-auditor", "scan", "--include", "src/leak.js", "--track", "plugin", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(blockedScan.status, "blocked");
  assert.ok(blockedScan.findings.length > 0);
  assert.ok(blockedScan.findings.some((item) => item.severity === "critical"));

  const report = JSON.parse(runKvdf(["security-auditor", "report", "--track", "plugin", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "security_auditor_report");
  assert.ok(Array.isArray(report.findings));
  assert.ok(report.findings.length > 0);
  assert.strictEqual(report.status, "blocked");

  runKvdf(["plugins", "uninstall", "security-auditor"], { cwd: dir });
  const uninstalledLoader = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(uninstalledLoader.plugins.find((item) => item.plugin_id === "security-auditor").status, "disabled");
}));

test("security gate reports task, evolution, and handoff scopes without requiring the plugin", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-001",
        title: "Security gate task",
        status: "owner_verified",
        track: "framework_owner",
        acceptance_criteria: ["Done"],
        verified_by: "owner-001",
        verified_at: new Date().toISOString()
      }
    ]
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    changes: [
      {
        change_id: "evo-001",
        title: "Security gate evolution",
        status: "planned"
      }
    ],
    current_change_id: "evo-001"
  }, null, 2));

  const workspaceGate = JSON.parse(runKvdf(["security", "gate", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(workspaceGate.report_type, "kvdf_security_gate_state");
  assert.strictEqual(workspaceGate.plugin.plugin_id, "security-auditor");
  assert.strictEqual(workspaceGate.plugin.installed, false);
  assert.strictEqual(workspaceGate.plugin.active, false);
  assert.strictEqual(workspaceGate.scope, "workspace");
  assert.strictEqual(workspaceGate.status, "not_required");
  assert.strictEqual(workspaceGate.policy_source, "default");
  assert.deepStrictEqual(workspaceGate.target, { task_id: null, evolution_id: null, handoff_id: null });

  const taskGate = JSON.parse(runKvdf(["security", "gate", "--task", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(taskGate.scope, "task");
  assert.strictEqual(taskGate.track, "owner");
  assert.strictEqual(taskGate.status, "not_required");
  assert.strictEqual(taskGate.target.task_id, "task-001");

  const evolutionGate = JSON.parse(runKvdf(["security", "gate", "--evolution", "current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(evolutionGate.scope, "evolution");
  assert.strictEqual(evolutionGate.status, "not_required");
  assert.strictEqual(evolutionGate.target.evolution_id, "evo-001");

  const handoffGate = JSON.parse(runKvdf(["security", "gate", "--handoff", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(handoffGate.scope, "handoff");
  assert.strictEqual(handoffGate.status, "not_required");

  copyPluginBundle(dir, "security-auditor");
  runKvdf(["plugins", "install", "security-auditor"], { cwd: dir });
  const pluginGate = JSON.parse(runKvdf(["security", "gate", "--task", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginGate.plugin.installed, true);
  assert.strictEqual(pluginGate.plugin.enabled, true);
  assert.strictEqual(pluginGate.plugin.plugin_id, "security-auditor");
  assert.strictEqual(pluginGate.plugin.available, true);
  assert.strictEqual(pluginGate.plugin.active, true);
}));

test("security gate policy defaults to non-blocking but honors required, strict, and runtime policy overrides", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });

  const defaultGate = JSON.parse(runKvdf(["security", "gate", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(defaultGate.policy_source, "default");
  assert.strictEqual(defaultGate.required, false);
  assert.strictEqual(defaultGate.status, "not_required");

  fs.writeFileSync(path.join(dir, ".env"), "API_KEY=secret1234567890abcdef\n", "utf8");
  const blockedScan = JSON.parse(runKvdf(["security", "scan", "--include", ".env"], { cwd: dir }).stdout);
  assert.strictEqual(blockedScan.status, "blocked");

  const requiredGate = JSON.parse(runKvdf(["security", "gate", "--required", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(requiredGate.required, true);
  assert.strictEqual(requiredGate.status, "warning");

  const strictGate = JSON.parse(runKvdf(["security", "gate", "--strict", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(strictGate.required, true);
  assert.strictEqual(strictGate.strict_blocking, true);
  assert.strictEqual(strictGate.status, "blocked");

  fs.mkdirSync(path.join(dir, ".kabeeri", "policies"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "policies", "security_gate_policy.json"), JSON.stringify({
    security_gate_policy_version: "1",
    default_required: false,
    strict_blocking: true,
    required_scopes: ["task"],
    required_tracks: [],
    required_before: [],
    blocked_statuses: ["blocked"],
    warning_statuses: ["warning"],
    missing_plugin_behavior: "warn",
    notes: ["Runtime policy overrides the default policy."]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      { id: "task-010", title: "Runtime policy task", status: "owner_verified" }
    ]
  }, null, 2));
  const runtimePolicyGate = JSON.parse(runKvdf(["security", "gate", "--task", "task-010", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(runtimePolicyGate.policy_source, "runtime");
  assert.strictEqual(runtimePolicyGate.required, true);
  assert.strictEqual(runtimePolicyGate.status, "blocked");
}));

test("security gate exact task lookup is deterministic and rejects missing or ambiguous task ids", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      { id: "task-001", title: "Exact match", status: "owner_verified" }
    ],
    active_tasks: [
      { task_id: "task-001", title: "Duplicate exact match", status: "owner_verified" }
    ],
    items: [
      { taskId: "task-002", title: "Different task", status: "approved" }
    ]
  }, null, 2));

  const exact = JSON.parse(runKvdf(["security", "gate", "--task", "task-002", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(exact.target.task_id, "task-002");

  assert.match(runKvdf(["security", "gate", "--task", "task-999", "--json"], { cwd: dir, expectFailure: true }).stderr, /Task not found: task-999/);
  assert.match(runKvdf(["security", "gate", "--task", "task-001", "--json"], { cwd: dir, expectFailure: true }).stderr, /Ambiguous task id: task-001/);
}));

test("evolution priorities lists open work before archived done items", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const priorities = JSON.parse(runKvdf(["evolution", "priorities", "--json"], { cwd: dir }).stdout);
  assert.ok(Array.isArray(priorities.open_priorities));
  assert.ok(Array.isArray(priorities.archived_priorities));
  assert.ok(priorities.open_priorities.length > 0);
  assert.ok(priorities.archived_priorities.some((item) => item.status === "done"));
  assert.notStrictEqual(priorities.priorities[0].status, "done");
  assert.strictEqual(priorities.next_priority.status, "planned");
}));

test("evolution steward requires owner placement confirmation before interrupting active priority", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["evolution", "priority", "evo-auto-044-task-trash-system", "--status", "in_progress", "--note", "Current slice", "--json"], { cwd: dir });
  const proposed = JSON.parse(runKvdf(["evolution", "plan", "Add a new framework capability while work is active", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(proposed.report_type, "evolution_feature_request_placement");
  assert.strictEqual(proposed.requires_confirmation, true);
  assert.strictEqual(proposed.awaiting_decision, true);
  assert.strictEqual(proposed.status, "confirmation_required");
  assert.strictEqual(proposed.active_priority.id, "evo-auto-044-task-trash-system");
  assert.ok(proposed.priorities.length >= 10);
  let state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8"));
  assert.strictEqual(state.changes.length, 0);
  const confirmed = JSON.parse(runKvdf(["evolution", "plan", "Add a new framework capability while work is active", "--confirm-placement", "--priority-position", "2", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(confirmed.change.change_id, "evo-001");
  assert.strictEqual(confirmed.change.priority_confirmation.requested_position, "2");
  state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8"));
  assert.strictEqual(state.changes.length, 1);
}));

test("evolution steward stores deferred ideas as one final priority bucket until restored", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const added = JSON.parse(runKvdf(["evolution", "defer", "Analyze n8n integration later", "--reason", "Owner deferred", "--analysis", "Benefits: automation. Risks: secrets and source-of-truth drift.", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(added.report_type, "evolution_deferred_idea_added");
  assert.strictEqual(added.idea.idea_id, "deferred-001");
  assert.ok(added.idea.execution_details.resume_steps.length >= 3);
  assert.match(added.idea.execution_details.execution_summary, /deferred-001/);
  const list = JSON.parse(runKvdf(["evolution", "deferred", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(list.open, 1);
  assert.strictEqual(list.ideas[0].status, "deferred");
  const priorities = JSON.parse(runKvdf(["evolution", "priorities", "--json"], { cwd: dir }).stdout);
  const bucket = priorities.priorities[priorities.priorities.length - 1];
  assert.strictEqual(bucket.id, "evo-deferred-ideas");
  assert.strictEqual(bucket.title, "Deferred development ideas");
  assert.strictEqual(bucket.status, "deferred");
  assert.strictEqual(bucket.count, 1);
  assert.ok(bucket.execution_details.resume_steps.length >= 3);
  runKvdf(["evolution", "priority", "evo-auto-044-task-trash-system", "--status", "in_progress", "--note", "Current slice", "--json"], { cwd: dir });
  const restorePreview = JSON.parse(runKvdf(["evolution", "deferred", "restore", "deferred-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(restorePreview.restore_requires_confirmation, true);
  let state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8"));
  assert.strictEqual(state.changes.length, 0);
  const restored = JSON.parse(runKvdf(["evolution", "deferred", "restore", "deferred-001", "--confirm-placement", "--priority-position", "2", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(restored.report_type, "evolution_deferred_idea_restored");
  assert.strictEqual(restored.change.restored_deferred_idea_id, "deferred-001");
  state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8"));
  assert.strictEqual(state.deferred_ideas[0].status, "restored");
  assert.strictEqual(state.changes.length, 1);
}));

test("evolution steward temporary priorities queue advances within one active priority and expires with it", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["evolution", "priority", "evo-auto-047-owner-developer-cli-separation", "--status", "done", "--note", "Test isolation", "--json"], { cwd: dir });
  runKvdf(["evolution", "priority", "evo-auto-004", "--status", "in_progress", "--note", "Testing temporary queue", "--json"], { cwd: dir });
  const temp = JSON.parse(runKvdf(["evolution", "temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(temp.report_type, "evolution_temporary_priorities");
  assert.strictEqual(temp.active_priority.id, "evo-auto-004");
  assert.strictEqual(temp.queue.slices.length, 5);
  assert.strictEqual(temp.queue.current_slice.order, 1);
  assert.strictEqual(temp.queue.coverage_policy, "full_task_coverage");
  assert.match(temp.queue.slices[0].title, /full task coverage/i);
  assert.match(temp.queue.slices[2].description, /no leftover execution remainder/i);
  const advanced = JSON.parse(runKvdf(["evolution", "temp", "advance", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(advanced.report_type, "evolution_temporary_priorities_advanced");
  assert.strictEqual(advanced.completed_slice.order, 1);
  assert.strictEqual(advanced.next_slice.order, 2);
  const completed = JSON.parse(runKvdf(["evolution", "temp", "complete", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(completed.report_type, "evolution_temporary_priorities_completed");
  assert.strictEqual(completed.status, "completed");
  const persisted = JSON.parse(runKvdf(["evolution", "temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(persisted.queue.status, "completed");
  runKvdf(["evolution", "priority", "evo-auto-004", "--status", "done", "--note", "Temporary queue finished", "--json"], { cwd: dir });
  const status = JSON.parse(runKvdf(["evolution", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.temporary_priority_queue, null);
  const expired = JSON.parse(runKvdf(["evolution", "temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(expired.status, "empty");
  const priorities = JSON.parse(runKvdf(["evolution", "priorities", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(priorities.temporary_priorities, null);
}));

test("evolution app mode gives vibe developers priorities temp and deferred lists", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const summary = JSON.parse(runKvdf(["evolution", "app", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(summary.audience, "app_developer");
  assert.strictEqual(summary.report_type, "evolution_steward_summary");
  const appPreview = JSON.parse(runKvdf(["evolution", "app", "plan", "Build storefront checkout flow", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(appPreview.report_type, "evolution_feature_request_placement");
  assert.strictEqual(appPreview.audience, "app_developer");
  assert.strictEqual(appPreview.requires_confirmation, true);
  assert.strictEqual(appPreview.awaiting_decision, true);
  const plan = JSON.parse(runKvdf(["evolution", "app", "plan", "Build storefront checkout flow", "--confirm-placement", "--priority-position", "8", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(plan.change.source, "app_request");
  assert.ok(plan.change.impacted_areas.includes("implementation"));
  const deferred = JSON.parse(runKvdf(["evolution", "app", "defer", "Polish the checkout copy later", "--reason", "Developer deferred", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(deferred.audience, "app_developer");
  runKvdf(["evolution", "app", "priority", "evo-auto-004", "--status", "in_progress", "--note", "App temp queue", "--json"], { cwd: dir });
  const priorities = JSON.parse(runKvdf(["evolution", "app", "priorities", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(priorities.audience, "app_developer");
  assert.ok(priorities.priorities.some((item) => item.title === "Deferred app ideas"));
  const temp = JSON.parse(runKvdf(["evolution", "app", "temp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(temp.report_type, "evolution_temporary_priorities");
  assert.strictEqual(temp.status, "active");
  assert.ok(temp.queue.slices.length >= 5);
}));

test("evolution services module builds summary and temporary queue state directly", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["evolution", "priority", "evo-auto-047-owner-developer-cli-separation", "--status", "done", "--note", "Test isolation", "--json"], { cwd: dir });
  runKvdf(["evolution", "priority", "evo-auto-004", "--status", "in_progress", "--note", "Service layer check", "--json"], { cwd: dir });
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8"));
  const tempReport = evolutionService.buildEvolutionTemporaryPrioritiesReport(state);
  assert.strictEqual(tempReport.report_type, "evolution_temporary_priorities");
  assert.strictEqual(tempReport.active_priority.id, "evo-auto-004");
  assert.strictEqual(tempReport.queue.coverage_policy, "full_task_coverage");
  assert.strictEqual(tempReport.queue.slices.length, 5);
  const summary = evolutionService.buildEvolutionSummary(state);
  assert.strictEqual(summary.report_type, "evolution_steward_summary");
  assert.ok(summary.temporary_priority_queue);
  assert.strictEqual(summary.temporary_priority_queue.queue_id, tempReport.queue.queue_id);
  assert.strictEqual(summary.temporary_priority_queue.current_slice, tempReport.queue.current_slice.title);
}));

test("multi-ai governance tracks leader sessions queues and merge bundles", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const initial = JSON.parse(runKvdf(["multi-ai", "status", "--json", "--no-auto-leader"], { cwd: dir }).stdout);
  assert.strictEqual(initial.report_type, "multi_ai_governance_status");
  assert.strictEqual(initial.active_leader_session, null);
  const leader = JSON.parse(runKvdf(["multi-ai", "leader", "start", "--ai", "agent-001", "--name", "Claude Sonnet", "--allow-execution", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(leader.report_type, "multi_ai_leader_started");
  assert.strictEqual(leader.leader_session.leader_ai_id, "agent-001");
  assert.strictEqual(leader.leader_session.delegated_execution_allowed, true);
  runKvdf([
    "evolution",
    "priority",
    initial.evolution_priority.id,
    "--status",
    "done",
    "--note",
    "Advance the active priority so the leader must realign",
    "--json"
  ], { cwd: dir });
  const aligned = JSON.parse(runKvdf(["multi-ai", "status", "--json", "--no-auto-leader"], { cwd: dir }).stdout);
  assert.strictEqual(aligned.active_leader_session.current_priority_id, aligned.evolution_priority.id);
  assert.strictEqual(aligned.active_leader_session.current_temporary_queue_id, aligned.evolution_temporary_priority_queue.queue_id);
  const queue = JSON.parse(runKvdf(["multi-ai", "queue", "add", "--ai", "agent-002", "--title", "Schema slice", "--description", "Refine the governance state file", "--files", "src/cli/index.js", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(queue.report_type, "multi_ai_queue_slice_added");
  assert.strictEqual(queue.queue.ai_id, "agent-002");
  assert.strictEqual(queue.queue.slices.length, 1);
  assert.strictEqual(queue.slice.order, 1);
  const bundle = JSON.parse(runKvdf(["multi-ai", "merge", "add", "--sources", queue.queue.queue_id, "--title", "Leader merge", "--files", "src/cli/index.js", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(bundle.report_type, "multi_ai_merge_bundle_recorded");
  assert.deepStrictEqual(bundle.bundle.source_queue_ids, [queue.queue.queue_id]);
  const validated = JSON.parse(runKvdf(["multi-ai", "merge", "validate", bundle.bundle.bundle_id, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(validated.report_type, "multi_ai_merge_bundle_validated");
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_governance.json"), "utf8"));
  assert.strictEqual(persisted.active_leader_session_id, leader.leader_session.session_id);
  assert.strictEqual(persisted.worker_queues.length, 1);
  assert.strictEqual(persisted.merge_bundles[0].validation.status, "pass");
}));

test("multi-ai status auto-elects a leader and leader release relinquishes it", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const autoStatus = JSON.parse(runKvdf(["multi-ai", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(autoStatus.report_type, "multi_ai_governance_status");
  assert.ok(autoStatus.active_leader_session);
  assert.strictEqual(autoStatus.active_leader_session.auto_elected, true);
  assert.strictEqual(autoStatus.active_leader_session.leader_ai_id, "auto-leader");
  assert.ok(autoStatus.current_task);
  assert.strictEqual(autoStatus.current_task.task_id, "scope");
  assert.strictEqual(autoStatus.current_task.assigned_leader_ai_id, "auto-leader");
  const released = JSON.parse(runKvdf(["multi-ai", "leader", "release", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(released.report_type, "multi_ai_leader_released");
  assert.ok(released.leader_session);
  assert.strictEqual(released.leader_session.status, "relinquished");
  const afterRelease = JSON.parse(runKvdf(["multi-ai", "status", "--json", "--no-auto-leader"], { cwd: dir }).stdout);
  assert.strictEqual(afterRelease.active_leader_session, null);
}));

test("multi-ai agent hub promotes the first entrant and refreshes the leader lease on heartbeat", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const first = JSON.parse(runKvdf(["multi-ai", "agent", "register", "--ai", "agent-001", "--name", "Agent One", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(first.report_type, "multi_ai_agent_entered_and_leader");
  assert.ok(first.active_leader_session);
  assert.strictEqual(first.active_leader_session.leader_ai_id, "agent-001");
  const leaseBefore = first.active_leader_session.lease_expires_at;
  const second = JSON.parse(runKvdf(["multi-ai", "agent", "register", "--ai", "agent-002", "--name", "Agent Two", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(second.report_type, "multi_ai_agent_entered");
  assert.ok(second.active_leader_session);
  assert.strictEqual(second.active_leader_session.leader_ai_id, "agent-001");
  const heartbeat = JSON.parse(runKvdf(["multi-ai", "agent", "heartbeat", "--ai", "agent-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(heartbeat.report_type, "multi_ai_agent_heartbeat");
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_governance.json"), "utf8"));
  assert.ok(persisted.leader_sessions[0].lease_expires_at);
  assert.ok(new Date(persisted.leader_sessions[0].lease_expires_at).getTime() >= new Date(leaseBefore).getTime());
}));

test("multi-ai agent hub keeps Gemini worker-only unless leadership is explicitly allowed", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const entry = JSON.parse(runKvdf(["multi-ai", "agent", "register", "--ai", "gemini-001", "--provider", "gemini", "--name", "Gemini", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(entry.report_type, "multi_ai_agent_entered");
  assert.strictEqual(entry.agent_entry.leader_eligible, false);
  const status = JSON.parse(runKvdf(["multi-ai", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.active_leader_session, null);
  assert.ok(status.agent_hub.agent_entries.some((item) => item.agent_id === "gemini-001" && item.leader_eligible === false));
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_governance.json"), "utf8"));
  assert.strictEqual(persisted.agent_entries[0].leader_eligible, false);
}));

test("multi-ai lease expiry promotes the next active agent", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-001", "--name", "Agent One"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-002", "--name", "Agent Two"], { cwd: dir });
  const statePath = path.join(dir, ".kabeeri", "multi_ai_governance.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.leader_sessions[0].lease_expires_at = "2000-01-01T00:00:00.000Z";
  state.leader_sessions[0].updated_at = "2000-01-01T00:00:00.000Z";
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  const status = JSON.parse(runKvdf(["multi-ai", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(status.active_leader_session);
  assert.strictEqual(status.active_leader_session.leader_ai_id, "agent-002");
}));

test("multi-ai unanswered leader calls escalate and promote the next agent", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-001", "--name", "Agent One"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-002", "--name", "Agent Two"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-003", "--name", "Agent Three"], { cwd: dir });
  const firstCall = JSON.parse(runKvdf(["multi-ai", "agent", "call", "--ai", "agent-003", "--request", "Need leader input", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(firstCall.report_type, "multi_ai_leader_call_recorded");
  assert.strictEqual(firstCall.call.status, "pending");
  const secondCall = JSON.parse(runKvdf(["multi-ai", "agent", "call", "--ai", "agent-003", "--request", "Need leader input", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(secondCall.report_type, "multi_ai_leader_call_escalated");
  assert.ok(secondCall.previous_leader_session);
  assert.strictEqual(secondCall.previous_leader_session.leader_ai_id, "agent-001");
  assert.ok(secondCall.leader_session);
  assert.strictEqual(secondCall.leader_session.leader_ai_id, "agent-002");
  const status = JSON.parse(runKvdf(["multi-ai", "status", "--json", "--no-auto-leader"], { cwd: dir }).stdout);
  assert.ok(status.active_leader_session);
  assert.strictEqual(status.active_leader_session.leader_ai_id, "agent-002");
}));

test("multi-ai agent respond resolves pending leader calls", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-001", "--name", "Agent One"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-002", "--name", "Agent Two"], { cwd: dir });
  const call = JSON.parse(runKvdf(["multi-ai", "agent", "call", "--ai", "agent-002", "--request", "Need approval", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(call.report_type, "multi_ai_leader_call_recorded");
  const response = JSON.parse(runKvdf(["multi-ai", "agent", "respond", "--call", call.call.call_id, "--response", "Approved", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(response.report_type, "multi_ai_leader_call_responded");
  assert.strictEqual(response.call.status, "responded");
  assert.strictEqual(response.call.response, "Approved");
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_governance.json"), "utf8"));
  assert.strictEqual(persisted.call_inbox[0].status, "responded");
  const communications = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_communications.json"), "utf8"));
  assert.strictEqual(communications.conversations[0].messages[0].status, "responded");
  assert.ok(communications.conversations[0].messages.some((message) => message.dispatch_type === "leader_call_response"));
}));

test("multi-ai leader call dispatches to a targeted agent and relays the task", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-001", "--name", "Agent One"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-002", "--name", "Agent Two"], { cwd: dir });
  const dispatch = JSON.parse(runKvdf([
    "multi-ai",
    "leader",
    "call",
    "--ai",
    "agent-002",
    "--request",
    "Review relay watch mode",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(dispatch.report_type, "multi_ai_leader_dispatch_recorded");
  assert.strictEqual(dispatch.call.to_agent_id, "agent-002");
  const communications = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_communications.json"), "utf8"));
  assert.ok(communications.conversations.some((conversation) => conversation.messages.some((message) => message.dispatch_type === "leader_call" && message.to_agent_id === "agent-002")));
  const response = JSON.parse(runKvdf(["multi-ai", "agent", "respond", "--call", dispatch.call.call_id, "--ai", "agent-002", "--response", "Reviewed", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(response.report_type, "multi_ai_leader_call_responded");
  const synced = JSON.parse(runKvdf(["multi-ai", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(synced.relay_board.some((thread) => thread.pending_messages === 0));
}));

test("multi-ai leader call auto-selects the best target agent when no ai is provided", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-001", "--name", "Writer Agent", "--capabilities", "docs,writing"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-002", "--name", "Relay Coordinator", "--role", "worker", "--worker-only", "--capabilities", "relay,conversation,dispatch"], { cwd: dir });
  const dispatch = JSON.parse(runKvdf([
    "multi-ai",
    "leader",
    "call",
    "--request",
    "Review relay watch mode",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(dispatch.report_type, "multi_ai_leader_dispatch_recorded");
  assert.strictEqual(dispatch.call.to_agent_id, "agent-002");
  const communications = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_communications.json"), "utf8"));
  assert.ok(communications.conversations.some((conversation) => conversation.messages.some((message) => message.dispatch_type === "leader_call" && message.to_agent_id === "agent-002")));
}));

test("multi-ai queue add and leader call share the same agent planner", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "leader", "start", "--ai", "codex", "--name", "Codex", "--json"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "writer-bot", "--name", "Writer Bot", "--capabilities", "docs,writing"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "relay-coordinator", "--name", "Relay Coordinator", "--role", "worker", "--worker-only", "--capabilities", "relay,conversation,dispatch"], { cwd: dir });
  const queue = JSON.parse(runKvdf([
    "multi-ai",
    "queue",
    "add",
    "--title",
    "Handle relay inbox messages",
    "--description",
    "Manage conversation dispatch",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(queue.queue.ai_id, "relay-coordinator");
  const dispatch = JSON.parse(runKvdf([
    "multi-ai",
    "leader",
    "call",
    "--request",
    "Handle relay inbox messages",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(dispatch.report_type, "multi_ai_leader_dispatch_recorded");
  assert.strictEqual(dispatch.call.to_agent_id, "relay-coordinator");
}));

test("multi-ai conversation relay persists agent-to-agent messages and replies", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-001", "--name", "Agent One"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "agent-002", "--name", "Agent Two"], { cwd: dir });
  const started = JSON.parse(runKvdf([
    "multi-ai",
    "conversation",
    "start",
    "--from", "agent-001",
    "--to", "agent-002",
    "--topic", "Scope",
    "--message", "Please review the scope",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(started.report_type, "multi_ai_conversation_started");
  assert.strictEqual(started.conversation.status, "open");
  assert.strictEqual(started.conversation.messages.length, 1);
  const inbox = JSON.parse(runKvdf(["multi-ai", "conversation", "inbox", "--agent", "agent-002", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(inbox.report_type, "multi_ai_conversation_inbox");
  assert.strictEqual(inbox.inbox.length, 1);
  assert.strictEqual(inbox.inbox[0].message_id, started.message.message_id);
  const replied = JSON.parse(runKvdf([
    "multi-ai",
    "conversation",
    "reply",
    "--agent", "agent-002",
    "--message-id", started.message.message_id,
    "--reply", "Reviewed",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(replied.report_type, "multi_ai_conversation_replied");
  assert.strictEqual(replied.original_message.status, "responded");
  assert.strictEqual(replied.reply_message.reply_to_message_id, started.message.message_id);
  const closed = JSON.parse(runKvdf(["multi-ai", "conversation", "close", "--conversation", started.conversation.conversation_id, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(closed.report_type, "multi_ai_conversation_closed");
  assert.strictEqual(closed.conversation.status, "closed");
  const communications = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_communications.json"), "utf8"));
  assert.strictEqual(communications.conversations[0].status, "closed");
  const status = JSON.parse(runKvdf(["multi-ai", "status", "--json", "--no-auto-leader"], { cwd: dir }).stdout);
  assert.strictEqual(status.conversation_hub.conversations, 1);
  assert.strictEqual(status.conversation_hub.open_conversations, 0);
  assert.strictEqual(status.conversation_hub.pending_messages, 0);
}));

test("multi-ai sync distributes evolution slices and merge commit preserves provenance", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const distribution = JSON.parse(runKvdf(["multi-ai", "sync", "distribute", "--leader-ai", "agent-001", "--workers", "agent-002,agent-003", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(distribution.report_type, "multi_ai_sync_distribution");
  assert.strictEqual(distribution.active_leader_session.leader_ai_id, "agent-001");
  assert.strictEqual(distribution.distributed_queues.length, 2);
  assert.ok(distribution.distributed_queues.every((item) => item.slices.length > 0));
  const communications = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_communications.json"), "utf8"));
  assert.ok(communications.conversations.length >= 2);
  assert.ok(communications.conversations.some((conversation) => conversation.relay_type === "dispatch" && conversation.messages.some((message) => message.dispatch_type === "task_dispatch")));
  const advanced = JSON.parse(runKvdf(["multi-ai", "queue", "advance", "multi-ai-queue-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(advanced.report_type, "multi_ai_queue_advanced");
  assert.strictEqual(advanced.completed_slice.state, "done");
  assert.strictEqual(advanced.next_slice.state, "active");
  const bundle = JSON.parse(runKvdf(["multi-ai", "merge", "add", "--sources", "multi-ai-queue-001,multi-ai-queue-002", "--title", "Leader merge", "--files", "src/cli/index.js", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(bundle.report_type, "multi_ai_merge_bundle_recorded");
  const preview = JSON.parse(runKvdf(["multi-ai", "merge", "preview", bundle.bundle.bundle_id, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(preview.report_type, "multi_ai_merge_bundle_preview");
  assert.ok(preview.semantic_merge);
  assert.strictEqual(preview.semantic_merge.status, "owner_review_required");
  assert.ok(preview.semantic_merge.files.some((item) => item.path === "src/cli/index.js"));
  const validated = JSON.parse(runKvdf(["multi-ai", "merge", "validate", bundle.bundle.bundle_id, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(validated.bundle.validation.status, "pass");
  assert.ok(validated.semantic_merge);
  const committed = JSON.parse(runKvdf(["multi-ai", "merge", "commit", bundle.bundle.bundle_id, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(committed.report_type, "multi_ai_merge_bundle_committed");
  assert.strictEqual(committed.bundle.status, "merged");
  assert.ok(committed.bundle.provenance);
  assert.deepStrictEqual(committed.bundle.provenance.source_ai_ids.sort(), ["agent-002", "agent-003"]);
  assert.strictEqual(committed.bundle.provenance.semantic_status, "owner_review_required");
  assert.ok(committed.bundle.semantic_merge);
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "multi_ai_governance.json"), "utf8"));
  assert.strictEqual(persisted.merge_bundles[0].status, "merged");
  assert.strictEqual(persisted.merge_bundles[0].provenance.validation_status, "pass");
  assert.ok(persisted.merge_bundles[0].provenance.committed_at);
  assert.strictEqual(persisted.merge_bundles[0].semantic_merge.status, "owner_review_required");
  const status = JSON.parse(runKvdf(["multi-ai", "status", "--json", "--no-auto-leader"], { cwd: dir }).stdout);
  assert.ok(status.conversation_hub.dispatch_threads >= 2);
  assert.ok(Array.isArray(status.relay_board));
  assert.ok(status.relay_board.some((thread) => thread.pending_messages >= 1));
}));

test("adaptive questionnaire planning uses blueprints frameworks data design and UI", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const plan = JSON.parse(runKvdf(["questionnaire", "plan", "Build ecommerce store with Laravel backend React frontend payments shipping and customer mobile app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(plan.blueprint.key, "ecommerce");
  assert.ok(["agile", "structured"].includes(plan.delivery_mode_recommendation.recommended_mode));
  assert.ok(plan.framework_context.selected_packs.includes("laravel"));
  assert.ok(plan.framework_context.selected_packs.includes("react"));
  assert.ok(plan.prompt_pack_guidance);
  assert.ok(plan.prompt_pack_guidance.selected_packs.includes("laravel"));
  assert.ok(plan.prompt_pack_guidance.prompt_pack_commands.some((command) => /kvdf prompt-pack compose/.test(command)));
  assert.ok(plan.compact_guidance);
  assert.strictEqual(plan.compact_guidance.task_kind, "project_start");
  assert.ok(plan.compact_guidance.selected_prompt_packs.includes("laravel"));
  assert.ok(plan.data_design_context.entities.includes("orders"));
  assert.strictEqual(plan.ui_ux_context.experience_pattern, "commerce_storefront");
  assert.ok(Array.isArray(plan.ui_ux_context.required_decisions));
  assert.ok(plan.ui_ux_context.required_decisions.some((item) => item.decision_id === "ui.public_admin_split"));
  assert.ok(plan.ui_ux_context.required_decisions.some((item) => item.decision_id === "ui.responsive_priority"));
  assert.ok(plan.ui_ux_context.required_decisions.some((item) => item.decision_id === "ui.accessibility_target"));
  assert.ok(plan.ui_decision_context);
  assert.ok(plan.ui_decision_context.required_decisions.some((item) => item.decision_id === "ui.design_source"));
  assert.ok(plan.generated_questions.some((question) => question.source_systems.includes("data_design_blueprint")));
  assert.ok(plan.generated_questions.some((question) => question.source_systems.includes("ui_ux_advisor")));
  assert.ok(plan.generated_questions.some((question) => question.question_id === "adaptive.ui.public_admin_split"));
  assert.ok(plan.generated_questions.some((question) => question.question_id === "adaptive.ui.responsive_priority"));
  assert.ok(plan.generated_questions.some((question) => question.question_id === "adaptive.ui.accessibility_target"));
  assert.ok(plan.generated_questions.some((question) => question.source_systems.includes("prompt_packs")));
  assert.strictEqual(plan.approval_status, "pending");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/questionnaires/adaptive_intake_plan.json"), "utf8"));
  assert.strictEqual(state.current_plan_id, plan.plan_id);
  assert.strictEqual(state.plans.length, 1);
  assert.match(fs.readFileSync(path.join(dir, ".kabeeri", "questionnaires", "questionnaire_questions.md"), "utf8"), /Questionnaire Intake Sheet/);
  assert.match(runKvdf(["questionnaire", "generate-tasks"], { cwd: dir, expectFailure: true }).stderr, /answer every question/);
  answerAllGeneratedQuestionnaireQuestions(dir, plan);
  const reviewed = JSON.parse(runKvdf(["questionnaire", "review", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(reviewed.review_status, "reviewed");
  assert.strictEqual(reviewed.approval_status, "pending");
  const approved = JSON.parse(runKvdf(["questionnaire", "approve", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(approved.approval_status, "approved");
  runKvdf(["questionnaire", "generate-tasks"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.source === "questionnaire_coverage"));
}));

test("resume highlights pending UI decisions from questionnaire reports", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const questionnaireDir = path.join(dir, ".kabeeri", "questionnaires");
  fs.mkdirSync(questionnaireDir, { recursive: true });
  fs.writeFileSync(path.join(questionnaireDir, "missing_answers_report.json"), JSON.stringify({
    generated_at: new Date().toISOString(),
    project_type: "ecommerce",
    missing: [
      {
        area_id: 7,
        area_key: "public_frontend",
        area: "Public Frontend",
        status: "required",
        required_action: "Ask frontend questions and generate tasks if unanswered.",
        suggested_questions: ["Should the storefront be mobile-first?"]
      }
    ],
    follow_up: [
      {
        area_id: 8,
        area_key: "admin_frontend",
        area: "Admin Frontend",
        status: "needs_follow_up",
        required_action: "Ask small helper questions and resolve contradictions.",
        suggested_questions: ["Do admins need a dashboard?"]
      }
    ],
    totals: { missing: 1, follow_up: 1 }
  }, null, 2));
  const report = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.ok(report.questionnaire_ui_decisions);
  assert.strictEqual(report.questionnaire_ui_decisions.pending_count, 2);
  assert.ok(report.questionnaire_ui_decisions.pending_titles.includes("Public Frontend"));
  assert.ok(report.questionnaire_ui_decisions.pending_titles.includes("Admin Frontend"));
  assert.match(report.next_exact_action, /UI\/UX decisions/);
  assert.ok(report.next_actions[0].includes("UI\/UX decision"));
}));

test("questionnaire task generation emits explicit frontend UI decision tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".kabeeri", "questionnaires"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "questionnaires", "answers.json"), JSON.stringify({
    answers: [
      { answer_id: "answer-001", question_id: "entry.project_type", value: "ecommerce", area_ids: ["product_business", "kabeeri_control_layer"] },
      { answer_id: "answer-002", question_id: "entry.has_users", value: "yes", area_ids: ["users_roles", "authentication", "authorization"] },
      { answer_id: "answer-003", question_id: "entry.has_admin", value: "yes", area_ids: ["admin_frontend", "admin_panel"] },
      { answer_id: "answer-004", question_id: "entry.has_public_frontend", value: "yes", area_ids: ["public_frontend", "seo", "accessibility"] }
    ]
  }, null, 2));
  const plan = JSON.parse(runKvdf(["questionnaire", "plan", "Build ecommerce store with Laravel backend React frontend payments shipping and customer mobile app", "--json"], { cwd: dir }).stdout);
  answerAllGeneratedQuestionnaireQuestions(dir, plan);
  runKvdf(["questionnaire", "review"], { cwd: dir });
  runKvdf(["questionnaire", "approve", "--confirm"], { cwd: dir });
  runKvdf(["questionnaire", "generate-tasks"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8")).tasks;
  const uiTasks = tasks.filter((task) => task.type === "ui-decision-coverage");
  assert.ok(uiTasks.length >= 2);
  assert.ok(uiTasks.some((task) => /public frontend UI direction/i.test(task.title)));
  assert.ok(uiTasks.some((task) => /admin frontend UI direction/i.test(task.title)));
  assert.ok(uiTasks.every((task) => Array.isArray(task.acceptance_criteria) && task.acceptance_criteria.some((item) => /responsive priority/i.test(item))));
}));

test("viber evolution ordering validate-order passes on the default generic sequence", () => withTempDir((dir) => {
  const report = readViberEvolutionOrderReport(dir, [
    makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
    makeViberEvolutionSlice("discovery-001", "discovery_spec"),
    makeViberEvolutionSlice("tasking-001", "tasking_approval"),
    makeViberEvolutionSlice("cloud-001", "cloud_commercial_control"),
    makeViberEvolutionSlice("license-001", "local_license_gate"),
    makeViberEvolutionSlice("release-001", "release_access"),
    makeViberEvolutionSlice("safety-001", "safety_quality"),
    makeViberEvolutionSlice("execution-001", "execution_review"),
    makeViberEvolutionSlice("packaging-001", "release_packaging"),
    makeViberEvolutionSlice("bridge-001", "bridge_evolution", { future_only: true, approved_for_active_release: true })
  ]);
  assert.strictEqual(report.report_type, "kvdf_evolution_order_validation");
  assert.strictEqual(report.task_generation_allowed, true);
  assert.strictEqual(report.approval_status.task_generation, "allowed");
  assert.deepStrictEqual(report.current_order, [
    "boundary_stabilization",
    "discovery_spec",
    "tasking_approval",
    "cloud_commercial_control",
    "local_license_gate",
    "release_access",
    "safety_quality",
    "execution_review",
    "release_packaging",
    "bridge_evolution"
  ]);
  assert.ok(report.expected_order.includes("bridge_evolution"));
  assert.ok(report.source_files_inspected.some((item) => item.includes("workspaces/apps/storefront-web/docs/00-executive-summary.md")));
  assert.strictEqual(report.approval_status.source_of_truth_map, "present");
  assert.match(report.next_action, /kvdf questionnaire generate-tasks --app storefront-web/);
}));

test("viber evolution ordering fails when boundary stabilization is missing", () => withTempDir((dir) => {
  const report = readViberEvolutionOrderReport(dir, [
    makeViberEvolutionSlice("discovery-001", "discovery_spec"),
    makeViberEvolutionSlice("tasking-001", "tasking_approval")
  ]);
  assert.strictEqual(report.task_generation_allowed, false);
  assert.ok(report.blocking_errors.some((item) => /boundary_stabilization must be the first slice/i.test(item)));
  const human = runKvdf(["evolution", "validate-order", "--app", "storefront-web"], { cwd: dir });
  assert.match(human.stdout, /Evolution order validation failed\./);
  assert.match(human.stdout, /boundary_stabilization must be the first slice/);
  assert.match(human.stdout, /Suggested fix:/);
}));

test("viber evolution ordering blocks unsafe category order variants", () => {
  const cases = [
    {
      name: "tasking before discovery",
      slices: [
        makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
        makeViberEvolutionSlice("tasking-001", "tasking_approval"),
        makeViberEvolutionSlice("discovery-001", "discovery_spec")
      ],
      error: /discovery_spec must come before tasking_approval/i
    },
    {
      name: "execution before safety",
      slices: [
        makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
        makeViberEvolutionSlice("discovery-001", "discovery_spec"),
        makeViberEvolutionSlice("tasking-001", "tasking_approval"),
        makeViberEvolutionSlice("execution-001", "execution_review"),
        makeViberEvolutionSlice("safety-001", "safety_quality")
      ],
      error: /execution_review appears before safety_quality/i
    },
    {
      name: "packaging before execution",
      slices: [
        makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
        makeViberEvolutionSlice("discovery-001", "discovery_spec"),
        makeViberEvolutionSlice("tasking-001", "tasking_approval"),
        makeViberEvolutionSlice("safety-001", "safety_quality"),
        makeViberEvolutionSlice("packaging-001", "release_packaging"),
        makeViberEvolutionSlice("execution-001", "execution_review")
      ],
      error: /release_packaging appears before execution_review/i
    },
    {
      name: "packaging before safety",
      slices: [
        makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
        makeViberEvolutionSlice("discovery-001", "discovery_spec"),
        makeViberEvolutionSlice("tasking-001", "tasking_approval"),
        makeViberEvolutionSlice("packaging-001", "release_packaging"),
        makeViberEvolutionSlice("safety-001", "safety_quality"),
        makeViberEvolutionSlice("execution-001", "execution_review")
      ],
      error: /release_packaging appears before safety_quality/i
    },
    {
      name: "release access before license gate",
      slices: [
        makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
        makeViberEvolutionSlice("discovery-001", "discovery_spec"),
        makeViberEvolutionSlice("tasking-001", "tasking_approval"),
        makeViberEvolutionSlice("release-001", "release_access"),
        makeViberEvolutionSlice("license-001", "local_license_gate"),
        makeViberEvolutionSlice("safety-001", "safety_quality"),
        makeViberEvolutionSlice("execution-001", "execution_review"),
        makeViberEvolutionSlice("packaging-001", "release_packaging")
      ],
      error: /local_license_gate appears after release_access/i
    },
    {
      name: "unapproved slice",
      slices: [
        makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
        makeViberEvolutionSlice("discovery-001", "discovery_spec", { status: "draft", approval_status: "draft" })
      ],
      error: /Unapproved or draft evolution slices cannot be used for task generation/i
    },
    {
      name: "future-only slice mixed into active release",
      slices: [
        makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
        makeViberEvolutionSlice("future-001", "bridge_evolution", { status: "future_only", approval_status: "future_only", future_only: true })
      ],
      error: /Future-only slices are mixed into the active release without explicit approval/i
    }
  ];

  for (const item of cases) {
    withTempDir((dir) => {
      const report = readViberEvolutionOrderReport(dir, item.slices, { appSlug: "storefront-web" });
      assert.strictEqual(report.task_generation_allowed, false, item.name);
      assert.ok(report.blocking_errors.some((error) => item.error.test(error)), item.name);
    });
  }
});

test("cloud commercial control can precede local license gate when both are present", () => withTempDir((dir) => {
  const report = readViberEvolutionOrderReport(dir, [
    makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
    makeViberEvolutionSlice("discovery-001", "discovery_spec"),
    makeViberEvolutionSlice("tasking-001", "tasking_approval"),
    makeViberEvolutionSlice("cloud-001", "cloud_commercial_control"),
    makeViberEvolutionSlice("license-001", "local_license_gate"),
    makeViberEvolutionSlice("release-001", "release_access"),
    makeViberEvolutionSlice("safety-001", "safety_quality"),
    makeViberEvolutionSlice("execution-001", "execution_review"),
    makeViberEvolutionSlice("packaging-001", "release_packaging")
  ]);
  assert.strictEqual(report.task_generation_allowed, true);
  assert.ok(report.current_order.indexOf("cloud_commercial_control") < report.current_order.indexOf("local_license_gate"));
}));

test("questionnaire generate-tasks blocks when evolution ordering fails", () => withTempDir((dir) => {
  seedViberEvolutionOrderFixture(dir, {
    slices: [
      makeViberEvolutionSlice("boundary-001", "boundary_stabilization"),
      makeViberEvolutionSlice("tasking-001", "tasking_approval"),
      makeViberEvolutionSlice("discovery-001", "discovery_spec")
    ]
  });
  const failure = runKvdf(["questionnaire", "generate-tasks", "--app", "storefront-web"], { cwd: dir, expectFailure: true });
  assert.match(failure.stderr, /Evolution order validation failed\./);
  assert.match(failure.stderr, /discovery_spec must come before tasking_approval/);
}));

test("questionnaire flow exposes a direct start path and operator notes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const flow = JSON.parse(runKvdf(["questionnaire", "flow", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(flow.start_here, "kvdf questionnaire flow");
  assert.match(flow.next_command, /kvdf questionnaire plan/);
  assert.ok(Array.isArray(flow.operator_notes));
  assert.ok(flow.operator_notes.some((note) => /capability list/i.test(note)));
}));

test("pipeline matrix is rendered and persisted for strict enforcement", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const matrix = JSON.parse(runKvdf(["pipeline", "matrix", "--json"], { cwd: dir }).stdout);
  assert.ok(matrix.next_exact_action);
  assert.ok(Array.isArray(matrix.matrix));
  assert.ok(matrix.matrix.some((item) => item.id === "task-packet"));
  assert.ok(matrix.matrix.some((item) => item.id === "questionnaire-plan"));
  assert.match(runKvdf(["pipeline", "matrix"], { cwd: dir }).stdout, /Next exact action:/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "pipeline_enforcement.json")));
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_PIPELINE_ENFORCEMENT_MATRIX.md")));
}));

test("contract command exposes the ai cli operating contract and command registry", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const report = JSON.parse(runKvdf(["contract", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_ai_cli_operating_contract");
  assert.ok(report.next_exact_action);
  assert.ok(Array.isArray(report.command_registry));
  assert.ok(report.command_registry.some((entry) => entry.key === "contract"));
  assert.ok(report.command_registry.some((entry) => entry.key === "task-packet"));
  assert.strictEqual(report.role_split.cli.includes("Validate prerequisites"), true);
  assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_AI_CLI_OPERATING_CONTRACT.md")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "pipeline_enforcement.json")));
  assert.match(runKvdf(["contract", "--help"], { cwd: dir }).stdout, /architecture or track boundary view/i);
}));

test("maintainability command exposes the shared-service scorecard and live state", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const report = JSON.parse(runKvdf(["maintainability", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_maintainability_report");
  assert.ok(report.next_exact_action);
  assert.ok(Array.isArray(report.shared_service_inventory));
  assert.ok(report.shared_service_inventory.includes("src/cli/services/command_registry.js"));
  assert.ok(Array.isArray(report.shared_command_inventory));
  assert.ok(report.shared_command_inventory.some((entry) => entry.key === "maintainability"));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "maintainability.json")));
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "reports", "maintainability.json"), "utf8"));
  assert.strictEqual(persisted.report_type, "kvdf_maintainability_report");
  assert.strictEqual(persisted.scorecard.change_id, "evo-scorecard-maintainability");
  assert.ok(persisted.live_state);
  assert.match(runKvdf(["maintainability"], { cwd: dir }).stdout, /KVDF Maintainability Report/);
}));

test("pipeline check task-start inspects a specific task token and lock trail", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Backend API", "--type", "backend", "--path", "src/api"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Start gate task", "--workstream", "backend", "--app", "backend-api", "--acceptance", "Owner starts"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/start.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  const ready = JSON.parse(runKvdf(["pipeline", "check", "task-start", "--task", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(ready.status, "pass");
  assert.match(ready.evidence, /task-001/);
  runKvdf(["token", "revoke", "task-token-001"], { cwd: dir });
  assert.match(
    runKvdf(["pipeline", "check", "task-start", "--task", "task-001"], { cwd: dir, expectFailure: true }).stderr,
    /missing active token/
  );
}));

test("pipeline check task-complete requires matching verification report and archive trail", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Backend API", "--type", "backend", "--path", "src/api"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Complete gate task", "--workstream", "backend", "--app", "backend-api", "--acceptance", "Owner completes"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/complete.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  runKvdf(["task", "review", "task-001", "--reviewer", "reviewer-001"], { cwd: dir });
  runKvdf(["acceptance", "create", "--task", "task-001"], { cwd: dir });
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--evidence", "Owner completes"], { cwd: dir });
  runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir });
  assert.match(
    runKvdf(["pipeline", "check", "task-complete", "--task", "task-001"], { cwd: dir, expectFailure: true }).stderr,
    /verification report|trash archive record|trash scheduler route/
  );
  const completed = JSON.parse(runKvdf(["task", "complete", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(completed.completed_task.id, "task-001");
  assert.ok(completed.completion_report_path);
  assert.ok(completed.security_gate);
  assert.strictEqual(completed.completion_report.report_type, "task_completion_report");
  assert.strictEqual(completed.completion_report.task_id, "task-001");
  assert.strictEqual(completed.completion_report.completed_by, "owner-001");
  assert.ok(completed.completion_report.security_gate);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "task-001.completion.json")));
  const completionReport = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "reports", "task-001.completion.json"), "utf8"));
  assert.strictEqual(completionReport.report_type, "task_completion_report");
  assert.strictEqual(completionReport.task_id, "task-001");
  assert.ok(completionReport.security_gate);
  assert.strictEqual(completionReport.archive_trail_path, ".kabeeri/task_trash.json");
  const completion = JSON.parse(runKvdf(["pipeline", "check", "task-complete", "--task", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(completion.status, "pass");
  assert.match(completion.evidence, /verification report/);
  const trash = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "task_trash.json"), "utf8"));
  assert.ok(trash.trash.some((item) => item.id === "task-001"));
  const scheduler = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "task_scheduler.json"), "utf8"));
  assert.ok(scheduler.routes.some((item) => item.task_id === "task-001" && item.to === "trash"));
}));

test("task completion includes security gate summary and only blocks under strict policy", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["owner", "login", "--id", "owner-001"], { cwd: dir, env });
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-001",
        title: "Optional gate task",
        status: "owner_verified",
        verified_by: "owner-001",
        verified_at: new Date().toISOString()
      },
      {
        id: "task-002",
        title: "Required gate task",
        status: "owner_verified",
        verified_by: "owner-001",
        verified_at: new Date().toISOString(),
        security_gate_required: true
      }
    ]
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri", "reports", "task-001.verification.md"), "# Final Verification Report - task-001\nTask: Optional gate task\n", "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "reports", "task-002.verification.md"), "# Final Verification Report - task-002\nTask: Required gate task\n", "utf8");
  fs.writeFileSync(path.join(dir, ".env"), "PASSWORD=supersecret123456\n", "utf8");
  const blockedScan = JSON.parse(runKvdf(["security", "scan", "--include", ".env"], { cwd: dir }).stdout);
  assert.strictEqual(blockedScan.status, "blocked");

  const completed = JSON.parse(runKvdf(["task", "complete", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(completed.completed_task.id, "task-001");
  assert.ok(completed.security_gate);
  assert.strictEqual(completed.security_gate.status, "warning");
  assert.strictEqual(completed.completion_report.security_gate.status, "warning");

  const required = JSON.parse(runKvdf(["task", "complete", "task-002"], { cwd: dir }).stdout);
  assert.strictEqual(required.completed_task.id, "task-002");
  assert.strictEqual(required.security_gate.status, "warning");
  assert.strictEqual(required.completion_report.security_gate.status, "warning");

  fs.mkdirSync(path.join(dir, ".kabeeri", "policies"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "policies", "security_gate_policy.json"), JSON.stringify({
    security_gate_policy_version: "1",
    default_required: false,
    strict_blocking: true,
    required_scopes: ["task"],
    required_tracks: [],
    required_before: ["task_complete"],
    blocked_statuses: ["blocked"],
    warning_statuses: ["warning"],
    missing_plugin_behavior: "warn",
    notes: ["Strict runtime policy for completion blocking."]
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-003",
        title: "Strict gate task",
        status: "owner_verified",
        verified_by: "owner-001",
        verified_at: new Date().toISOString()
      }
    ]
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri", "reports", "task-003.verification.md"), "# Final Verification Report - task-003\nTask: Strict gate task\n", "utf8");
  assert.match(
    runKvdf(["task", "complete", "task-003"], { cwd: dir, expectFailure: true }).stderr,
    /security gate/i
  );
}));

test("evolution summary includes security gate status and blocks only under strict required policy", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    workspace_kind: "framework_owner",
    changes: [
      {
        change_id: "evo-001",
        title: "Security gate evolution",
        status: "done"
      }
    ],
    current_change_id: "evo-001"
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".env"), "API_KEY=secret1234567890\n", "utf8");
  runKvdf(["security", "scan", "--include", ".env"], { cwd: dir });
  const summary = JSON.parse(runKvdf(["evolution", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(summary.report_type, "evolution_steward_summary");
  assert.ok(summary.security_gate);
  assert.strictEqual(summary.security_gate.required, false);
  assert.strictEqual(summary.security_gate.status, "warning");
  assert.ok(summary.security_gate.next_action.length > 0);

  fs.mkdirSync(path.join(dir, ".kabeeri", "policies"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "policies", "security_gate_policy.json"), JSON.stringify({
    security_gate_policy_version: "1",
    default_required: false,
    strict_blocking: true,
    required_scopes: [],
    required_tracks: [],
    required_before: ["evolution_closeout"],
    blocked_statuses: ["blocked"],
    warning_statuses: ["warning"],
    missing_plugin_behavior: "warn",
    notes: ["Strict evolution closeout policy."]
  }, null, 2), "utf8");
  const strictSummary = JSON.parse(runKvdf(["evolution", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(strictSummary.security_gate.required, true);
  assert.strictEqual(strictSummary.security_gate.strict_blocking, true);
  assert.strictEqual(strictSummary.security_gate.status, "blocked");
}));

test("task packet requires a populated delivery map and traceability chain", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".kabeeri", "questionnaires"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "questionnaires", "adaptive_intake_plan.json"), JSON.stringify({
    plans: [
      {
        plan_id: "plan-001",
        module_plan: { module_plan_id: "module-plan-001" },
        delivery_map: {
          delivery_map_id: "delivery-map-001",
          phases: [{ phase_id: "phase-001" }],
          module_batches: [{ batch_id: "batch-001" }]
        }
      }
    ],
    current_plan_id: "plan-001"
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri", "delivery_decisions.json"), JSON.stringify({
    recommendations: [],
    decisions: [{ delivery_id: "delivery-001", mode: "structured", status: "selected" }],
    current_mode: { delivery_id: "delivery-001", mode: "structured", status: "selected" }
  }, null, 2));
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      {
        id: "task-001",
        title: "Packet task",
        status: "approved",
        workstream: "backend",
        workstreams: ["backend"],
        created_at: "2026-05-14T00:00:00.000Z"
      }
    ]
  }, null, 2));
  assert.match(
    runKvdf(["pipeline", "check", "task-packet"], { cwd: dir, expectFailure: true }).stderr,
    /traceability chain/
  );
}));

test("adaptive questionnaire planning follows user language", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const arabicPlan = JSON.parse(runKvdf(["questionnaire", "plan", "\u0623\u0631\u064a\u062f \u0628\u0646\u0627\u0621 \u0645\u062a\u062c\u0631 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0628\u0648\u0627\u062c\u0647\u0629 React \u0648\u0628\u0627\u0643 \u0627\u0646\u062f Laravel", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(arabicPlan.input_language, "ar");
  assert.strictEqual(arabicPlan.output_language, "ar");
  const englishPlan = JSON.parse(runKvdf(["questionnaire", "plan", "Build a CRM with sales pipeline and reports", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(englishPlan.input_language, "en");
  assert.strictEqual(englishPlan.output_language, "en");
}));

test("UI design advisor recommends frontend patterns from product blueprints", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const news = JSON.parse(runKvdf(["design", "recommend", "news_website", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(news.blueprint_key, "news_website");
  assert.strictEqual(news.experience_pattern, "seo_content_site");
  assert.ok(news.components.includes("article_card"));
  assert.ok(news.seo_geo.some((item) => /NewsArticle|Article|structured/i.test(item)));
  const erp = JSON.parse(runKvdf(["design", "recommend", "erp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(erp.experience_pattern, "data_heavy_web_app");
  assert.ok(erp.components.includes("data_table"));
  const review = JSON.parse(runKvdf(["design", "ui-review", "news article page missing states"], { cwd: dir }).stdout);
  assert.strictEqual(review.status, "needs_attention");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/ui_advisor.json"), "utf8"));
  assert.strictEqual(state.recommendations.length, 2);
  assert.strictEqual(state.reviews.length, 1);
  const validation = runKvdf(["validate", "ui-design"], { cwd: dir }).stdout;
  assert.match(validation, /UI design catalog checked/);
  assert.match(validation, /theme token presets checked/);
  assert.match(validation, /screen compositions checked/);
  assert.match(validation, /framework adapters checked/);
  assert.match(validation, /creative variants checked/);
  assert.match(validation, /project UI playbooks checked/);
  assert.match(validation, /business UI references checked/);
}));

test("UI UX reference library recommends patterns and generates tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["design", "reference-list"], { cwd: dir }).stdout, /ADMIT-ADB01/);
  assert.match(runKvdf(["design", "reference-show", "ADMIT-ADB04"], { cwd: dir }).stdout, /Soft UI Billing/);
  const recommendation = JSON.parse(runKvdf(["design", "reference-recommend", "billing dashboard with invoices payments and transactions", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(recommendation.matches[0].code, "ADMIT-ADB04");
  const questions = JSON.parse(runKvdf(["design", "reference-questions", "ADMIT-ADB04", "--json"], { cwd: dir }).stdout);
  assert.ok(questions.questions.some((question) => question.includes("payment providers")));
  runKvdf(["design", "reference-tasks", "ADMIT-ADB04", "--scope", "billing page"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.source === "ui_ux_reference" && task.ui_ux_reference_code === "ADMIT-ADB04"));
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/ui_ux_reference.json"), "utf8"));
  assert.strictEqual(state.generated_questions.length, 1);
  assert.strictEqual(state.generated_tasks.length, 1);
}));

test("ADR and AI run history track decisions accepted output and waste", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build products API", "--workstream", "backend", "--acceptance", "Tests pass"], { cwd: dir });
  const run = JSON.parse(runKvdf(["ai-run", "record", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-4", "--input-tokens", "1000", "--output-tokens", "500", "--summary", "Drafted products API"], { cwd: dir }).stdout);
  assert.strictEqual(run.run_id, "ai-run-001");
  assert.strictEqual(run.total_tokens, 1500);
  assert.match(runKvdf(["ai-run", "list"], { cwd: dir }).stdout, /ai-run-001/);
  runKvdf(["ai-run", "accept", "ai-run-001", "--reviewer", "reviewer-001", "--evidence", "npm-test"], { cwd: dir });
  assert.strictEqual(JSON.parse(runKvdf(["ai-run", "show", "ai-run-001"], { cwd: dir }).stdout).status, "accepted");
  const accepted = fs.readFileSync(path.join(dir, ".kabeeri/ai_runs/accepted_runs.jsonl"), "utf8");
  assert.match(accepted, /ai-run-001/);
  const report = JSON.parse(runKvdf(["ai-run", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.totals.accepted, 1);
  assert.strictEqual(report.totals.total_tokens, 1500);
  runKvdf(["capture", "--summary", "Drafted products API from ai run", "--files", "src/products-api.js", "--task", "task-001", "--ai-run", "ai-run-001", "--checks", "npm test", "--evidence", "manual review"], { cwd: dir });
  const capture = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures[0];
  assert.strictEqual(capture.capture_id, "capture-001");
  assert.deepStrictEqual(capture.ai_run_ids, ["ai-run-001"]);
  assert.strictEqual(capture.primary_ai_run_id, "ai-run-001");
  const aiRunProvenance = JSON.parse(runKvdf(["ai-run", "provenance", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(aiRunProvenance.summary.linked_runs, 1);
  assert.strictEqual(aiRunProvenance.summary.missing_evidence_chains, 0);
  assert.strictEqual(aiRunProvenance.chains[0].run_id, "ai-run-001");
  assert.deepStrictEqual(aiRunProvenance.chains[0].capture_ids, ["capture-001"]);
  assert.ok(aiRunProvenance.chains[0].usage_event_ids.length >= 1);
  assert.ok(aiRunProvenance.chains[0].audit_event_ids.length >= 2);
  const usageEvents = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_events.jsonl"), "utf8").trim().split(/\r?\n/)[0]);
  assert.deepStrictEqual(usageEvents.capture_ids, ["capture-001"]);
  assert.strictEqual(usageEvents.ai_run_id, "ai-run-001");
  const auditReport = runKvdf(["audit", "report", "ai-run-001"], { cwd: dir }).stdout;
  assert.match(auditReport, /ai_run.recorded/);
  assert.match(auditReport, /vibe.post_work_captured/);
  assert.match(auditReport, /capture_id=capture-001/);
  assert.match(auditReport, /ai_run_ids=ai-run-001/);
  const adr = JSON.parse(runKvdf(["adr", "create", "--title", "Use PostgreSQL", "--context", "Products need relational consistency", "--decision", "Use PostgreSQL for catalog data", "--task", "task-001", "--ai-run", "ai-run-001", "--status", "approved"], { cwd: dir }).stdout);
  assert.strictEqual(adr.adr_id, "adr-001");
  assert.strictEqual(adr.status, "approved");
  assert.deepStrictEqual(JSON.parse(runKvdf(["ai-run", "show", "ai-run-001"], { cwd: dir }).stdout).related_adrs, ["adr-001"]);
  const trace = JSON.parse(runKvdf(["adr", "trace", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(trace.summary.linked_ai_runs, 1);
  assert.strictEqual(trace.adr_trace[0].accepted_runs, 1);
  const reportAfterAdr = JSON.parse(runKvdf(["ai-run", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(reportAfterAdr.by_adr["adr-001"].accepted, 1);
  assert.match(runKvdf(["adr", "list"], { cwd: dir }).stdout, /adr-001/);
  assert.match(runKvdf(["adr", "report"], { cwd: dir }).stdout, /Kabeeri ADR Report/);
  assert.match(runKvdf(["validate", "adr"], { cwd: dir }).stdout, /ADR records checked/);
  assert.match(runKvdf(["validate", "ai-run"], { cwd: dir }).stdout, /AI runs checked/);
}));

test("common prompt layer composes stack prompts with task context", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["prompt-pack", "common"], { cwd: dir }).stdout, /Common Prompt Layer/);
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build React settings component", "--workstream", "public_frontend", "--acceptance", "Settings can be saved"], { cwd: dir });
  runKvdf(["context-pack", "create", "--task", "task-001", "--allowed-files", "src/settings/", "--specs", "frontend_specs/settings.md"], { cwd: dir });
  const composition = JSON.parse(runKvdf(["prompt-pack", "compose", "react", "--task", "task-001", "--context", "ctx-001"], { cwd: dir }).stdout);
  assert.strictEqual(composition.composition_id, "prompt-composition-001");
  assert.strictEqual(composition.pack, "react");
  assert.ok(composition.common_files.includes("01_GENERAL_AI_CODING_RULES.md"));
  assert.ok(composition.common_files.includes("07_COST_CONTEXT_POLICY_RULES.md"));
  assert.ok(composition.common_files.includes("08_DESIGN_SECURITY_MIGRATION_RULES.md"));
  assert.ok(composition.common_policy_gates.includes("security"));
  assert.ok(composition.traceability_outputs.includes("AI run history"));
  assert.ok(fs.existsSync(path.join(dir, composition.output_path)));
  const prompt = fs.readFileSync(path.join(dir, composition.output_path), "utf8");
  assert.match(prompt, /Common Prompt Layer/);
  assert.match(prompt, /Common Governance Checklist/);
  assert.match(prompt, /Design, Security, And Migration Rules/);
  assert.match(prompt, /Stack-specific Prompt/);
  assert.match(runKvdf(["prompt-pack", "compositions"], { cwd: dir }).stdout, /prompt-composition-001/);
  assert.match(runKvdf(["validate", "prompt-layer"], { cwd: dir }).stdout, /common prompt layer checked/);
}));

test("react native expo prompt pack exports and selects mobile prompts", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["prompt-pack", "export", "react-native-expo", "--output", "mobile-prompts"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "mobile-prompts/prompt_pack_manifest.json")));
  runKvdf(["task", "create", "--id", "task-mobile-001", "--title", "Add push notification permission flow", "--workstream", "mobile", "--acceptance", "Denied permission state is handled"], { cwd: dir });
  const composition = JSON.parse(runKvdf(["prompt-pack", "compose", "react-native-expo", "--task", "task-mobile-001"], { cwd: dir }).stdout);
  assert.strictEqual(composition.pack, "react-native-expo");
  assert.strictEqual(composition.selected_prompt, "10_DEVICE_PERMISSIONS_NOTIFICATIONS_PROMPT.md");
  const prompt = fs.readFileSync(path.join(dir, composition.output_path), "utf8");
  assert.match(prompt, /React Native Expo/);
  assert.match(prompt, /Device Permissions and Notifications/);
  runKvdf(["task", "create", "--id", "task-mobile-002", "--title", "Confirm backend API contract for mobile checkout", "--workstream", "mobile", "--acceptance", "Checkout contract gaps are listed"], { cwd: dir });
  const contractComposition = JSON.parse(runKvdf(["prompt-pack", "compose", "react-native-expo", "--task", "task-mobile-002"], { cwd: dir }).stdout);
  assert.strictEqual(contractComposition.selected_prompt, "13_BACKEND_API_CONTRACT_PROMPT.md");
  runKvdf(["task", "create", "--id", "task-mobile-003", "--title", "Improve accessibility and performance for product list", "--workstream", "mobile", "--acceptance", "Large text and slow list risks are reviewed"], { cwd: dir });
  const qualityComposition = JSON.parse(runKvdf(["prompt-pack", "compose", "react-native-expo", "--task", "task-mobile-003"], { cwd: dir }).stdout);
  assert.strictEqual(qualityComposition.selected_prompt, "14_ACCESSIBILITY_PERFORMANCE_PROMPT.md");
}));

test("wordpress capability plans analyzes scaffolds and creates tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "wp-content", "plugins", "woocommerce"), { recursive: true });
  fs.mkdirSync(path.join(dir, "wp-content", "themes", "twentytwentyfour"), { recursive: true });
  fs.writeFileSync(path.join(dir, "wp-config.php"), "<?php // test config\n", "utf8");
  const analysis = JSON.parse(runKvdf(["wordpress", "analyze", "--path", ".", "--staging", "--backup", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(analysis.detected_type, "woocommerce");
  assert.strictEqual(analysis.recommended_blueprint, "ecommerce");
  assert.ok(analysis.plugins.includes("woocommerce"));
  const plan = JSON.parse(runKvdf(["wordpress", "plan", "Improve existing WooCommerce checkout", "--type", "woocommerce", "--mode", "existing", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(plan.site_type, "woocommerce");
  assert.strictEqual(plan.blueprint_key, "ecommerce");
  assert.ok(plan.task_templates.some((task) => /WooCommerce/.test(task.title)));
  const created = JSON.parse(runKvdf(["wordpress", "tasks", "--json"], { cwd: dir }).stdout);
  assert.ok(created.tasks.length >= 5);
  const scaffold = JSON.parse(runKvdf(["wordpress", "scaffold", "plugin", "--name", "Store Enhancements", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(scaffold.type, "plugin");
  assert.ok(fs.existsSync(path.join(dir, "wp-content", "plugins", "store-enhancements", "store-enhancements.php")));
  assert.ok(fs.existsSync(path.join(dir, "wp-content", "plugins", "store-enhancements", "includes", "class-plugin.php")));
  assert.ok(fs.existsSync(path.join(dir, "wp-content", "plugins", "store-enhancements", "admin", "class-admin.php")));
  const pluginPlan = JSON.parse(runKvdf(["wordpress", "plugin", "plan", "Build a WooCommerce checkout add-on", "--name", "Checkout Addon", "--type", "woocommerce", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginPlan.slug, "checkout-addon");
  assert.strictEqual(pluginPlan.plugin_type, "woocommerce");
  assert.ok(pluginPlan.architecture.some((item) => item.path === "includes/class-woocommerce.php"));
  const pluginTasks = JSON.parse(runKvdf(["wordpress", "plugin", "tasks", "--json"], { cwd: dir }).stdout);
  assert.ok(pluginTasks.tasks.length >= 6);
  assert.ok(pluginTasks.tasks.every((item) => item.allowed_files.includes("wp-content/plugins/checkout-addon/**")));
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/wordpress.json"), "utf8"));
  assert.strictEqual(state.analyses.length, 1);
  assert.strictEqual(state.plans.length, 1);
  assert.strictEqual(state.plugin_plans.length, 1);
  assert.strictEqual(state.scaffolds.length, 1);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /wordpress\.json matches KVDF WordPress Capability State/);
}));

test("wordpress services modules persist state and build plans", () => {
  const store = {
    ".kabeeri/wordpress.json": { analyses: [], plans: [], plugin_plans: [], scaffolds: [], current_analysis_id: null, current_plan_id: null, current_plugin_plan_id: null },
    ".kabeeri/tasks.json": { tasks: [] }
  };
  const readJsonFile = (file) => JSON.parse(JSON.stringify(store[file] || {}));
  const writeJsonFile = (file, value) => {
    store[file] = JSON.parse(JSON.stringify(value));
  };
  const fileExists = (file) => Object.prototype.hasOwnProperty.call(store, file);

  wordpressStateService.ensureWordPressState(writeJsonFile, fileExists);
  const plan = wordpressPlanService.buildWordPressPlan("Build a WordPress company website", { type: "corporate", mode: "new" });
  const pluginPlan = wordpressPlanService.buildWordPressPluginPlan("Build a WooCommerce checkout add-on", { name: "Checkout Addon", type: "woocommerce" });

  wordpressStateService.recordWordPressPlan(readJsonFile, writeJsonFile, plan);
  wordpressStateService.recordWordPressPluginPlan(readJsonFile, writeJsonFile, pluginPlan);

  const storedState = readJsonFile(".kabeeri/wordpress.json");
  assert.strictEqual(storedState.plans.length, 1);
  assert.strictEqual(storedState.current_plan_id, plan.plan_id);
  assert.strictEqual(storedState.plugin_plans.length, 1);
  assert.strictEqual(storedState.current_plugin_plan_id, pluginPlan.plugin_plan_id);
  assert.ok(plan.phases.length > 0);
  assert.ok(plan.task_templates.length > 0);
  assert.ok(pluginPlan.architecture.some((item) => item.path === "includes/class-woocommerce.php"));
  assert.ok(pluginPlan.task_templates.some((item) => item.workstream === "backend"));

  const planTasks = wordpressStateService.createTasksFromWordPressPlan(plan, {}, readJsonFile, writeJsonFile);
  const pluginTasks = wordpressStateService.createTasksFromWordPressPluginPlan(pluginPlan, {}, readJsonFile, writeJsonFile);
  assert.ok(planTasks.length > 0);
  assert.ok(pluginTasks.length > 0);
  assert.ok(planTasks.every((item) => item.source === "wordpress_plan"));
  assert.ok(pluginTasks.every((item) => item.allowed_files.includes("wp-content/plugins/checkout-addon/**")));
});

test("booking builder plugin installs and runs a full runtime pipeline", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "plugins"), { recursive: true });
  fs.cpSync(path.join(repoRoot, "plugins", "booking_builder"), path.join(dir, "plugins", "booking_builder"), { recursive: true });

  const initialStatus = JSON.parse(runKvdf(["booking", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(initialStatus.plugin_enabled, false);
  assert.strictEqual(initialStatus.next_action, "kvdf plugins install booking-builder");
  assert.strictEqual(initialStatus.bundle_contract_status, "ready");

  runKvdf(["plugins", "install", "booking-builder"], { cwd: dir });

  const enabledStatus = JSON.parse(runKvdf(["booking", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(enabledStatus.plugin_enabled, true);
  assert.strictEqual(enabledStatus.next_action, "kvdf booking init");
  assert.strictEqual(enabledStatus.bundle_contract_status, "ready");

  runKvdf(["booking", "init", "--mode", "appointments", "--name", "Clinic Booking", "--json"], { cwd: dir });
  const questionnaire = JSON.parse(runKvdf(["booking", "questionnaire", "--answer", "booking.goal:Clinic booking,booking.timezone:UTC,booking.payment:none,booking.reminders:yes,booking.reschedule:yes,booking.admin_roles:front desk,booking.appointment_duration:30m,booking.practitioner_schedule:yes", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(questionnaire.current_project.stage, "questionnaire");
  assert.strictEqual(questionnaire.current_project.blockers.length, 0);

  const brief = JSON.parse(runKvdf(["booking", "brief", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(brief.current_project.stage, "brief");

  const design = JSON.parse(runKvdf(["booking", "design", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(design.current_project.stage, "design");

  const modules = JSON.parse(runKvdf(["booking", "modules", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(modules.current_project.stage, "modules");
  assert.ok(modules.current_project.modules > 0);

  const review = JSON.parse(runKvdf(["booking", "review", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.current_project.stage, "review");
  assert.strictEqual(review.current_project.planning_review.status, "approved");

  const tasks = JSON.parse(runKvdf(["booking", "tasks", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(tasks.current_project.stage, "tasks");
  assert.ok(tasks.current_project.tasks > 0);

  const approval = JSON.parse(runKvdf(["booking", "approve", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(approval.current_project.stage, "approval");
  assert.strictEqual(approval.current_project.batches, 1);

  const report = JSON.parse(runKvdf(["booking", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.stage, "approval");
  assert.ok(report.next_actions.length > 0);
  assert.strictEqual(report.bundle_contract_status, "ready");

  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "booking.json"), "utf8"));
  assert.strictEqual(state.current_project_id, approval.current_project.project_id);
  assert.strictEqual(state.projects[0].stage, "approval");

  runKvdf(["plugins", "uninstall", "booking-builder"], { cwd: dir });
  const disabledStatus = JSON.parse(runKvdf(["booking", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(disabledStatus.plugin_enabled, false);
  assert.strictEqual(disabledStatus.next_action, "kvdf plugins install booking-builder");
  assert.match(runKvdf(["booking", "brief"], { cwd: dir, expectFailure: true }).stderr, /Booking plugin blocked/);
}));

test("ecommerce builder plugin installs and runs a full runtime pipeline", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "plugins"), { recursive: true });
  fs.cpSync(path.join(repoRoot, "plugins", "ecommerce_builder"), path.join(dir, "plugins", "ecommerce_builder"), { recursive: true });

  const initialStatus = JSON.parse(runKvdf(["ecommerce", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(initialStatus.plugin_enabled, false);
  assert.strictEqual(initialStatus.next_action, "kvdf plugins install ecommerce-builder");
  assert.strictEqual(initialStatus.bundle_contract_status, "ready");

  runKvdf(["plugins", "install", "ecommerce-builder"], { cwd: dir });

  const enabledStatus = JSON.parse(runKvdf(["ecommerce", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(enabledStatus.plugin_enabled, true);
  assert.strictEqual(enabledStatus.next_action, "kvdf ecommerce init");
  assert.strictEqual(enabledStatus.bundle_contract_status, "ready");

  runKvdf(["ecommerce", "init", "--mode", "store", "--name", "Shop Front", "--json"], { cwd: dir });
  const questionnaire = JSON.parse(runKvdf(["ecommerce", "questionnaire", "--answer", "commerce.goal:Shop front,commerce.currency:USD,commerce.payments:stripe,commerce.tax:vat,commerce.fulfillment:shipments,commerce.admin_roles:ops,commerce.catalog_size:large,commerce.inventory:yes", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(questionnaire.current_project.stage, "questionnaire");
  assert.strictEqual(questionnaire.current_project.blockers.length, 0);

  const brief = JSON.parse(runKvdf(["ecommerce", "brief", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(brief.current_project.stage, "brief");

  const design = JSON.parse(runKvdf(["ecommerce", "design", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(design.current_project.stage, "design");

  const modules = JSON.parse(runKvdf(["ecommerce", "modules", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(modules.current_project.stage, "modules");
  assert.ok(modules.current_project.modules > 0);

  const review = JSON.parse(runKvdf(["ecommerce", "review", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.current_project.stage, "review");
  assert.strictEqual(review.current_project.planning_review.status, "approved");

  const tasks = JSON.parse(runKvdf(["ecommerce", "tasks", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(tasks.current_project.stage, "tasks");
  assert.ok(tasks.current_project.tasks > 0);

  const approval = JSON.parse(runKvdf(["ecommerce", "approve", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(approval.current_project.stage, "approval");
  assert.strictEqual(approval.current_project.batches, 1);

  const report = JSON.parse(runKvdf(["ecommerce", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.stage, "approval");
  assert.ok(report.next_actions.length > 0);
  assert.strictEqual(report.bundle_contract_status, "ready");

  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "ecommerce.json"), "utf8"));
  assert.strictEqual(state.current_project_id, approval.current_project.project_id);
  assert.strictEqual(state.projects[0].stage, "approval");

  runKvdf(["plugins", "uninstall", "ecommerce-builder"], { cwd: dir });
  const disabledStatus = JSON.parse(runKvdf(["ecommerce", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(disabledStatus.plugin_enabled, false);
  assert.strictEqual(disabledStatus.next_action, "kvdf plugins install ecommerce-builder");
  assert.match(runKvdf(["ecommerce", "brief"], { cwd: dir, expectFailure: true }).stderr, /Ecommerce plugin blocked/);
}));

test("app plugin suite installs and runs full runtime pipelines", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "plugins"), { recursive: true });

  const pluginIds = ["company-profile", "news-website", "blog", "ecommerce-mobile-app", "crm", "pos"];

  for (const pluginId of pluginIds) {
    const bundleDir = getPluginBundleDir(pluginId);
    fs.cpSync(path.join(repoRoot, "plugins", bundleDir), path.join(dir, "plugins", bundleDir), { recursive: true });

    const spec = appPluginCatalog[pluginId];
    const initialStatus = JSON.parse(runKvdf([pluginId, "status", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(initialStatus.plugin_enabled, false);
    assert.strictEqual(initialStatus.next_action, `kvdf plugins install ${pluginId}`);
    assert.strictEqual(initialStatus.bundle_contract_status, "ready");

    runKvdf(["plugins", "install", pluginId], { cwd: dir });

    const enabledStatus = JSON.parse(runKvdf([pluginId, "status", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(enabledStatus.plugin_enabled, true);
    assert.strictEqual(enabledStatus.next_action, `kvdf ${pluginId} init`);
    assert.strictEqual(enabledStatus.bundle_contract_status, "ready");

    runKvdf([pluginId, "init", "--mode", spec.default_mode, "--name", spec.display_name, "--json"], { cwd: dir });

    const questions = [];
    const allQuestions = [
      ...(spec.common_questions || []).map((_, index) => `${pluginId}.common.${String(index + 1).padStart(2, "0")}`),
      ...((spec.mode_questions && spec.mode_questions[spec.default_mode]) || []).map((_, index) => `${pluginId}.${spec.default_mode}.${String(index + 1).padStart(2, "0")}`)
    ];
    for (const questionId of allQuestions) {
      questions.push(`${questionId}:${questionId} answer`);
    }

    const questionnaire = JSON.parse(runKvdf([pluginId, "questionnaire", "--answer", questions.join(","), "--json"], { cwd: dir }).stdout);
    assert.strictEqual(questionnaire.current_project.stage, "questionnaire");
    assert.strictEqual(questionnaire.current_project.blockers.length, 0);
    assert.strictEqual(questionnaire.current_project.questions, allQuestions.length);
    assert.strictEqual(questionnaire.current_project.answers, allQuestions.length);
    assert.match(questionnaire.next_action, new RegExp(`kvdf ${pluginId} brief`));

    const brief = JSON.parse(runKvdf([pluginId, "brief", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(brief.current_project.stage, "brief");
    const briefState = JSON.parse(fs.readFileSync(path.join(dir, spec.state_file), "utf8"));
    assert.ok(briefState.projects[0].brief);

    const design = JSON.parse(runKvdf([pluginId, "design", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(design.current_project.stage, "design");
    const designState = JSON.parse(fs.readFileSync(path.join(dir, spec.state_file), "utf8"));
    assert.ok(designState.projects[0].design);

  const modules = JSON.parse(runKvdf([pluginId, "modules", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(modules.current_project.stage, "modules");
  assert.ok(modules.current_project.modules > 0);

  const planningReview = JSON.parse(runKvdf([pluginId, "review", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(planningReview.current_project.stage, "review");
  assert.strictEqual(planningReview.current_project.planning_review.status, "approved");

  const tasks = JSON.parse(runKvdf([pluginId, "tasks", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(tasks.current_project.stage, "tasks");
  assert.ok(tasks.current_project.tasks > 0);

    const approval = JSON.parse(runKvdf([pluginId, "approve", "--confirm", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(approval.current_project.stage, "approval");
    assert.strictEqual(approval.current_project.batches, 1);

    const report = JSON.parse(runKvdf([pluginId, "report", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(report.stage, "approval");
    assert.ok(report.next_actions.length > 0);
    assert.strictEqual(report.bundle_contract_status, "ready");

    const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", spec.state_file.replace(".kabeeri/", "")), "utf8"));
    assert.strictEqual(state.current_project_id, approval.current_project.project_id);
    assert.strictEqual(state.projects[0].stage, "approval");

    runKvdf(["plugins", "uninstall", pluginId], { cwd: dir });
    const disabledStatus = JSON.parse(runKvdf([pluginId, "status", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(disabledStatus.plugin_enabled, false);
    assert.strictEqual(disabledStatus.next_action, `kvdf plugins install ${pluginId}`);
    assert.match(runKvdf([pluginId, "brief"], { cwd: dir, expectFailure: true }).stderr, new RegExp(`${spec.display_name} plugin blocked`));
  }
}));

for (const pluginId of ["company-profile", "news-website", "blog", "ecommerce-mobile-app", "crm", "pos"]) {
  const smokeCases = loadPluginSmokeCases(pluginId);
  const spec = appPluginCatalog[pluginId];
  for (const smokeCase of smokeCases.smoke_cases || []) {
    test(`plugin smoke case: ${pluginId} - ${smokeCase.name}`, () => withTempDir((dir) => {
      runAppPluginSmokeCase(dir, pluginId, spec, smokeCase);
    }));
  }
}

test("vibe-first commands classify suggestions convert tasks and capture work", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const session = JSON.parse(runKvdf(["vibe", "session", "start", "--title", "Ecommerce planning"], { cwd: dir }).stdout);
  assert.strictEqual(session.status, "active");
  const suggestion = JSON.parse(runKvdf(["vibe", "suggest", "Add admin dashboard settings screen where owner can save preferences"], { cwd: dir }).stdout);
  assert.strictEqual(suggestion.status, "suggested");
  assert.strictEqual(suggestion.workstream, "admin_frontend");
  assert.ok(suggestion.acceptance_criteria.length > 0);
  assert.match(runKvdf(["vibe", "list"], { cwd: dir }).stdout, /suggestion-001/);
  assert.match(runKvdf(["ask", "Improve the dashboard"], { cwd: dir }).stdout, /Questions written to:/);
  assert.match(fs.readFileSync(path.join(dir, ".kabeeri", "interactions", "vibe_questions.md"), "utf8"), /Vibe Clarification Questions/);
  const plan = JSON.parse(runKvdf(["vibe", "plan", "Build ecommerce store with products cart checkout admin and tests"], { cwd: dir }).stdout);
  assert.ok(plan.suggestions.length >= 4);
  assert.ok(plan.suggestions.some((item) => item.workstream === "backend"));
  assert.ok(plan.suggestions.some((item) => item.workstream === "public_frontend"));
  runKvdf(["vibe", "approve", "suggestion-001"], { cwd: dir });
  runKvdf(["vibe", "convert", "suggestion-001"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.strictEqual(tasks[0].source, "vibe:intent-001");
  const scan = JSON.parse(runKvdf(["capture", "scan", "--summary", "Generated invoice export helper", "--files", "scripts/invoice-export.js"], { cwd: dir }).stdout);
  assert.strictEqual(scan.classification, "needs_new_task");
  assert.strictEqual(scan.would_create_capture, true);
  runKvdf(["capture", "--summary", "Generated invoice export helper", "--files", "scripts/invoice-export.js", "--checks", "npm test"], { cwd: dir });
  let captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[0].classification, "needs_new_task");
  assert.strictEqual(captures[0].status, "captured");
  assert.deepStrictEqual(captures[0].file_details, [{ file: "scripts/invoice-export.js", status: "manual", raw: "scripts/invoice-export.js" }]);
  assert.deepStrictEqual(captures[0].missing_evidence, ["acceptance_evidence"]);
  assert.match(runKvdf(["capture", "list"], { cwd: dir }).stdout, /capture-001/);
  assert.strictEqual(JSON.parse(runKvdf(["capture", "show", "capture-001"], { cwd: dir }).stdout).capture_id, "capture-001");
  const updatedCapture = JSON.parse(runKvdf(["capture", "evidence", "capture-001", "--evidence", "manual review"], { cwd: dir }).stdout);
  assert.deepStrictEqual(updatedCapture.missing_evidence, []);
  runKvdf(["capture", "convert", "capture-001", "--task", "task-002"], { cwd: dir });
  captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[0].classification, "converted_to_task");
  const convertedCaptureTasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(convertedCaptureTasks.some((task) => task.id === "task-002" && task.source === "capture:capture-001"));
  runKvdf(["capture", "--summary", "Attached review evidence for admin settings", "--files", "apps/admin/src/settings.ts", "--task", "task-001", "--checks", "npm test", "--evidence", "manual review"], { cwd: dir });
  captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[1].classification, "matches_existing_task");
  assert.strictEqual(captures[1].status, "linked");
  runKvdf(["capture", "resolve", "capture-002", "--reason", "Evidence reviewed"], { cwd: dir });
  captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[1].status, "resolved");
  runKvdf(["capture", "--summary", "Explored a throwaway docs note", "--files", "notes.md", "--classification", "exploration", "--checks", "manual", "--evidence", "not needed"], { cwd: dir });
  const rejectedCapture = JSON.parse(runKvdf(["capture", "reject", "capture-003", "--reason", "Exploration will not continue"], { cwd: dir }).stdout);
  assert.strictEqual(rejectedCapture.status, "rejected");
  assert.match(runKvdf(["validate", "capture"], { cwd: dir }).stdout, /post-work captures checked/);
  assert.match(runKvdf(["vibe", "brief"], { cwd: dir }).stdout, /Vibe brief/);
  assert.match(runKvdf(["vibe", "next"], { cwd: dir }).stdout, /review_suggestion|approve_or_refine_task/);
  const sessions = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/vibe_sessions.json"), "utf8"));
  assert.strictEqual(sessions.current_session_id, "vibe-session-001");
  runKvdf(["dashboard", "viber", "export", "--output", "dashboard.html"], { cwd: dir });
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /KVDF Viber Dashboard/);
  assert.match(html, /Viber\/App Track/);
  assert.match(html, /Questionnaire \/ Intake/);
  assert.match(html, /Task Punch \/ Execution/);
  assert.match(html, /App Plugins \/ Integrations/);
}));

function answerAllGeneratedQuestionnaireQuestions(dir, plan) {
  for (const question of plan.generated_questions || []) {
    const answer = Array.isArray(question.choices) && question.choices.length
      ? question.choices[0]
      : "confirmed";
    const areas = Array.isArray(question.area_ids) && question.area_ids.length ? question.area_ids.join(",") : "mvp_scope";
    runKvdf(["questionnaire", "answer", question.question_id, "--value", answer, "--areas", areas], { cwd: dir });
  }
}

test("owner auth blocks verify without active session", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Backend API", "--type", "backend", "--path", "src/api"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Verify task", "--workstream", "backend", "--app", "backend-api", "--acceptance", "Owner verifies"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/auth.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  runKvdf(["task", "review", "task-001", "--reviewer", "reviewer-001"], { cwd: dir });
  runKvdf(["acceptance", "create", "--task", "task-001"], { cwd: dir });
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--evidence", "Owner verifies"], { cwd: dir });
  runKvdf(["owner", "logout"], { cwd: dir });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true }).stderr, /Owner session required/);
  runKvdf(["owner", "login", "--id", "owner-001"], { cwd: dir, env });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout, /owner_verified/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/task-001.verification.md")));
}));

test("owner docs token gate issues a fresh token and closes with the owner session", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  const opened = JSON.parse(runKvdf(["owner", "docs", "open", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(opened.report_type, "owner_docs_token_opened");
  assert.match(opened.token, /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z0-9]{50}$/);
  assert.strictEqual(opened.owner_id, "owner-001");
  const docsState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "owner_docs_tokens.json"), "utf8"));
  assert.strictEqual(docsState.tokens.find((item) => item.token_id === opened.token_id).status, "active");
  const sessionStatus = JSON.parse(runKvdf(["owner", "session", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(sessionStatus.report_type, "owner_session_status");
  assert.strictEqual(sessionStatus.docs_token_active, true);
  const closed = JSON.parse(runKvdf(["owner", "session", "close", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(closed.report_type, "owner_session_closed");
  const docsAfter = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "owner_docs_tokens.json"), "utf8"));
  assert.ok(docsAfter.tokens.every((item) => item.status !== "active"));
  const sessionAfter = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "session.json"), "utf8"));
  assert.strictEqual(sessionAfter.active, false);
  assert.strictEqual(sessionAfter.close_reason, "owner_session_close");
}));

test("owner verify requires acceptance evidence", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Backend API", "--type", "backend", "--path", "src/api"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "No criteria task", "--workstream", "backend", "--app", "backend-api"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/no-criteria.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  runKvdf(["task", "review", "task-001", "--reviewer", "reviewer-001"], { cwd: dir });
  assert.match(
    runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true }).stderr,
    /reviewed acceptance evidence/
  );
  runKvdf(["acceptance", "create", "--task", "task-001", "--criteria", "Reviewed"], { cwd: dir });
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--evidence", "Reviewed"], { cwd: dir });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout, /owner_verified/);
}));

test("owner verify requires explicit evidence for each acceptance criterion", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Backend API", "--type", "backend", "--path", "src/api"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Evidence task", "--workstream", "backend", "--app", "backend-api", "--acceptance", "Reviewed"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/evidence.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  runKvdf(["task", "review", "task-001", "--reviewer", "reviewer-001"], { cwd: dir });
  runKvdf(["acceptance", "create", "--task", "task-001"], { cwd: dir });
  assert.match(
    runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass"], { cwd: dir }).stdout,
    /Reviewed acceptance record/
  );
  assert.match(
    runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true }).stderr,
    /explicit evidence/
  );
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--evidence", "Reviewed"], { cwd: dir });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout, /owner_verified/);
  const verifiedTasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8")).tasks;
  assert.strictEqual(verifiedTasks.find((task) => task.id === "task-001").status, "owner_verified");
  const report = fs.readFileSync(path.join(dir, ".kabeeri", "reports", "task-001.verification.md"), "utf8");
  assert.match(report, /Acceptance Coverage/);
  assert.match(report, /Reviewed/);
}));

test("role permissions block unsafe actions", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["developer", "add", "--id", "reviewer-001", "--name", "Reviewer", "--role", "Reviewer"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Permission task"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  assert.match(runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--actor", "reviewer-001"], { cwd: dir, expectFailure: true }).stderr, /Permission denied/);
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/permission.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  assert.match(runKvdf(["task", "review", "task-001", "--actor", "agent-001"], { cwd: dir, expectFailure: true }).stderr, /Reviewer independence/);
  runKvdf(["task", "review", "task-001", "--actor", "reviewer-001"], { cwd: dir });
}));

test("workstream governance blocks invalid task assignment", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "frontend-agent", "--name", "Frontend Agent", "--role", "AI Developer", "--workstreams", "public_frontend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "backend-agent", "--name", "Backend Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Backend task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  assert.match(
    runKvdf(["task", "assign", "task-001", "--assignee", "frontend-agent"], { cwd: dir, expectFailure: true }).stderr,
    /Workstream assignment denied/
  );
  runKvdf(["task", "assign", "task-001", "--assignee", "backend-agent"], { cwd: dir });
}));

test("workstream governance owns registry and session file boundaries", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["workstream", "list"], { cwd: dir }).stdout, /backend/);
  assert.match(runKvdf(["workstream", "show", "backend"], { cwd: dir }).stdout, /path_rules/);
  runKvdf(["workstream", "add", "--id", "payments", "--name", "Payments", "--paths", "src/payments,app/Payments", "--review", "security"], { cwd: dir });
  assert.match(runKvdf(["workstream", "validate"], { cwd: dir }).stdout, /valid/);
  assert.match(
    runKvdf(["task", "create", "--id", "task-unknown", "--title", "Unknown stream", "--workstream", "unknown_stream"], { cwd: dir, expectFailure: true }).stderr,
    /Unknown workstream/
  );
  runKvdf(["developer", "solo", "--id", "dev-main", "--name", "Main Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Backend session", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "dev-main"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "dev-main"], { cwd: dir });
  const issuedToken = JSON.parse(runKvdf(["token", "show", "task-token-001"], { cwd: dir }).stdout);
  assert.strictEqual(issuedToken.scope_mode, "auto");
  assert.ok(issuedToken.workstreams.includes("backend"));
  assert.ok(issuedToken.allowed_files.includes("src/api/"));
  assert.match(
    runKvdf(["token", "issue", "--task", "task-001", "--assignee", "dev-main", "--allowed-files", "resources/js/"], { cwd: dir, expectFailure: true }).stderr,
    /broader than task app\/workstream boundaries/
  );
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "dev-main"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "dev-main"], { cwd: dir });
  assert.match(
    runKvdf(["session", "end", "session-001", "--files", "resources/js/App.jsx", "--summary", "Wrong stream"], { cwd: dir, expectFailure: true }).stderr,
    /outside token scope/
  );
  runKvdf(["session", "end", "session-001", "--files", "src/api/users.ts", "--summary", "Backend file"], { cwd: dir });
  assert.match(runKvdf(["validate", "workstream"], { cwd: dir }).stdout, /workstream governance checked/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const dashboard = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(dashboard, /KVDF Viber Dashboard/);
  assert.match(dashboard, /Viber\/App Track/);
  assert.doesNotMatch(dashboard, /KVDF Owner Dashboard/);
}));

test("solo developer mode configures full-stack workstreams", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["developer", "solo", "--id", "dev-main", "--name", "Main Developer"], { cwd: dir });
  const mode = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/developer_mode.json"), "utf8"));
  assert.strictEqual(mode.mode, "solo");
  assert.strictEqual(mode.solo_developer_id, "dev-main");
  assert.match(runKvdf(["developer", "list"], { cwd: dir }).stdout, /dev-main/);
  const developer = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/developers.json"), "utf8"));
  const item = developer.developers.find((entry) => entry.id === "dev-main");
  assert.strictEqual(item.role, "Full-stack Developer");
  assert.ok(item.workstreams.includes("backend"));
  assert.ok(item.workstreams.includes("public_frontend"));
  runKvdf(["task", "create", "--id", "task-001", "--title", "Full stack task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "dev-main"], { cwd: dir });
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /solo developer mode valid/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
})); 

test("task access tokens require real governed assignment", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "Agent One", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-002", "--name", "Agent Two", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  assert.match(
    runKvdf(["token", "issue", "--task", "missing-task", "--assignee", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /Task not found/
  );
  runKvdf(["task", "create", "--id", "task-001", "--title", "Governed task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  assert.match(
    runKvdf(["session", "start", "--task", "task-001", "--developer", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /not assigned/
  );
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-002"], { cwd: dir, expectFailure: true }).stderr,
    /Token assignee mismatch/
  );
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
}));

test("locks derive scope from task app and workstream boundaries", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "Agent One", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["app", "create", "backend-api", "--name", "Backend API", "--type", "backend", "--path", "apps/backend-api"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Boundary task", "--workstream", "backend", "--app", "backend-api"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  const locks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "locks.json"), "utf8")).locks;
  assert.strictEqual(locks[0].scope_mode, "auto");
  assert.strictEqual(locks[0].scope_source, "task_app_and_workstream_boundaries");
  assert.strictEqual(locks[0].scope, "apps/backend-api");
  assert.match(
    runKvdf(["lock", "create", "--type", "folder", "--task", "task-001", "--owner", "agent-001", "--scope", "apps"], { cwd: dir, expectFailure: true }).stderr,
    /broader than task app\/workstream boundaries/
  );
}));

test("owner rejection revokes tokens and supports limited reissue", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Rejected task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-usage-tokens", "1000"], { cwd: dir });
  runKvdf(["task", "reject", "task-001", "--reason", "Needs rework"], { cwd: dir });
  let tokens = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tokens.json"), "utf8")).tokens;
  assert.strictEqual(tokens[0].status, "revoked");
  const revokedToken = JSON.parse(runKvdf(["token", "show", "task-token-001"], { cwd: dir }).stdout);
  assert.strictEqual(revokedToken.runtime_status, "revoked");
  assert.ok(revokedToken.visible_reason);
  runKvdf(["token", "reissue", "task-token-001", "--max-usage-tokens", "200", "--reason", "Rework only"], { cwd: dir });
  tokens = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tokens.json"), "utf8")).tokens;
  assert.strictEqual(tokens[1].status, "active");
  assert.strictEqual(tokens[1].reissued_from, "task-token-001");
  assert.strictEqual(tokens[1].max_usage_tokens, 200);
  const reissuedToken = JSON.parse(runKvdf(["token", "show", "task-token-002"], { cwd: dir }).stdout);
  assert.strictEqual(reissuedToken.runtime_status, "active");
  assert.strictEqual(reissuedToken.visible_reason, "Rework only");
}));

test("expired access tokens block session start and report runtime status", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Expired token task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--expires", "2000-01-01T00:00:00.000Z"], { cwd: dir });
  const token = JSON.parse(runKvdf(["token", "show", "task-token-001"], { cwd: dir }).stdout);
  assert.strictEqual(token.runtime_status, "expired");
  assert.strictEqual(token.visible_reason, "");
  assert.match(
    runKvdf(["session", "start", "--task", "task-001", "--developer", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /Task access token expired/
  );
}));

test("integration tasks can explicitly span multiple workstreams", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["task", "create", "--id", "task-001", "--title", "Bad cross-stream task", "--workstreams", "backend,public_frontend"], { cwd: dir, expectFailure: true }).stderr,
    /multiple workstreams/
  );
  runKvdf(["task", "create", "--id", "task-002", "--title", "Integration task", "--type", "integration", "--workstreams", "backend,public_frontend"], { cwd: dir });
  assert.match(runKvdf(["validate", "task"], { cwd: dir }).stdout, /task records checked/);
}));

test("locks prevent overlapping file and folder scopes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "Agent One", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-002", "--name", "Agent Two", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-003", "--name", "Agent Three", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Backend API", "--type", "backend", "--path", "src/api"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Backend lock task", "--workstream", "backend", "--app", "backend-api"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-002", "--title", "Backend file task", "--workstream", "backend", "--app", "backend-api"], { cwd: dir });
  runKvdf(["task", "approve", "task-002"], { cwd: dir });
  runKvdf(["task", "assign", "task-002", "--assignee", "agent-002"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-003", "--title", "Task lock task", "--workstream", "backend", "--app", "backend-api"], { cwd: dir });
  runKvdf(["task", "approve", "task-003"], { cwd: dir });
  runKvdf(["task", "assign", "task-003", "--assignee", "agent-003"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/users.ts", "--task", "task-002", "--owner", "agent-002"], { cwd: dir, expectFailure: true }).stderr,
    /Active lock conflict/
  );
  runKvdf(["lock", "release", "lock-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/users.ts", "--task", "task-002", "--owner", "agent-002"], { cwd: dir });
  assert.match(
    runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /Active lock conflict/
  );
  runKvdf(["lock", "release", "lock-002"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "task", "--scope", "task-003", "--task", "task-003", "--owner", "agent-003"], { cwd: dir });
  assert.match(
    runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api/other", "--task", "task-003", "--owner", "agent-003"], { cwd: dir, expectFailure: true }).stderr,
    /Active lock conflict/
  );
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /active lock conflicts checked/);
}));

test("owner transfer token moves single Owner authority", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Original Owner", "--passphrase", "old-pass"], { cwd: dir });
  const issued = runKvdf(["owner", "transfer", "issue", "--to", "owner-002", "--name", "New Owner", "--token", "transfer-secret"], { cwd: dir });
  assert.match(issued.stdout, /owner-transfer-001/);
  runKvdf(["owner", "logout"], { cwd: dir });
  assert.match(runKvdf(["owner", "transfer", "accept", "--id", "owner-transfer-001", "--token", "transfer-secret", "--passphrase", "new-pass"], { cwd: dir }).stdout, /Owner transferred to owner-002/);
  const developers = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/developers.json"), "utf8")).developers;
  assert.strictEqual(developers.find((item) => item.id === "owner-001").role, "Maintainer");
  assert.strictEqual(developers.find((item) => item.id === "owner-002").role, "Owner");
  const transferState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "owner_transfer_tokens.json"), "utf8"));
  const token = transferState.tokens.find((item) => item.token_id === "owner-transfer-001");
  assert.strictEqual(token.issued_by, "owner-001");
  assert.strictEqual(token.accepted_by, "owner-002");
  assert.strictEqual(token.transfer_path, "completed");
  assert.strictEqual(token.usage_count, 1);
  assert.ok(token.issued_at);
  assert.ok(token.accepted_at);
  assert.ok(token.used_at);
  const report = JSON.parse(runKvdf(["owner", "transfer", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "owner_transfer_token_status");
  assert.ok(report.tokens.some((item) => item.token_id === "owner-transfer-001" && item.transfer_path === "completed"));
  assert.match(runKvdf(["owner", "login", "--id", "owner-001", "--passphrase", "old-pass"], { cwd: dir, expectFailure: true }).stderr, /does not match configured owner/);
  assert.match(runKvdf(["owner", "status"], { cwd: dir }).stdout, /owner-002/);
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /single Owner rule valid/);
}));

test("pricing rules calculate AI usage cost", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["sprint", "create", "--id", "sprint-001", "--name", "Sprint 1"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Pricing task", "--sprint", "sprint-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-cost", "1"], { cwd: dir });
  runKvdf(["pricing", "set", "--provider", "openai", "--model", "gpt-test", "--unit", "1M", "--input", "10", "--output", "20", "--cached", "2"], { cwd: dir });
  const result = runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-test", "--input-tokens", "100000", "--output-tokens", "50000", "--cached-tokens", "10000"], { cwd: dir });
  assert.match(result.stdout, /exceeded cost budget/);
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.strictEqual(summary.total_cost, 2.02);
  assert.strictEqual(summary.by_sprint["sprint-001"].cost, 2.02);
  assert.match(runKvdf(["sprint", "summary", "sprint-001"], { cwd: dir }).stdout, /"total_cost": 2\.02/);
}));

test("agile templates create backlog stories sprint plans and governed tasks", () => withTempDir((dir) => {
  runKvdf(["init", "--mode", "agile"], { cwd: dir });
  runKvdf(["agile", "backlog", "add", "--id", "BL-001", "--title", "Checkout MVP", "--type", "epic", "--priority", "high", "--source", "vision"], { cwd: dir });
  const epic = JSON.parse(runKvdf(["agile", "epic", "create", "--id", "epic-checkout", "--title", "Checkout", "--goal", "Customers can place orders", "--users", "customer", "--source", "vision"], { cwd: dir }).stdout);
  assert.strictEqual(epic.epic_id, "epic-checkout");
  const story = JSON.parse(runKvdf([
    "agile", "story", "create",
    "--id", "story-checkout-001",
    "--epic", "epic-checkout",
    "--title", "Cart checkout",
    "--role", "customer",
    "--want", "pay for cart items",
    "--value", "complete an order",
    "--points", "5",
    "--workstream", "backend",
    "--acceptance", "Order is created,Payment result is stored",
    "--tests", "API and payment-state tests are defined",
    "--reviewer", "owner-001",
    "--source", "vision"
  ], { cwd: dir }).stdout);
  assert.strictEqual(story.ready_status, "ready");
  runKvdf(["agile", "story", "task", "story-checkout-001", "--task", "task-001"], { cwd: dir });
  const impediment = JSON.parse(runKvdf(["agile", "impediment", "add", "--id", "imp-001", "--story", "story-checkout-001", "--severity", "high", "--title", "Payment credentials missing", "--owner", "owner-001"], { cwd: dir }).stdout);
  assert.strictEqual(impediment.status, "open");
  assert.match(runKvdf(["agile", "sprint", "plan", "sprint-blocked", "--stories", "story-checkout-001", "--capacity-points", "10", "--goal", "Blocked sprint"], { cwd: dir, expectFailure: true }).stderr, /open impediments/);
  const resolved = JSON.parse(runKvdf(["agile", "impediment", "resolve", "imp-001", "--resolution", "Credentials configured"], { cwd: dir }).stdout);
  assert.strictEqual(resolved.status, "resolved");
  const planned = JSON.parse(runKvdf(["agile", "sprint", "plan", "sprint-001", "--stories", "story-checkout-001", "--capacity-points", "10", "--goal", "Checkout foundation"], { cwd: dir }).stdout);
  assert.strictEqual(planned.committed_points, 5);
  const review = JSON.parse(runKvdf(["agile", "sprint", "review", "sprint-001", "--accepted", "story-checkout-001", "--goal-met", "yes", "--decision", "accepted"], { cwd: dir }).stdout);
  assert.strictEqual(review.accepted_points, 5);
  const retro = JSON.parse(runKvdf(["agile", "retrospective", "add", "sprint-001", "--good", "Goal was clear", "--improve", "Slice stories smaller", "--actions", "Add QA earlier"], { cwd: dir }).stdout);
  assert.strictEqual(retro.sprint_id, "sprint-001");
  const release = JSON.parse(runKvdf(["agile", "release", "plan", "release-001", "--title", "Checkout demo", "--stories", "story-checkout-001", "--criteria", "Checkout accepted", "--checks", "Policy gates reviewed"], { cwd: dir }).stdout);
  assert.strictEqual(release.readiness_status, "ready");
  const releaseReadiness = JSON.parse(runKvdf(["agile", "release", "readiness", "release-001"], { cwd: dir }).stdout);
  assert.strictEqual(releaseReadiness.accepted_story_ids[0], "story-checkout-001");
  const health = JSON.parse(runKvdf(["agile", "health", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(health.summary.open_impediments, 0);
  assert.strictEqual(health.velocity.latest_accepted_points, 5);
  assert.strictEqual(health.release_readiness.release_id, "release-001");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/dashboard/agile_state.json")));
  const agile = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/agile.json"), "utf8"));
  assert.strictEqual(agile.stories[0].task_id, "task-001");
  assert.strictEqual(agile.stories[0].status, "accepted");
  assert.strictEqual(agile.releases[0].release_id, "release-001");
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.strictEqual(tasks[0].source_reference, "story:story-checkout-001");
  assert.match(runKvdf(["agile", "summary"], { cwd: dir }).stdout, /ready_stories/);
  assert.match(runKvdf(["validate", "agile"], { cwd: dir }).stdout, /impediments/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Viber\/App Track/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Idea-to-Evolution Pipeline/);
})); 

test("structured delivery manages requirements phases gates and traceability", () => withTempDir((dir) => {
  runKvdf(["init", "--mode", "structured"], { cwd: dir });
  const req = JSON.parse(runKvdf([
    "structured", "requirement", "add",
    "--id", "REQ-001",
    "--title", "Email login",
    "--priority", "high",
    "--source", "questionnaire",
    "--workstream", "backend",
    "--acceptance", "User can login,Invalid password is rejected",
    "--nfr", "Passwords are never stored in plain text",
    "--owner", "owner-001"
  ], { cwd: dir }).stdout);
  assert.strictEqual(req.approval_status, "pending");
  assert.match(runKvdf(["structured", "phase", "plan", "phase-001", "--requirements", "REQ-001", "--goal", "Auth foundation"], { cwd: dir, expectFailure: true }).stderr, /unapproved requirements/);
  const approved = JSON.parse(runKvdf(["structured", "requirement", "approve", "REQ-001", "--reason", "Owner reviewed"], { cwd: dir }).stdout);
  assert.strictEqual(approved.approval_status, "approved");
  const phase = JSON.parse(runKvdf(["structured", "phase", "plan", "phase-001", "--requirements", "REQ-001", "--goal", "Auth foundation", "--exit", "Requirement task created,Deliverable approved"], { cwd: dir }).stdout);
  assert.strictEqual(phase.requirement_ids[0], "REQ-001");
  const task = JSON.parse(runKvdf(["structured", "task", "REQ-001", "--task", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(task.source_reference, "requirement:REQ-001");
  const deliverable = JSON.parse(runKvdf(["structured", "deliverable", "add", "--id", "deliv-001", "--phase", "phase-001", "--title", "Auth specification", "--acceptance", "Owner approved"], { cwd: dir }).stdout);
  assert.strictEqual(deliverable.status, "draft");
  assert.match(runKvdf(["structured", "phase", "complete", "phase-001"], { cwd: dir, expectFailure: true }).stderr, /deliverables_not_approved/);
  runKvdf(["structured", "deliverable", "approve", "deliv-001"], { cwd: dir });
  const risk = JSON.parse(runKvdf(["structured", "risk", "add", "--id", "risk-001", "--phase", "phase-001", "--severity", "high", "--title", "OAuth limit", "--mitigation", "Fallback email login"], { cwd: dir }).stdout);
  assert.strictEqual(risk.status, "open");
  assert.match(runKvdf(["structured", "gate", "check", "phase-001"], { cwd: dir }).stdout, /open_high_risks/);
  runKvdf(["structured", "risk", "mitigate", "risk-001", "--mitigation", "Fallback documented"], { cwd: dir });
  const gate = JSON.parse(runKvdf(["structured", "gate", "check", "phase-001"], { cwd: dir }).stdout);
  assert.notStrictEqual(gate.status, "blocked");
  const completed = JSON.parse(runKvdf(["structured", "phase", "complete", "phase-001"], { cwd: dir }).stdout);
  assert.strictEqual(completed.phase.status, "completed");
  const health = JSON.parse(runKvdf(["structured", "health", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(health.summary.requirements, 1);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/dashboard/structured_state.json")));
  assert.match(runKvdf(["validate", "structured"], { cwd: dir }).stdout, /structured state checked/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Viber\/App Track/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Questionnaire \/ Intake/);
})); 

test("delivery advisor recommends and records agile or structured mode", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const structuredRec = JSON.parse(runKvdf(["delivery", "recommend", "Build hospital management system with patients billing compliance roles and audit", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(structuredRec.recommended_mode, "structured");
  assert.strictEqual(structuredRec.developer_decision_required, true);
  const agileRec = JSON.parse(runKvdf(["delivery", "recommend", "Build startup MVP prototype to validate idea quickly with user feedback", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(agileRec.recommended_mode, "agile");
  const decision = JSON.parse(runKvdf(["delivery", "choose", "agile", "--recommendation", agileRec.recommendation_id, "--reason", "MVP discovery"], { cwd: dir }).stdout);
  assert.strictEqual(decision.chosen_mode, "agile");
  const project = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project.json"), "utf8"));
  assert.strictEqual(project.delivery_mode, "agile");
  const data = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/delivery_decisions.json"), "utf8"));
  assert.strictEqual(data.current_mode, "agile");
  assert.strictEqual(data.recommendations.length, 2);
  assert.match(runKvdf(["delivery", "history"], { cwd: dir }).stdout, /delivery-recommendation/);
}));

test("budget approval gates enforced token overruns", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Budget gate task"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-usage-tokens", "100", "--budget-approval-required"], { cwd: dir });
  assert.match(
    runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "101"], { cwd: dir, expectFailure: true }).stderr,
    /Budget approval required/
  );
  runKvdf(["budget", "approve", "--task", "task-001", "--tokens", "10", "--reason", "Controlled overrun"], { cwd: dir });
  assert.match(runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "101"], { cwd: dir }).stdout, /Recorded usage event/);
  assert.match(runKvdf(["budget", "list"], { cwd: dir }).stdout, /budget-approval-001/);
}));

test("budget approval gates enforced cost overruns", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Budget cost gate"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-cost", "1", "--budget-approval-required"], { cwd: dir });
  assert.match(
    runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "1", "--cost", "1.5"], { cwd: dir, expectFailure: true }).stderr,
    /Budget approval required/
  );
  runKvdf(["budget", "approve", "--task", "task-001", "--cost", "0.5"], { cwd: dir });
  assert.match(runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "1", "--cost", "1.5"], { cwd: dir }).stdout, /Recorded usage event/);
}));

test("usage summary surfaces budget pressure and active approvals", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Watching task"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-002", "--title", "Approved overrun task"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-usage-tokens", "100"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-002", "--assignee", "agent-001", "--max-cost", "1", "--budget-approval-required"], { cwd: dir });
  assert.match(
    runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "76"], { cwd: dir }).stdout,
    /above 75% token budget/
  );
  runKvdf(["budget", "approve", "--task", "task-002", "--cost", "0.5", "--reason", "Controlled overrun"], { cwd: dir });
  assert.match(runKvdf(["usage", "record", "--task", "task-002", "--developer", "agent-001", "--input-tokens", "1", "--cost", "1.1"], { cwd: dir }).stdout, /Recorded usage event/);
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.ok(summary.budget_pressure);
  assert.strictEqual(summary.budget_pressure.counts.watching, 1);
  assert.strictEqual(summary.budget_pressure.counts.over_budget, 1);
  assert.strictEqual(summary.budget_pressure.counts.active_approvals, 1);
  assert.strictEqual(summary.budget_pressure.active_approvals[0].task_id, "task-002");
  assert.ok(summary.budget_pressure.tasks.some((item) => item.task_id === "task-001" && item.severity === "watching"));
  assert.ok(summary.budget_pressure.tasks.some((item) => item.task_id === "task-002" && item.severity === "over_budget" && item.approval_id));
  runKvdf(["usage", "report", "--output", "usage-report.md"], { cwd: dir });
  const report = fs.readFileSync(path.join(dir, "usage-report.md"), "utf8");
  assert.match(report, /Budget Pressure/);
  assert.match(report, /task-001/);
  assert.match(report, /task-002/);
  assert.match(report, /over_budget/);
}));

test("untracked AI usage is recorded and shown in dashboard", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["usage", "record", "--untracked", "--input-tokens", "100", "--output-tokens", "25", "--cost", "0.75", "--source", "ad-hoc-prompt"], { cwd: dir });
  runKvdf(["usage", "inquiry", "--input-tokens", "10", "--output-tokens", "5", "--cost", "0.05", "--operation", "owner-question"], { cwd: dir });
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.strictEqual(summary.tracked_vs_untracked.untracked.events, 2);
  assert.strictEqual(summary.tracked_vs_untracked.untracked.cost, 0.8);
  assert.ok(summary.by_task["admin:owner-question"]);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /KVDF Viber Dashboard/);
  assert.match(html, /AI Cost Control/);
  assert.match(html, /untracked/);
  assert.match(html, /admin:owner-question/);
})); 

test("developer token efficiency separates accepted rejected and rework cost", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Accepted task"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-002", "--title", "Rejected task"], { cwd: dir });
  runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "10", "--cost", "1"], { cwd: dir });
  runKvdf(["usage", "record", "--task", "task-002", "--developer", "agent-001", "--input-tokens", "10", "--cost", "2", "--source", "rework"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8"));
  tasks.tasks.find((task) => task.id === "task-001").status = "owner_verified";
  tasks.tasks.find((task) => task.id === "task-002").status = "rejected";
  fs.writeFileSync(path.join(dir, ".kabeeri/tasks.json"), `${JSON.stringify(tasks, null, 2)}\n`);
  const efficiency = JSON.parse(runKvdf(["usage", "efficiency"], { cwd: dir }).stdout);
  assert.strictEqual(efficiency.by_developer["agent-001"].accepted_cost, 1);
  assert.strictEqual(efficiency.by_developer["agent-001"].rejected_cost, 2);
  assert.strictEqual(efficiency.by_developer["agent-001"].rework_cost, 2);
  runKvdf(["usage", "report", "--output", "usage-report.md"], { cwd: dir });
  const report = fs.readFileSync(path.join(dir, "usage-report.md"), "utf8");
  assert.match(report, /Kabeeri AI Usage Cost Report/);
  assert.match(report, /Developer Efficiency/);
  assert.match(report, /agent-001/);
}));

test("AI sessions create usage events and handoff reports", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Session task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["pricing", "set", "--provider", "openai", "--model", "gpt-session", "--unit", "1M", "--input", "10", "--output", "20", "--cached", "2"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-session"], { cwd: dir });
  const startedSession = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "sessions.json"), "utf8")).sessions[0];
  assert.strictEqual(startedSession.contract.contract_type, "ai_session");
  assert.strictEqual(startedSession.contract.task_id, "task-001");
  assert.ok(startedSession.contract.scope.allowed_files.length > 0);
  assert.ok(startedSession.contract.scope.workstreams.includes("backend"));
  assert.strictEqual(startedSession.output_contract, null);
  runKvdf(["session", "end", "session-001", "--input-tokens", "100000", "--output-tokens", "50000", "--files", "src/api/session.ts", "--summary", "Implemented session task", "--checks", "npm test", "--risks", "Review API"], { cwd: dir });
  const completedSession = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "sessions.json"), "utf8")).sessions[0];
  assert.strictEqual(completedSession.runtime_status || completedSession.status, "completed");
  assert.strictEqual(completedSession.output_contract.contract_type, "ai_session_output");
  assert.ok(completedSession.output_contract.files_touched.includes("src/api/session.ts"));
  assert.ok(completedSession.handoff_evidence.some((item) => item.evidence_type === "handoff_report"));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/session-001.handoff.md")));
  const handoff = fs.readFileSync(path.join(dir, ".kabeeri/reports/session-001.handoff.md"), "utf8");
  assert.match(handoff, /Session Contract/);
  assert.match(handoff, /Output Contract/);
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.strictEqual(summary.total_cost, 2);
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /session handoff exists/);
}));

test("governed AI sessions require file lock coverage", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Locked session task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--allowed-files", "src/api,src/ui", "--allow-broad-scope"], { cwd: dir });
  assert.match(
    runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /active lock/
  );
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["session", "end", "session-001", "--files", "src/ui/app.ts", "--summary", "Wrong scope"], { cwd: dir, expectFailure: true }).stderr,
    /not covered by an active task lock/
  );
  runKvdf(["session", "end", "session-001", "--files", "src/api/users.ts", "--summary", "Covered file"], { cwd: dir });
}));

test("token scopes block forbidden AI session files", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Scoped session task"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--allowed-files", "src/api/", "--forbidden-files", ".env,secrets/"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001"], { cwd: dir });
  assert.match(runKvdf(["session", "end", "session-001", "--files", ".env", "--summary", "Bad file"], { cwd: dir, expectFailure: true }).stderr, /forbidden/);
  assert.match(runKvdf(["session", "end", "session-001", "--files", "src/ui/app.ts", "--summary", "Out of scope"], { cwd: dir, expectFailure: true }).stderr, /outside token scope/);
  runKvdf(["session", "end", "session-001", "--files", "src/api/users.ts", "--summary", "Scoped file"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/session-001.handoff.md")));
}));

test("dashboard export creates static html and owner dashboard output", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Dashboard task"], { cwd: dir });
  runKvdf(["app", "create", "--username", "acme", "--name", "ACME Portal", "--status", "ready_to_demo"], { cwd: dir });
  runKvdf(["app", "create", "--username", "acme-admin", "--name", "ACME Admin", "--status", "draft"], { cwd: dir });
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Public signup", "--readiness", "needs_review", "--tasks", "task-001", "--audience", "Visitors"], { cwd: dir });
  runKvdf(["app", "status", "acme", "--features", "feature-001"], { cwd: dir });
  runKvdf(["feature", "status", "feature-001", "--readiness", "ready_to_demo"], { cwd: dir });
  runKvdf(["journey", "create", "--id", "journey-001", "--name", "Signup journey", "--audience", "Visitors", "--steps", "Landing,Signup,Welcome"], { cwd: dir });
  runKvdf(["app", "status", "acme", "--journeys", "journey-001"], { cwd: dir });
  runKvdf(["journey", "status", "journey-001", "--status", "ready_to_show", "--ready-to-show"], { cwd: dir });
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const clientHtml = fs.readFileSync(path.join(dir, "client.html"), "utf8");
  assert.match(clientHtml, /Kabeeri Client Portal/);
  assert.match(clientHtml, /\/customer\/apps\/acme/);
  assert.doesNotMatch(clientHtml, /\/customer\/apps\/\d+/);
  assert.doesNotMatch(clientHtml, /KVDF Owner Dashboard/);
  assert.doesNotMatch(clientHtml, /KVDF Viber Dashboard/);
  const dashboardHtml = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(dashboardHtml, /KVDF UI assets: fallback/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/site/customer/apps/acme/index.html")));
  const state = JSON.parse(runKvdf(["dashboard", "state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(state.report_type, "kvdf_viber_dashboard_state");
  assert.strictEqual(state.dashboard_type, "viber");
  assert.strictEqual(state.track, "vibe_app_developer");
  assert.strictEqual(state.title, "KVDF Viber Dashboard");
  assert.ok(Array.isArray(state.widgets));
  assert.ok(state.sections.command_center);
  assert.ok(state.sections.idea_to_evolution_pipeline);
  assert.ok(state.sections.questionnaire);
  assert.ok(state.sections.product_app_design);
  assert.ok(state.sections.system_design);
  assert.ok(state.sections.database_design);
  assert.ok(state.sections.ui_ux_design);
  assert.ok(state.sections.version_plan);
  assert.ok(state.sections.evolutions);
  assert.ok(state.sections.task_punches);
  assert.ok(state.sections.source_control_handoff);
  assert.ok(state.sections.ai_cost_control);
  assert.ok(state.sections.app_plugins);
  assert.ok(state.sections.validation_readiness);
  assert.ok(state.sections.readiness);
  assert.ok(state.tables.viber_readiness_gates);
  assert.ok(state.tables.viber_readiness_blockers);
  assert.ok(state.tables.viber_publish_readiness);
  assert.ok(state.tables.viber_execution_feedback);
  assert.ok(state.tables.viber_stage_timeline);
  assert.strictEqual(state.publish_readiness.auto_publish, false);
  assert.ok(state.readiness);
  assert.ok(state.readiness.state_freshness);
  assert.ok(state.readiness.next_safe_action);
  assert.ok(!Object.prototype.hasOwnProperty.call(state.sections, "core_health"));
  assert.ok(!Object.prototype.hasOwnProperty.call(state.sections, "workflows"));
  assert.ok(!Object.prototype.hasOwnProperty.call(state.sections, "native_capabilities"));
  assert.ok(!Object.prototype.hasOwnProperty.call(state.sections, "docs_reports"));
  assert.ok(!Object.prototype.hasOwnProperty.call(state.sections, "governance"));
  assert.ok(!JSON.stringify(state).includes("KVDF Owner Dashboard"));
  assert.strictEqual(state.blocked_cross_track_data[0], "kvdf_core_owner_data");
  assert.strictEqual(state.source_control.mode, "direct_main");
  assert.ok(state.next_action);
  assert.strictEqual(state.current_plan_status, "approved");
  assert.match(runKvdf(["dashboard", "task-tracker"], { cwd: dir }).stdout, /task_tracker_state/);
  assert.match(runKvdf(["task", "tracker"], { cwd: dir }).stdout, /Task Tracker Live State/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json")));
  const trackerFile = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json"), "utf8"));
  assert.strictEqual(trackerFile.live_api_path, "/__kvdf/api/tasks");
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /KVDF Viber Dashboard/);
  assert.match(html, /Viber\/App Track/);
  assert.match(html, /Idea-to-Evolution Pipeline/);
  assert.match(html, /Readiness Overview/);
  assert.match(html, /Gate Matrix/);
  assert.match(html, /Questionnaire \/ Intake/);
  assert.match(html, /Validation \/ Readiness/);
  assert.doesNotMatch(html, /KVDF Owner Dashboard/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /feature records checked/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /journey records checked/);
  const uxAudit = JSON.parse(runKvdf(["dashboard", "ux", "--json"], { cwd: dir }).stdout);
  assert.ok(["pass", "needs_attention"].includes(uxAudit.status));
  assert.ok(uxAudit.checks.some((check) => check.id === "dashboard_ux_governance" && check.status));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/dashboard_ux_report.md")));
  assert.match(runKvdf(["validate", "dashboard"], { cwd: dir }).stdout, /dashboard UX audits checked/);
  assert.match(runKvdf(["dashboard", "owner", "export", "--output", "owner-dashboard.html"], { cwd: dir }).stdout, /Wrote owner dashboard/);
  assert.match(runKvdf(["dashboard", "viber", "export", "--output", "viber-dashboard.html"], { cwd: dir }).stdout, /Wrote viber dashboard/);
  const ownerHtml = fs.readFileSync(path.join(dir, "owner-dashboard.html"), "utf8");
  const viberHtml = fs.readFileSync(path.join(dir, "viber-dashboard.html"), "utf8");
  assert.match(ownerHtml, /KVDF Owner Dashboard/);
  assert.doesNotMatch(ownerHtml, /KVDF Viber Dashboard/);
  assert.match(viberHtml, /KVDF Viber Dashboard/);
  assert.doesNotMatch(viberHtml, /KVDF Owner Dashboard/);
}));

test("dashboard state safely handles missing planner runtime state", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.rmSync(path.join(dir, ".kabeeri", "planner.json"), { force: true });
  fs.rmSync(path.join(dir, ".kabeeri", "evolution.json"), { force: true });
  fs.rmSync(path.join(dir, ".kabeeri", "tasks.json"), { force: true });
  fs.rmSync(path.join(dir, ".kabeeri", "task_trash.json"), { force: true });
  const state = JSON.parse(runKvdf(["dashboard", "state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(state.report_type, "kvdf_viber_dashboard_state");
  assert.strictEqual(state.dashboard_type, "viber");
  assert.strictEqual(state.track, "vibe_app_developer");
  assert.ok(state.planner);
  assert.strictEqual(state.planner.available, true);
  assert.strictEqual(state.planner.current_plan_status, "approved");
  assert.strictEqual(state.planner.current_plan_id, "planner-plan-002");
  assert.strictEqual(state.planner.current_planner_mode, "owner");
  assert.strictEqual(state.planner.track, "framework_owner");
  assert.ok(state.sections.command_center);
  assert.ok(state.sections.idea_to_evolution_pipeline);
}));

test("dashboard state exposes owner planner summaries after approval and materialization", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Owner dashboard planner", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    current_change_id: "owner-dashboard-planner",
    changes: [{
      change_id: "owner-dashboard-planner",
      title: "Owner dashboard planner",
      description: "Owner dashboard planner",
      status: "planned",
      impacted_areas: ["dashboard"],
      task_ids: [],
      created_at: new Date().toISOString()
    }],
    impact_plans: []
  }, null, 2));
  runKvdf(["planner", "materialize", "--from-current", "--json"], { cwd: dir });
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(state.report_type, "kvdf_viber_dashboard_state");
  assert.strictEqual(state.dashboard_type, "viber");
  assert.strictEqual(state.track, "vibe_app_developer");
  assert.ok(state.planner);
  assert.strictEqual(state.planner.available, true);
  assert.strictEqual(state.planner.current_plan_status, "approved");
  assert.strictEqual(state.planner.current_planner_mode, "owner");
  assert.strictEqual(state.planner.track, "framework_owner");
  assert.strictEqual(state.planner.delivery_mode, "direct_main");
  assert.strictEqual(state.planner.source_control.mode, "local_only");
  assert.strictEqual(state.planner.materialization.status, "materialized");
  assert.ok(state.planner.next_action);
  assert.ok(state.planner.version_plan);
  assert.ok(state.planner.roadmap_train_summary);
  assert.ok(state.planner.visual);
  assert.ok(state.planner.task_punch);
  assert.ok(state.planner.guidance.summary.includes("direct-to-main"));
  assert.ok(!state.sections.planner);
  assert.ok(state.sections.idea_to_evolution_pipeline);
  assert.ok(state.sections.evolutions);
  const dashboardHtml = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(dashboardHtml, /KVDF Viber Dashboard/);
  assert.match(dashboardHtml, /Viber\/App Track/);
  assert.match(dashboardHtml, /Idea-to-Evolution Pipeline/);
}));

test("dashboard state exposes vibe planner summaries after approval", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Vibe dashboard planner", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "viber", "state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(state.report_type, "kvdf_viber_dashboard_state");
  assert.strictEqual(state.dashboard_type, "viber");
  assert.strictEqual(state.track, "vibe_app_developer");
  assert.strictEqual(state.title, "KVDF Viber Dashboard");
  assert.ok(Array.isArray(state.widgets));
  assert.ok(state.sections.command_center);
  assert.ok(state.sections.idea_to_evolution_pipeline);
  assert.ok(state.sections.questionnaire);
  assert.ok(state.sections.validation_readiness);
  assert.ok(state.planner);
  assert.strictEqual(state.planner.current_plan_status, "approved");
  assert.strictEqual(state.planner.current_planner_mode, "vibe");
  assert.strictEqual(state.planner.track, "vibe_app_developer");
  assert.strictEqual(state.planner.delivery_mode, "local_first");
  assert.strictEqual(state.planner.source_control.mode, "local_only");
  assert.ok(state.planner.guidance.summary.includes("Local-first"));
  assert.ok(state.planner.guidance.notes.some((note) => /KVDF Core edits/i.test(note)));
  assert.ok(state.planner.pipeline);
  assert.ok(state.planner.roadmap_train_summary);
  assert.ok(typeof state.planner.pipeline.execution_allowed === "boolean");
  assert.ok(state.planner.pipeline.next_stage);
  assert.ok(state.planner.pipeline.stages_total >= 1);
  assert.ok(state.sections.idea_to_evolution_pipeline.widgets.some((widget) => widget.id === "viber_pipeline_readiness"));
  assert.ok(state.sections.idea_to_evolution_pipeline.widgets.some((widget) => widget.id === "viber_next_stage"));
}));

test("dashboard route aliases resolve owner and viber dashboards", () => {
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/owner"), "owner");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/framework"), "owner");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/viber"), "viber");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/vibe"), "viber");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/app"), "viber");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard"), "current");
});

test("dashboard owner and viber export the separated dashboard products", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["dashboard", "owner", "export", "--output", "owner-dashboard.html"], { cwd: dir });
  runKvdf(["dashboard", "viber", "export", "--output", "viber-dashboard.html"], { cwd: dir });
  const ownerHtml = fs.readFileSync(path.join(dir, "owner-dashboard.html"), "utf8");
  const viberHtml = fs.readFileSync(path.join(dir, "viber-dashboard.html"), "utf8");
  assert.match(ownerHtml, /KVDF Owner Dashboard/);
  assert.match(ownerHtml, /Owner Track \/ KVDF Core/);
  assert.match(ownerHtml, /Readiness Overview/);
  assert.match(ownerHtml, /Gate Matrix/);
  assert.match(ownerHtml, /Blockers/);
  assert.match(ownerHtml, /Publish Readiness/);
  assert.match(ownerHtml, /Execution Feedback/);
  assert.match(ownerHtml, /Stage Timeline/);
  assert.doesNotMatch(ownerHtml, /KVDF Viber Dashboard/);
  assert.match(viberHtml, /KVDF Viber Dashboard/);
  assert.match(viberHtml, /Viber\/App Track/);
  assert.match(viberHtml, /Readiness Overview/);
  assert.match(viberHtml, /Gate Matrix/);
  assert.match(viberHtml, /Blockers/);
  assert.match(viberHtml, /Handoff \/ Publish Readiness/);
  assert.match(viberHtml, /Execution Feedback/);
  assert.match(viberHtml, /Stage Timeline/);
  assert.doesNotMatch(viberHtml, /KVDF Owner Dashboard/);
}));

test("reports live includes planner summary when planner state exists", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Live planner summary", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  runKvdf(["planner", "materialize", "--from-current", "--json"], { cwd: dir });
  const liveReports = JSON.parse(runKvdf(["reports", "live", "--json"], { cwd: dir }).stdout);
  assert.ok(liveReports.reports.planner);
  assert.strictEqual(liveReports.reports.planner.planner_mode, "owner");
  assert.strictEqual(liveReports.reports.planner.delivery_mode, "direct_main");
  assert.strictEqual(liveReports.summary.planner, "approved");
}));

test("policy engine evaluates task gates and writes reports", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Policy task", "--acceptance", "Owner checks result"], { cwd: dir });
  assert.match(runKvdf(["policy", "list"], { cwd: dir }).stdout, /task_verification_policy/);
  const result = JSON.parse(runKvdf(["policy", "evaluate", "--task", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(result.status, "blocked");
  assert.ok(result.blockers.some((item) => item.check_id === "output_contract_complete"));
  assert.match(runKvdf(["policy", "status"], { cwd: dir }).stdout, /task-001/);
  const status = JSON.parse(runKvdf(["policy", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(status.results.some((item) => item.policy_id === "task_verification_policy" && item.subject_id === "task-001"));
  assert.match(
    runKvdf(["policy", "gate", "--task", "task-001"], { cwd: dir, expectFailure: true }).stderr,
    /Policy gate blocked/
  );
  const stored = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/policies/policy_results.json"), "utf8"));
  assert.ok(stored.results.length >= 2);
  assert.match(runKvdf(["validate", "policy"], { cwd: dir }).stdout, /policy results checked/);
  runKvdf(["policy", "report", "--output", "policy.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "policy.md"), "utf8"), /Kabeeri Policy Report/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Viber\/App Track/);
}));

test("readiness and governance reports export independent status", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Prepare checkout readiness", "--workstream", "backend"], { cwd: dir });
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Checkout", "--readiness", "needs_review", "--tasks", "task-001"], { cwd: dir });
  const readiness = JSON.parse(runKvdf(["readiness", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(readiness.report_type, "readiness");
  assert.match(readiness.status, /warning|blocked|ready/);
  assert.ok(readiness.summary.open_tasks >= 1);
  assert.ok(Array.isArray(readiness.action_items));
  assert.ok(readiness.action_items.some((item) => item.area === "tasks"));
  const governance = JSON.parse(runKvdf(["governance", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(governance.report_type, "governance");
  assert.ok(governance.summary.workstreams >= 1);
  assert.ok(Array.isArray(governance.coverage.dimensions));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "trust"));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "privacy"));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "compliance"));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "extensibility"));
  assert.ok(Array.isArray(governance.action_items));
  assert.ok(governance.action_items.some((item) => item.area === "tasks" || item.area === "owner"));
  const live = JSON.parse(runKvdf(["reports", "live", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(live.live_json_path, ".kabeeri/reports/live_reports_state.json");
  assert.strictEqual(live.live_api_path, "/__kvdf/api/reports");
  assert.strictEqual(live.reports.readiness.report_type, "readiness");
  assert.strictEqual(live.reports.governance.report_type, "governance");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/live_reports_state.json")));
  assert.match(runKvdf(["reports", "show", "task_tracker"], { cwd: dir }).stdout, /task_tracker_state/);
  runKvdf(["readiness", "report", "--output", "readiness.md"], { cwd: dir });
  runKvdf(["governance", "report", "--output", "governance.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "readiness.md"), "utf8"), /Kabeeri Readiness Report/);
  assert.match(fs.readFileSync(path.join(dir, "governance.md"), "utf8"), /Kabeeri Governance Report/);
  assert.match(fs.readFileSync(path.join(dir, "governance.md"), "utf8"), /Governance Coverage/);
}));

test("policy gates cover release handoff security and migration scopes", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, "README.md"), "# KVDF\n", "utf8");
  fs.writeFileSync(path.join(dir, "ROADMAP.md"), "# Roadmap\n", "utf8");
  fs.writeFileSync(path.join(dir, "CHANGELOG.md"), "# Changelog\n", "utf8");
  fs.mkdirSync(path.join(dir, "docs", "cli"), { recursive: true });
  fs.writeFileSync(path.join(dir, "docs", "cli", "CLI_COMMAND_REFERENCE.md"), "# Command Reference\n\nkvdf init\n", "utf8");
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Owner"], { cwd: dir, env });
  assert.match(runKvdf(["policy", "list"], { cwd: dir }).stdout, /release_policy/);
  runKvdf(["security", "scan", "--include", ".kabeeri/project.json"], { cwd: dir });
  const securityGate = JSON.parse(runKvdf(["policy", "gate", "--scope", "security"], { cwd: dir }).stdout);
  assert.strictEqual(securityGate.policy_id, "security_policy");
  assert.notStrictEqual(securityGate.status, "blocked");
  const releaseGate = JSON.parse(runKvdf(["policy", "gate", "--scope", "release", "--version", "v4.0.0"], { cwd: dir }).stdout);
  assert.strictEqual(releaseGate.policy_id, "release_policy");
  assert.notStrictEqual(releaseGate.status, "blocked");
  const publishGates = JSON.parse(runKvdf(["release", "publish-gate", "--version", "v4.0.0"], { cwd: dir }).stdout);
  assert.strictEqual(publishGates.releaseGate.policy_id, "release_policy");
  assert.strictEqual(publishGates.githubGate.policy_id, "github_write_policy");
  assert.notStrictEqual(publishGates.releaseGate.status, "blocked");
  assert.notStrictEqual(publishGates.githubGate.status, "blocked");
  runKvdf(["migration", "plan", "--id", "migration-001", "--title", "Checkout schema", "--scope", "database/orders", "--reason", "Add order metadata", "--risk", "high", "--backup", "backup-001"], { cwd: dir });
  runKvdf(["migration", "rollback-plan", "--plan", "migration-001", "--backup", "backup-001"], { cwd: dir });
  runKvdf(["migration", "check", "migration-001", "--owner-approved"], { cwd: dir });
  const migrationGate = JSON.parse(runKvdf(["policy", "gate", "--scope", "migration", "--plan", "migration-001"], { cwd: dir }).stdout);
  assert.strictEqual(migrationGate.policy_id, "migration_policy");
  assert.notStrictEqual(migrationGate.status, "blocked");
  const stripePrefix = String.fromCharCode(83, 84, 82, 73, 80, 69, 95, 83, 69, 67, 82, 69, 84, 95, 75, 69, 89);
  const stripeValue = ["sk", "test", "12345678901234567890"].join("_");
  fs.writeFileSync(path.join(dir, ".env"), `${stripePrefix}=${stripeValue}\n`, "utf8");
  runKvdf(["security", "scan", "--include", ".env"], { cwd: dir });
  assert.match(runKvdf(["policy", "gate", "--scope", "security"], { cwd: dir, expectFailure: true }).stderr, /Policy gate blocked/);
  assert.match(runKvdf(["policy", "gate", "--scope", "release", "--version", "v4.0.0"], { cwd: dir, expectFailure: true }).stderr, /latest_security_scan_not_blocked/);
}));

test("cost-aware execution creates context packs and preflights", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["pricing", "set", "--provider", "openai", "--model", "gpt-4", "--unit", "1K", "--input", "0.01", "--output", "0.03", "--cached", "0.001"], { cwd: dir });
  runKvdf(["workstream", "add", "--id", "payments", "--name", "Payments", "--paths", "app/Http/Controllers,tests/Feature,docs/payment.md"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Implement payment checkout", "--workstream", "payments", "--acceptance", "Checkout flow is reviewed"], { cwd: dir });
  const pack = JSON.parse(runKvdf(["context-pack", "create", "--task", "task-001", "--allowed-files", "app/Http/Controllers/,tests/Feature/", "--specs", "docs/payment.md", "--provider", "openai", "--model", "gpt-4", "--input-tokens", "2000", "--output-tokens", "500"], { cwd: dir }).stdout);
  assert.strictEqual(pack.task_id, "task-001");
  assert.strictEqual(pack.context_pack_id, "ctx-001");
  assert.ok(pack.compact_guidance);
  assert.strictEqual(pack.compact_guidance.recommended_model_class, "premium");
  assert.match(pack.compact_guidance.token_saving_hint, /compact guidance/i);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/ai_usage/ctx-001.context.md")));
  assert.match(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/ctx-001.context.md"), "utf8"), /Compact Guidance/);
  assert.match(runKvdf(["context-pack", "list"], { cwd: dir }).stdout, /ctx-001/);
  const route = JSON.parse(runKvdf(["model-route", "recommend", "--kind", "implementation", "--risk", "high"], { cwd: dir }).stdout);
  assert.strictEqual(route.recommended_model_class, "premium");
  const projectStartRoute = JSON.parse(runKvdf(["model-route", "recommend", "--kind", "project_start", "--risk", "low"], { cwd: dir }).stdout);
  assert.strictEqual(projectStartRoute.recommended_model_class, "cheap");
  const preflight = JSON.parse(runKvdf(["preflight", "estimate", "--task", "task-001", "--context", "ctx-001", "--provider", "openai", "--model", "gpt-4"], { cwd: dir }).stdout);
  assert.strictEqual(preflight.context_pack_id, "ctx-001");
  assert.strictEqual(preflight.approval_required, true);
  const prompt = JSON.parse(runKvdf(["prompt-pack", "compose", "react", "--task", "task-001", "--context", "ctx-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(prompt.context_pack_id, "ctx-001");
  assert.ok(prompt.compact_guidance);
  assert.strictEqual(prompt.compact_guidance.pack_name, "react");
  assert.ok(prompt.compact_guidance.next_actions.some((item) => /Compose the react pack/.test(item)));
  assert.ok(fs.existsSync(path.join(dir, prompt.output_path)));
  assert.match(fs.readFileSync(path.join(dir, prompt.output_path), "utf8"), /Compact Guidance/);
  assert.match(runKvdf(["preflight", "list"], { cwd: dir }).stdout, /preflight-001/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const packs = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/context_packs.json"), "utf8"));
  const preflightsState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/cost_preflights.json"), "utf8"));
  assert.strictEqual(packs.context_packs.length, 1);
  assert.strictEqual(preflightsState.preflights.length, 1);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Viber\/App Track/);
}));

test("handoff package generates client and owner reports", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--mode", "agile"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build public catalog", "--acceptance", "Owner can browse catalog"], { cwd: dir });
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Public catalog", "--readiness", "ready_to_demo", "--tasks", "task-001", "--audience", "Customers"], { cwd: dir });
  runKvdf(["journey", "create", "--id", "journey-001", "--name", "Catalog browsing", "--steps", "Home,Catalog,Product"], { cwd: dir });
  runKvdf(["journey", "status", "journey-001", "--status", "ready_to_show", "--ready-to-show"], { cwd: dir });
  runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-4", "--input-tokens", "1000", "--output-tokens", "500", "--cost", "0.10"], { cwd: dir });
  assert.match(runKvdf(["handoff", "package", "--id", "handoff-001", "--audience", "client"], { cwd: dir }).stdout, /Generated handoff package handoff-001/);
  for (const file of [
    "00_INDEX.md",
    "01_BUSINESS_SUMMARY.md",
    "02_TECHNICAL_SUMMARY.md",
    "03_FEATURE_READINESS.md",
    "04_PRODUCTION_PUBLISH_STATUS.md",
    "05_AI_COST_SUMMARY.md",
    "06_NEXT_ROADMAP.md"
  ]) {
    assert.ok(fs.existsSync(path.join(dir, ".kabeeri/handoff/handoff-001", file)), `${file} should exist`);
  }
  assert.match(fs.readFileSync(path.join(dir, ".kabeeri/handoff/handoff-001/01_BUSINESS_SUMMARY.md"), "utf8"), /Public catalog/);
  assert.match(runKvdf(["handoff", "list"], { cwd: dir }).stdout, /handoff-001/);
  const shown = JSON.parse(runKvdf(["handoff", "show", "handoff-001"], { cwd: dir }).stdout);
  assert.strictEqual(shown.audience, "client");
  assert.ok(shown.security_gate);
  assert.strictEqual(shown.security_gate.scope, "handoff");
  assert.strictEqual(shown.security_gate.policy_source, "default");
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const packages = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/handoff/packages.json"), "utf8"));
  assert.strictEqual(packages.packages.length, 1);
  assert.ok(packages.packages[0].security_gate);
  assert.match(fs.readFileSync(path.join(dir, ".kabeeri/handoff/handoff-001/02_TECHNICAL_SUMMARY.md"), "utf8"), /Security gate/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Viber\/App Track/);
}));

test("owner and viber dashboards include security gate widgets", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const ownerDashboard = JSON.parse(runKvdf(["dashboard", "owner", "state", "--json"], { cwd: dir }).stdout);
  const viberDashboard = JSON.parse(runKvdf(["dashboard", "viber", "state", "--json"], { cwd: dir }).stdout);
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_security_gate"));
  assert.ok(ownerDashboard.sections.governance.tables.find((table) => table.id === "owner_governance").rows.some((row) => row[0] === "Security Gate"));
  assert.ok(ownerDashboard.sections.governance.tables.find((table) => table.id === "owner_security_gate_details").rows.some((row) => row[1] === "not_required"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_app_security"));
  assert.ok(viberDashboard.sections.validation_readiness.tables.find((table) => table.id === "viber_validation").rows.some((row) => row[0] === "App Security"));
  assert.ok(viberDashboard.sections.validation_readiness.tables.find((table) => table.id === "viber_app_security_details").rows.some((row) => row[1] === "not_required"));
}));

test("owner and viber dashboards expose planner execution readiness views", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const ownerDashboard = JSON.parse(runKvdf(["dashboard", "owner", "state", "--json"], { cwd: dir }).stdout);
  const viberDashboard = JSON.parse(runKvdf(["dashboard", "viber", "state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(ownerDashboard.report_type, "kvdf_owner_dashboard_state");
  assert.strictEqual(viberDashboard.report_type, "kvdf_viber_dashboard_state");
  assert.ok(ownerDashboard.sections.readiness);
  assert.ok(viberDashboard.sections.readiness);
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_state_freshness"));
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_planner_readiness"));
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_gate_blocks"));
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_security_status"));
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_publish_readiness"));
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_ai_learning"));
  assert.ok(ownerDashboard.widgets.some((widget) => widget.id === "owner_next_safe_action"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_state_freshness"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_planner_readiness"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_gate_blocks"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_security_status"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_publish_readiness"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_ai_learning"));
  assert.ok(viberDashboard.widgets.some((widget) => widget.id === "viber_next_safe_action"));
  assert.ok(ownerDashboard.tables.owner_readiness_gates);
  assert.ok(ownerDashboard.tables.owner_readiness_blockers);
  assert.ok(ownerDashboard.tables.owner_publish_readiness);
  assert.ok(ownerDashboard.tables.owner_execution_feedback);
  assert.ok(ownerDashboard.tables.owner_stage_timeline);
  assert.ok(viberDashboard.tables.viber_readiness_gates);
  assert.ok(viberDashboard.tables.viber_readiness_blockers);
  assert.ok(viberDashboard.tables.viber_publish_readiness);
  assert.ok(viberDashboard.tables.viber_execution_feedback);
  assert.ok(viberDashboard.tables.viber_stage_timeline);
  assert.strictEqual(ownerDashboard.publish_readiness.auto_publish, false);
  assert.strictEqual(viberDashboard.publish_readiness.auto_publish, false);
  assert.strictEqual(ownerDashboard.readiness.auto_publish, false);
  assert.strictEqual(viberDashboard.readiness.auto_publish, false);
  assert.strictEqual(ownerDashboard.readiness.track, "framework_owner");
  assert.strictEqual(viberDashboard.readiness.track, "vibe_app_developer");
  assert.strictEqual(ownerDashboard.readiness.planner_mode, "owner");
  assert.strictEqual(viberDashboard.readiness.planner_mode, "vibe");
  assert.ok(ownerDashboard.readiness.source_control_mode);
  assert.ok(viberDashboard.readiness.source_control_mode);
  assert.ok(!JSON.stringify(ownerDashboard).includes("KVDF Viber Dashboard"));
  assert.ok(!JSON.stringify(viberDashboard).includes("KVDF Owner Dashboard"));
}));

test("dashboard readiness state degrades safely when planner security and learning state are missing", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.rmSync(path.join(dir, ".kabeeri", "planner.json"), { force: true });
  fs.rmSync(path.join(dir, ".kabeeri", "evolution.json"), { force: true });
  fs.rmSync(path.join(dir, ".kabeeri", "security", "security_scans.json"), { force: true });
  fs.rmSync(path.join(dir, ".kabeeri", "ai_learning", "failure_patterns.json"), { force: true });
  const ownerDashboard = JSON.parse(runKvdf(["dashboard", "owner", "state", "--json"], { cwd: dir }).stdout);
  const viberDashboard = JSON.parse(runKvdf(["dashboard", "viber", "state", "--json"], { cwd: dir }).stdout);
  assert.ok(["unknown", "warning"].includes(ownerDashboard.readiness.state_freshness));
  assert.ok(["unknown", "warning"].includes(viberDashboard.readiness.state_freshness));
  assert.ok(["unknown", "warning", "blocked"].includes(ownerDashboard.readiness.readiness_label));
  assert.ok(["unknown", "warning", "blocked"].includes(viberDashboard.readiness.readiness_label));
  assert.strictEqual(ownerDashboard.security_status, "unknown");
  assert.strictEqual(viberDashboard.security_status, "unknown");
  assert.ok(["empty", "unknown", "warning", "ready", "active"].includes(ownerDashboard.ai_learning_status.status));
  assert.ok(["empty", "unknown", "warning", "ready", "active"].includes(viberDashboard.ai_learning_status.status));
  assert.match(ownerDashboard.readiness.next_safe_action, /kvdf state resync --track owner --json/i);
  assert.match(viberDashboard.readiness.next_safe_action, /kvdf state resync --track vibe --json/i);
}));

test("security governance scans reports and blocks gates", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".kabeeri", "policies"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "policies", "security_gate_policy.json"), JSON.stringify({
    security_gate_policy_version: "1",
    default_required: true,
    strict_blocking: true,
    required_scopes: ["workspace"],
    required_tracks: [],
    required_before: [],
    blocked_statuses: ["blocked"],
    warning_statuses: ["warning"],
    missing_plugin_behavior: "warn",
    notes: ["Blocking runtime policy for governance scans."]
  }, null, 2), "utf8");
  fs.mkdirSync(path.join(dir, "config"), { recursive: true });
  fs.writeFileSync(path.join(dir, "config", "safe.txt"), "APP_NAME=Demo\n", "utf8");
  assert.strictEqual(JSON.parse(runKvdf(["security", "scan", "--include", "config/"], { cwd: dir }).stdout).status, "pass");
  const stripePrefix = String.fromCharCode(83, 84, 82, 73, 80, 69, 95, 83, 69, 67, 82, 69, 84, 95, 75, 69, 89);
  const stripeValue = ["sk", "test", "1234567890abcdef1234567890"].join("_");
  fs.writeFileSync(path.join(dir, ".env"), `${stripePrefix}=${stripeValue}\n`, "utf8");
  const blocked = JSON.parse(runKvdf(["security", "scan", "--include", ".env"], { cwd: dir }).stdout);
  assert.strictEqual(blocked.status, "blocked");
  assert.ok(blocked.findings.some((item) => item.severity === "critical"));
  const gate = JSON.parse(runKvdf(["security", "gate", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(gate.report_type, "kvdf_security_gate_state");
  assert.strictEqual(gate.status, "blocked");
  assert.strictEqual(gate.required, true);
  assert.strictEqual(gate.strict_blocking, true);
  assert.ok(gate.findings_summary.blocked > 0);
  runKvdf(["security", "report", "--id", blocked.scan_id, "--output", "security.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "security.md"), "utf8"), /Security Scan Report/);
  assert.match(runKvdf(["security", "list"], { cwd: dir }).stdout, /blocked/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const scansState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/security/security_scans.json"), "utf8"));
  assert.ok(scansState.scans.length >= 2);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Viber\/App Track/);
}));

test("blocked scenarios report surfaces blockers and warning-level scenarios in one place", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".env"), "API_KEY=sk_test_1234567890abcdef1234567890\n", "utf8");
  const securityBlocked = JSON.parse(runKvdf(["security", "scan", "--include", ".env"], { cwd: dir }).stdout);
  assert.strictEqual(securityBlocked.status, "blocked");
  const blocked = JSON.parse(runKvdf(["reports", "blocked", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(blocked.report_type, "blocked_scenarios_report");
  assert.strictEqual(blocked.summary.status, "blocked");
  assert.ok(blocked.blockers.some((item) => item.area === "security"));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/blocked_scenarios_report.json")));
  const live = JSON.parse(runKvdf(["reports", "live", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(live.blocked_scenarios.report_type, "blocked_scenarios_report");
  assert.strictEqual(live.blocked_scenarios.summary.status, "blocked");
  const shown = JSON.parse(runKvdf(["reports", "show", "blocked_scenarios"], { cwd: dir }).stdout);
  assert.strictEqual(shown.report_type, "blocked_scenarios_report");
}));

test("blocked scenarios validation reports invalid track mismatch alongside blockers", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "demo-app",
    version: "1.0.0",
    dependencies: {
      react: "^18.0.0"
    }
  }, null, 2));
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "session_track.json"), JSON.stringify({
    version: "v1",
    active: true,
    active_track: "framework_owner",
    track_label: "Framework Owner Track",
    role_gate: "owner_only",
    route_command: "kvdf evolution priorities",
    follow_up_command: "kvdf evolution temp",
    activated_features: ["evolution"],
    blocked_features: ["vibe"],
    started_from_mode: "framework_owner_development",
    active_root: dir,
    activated_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, null, 2));

  const blocked = JSON.parse(runKvdf(["reports", "blocked", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(blocked.report_type, "blocked_scenarios_report");
  assert.strictEqual(blocked.summary.status, "blocked");
  assert.ok(blocked.warnings.some((item) => item.area === "track"));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/blocked_scenarios_report.json")));

  const validation = JSON.parse(runKvdf(["validate", "blocked-scenarios", "--json"], { cwd: dir, expectFailure: true }).stdout);
  assert.strictEqual(validation.ok, false);
  assert.ok(validation.lines.some((line) => line.includes("Blocked scenarios report found")));
  assert.ok(validation.lines.some((line) => line.includes("Session track differs from current workspace context")));
  assert.ok(validation.lines.some((line) => line.includes("WARN")));
}));

test("migration safety creates plans rollback checks and reports", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const plan = JSON.parse(runKvdf(["migration", "plan", "--id", "migration-001", "--title", "Upgrade checkout schema", "--from", "v1", "--to", "v2", "--scope", "database,migrations", "--risk", "high"], { cwd: dir }).stdout);
  assert.strictEqual(plan.plan_id, "migration-001");
  assert.strictEqual(plan.risk_level, "high");
  assert.match(
    JSON.parse(runKvdf(["migration", "check", "migration-001"], { cwd: dir }).stdout).status,
    /blocked/
  );
  const rollback = JSON.parse(runKvdf(["migration", "rollback-plan", "--plan", "migration-001", "--backup", "backup-001", "--steps", "restore backup,run rollback,verify checkout"], { cwd: dir }).stdout);
  assert.strictEqual(rollback.plan_id, "migration-001");
  const checked = JSON.parse(runKvdf(["migration", "check", "migration-001", "--owner-approved"], { cwd: dir }).stdout);
  assert.notStrictEqual(checked.status, "blocked");
  runKvdf(["migration", "report", "migration-001", "--output", "migration.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "migration.md"), "utf8"), /Migration Safety Report/);
  assert.match(runKvdf(["migration", "list"], { cwd: dir }).stdout, /migration-001/);
  assert.match(runKvdf(["migration", "audit"], { cwd: dir }).stdout, /migration\.check/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const plansState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/migrations/migration_plans.json"), "utf8"));
  const checksState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/migrations/migration_checks.json"), "utf8"));
  assert.strictEqual(plansState.plans.length, 1);
  assert.ok(checksState.checks.length >= 2);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /KVDF Viber Dashboard/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Idea-to-Evolution Pipeline/);
})); 

test("customer app routes use username instead of numeric ids", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["app", "create", "--username", "3", "--name", "Numeric App"], { cwd: dir, expectFailure: true }).stderr,
    /cannot be numeric IDs/
  );
  assert.match(runKvdf(["app", "create", "--username", "customer-one", "--name", "Customer One", "--type", "frontend", "--path", "apps/customer-one"], { cwd: dir }).stdout, /\/customer\/apps\/customer-one/);
  const app = JSON.parse(runKvdf(["app", "show", "customer-one"], { cwd: dir }).stdout);
  assert.strictEqual(app.username, "customer-one");
  assert.strictEqual(app.public_url, "/customer/apps/customer-one");
  assert.strictEqual(app.path, "apps/customer-one");
  assert.strictEqual(app.app_type, "frontend");
  assert.ok(!Object.prototype.hasOwnProperty.call(app, "slug"));
  assert.match(runKvdf(["validate", "routes"], { cwd: dir }).stdout, /customer app records checked/);
}));

test("app boundary governance blocks unrelated apps and out-of-bound files", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Laravel API", "--type", "backend", "--path", "apps/api-laravel", "--product", "Store"], { cwd: dir });
  runKvdf(["app", "create", "--username", "storefront", "--name", "React Storefront", "--type", "frontend", "--path", "apps/storefront-react", "--product", "Store"], { cwd: dir });
  const project = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project.json"), "utf8"));
  assert.strictEqual(project.product_name, "Store");
  assert.match(
    runKvdf(["app", "create", "--username", "booking", "--name", "Booking App", "--type", "frontend", "--path", "apps/booking", "--product", "Booking"], { cwd: dir, expectFailure: true }).stderr,
    /separate product/
  );
  assert.match(
    runKvdf(["app", "create", "--username", "crm", "--name", "CRM", "--separate-product"], { cwd: dir, expectFailure: true }).stderr,
    /Separate products/
  );
  runKvdf(["agent", "add", "--id", "frontend-agent", "--name", "Frontend Agent", "--role", "AI Developer", "--workstreams", "public_frontend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build storefront", "--app", "storefront", "--workstream", "public_frontend"], { cwd: dir });
  const task = JSON.parse(runKvdf(["task", "status", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(task.app_username, "storefront");
  assert.deepStrictEqual(task.app_paths, ["apps/storefront-react"]);
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "frontend-agent"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "frontend-agent"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "apps/storefront-react", "--task", "task-001", "--owner", "frontend-agent"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "frontend-agent"], { cwd: dir });
  assert.match(
    runKvdf(["session", "end", "session-001", "--files", "apps/api-laravel/routes/api.php", "--summary", "Wrong app"], { cwd: dir, expectFailure: true }).stderr,
    /outside task app boundary/
  );
  runKvdf(["session", "end", "session-001", "--files", "apps/storefront-react/src/App.jsx", "--summary", "Updated storefront"], { cwd: dir });
  const apps = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/customer_apps.json"), "utf8"));
  apps.apps.find((item) => item.username === "storefront").product_name = "Booking";
  fs.writeFileSync(path.join(dir, ".kabeeri/customer_apps.json"), `${JSON.stringify(apps, null, 2)}\n`, "utf8");
  assert.match(
    runKvdf(["task", "create", "--id", "task-002", "--title", "Cross product integration", "--type", "integration", "--apps", "backend-api,storefront", "--workstream", "backend"], { cwd: dir, expectFailure: true }).stderr,
    /multiple products/
  );
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /app boundary governance checked/);
}));

test("developer app workspace layout scaffolds isolated app roots", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const created = JSON.parse(runKvdf(["app", "workspace", "create", "--slug", "storefront-web", "--name", "Storefront Web", "--type", "frontend", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(created.report_type, "developer_app_workspace_scaffold");
  assert.strictEqual(created.workspace.slug, "storefront-web");
  assert.strictEqual(created.workspace.root, "workspaces/apps/storefront-web");
  assert.strictEqual(created.validation.status, "compliant");
  assert.ok(Array.isArray(created.workspace.surface_scopes));
  for (const relative of [
    "workspaces/apps/storefront-web/.kabeeri",
    "workspaces/apps/storefront-web/src",
    "workspaces/apps/storefront-web/tests",
    "workspaces/apps/storefront-web/docs",
    "workspaces/apps/storefront-web/.kabeeri/workspace.json",
    "workspaces/apps/storefront-web/.kabeeri/project.json",
    "workspaces/apps/storefront-web/.kabeeri/tasks.json",
    "workspaces/apps/storefront-web/.kabeeri/task_trash.json",
    "workspaces/apps/storefront-web/.kabeeri/scorecards.json",
    "workspaces/apps/storefront-web/package.json"
  ]) {
    assert.ok(fs.existsSync(path.join(dir, relative)), `${relative} should exist`);
  }
  const list = JSON.parse(runKvdf(["app", "workspace", "list", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(list.report_type, "developer_app_workspaces");
  assert.ok(list.workspaces.some((item) => item.slug === "storefront-web"));
  const show = JSON.parse(runKvdf(["app", "workspace", "show", "storefront-web", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(show.report_type, "developer_app_workspace");
  assert.strictEqual(show.workspace.slug, "storefront-web");
  assert.strictEqual(show.contract.status, "compliant");
  const validation = JSON.parse(runKvdf(["app", "workspace", "validate", "storefront-web", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(validation.ok, true);
  assert.strictEqual(validation.workspace_count, 1);
  assert.strictEqual(validation.validations[0].status, "compliant");
  const scorecards = JSON.parse(runKvdf(["app", "workspace", "scorecards", "storefront-web", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(scorecards.report_type, "developer_app_scorecards");
  assert.strictEqual(scorecards.workspace_slug, "storefront-web");
  assert.ok(Array.isArray(scorecards.cards));
  assert.ok(scorecards.summary.total >= 8);
  const reviewedScorecards = JSON.parse(runKvdf(["app", "workspace", "scorecards", "storefront-web", "--review", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(reviewedScorecards.review_state.status, "reviewed");
  const lockedScorecards = JSON.parse(runKvdf(["app", "workspace", "scorecards", "storefront-web", "--lock", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lockedScorecards.review_state.status, "locked");
  fs.unlinkSync(path.join(dir, "workspaces", "apps", "storefront-web", ".kabeeri", "session_track.json"));
  const brokenValidation = JSON.parse(runKvdf(["app", "workspace", "validate", "storefront-web", "--json"], { cwd: dir, expectFailure: true }).stdout);
  assert.strictEqual(brokenValidation.ok, false);
  assert.ok(brokenValidation.validations[0].missing_paths.some((item) => item.endsWith("session_track.json")));
  const registry = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/app_workspaces.json"), "utf8"));
  assert.ok(registry.workspaces.some((item) => item.slug === "storefront-web"));
}));

test("vibe maintainer cleanup supports current, all, and lifecycle workflow scopes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["app", "workspace", "create", "--slug", "storefront-web", "--name", "Storefront Web", "--type", "frontend"], { cwd: dir });
  runKvdf(["app", "workspace", "create", "--slug", "admin-web", "--name", "Admin Web", "--type", "frontend"], { cwd: dir });
  fs.cpSync(path.join(repoRoot, "src"), path.join(dir, "src"), { recursive: true });
  fs.cpSync(path.join(repoRoot, "plugins", "vibe_maintainer"), path.join(dir, "plugins", "vibe_maintainer"), { recursive: true });
  runKvdf(["plugins", "install", "vibe-maintainer"], { cwd: dir });

  const appRoot = path.join(dir, "workspaces", "apps", "storefront-web");
  const currentCleanup = JSON.parse(runKvdf(["vibe-maintainer", "cleanup", "--json"], { cwd: appRoot }).stdout);
  assert.strictEqual(currentCleanup.report_type, "vibe_maintainer_audit");
  assert.strictEqual(currentCleanup.workflow_mode, "fast");
  assert.strictEqual(currentCleanup.scope.scope_mode, "current");
  assert.strictEqual(currentCleanup.summary.workspace_count, 1);
  assert.strictEqual(currentCleanup.next_exact_action, "kvdf vibe-maintainer approve --confirm");

  const allCleanup = JSON.parse(runKvdf(["vibe-maintainer", "slow", "--all", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(allCleanup.report_type, "vibe_maintainer_audit");
  assert.strictEqual(allCleanup.workflow_mode, "slow");
  assert.strictEqual(allCleanup.scope.scope_mode, "all");
  assert.strictEqual(allCleanup.summary.workspace_count, 2);
  assert.strictEqual(allCleanup.approval_status, "pending");

  const summary = JSON.parse(runKvdf(["vibe-maintainer", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(summary.report_type, "vibe_maintainer_summary");
  assert.strictEqual(summary.scope.scope_mode, "all");
  assert.strictEqual(summary.summary.workspace_count, 2);

  const approval = JSON.parse(runKvdf(["vibe-maintainer", "approve", "--confirm", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(approval.report_type, "vibe_maintainer_state");
  assert.strictEqual(approval.status, "approved");
  assert.strictEqual(approval.scope.scope_mode, "all");

  const execution = JSON.parse(runKvdf(["vibe-maintainer", "execute", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(execution.report_type, "vibe_maintainer_state");
  assert.strictEqual(execution.status, "executed");
  assert.strictEqual(execution.scope.scope_mode, "all");

  const finalState = JSON.parse(runKvdf(["vibe-maintainer", "finalize", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(finalState.report_type, "vibe_maintainer_state");
  assert.strictEqual(finalState.status, "completed");
  assert.strictEqual(finalState.next_exact_action, "Cleanup cycle complete.");

  const status = JSON.parse(runKvdf(["vibe-maintainer", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.report_type, "vibe_maintainer_summary");
  assert.strictEqual(status.status, "completed");
  assert.strictEqual(status.approval_status, "approved");
  assert.strictEqual(status.summary.workspace_count, 2);

  runKvdf(["plugins", "uninstall", "vibe-maintainer"], { cwd: dir });
  const disabledStatus = JSON.parse(runKvdf(["vibe-maintainer", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(disabledStatus.report_type, "vibe_maintainer_summary");
  assert.strictEqual(disabledStatus.status, "completed");
  assert.strictEqual(disabledStatus.next_exact_action, "Cleanup cycle complete.");
}));

test("developer app workspace dashboard renders the vibe developer view", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["app", "workspace", "create", "--slug", "storefront-web", "--name", "Storefront Web", "--type", "frontend"], { cwd: dir });
  const appRoot = path.join(dir, "workspaces", "apps", "storefront-web");
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: appRoot });
  const html = fs.readFileSync(path.join(appRoot, "dashboard.html"), "utf8");
  assert.match(html, /KVDF Viber Dashboard/);
  assert.match(html, /Viber\/App Track/);
  assert.match(html, /Current App \/ Workspace/);
  assert.match(html, /Idea-to-Evolution Pipeline/);
  assert.match(html, /Questionnaire \/ Intake/);
  assert.match(html, /App Plugins \/ Integrations/);
  assert.match(html, /Validation \/ Readiness/);
  assert.doesNotMatch(html, /KVDF Owner Dashboard/);
}));

test("dashboard route resolver distinguishes framework and vibe views", () => {
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard"), "current");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/index.html"), "current");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/framework"), "owner");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/framework/index.html"), "owner");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/vibe"), "viber");
  assert.strictEqual(resolveDashboardScope("/__kvdf/dashboard/vibe/index.html"), "viber");
  assert.strictEqual(resolveDashboardScope("/customer/apps/acme"), null);
});

test("owner and developer cli surfaces block the opposite track", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri/session_track.json"), JSON.stringify({
    version: "v1",
    active: true,
    active_track: "vibe_app_developer",
    track_label: "Vibe App Developer Track",
    role_gate: "app_only",
    route_command: "kvdf entry",
    follow_up_command: "kvdf resume",
    activated_features: ["vibe"],
    blocked_features: ["evolution"],
    started_from_mode: "kabeeri_user_app_workspace",
    active_root: dir,
    activated_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, null, 2));
  assert.match(
    runKvdf(["evolution", "status", "--json"], { cwd: dir, expectFailure: true }).stderr,
    /Owner-only command blocked in developer track/
  );
  assert.match(
    runKvdf(["evolution", "--help"], { cwd: dir, expectFailure: true }).stderr,
    /Owner-only command blocked in developer track/
  );
  fs.writeFileSync(path.join(dir, ".kabeeri/session_track.json"), JSON.stringify({
    version: "v1",
    active: true,
    active_track: "framework_owner",
    track_label: "Framework Owner Track",
    role_gate: "owner_only",
    route_command: "kvdf entry",
    follow_up_command: "kvdf resume",
    activated_features: ["evolution"],
    blocked_features: ["vibe"],
    started_from_mode: "framework_owner_development",
    active_root: dir,
    activated_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, null, 2));
  assert.match(
    runKvdf(["app", "workspace", "list"], { cwd: dir, expectFailure: true }).stderr,
    /Developer-only command blocked in owner track/
  );
  assert.match(runKvdf(["--help"], { cwd: dir }).stdout, /owner session active/i);
  assert.doesNotMatch(runKvdf(["--help"], { cwd: dir }).stdout, /Developer Track Commands:/);
}));

test("vscode scaffold creates workspace task files", () => withTempDir((dir) => {
  runKvdf(["vscode", "scaffold"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, ".vscode/tasks.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/extensions.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/kvdf.commands.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/kvdf-extension/package.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/kvdf-extension/extension.js")));
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".vscode/tasks.json"), "utf8"));
  assert.ok(tasks.tasks.some((task) => task.label === "KVDF: Validate"));
  const extensionPackage = JSON.parse(fs.readFileSync(path.join(dir, ".vscode/kvdf-extension/package.json"), "utf8"));
  assert.ok(extensionPackage.contributes.commands.some((command) => command.command === "kvdf.openDashboard"));
  assert.match(fs.readFileSync(path.join(dir, ".vscode/kvdf-extension/extension.js"), "utf8"), /createWebviewPanel/);
  assert.match(runKvdf(["vscode", "status"], { cwd: dir }).stdout, /present/);
}));

test("vscode integration report traces scaffolded editor bridge without writes", () => withTempDir((dir) => {
  runKvdf(["vscode", "scaffold"], { cwd: dir });
  const report = JSON.parse(runKvdf(["vscode", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "vscode_integration_report");
  assert.ok(report.workspace_tasks >= 5);
  assert.ok(report.command_palette_entries >= 5);
  assert.ok(report.extension_commands >= 4);
  assert.match(runKvdf(["vscode", "report"], { cwd: dir }).stdout, /VS Code Integration Report/);
}));

test("generator scaffolds project and exports prompt pack", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["generate", "--profile", "standard", "--output", "my-project"], { cwd: dir });
  runKvdf(["prompt-pack", "export", "react", "--output", "my-project/07_AI_CODE_PROMPTS/react"], { cwd: dir });
  runKvdf(["prompt-pack", "use", "vue", "--output", "my-project/07_AI_CODE_PROMPTS/vue"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "my-project/kabeeri.generated.json")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/00_SYSTEM_INDEX/08_PROJECT_FILES_ARCHITECTURE_AND_FOLDER_GUIDE_EN.md")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/00_SYSTEM_INDEX/08_PROJECT_FILES_ARCHITECTURE_AND_FOLDER_GUIDE_AR.md")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/01_STRATEGY_AND_BUSINESS/00_FOLDER_OWNER_QUESTIONNAIRE_EN.md")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/01_STRATEGY_AND_BUSINESS/00_FOLDER_OWNER_QUESTIONNAIRE_AR.md")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/01_STRATEGY_AND_BUSINESS/answers.md")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/07_AI_CODE_PROMPTS/react/prompt_pack_manifest.json")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/07_AI_CODE_PROMPTS/vue/prompt_pack_manifest.json")));
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.source === "generator" && task.generated_output === "my-project"));
  const tracker = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json"), "utf8"));
  assert.ok(tracker.summary.total >= 3);
}));

test("project profile routing persists profile and packs", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const route = JSON.parse(runKvdf([
    "project",
    "route",
    "--goal",
    "Build a hospital ERP with audit, multi-tenant billing, Laravel backend, and Next.js admin",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(route.selected_profile, "enterprise");
  assert.ok(route.pack_router.selected_prompt_packs.length > 0);
  assert.ok(route.intake_groups.includes("production"));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/project_profile.json")));
  const persisted = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project_profile.json"), "utf8"));
  assert.strictEqual(persisted.current_profile, "enterprise");
  assert.strictEqual(persisted.current_delivery_mode, route.delivery_mode_recommendation.recommended_mode);
  const status = JSON.parse(runKvdf(["project", "profile", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.current_profile, "enterprise");
  assert.ok(Array.isArray(status.current_scale_prompt_packs));
  assert.ok(status.current_scale_prompt_packs.length > 0);
  const report = JSON.parse(runKvdf(["project", "profile", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "project_profile_report");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/project_profile_report.json")));
  assert.strictEqual(report.current_profile, "enterprise");
  assert.ok(Array.isArray(report.current_scale_prompt_packs));
  assert.ok(report.current_scale_prompt_packs.length > 0);
  assert.ok(report.scale_pack_router);
  assert.ok(report.scale_pack_router.selected_prompt_packs.length > 0);
}));

test("prompt pack scale recommends large-system bundles", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const report = JSON.parse(runKvdf([
    "prompt-pack",
    "scale",
    "--profile",
    "enterprise",
    "--goal",
    "Build a hospital ERP with audit, multi-tenant billing, and Next.js admin",
    "--json"
  ], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "scale_specific_packs_report");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/scale_specific_packs_report.json")));
  assert.strictEqual(report.profile, "enterprise");
  assert.ok(report.selected_prompt_packs.includes("common"));
  assert.ok(report.bundle_recommendations.some((bundle) => bundle.bundle_id === "backend_scale"));
}));

test("docs generation workflow emits template catalog manifest and contracts", () => {
  runKvdf(["docs", "generate"]);
  const workflow = JSON.parse(runKvdf(["docs", "workflow", "--json"]).stdout);
  assert.strictEqual(workflow.report_type, "docs_site_generation_workflow");
  assert.ok(workflow.template_count >= 2);
  assert.ok(Array.isArray(workflow.templates));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/site/page-templates.json")));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/reports/DOCS_SITE_GENERATION_WORKFLOW.json")));
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs/site/site-manifest.json"), "utf8"));
  assert.ok(manifest.template_count >= 2);
  assert.strictEqual(manifest.page_count, manifest.pages.length);
  assert.ok(manifest.pages.some((page) => page.slug === "task-governance"));
  assert.ok(manifest.pages.some((page) => page.slug === "wordpress-development"));
  assert.ok(manifest.pages.some((page) => page.slug === "wordpress-plugins"));
  assert.ok(manifest.pages.some((page) => page.slug === "dashboard-monitoring"));
  assert.ok(manifest.pages.some((page) => page.slug === "multi-ai-governance"));
  assert.ok(manifest.pages.some((page) => page.slug === "ai-cost-control"));
  assert.ok(manifest.pages.some((page) => page.slug === "github-release"));
  assert.ok(manifest.pages.some((page) => page.slug === "ai-tool-hub"));
  assert.ok(manifest.pages.some((page) => page.slug === "vibe-developer-hub"));
  assert.ok(!manifest.pages.some((page) => page.slug === "kabeeri-developer-hub"));
  assert.ok(!manifest.pages.some((page) => page.slug === "framework-development"));
  assert.ok(!manifest.pages.some((page) => page.slug === "plugin-development"));
  assert.ok(!manifest.pages.some((page) => page.slug === "scorecards-evo"));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/site/pages/en/task-governance.html")));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/site/pages/ar/task-governance.html")));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/site/pages/en/ai-tool-hub.html")));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/site/pages/en/vibe-developer-hub.html")));
  assert.ok(!fs.existsSync(path.join(repoRoot, "docs/site/pages/en/kabeeri-developer-hub.html")));
  assert.ok(!fs.existsSync(path.join(repoRoot, "docs/site/pages/en/framework-development.html")));
  assert.ok(!fs.existsSync(path.join(repoRoot, "docs/site/pages/en/plugin-development.html")));
  assert.ok(!fs.existsSync(path.join(repoRoot, "docs/site/pages/en/scorecards-evo.html")));
  const systemManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "plugins/kvdf_dev/docs/site/site-manifest.json"), "utf8"));
  assert.strictEqual(systemManifest.page_count, systemManifest.pages.length);
  assert.ok(systemManifest.pages.some((page) => page.slug === "system-development"));
  assert.ok(systemManifest.pages.some((page) => page.slug === "methodology"));
  assert.ok(systemManifest.pages.some((page) => page.slug === "kabeeri-4-parts"));
  assert.ok(systemManifest.pages.some((page) => page.slug === "framework-development"));
  assert.ok(systemManifest.pages.some((page) => page.slug === "plugin-development"));
  assert.ok(systemManifest.pages.some((page) => page.slug === "scorecards-evo"));
  const systemIndex = fs.readFileSync(path.join(repoRoot, "plugins/kvdf_dev/docs/site/index.html"), "utf8");
  const systemPageEn = fs.readFileSync(path.join(repoRoot, "plugins/kvdf_dev/docs/site/pages/en/system-development.html"), "utf8");
  const systemPageAr = fs.readFileSync(path.join(repoRoot, "plugins/kvdf_dev/docs/site/pages/ar/system-development.html"), "utf8");
  assert.match(systemIndex, /<header class="topbar">/);
  assert.match(systemIndex, /<aside class="sidebar">/);
  assert.match(systemIndex, /assets\/css\/style\.css/);
  assert.match(systemPageEn, /<header class="topbar">/);
  assert.match(systemPageEn, /<aside class="sidebar">/);
  assert.match(systemPageEn, /assets\/css\/style\.css/);
  assert.match(systemPageAr, /<header class="topbar">/);
  assert.match(systemPageAr, /<aside class="sidebar">/);
  assert.match(systemPageAr, /assets\/css\/style\.css/);
});

test("init auto routes project profile from goal", () => withTempDir((dir) => {
  runKvdf([
    "init",
    "--goal",
    "Build a hospital ERP with audit, multi-tenant billing, Laravel backend, and Next.js admin"
  ], { cwd: dir });
  const project = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project.json"), "utf8"));
  const profile = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project_profile.json"), "utf8"));
  assert.strictEqual(project.profile, "enterprise");
  assert.strictEqual(profile.current_profile, "enterprise");
  assert.ok(Array.isArray(profile.selected_prompt_packs));
  assert.ok(profile.selected_prompt_packs.length > 0);
}));

test("create shortcut accepts profile and command aliases", () => withTempDir((dir) => {
  runKvdf(["create", "--profile", "lite", "--output", "lite-project"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "lite-project/kabeeri.generated.json")));
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--title", "Alias task"], { cwd: dir });
  assert.match(runKvdf(["tasks", "list"], { cwd: dir }).stdout, /Alias task/);
  assert.match(runKvdf(["dash", "generate"], { cwd: dir }).stdout, /dashboard/i);
}));

test("questionnaire export and acceptance review are implemented", () => withTempDir((dir) => {
  runKvdf(["questionnaire", "create", "--group", "core", "--output", "owner-questions"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "owner-questions/core/00_SYSTEM_INDEX/00_FOLDER_OWNER_QUESTIONNAIRE_EN.docx")));
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Acceptance task"], { cwd: dir });
  runKvdf(["acceptance", "create", "--task", "task-001", "--criteria", "Reviewed by Owner"], { cwd: dir });
  assert.match(runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--notes", "Looks good"], { cwd: dir }).stdout, /pass/);
  runKvdf(["acceptance", "create", "--type", "release", "--version", "v4.0.0"], { cwd: dir });
  runKvdf(["acceptance", "create", "--type", "task-completion", "--issue", "7"], { cwd: dir });
  assert.match(runKvdf(["acceptance", "list"], { cwd: dir }).stdout, /v4\.0\.0/);
  assert.match(runKvdf(["acceptance", "list"], { cwd: dir }).stdout, /7/);
  assert.match(runKvdf(["validate", "task"], { cwd: dir }).stdout, /task records checked/);
  assert.match(runKvdf(["validate", "acceptance"], { cwd: dir }).stdout, /acceptance records checked/);
}));

test("design source governance blocks raw sources until approved text spec exists", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf([
    "design", "add",
    "--id", "design-source-001",
    "--type", "figma",
    "--location", "https://figma.example/file/checkout",
    "--owner", "Client",
    "--use", "Checkout page",
    "--mode", "assisted",
    "--missing", "responsive,empty-state"
  ], { cwd: dir });
  let audit = JSON.parse(runKvdf(["design", "audit", "design-source-001"], { cwd: dir }).stdout);
  assert.strictEqual(audit.status, "blocked");
  assert.ok(audit.blockers.some((blocker) => blocker.includes("snapshot is missing")));
  assert.ok(audit.blockers.some((blocker) => blocker.includes("approved text spec is missing")));
  runKvdf(["design", "snapshot", "design-source-001", "--reference", "checkout-export-v1", "--captured-by", "designer-001"], { cwd: dir });
  runKvdf(["design", "missing-report", "--source", "design-source-001", "--items", "responsive,empty-state", "--risk", "high"], { cwd: dir });
  runKvdf(["design", "spec-create", "--source", "design-source-001", "--title", "Checkout page", "--output", "frontend_specs/checkout.page.md", "--questions", "confirm mobile layout"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "frontend_specs/checkout.page.md")));
  assert.match(runKvdf(["design", "spec-list"], { cwd: dir }).stdout, /text-spec-001/);
  runKvdf(["design", "spec-approve", "text-spec-001", "--tokens", "design_system/tokens.json"], { cwd: dir });
  runKvdf(["design", "page-create", "--spec", "text-spec-001", "--name", "Checkout page", "--output", "frontend_specs/checkout.page.md", "--states", "loading,empty,error,success"], { cwd: dir });
  assert.match(runKvdf(["design", "page-list"], { cwd: dir }).stdout, /page-spec-001/);
  runKvdf(["design", "page-approve", "page-spec-001"], { cwd: dir });
  runKvdf(["design", "component-create", "--page", "page-spec-001", "--name", "CheckoutSummary", "--variants", "default,compact"], { cwd: dir });
  assert.match(runKvdf(["design", "component-list"], { cwd: dir }).stdout, /component-contract-001/);
  runKvdf(["design", "component-approve", "component-contract-001"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Implement checkout UI", "--workstream", "public_frontend"], { cwd: dir });
  let gate = JSON.parse(runKvdf(["design", "gate", "--task", "task-001", "--page", "page-spec-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(gate.status, "blocked");
  assert.ok(gate.blockers.some((blocker) => blocker.includes("passing visual review")));
  const visualReview = JSON.parse(runKvdf(["design", "visual-review", "--page", "page-spec-001", "--task", "task-001", "--screenshots", "desktop.png,mobile.png", "--checks", "responsive,states,accessibility", "--decision", "pass", "--reviewer", "designer-001"], { cwd: dir }).stdout);
  assert.strictEqual(visualReview.decision, "pass");
  assert.match(runKvdf(["design", "visual-review-list"], { cwd: dir }).stdout, /visual-review-001/);
  gate = JSON.parse(runKvdf(["design", "gate", "--task", "task-001", "--page", "page-spec-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(gate.status, "pass");
  const governance = JSON.parse(runKvdf(["design", "governance", "--json"], { cwd: dir }).stdout);
  assert.ok(["pass", "needs_attention"].includes(governance.status));
  assert.ok(governance.checks.some((check) => check.id === "visual_reviews" && check.status));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/design_governance_report.md")));
  audit = JSON.parse(runKvdf(["design", "audit", "design-source-001"], { cwd: dir }).stdout);
  assert.strictEqual(audit.status, "pass");
  assert.match(runKvdf(["design", "list"], { cwd: dir }).stdout, /design-source-001/);
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/sources.json"), "utf8"));
  assert.strictEqual(state.sources[0].approval_status, "approved");
  const reports = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/missing_reports.json"), "utf8"));
  assert.strictEqual(reports.reports[0].risk, "high");
  const pages = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/page_specs.json"), "utf8"));
  assert.strictEqual(pages.pages[0].status, "approved");
  const components = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/component_contracts.json"), "utf8"));
  assert.strictEqual(components.components[0].status, "approved");
  const visualReviews = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/visual_reviews.json"), "utf8"));
  assert.strictEqual(visualReviews.reviews[0].review_id, "visual-review-001");
  const governanceReports = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/governance_reports.json"), "utf8"));
  assert.strictEqual(governanceReports.reports[0].report_id, governance.report_id);
  assert.match(runKvdf(["validate", "design"], { cwd: dir }).stdout, /design visual reviews checked/);
}));

test("audit list and report expose workspace events", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Audited task"], { cwd: dir });
  assert.match(runKvdf(["audit", "list"], { cwd: dir }).stdout, /task.created/);
  runKvdf(["audit", "report", "--output", "audit.md"], { cwd: dir });
  const report = fs.readFileSync(path.join(dir, "audit.md"), "utf8");
  assert.match(report, /Kabeeri Audit Report/);
  assert.match(report, /Audited task/);
}));

test("github and release commands are dry-run without confirm", () => {
  assert.match(runKvdf(["github", "issue", "sync", "--version", "v4.0.0", "--dry-run"]).stdout, /No remote GitHub changes were made/);
  assert.match(runKvdf(["release", "check", "--version", "v4.0.0"]).stdout, /Validation: (OK|FAILED)/);
  assert.match(runKvdf(["release", "check", "--version", "v4.0.0"]).stdout, /Readiness: (READY|BLOCKED)/);
  assert.match(runKvdf(["release", "check", "--version", "v4.0.0"]).stdout, /Release gate: (PASS|BLOCKED)/);
  assert.match(runKvdf(["release", "publish", "--version", "v4.0.0"]).stdout, /No remote GitHub changes were made/);
});

test("confirmed github writes are blocked by policy gate before gh writes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["github", "issue", "sync", "--version", "v4.0.0", "--confirm"], { cwd: dir, expectFailure: true }).stderr,
    /Policy gate blocked/
  );
  const stored = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/policies/policy_results.json"), "utf8"));
  assert.ok(stored.results.some((item) => item.policy_id === "github_write_policy" && item.subject_id === "github issue sync"));
  assert.match(runKvdf(["policy", "status"], { cwd: dir }).stdout, /github_write_policy/);
  assert.match(runKvdf(["validate", "policy"], { cwd: dir }).stdout, /policy definitions checked/);
}));

test("confirmed github release publish is blocked by release gate before gh writes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["github", "release", "publish", "--version", "v4.0.0", "--confirm"], { cwd: dir, expectFailure: true }).stderr,
    /Release publish blocked by readiness/
  );
  const stored = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/policies/policy_results.json"), "utf8"));
  assert.ok(!stored.results.some((item) => item.policy_id === "release_policy" && item.subject_id === "v4.0.0"));
  assert.ok(!stored.results.some((item) => item.policy_id === "github_write_policy" && item.subject_id === "github release publish"));
}));

test("github integration report traces config feedback and issue map without writes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["github", "config", "set", "--repo", "owner/repo", "--branch", "main", "--default-version", "v4.0.0"], { cwd: dir });
  const report = JSON.parse(runKvdf(["github", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "github_integration_report");
  assert.strictEqual(report.config.repo, "owner/repo");
  assert.strictEqual(report.config.branch, "main");
  assert.ok(Array.isArray(report.next_actions));
  assert.match(runKvdf(["github", "report"], { cwd: dir }).stdout, /GitHub Integration Report/);
}));

test("release check surfaces validation and release gate blockers before publish", () => {
  const previousExitCode = process.exitCode;
  const output = [];
  try {
    release("check", null, { version: "v4.0.0", strict: true }, {
      findPlan: () => ({
        version: "v4.0.0",
        file: "multi_ai_governance/milestones_and_issues.v4.0.0.json",
        data: {
          milestones: [{ title: "Milestone 1", goal: "Goal", issues: [{ title: "Issue 1" }] }],
          totals: { milestones: 1, issues: 1 }
        }
      }),
      validateRepository: () => ({
        ok: false,
        lines: ["FAIL README.md is missing", "FAIL CHANGELOG.md is missing"]
      }),
      buildReadinessReport: () => ({
        report_id: "readiness-release-001",
        report_type: "readiness",
        target: "release",
        strict: true,
        status: "blocked",
        blockers: ["No security scan has been recorded.", "Latest migration checks include blockers."],
        warnings: ["Strict release readiness treats warnings as release blockers."],
        summary: {
          tasks_total: 0,
          open_tasks: 0,
          verified_tasks: 0,
          features_total: 0,
          features_ready_to_demo: 0,
          features_ready_to_publish: 0,
          journeys_total: 0,
          journeys_ready_to_show: 0,
          policy_blockers: 0,
          migration_blockers: 1,
          security_status: "missing",
          handoff_packages: 0,
          unreviewed_ai_runs: 0,
          unresolved_captures: 0
        }
      }),
      countIssues: () => 1,
      previewPolicyGate: () => ({
        policy_id: "release_policy",
        subject_id: "v4.0.0",
        status: "blocked",
        blockers: [
          {
            check_id: "latest_security_scan_exists",
            evidence: "No security scan recorded. Run `kvdf security scan` first."
          }
        ],
        warnings: [],
        checks: []
      }),
      outputLines: (lines) => {
        output.push(...lines);
        return lines.join("\n");
      }
    });
    assert.strictEqual(process.exitCode, 1);
    assert.ok(output.includes("## Readiness"));
    assert.ok(output.includes("Readiness: BLOCKED"));
    assert.ok(output.includes("## Validation"));
    assert.ok(output.includes("## Release Gate"));
    assert.ok(output.includes("Release gate: BLOCKED"));
    assert.ok(output.some((line) => /No security scan has been recorded/.test(line)));
    assert.ok(output.some((line) => /latest_security_scan_exists/.test(line)));
    assert.ok(output.some((line) => /README\.md is missing/.test(line)));
  } finally {
    process.exitCode = previousExitCode;
  }
});

test("command deprecation ledger documents active migrated alias and duplicated surfaces", () => {
  const ledger = fs.readFileSync(path.join(repoRoot, "docs/reports/KVDF_COMMAND_DEPRECATION_LEDGER.md"), "utf8");
  const commandReference = fs.readFileSync(path.join(repoRoot, "docs/cli/CLI_COMMAND_REFERENCE.md"), "utf8");
  const capabilitiesReference = fs.readFileSync(path.join(repoRoot, "docs/SYSTEM_CAPABILITIES_REFERENCE.md"), "utf8");
  const docsSite = fs.readFileSync(path.join(repoRoot, "docs/site/assets/js/app.js"), "utf8");
  assert.match(ledger, /Active Canonical Surfaces/);
  assert.match(ledger, /Migrated Surfaces/);
  assert.match(ledger, /Compatibility Aliases/);
  assert.match(ledger, /Deprecated Surfaces/);
  assert.match(ledger, /Still Duplicating Older Entry Points/);
  assert.match(ledger, /kvdf release publish/);
  assert.match(commandReference, /Command Lifecycle Ledger/);
  assert.match(commandReference, /Folder Ownership Ledger/);
  assert.match(commandReference, /src\/cli\/index\.js/);
  assert.match(commandReference, /workspaces\/apps\/<app-slug>/);
  assert.match(capabilitiesReference, /Command Lifecycle Ledger/);
  assert.match(capabilitiesReference, /Folder Ownership Ledger/);
  assert.match(capabilitiesReference, /plugins\/kvdf_dev/);
  assert.match(capabilitiesReference, /workspaces\/apps\/<app-slug>/);
  assert.match(capabilitiesReference, /AI Entry And Track Split/);
  assert.match(capabilitiesReference, /Plugin lanes stay optional and removable/);
  assert.match(docsSite, /owner\/app\/plugin lane/);
  assert.match(docsSite, /Feature bundles can be added or removed without ambiguity/);
});

test("multi-ai queue scoring relies on roles and capabilities rather than provider bias", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  
  // Register gemini-ui-worker (UI role, gemini provider)
  runKvdf(["multi-ai", "agent", "register", "--ai", "gemini-ui-worker", "--provider", "gemini", "--role", "ui_worker", "--name", "Gemini UI"], { cwd: dir });
  
  // Register claude-coordinator (coordinator role, anthropic provider)
  runKvdf(["multi-ai", "agent", "register", "--ai", "claude-coordinator", "--provider", "anthropic", "--role", "coordinator", "--name", "Claude"], { cwd: dir });

  // Add a queue for relay/conversation without explicit --ai flag
  const queue = JSON.parse(runKvdf(["multi-ai", "queue", "add", "--title", "Handle relay inbox messages", "--description", "Manage conversation dispatch", "--json"], { cwd: dir }).stdout);
  
  // The system should pick claude-coordinator over gemini-ui-worker based on role, not provider name
  assert.strictEqual(queue.queue.ai_id, "claude-coordinator");
}));

test("multi-ai relay watch rerenders when inbox or dispatch board changes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const baseState = {
    version: "v1",
    relay_policy: {
      response_deadline_seconds: 300,
      ack_required: true,
      visible_to_owner: false
    },
    conversations: [],
    audit_trail: [],
    updated_at: null
  };
  const nextState = JSON.parse(JSON.stringify(baseState));
  nextState.conversations.push({
    conversation_id: "multi-ai-conversation-001",
    topic: "Dispatch :: Active priority :: gemini-001 :: slice-001",
    status: "open",
    participants: [
      { agent_id: "codex", role: "initiator" },
      { agent_id: "gemini-001", role: "participant" }
    ],
    messages: [
      {
        message_id: "multi-ai-message-001",
        conversation_id: "multi-ai-conversation-001",
        from_agent_id: "codex",
        to_agent_id: "gemini-001",
        body: "Dispatch task",
        status: "pending",
        reply_to_message_id: null,
        created_at: "2026-05-12T00:00:00.000Z",
        updated_at: "2026-05-12T00:00:00.000Z",
        delivered_at: null,
        acknowledged_at: null,
        responded_at: null
      }
    ],
    relay_type: "dispatch",
    sync_channel: "multi_ai",
    created_at: "2026-05-12T00:00:00.000Z",
    updated_at: "2026-05-12T00:00:01.000Z",
    last_message_id: "multi-ai-message-001",
    last_message_at: "2026-05-12T00:00:01.000Z",
    closed_at: null
  });
  const outputs = [];
  const reports = [buildMultiAiRelayReport(baseState), buildMultiAiRelayReport(nextState)];
  const result = watchMultiAiRelay(".kabeeri/multi_ai_communications.json", { iterations: 2, interval: 0 }, {
    readReport: () => reports.shift(),
    emit: (value) => outputs.push(value),
    sleep: () => {},
    clear: () => {}
  });
  assert.strictEqual(result.render_count, 2);
  assert.strictEqual(outputs.length, 2);
  assert.match(outputs[0], /Multi-AI Relay Watch/);
  assert.match(outputs[0], /Pending inbox messages: 0/);
  assert.match(outputs[1], /Pending inbox messages: 1/);
  assert.match(outputs[1], /Dispatch threads: 1/);
}));

test("multi-ai relay watch command renders a live frame", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const output = runKvdf(["multi-ai", "relay", "watch", "--iterations", "1"], { cwd: dir }).stdout;
  assert.match(output, /Multi-AI Relay Watch/);
  assert.match(output, /Pending inbox messages: 0/);
}));

test("release scenario review inspects multi-ai workspace", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Owner", "--passphrase", "secret"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "backend-agent", "--name", "Backend Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "frontend-agent", "--name", "Frontend Agent", "--role", "AI Developer", "--workstreams", "public_frontend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "admin-agent", "--name", "Admin Agent", "--role", "AI Developer", "--workstreams", "admin_frontend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Backend scenario task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "backend-agent"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "backend-agent"], { cwd: dir });
  const report = runKvdf(["release", "scenario", "--version", "v4.0.0"], { cwd: dir }).stdout;
  assert.match(report, /Multi-AI Collaboration Scenario Review/);
  assert.match(report, /backend: 1 tasks, 1 agents/);
  assert.match(report, /No scenario risks detected/);
}));

test("github sync config is locally manageable", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["github", "config", "set", "--repo", "owner/repo", "--branch", "main", "--default-version", "v4.0.0"], { cwd: dir });
  const output = runKvdf(["github", "config", "show"], { cwd: dir }).stdout;
  assert.match(output, /owner\/repo/);
  assert.match(output, /v4\.0\.0/);
  const config = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/github/sync_config.json"), "utf8"));
  assert.strictEqual(config.write_requires_confirmation, true);
}));

test("multi-ai queue handoff dispatches a new relay message to the target agent", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "leader", "start", "--ai", "leader-001"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "worker-001"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "worker-002"], { cwd: dir });
  
  runKvdf(["multi-ai", "queue", "add", "--ai", "worker-001", "--title", "Handoff test"], { cwd: dir });
  runKvdf(["multi-ai", "sync"], { cwd: dir });
  
  let inbox1 = JSON.parse(runKvdf(["multi-ai", "relay", "inbox", "--agent", "worker-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(inbox1.counts.pending_messages, 1);
  
  const queues = JSON.parse(runKvdf(["multi-ai", "queue", "list", "--json"], { cwd: dir }).stdout);
  const qid = queues.queues[0].queue_id;
  runKvdf(["multi-ai", "queue", "handoff", qid, "--to", "worker-002"], { cwd: dir });
  runKvdf(["multi-ai", "sync"], { cwd: dir });
  
  let inbox2 = JSON.parse(runKvdf(["multi-ai", "relay", "inbox", "--agent", "worker-002", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(inbox2.counts.pending_messages, 1);
}));

test("multi-ai relay inbox clear removes pending messages for a specific agent", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["multi-ai", "agent", "register", "--ai", "worker-001"], { cwd: dir });
  runKvdf(["multi-ai", "conversation", "start", "--from", "auto-leader", "--to", "worker-001", "--topic", "test", "--message", "hello"], { cwd: dir });
  
  let inbox = JSON.parse(runKvdf(["multi-ai", "relay", "inbox", "--agent", "worker-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(inbox.counts.pending_messages, 1);
  
  runKvdf(["multi-ai", "relay", "clear", "--agent", "worker-001"], { cwd: dir });
  
  inbox = JSON.parse(runKvdf(["multi-ai", "relay", "inbox", "--agent", "worker-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(inbox.counts.pending_messages, 0);
}));

test("acceptance checklist enforces mandatory AI verification guidelines", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["task", "create", "--id", "task-check-001", "--title", "AI Output Task"], { cwd: dir });
  
  runKvdf(["acceptance", "create-checklist", "--task", "task-check-001"], { cwd: dir });
  const checklist = JSON.parse(runKvdf(["acceptance", "show-checklist", "task-check-001", "--json"], { cwd: dir }).stdout);
  
  assert.strictEqual(checklist.task_id, "task-check-001");
  assert.ok(checklist.items.some(item => /test/i.test(item.question) || /Ø§Ø®ØªØ¨Ø§Ø±/.test(item.question)), "Checklist should ask for test steps");
  assert.ok(checklist.items.some(item => /secret/i.test(item.question) || /Ø£Ø³Ø±Ø§Ø±/.test(item.question)), "Checklist should ask about secrets/sensitive data");
  assert.ok(checklist.items.some(item => /beginner/i.test(item.question) || /Ù…Ø¨ØªØ¯Ø¦/.test(item.question)), "Checklist should ask if output is understandable by a beginner");
  
  assert.match(
    runKvdf(["task", "verify", "task-check-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true }).stderr,
    /Checklist incomplete/
  );
}));

test("adaptive questionnaire skips irrelevant capability areas based on project type", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.project_type", "--value", "static_site"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_users", "--value", "no"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_payments", "--value", "no"], { cwd: dir });
  
  const coverage = JSON.parse(runKvdf(["questionnaire", "coverage"], { cwd: dir }).stdout);
  
  assert.ok(coverage.areas.some(area => area.area_key === "authentication" && area.status === "not_applicable"), "Authentication skipped if no users");
  assert.ok(coverage.areas.some(area => area.area_key === "payments_billing" && area.status === "not_applicable"), "Payments skipped if no payments");
  
  const missing = JSON.parse(runKvdf(["questionnaire", "missing"], { cwd: dir }).stdout);
  assert.ok(!missing.follow_up.some(area => area.area_key === "authentication"), "Skipped areas should not be in missing follow-ups");
}));

test("runtime schema registry blocks unmapped runtime files and allows explicit example exemptions", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri", "custom_runtime_state.json"), JSON.stringify({ status: "new" }, null, 2));
  const blocked = runKvdf(["validate", "runtime-schemas"], { cwd: dir, expectFailure: true });
  assert.match(blocked.stderr || blocked.stdout, /runtime state has no schema mapping: \.kabeeri[\\/]+custom_runtime_state\.json/);

  fs.unlinkSync(path.join(dir, ".kabeeri", "custom_runtime_state.json"));
  fs.writeFileSync(path.join(dir, ".kabeeri", "custom_runtime_state.example.jsonl"), JSON.stringify({ demo: true }) + "\n");
  const allowed = JSON.parse(runKvdf(["validate", "runtime-schemas", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(allowed.ok, true);
}));

test("docs source-of-truth checks detect missing canonical documentation coverage", () => withTempDir((dir) => {
  fs.mkdirSync(path.join(dir, "cli"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docs", "cli"), { recursive: true });
  fs.writeFileSync(path.join(dir, "docs", "cli", "CLI_COMMAND_REFERENCE.md"), "# Command Reference\n\nkvdf init\n");
  fs.writeFileSync(path.join(dir, "docs", "SYSTEM_CAPABILITIES_REFERENCE.md"), "# Capability Reference\n\nQuestionnaire\n");
  const blocked = runKvdf(["validate", "docs-source-truth", "--json"], { cwd: dir, expectFailure: true });
  const report = JSON.parse(blocked.stdout);
  assert.strictEqual(report.ok, false);
  assert.ok(report.lines.some((line) => line.includes("command reference is missing")), "Should report command reference drift");
}));

test("docs source-of-truth checks pass on the canonical repository docs", () => {
  const report = JSON.parse(runKvdf(["validate", "docs-source-truth", "--json"]).stdout);
  assert.strictEqual(report.ok, true);
  assert.ok(report.lines.some((line) => line.includes("command reference source-of-truth checked")));
  assert.ok(report.lines.some((line) => line.includes("capability reference source-of-truth checked")));
});

test("historical source clarity checks pass on archived roadmap and report files", () => {
  const report = JSON.parse(runKvdf(["validate", "historical-source-clarity", "--json"]).stdout);
  assert.strictEqual(report.ok, true);
  assert.ok(report.lines.some((line) => line.includes("historical source clarity checked")));
  assert.ok(report.lines.some((line) => line.includes("historical source archive source-of-truth checked")));
});

test("capability registry exposes the canonical area map, plugins, and runtime boundaries", () => {
  const registry = JSON.parse(runKvdf(["capability", "registry", "--json"]).stdout);
  assert.strictEqual(registry.report_type, "kvdf_canonical_capability_registry");
  assert.strictEqual(registry.registry_version, "1");
  assert.ok(Array.isArray(registry.areas));
  assert.strictEqual(registry.areas.length, 4);
  assert.ok(registry.areas.some((area) => area.area_id === "core_native_system_capabilities"));
  assert.ok(registry.areas.some((area) => area.area_id === "kvdf_development_pipeline_dev"));
  assert.ok(registry.areas.some((area) => area.area_id === "vibe_development_pipeline_dev"));
  assert.ok(registry.areas.some((area) => area.area_id === "plugins_dev"));
  assert.strictEqual(registry.areas.find((area) => area.area_id === "plugins_dev").capabilities.length, 13);
  assert.ok(registry.areas.find((area) => area.area_id === "kvdf_development_pipeline_dev").capabilities.some((capability) => capability.capability_id === "direct_to_main_delivery"));
  assert.ok(registry.runtime_boundaries.some((item) => item.path === ".kabeeri/" && item.classification === "runtime_only"));
  assert.ok(!registry.runtime_boundaries.some((item) => item.path === ".kabeeri/" && item.classification === "source_code"));
  const map = JSON.parse(runKvdf(["capability", "registry", "map", "--json"]).stdout);
  assert.strictEqual(map.report_type, "kvdf_canonical_capability_registry");
  assert.strictEqual(map.total_areas, 4);
  assert.strictEqual(map.total_capabilities, registry.areas.reduce((total, area) => total + area.capabilities.length, 0));
  const nonJson = runKvdf(["capability", "registry"]).stdout;
  assert.match(nonJson, /KVDF Canonical Capability Registry/);
  assert.match(nonJson, /Core Native System Capabilities/);
  assert.match(nonJson, /Plugins Dev/);
  const billing = JSON.parse(runKvdf(["capability", "registry", "payments_billing", "--json"]).stdout);
  assert.strictEqual(billing.capability_id, "payments_billing");
  assert.ok(Array.isArray(billing.source_files));
  assert.ok(billing.source_files.some((item) => item.includes("SYSTEM_AREAS_INDEX.md")) || billing.source_files.some((item) => item.includes("docs/SYSTEM_CAPABILITIES_REFERENCE.md")));
});

test("planner layer recommends the next owner evolution and keeps direct-to-main default", () => {
  const plannerNext = JSON.parse(runKvdf(["planner", "next", "--track", "owner", "--json"]).stdout);
  assert.strictEqual(plannerNext.report_type, "kvdf_planner_next");
  assert.strictEqual(plannerNext.planner_mode, "owner");
  assert.strictEqual(plannerNext.track, "framework_owner");
  assert.strictEqual(plannerNext.delivery_mode, "direct_main");
  assert.ok(plannerNext.source_control);
  assert.strictEqual(plannerNext.source_control.provider, "git");
  assert.strictEqual(plannerNext.source_control.mode, "direct_main");
  assert.strictEqual(plannerNext.source_control.branching_enabled, false);
  assert.strictEqual(plannerNext.source_control.pr_enabled, false);
  assert.ok(plannerNext.recommended_evolution);
  assert.ok(plannerNext.recommended_evolution.title);
  assert.ok(Array.isArray(plannerNext.out_of_scope));
  assert.ok(plannerNext.out_of_scope.some((item) => /branch\/PR|runtime state under \.kabeeri/i.test(item)));
  assert.ok(Array.isArray(plannerNext.allowed_files));
  assert.ok(plannerNext.allowed_files.some((item) => item.includes("KVDF_PLANNER_LAYER.md")));
  assert.ok(Array.isArray(plannerNext.forbidden_files));
  assert.ok(plannerNext.forbidden_files.some((item) => item.includes("KVDOS/")));
  assert.ok(Array.isArray(plannerNext.validation_commands));
  assert.ok(plannerNext.validation_commands.includes("node bin/kvdf.js validate"));
  assert.ok(plannerNext.task_punch);
  assert.ok(Array.isArray(plannerNext.task_punch.tasks));
  assert.ok(plannerNext.task_punch.tasks.length >= 3);
  assert.ok(plannerNext.next_action.includes("kvdf planner evolution --goal"));
  assert.doesNotMatch(plannerNext.next_action.toLowerCase(), /branch\/pr/);
});

test("planner layer recommends the next vibe evolution with a local-first pipeline", () => {
  const plannerNext = JSON.parse(runKvdf(["planner", "next", "--track", "vibe", "--json"]).stdout);
  assert.strictEqual(plannerNext.report_type, "kvdf_planner_next");
  assert.strictEqual(plannerNext.planner_mode, "vibe");
  assert.strictEqual(plannerNext.track, "vibe_app_developer");
  assert.strictEqual(plannerNext.delivery_mode, "local_first");
  assert.ok(plannerNext.source_control);
  assert.strictEqual(plannerNext.source_control.enabled, false);
  assert.strictEqual(plannerNext.source_control.provider, "none");
  assert.strictEqual(plannerNext.source_control.mode, "local_only");
  assert.ok(Array.isArray(plannerNext.pipeline));
  assert.ok(plannerNext.pipeline.length >= 10);
  assert.ok(plannerNext.pipeline.includes("request"));
  assert.ok(plannerNext.pipeline.includes("questions"));
  assert.ok(plannerNext.pipeline.includes("answers"));
  assert.ok(plannerNext.pipeline.includes("intake_plan"));
  assert.ok(plannerNext.pipeline.includes("review"));
  assert.ok(plannerNext.pipeline.includes("approve"));
  assert.ok(plannerNext.pipeline.includes("evolution"));
  assert.ok(plannerNext.pipeline.includes("task_slicing"));
  assert.ok(plannerNext.pipeline.includes("implementation"));
  assert.ok(plannerNext.pipeline.includes("verify"));
  assert.ok(plannerNext.pipeline.includes("handoff"));
  assert.ok(plannerNext.recommended_evolution);
  assert.ok(plannerNext.recommended_evolution.reason.includes("local-first"));
  assert.ok(Array.isArray(plannerNext.out_of_scope));
  assert.ok(plannerNext.out_of_scope.some((item) => /KVDF Core edits by default|branch\/PR as the default path/i.test(item)));
  assert.ok(Array.isArray(plannerNext.allowed_files));
  assert.ok(plannerNext.allowed_files.some((item) => item.includes("workspaces/apps/")));
  assert.ok(Array.isArray(plannerNext.forbidden_files));
  assert.ok(plannerNext.forbidden_files.some((item) => item.includes("knowledge/governance/")));
  assert.ok(Array.isArray(plannerNext.validation_commands));
  assert.ok(plannerNext.validation_commands.includes("node bin/kvdf.js validate"));
  assert.ok(plannerNext.task_punch);
  assert.ok(Array.isArray(plannerNext.task_punch.tasks));
  assert.ok(plannerNext.task_punch.tasks.length >= 3);
  assert.ok(plannerNext.next_action.includes("kvdf planner evolution --goal"));
  assert.doesNotMatch(plannerNext.next_action.toLowerCase(), /branch\/pr/);
});

test("planner layer recommends the next plugin evolution with plugin context", () => {
  const plannerNext = JSON.parse(runKvdf(["planner", "next", "--track", "plugin", "--plugin", "kvdf-dev", "--json"]).stdout);
  assert.strictEqual(plannerNext.report_type, "kvdf_planner_next");
  assert.strictEqual(plannerNext.planner_mode, "plugin");
  assert.strictEqual(plannerNext.track, "plugin");
  assert.strictEqual(plannerNext.delivery_mode, "direct_main");
  assert.ok(plannerNext.source_control);
  assert.strictEqual(plannerNext.source_control.provider, "git");
  assert.strictEqual(plannerNext.source_control.mode, "direct_main");
  assert.ok(plannerNext.plugin_context);
  assert.strictEqual(plannerNext.plugin_context.plugin_id, "kvdf-dev");
  assert.ok(Array.isArray(plannerNext.allowed_files));
  assert.ok(plannerNext.allowed_files.some((item) => item.includes("plugins/kvdf_dev/plugin.json")));
  assert.ok(Array.isArray(plannerNext.forbidden_files));
  assert.ok(plannerNext.forbidden_files.some((item) => item.includes(".kabeeri/plugin-links/")));
  assert.ok(Array.isArray(plannerNext.validation_commands));
  assert.ok(plannerNext.validation_commands.includes("kvdf plugins status"));
  assert.ok(plannerNext.task_punch);
  assert.ok(Array.isArray(plannerNext.task_punch.tasks));
  assert.ok(plannerNext.task_punch.tasks.length >= 3);
  assert.ok(plannerNext.next_action.includes("kvdf planner evolution --goal"));
});

test("planner layer supports explicit branch and branch-pr source control modes", () => {
  const branchMode = JSON.parse(runKvdf(["planner", "next", "--track", "owner", "--source-control", "git", "--sc-mode", "branch", "--json"]).stdout);
  assert.strictEqual(branchMode.source_control.provider, "git");
  assert.strictEqual(branchMode.source_control.mode, "branch");
  assert.strictEqual(branchMode.source_control.branching_enabled, true);
  assert.strictEqual(branchMode.source_control.pr_enabled, false);

  const branchPrMode = JSON.parse(runKvdf(["planner", "next", "--track", "vibe", "--source-control", "git", "--remote-provider", "github", "--sc-mode", "branch-pr", "--json"]).stdout);
  assert.strictEqual(branchPrMode.source_control.remote_provider, "github");
  assert.strictEqual(branchPrMode.source_control.provider_plugin, "github");
  assert.strictEqual(branchPrMode.source_control.mode, "branch_pr");
  assert.strictEqual(branchPrMode.source_control.branching_enabled, true);
  assert.strictEqual(branchPrMode.source_control.pr_enabled, true);
  assert.ok(branchPrMode.source_control.notes.some((item) => /GitHub/i.test(item)));
});

test("planner prompt generates a codex-ready direct-to-main execution prompt for the owner track", () => {
  const plannerPrompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Add planner layer", "--track", "owner", "--json"]).stdout);
  assert.strictEqual(plannerPrompt.report_type, "kvdf_planner_codex_prompt");
  assert.strictEqual(plannerPrompt.planner_mode, "owner");
  assert.strictEqual(plannerPrompt.track, "framework_owner");
  assert.strictEqual(plannerPrompt.delivery_mode, "direct_main");
  assert.ok(plannerPrompt.prompt.includes("CODEx PROMPT — KVDF Core"));
  assert.ok(plannerPrompt.prompt.includes("Direct-to-main"));
  assert.ok(plannerPrompt.prompt.includes("Do not touch KVDOS"));
  assert.ok(plannerPrompt.prompt.includes("Allowed files:"));
  assert.ok(plannerPrompt.prompt.includes("Validation:"));
  assert.ok(plannerPrompt.prompt.includes("Stop condition:"));
  assert.ok(Array.isArray(plannerPrompt.allowed_files));
  assert.ok(Array.isArray(plannerPrompt.forbidden_files));
  assert.ok(Array.isArray(plannerPrompt.validation_commands));
});

test("planner prompt generates a codex-ready local-first execution prompt for the vibe track", () => {
  const plannerPrompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Add vibe delivery slice", "--track", "vibe", "--json"]).stdout);
  assert.strictEqual(plannerPrompt.report_type, "kvdf_planner_codex_prompt");
  assert.strictEqual(plannerPrompt.planner_mode, "vibe");
  assert.strictEqual(plannerPrompt.track, "vibe_app_developer");
  assert.strictEqual(plannerPrompt.delivery_mode, "local_first");
  assert.ok(plannerPrompt.prompt.includes("CODEx PROMPT — KVDF Vibe/App Delivery"));
  assert.ok(plannerPrompt.prompt.includes("Track: Vibe App Developer"));
  assert.ok(plannerPrompt.prompt.includes("Local-first"));
  assert.ok(plannerPrompt.prompt.includes("No branch / no PR unless explicitly enabled"));
  assert.ok(plannerPrompt.prompt.includes("Do not touch KVDF Core unless the Owner explicitly asks for framework work"));
  assert.ok(plannerPrompt.prompt.includes("request"));
  assert.ok(plannerPrompt.prompt.includes("questions"));
  assert.ok(plannerPrompt.prompt.includes("answers"));
  assert.ok(plannerPrompt.prompt.includes("intake_plan"));
  assert.ok(plannerPrompt.prompt.includes("verify"));
  assert.ok(plannerPrompt.prompt.includes("handoff"));
});

test("planner prompt generates a codex-ready plugin execution prompt", () => {
  const plannerPrompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Update plugin manifest", "--track", "plugin", "--plugin", "kvdf-dev", "--json"]).stdout);
  assert.strictEqual(plannerPrompt.report_type, "kvdf_planner_codex_prompt");
  assert.strictEqual(plannerPrompt.planner_mode, "plugin");
  assert.strictEqual(plannerPrompt.track, "plugin");
  assert.strictEqual(plannerPrompt.delivery_mode, "direct_main");
  assert.ok(plannerPrompt.prompt.includes("CODEx PROMPT — KVDF Plugin Development"));
  assert.ok(plannerPrompt.prompt.includes("Track: Plugin Development"));
  assert.ok(plannerPrompt.prompt.includes("Plugin: kvdf-dev"));
  assert.ok(plannerPrompt.prompt.includes("Do not touch KVDOS"));
  assert.ok(plannerPrompt.prompt.includes("Protect .kabeeri/plugin-links/ runtime mount state"));
  assert.ok(plannerPrompt.prompt.includes("Plugin manifest, docs, runtime, and tests must stay in parity"));
});

test("planner prompts reflect the selected source control mode", () => {
  const ownerDirectMain = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Owner direct-main source control", "--track", "owner", "--source-control", "git", "--sc-mode", "direct-main", "--json"]).stdout);
  assert.strictEqual(ownerDirectMain.source_control.mode, "direct_main");
  assert.match(ownerDirectMain.prompt, /git add -A/);
  assert.match(ownerDirectMain.prompt, /git push origin main/);
  assert.doesNotMatch(ownerDirectMain.prompt, /checkout -b/);

  const vibeLocalOnly = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Vibe local-only source control", "--track", "vibe", "--source-control", "none", "--json"]).stdout);
  assert.strictEqual(vibeLocalOnly.source_control.mode, "local_only");
  assert.match(vibeLocalOnly.prompt, /Keep the changes local/);
  assert.doesNotMatch(vibeLocalOnly.prompt, /git commit/i);
  assert.doesNotMatch(vibeLocalOnly.prompt, /git push/i);

  const branchPr = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Vibe branch PR source control", "--track", "vibe", "--source-control", "git", "--remote-provider", "github", "--sc-mode", "branch-pr", "--json"]).stdout);
  assert.strictEqual(branchPr.source_control.mode, "branch_pr");
  assert.match(branchPr.prompt, /git checkout -b/);
  assert.match(branchPr.prompt, /GitHub PR/);
  assert.match(branchPr.prompt, /Owner review/);
});

test("planner prompt blocks vibe execution until the pipeline is ready", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const prompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Build booking app", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(prompt.planner_mode, "vibe");
  assert.ok(prompt.prompt.includes("Viber Pipeline Stage Order"));
  assert.ok(prompt.prompt.includes("Docs/design gates:"));
  assert.ok(prompt.prompt.includes("Execution allowed: no"));
  assert.ok(prompt.prompt.includes("Execution is blocked until the pipeline gates pass."));
  assert.ok(prompt.prompt.includes("Complete the next docs/design stage only."));
  assert.ok(prompt.prompt.includes("Next docs/design action:"));
  assert.doesNotMatch(prompt.prompt, /edit app source files yet/i);
}));

test("planner prompts include AI learning context when learning exists and omit it when empty", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const emptyPrompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Fresh owner plan", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.ok(emptyPrompt.prompt.includes("Direct-to-main"));
  assert.doesNotMatch(emptyPrompt.prompt, /AI Learning Context/);

  runKvdf([
    "learn",
    "capture",
    "--title",
    "Track-safe warning",
    "--problem",
    "The prompt missed the current warning context",
    "--fix",
    "Include the safe warning in the prompt section",
    "--category",
    "track_confusion",
    "--track",
    "vibe",
    "--json"
  ], { cwd: dir });
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Secret token leak",
    "--problem",
    "API token leak in app notes",
    "--fix",
    "Rotate the token and keep it private",
    "--category",
    "other",
    "--track",
    "vibe",
    "--json"
  ], { cwd: dir });
  const vibePrompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Build vibe slice", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  assert.ok(vibePrompt.prompt.includes("## AI Learning Context"));
  assert.ok(vibePrompt.prompt.includes("Watch for track-safe warning."));
  assert.ok(vibePrompt.prompt.includes("Local-first"));
  assert.doesNotMatch(vibePrompt.prompt, /Secret token leak/i);
  assert.doesNotMatch(vibePrompt.prompt, /API token leak/i);
}));

test("planner prompt includes plugin learning when plugin id is provided", () => withTempDir((dir) => {
  copyPluginBundle(dir, "planner-visual");
  runKvdf([
    "learn",
    "capture",
    "--title",
    "Plugin parity warning",
    "--problem",
    "The plugin prompt skipped the plugin-specific parity note",
    "--fix",
    "Keep manifest, runtime, docs, schema, and tests aligned",
    "--category",
    "scope_violation",
    "--track",
    "plugin",
    "--json"
  ], { cwd: dir });
  const pluginPrompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Improve planner visuals", "--track", "plugin", "--plugin", "planner-visual", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginPrompt.planner_mode, "plugin");
  assert.ok(pluginPrompt.prompt.includes("## AI Learning Context"));
  assert.ok(pluginPrompt.prompt.includes("Watch for plugin parity warning."));
  assert.ok(pluginPrompt.prompt.includes("Plugin: planner-visual"));
}));

test("planner evolution returns a structured owner plan and task punch", () => {
  const plannerEvolution = JSON.parse(runKvdf(["planner", "evolution", "--goal", "Add planner layer", "--track", "owner", "--json"]).stdout);
  assert.strictEqual(plannerEvolution.report_type, "kvdf_planner_evolution_plan");
  assert.strictEqual(plannerEvolution.planner_mode, "owner");
  assert.ok(plannerEvolution.evolution_plan);
  assert.strictEqual(plannerEvolution.evolution_plan.track, "framework_owner");
  assert.strictEqual(plannerEvolution.evolution_plan.delivery_mode, "direct_main");
  assert.ok(Array.isArray(plannerEvolution.task_punch.tasks));
  assert.ok(plannerEvolution.prompt.includes("CODEx PROMPT — KVDF Core"));
});

test("planner method recommends a planning method for secure database app work", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "method", "--goal", "Build secure database app", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_method_recommendation");
  assert.strictEqual(report.planner_mode, "vibe");
  assert.ok(["structured", "hybrid"].includes(report.recommended_method));
  assert.ok(report.reason);
  assert.ok(["low", "medium", "high"].includes(report.confidence));
  assert.ok(Array.isArray(report.method_rules_matched));
  assert.ok(report.method_rules_matched.length > 0);
  assert.ok(report.delivery_recommendation);
}));

test("planner auto returns a complete owner plan without touching KVDOS", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "auto", "--goal", "Improve KVDF dashboard lifecycle", "--track", "owner", "--method", "auto", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_auto_plan");
  assert.strictEqual(report.planner_mode, "owner");
  assert.ok(["structured", "hybrid"].includes(report.planning_method));
  assert.ok(report.codex_prompt.includes("CODEx PROMPT — KVDF Core"));
  assert.ok(report.review);
  assert.ok(Array.isArray(report.documentation_files));
  assert.ok(Array.isArray(report.evolutions));
  assert.ok(Array.isArray(report.task_punches));
  assert.ok(report.visual_planning);
  assert.ok(report.source_pipeline);
  assert.ok(report.source_pipeline.evolutions.length > 0);
  assert.ok(report.source_pipeline.evolutions[0].forbidden_files.some((item) => /KVDOS/.test(item)));
}));

test("planner auto returns a vibe planning package with lifecycle stages and documentation", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "auto", "--goal", "Build booking app", "--track", "vibe", "--method", "auto", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_auto_plan");
  assert.strictEqual(report.planner_mode, "vibe");
  assert.ok(["hybrid", "structured", "agile"].includes(report.planning_method));
  assert.ok(report.source_pipeline.pipeline.includes("request"));
  assert.ok(report.source_pipeline.pipeline.includes("handoff"));
  assert.ok(report.documentation_files.length > 0);
  assert.ok(report.design_artifacts.system_design);
  assert.ok(report.version_plan.versions.length > 0);
  assert.ok(report.evolutions.length > 0);
  assert.ok(report.task_punches.length > 0);
}));

test("planner auto returns a structured plugin plan with plugin parity guidance", () => withTempDir((dir) => {
  copyPluginBundle(dir, "planner-visual");
  const report = JSON.parse(runKvdf(["planner", "auto", "--goal", "Improve planner visual plugin", "--track", "plugin", "--plugin", "planner-visual", "--method", "auto", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_auto_plan");
  assert.strictEqual(report.planner_mode, "plugin");
  assert.strictEqual(report.planning_method, "structured");
  assert.strictEqual(report.source_pipeline.plugin_context.plugin_id, "planner-visual");
  assert.ok(report.source_pipeline.documentation_files.some((item) => item.includes("plugins/planner_visual/docs/")));
  assert.ok(report.source_pipeline.evolutions[0].allowed_files.some((item) => item.includes("plugins/planner_visual")));
  assert.ok(report.source_pipeline.evolutions[0].forbidden_files.some((item) => item.includes("KVDOS")));
}));

test("planner review and resume expose current-state planning metadata", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Review planner state", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const review = JSON.parse(runKvdf(["planner", "review", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.report_type, "kvdf_planner_review");
  assert.strictEqual(review.planner_mode, "owner");
  assert.ok(review.scope_review);
  assert.ok(review.method_review);
  assert.ok(review.docs_review);
  assert.ok(review.docs_status);
  assert.ok(review.source_control_review);
  assert.ok(review.task_quality_review);
  assert.ok(review.visual_review);
  const resume = JSON.parse(runKvdf(["planner", "resume", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(resume.report_type, "kvdf_planner_resume");
  assert.ok(resume.current_plan);
  assert.ok(resume.docs_status);
  assert.ok(resume.next_recommended_action);
  assert.strictEqual(typeof resume.blocked, "boolean");
}));

test("planner review and resume stay safe when runtime state is missing", () => withTempDir((dir) => {
  const resume = JSON.parse(runKvdf(["planner", "resume", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(resume.report_type, "kvdf_planner_resume");
  assert.strictEqual(resume.current_plan, null);
  assert.ok(resume.next_recommended_action);
  assert.strictEqual(resume.blocked, true);
  assert.ok(resume.blockers.length > 0);
  const review = JSON.parse(runKvdf(["planner", "review", "--goal", "Missing state review", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.report_type, "kvdf_planner_review");
  assert.ok(["pass", "warning", "blocked"].includes(review.status));
  assert.ok(Array.isArray(review.required_fixes));
  assert.ok(review.next_action);
}));

test("planner current-state and owner boundary reports expose file-first workspace policy", () => {
  const currentState = JSON.parse(runKvdf(["planner", "current-state", "--json"]).stdout);
  assert.strictEqual(currentState.report_type, "kvdf_current_state_report");
  assert.strictEqual(currentState.workspace.kind, "kvdf_core");
  assert.strictEqual(currentState.track.active_track, "framework_owner");
  assert.ok(currentState.allowed_paths.includes("src/cli/"));
  assert.ok(currentState.forbidden_paths.includes("KVDOS/"));

  const boundary = JSON.parse(runKvdf(["planner", "boundary", "--track", "owner", "--json"]).stdout);
  assert.strictEqual(boundary.report_type, "kvdf_workspace_boundary_report");
  assert.ok(boundary.allowed_paths.includes("src/cli/"));
  assert.ok(boundary.forbidden_paths.includes("KVDOS/"));
  assert.ok(boundary.current_state_summary);
  assert.strictEqual(boundary.current_state_summary.report_type, "kvdf_current_state_report");
});

test("planner current-state treats KVDOS as an app workspace instead of KVDF Core", () => withTempDir((dir) => {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "kvdos",
    version: "1.0.0"
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, "README.md"), "# KVDOS\n", "utf8");
  const currentState = JSON.parse(runKvdf(["planner", "current-state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(currentState.report_type, "kvdf_current_state_report");
  assert.strictEqual(currentState.workspace.kind, "viber_app");
  assert.strictEqual(currentState.track.active_track, "vibe_app_developer");
  assert.ok(currentState.allowed_paths.some((item) => item.startsWith("workspaces/apps/kvdos/")));
  assert.ok(currentState.forbidden_paths.includes("src/cli/"));
}));

test("state resync returns a current-state report and persists runtime state in the temp workspace", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const report = JSON.parse(runKvdf(["state", "resync", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_current_state_report");
  assert.strictEqual(report.repo.root, dir);
  assert.strictEqual(report.repo.branch, "main");
  assert.ok(Array.isArray(report.source_of_truth_priority));
  assert.ok(report.source_of_truth_priority.length > 0);
  assert.strictEqual(report.runtime_state.supporting_only, true);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "state_resync", "current_state_report.json")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "state_resync", "state_resync_history.json")));
}));

test("planner guard blocks when no current-state report exists", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const report = JSON.parse(runKvdf(["planner", "guard", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_drift_guard");
  assert.ok(["warning", "blocked", "pass"].includes(report.status));
  assert.strictEqual(report.state_resync_required, true);
  assert.match(report.current_state_report_path, /current_state_report\.json$/);
  assert.match(report.next_action, /kvdf state resync/);
}));

test("planner next and pipeline surface state resync freshness", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const next = JSON.parse(runKvdf(["planner", "next", "--goal", "Check drift guard", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(next.report_type, "kvdf_planner_next");
  assert.ok(next.state_resync);
  assert.strictEqual(next.state_resync_required, true);
  assert.match(next.state_resync.next_action, /kvdf state resync/);
  assert.ok(next.next_action.includes("kvdf planner evolution --goal"));
  assert.ok(next.current_state_summary);
  assert.strictEqual(next.current_state_summary.report_type, "kvdf_current_state_report");

  const pipeline = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Check drift guard", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pipeline.report_type, "kvdf_idea_to_evolution_pipeline");
  assert.ok(pipeline.state_resync);
  assert.ok(pipeline.state_resync.status);
  assert.match(pipeline.state_resync.next_action, /kvdf state resync/);
  assert.strictEqual(pipeline.next_action, "Review the pipeline plan, then approve/materialize the first Evolution.");
  assert.ok(pipeline.current_state_summary);
  assert.strictEqual(pipeline.current_state_summary.report_type, "kvdf_current_state_report");
  assert.ok(pipeline.roadmap_train_summary);
  assert.ok(pipeline.roadmap_train_summary.next_action);

  const propose = JSON.parse(runKvdf(["planner", "propose", "--goal", "Check drift guard", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(propose.report_type, "kvdf_planner_proposal");
  assert.strictEqual(propose.state_resync_required, true);
  assert.ok(propose.state_resync);
  assert.match(propose.state_resync.next_action, /kvdf state resync/);
  assert.ok(propose.next_action.includes("kvdf planner approve"));
}));

test("planner boundary uses app workspace paths for vibe track and blocks core paths", () => withTempDir((dir) => {
  const boundary = JSON.parse(runKvdf(["planner", "boundary", "--track", "vibe", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(boundary.report_type, "kvdf_workspace_boundary_report");
  assert.strictEqual(boundary.status, "pass");
  assert.strictEqual(boundary.target_track, "vibe_app_developer");
  assert.ok(boundary.allowed_paths.some((item) => item.startsWith("workspaces/apps/booking/")));
  assert.ok(boundary.forbidden_paths.includes("src/cli/"));
  assert.ok(boundary.forbidden_paths.includes("KVDOS/"));
}));

test("planner boundary blocks when workspace identity is ambiguous", () => withTempDir((dir) => {
  const boundary = JSON.parse(runKvdf(["planner", "boundary", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(boundary.report_type, "kvdf_workspace_boundary_report");
  assert.strictEqual(boundary.status, "blocked");
  assert.strictEqual(boundary.workspace.kind, "unknown");
  assert.ok(boundary.next_action);
}));

test("planner stale-state classifies stale plans and generated report snapshots in a temp workspace", () => withTempDir((dir) => {
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    changes: [],
    development_priorities: [
      { id: "owner-dashboard-planner", title: "Planner Docs", status: "planned" }
    ],
    deferred_ideas: []
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({ tasks: [] }, null, 2), "utf8");
  fs.mkdirSync(path.join(dir, "docs", "reports"), { recursive: true });
  fs.writeFileSync(path.join(dir, "docs", "reports", "old-report.md"), "# snapshot", "utf8");
  const report = JSON.parse(runKvdf(["planner", "stale-state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_stale_state_report");
  assert.strictEqual(report.status, "warning");
  assert.ok(report.stale_plans.some((item) => item.id === "owner-dashboard-planner"));
  assert.ok(report.stale_reports.some((item) => item.path === "docs/reports/old-report.md"));
  assert.ok(report.stale_plans.some((item) => ["superseded", "stale", "unknown"].includes(item.classification)));
  assert.ok(Array.isArray(report.active_items));
  assert.ok(Array.isArray(report.unknown_items));
  assert.ok(Array.isArray(report.historical_items));
  assert.ok(Array.isArray(report.stale_runtime_items));
}));

test("planner next includes current-state summary for the live repo", () => {
  const next = JSON.parse(runKvdf(["planner", "next", "--goal", "Check current state flow", "--track", "owner", "--json"]).stdout);
  assert.strictEqual(next.report_type, "kvdf_planner_next");
  assert.ok(next.current_state_summary);
  assert.strictEqual(next.current_state_summary.report_type, "kvdf_current_state_report");
});

test("truth audit reports source docs runtime reconciliation data", () => {
  const report = JSON.parse(runKvdf(["truth", "audit", "--json"]).stdout);
  assert.strictEqual(report.report_type, "kvdf_truth_audit");
  assert.ok(report.generated_at);
  assert.ok(report.summary);
  assert.ok(Array.isArray(report.findings));
  assert.ok(report.findings.length > 0);
  assert.ok(report.findings.some((item) => item.feature_id === "planner.docs"));
});

test("truth feature planner docs returns source docs schema and test evidence", () => {
  const report = JSON.parse(runKvdf(["truth", "feature", "planner.docs", "--json"]).stdout);
  assert.strictEqual(report.report_type, "kvdf_truth_feature");
  assert.strictEqual(report.feature_id, "planner.docs");
  assert.strictEqual(report.status, "implemented");
  assert.ok(report.source_evidence.length > 0);
  assert.ok(report.docs_evidence.length > 0);
  assert.ok(report.schema_evidence.length > 0);
  assert.ok(report.test_evidence.length > 0);
  assert.ok(report.support_complete);
});

test("truth feature does not treat docs-only evidence as implemented", () => withTempDir((dir) => {
  fs.mkdirSync(path.join(dir, "docs", "cli"), { recursive: true });
  fs.writeFileSync(path.join(dir, "docs", "cli", "CLI_COMMAND_REFERENCE.md"), "kvdf planner docs catalog --json\n", "utf8");
  const report = JSON.parse(runKvdf(["truth", "feature", "planner.docs", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_truth_feature");
  assert.strictEqual(report.feature_id, "planner.docs");
  assert.strictEqual(report.status, "documented_but_not_implemented");
  assert.strictEqual(report.source_evidence.length, 0);
  assert.ok(report.docs_evidence.length > 0);
}));

test("planner truth detects the implemented planner surfaces without flagging them missing", () => withTempDir((dir) => {
  copyRepoFile(dir, "src/cli/commands/planner.js");
  const report = JSON.parse(runKvdf(["planner", "truth", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_truth");
  const detected = new Map(report.planner_commands_detected.map((item) => [item.feature_id, item]));
  for (const expected of ["planner.method", "planner.auto", "planner.review", "planner.resume", "planner.docs", "planner.version", "planner.feedback"]) {
    assert.ok(detected.has(expected), `Missing planner truth detection for ${expected}`);
    assert.notStrictEqual(detected.get(expected).status, "planned", `${expected} should not be marked planned`);
  }
  assert.ok(Array.isArray(report.planner_docs_detected));
  assert.ok(Array.isArray(report.planner_schemas_detected));
  assert.ok(Array.isArray(report.planner_tests_detected));
  assert.strictEqual(report.status, "pass");
}));

test("evolution reconcile handles missing runtime state and detects stale or duplicate runtime links", () => withTempDir((dir) => {
  copyRepoFile(dir, "src/cli/commands/planner.js");
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    changes: [
      { change_id: "evo-1", title: "Planner docs", status: "planned", task_ids: ["task-1"] },
      { change_id: "evo-2", title: "Planner docs follow-up", status: "planned", task_ids: ["task-1"] }
    ],
    development_priorities: [
      { id: "priority-1", title: "Planner docs", status: "planned" }
    ],
    deferred_ideas: []
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(dir, ".kabeeri", "tasks.json"), JSON.stringify({
    tasks: [
      { id: "task-1", title: "Planner docs slice", status: "in_progress" }
    ]
  }, null, 2), "utf8");
  const report = JSON.parse(runKvdf(["evolution", "reconcile", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_evolution_reconciliation");
  assert.ok(report.stale_planned.length > 0);
  assert.ok(report.duplicate_task_links.length > 0);
  assert.ok(Array.isArray(report.orphan_tasks));
  assert.ok(Array.isArray(report.runtime_only_evolutions));
  assert.ok(report.recommended_cleanup_actions.length > 0);
}));

test("truth audit keeps runtime-only items out of the implemented bucket", () => withTempDir((dir) => {
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".kabeeri", "evolution.json"), JSON.stringify({
    changes: [
      { change_id: "evo-runtime-only", title: "Ghost capability", status: "planned", task_ids: [] }
    ],
    development_priorities: [],
    deferred_ideas: []
  }, null, 2), "utf8");
  const report = JSON.parse(runKvdf(["truth", "audit", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_truth_audit");
  assert.ok(report.summary.runtime_only > 0);
  assert.ok(report.findings.some((item) => item.status === "runtime_only"));
  assert.ok(!report.findings.some((item) => item.feature_id === "ghost-capability" && item.status === "implemented"));
}));

test("planner docs catalog returns foldered catalog entries", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "docs", "catalog", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.catalog_type, "kvdf_planner_docs_catalog");
  assert.deepStrictEqual(report.folder_categories, ["product", "architecture", "database", "ui-ux", "api", "security", "delivery", "dependencies"]);
  const docIds = report.docs.map((doc) => doc.doc_id);
  for (const expected of ["prd", "erd", "system_design", "database_schema", "ui_ux_design", "api_specification", "security_design", "version_plan", "evolutions", "task_punches"]) {
    assert.ok(docIds.includes(expected), `Missing catalog doc ${expected}`);
  }
}));

test("planner docs plan marks structured vibe docs as required when the app needs secure data", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "docs", "plan", "--idea", "Build booking app with payments and admin", "--track", "vibe", "--method", "structured", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_plan");
  assert.strictEqual(report.planning_method, "structured");
  const docsById = new Map(report.docs.map((doc) => [doc.doc_id, doc]));
  for (const expected of ["prd", "srs", "erd", "database_schema", "api_specification", "security_design", "ui_ux_design", "version_plan", "evolutions", "task_punches"]) {
    assert.ok(docsById.has(expected), `Missing required doc ${expected}`);
    assert.ok(["planned", "generated"].includes(docsById.get(expected).status), `Unexpected status for ${expected}`);
  }
  assert.strictEqual(docsById.get("erd").pipeline_stage, "database_design");
  assert.strictEqual(docsById.get("database_schema").pipeline_stage, "database_design");
  assert.ok(report.stage_status.database_design);
}));

test("planner docs plan keeps agile landing page docs light and defers heavy docs", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "docs", "plan", "--idea", "Build landing page MVP", "--track", "vibe", "--method", "agile", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_plan");
  const docsById = new Map(report.docs.map((doc) => [doc.doc_id, doc]));
  for (const expected of ["prd", "scope", "personas", "jtbd", "feature_breakdown", "acceptance_criteria", "ui_ux_design", "version_plan", "evolutions", "task_punches"]) {
    assert.ok(["planned", "generated"].includes(docsById.get(expected).status), `Unexpected agile status for ${expected}`);
  }
  for (const deferred of ["erd", "database_schema", "api_specification", "security_design", "threat_model"]) {
    assert.strictEqual(docsById.get(deferred).status, "not_applicable", `${deferred} should be deferred for a landing page MVP`);
  }
}));

test("planner docs plan keeps hybrid booking app docs as structured foundation plus agile execution", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "docs", "plan", "--idea", "Build SaaS booking app", "--track", "vibe", "--method", "hybrid", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_plan");
  const docsById = new Map(report.docs.map((doc) => [doc.doc_id, doc]));
  for (const required of ["prd", "srs", "system_design", "ui_ux_design", "version_plan", "evolutions", "task_punches"]) {
    assert.ok(["planned", "generated"].includes(docsById.get(required).status), `Missing hybrid requirement ${required}`);
  }
  assert.ok(["planned", "generated"].includes(docsById.get("erd").status));
  assert.ok(["planned", "generated"].includes(docsById.get("database_schema").status));
  assert.ok(report.stage_status.system_design);
  assert.ok(report.stage_status.database_design);
}));

test("planner docs materialization writes foldered app docs without touching KVDF Core docs", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_materialization");
  assert.strictEqual(report.status, "draft");
  for (const relative of [
    "workspaces/apps/booking/docs/product/PRD.md",
    "workspaces/apps/booking/docs/architecture/SYSTEM_DESIGN.md",
    "workspaces/apps/booking/docs/database/ERD.md",
    "workspaces/apps/booking/docs/database/DATABASE_SCHEMA.md",
    "workspaces/apps/booking/docs/ui-ux/UI_UX_DESIGN.md",
    "workspaces/apps/booking/docs/api/API_SPECIFICATION.md",
    "workspaces/apps/booking/docs/security/SECURITY_DESIGN.md",
    "workspaces/apps/booking/docs/delivery/VERSION_PLAN.md",
    "workspaces/apps/booking/docs/delivery/EVOLUTIONS.md",
    "workspaces/apps/booking/docs/delivery/TASK_PUNCHES.md"
  ]) {
    assert.ok(fs.existsSync(path.join(dir, relative)), `Missing materialized doc ${relative}`);
  }
  assert.ok(!fs.existsSync(path.join(dir, "docs", "workflows", "PLANNER_SELF_PLANNING_ENGINE.md")));
}));

test("planner docs materialization skips existing docs unless forced", () => withTempDir((dir) => {
  const first = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--json"], { cwd: dir }).stdout);
  assert.ok(first.docs_created.length > 0);
  const second = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--json"], { cwd: dir }).stdout);
  assert.ok(second.docs_skipped.length > 0);
  const forced = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--force", "--json"], { cwd: dir }).stdout);
  assert.ok(forced.docs_updated.length > 0);
}));

test("planner docs status reports counts and stage state", () => withTempDir((dir) => {
  runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--json"], { cwd: dir });
  const status = JSON.parse(runKvdf(["planner", "docs", "status", "--track", "vibe", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.report_type, "kvdf_planner_docs_status");
  assert.ok(status.required_total > 0);
  assert.ok(status.existing_total > 0);
  assert.ok(status.missing_total >= 0);
  assert.ok(status.applied_total >= 0);
  assert.ok(status.stage_status.system_design);
  assert.ok(["partial", "complete", "missing", "blocked"].includes(status.status));
}));

test("planner docs apply-stage marks materialized docs as applied when the stage exists", () => withTempDir((dir) => {
  runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--json"], { cwd: dir });
  const result = JSON.parse(runKvdf(["planner", "docs", "apply-stage", "--track", "vibe", "--app", "booking", "--stage", "system_design", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(result.report_type, "kvdf_planner_docs_apply_stage");
  assert.ok(result.docs.some((doc) => doc.pipeline_stage === "system_design" && doc.applied));
  assert.ok(result.stage_status.system_design);
  assert.ok(["pass", "warning"].includes(result.status));
}));

test("planner docs review reports missing and not-applied docs", () => withTempDir((dir) => {
  runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--json"], { cwd: dir });
  const review = JSON.parse(runKvdf(["planner", "docs", "review", "--track", "vibe", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.report_type, "kvdf_planner_docs_review");
  assert.ok(Array.isArray(review.missing_required_docs));
  assert.ok(Array.isArray(review.not_applied_docs));
  assert.ok(Array.isArray(review.stage_blockers));
  assert.ok(["pass", "warning", "blocked"].includes(review.status));
  assert.ok(review.next_action);
}));

test("planner docs materialization writes the expected foldered app UI UX doc path", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_materialization");
  assert.ok(report.docs_created.includes("workspaces/apps/booking/docs/ui-ux/UI_UX_DESIGN.md"));
  assert.ok(fs.existsSync(path.join(dir, "workspaces", "apps", "booking", "docs", "ui-ux", "UI_UX_DESIGN.md")));
  assert.ok(!fs.existsSync(path.join(dir, "docs", "ui-ux", "UI_UX_DESIGN.md")));
}));

test("planner docs materialization requires an app slug for vibe track unless dry-run", () => withTempDir((dir) => {
  const failure = runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--method", "hybrid", "--json"], { cwd: dir, expectFailure: true });
  assert.match(failure.stderr, /Missing app slug/i);
  const dryRun = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--method", "hybrid", "--dry-run", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(dryRun.report_type, "kvdf_planner_docs_materialization");
  assert.strictEqual(dryRun.status, "draft");
  assert.ok(Array.isArray(dryRun.docs_created));
}));

test("planner docs materialization creates plugin drafts only under the selected plugin", () => withTempDir((dir) => {
  copyPluginBundle(dir, "planner-visual");
  const report = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Improve planner visual plugin", "--track", "plugin", "--plugin", "planner-visual", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_materialization");
  assert.ok(report.docs_created.every((item) => item.startsWith("plugins/planner_visual/docs/")));
  assert.ok(fs.existsSync(path.join(dir, "plugins", "planner_visual", "docs", "product", "PRD.md")));
  assert.ok(fs.existsSync(path.join(dir, "plugins", "planner_visual", "docs", "delivery", "VERSION_PLAN.md")));
  assert.ok(!fs.existsSync(path.join(dir, "workspaces", "apps", "booking", "docs", "product", "PRD.md")));
}));

test("planner prompt from current exposes planning method docs and review metadata", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Prompt planner state", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const prompt = JSON.parse(runKvdf(["planner", "prompt", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(prompt.report_type, "kvdf_planner_codex_prompt");
  assert.ok(prompt.planning_method);
  assert.ok(prompt.docs_status);
  assert.ok(Array.isArray(prompt.validation_commands));
  assert.ok(Array.isArray(prompt.allowed_files));
  assert.ok(Array.isArray(prompt.forbidden_files));
  assert.ok(prompt.stop_condition);
  assert.ok(prompt.review);
  assert.ok(prompt.docs_status);
  assert.ok(prompt.prompt.includes("Planning method:"));
  assert.ok(prompt.prompt.includes("Docs status:"));
  assert.ok(prompt.prompt.includes("Security gate:"));
  assert.ok(prompt.prompt.includes("Allowed files:"));
  assert.ok(prompt.prompt.includes("Forbidden files:"));
  assert.ok(prompt.prompt.includes("Stop condition:"));
}));

test("planner train build creates an owner FIFO roadmap train with queued versions and evolutions", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "train", "build", "--track", "owner", "--goal", "Improve KVDF planner", "--method", "structured", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_roadmap_train");
  assert.strictEqual(report.train_type, "owner");
  assert.strictEqual(report.track, "framework_owner");
  assert.strictEqual(report.planning_method, "structured");
  assert.ok(Array.isArray(report.major_versions) && report.major_versions.length > 0);
  assert.ok(Array.isArray(report.fifo_queue) && report.fifo_queue.length > 0);
  assert.ok(report.roadmap_train_summary);
  assert.strictEqual(report.roadmap_train_summary.train_type, "owner");
  assert.ok(Array.isArray(report.evo_sprint_queue));
  assert.ok(report.next_evolution_id);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "owner_roadmap_train.json")));
}));

test("planner train build creates a viber release train with app workspace runtime state", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "train", "build", "--track", "vibe", "--app", "booking", "--idea", "Build booking app", "--method", "hybrid", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_roadmap_train");
  assert.strictEqual(report.train_type, "viber");
  assert.strictEqual(report.track, "vibe_app_developer");
  assert.strictEqual(report.planning_method, "hybrid");
  assert.ok(Array.isArray(report.major_versions) && report.major_versions.length > 0);
  assert.ok(Array.isArray(report.fifo_queue) && report.fifo_queue.length > 0);
  assert.ok(report.roadmap_train_summary);
  assert.strictEqual(report.roadmap_train_summary.train_type, "viber");
  assert.ok(Array.isArray(report.evo_sprint_queue));
  assert.ok(report.next_evolution_id);
  assert.ok(fs.existsSync(path.join(dir, "workspaces", "apps", "booking", ".kabeeri", "release_train.json")));
}));

test("planner train build preserves agile versus structured method metadata", () => withTempDir((dir) => {
  const agile = JSON.parse(runKvdf(["planner", "train", "build", "--track", "vibe", "--app", "landing", "--idea", "Build landing page MVP", "--method", "agile", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(agile.planning_method, "agile");
  assert.ok(agile.major_versions[0].stages[0].planning_method === "agile");
  const structured = JSON.parse(runKvdf(["planner", "train", "build", "--track", "owner", "--goal", "Improve validation and security gates", "--method", "structured", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(structured.planning_method, "structured");
  assert.ok(structured.major_versions[0].stages[0].gates.docs);
  assert.ok(structured.major_versions[0].stages[0].gates.validation);
}));

test("planner train next and advance follow FIFO order", () => withTempDir((dir) => {
  runKvdf(["planner", "train", "build", "--track", "owner", "--goal", "Improve KVDF planner", "--method", "structured", "--json"], { cwd: dir });
  const next = JSON.parse(runKvdf(["planner", "train", "next", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(next.report_type, "kvdf_roadmap_train_next");
  assert.ok(next.next_evolution_id);
  assert.ok(next.next_evolution);
  assert.ok(next.roadmap_train_summary);
  const advanced = JSON.parse(runKvdf(["planner", "train", "advance", "--track", "owner", "--evolution", next.next_evolution_id, "--status", "completed", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(advanced.report_type, "kvdf_roadmap_train_advanced");
  assert.strictEqual(advanced.evolution_id, next.next_evolution_id);
  const status = JSON.parse(runKvdf(["planner", "train", "status", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.report_type, "kvdf_roadmap_train");
  assert.ok(status.next_evolution_id === null || status.next_evolution_id !== next.next_evolution_id);
}));

test("planner train visual shows the full planning engine to gates chain", () => withTempDir((dir) => {
  runKvdf(["planner", "train", "build", "--track", "owner", "--goal", "Improve KVDF planner", "--method", "structured", "--json"], { cwd: dir });
  const visual = JSON.parse(runKvdf(["planner", "train", "visual", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visual.report_type, "kvdf_roadmap_train_visual");
  assert.ok(visual.diagram.includes("Planning Engine"));
  assert.ok(visual.diagram.includes("Major Versions"));
  assert.ok(visual.diagram.includes("Version Stages"));
  assert.ok(visual.diagram.includes("Evo Sprints"));
  assert.ok(visual.diagram.includes("Evolutions"));
  assert.ok(visual.diagram.includes("Tasks"));
  assert.ok(visual.diagram.includes("Gates"));
  assert.ok(visual.roadmap_train_summary);
}));

test("planner train readiness returns owner and viber gate summaries", () => withTempDir((dir) => {
  runKvdf(["planner", "train", "build", "--track", "owner", "--goal", "Improve KVDF planner", "--method", "structured", "--json"], { cwd: dir });
  const ownerReadiness = JSON.parse(runKvdf(["planner", "train", "readiness", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(ownerReadiness.report_type, "kvdf_roadmap_train_readiness");
  assert.ok(ownerReadiness.gates.docs);
  assert.ok(ownerReadiness.gates.validation);
  assert.ok(ownerReadiness.roadmap_train_summary);
  runKvdf(["planner", "train", "build", "--track", "vibe", "--app", "booking", "--idea", "Build booking app", "--method", "hybrid", "--json"], { cwd: dir });
  const vibeReadiness = JSON.parse(runKvdf(["planner", "train", "readiness", "--track", "vibe", "--app", "booking", "--version", "v1.0.0", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(vibeReadiness.report_type, "kvdf_roadmap_train_readiness");
  assert.ok(vibeReadiness.gates.docs);
  assert.ok(vibeReadiness.gates.evolution);
  assert.ok(vibeReadiness.gates.publish);
  assert.ok(vibeReadiness.roadmap_train_summary);
}));

test("planner train commands stay safe when runtime state is missing", () => withTempDir((dir) => {
  const status = JSON.parse(runKvdf(["planner", "train", "status", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(status.report_type, "kvdf_roadmap_train");
  assert.ok(status.next_action);
  const next = JSON.parse(runKvdf(["planner", "train", "next", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(next.report_type, "kvdf_roadmap_train_next");
  assert.ok(next.next_action);
  const visual = JSON.parse(runKvdf(["planner", "train", "visual", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visual.report_type, "kvdf_roadmap_train_visual");
  assert.ok(Array.isArray(visual.summary));
  const readiness = JSON.parse(runKvdf(["planner", "train", "readiness", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(readiness.report_type, "kvdf_roadmap_train_readiness");
  assert.ok(readiness.next_action);
  assert.ok(readiness.roadmap_train_summary);
}));

test("planner propose persists a proposed plan in runtime state", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const result = JSON.parse(runKvdf(["planner", "propose", "--goal", "Add planner approval gate", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(result.report_type, "kvdf_planner_proposal");
  assert.strictEqual(result.status, "proposed");
  assert.strictEqual(result.planner_mode, "owner");
  assert.strictEqual(result.track, "framework_owner");
  assert.strictEqual(result.delivery_mode, "direct_main");
  assert.ok(result.visual);
  assert.strictEqual(result.visual.report_type, "kvdf_planner_visual");
  assert.ok(result.plan_id);
  const statePath = path.join(dir, ".kabeeri", "planner.json");
  assert.ok(fs.existsSync(statePath));
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  assert.strictEqual(state.planner_version, "1");
  assert.strictEqual(state.current_plan_id, null);
  assert.strictEqual(state.plans.length, 1);
  assert.strictEqual(state.plans[0].plan_id, result.plan_id);
  assert.strictEqual(state.plans[0].status, "proposed");
  assert.ok(state.plans[0].source_control);
  assert.strictEqual(state.plans[0].source_control.mode, "direct_main");
  assert.ok(state.plans[0].visual);
  assert.strictEqual(state.plans[0].visual.report_type, "kvdf_planner_visual");
}));

test("planner approve promotes a proposed plan and marks it current", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Add planner approval gate", "--track", "owner", "--json"], { cwd: dir }).stdout);
  const approval = JSON.parse(runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(approval.report_type, "kvdf_planner_approved");
  assert.strictEqual(approval.plan_id, proposal.plan_id);
  assert.strictEqual(approval.status, "approved");
  assert.strictEqual(approval.current_plan_id, proposal.plan_id);
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "planner.json"), "utf8"));
  assert.strictEqual(state.current_plan_id, proposal.plan_id);
  assert.strictEqual(state.plans[0].status, "approved");
  assert.strictEqual(state.plans[0].approved_by, "local-owner");
  assert.ok(state.plans[0].approved_at);
}));

test("planner current returns the approved plan and prompt from current reuses approved runtime state", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Add planner approval gate", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const current = JSON.parse(runKvdf(["planner", "current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(current.report_type, "kvdf_planner_current");
  assert.strictEqual(current.status, "approved");
  assert.ok(current.current_plan);
  assert.strictEqual(current.current_plan.plan_id, proposal.plan_id);
  assert.ok(current.current_plan.source_control);
  assert.strictEqual(current.current_plan.source_control.mode, "direct_main");
  assert.ok(current.current_plan.visual);
  assert.strictEqual(current.current_plan.visual.report_type, "kvdf_planner_visual");
  const prompt = JSON.parse(runKvdf(["planner", "prompt", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(prompt.report_type, "kvdf_planner_codex_prompt");
  assert.strictEqual(prompt.plan_id, proposal.plan_id);
  assert.ok(prompt.prompt.includes("CODEx PROMPT"));
  assert.ok(prompt.prompt.includes("Direct-to-main"));
  assert.ok(prompt.prompt.includes("Validation:"));
  assert.ok(prompt.prompt.includes("Stop condition:"));
  const visual = JSON.parse(runKvdf(["planner", "visual", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visual.report_type, "kvdf_planner_visual");
  assert.strictEqual(visual.graph.format, "mermaid");
  assert.strictEqual(visual.goal, proposal.goal || "Add planner approval gate");
}));

test("planner reject records the rejection reason and clears the current plan when needed", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Skip this planner slice", "--track", "owner", "--json"], { cwd: dir }).stdout);
  const rejection = JSON.parse(runKvdf(["planner", "reject", proposal.plan_id, "--reason", "Not now", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(rejection.report_type, "kvdf_planner_rejected");
  assert.strictEqual(rejection.plan_id, proposal.plan_id);
  assert.strictEqual(rejection.status, "rejected");
  assert.strictEqual(rejection.rejection_reason, "Not now");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "planner.json"), "utf8"));
  assert.strictEqual(state.current_plan_id, null);
  assert.strictEqual(state.plans[0].status, "rejected");
  assert.strictEqual(state.plans[0].rejection_reason, "Not now");
}));

test("planner complete closes an approved plan and clears the current plan", () => withTempDir((dir) => {
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Finish planner slice", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const completion = JSON.parse(runKvdf(["planner", "complete", proposal.plan_id, "--note", "Done", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(completion.report_type, "kvdf_planner_completed");
  assert.strictEqual(completion.plan_id, proposal.plan_id);
  assert.strictEqual(completion.status, "completed");
  assert.strictEqual(completion.current_plan_id, null);
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "planner.json"), "utf8"));
  assert.strictEqual(state.current_plan_id, null);
  assert.strictEqual(state.plans[0].status, "completed");
  assert.ok(state.plans[0].completed_at);
  assert.strictEqual(state.plans[0].completion_note, "Done");
  const current = JSON.parse(runKvdf(["planner", "current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(current.status, "empty");
  assert.strictEqual(current.current_plan, null);
  const rejectCompleted = runKvdf(["planner", "reject", proposal.plan_id, "--reason", "Too late", "--json"], { cwd: dir, expectFailure: true });
  assert.match(rejectCompleted.stderr, /completed/i);
}));

test("planner materialize creates evolution and task runtime records from an approved owner plan", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Materialize owner plan", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const materialization = JSON.parse(runKvdf(["planner", "materialize", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(materialization.report_type, "kvdf_planner_materialization");
  assert.strictEqual(materialization.plan_id, proposal.plan_id);
  assert.strictEqual(materialization.planner_mode, "owner");
  assert.strictEqual(materialization.track, "framework_owner");
  assert.strictEqual(materialization.delivery_mode, "direct_main");
  assert.strictEqual(materialization.source_control.mode, "direct_main");
  assert.strictEqual(materialization.status, "materialized");
  assert.ok(materialization.evolution.change_id);
  assert.strictEqual(materialization.evolution.planner_plan_id, proposal.plan_id);
  assert.ok(Array.isArray(materialization.task_punch.task_ids));
  assert.ok(materialization.task_punch.tasks_created > 0);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "evolution.json")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "tasks.json")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", `planner_materialization_${proposal.plan_id}.json`)));
  const plannerState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "planner.json"), "utf8"));
  const currentPlan = plannerState.plans.find((item) => item.plan_id === proposal.plan_id);
  assert.ok(currentPlan.materialized_at);
  assert.strictEqual(currentPlan.materialization_status, "materialized");
  assert.ok(currentPlan.evolution_change_id);
  assert.ok(Array.isArray(currentPlan.materialized_task_ids));
  assert.ok(currentPlan.materialization_report_path.includes(`planner_materialization_${proposal.plan_id}.json`));
  assert.ok(currentPlan.source_control);
  assert.strictEqual(currentPlan.source_control.mode, "direct_main");
  const evolutionState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "evolution.json"), "utf8"));
  const evolutionChange = evolutionState.changes.find((item) => item.planner_plan_id === proposal.plan_id);
  assert.ok(evolutionChange);
  assert.strictEqual(evolutionChange.status, "planned");
  assert.strictEqual(evolutionChange.source, "planner");
  assert.ok(Array.isArray(evolutionChange.task_ids));
  const tasksState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8"));
  const plannerTasks = tasksState.tasks.filter((item) => item.planner_plan_id === proposal.plan_id);
  assert.ok(plannerTasks.length > 0);
  assert.ok(plannerTasks.every((task) => task.status === "proposed"));
  assert.ok(plannerTasks.every((task) => task.source === `planner:${proposal.plan_id}`));
  assert.ok(plannerTasks.every((task) => task.evolution_change_id === evolutionChange.change_id));
  assert.ok(plannerTasks.every((task) => task.source_control && task.source_control.mode === "direct_main"));
  assert.ok(plannerTasks.every((task) => Array.isArray(task.allowed_files)));
}));

test("planner materialize creates local-first vibe runtime records without defaulting to KVDF Core", () => withTempDir((dir) => {
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Materialize vibe plan", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const materialization = JSON.parse(runKvdf(["planner", "materialize", proposal.plan_id, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(materialization.planner_mode, "vibe");
  assert.strictEqual(materialization.track, "vibe_app_developer");
  assert.strictEqual(materialization.delivery_mode, "local_first");
  assert.strictEqual(materialization.source_control.mode, "local_only");
  const tasksState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8"));
  const plannerTasks = tasksState.tasks.filter((item) => item.planner_plan_id === proposal.plan_id);
  assert.ok(plannerTasks.length > 0);
  assert.ok(plannerTasks.every((task) => task.track === "vibe_app_developer"));
  assert.ok(plannerTasks.every((task) => task.source_control && task.source_control.mode === "local_only"));
  assert.ok(plannerTasks.every((task) => !task.allowed_files.some((item) => item.includes("src/cli/commands/planner.js"))));
}));

test("planner prompt from current keeps vibe execution blocked until execution gates are ready", () => withTempDir((dir) => {
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Current vibe execution", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  runKvdf(["planner", "materialize", proposal.plan_id, "--json"], { cwd: dir });
  runKvdf(["planner", "state", "resync", "--track", "vibe", "--json"], { cwd: dir });
  const prompt = JSON.parse(runKvdf(["planner", "prompt", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(prompt.planner_mode, "vibe");
  assert.ok(prompt.prompt.includes("Viber Pipeline Readiness"));
  assert.ok(prompt.prompt.includes("Execution gates: blocked"));
  assert.ok(prompt.prompt.includes("Next execution gate action:"));
  assert.ok(prompt.prompt.includes("Execution is blocked until the pipeline gates pass."));
  assert.doesNotMatch(prompt.prompt, /edit app source files/i);
}));

test("planner prompt blocks vibe execution until version and evolution gates are ready", () => withTempDir((dir) => {
  const prompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Build booking app", "--track", "vibe", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(prompt.planner_mode, "vibe");
  assert.ok(prompt.prompt.includes("Viber Pipeline Readiness"));
  assert.ok(prompt.prompt.includes("Current stage:"));
  assert.ok(prompt.prompt.includes("Transition allowed:"));
  assert.ok(prompt.prompt.includes("Blocked by:"));
  assert.ok(prompt.prompt.includes("Required before next:"));
  assert.ok(prompt.prompt.includes("Stage transition next action:"));
  assert.ok(prompt.prompt.includes("Version/evolution gates: blocked"));
  assert.ok(prompt.prompt.includes("Execution gates: blocked"));
  assert.ok(prompt.prompt.includes("Security gate:"));
  assert.ok(prompt.prompt.includes("Next version/evolution action:"));
  assert.ok(prompt.prompt.includes("Next execution gate action:"));
  assert.doesNotMatch(prompt.prompt, /edit app source files/i);
}));

test("planner materialize preserves plugin context and keeps unrelated plugins out of scope", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Materialize plugin plan", "--track", "plugin", "--plugin", "kvdf-dev", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const materialization = JSON.parse(runKvdf(["planner", "materialize", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(materialization.planner_mode, "plugin");
  assert.strictEqual(materialization.track, "plugin");
  assert.strictEqual(materialization.source_control.mode, "direct_main");
  assert.ok(materialization.evolution.change_id);
  const plannerState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "planner.json"), "utf8"));
  const currentPlan = plannerState.plans.find((item) => item.plan_id === proposal.plan_id);
  assert.ok(currentPlan.plugin_context);
  assert.ok(currentPlan.source_control);
  assert.strictEqual(currentPlan.source_control.mode, "direct_main");
  const tasksState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8"));
  const plannerTasks = tasksState.tasks.filter((item) => item.planner_plan_id === proposal.plan_id);
  assert.ok(plannerTasks.length > 0);
  assert.ok(plannerTasks.every((task) => task.track === "plugin"));
  assert.ok(plannerTasks.every((task) => task.source_control && task.source_control.mode === "direct_main"));
  assert.ok(plannerTasks.every((task) => Array.isArray(task.forbidden_files)));
}));

test("planner materialize fails clearly for proposed rejected completed or missing plans", () => withTempDir((dir) => {
  const proposed = JSON.parse(runKvdf(["planner", "propose", "--goal", "Materialize failure", "--track", "owner", "--json"], { cwd: dir }).stdout);
  const proposedFailure = runKvdf(["planner", "materialize", proposed.plan_id, "--json"], { cwd: dir, expectFailure: true });
  assert.match(proposedFailure.stderr, /must be approved before materialization/i);

  const rejected = JSON.parse(runKvdf(["planner", "propose", "--goal", "Reject then materialize", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "reject", rejected.plan_id, "--reason", "Not now", "--json"], { cwd: dir });
  const rejectedFailure = runKvdf(["planner", "materialize", rejected.plan_id, "--json"], { cwd: dir, expectFailure: true });
  assert.match(rejectedFailure.stderr, /must be approved before materialization/i);

  const completed = JSON.parse(runKvdf(["planner", "propose", "--goal", "Complete then materialize", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", completed.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  runKvdf(["planner", "complete", completed.plan_id, "--note", "Done", "--json"], { cwd: dir });
  const completedFailure = runKvdf(["planner", "materialize", completed.plan_id, "--json"], { cwd: dir, expectFailure: true });
  assert.match(completedFailure.stderr, /must be approved before materialization/i);

  const missingFailure = runKvdf(["planner", "materialize", "planner-plan-999", "--json"], { cwd: dir, expectFailure: true });
  assert.match(missingFailure.stderr, /Planner plan not found/i);

  const fromCurrentFailure = runKvdf(["planner", "materialize", "--from-current", "--json"], { cwd: dir, expectFailure: true });
  assert.match(fromCurrentFailure.stderr, /No approved current planner plan exists/i);
}));

test("planner prompt from current fails clearly without an approved plan", () => withTempDir((dir) => {
  const failure = runKvdf(["planner", "prompt", "--from-current", "--json"], { cwd: dir, expectFailure: true });
  assert.match(failure.stderr, /No approved current planner plan exists/i);
}));

test("planner visual builds an owner-track Mermaid board and scope map", () => {
  // repo root already contains git metadata; no extra fixture needed
  const visual = JSON.parse(runKvdf(["planner", "visual", "--goal", "Add visual planner", "--track", "owner", "--json"]).stdout);
  assert.strictEqual(visual.report_type, "kvdf_planner_visual");
  assert.strictEqual(visual.planner_mode, "owner");
  assert.strictEqual(visual.track, "framework_owner");
  assert.strictEqual(visual.delivery_mode, "direct_main");
  assert.strictEqual(visual.source_control.mode, "direct_main");
  assert.strictEqual(visual.graph.format, "mermaid");
  assert.ok(visual.graph.diagram.includes("Owner Direction"));
  assert.ok(visual.graph.diagram.includes("Direct-to-main Commit"));
  assert.ok(Array.isArray(visual.board.columns));
  assert.strictEqual(visual.board.columns.length, 6);
  assert.ok(visual.board.columns.some((column) => column.cards.some((card) => card.type === "source-control")));
  assert.ok(visual.scope_map.forbidden_files.some((item) => item.includes("KVDOS/")));
  assert.ok(visual.scope_map.forbidden_files.some((item) => item.includes(".kabeeri/")));
  assert.ok(visual.scope_map.source_control);
  assert.ok(visual.legend.source_control);
  assert.ok(Array.isArray(visual.validation_commands));
  assert.ok(visual.validation_commands.includes("node bin/kvdf.js validate"));
  assert.ok(visual.markdown_report.includes("```mermaid"));
  assert.ok(visual.markdown_report.includes("Planning Board"));
  assert.ok(visual.markdown_report.includes("Source Control"));
  assert.ok(visual.planning_lifecycle);
  assert.ok(visual.planning_lifecycle.method);
  assert.ok(visual.gate_matrix);
  assert.ok(visual.publish_readiness);
  assert.strictEqual(visual.publish_readiness.auto_publish, false);
  assert.ok(Array.isArray(visual.stage_timeline));
  assert.ok(Array.isArray(visual.blockers));
  assert.ok(visual.source_control.remote_provider !== "github");
  assert.ok(visual.markdown_report.includes("## Planning Lifecycle"));
  assert.ok(visual.markdown_report.includes("## Gate Matrix"));
  assert.ok(visual.markdown_report.includes("## Blockers"));
  assert.ok(visual.markdown_report.includes("## Publish Readiness"));
  assert.ok(visual.markdown_report.includes("## Execution Feedback"));
  assert.ok(visual.markdown_report.includes("## Stage Timeline"));
  assert.ok(visual.markdown_report.includes("KVDF does not auto-publish."));
});

test("planner visual builds a vibe-track local-first visual pipeline", () => {
  const visual = JSON.parse(runKvdf(["planner", "visual", "--goal", "Build app flow", "--track", "vibe", "--json"]).stdout);
  assert.strictEqual(visual.report_type, "kvdf_planner_visual");
  assert.strictEqual(visual.planner_mode, "vibe");
  assert.strictEqual(visual.track, "vibe_app_developer");
  assert.strictEqual(visual.delivery_mode, "local_first");
  assert.strictEqual(visual.source_control.mode, "local_only");
  assert.ok(visual.graph.diagram.includes("Request"));
  assert.ok(visual.graph.diagram.includes("Questions"));
  assert.ok(visual.graph.diagram.includes("Answers"));
  assert.ok(visual.graph.diagram.includes("Handoff"));
  assert.ok(visual.scope_map.allowed_files.some((item) => item.includes("workspaces/apps/")));
  assert.ok(visual.scope_map.forbidden_files.some((item) => item.includes("src/cli/commands/planner.js")));
  assert.ok(visual.planning_lifecycle);
  assert.strictEqual(visual.publish_readiness.auto_publish, false);
  assert.ok(Array.isArray(visual.stage_timeline));
  assert.ok(visual.markdown_report.includes("Current app files/docs/specs are primary for app-track planning."));
});

test("planner visual includes Viber pipeline execution readiness and blockers", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const visual = JSON.parse(runKvdf(["planner", "visual", "--goal", "Build booking app", "--track", "vibe", "--source-control", "none", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visual.planner_mode, "vibe");
  assert.ok(visual.viber_pipeline);
  assert.strictEqual(visual.viber_pipeline.track, "vibe_app_developer");
  assert.strictEqual(visual.viber_pipeline.delivery_mode, "local_first");
  assert.strictEqual(visual.viber_pipeline.source_of_truth, "file_first");
  assert.strictEqual(visual.viber_pipeline.report_type, "kvdf_viber_pipeline_stage_order");
  assert.strictEqual(visual.viber_pipeline.planning_method, "hybrid");
  assert.ok(visual.viber_pipeline.stage_order.includes("questionnaire_generation"));
  assert.strictEqual(visual.execution_allowed, false);
  assert.ok(Array.isArray(visual.execution_blockers));
  assert.ok(visual.next_stage);
  assert.ok(Array.isArray(visual.stage_timeline));
  assert.ok(visual.stage_timeline.some((stage) => stage.stage === "idea"));
  assert.ok(visual.stage_timeline.some((stage) => stage.stage === "handoff"));
  assert.ok(visual.markdown_report.includes("## Viber Pipeline"));
  assert.ok(visual.markdown_report.includes("Execution allowed: no"));
}));

test("planner visual builds a plugin-track visual parity model", () => {
  // repo root already contains git metadata; no extra fixture needed
  const visual = JSON.parse(runKvdf(["planner", "visual", "--goal", "Improve plugin docs", "--track", "plugin", "--plugin", "kvdf-dev", "--json"]).stdout);
  assert.strictEqual(visual.report_type, "kvdf_planner_visual");
  assert.strictEqual(visual.planner_mode, "plugin");
  assert.strictEqual(visual.track, "plugin");
  assert.strictEqual(visual.plugin_context.plugin_id, "kvdf-dev");
  assert.strictEqual(visual.source_control.mode, "direct_main");
  assert.ok(visual.graph.diagram.includes("Manifest Review"));
  assert.ok(visual.graph.diagram.includes("Install/Uninstall Check"));
  assert.ok(visual.scope_map.forbidden_files.some((item) => item.includes(".kabeeri/plugin-links/")));
  assert.ok(visual.scope_map.forbidden_files.some((item) => item.includes("plugins/*/runtime/")));
  assert.ok(visual.gate_matrix);
  assert.ok(Array.isArray(visual.stage_timeline));
  assert.strictEqual(visual.publish_readiness.auto_publish, false);
});

test("planner visual renders a readable markdown report", () => {
  const visual = runKvdf(["planner", "visual", "--goal", "Add visual planner", "--track", "owner"]);
  assert.match(visual.stdout, /KVDF Planner Visual Execution Readiness - Owner/);
  assert.match(visual.stdout, /```mermaid/);
  assert.match(visual.stdout, /Owner Direction/);
  assert.match(visual.stdout, /## State Freshness/);
  assert.match(visual.stdout, /## Planning Lifecycle/);
  assert.match(visual.stdout, /## Gate Matrix/);
  assert.match(visual.stdout, /## Blockers/);
  assert.match(visual.stdout, /## Publish Readiness/);
  assert.match(visual.stdout, /## Execution Feedback/);
  assert.match(visual.stdout, /## Stage Timeline/);
  assert.match(visual.stdout, /Clarifications and assumptions:/);
  assert.match(visual.stdout, /KVDF does not auto-publish./);
  assert.match(visual.stdout, /GitHub is optional and not required for state authority./);
});

test("planner visual from current reuses the approved runtime plan", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Approved visual planner", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
  const visual = JSON.parse(runKvdf(["planner", "visual", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visual.report_type, "kvdf_planner_visual");
  assert.strictEqual(visual.planner_mode, "owner");
  assert.strictEqual(visual.goal, "Approved visual planner");
  assert.strictEqual(visual.source_control.mode, "direct_main");
  assert.ok(visual.markdown_report.includes("KVDF Planner Visual Execution Readiness - Owner"));
  assert.ok(visual.publish_readiness);
  assert.strictEqual(visual.publish_readiness.auto_publish, false);
}));

test("planner pipeline builds an owner-track idea to evolution package", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const pipeline = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Improve KVDF planner", "--track", "owner", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pipeline.report_type, "kvdf_idea_to_evolution_pipeline");
  assert.strictEqual(pipeline.planner_mode, "owner");
  assert.strictEqual(pipeline.delivery_mode, "direct_main");
  assert.ok(pipeline.source_control);
  assert.strictEqual(pipeline.source_control.mode, "direct_main");
  assert.ok(Array.isArray(pipeline.documentation_files));
  assert.ok(pipeline.documentation_files.includes("docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md"));
  assert.ok(pipeline.docs_plan);
  assert.ok(pipeline.docs_status);
  assert.strictEqual(pipeline.docs_plan.report_type, "kvdf_planner_docs_plan");
  assert.strictEqual(pipeline.docs_status.report_type, "kvdf_planner_docs_status");
  assert.ok(pipeline.design_artifacts);
  assert.ok(pipeline.design_artifacts.system_design);
  assert.ok(pipeline.design_artifacts.database_design);
  assert.ok(pipeline.version_plan);
  assert.ok(Array.isArray(pipeline.version_plan.versions));
  assert.ok(pipeline.version_plan.versions.length >= 3);
  assert.ok(Array.isArray(pipeline.evolutions));
  assert.ok(pipeline.evolutions.length >= 3);
  assert.ok(Array.isArray(pipeline.task_punches));
  assert.strictEqual(pipeline.evolutions[0].track, "framework_owner");
  assert.ok(pipeline.evolutions.every((evolution) => evolution.forbidden_files.includes("KVDOS/")));
  assert.ok(pipeline.evolutions.every((evolution) => evolution.forbidden_files.includes(".kabeeri/")));
  assert.ok(pipeline.visual_planning);
  assert.ok(pipeline.visual_planning.graph);
  assert.ok(pipeline.next_evolution);
  assert.strictEqual(pipeline.next_action, "Review the pipeline plan, then approve/materialize the first Evolution.");
}));

test("planner pipeline builds a vibe local-first package with local-only source control", () => withTempDir((dir) => {
  const pipeline = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Build booking app", "--track", "vibe", "--source-control", "none", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pipeline.report_type, "kvdf_idea_to_evolution_pipeline");
  assert.strictEqual(pipeline.planner_mode, "vibe");
  assert.strictEqual(pipeline.delivery_mode, "local_first");
  assert.strictEqual(pipeline.source_control.enabled, false);
  assert.strictEqual(pipeline.source_control.provider, "none");
  assert.strictEqual(pipeline.source_control.mode, "local_only");
  assert.ok(Array.isArray(pipeline.pipeline));
  assert.ok(pipeline.pipeline.includes("request"));
  assert.ok(pipeline.pipeline.includes("handoff"));
  assert.ok(pipeline.viber_pipeline);
  assert.strictEqual(pipeline.viber_pipeline.report_type, "kvdf_viber_pipeline_stage_order");
  assert.strictEqual(pipeline.viber_pipeline.track, "vibe_app_developer");
  assert.strictEqual(pipeline.viber_pipeline.delivery_mode, "local_first");
  assert.strictEqual(pipeline.viber_pipeline.source_of_truth, "file_first");
  assert.strictEqual(pipeline.viber_pipeline.planning_method, "hybrid");
  assert.ok(pipeline.viber_pipeline.method_policy);
  assert.strictEqual(pipeline.viber_pipeline.method_policy.method, "hybrid");
  assert.ok(pipeline.viber_pipeline.planning_authority);
  assert.strictEqual(pipeline.viber_pipeline.planning_authority.level, "placeholder");
  assert.ok(pipeline.viber_pipeline.docs_design_gates);
  assert.strictEqual(pipeline.viber_pipeline.docs_design_gates.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.docs_design_gates.system_design.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.docs_design_gates.database_design.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.docs_design_gates.ui_ux_design.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.docs_design_gates.version_plan.status, "blocked");
  assert.ok(Array.isArray(pipeline.viber_pipeline.docs_design_gates.blockers));
  assert.ok(pipeline.viber_pipeline.docs_design_gates.blockers.length > 0);
  assert.ok(pipeline.viber_pipeline.version_evolution_gates);
  assert.strictEqual(pipeline.viber_pipeline.version_evolution_gates.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.version_evolution_gates.version_plan.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.version_evolution_gates.evolutions.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.version_evolution_gates.evolution_order_validation.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.version_evolution_gates.task_punches.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.version_evolution_gates.task_punch_review.status, "blocked");
  assert.ok(pipeline.viber_pipeline.execution_gates);
  assert.strictEqual(pipeline.viber_pipeline.execution_gates.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.execution_gates.security_gate.status, "warning");
  assert.strictEqual(pipeline.viber_pipeline.execution_gates.handoff_gate.status, "blocked");
  assert.strictEqual(pipeline.viber_pipeline.execution_gates.source_control_gate.status, "ready");
  assert.strictEqual(pipeline.viber_pipeline.execution_gates.validation_gate.status, "warning");
  assert.ok(Array.isArray(pipeline.viber_pipeline.execution_gates.validation_gate.evidence));
  assert.ok(pipeline.viber_pipeline.execution_gates.validation_gate.evidence.includes("node bin/kvdf.js validate"));
  assert.ok(pipeline.viber_pipeline.questionnaire);
  assert.strictEqual(pipeline.viber_pipeline.questionnaire.status, "missing");
  assert.ok(pipeline.viber_pipeline.brief);
  assert.strictEqual(pipeline.viber_pipeline.brief.status, "missing");
  assert.ok(Array.isArray(pipeline.viber_pipeline.stage_order));
  assert.deepStrictEqual(pipeline.viber_pipeline.stage_order, [
    "idea",
    "questionnaire_generation",
    "questionnaire_answers",
    "answer_completeness_check",
    "brief_generation",
    "brief_review",
    "brief_approval",
    "state_resync",
    "current_state_report",
    "app_boundary",
    "documentation_architecture",
    "documentation_folders",
    "documentation_files",
    "system_design",
    "database_design",
    "ui_ux_design",
    "source_control_plan",
    "security_plan",
    "version_plan",
    "evolutions",
    "evolution_order_validation",
    "task_punches",
    "task_punch_review",
    "approval",
    "materialization",
    "codex_prompt",
    "security_gate",
    "handoff_gate",
    "source_control_gate",
    "execution",
    "validation",
    "security_scan",
    "handoff",
    "dashboard_update",
    "learning_capture",
    "closeout"
  ]);
  assert.ok(pipeline.viber_pipeline.stages.every((stage, index) => stage.order === index + 1));
  assert.deepStrictEqual(pipeline.viber_pipeline.stage_groups.intake, ["idea", "questionnaire_generation", "questionnaire_answers", "answer_completeness_check"]);
  assert.strictEqual(pipeline.viber_pipeline.execution_allowed, false);
  assert.ok(Array.isArray(pipeline.viber_pipeline.stages));
  assert.ok(pipeline.viber_pipeline.stage_transition);
  assert.strictEqual(pipeline.viber_pipeline.stage_transition.current_stage, "idea");
  assert.strictEqual(pipeline.viber_pipeline.stage_transition.next_stage, "questionnaire_generation");
  assert.strictEqual(pipeline.viber_pipeline.stage_transition.transition_allowed, true);
  assert.ok(Array.isArray(pipeline.viber_pipeline.stage_transition.required_before_next));
  assert.ok(pipeline.viber_pipeline.stage_transition.required_before_next.some((item) => /raw idea/i.test(item) || /questionnaire/i.test(item)));
  assert.match(pipeline.viber_pipeline.stage_transition.next_action, /questionnaire/i);
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "questionnaire_generation"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "brief_approval"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "documentation_architecture" && stage.status === "blocked"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "documentation_architecture"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "documentation_folders"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "documentation_files"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "system_design"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "database_design"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "ui_ux_design"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "source_control_plan"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "security_plan"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "version_plan"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "evolutions"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "evolution_order_validation"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "task_punches"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "task_punch_review"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "materialization"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "codex_prompt"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "security_gate" && stage.status === "blocked"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "handoff_gate" && stage.status === "blocked"));
  assert.ok(pipeline.viber_pipeline.stages.some((stage) => stage.stage === "source_control_gate" && stage.status === "complete"));
  assert.ok(Array.isArray(pipeline.viber_pipeline.execution_blockers));
  assert.strictEqual(pipeline.viber_pipeline.next_stage, "questionnaire_generation");
  assert.ok(Array.isArray(pipeline.documentation_folders));
  const folderIds = pipeline.documentation_folders.map((folder) => folder.folder_id);
  assert.ok(folderIds.includes("product"));
  assert.ok(folderIds.includes("architecture"));
  assert.ok(folderIds.includes("database"));
  assert.ok(folderIds.includes("ui-ux"));
  assert.ok(folderIds.includes("api"));
  assert.ok(folderIds.includes("security"));
  assert.ok(folderIds.includes("delivery"));
  assert.ok(folderIds.includes("dependencies"));
  const uiUxFolder = pipeline.documentation_folders.find((folder) => folder.folder_id === "ui-ux");
  const architectureFolder = pipeline.documentation_folders.find((folder) => folder.folder_id === "architecture");
  const databaseFolder = pipeline.documentation_folders.find((folder) => folder.folder_id === "database");
  assert.ok(uiUxFolder);
  assert.ok(architectureFolder);
  assert.ok(databaseFolder);
  assert.ok(uiUxFolder.files.some((file) => file.doc_id === "ui_ux_design"));
  assert.ok(uiUxFolder.files.some((file) => file.path.includes("docs/ui-ux/UI_UX_DESIGN.md")));
  assert.ok(architectureFolder.files.some((file) => file.doc_id === "system_design"));
  assert.ok(architectureFolder.files.some((file) => file.path.includes("docs/architecture/SYSTEM_DESIGN.md")));
  assert.ok(databaseFolder.files.some((file) => file.doc_id === "data_model"));
  assert.ok(databaseFolder.files.some((file) => file.path.includes("docs/database/DATA_MODEL.md")));
  assert.ok(Array.isArray(pipeline.portable_docs_mapping));
  const uiUxMapping = pipeline.portable_docs_mapping.find((mapping) => mapping.planner_doc.includes("docs/ui-ux/UI_UX_DESIGN.md"));
  const systemMapping = pipeline.portable_docs_mapping.find((mapping) => mapping.planner_doc.includes("docs/architecture/SYSTEM_DESIGN.md"));
  const dataMapping = pipeline.portable_docs_mapping.find((mapping) => mapping.planner_doc.includes("docs/database/DATA_MODEL.md"));
  const securityMapping = pipeline.portable_docs_mapping.find((mapping) => mapping.planner_doc.includes("docs/security/SECURITY_DESIGN.md"));
  const versionMapping = pipeline.portable_docs_mapping.find((mapping) => mapping.planner_doc.includes("docs/delivery/VERSION_PLAN.md"));
  const punchMapping = pipeline.portable_docs_mapping.find((mapping) => mapping.planner_doc.includes("docs/delivery/TASK_PUNCHES.md"));
  assert.ok(uiUxMapping);
  assert.ok(systemMapping);
  assert.ok(dataMapping);
  assert.ok(securityMapping);
  assert.ok(versionMapping);
  assert.ok(punchMapping);
  assert.ok(uiUxMapping.canonical_docs.some((item) => item.endsWith("05-ux-principles.md")));
  assert.ok(uiUxMapping.canonical_docs.some((item) => item.endsWith("06-information-architecture.md")));
  assert.ok(uiUxMapping.canonical_docs.some((item) => item.endsWith("09-ui-specification.md")));
  assert.ok(systemMapping.canonical_docs.some((item) => item.endsWith("12-architecture-overview.md")));
  assert.ok(systemMapping.canonical_docs.some((item) => item.endsWith("13-module-breakdown.md")));
  assert.ok(systemMapping.canonical_docs.some((item) => item.endsWith("14-service-boundaries.md")));
  assert.ok(dataMapping.canonical_docs.some((item) => item.endsWith("19-data-model.md")));
  assert.ok(dataMapping.canonical_docs.some((item) => item.endsWith("20-entities-and-relationships.md")));
  assert.ok(dataMapping.canonical_docs.some((item) => item.endsWith("21-data-dictionary.md")));
  assert.ok(securityMapping.canonical_docs.some((item) => item.endsWith("38-security-and-privacy.md")));
  assert.ok(securityMapping.canonical_docs.some((item) => item.endsWith("16-authentication-and-permissions.md")));
  assert.ok(securityMapping.canonical_docs.some((item) => item.endsWith("41-role-and-permission-matrix.md")));
  assert.ok(versionMapping.canonical_docs.some((item) => item.endsWith("28-release-plan.md")));
  assert.ok(versionMapping.canonical_docs.some((item) => item.endsWith("27-implementation-order.md")));
  assert.ok(punchMapping.canonical_docs.some((item) => item.endsWith("26-task-plan.md")));
  assert.ok(punchMapping.canonical_docs.some((item) => item.endsWith("27-implementation-order.md")));
  assert.ok(punchMapping.canonical_docs.some((item) => item.endsWith("31-qa-checklist.md")));
  assert.ok(pipeline.documentation_files.some((item) => item.includes("docs/ui-ux/UI_UX_DESIGN.md")));
  assert.ok(pipeline.documentation_files.some((item) => item.includes("docs/architecture/SYSTEM_DESIGN.md")));
  assert.ok(pipeline.documentation_files.some((item) => item.includes("docs/database/DATA_MODEL.md")));
  assert.ok(pipeline.documentation_files.some((item) => item.includes("docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md")));
  assert.ok(fs.existsSync(path.join(repoRoot, "schemas", "planner", "viber-pipeline-state.schema.json")));
  assert.ok(pipeline.design_artifacts);
  assert.ok(pipeline.design_artifacts.system_design);
  assert.ok(pipeline.design_artifacts.database_design);
  assert.ok(pipeline.design_artifacts.ui_ux_design);
  assert.ok(pipeline.docs_plan);
  assert.ok(pipeline.docs_status);
  assert.ok(pipeline.version_plan);
  assert.ok(Array.isArray(pipeline.version_plan.versions));
  assert.ok(Array.isArray(pipeline.evolutions));
  assert.ok(Array.isArray(pipeline.task_punches));
  assert.ok(pipeline.evolutions.every((evolution) => evolution.track === "vibe_app_developer"));
  assert.ok(pipeline.evolutions.every((evolution) => !evolution.allowed_files.some((item) => item.includes("src/cli/commands/planner.js"))));
  assert.ok(pipeline.evolutions.every((evolution) => !evolution.allowed_files.some((item) => item.includes("src/cli/commands/evolution.js"))));
}));

test("planner pipeline inspect reads individual Viber stages in read-only mode", () => withTempDir((dir) => {
  const idea = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "idea", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(idea.report_type, "kvdf_viber_pipeline_stage_inspection");
  assert.strictEqual(idea.track, "vibe_app_developer");
  assert.strictEqual(idea.current_stage, "idea");
  assert.strictEqual(idea.stage, "idea");
  assert.strictEqual(idea.stage_order, 1);
  assert.strictEqual(idea.stage_group, "intake");
  assert.ok(idea.transition);
  assert.ok(Array.isArray(idea.evidence.source_files_inspected));

  const questionnaireAnswers = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "questionnaire_answers", "--json"], { cwd: dir }).stdout);
  assert.ok(["missing", "blocked", "planned"].includes(questionnaireAnswers.status));
  assert.strictEqual(questionnaireAnswers.transition.transition_allowed, false);
  assert.ok(questionnaireAnswers.blockers.some((item) => /answer/i.test(item)));

  const briefApproval = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "brief_approval", "--json"], { cwd: dir }).stdout);
  assert.ok(["missing", "blocked", "planned"].includes(briefApproval.status));
  assert.strictEqual(briefApproval.transition.transition_allowed, false);
  assert.ok(briefApproval.blockers.some((item) => /brief/i.test(item) || /approve/i.test(item)));

  const systemDesign = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "system_design", "--json"], { cwd: dir }).stdout);
  assert.ok(["missing", "blocked", "planned", "ready"].includes(systemDesign.status));
  assert.strictEqual(systemDesign.transition.transition_allowed, false);
  assert.ok(systemDesign.blockers.some((item) => /system design/i.test(item) || /architecture/i.test(item)));

  const versionPlan = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "version_plan", "--json"], { cwd: dir }).stdout);
  assert.ok(["missing", "blocked", "planned"].includes(versionPlan.status));
  assert.strictEqual(versionPlan.transition.transition_allowed, false);
  assert.ok(versionPlan.blockers.some((item) => /version plan/i.test(item) || /approval/i.test(item)));

  const evolutionOrder = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "evolution_order_validation", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(evolutionOrder.transition.transition_allowed, false);
  assert.ok(evolutionOrder.blockers.some((item) => /boundary/i.test(item) || /workspace/i.test(item) || /task generation/i.test(item)));

  const sourceControlPlan = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "source_control_plan", "--source-control", "none", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(sourceControlPlan.planning_method, "hybrid");
  assert.ok(Array.isArray(sourceControlPlan.dependencies.required_gates));
  assert.ok(sourceControlPlan.dependencies.required_gates.some((item) => /source_control\.mode/i.test(item)));
  assert.ok(!/GitHub/i.test(sourceControlPlan.transition.next_action));

  const execution = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "execution", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(execution.transition.transition_allowed, false);
  assert.ok(execution.blockers.length > 0);
  assert.ok(/blocked|complete/i.test(execution.next_action));
}));

test("planner pipeline inspect returns the full ordered Viber stage list with --all", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--all", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_viber_pipeline_stage_inspection");
  assert.strictEqual(report.current_stage, "all");
  assert.ok(Array.isArray(report.stages));
  assert.strictEqual(report.stages.length, 36);
  assert.deepStrictEqual(report.stages.map((stage) => stage.stage), [
    "idea",
    "questionnaire_generation",
    "questionnaire_answers",
    "answer_completeness_check",
    "brief_generation",
    "brief_review",
    "brief_approval",
    "state_resync",
    "current_state_report",
    "app_boundary",
    "documentation_architecture",
    "documentation_folders",
    "documentation_files",
    "system_design",
    "database_design",
    "ui_ux_design",
    "source_control_plan",
    "security_plan",
    "version_plan",
    "evolutions",
    "evolution_order_validation",
    "task_punches",
    "task_punch_review",
    "approval",
    "materialization",
    "codex_prompt",
    "security_gate",
    "handoff_gate",
    "source_control_gate",
    "execution",
    "validation",
    "security_scan",
    "handoff",
    "dashboard_update",
    "learning_capture",
    "closeout"
  ]);
  assert.ok(report.stages.every((stage, index) => stage.stage_order === index + 1));
  assert.ok(report.stages.every((stage) => stage.transition && typeof stage.transition.transition_allowed === "boolean"));
}));

test("planner pipeline inspect renders a readable markdown stage report", () => withTempDir((dir) => {
  const output = runKvdf(["planner", "pipeline", "inspect", "--track", "vibe", "--stage", "idea"], { cwd: dir }).stdout;
  assert.match(output, /# KVDF Viber Pipeline Stage Inspection/);
  assert.match(output, /## Stage/);
  assert.match(output, /## Transition/);
}));

test("planner pipeline marks agile low-risk database docs not applicable when the work is simple", () => {
  const agile = JSON.parse(runKvdf(["planner", "pipeline", "--goal", "Improve landing page copy", "--track", "vibe", "--method", "agile", "--json"]).stdout);
  assert.strictEqual(agile.viber_pipeline.planning_method, "agile");
  assert.ok(agile.viber_pipeline.docs_design_gates);
  assert.ok(["not_applicable", "deferred", "blocked"].includes(agile.viber_pipeline.docs_design_gates.database_design.status));
  assert.strictEqual(agile.viber_pipeline.execution_allowed, false);
});

test("planner pipeline supports source-control modes without making GitHub mandatory", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const localOnly = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Build app", "--track", "vibe", "--source-control", "none", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(localOnly.viber_pipeline.source_control.mode, "local_only");
  assert.strictEqual(localOnly.viber_pipeline.source_control.branching_enabled, false);
  assert.strictEqual(localOnly.viber_pipeline.source_control.pr_enabled, false);
  assert.match(localOnly.viber_pipeline.source_control.next_source_control_action, /local/i);
  assert.ok(localOnly.viber_pipeline.execution_gates);
  assert.strictEqual(localOnly.viber_pipeline.execution_gates.source_control_gate.status, "ready");
  assert.strictEqual(localOnly.viber_pipeline.execution_gates.source_control_gate.required, true);
  assert.ok(localOnly.viber_pipeline.execution_gates.source_control_gate.evidence.includes("local_only"));

  const directMain = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Build app", "--track", "vibe", "--source-control", "git", "--sc-mode", "direct-main", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(directMain.viber_pipeline.source_control.mode, "direct_main");
  assert.strictEqual(directMain.viber_pipeline.source_control.branching_enabled, false);
  assert.strictEqual(directMain.viber_pipeline.source_control.pr_enabled, false);
  assert.match(directMain.viber_pipeline.source_control.next_source_control_action, /commit and push to main/i);
  assert.strictEqual(directMain.viber_pipeline.execution_gates.source_control_gate.status, "ready");
  assert.match(directMain.viber_pipeline.execution_gates.source_control_gate.next_action, /commit and push to main/i);

  const branch = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Build app", "--track", "vibe", "--source-control", "git", "--sc-mode", "branch", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(branch.viber_pipeline.source_control.mode, "branch");
  assert.strictEqual(branch.viber_pipeline.source_control.branching_enabled, true);
  assert.strictEqual(branch.viber_pipeline.source_control.pr_enabled, false);
  assert.match(branch.viber_pipeline.source_control.next_source_control_action, /branch/i);
  assert.strictEqual(branch.viber_pipeline.execution_gates.source_control_gate.status, "ready");
  assert.strictEqual(branch.viber_pipeline.execution_gates.source_control_gate.warnings.length, 0);

  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const branchPr = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Build app", "--track", "vibe", "--source-control", "git", "--remote-provider", "github", "--sc-mode", "branch-pr", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(branchPr.viber_pipeline.source_control.mode, "branch_pr");
  assert.strictEqual(branchPr.viber_pipeline.source_control.remote_provider, "github");
  assert.strictEqual(branchPr.viber_pipeline.source_control.provider_plugin, "github");
  assert.strictEqual(branchPr.viber_pipeline.source_control.branching_enabled, true);
  assert.strictEqual(branchPr.viber_pipeline.source_control.pr_enabled, true);
  assert.match(branchPr.viber_pipeline.source_control.next_source_control_action, /GitHub PR/i);
  assert.strictEqual(branchPr.viber_pipeline.execution_gates.source_control_gate.status, "ready");
  assert.ok(branchPr.viber_pipeline.execution_gates.source_control_gate.evidence.includes("remote:github"));
})); 

test("planner pipeline exposes structured agile and hybrid planning policies", () => {
  const structured = JSON.parse(runKvdf(["planner", "pipeline", "--goal", "Enterprise vibe app", "--track", "vibe", "--method", "structured", "--json"]).stdout);
  assert.strictEqual(structured.viber_pipeline.planning_method, "structured");
  assert.strictEqual(structured.viber_pipeline.method_policy.method, "structured");
  assert.strictEqual(structured.viber_pipeline.method_policy.foundation_depth, "full");
  assert.ok(structured.viber_pipeline.method_policy.required_stage_overrides.includes("system_design"));
  assert.ok(structured.viber_pipeline.method_policy.required_stage_overrides.includes("database_design"));
  assert.ok(structured.viber_pipeline.method_policy.required_stage_overrides.includes("ui_ux_design"));
  assert.ok(structured.viber_pipeline.method_policy.required_stage_overrides.includes("security_plan"));
  assert.ok(structured.viber_pipeline.method_policy.required_stage_overrides.includes("version_plan"));
  assert.ok(structured.viber_pipeline.method_policy.required_stage_overrides.includes("evolutions"));
  assert.ok(structured.viber_pipeline.method_policy.required_stage_overrides.includes("task_punches"));

  const agile = JSON.parse(runKvdf(["planner", "pipeline", "--goal", "Small vibe tweak", "--track", "vibe", "--method", "agile", "--json"]).stdout);
  assert.strictEqual(agile.viber_pipeline.planning_method, "agile");
  assert.strictEqual(agile.viber_pipeline.method_policy.method, "agile");
  assert.strictEqual(agile.viber_pipeline.method_policy.execution_style, "small_iteration");
  assert.ok(agile.viber_pipeline.method_policy.required_stage_overrides.includes("questionnaire_generation"));
  assert.ok(agile.viber_pipeline.method_policy.required_stage_overrides.includes("brief_approval"));
  assert.ok(agile.viber_pipeline.method_policy.required_stage_overrides.includes("security_gate"));

  const hybrid = JSON.parse(runKvdf(["planner", "pipeline", "--goal", "Build booking app", "--track", "vibe", "--json"]).stdout);
  assert.strictEqual(hybrid.viber_pipeline.planning_method, "hybrid");
  assert.strictEqual(hybrid.viber_pipeline.method_policy.method, "hybrid");
  assert.strictEqual(hybrid.viber_pipeline.method_policy.execution_style, "evolution_slice");
  assert.strictEqual(hybrid.viber_pipeline.planning_authority.level, "placeholder");
});

test("portable app docs standard remains canonical and numbered", () => {
  const standardMd = fs.readFileSync(path.join(repoRoot, "knowledge", "governance", "APP_DOCS_STANDARD.md"), "utf8");
  assert.ok(standardMd.includes("Portable app docs:"));
  assert.ok(standardMd.includes("Planner Foldered Docs Bridge"));
  assert.ok(standardMd.includes("documentation_folders"));
  const templates = buildAppDocsPackageTemplates({ name: "App", slug: "app" });
  const readmeTemplate = templates.find((template) => template.path === "README.md");
  assert.ok(readmeTemplate);
  assert.ok(readmeTemplate.content.includes("docs/00-overview.md"));
  assert.ok(readmeTemplate.content.includes("docs/05-ux-principles.md"));
  assert.ok(readmeTemplate.content.includes("docs/12-architecture-overview.md"));
  assert.ok(readmeTemplate.content.includes("docs/19-data-model.md"));
});

test("planner pipeline builds a plugin package with plugin context and isolated scope", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const pipeline = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Improve planner visual plugin", "--track", "plugin", "--plugin", "planner-visual", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pipeline.report_type, "kvdf_idea_to_evolution_pipeline");
  assert.strictEqual(pipeline.planner_mode, "plugin");
  assert.strictEqual(pipeline.track, "plugin");
  assert.ok(pipeline.plugin_context);
  assert.strictEqual(pipeline.plugin_context.plugin_id, "planner-visual");
  assert.ok(pipeline.source_control);
  assert.strictEqual(pipeline.source_control.mode, "direct_main");
  assert.ok(Array.isArray(pipeline.documentation_files));
  assert.ok(pipeline.documentation_files.some((item) => item.includes("plugins/planner_visual/docs/")));
  assert.ok(pipeline.docs_plan);
  assert.ok(pipeline.docs_status);
  assert.ok(Array.isArray(pipeline.evolutions));
  assert.ok(pipeline.evolutions.every((evolution) => evolution.track === "plugin"));
  assert.ok(pipeline.evolutions.every((evolution) => evolution.allowed_files.some((item) => item.includes("plugins/planner_visual"))));
  assert.ok(pipeline.evolutions.every((evolution) => evolution.forbidden_files.includes(".kabeeri/plugin-links/")));
  assert.ok(Array.isArray(pipeline.task_punches));
  assert.ok(pipeline.task_punches.every((taskPunch) => taskPunch.source_control && taskPunch.source_control.mode === "direct_main"));
}));

test("planner pipeline supports explicit branch-pr GitHub source control", () => withTempDir((dir) => {
  writeFakeGitRepo(dir, { remoteUrl: "https://github.com/example/app.git" });
  const pipeline = JSON.parse(runKvdf(["planner", "pipeline", "--idea", "Team app delivery", "--track", "vibe", "--source-control", "git", "--remote-provider", "github", "--sc-mode", "branch-pr", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pipeline.planner_mode, "vibe");
  assert.strictEqual(pipeline.source_control.mode, "branch_pr");
  assert.strictEqual(pipeline.source_control.branching_enabled, true);
  assert.strictEqual(pipeline.source_control.pr_enabled, true);
  assert.strictEqual(pipeline.source_control.remote_provider, "github");
  assert.strictEqual(pipeline.source_control.provider_plugin, "github");
  assert.ok(pipeline.version_plan.versions.every((version) => version.source_control_mode === "branch_pr"));
}));

test("planner pipeline renders a readable markdown report", () => withTempDir((dir) => {
  const output = runKvdf(["planner", "pipeline", "--goal", "Build app", "--track", "vibe"], { cwd: dir }).stdout;
  assert.match(output, /# KVDF Idea to Evolution Pipeline/);
  assert.match(output, /Documentation Files/);
  assert.match(output, /System Design/);
  assert.match(output, /Database Design/);
  assert.match(output, /UI\/UX Design/);
  assert.match(output, /Version Plan/);
  assert.match(output, /Source Control/);
  assert.match(output, /Next Evolution/);
  assert.match(output, /```mermaid/);
}));

test("planner visual plugin is discoverable, installable, uninstallable, and renders markdown", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "planner-visual");

  const initialStatus = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  const plannerVisualEntry = initialStatus.plugins.find((item) => item.plugin_id === "planner-visual");
  assert.ok(plannerVisualEntry);
  assert.strictEqual(plannerVisualEntry.status, "disabled");
  assert.strictEqual(plannerVisualEntry.bundle_contract.status, "ready");

  const statusJson = JSON.parse(runKvdf(["planner-visual", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(statusJson.report_type, "planner_visual_plugin_status");
  assert.strictEqual(statusJson.plugin_id, "planner-visual");
  assert.strictEqual(statusJson.status, "available");
  assert.strictEqual(statusJson.renderer, "mermaid_text");

  runKvdf(["plugins", "install", "planner-visual"], { cwd: dir });
  const installedStatus = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(installedStatus.plugins.find((item) => item.plugin_id === "planner-visual").status, "enabled");

  const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Render planner visual", "--track", "owner", "--json"], { cwd: dir }).stdout);
  runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });

  const markdownRender = runKvdf(["planner-visual", "render", "--from-current"], { cwd: dir });
  assert.match(markdownRender.stdout, /KVDF Planner Visual Model - Owner/);
  assert.match(markdownRender.stdout, /```mermaid/);
  assert.match(markdownRender.stdout, /Planning Board/);
  assert.match(markdownRender.stdout, /Scope Map/);
  assert.match(markdownRender.stdout, /Validation Commands/);
  assert.match(markdownRender.stdout, /Stop Condition/);

  const jsonRender = JSON.parse(runKvdf(["planner-visual", "render", "--from-current", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(jsonRender.report_type, "planner_visual_plugin_render");
  assert.strictEqual(jsonRender.plugin_id, "planner-visual");
  assert.strictEqual(jsonRender.renderer, "mermaid_text");
  assert.match(jsonRender.rendered_markdown, /KVDF Planner Visual Model - Owner/);

  runKvdf(["plugins", "uninstall", "planner-visual"], { cwd: dir });
  const uninstalledStatus = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(uninstalledStatus.plugins.find((item) => item.plugin_id === "planner-visual").status, "disabled");
}));

test("ui_ux_intelligence plugin is discoverable and the status command is available", () => {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "ui_ux_intelligence");
  assert.ok(plugin);
  assert.strictEqual(plugin.plugin_id, "ui_ux_intelligence");
  assert.strictEqual(plugin.removable, true);
  assert.strictEqual(plugin.enabled_by_default, false);

  const status = JSON.parse(runKvdf(["ui-ux-intelligence", "status", "--json"]).stdout);
  assert.strictEqual(status.report_type, "ui_ux_intelligence_status");
  assert.strictEqual(status.plugin_id, "ui_ux_intelligence");
  assert.strictEqual(status.status, "available");
  assert.strictEqual(status.standalone, true);
  assert.strictEqual(status.external_github_dependency, false);
  assert.strictEqual(status.catalog_ready, true);
  assert.ok(status.capabilities.includes("source-status"));
  assert.ok(status.capabilities.includes("recommend"));
  assert.ok(status.capabilities.includes("catalog"));
});

test("bootstrap_ui plugin is discoverable and the command surface is optional", () => {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "bootstrap_ui");
  assert.ok(plugin);
  assert.strictEqual(plugin.plugin_id, "bootstrap_ui");
  assert.strictEqual(plugin.removable, true);
  assert.strictEqual(plugin.enabled_by_default, false);

  const status = JSON.parse(runKvdf(["bootstrap-ui", "status", "--json"]).stdout);
  assert.strictEqual(status.report_type, "bootstrap_ui_status");
  assert.strictEqual(status.plugin_id, "bootstrap_ui");
  assert.strictEqual(status.status, "available");
  assert.strictEqual(status.enabled_by_default, false);
  assert.strictEqual(status.assets_available, true);
  assert.strictEqual(status.core_dependency, false);
  assert.strictEqual(status.fallback_safe, true);
  assert.strictEqual(status.assets.css, "plugins/bootstrap_ui/assets/bootstrap.min.css");
  assert.strictEqual(status.assets.js, "plugins/bootstrap_ui/assets/bootstrap.bundle.min.js");

  const assets = JSON.parse(runKvdf(["bootstrap-ui", "assets", "--json"]).stdout);
  assert.strictEqual(assets.report_type, "bootstrap_ui_assets");
  assert.ok(Array.isArray(assets.assets));
  assert.ok(assets.assets.some((item) => item.type === "css" && item.path === "plugins/bootstrap_ui/assets/bootstrap.min.css"));
  assert.ok(assets.assets.some((item) => item.type === "js" && item.path === "plugins/bootstrap_ui/assets/bootstrap.bundle.min.js"));
  assert.strictEqual(assets.third_party_notice, "plugins/bootstrap_ui/THIRD_PARTY_NOTICES.md");

  const verify = JSON.parse(runKvdf(["bootstrap-ui", "verify", "--json"]).stdout);
  assert.strictEqual(verify.report_type, "bootstrap_ui_verify");
  assert.strictEqual(verify.status, "pass");
  assert.strictEqual(verify.assets.css_exists, true);
  assert.strictEqual(verify.assets.js_exists, true);
  assert.strictEqual(verify.core_dependency, false);
  assert.strictEqual(verify.node_modules_dependency, false);
  assert.strictEqual(verify.fallback_safe, true);

  const provider = JSON.parse(runKvdf(["bootstrap-ui", "provider", "--json"]).stdout);
  assert.strictEqual(provider.report_type, "bootstrap_ui_provider");
  assert.strictEqual(provider.provider, "fallback");
  assert.strictEqual(provider.available, true);
  assert.strictEqual(provider.enabled, false);
  assert.strictEqual(provider.fallback_used, true);
  assert.ok(Array.isArray(provider.assets));
  assert.strictEqual(provider.assets.length, 0);

  const snippet = JSON.parse(runKvdf(["bootstrap-ui", "snippet", "--json"]).stdout);
  assert.strictEqual(snippet.report_type, "bootstrap_ui_snippet");
  assert.match(snippet.html, /bootstrap\.min\.css/);
  assert.match(snippet.html, /bootstrap\.bundle\.min\.js/);
  assert.strictEqual(snippet.css_path, "plugins/bootstrap_ui/assets/bootstrap.min.css");
  assert.strictEqual(snippet.js_path, "plugins/bootstrap_ui/assets/bootstrap.bundle.min.js");
});

test("bootstrap_ui provider falls back by default and can opt into local Bootstrap assets", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "bootstrap_ui");

  const fallbackProvider = JSON.parse(runKvdf(["bootstrap-ui", "provider", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(fallbackProvider.provider, "fallback");
  assert.strictEqual(fallbackProvider.available, true);
  assert.strictEqual(fallbackProvider.enabled, false);
  assert.strictEqual(fallbackProvider.fallback_used, true);

  runKvdf(["plugins", "install", "bootstrap_ui"], { cwd: dir });

  const bootstrapProvider = JSON.parse(runKvdf(["bootstrap-ui", "provider", "--ui-provider", "bootstrap", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(bootstrapProvider.provider, "bootstrap_ui");
  assert.strictEqual(bootstrapProvider.available, true);
  assert.strictEqual(bootstrapProvider.enabled, true);
  assert.strictEqual(bootstrapProvider.fallback_used, false);
  assert.ok(bootstrapProvider.assets.includes("plugins/bootstrap_ui/assets/bootstrap.min.css"));
  assert.ok(bootstrapProvider.assets.includes("plugins/bootstrap_ui/assets/bootstrap.bundle.min.js"));

  runKvdf(["dashboard", "export", "--with-bootstrap", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const dashboardHtml = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(dashboardHtml, /KVDF UI assets: bootstrap_ui/);
  assert.match(dashboardHtml, /bootstrap\.min\.css/);
  assert.match(dashboardHtml, /bootstrap\.bundle\.min\.js/);
}));

test("bootstrap_ui verify reports missing assets safely", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "bootstrap_ui");
  fs.unlinkSync(path.join(dir, "plugins", "bootstrap_ui", "assets", "bootstrap.min.css"));
  fs.unlinkSync(path.join(dir, "plugins", "bootstrap_ui", "assets", "bootstrap.bundle.min.js"));

  const verify = JSON.parse(runKvdf(["bootstrap-ui", "verify", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(verify.report_type, "bootstrap_ui_verify");
  assert.strictEqual(verify.status, "warning");
  assert.strictEqual(verify.assets.css_exists, false);
  assert.strictEqual(verify.assets.js_exists, false);
  assert.strictEqual(verify.core_dependency, false);
  assert.strictEqual(verify.node_modules_dependency, false);
  assert.strictEqual(verify.fallback_safe, true);
}));

test("tailwind_ui plugin is discoverable and provides guidance-only utilities", () => {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "tailwind_ui");
  assert.ok(plugin);
  assert.strictEqual(plugin.plugin_id, "tailwind_ui");
  assert.strictEqual(plugin.removable, true);
  assert.strictEqual(plugin.enabled_by_default, false);

  const status = JSON.parse(runKvdf(["tailwind-ui", "status", "--json"]).stdout);
  assert.strictEqual(status.report_type, "tailwind_ui_status");
  assert.strictEqual(status.plugin_id, "tailwind_ui");
  assert.strictEqual(status.status, "available");
  assert.strictEqual(status.enabled_by_default, false);
  assert.strictEqual(status.core_dependency, false);
  assert.strictEqual(status.core_dev_dependency, false);
  assert.strictEqual(status.external_cdn_dependency, false);

  const utilityMap = JSON.parse(runKvdf(["tailwind-ui", "utility-map", "--json"]).stdout);
  assert.strictEqual(utilityMap.report_type, "tailwind_ui_utility_map");
  assert.ok(Array.isArray(utilityMap.utilities.layout));
  assert.ok(Array.isArray(utilityMap.utilities.spacing));
  assert.ok(Array.isArray(utilityMap.utilities.typography));
  assert.ok(Array.isArray(utilityMap.utilities.color));
  assert.ok(Array.isArray(utilityMap.utilities.states));
  assert.ok(Array.isArray(utilityMap.utilities.responsive));

  const verify = JSON.parse(runKvdf(["tailwind-ui", "verify", "--json"]).stdout);
  assert.strictEqual(verify.report_type, "tailwind_ui_verify");
  assert.strictEqual(verify.status, "pass");
  assert.strictEqual(verify.package_json_clean, true);
  assert.strictEqual(verify.package_lock_clean, true);
  assert.strictEqual(verify.core_dependency, false);
  assert.strictEqual(verify.core_dev_dependency, false);
  assert.strictEqual(verify.node_modules_dependency, false);
  assert.strictEqual(verify.fallback_safe, true);

  const snippet = JSON.parse(runKvdf(["tailwind-ui", "snippet", "--json"]).stdout);
  assert.strictEqual(snippet.report_type, "tailwind_ui_snippet");
  assert.strictEqual(snippet.mode, "guidance_only");
  assert.strictEqual(snippet.note, "Tailwind is optional and not bundled as a KVDF Core dependency.");
  assert.match(snippet.html, /Tailwind UI/);

  const provider = JSON.parse(runKvdf(["tailwind-ui", "provider", "--json"]).stdout);
  assert.strictEqual(provider.report_type, "tailwind_ui_provider");
  assert.ok(["tailwind_ui", "fallback"].includes(provider.provider));
  assert.strictEqual(provider.available, true);
  assert.strictEqual(provider.core_dependency, false);
  assert.strictEqual(provider.core_dev_dependency, false);
  assert.strictEqual(provider.runtime_mode, "guidance_only");
  assert.strictEqual(provider.fallback_used, provider.provider !== "tailwind_ui");

  const plannerGuidance = JSON.parse(runKvdf(["tailwind-ui", "planner-guidance", "--idea", "Build booking app", "--json"]).stdout);
  assert.strictEqual(plannerGuidance.report_type, "tailwind_ui_planner_guidance");
  assert.ok(["available", "warning"].includes(plannerGuidance.status));
  assert.ok(plannerGuidance.utility_guidance);
  assert.ok(Array.isArray(plannerGuidance.constraints));
  assert.ok(Array.isArray(plannerGuidance.validation_notes));

  const docsGuidance = JSON.parse(runKvdf(["tailwind-ui", "docs-guidance", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--json"]).stdout);
  assert.strictEqual(docsGuidance.report_type, "tailwind_ui_docs_guidance");
  assert.ok(Array.isArray(docsGuidance.target_docs));
  assert.ok(docsGuidance.target_docs.length > 0);
  assert.ok(Array.isArray(docsGuidance.sections));
  assert.ok(docsGuidance.sections.length > 0);

  const htmlComment = JSON.parse(runKvdf(["tailwind-ui", "html-comment", "--json"]).stdout);
  assert.strictEqual(htmlComment.report_type, "tailwind_ui_html_comment");
  assert.strictEqual(htmlComment.fallback_comment, "<!-- KVDF UI provider: fallback -->");
  assert.ok(htmlComment.comment.includes("tailwind_ui guidance-only"));
});

test("bootstrap_ui is no longer a root package dependency and Core source does not hard-require bootstrap", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const lock = JSON.parse(fs.readFileSync(path.join(repoRoot, "package-lock.json"), "utf8"));
  assert.ok(!pkg.dependencies || !Object.prototype.hasOwnProperty.call(pkg.dependencies, "bootstrap"));
  assert.ok(!lock.packages[""].dependencies || !Object.prototype.hasOwnProperty.call(lock.packages[""].dependencies, "bootstrap"));
  assert.ok(!Object.prototype.hasOwnProperty.call(lock.packages, "node_modules/bootstrap"));

  const coreFiles = [
    "bin/kvdf.js",
    "src/cli/index.js",
    "src/cli/ui.js",
    "src/cli/commands/dashboard_site.js",
    "src/cli/commands/docs_site.js",
    "src/cli/commands/bootstrap_ui.js"
  ];
  for (const relativePath of coreFiles) {
    const content = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
    assert.ok(!/require\((['"])bootstrap\1\)/.test(content), `${relativePath} should not require bootstrap`);
    assert.ok(!/bootstrap\/dist/.test(content), `${relativePath} should not reference bootstrap dist paths`);
    assert.ok(!/node_modules\/bootstrap/.test(content), `${relativePath} should not hard reference node_modules/bootstrap`);
  }
});

test("tailwind_ui is no longer a root package dependency and Core source does not hard-require tailwind", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const lock = JSON.parse(fs.readFileSync(path.join(repoRoot, "package-lock.json"), "utf8"));
  assert.ok(!pkg.devDependencies || !Object.prototype.hasOwnProperty.call(pkg.devDependencies, "@tailwindcss/cli"));
  assert.ok(!pkg.devDependencies || !Object.prototype.hasOwnProperty.call(pkg.devDependencies, "tailwindcss"));
  assert.ok(!lock.packages[""].devDependencies || !Object.prototype.hasOwnProperty.call(lock.packages[""].devDependencies, "@tailwindcss/cli"));
  assert.ok(!lock.packages[""].devDependencies || !Object.prototype.hasOwnProperty.call(lock.packages[""].devDependencies, "tailwindcss"));
  assert.ok(!Object.prototype.hasOwnProperty.call(lock.packages, "node_modules/@tailwindcss/cli"));
  assert.ok(!Object.prototype.hasOwnProperty.call(lock.packages, "node_modules/tailwindcss"));

  const coreFiles = [
    "bin/kvdf.js",
    "src/cli/index.js",
    "src/cli/ui.js",
    "src/cli/commands/dashboard_site.js",
    "src/cli/commands/docs_site.js",
    "src/cli/services/mermaid_preview.js"
  ];
  for (const relativePath of coreFiles) {
    const content = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
    assert.ok(!/require\((['"])tailwindcss\1\)/.test(content), `${relativePath} should not require tailwindcss`);
    assert.ok(!/require\((['"])@tailwindcss\/cli\1\)/.test(content), `${relativePath} should not require @tailwindcss/cli`);
    assert.ok(!/node_modules\/tailwindcss/.test(content), `${relativePath} should not hard reference node_modules/tailwindcss`);
  }
});

test("ui_ux_intelligence source-status and catalog use relocated plugin data", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");

  const readyStatus = JSON.parse(runKvdf(["ui-ux-intelligence", "source-status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(readyStatus.report_type, "ui_ux_intelligence_source_status");
  assert.strictEqual(readyStatus.status, "ready");
  assert.strictEqual(readyStatus.expected_files_total, 32);
  assert.strictEqual(readyStatus.found_files_total, 32);
  assert.strictEqual(readyStatus.missing_files.length, 0);
  assert.strictEqual(readyStatus.unexpected_files.length, 0);
  assert.strictEqual(readyStatus.catalog_ready, true);
  assert.strictEqual(readyStatus.temp_meta_dependency, false);
  assert.ok(readyStatus.installed_data_files.includes("products.csv"));
  assert.ok(readyStatus.installed_stack_files.includes("react.csv"));
  assert.ok(readyStatus.data_files.includes("products.csv"));
  assert.ok(readyStatus.stack_files.includes("react.csv"));
  assert.ok(readyStatus.reference_logic_files.includes("core.py"));
  assert.ok(readyStatus.reference_doc_files.includes("quick-reference.md"));

  const catalog = JSON.parse(runKvdf(["ui-ux-intelligence", "catalog", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(catalog.report_type, "ui_ux_intelligence_catalog");
  assert.strictEqual(catalog.catalog_ready, true);
  assert.ok(Array.isArray(catalog.domains));
  assert.ok(catalog.domains.includes("products"));
  assert.ok(catalog.summary.domain_counts.products > 0);

  const search = JSON.parse(runKvdf(["ui-ux-intelligence", "search", "--query", "clinic booking app", "--domain", "products", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(search.report_type, "ui_ux_intelligence_search");
  assert.strictEqual(search.domain, "products");
  assert.ok(search.results.length > 0);

  const searchAll = JSON.parse(runKvdf(["ui-ux-intelligence", "search", "--query", "clinic booking app", "--domain", "all", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(searchAll.domain, "all");
  assert.ok(searchAll.results.length > 0);

  fs.rmSync(path.join(dir, "plugins", "ui_ux_intelligence", "data"), { recursive: true, force: true });
  const missingCatalog = JSON.parse(runKvdf(["ui-ux-intelligence", "catalog", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(missingCatalog.catalog_ready, false);
  assert.ok(missingCatalog.summary.warnings.length > 0);
  const missingSearch = JSON.parse(runKvdf(["ui-ux-intelligence", "search", "--query", "clinic booking app", "--domain", "products", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(missingSearch.results.length, 0);
  assert.ok(missingSearch.warnings.length > 0);
}));

test("ui_ux_intelligence recommend and design-system generate deterministic local guidance", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");

  const recommendation = JSON.parse(runKvdf(["ui-ux-intelligence", "recommend", "--idea", "Build booking app for clinics", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(recommendation.report_type, "ui_ux_intelligence_recommendation");
  assert.strictEqual(typeof recommendation.detected_product_type, "string");
  assert.ok(recommendation.detected_product_type_details);
  assert.ok(recommendation.recommended_style);
  assert.ok(recommendation.recommended_palette_mood);
  assert.ok(recommendation.recommended_typography_mood);
  assert.ok(Array.isArray(recommendation.recommended_layout_patterns));
  assert.ok(Array.isArray(recommendation.recommended_components));
  assert.ok(Array.isArray(recommendation.ux_rules));
  assert.ok(Array.isArray(recommendation.anti_patterns_to_avoid));
  assert.ok(Array.isArray(recommendation.chart_recommendations));
  assert.ok(Array.isArray(recommendation.icon_recommendations));
  assert.ok(Array.isArray(recommendation.stack_guidance));
  assert.strictEqual(recommendation.standalone, true);
  assert.strictEqual(recommendation.external_github_dependency, false);

  const stackRecommendation = JSON.parse(runKvdf(["ui-ux-intelligence", "recommend", "--idea", "Build SaaS dashboard", "--stack", "react", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(stackRecommendation.report_type, "ui_ux_intelligence_recommendation");
  assert.ok(Array.isArray(stackRecommendation.stack_guidance) || Array.isArray(stackRecommendation.warnings));
  assert.ok(!stackRecommendation.stack_guidance || stackRecommendation.stack_guidance.length >= 0);

  const designSystem = JSON.parse(runKvdf(["ui-ux-intelligence", "design-system", "--idea", "Build ecommerce app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(designSystem.report_type, "ui_ux_intelligence_design_system");
  assert.ok(designSystem.product_type);
  assert.ok(designSystem.style);
  assert.ok(designSystem.colors);
  assert.ok(designSystem.typography);
  assert.ok(Array.isArray(designSystem.layout_patterns));
  assert.ok(Array.isArray(designSystem.components));
  assert.ok(Array.isArray(designSystem.motion_rules));
  assert.ok(designSystem.accessibility);
  assert.ok(Array.isArray(designSystem.anti_patterns));
  assert.ok(Array.isArray(designSystem.pre_delivery_checklist));
  assert.strictEqual(designSystem.standalone, true);
  assert.strictEqual(designSystem.external_github_dependency, false);

  const first = JSON.parse(runKvdf(["ui-ux-intelligence", "recommend", "--idea", "Build booking app for clinics", "--json"], { cwd: dir }).stdout);
  const second = JSON.parse(runKvdf(["ui-ux-intelligence", "recommend", "--idea", "Build booking app for clinics", "--json"], { cwd: dir }).stdout);
  assert.deepStrictEqual(first, second);
}));

test("ui_ux_intelligence recommend survives a missing optional catalog file with warnings", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");
  fs.rmSync(path.join(dir, "plugins", "ui_ux_intelligence", "data", "charts.csv"), { force: true });

  const report = JSON.parse(runKvdf(["ui-ux-intelligence", "recommend", "--idea", "Build dashboard app for analytics metrics", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "ui_ux_intelligence_recommendation");
  assert.ok(Array.isArray(report.warnings));
  assert.ok(report.warnings.length > 0);
  assert.ok(Array.isArray(report.chart_recommendations));
  assert.ok(Array.isArray(report.icon_recommendations));
}));

test("ui_ux_intelligence checklist docs and audit stay local and produce handoff-ready output", () => withTempDir((dir) => {
  copyPluginBundle(dir, "ui_ux_intelligence");
  fs.rmSync(path.join(dir, "plugins", "ui_ux_intelligence", "_temp_meta"), { recursive: true, force: true });

  const checklist = JSON.parse(runKvdf(["ui-ux-intelligence", "checklist", "--idea", "Build dashboard app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(checklist.report_type, "ui_ux_intelligence_checklist");
  assert.ok(Array.isArray(checklist.checklist));
  assert.ok(checklist.checklist.some((item) => item.category === "accessibility"));
  assert.ok(checklist.checklist.some((item) => item.category === "responsive"));
  assert.ok(checklist.checklist.some((item) => item.category === "interaction"));
  assert.ok(checklist.summary.by_category.accessibility);
  assert.ok(checklist.summary.by_category.responsive);
  assert.ok(checklist.summary.by_category.interaction);
  assert.strictEqual(checklist.standalone, true);
  assert.strictEqual(checklist.external_github_dependency, false);
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);

  const docs = JSON.parse(runKvdf(["ui-ux-intelligence", "docs", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(docs.report_type, "ui_ux_intelligence_docs_sections");
  assert.deepStrictEqual(docs.target_docs, [
    "docs/ui-ux/UI_UX_DESIGN.md",
    "docs/ui-ux/UX_PRINCIPLES.md",
    "docs/ui-ux/INFORMATION_ARCHITECTURE.md",
    "docs/ui-ux/USER_FLOWS.md",
    "docs/ui-ux/WIREFRAMES.md",
    "docs/ui-ux/UI_SPECIFICATION.md",
    "docs/ui-ux/ACCESSIBILITY.md",
    "docs/delivery/QA_CHECKLIST.md"
  ]);
  assert.ok(Array.isArray(docs.sections));
  assert.strictEqual(docs.sections.length, 8);
  assert.ok(docs.sections.every((section) => typeof section.content === "string" && section.content.includes("# ")));
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);

  const missingAudit = JSON.parse(runKvdf(["ui-ux-intelligence", "audit", "--target", "missing-ui-doc.md", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(missingAudit.report_type, "ui_ux_intelligence_audit");
  assert.strictEqual(missingAudit.status, "warning");
  assert.ok(Array.isArray(missingAudit.findings));
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);
}));

test("planner docs plan can include optional ui_ux_intelligence output", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");
  runKvdf(["plugins", "install", "ui_ux_intelligence"], { cwd: dir });
  const report = JSON.parse(runKvdf(["planner", "docs", "plan", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--include-ui-ux-intelligence", "--include-tailwind-ui", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_plan");
  assert.ok(report.ui_ux_intelligence);
  assert.strictEqual(report.ui_ux_intelligence.standalone, true);
  assert.strictEqual(report.ui_ux_intelligence.external_github_dependency, false);
  assert.ok(Array.isArray(report.ui_ux_intelligence.target_docs));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "handoff_pack_status"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "handoff_pack_ready"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "handoff_pack_available"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "prompt_pack"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "prompt_pack_available"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "pattern_library_summary"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "governance"));
  assert.strictEqual(report.ui_ux_intelligence.governance.status, "available");
  assert.ok(report.tailwind_ui);
  assert.strictEqual(report.tailwind_ui.core_dependency, false);
  assert.strictEqual(report.tailwind_ui.core_dev_dependency, false);
  assert.strictEqual(report.tailwind_ui.runtime_mode, "guidance_only");
}));

test("planner docs plan still works when ui_ux_intelligence is missing", () => withTempDir((dir) => {
  const report = JSON.parse(runKvdf(["planner", "docs", "plan", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--include-ui-ux-intelligence", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_plan");
  assert.ok(report.ui_ux_intelligence);
  assert.strictEqual(report.ui_ux_intelligence.status, "unavailable");
  assert.strictEqual(report.ui_ux_intelligence.standalone, true);
  assert.strictEqual(report.ui_ux_intelligence.external_github_dependency, false);
  assert.ok(Array.isArray(report.ui_ux_intelligence.warnings));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "handoff_pack_status"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "handoff_pack_ready"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "handoff_pack_available"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "prompt_pack"));
  assert.ok(Object.prototype.hasOwnProperty.call(report.ui_ux_intelligence, "prompt_pack_available"));
  const review = JSON.parse(runKvdf(["planner", "review", "--goal", "Build booking app", "--track", "vibe", "--method", "hybrid", "--include-ui-ux-intelligence", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.report_type, "kvdf_planner_review");
  assert.ok(review.ui_ux_review);
  assert.strictEqual(review.ui_ux_review.status, "unavailable");
  assert.ok(review.ui_ux_prompt_pack);
  assert.strictEqual(review.ui_ux_prompt_pack.status, "unavailable");
  assert.strictEqual(review.ui_ux_prompt_pack.available, false);
  assert.ok(!fs.existsSync(path.join(dir, ".kabeeri")));
}));

test("ui_ux_intelligence governance commands stay local and summarize the pack", () => withTempDir((dir) => {
  copyPluginBundle(dir, "ui_ux_intelligence");

  const knowledgePack = JSON.parse(runKvdf(["ui-ux-intelligence", "knowledge-pack", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(knowledgePack.report_type, "ui_ux_intelligence_knowledge_pack");
  assert.strictEqual(knowledgePack.knowledge_pack_version, "0.1.0");
  assert.strictEqual(knowledgePack.external_github_dependency, false);
  assert.strictEqual(knowledgePack.runtime_temp_meta_dependency, false);
  assert.ok(Array.isArray(knowledgePack.domains));
  assert.ok(knowledgePack.domains.length > 0);

  const catalogHealth = JSON.parse(runKvdf(["ui-ux-intelligence", "catalog-health", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(catalogHealth.report_type, "ui_ux_intelligence_catalog_health");
  assert.ok(Array.isArray(catalogHealth.required_files));
  assert.ok(Array.isArray(catalogHealth.loaded_domains));
  assert.ok(catalogHealth.record_counts);

  const governanceRegistry = JSON.parse(runKvdf(["ui-ux-intelligence", "governance-registry", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(governanceRegistry.report_type, "ui_ux_intelligence_governance_registry");
  assert.ok(Array.isArray(governanceRegistry.capabilities));
  assert.ok(Array.isArray(governanceRegistry.commands));
  assert.ok(Array.isArray(governanceRegistry.runtime_modules));
  assert.ok(Array.isArray(governanceRegistry.schemas));
  assert.ok(Array.isArray(governanceRegistry.docs));

  const upgradePlan = JSON.parse(runKvdf(["ui-ux-intelligence", "upgrade-plan", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(upgradePlan.report_type, "ui_ux_intelligence_upgrade_plan");
  assert.strictEqual(upgradePlan.current_version, "0.1.0");
  assert.strictEqual(upgradePlan.recommended_next_version, "0.2.0");
  assert.ok(Array.isArray(upgradePlan.catalog_improvements));

  const governance = JSON.parse(runKvdf(["ui-ux-intelligence", "governance", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(governance.report_type, "ui_ux_intelligence_governance");
  assert.ok(governance.knowledge_pack);
  assert.ok(governance.catalog_health);
  assert.ok(governance.governance_registry);
  assert.ok(governance.upgrade_plan);
  assert.ok(["pass", "warning", "blocked"].includes(governance.status));
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);
}));

test("ui_ux_intelligence governance handles a missing manifest safely", () => withTempDir((dir) => {
  copyPluginBundle(dir, "ui_ux_intelligence");
  fs.rmSync(path.join(dir, "plugins", "ui_ux_intelligence", "data", "manifest.json"), { force: true });

  const knowledgePack = JSON.parse(runKvdf(["ui-ux-intelligence", "knowledge-pack", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(knowledgePack.report_type, "ui_ux_intelligence_knowledge_pack");
  assert.ok(["warning", "blocked"].includes(knowledgePack.status));

  const catalogHealth = JSON.parse(runKvdf(["ui-ux-intelligence", "catalog-health", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(catalogHealth.report_type, "ui_ux_intelligence_catalog_health");
  assert.ok(["warning", "blocked", "pass"].includes(catalogHealth.status));

  const governance = JSON.parse(runKvdf(["ui-ux-intelligence", "governance", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(governance.report_type, "ui_ux_intelligence_governance");
  assert.ok(["warning", "blocked"].includes(governance.status));
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);
}));

test("planner docs materialize can enrich UI/UX docs in dry-run mode without writing files", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");
  runKvdf(["plugins", "install", "ui_ux_intelligence"], { cwd: dir });
  const report = JSON.parse(runKvdf(["planner", "docs", "materialize", "--idea", "Build booking app", "--track", "vibe", "--app", "booking", "--method", "hybrid", "--dry-run", "--include-ui-ux-intelligence", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.report_type, "kvdf_planner_docs_materialization");
  assert.ok(report.ui_ux_intelligence);
  assert.ok(typeof report.ui_ux_intelligence.sections_added === "number");
  assert.strictEqual(fs.existsSync(path.join(dir, "workspaces", "apps", "booking", "docs", "ui-ux", "UI_UX_DESIGN.md")), false);
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri", "planner_docs_status.json")), false);
}));

test("planner review, visual, prompt, and tailwind guidance surface optional ui_ux_intelligence summaries", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");
  runKvdf(["plugins", "install", "ui_ux_intelligence"], { cwd: dir });
  const review = JSON.parse(runKvdf(["planner", "review", "--goal", "Build booking app", "--track", "vibe", "--method", "hybrid", "--include-ui-ux-intelligence", "--include-tailwind-ui", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(review.report_type, "kvdf_planner_review");
  assert.ok(review.ui_ux_review);
  assert.strictEqual(review.ui_ux_review.standalone, true);
  assert.strictEqual(review.ui_ux_review.external_github_dependency, false);
  assert.ok(["pass", "warning", "unavailable"].includes(review.ui_ux_review.status));
  assert.ok(Object.prototype.hasOwnProperty.call(review.ui_ux_review, "handoff_pack_status"));
  assert.ok(review.ui_ux_handoff_pack);
  assert.strictEqual(review.ui_ux_handoff_pack.standalone, true);
  assert.strictEqual(review.ui_ux_handoff_pack.external_github_dependency, false);
  assert.ok(review.ui_ux_prompt_pack);
  assert.strictEqual(review.ui_ux_prompt_pack.standalone, true);
  assert.strictEqual(review.ui_ux_prompt_pack.external_github_dependency, false);
  assert.ok(Array.isArray(review.ui_ux_prompt_pack.prompt_titles));
  assert.ok(review.ui_ux_acceptance_gate);
  assert.strictEqual(review.ui_ux_acceptance_gate.standalone, true);
  assert.strictEqual(review.ui_ux_acceptance_gate.external_github_dependency, false);
  assert.ok(Array.isArray(review.ui_ux_acceptance_gate.blockers));
  assert.ok(review.ui_ux_governance);
  assert.strictEqual(review.ui_ux_governance.status, "available");
  assert.ok(review.tailwind_ui_review);
  assert.strictEqual(review.tailwind_ui_review.core_dependency, false);
  assert.strictEqual(review.tailwind_ui_review.core_dev_dependency, false);
  assert.ok(["pass", "warning", "unavailable"].includes(review.tailwind_ui_review.status));

  const visual = JSON.parse(runKvdf(["planner", "visual", "--goal", "Build booking app", "--track", "vibe", "--include-ui-ux-intelligence", "--include-tailwind-ui", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visual.report_type, "kvdf_planner_visual");
  assert.ok(Object.prototype.hasOwnProperty.call(visual, "ui_ux_intelligence_status"));
  assert.ok(Object.prototype.hasOwnProperty.call(visual, "tailwind_ui_status"));
  assert.ok(visual.markdown_report.includes("## UI/UX Intelligence"));
  assert.ok(visual.markdown_report.includes("## Tailwind UI"));
  assert.ok(visual.markdown_report.includes("Governance:"));
  assert.ok(visual.markdown_report.includes("Handoff pack:"));
  assert.ok(visual.markdown_report.includes("Pattern library:"));
  assert.ok(visual.markdown_report.includes("Prompt pack:"));

  const prompt = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Build booking app", "--track", "vibe", "--include-ui-ux-intelligence", "--include-tailwind-ui", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(prompt.report_type, "kvdf_planner_codex_prompt");
  assert.ok(prompt.prompt.includes("## UI/UX Intelligence"));
  assert.ok(prompt.prompt.includes("## Tailwind UI"));
  assert.ok(prompt.prompt.includes("Governance:"));
  assert.ok(prompt.prompt.includes("Handoff pack:"));
  assert.ok(prompt.prompt.includes("Pattern library:"));
  assert.ok(prompt.prompt.includes("Prompt pack:"));
  assert.ok(prompt.prompt.includes("Acceptance gate:"));
  assert.ok(prompt.prompt.includes("Visual QA:"));
  assert.ok(prompt.prompt.includes("Evidence manifest:"));
  assert.ok(prompt.prompt.includes("Target docs:"));
  assert.ok(prompt.prompt.includes("Reminder: do not overwrite existing UI/UX docs"));
  assert.ok(prompt.prompt.includes("Stop condition: stop until the required UI/UX evidence"));

  const promptWithoutTailwind = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Build booking app", "--track", "vibe", "--no-tailwind-ui", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(promptWithoutTailwind.report_type, "kvdf_planner_codex_prompt");
  assert.ok(typeof promptWithoutTailwind.prompt === "string");
  assert.ok(!promptWithoutTailwind.prompt.includes("## Tailwind UI"));

  const promptWithoutUiUx = JSON.parse(runKvdf(["planner", "prompt", "--goal", "Build booking app", "--track", "vibe", "--no-ui-ux-intelligence", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(promptWithoutUiUx.report_type, "kvdf_planner_codex_prompt");
  assert.ok(typeof promptWithoutUiUx.prompt === "string");
  assert.ok(!promptWithoutUiUx.prompt.includes("Pattern library:"));
  assert.ok(!promptWithoutUiUx.prompt.includes("Prompt pack:"));
  assert.ok(!promptWithoutUiUx.prompt.includes("Acceptance gate:"));
}));

test("ui_ux_intelligence evidence visual qa acceptance gate and regression stay metadata-only", () => withTempDir((dir) => {
  copyPluginBundle(dir, "ui_ux_intelligence");
  fs.rmSync(path.join(dir, "plugins", "ui_ux_intelligence", "_temp_meta"), { recursive: true, force: true });

  const evidence = JSON.parse(runKvdf(["ui-ux-intelligence", "evidence", "--app", "booking", "--evidence", "home.png,booking-error.png", "--screens", "home,booking", "--states", "default,error", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(evidence.report_type, "ui_ux_intelligence_evidence_manifest");
  assert.ok(Array.isArray(evidence.evidence_items));
  assert.ok(evidence.evidence_items.length > 0);
  assert.ok(evidence.summary);
  assert.strictEqual(evidence.standalone, true);
  assert.strictEqual(evidence.external_github_dependency, false);
  const evidenceOutput = path.join("docs", "reports", "uiux-evidence.md");
  const evidenceWithOutput = JSON.parse(runKvdf(["ui-ux-intelligence", "evidence", "--app", "booking", "--evidence", "home.png,booking-error.png", "--output", evidenceOutput, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(evidenceWithOutput.report_type, "ui_ux_intelligence_evidence_manifest");
  assert.ok(fs.existsSync(path.join(dir, evidenceOutput)));
  assert.ok(fs.readFileSync(path.join(dir, evidenceOutput), "utf8").startsWith("# UI/UX Evidence Manifest"));

  const visualQa = JSON.parse(runKvdf(["ui-ux-intelligence", "visual-qa", "--idea", "Build booking app", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visualQa.report_type, "ui_ux_intelligence_visual_qa_contract");
  assert.ok(Array.isArray(visualQa.required_screens));
  assert.ok(Array.isArray(visualQa.required_states));
  assert.ok(Array.isArray(visualQa.required_breakpoints));
  assert.ok(visualQa.evidence_status);
  assert.ok(Array.isArray(visualQa.evidence_status.missing));
  const visualOutput = path.join("docs", "reports", "uiux-visual-qa.md");
  const visualWithOutput = JSON.parse(runKvdf(["ui-ux-intelligence", "visual-qa", "--idea", "Build booking app", "--app", "booking", "--output", visualOutput, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(visualWithOutput.report_type, "ui_ux_intelligence_visual_qa_contract");
  assert.ok(fs.existsSync(path.join(dir, visualOutput)));
  assert.ok(fs.readFileSync(path.join(dir, visualOutput), "utf8").startsWith("# UI/UX Visual QA Contract"));

  const acceptance = JSON.parse(runKvdf(["ui-ux-intelligence", "acceptance-gate", "--idea", "Build booking app", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(acceptance.report_type, "ui_ux_intelligence_acceptance_gate");
  assert.ok(Array.isArray(acceptance.criteria));
  assert.ok(typeof acceptance.status === "string");
  assert.ok(Array.isArray(acceptance.blockers));
  assert.ok(Array.isArray(acceptance.warnings));
  const acceptanceOutput = path.join("docs", "reports", "uiux-acceptance-gate.md");
  const acceptanceWithOutput = JSON.parse(runKvdf(["ui-ux-intelligence", "acceptance-gate", "--idea", "Build booking app", "--app", "booking", "--output", acceptanceOutput, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(acceptanceWithOutput.report_type, "ui_ux_intelligence_acceptance_gate");
  assert.ok(fs.existsSync(path.join(dir, acceptanceOutput)));
  assert.ok(fs.readFileSync(path.join(dir, acceptanceOutput), "utf8").startsWith("# UI/UX Acceptance Gate"));

  const strictAcceptance = JSON.parse(runKvdf(["ui-ux-intelligence", "acceptance-gate", "--idea", "Build booking app", "--app", "booking", "--strict", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(strictAcceptance.report_type, "ui_ux_intelligence_acceptance_gate");
  assert.ok(["warning", "blocked", "pass"].includes(strictAcceptance.status));
  assert.ok(strictAcceptance.criteria.some((item) => item.title.includes("UI/UX docs")));

  const regression = JSON.parse(runKvdf(["ui-ux-intelligence", "regression", "--idea", "Build booking app", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(regression.report_type, "ui_ux_intelligence_regression_checklist");
  assert.ok(Array.isArray(regression.items));
  assert.ok(regression.items.length > 0);
  assert.ok(regression.summary);

  const outputFile = path.join("docs", "reports", "uiux-regression.md");
  const withOutput = JSON.parse(runKvdf(["ui-ux-intelligence", "regression", "--idea", "Build booking app", "--app", "booking", "--output", outputFile, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(withOutput.report_type, "ui_ux_intelligence_regression_checklist");
  assert.ok(fs.existsSync(path.join(dir, outputFile)));
  assert.ok(fs.readFileSync(path.join(dir, outputFile), "utf8").startsWith("# UI/UX Regression Checklist"));

  assert.strictEqual(fs.existsSync(path.join(dir, "workspaces", "apps", "booking", "src")), false);
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);
}));

test("planner visual and dashboard state expose ui_ux_intelligence safely", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");
  runKvdf(["plugins", "install", "ui_ux_intelligence"], { cwd: dir });

  const dashboard = JSON.parse(runKvdf(["dashboard", "viber", "state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(dashboard.report_type, "kvdf_viber_dashboard_state");
  assert.ok(dashboard.ui_ux_intelligence);
  assert.strictEqual(dashboard.ui_ux_intelligence.standalone, true);
  assert.strictEqual(dashboard.ui_ux_intelligence.external_github_dependency, false);
  assert.ok(["available", "warning", "unavailable"].includes(dashboard.ui_ux_intelligence.status));
  assert.ok(Array.isArray(dashboard.ui_ux_intelligence.target_docs));
  assert.ok(Object.prototype.hasOwnProperty.call(dashboard.ui_ux_intelligence, "handoff_pack_ready"));
  assert.ok(Object.prototype.hasOwnProperty.call(dashboard.ui_ux_intelligence, "handoff_pack_status"));
  assert.ok(Object.prototype.hasOwnProperty.call(dashboard.ui_ux_intelligence, "governance"));
  assert.ok(Object.prototype.hasOwnProperty.call(dashboard, "ui_ux_intelligence_governance"));
  assert.ok(dashboard.tailwind_ui);
  assert.ok(["tailwind_ui", "fallback"].includes(dashboard.tailwind_ui.provider));
  assert.strictEqual(dashboard.tailwind_ui.core_dependency, false);
  assert.strictEqual(dashboard.tailwind_ui.core_dev_dependency, false);
  assert.strictEqual(dashboard.tailwind_ui.runtime_mode, "guidance_only");
  assert.ok(dashboard.ui_ux_acceptance);
  assert.ok(["pass", "warning", "blocked", "unavailable"].includes(dashboard.ui_ux_acceptance.status));
}));

test("ui_ux_intelligence implementation artifacts generate tokens components screens and handoff packs", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "ui_ux_intelligence");

  const tokens = JSON.parse(runKvdf(["ui-ux-intelligence", "tokens", "--idea", "Build booking app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(tokens.report_type, "ui_ux_intelligence_tokens");
  assert.ok(tokens.tokens);
  assert.ok(tokens.tokens.color);
  assert.ok(tokens.tokens.typography);
  assert.ok(tokens.tokens.spacing);
  assert.strictEqual(tokens.standalone, true);
  assert.strictEqual(tokens.external_github_dependency, false);

  const components = JSON.parse(runKvdf(["ui-ux-intelligence", "components", "--idea", "Build booking app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(components.report_type, "ui_ux_intelligence_component_blueprint");
  assert.ok(Array.isArray(components.components));
  assert.ok(components.components.length > 0);
  assert.ok(Array.isArray(components.components[0].states));
  assert.ok(Array.isArray(components.components[0].acceptance_criteria));

  const screens = JSON.parse(runKvdf(["ui-ux-intelligence", "screens", "--idea", "Build booking app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(screens.report_type, "ui_ux_intelligence_screen_blueprint");
  assert.ok(Array.isArray(screens.screens));
  assert.ok(screens.screens.length > 0);
  assert.ok(Array.isArray(screens.information_architecture));
  assert.ok(Array.isArray(screens.user_flow_summary));

  const scorecard = JSON.parse(runKvdf(["ui-ux-intelligence", "scorecard", "--idea", "Build booking app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(scorecard.report_type, "ui_ux_intelligence_scorecard");
  assert.ok(typeof scorecard.score === "number");
  assert.ok(scorecard.grade);
  assert.ok(scorecard.sections);

  const gate = JSON.parse(runKvdf(["ui-ux-intelligence", "gate", "--app", "booking", "--stage", "ui_ux_design", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(gate.report_type, "ui_ux_intelligence_gate");
  assert.ok(["pass", "warning", "blocked", "not_applicable"].includes(gate.status));

  const readiness = JSON.parse(runKvdf(["ui-ux-intelligence", "readiness", "--app", "booking", "--stage", "handoff", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(readiness.report_type, "ui_ux_intelligence_viber_readiness");
  assert.ok(Array.isArray(readiness.docs_checked));
  assert.ok(Array.isArray(readiness.missing_docs));

  const handoffPack = JSON.parse(runKvdf(["ui-ux-intelligence", "handoff-pack", "--idea", "Build booking app", "--app", "booking", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(handoffPack.report_type, "ui_ux_intelligence_handoff_pack");
  assert.ok(handoffPack.tokens);
  assert.ok(handoffPack.components);
  assert.ok(handoffPack.screens);
  assert.ok(handoffPack.checklist);
  assert.ok(handoffPack.scorecard);
  assert.ok(Array.isArray(handoffPack.target_docs));
  assert.ok(Array.isArray(handoffPack.markdown_sections));
  assert.strictEqual(handoffPack.standalone, true);
  assert.strictEqual(handoffPack.external_github_dependency, false);
  assert.strictEqual(fs.existsSync(path.join(dir, "workspaces", "apps", "booking", "src")), false);
  assert.ok(!fs.existsSync(path.join(dir, "docs", "reports", "uiux-handoff.md")));

  const outputFile = path.join("docs", "reports", "uiux-handoff.md");
  const withOutput = JSON.parse(runKvdf(["ui-ux-intelligence", "handoff-pack", "--idea", "Build booking app", "--app", "booking", "--output", outputFile, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(withOutput.report_type, "ui_ux_intelligence_handoff_pack");
  assert.ok(fs.existsSync(path.join(dir, outputFile)));
  assert.ok(fs.readFileSync(path.join(dir, outputFile), "utf8").startsWith("# UI/UX Handoff Pack"));

  const unsafe = runKvdf(["ui-ux-intelligence", "handoff-pack", "--idea", "Build booking app", "--app", "booking", "--output", "..\\outside.md", "--json"], { cwd: dir, expectFailure: true });
  assert.ok(/Unsafe output path/i.test(unsafe.stderr));
}));

test("ui_ux_intelligence patterns implementation guidance and prompt pack stay local and export markdown only when requested", () => withTempDir((dir) => {
  copyPluginBundle(dir, "ui_ux_intelligence");

  const patterns = JSON.parse(runKvdf(["ui-ux-intelligence", "patterns", "--idea", "Build booking app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(patterns.report_type, "ui_ux_intelligence_pattern_library");
  assert.ok(Array.isArray(patterns.patterns));
  assert.ok(patterns.patterns.length > 0);
  assert.ok(Array.isArray(patterns.recommended_order));
  assert.strictEqual(patterns.standalone, true);
  assert.strictEqual(patterns.external_github_dependency, false);

  const implementation = JSON.parse(runKvdf(["ui-ux-intelligence", "implementation-guidance", "--idea", "Build booking app", "--stack", "react", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(implementation.report_type, "ui_ux_intelligence_implementation_guidance");
  assert.strictEqual(implementation.stack, "react");
  assert.ok(Array.isArray(implementation.guidance.component_strategy));
  assert.ok(Array.isArray(implementation.guidance.screen_strategy));
  assert.ok(Array.isArray(implementation.guidance.anti_patterns_to_avoid));
  assert.strictEqual(implementation.standalone, true);
  assert.strictEqual(implementation.external_github_dependency, false);

  const fallbackImplementation = JSON.parse(runKvdf(["ui-ux-intelligence", "implementation-guidance", "--idea", "Build booking app", "--stack", "unknown_stack", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(fallbackImplementation.report_type, "ui_ux_intelligence_implementation_guidance");
  assert.strictEqual(fallbackImplementation.stack, "unknown_stack");
  assert.ok(fallbackImplementation.guidance.component_strategy.join(" ").includes("framework-neutral"));

  const promptPack = JSON.parse(runKvdf(["ui-ux-intelligence", "prompt-pack", "--idea", "Build booking app", "--stack", "react", "--executor", "codex", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(promptPack.report_type, "ui_ux_intelligence_prompt_pack");
  assert.strictEqual(promptPack.executor, "codex");
  assert.ok(Array.isArray(promptPack.prompts));
  assert.ok(promptPack.prompts.length > 0);
  assert.ok(Array.isArray(promptPack.constraints));
  assert.ok(promptPack.prompts[0].prompt.includes("Accessibility requirements"));
  assert.ok(promptPack.prompts[0].prompt.includes("Responsive requirements"));
  assert.ok(promptPack.prompts[0].prompt.includes("UI states required"));
  assert.ok(promptPack.prompts[0].prompt.includes("Anti-patterns to avoid"));
  assert.ok(promptPack.prompts[0].prompt.includes("Stop condition"));
  assert.ok(Array.isArray(promptPack.validation_commands));

  const outputFile = path.join("docs", "reports", "uiux-prompt-pack.md");
  const withOutput = JSON.parse(runKvdf(["ui-ux-intelligence", "prompt-pack", "--idea", "Build booking app", "--stack", "react", "--executor", "codex", "--output", outputFile, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(withOutput.report_type, "ui_ux_intelligence_prompt_pack");
  assert.ok(fs.existsSync(path.join(dir, outputFile)));
  assert.ok(fs.readFileSync(path.join(dir, outputFile), "utf8").startsWith("# UI/UX Prompt Pack"));

  const unsafe = runKvdf(["ui-ux-intelligence", "prompt-pack", "--idea", "Build booking app", "--stack", "react", "--executor", "codex", "--output", "..\\outside.md", "--json"], { cwd: dir, expectFailure: true });
  assert.ok(/Unsafe output path/i.test(unsafe.stderr));

  assert.strictEqual(fs.existsSync(path.join(dir, "workspaces", "apps", "booking", "src")), false);
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);
}));

test("ui_ux_intelligence audit scores rich UI text better than sparse text and strict mode can block", () => withTempDir((dir) => {
  copyPluginBundle(dir, "ui_ux_intelligence");
  fs.rmSync(path.join(dir, "plugins", "ui_ux_intelligence", "_temp_meta"), { recursive: true, force: true });

  const sparseFile = path.join(dir, "sparse-ui.md");
  const richFile = path.join(dir, "rich-ui.md");
  fs.writeFileSync(sparseFile, "# UI\n\nShort note without much detail.\n", "utf8");
  fs.writeFileSync(richFile, [
    "# UI UX Design",
    "",
    "## Responsive",
    "The layout stays mobile, tablet, and desktop friendly with no horizontal scrolling.",
    "",
    "## Accessibility",
    "Visible focus states, keyboard navigation, contrast, semantic structure, alt text, and reduced motion are all documented.",
    "",
    "## States",
    "Loading, empty state, error state, and success state are all described for the main flow.",
    "",
    "## Handoff",
    "The handoff checklist, validation messages, and recovery path are all included.",
    "",
    "## Notes",
    "Form validation, destructive action confirmation, and clear contrast notes are provided."
  ].join("\n"), "utf8");

  const sparse = JSON.parse(runKvdf(["ui-ux-intelligence", "audit", "--target", sparseFile, "--json"], { cwd: dir }).stdout);
  const rich = JSON.parse(runKvdf(["ui-ux-intelligence", "audit", "--target", richFile, "--json"], { cwd: dir }).stdout);
  assert.strictEqual(sparse.report_type, "ui_ux_intelligence_audit");
  assert.ok(sparse.findings.length > rich.findings.length);
  assert.ok(["pass", "warning"].includes(rich.status));

  const strictBlocked = JSON.parse(runKvdf(["ui-ux-intelligence", "audit", "--target", sparseFile, "--strict", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(strictBlocked.status, "blocked");
  assert.ok(strictBlocked.summary.blockers > 0);
  assert.strictEqual(fs.existsSync(path.join(dir, ".kabeeri")), false);
}));

test("ui_ux_intelligence runtime stays offline and does not depend on an external repository", () => {
  const runtimeFiles = [
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "index.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "catalog.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "search_engine.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "recommender.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "design_system.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "checklist.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "docs_adapter.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "audit.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "scorecard.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "gate.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "readiness.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "tokens.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "components.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "screens.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "handoff_pack.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "pattern_library.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "implementation_guidance.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "prompt_pack.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "knowledge_pack.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "catalog_health.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "governance_registry.js"),
    path.join(repoRoot, "plugins", "ui_ux_intelligence", "runtime", "upgrade_plan.js")
  ];
  for (const file of runtimeFiles) {
    const source = fs.readFileSync(file, "utf8");
    assert.ok(!/github\.com/i.test(source), `${path.basename(file)} should not reference external GitHub repositories`);
    assert.ok(!/\bfetch\s*\(/i.test(source), `${path.basename(file)} should not depend on fetch()`);
    assert.ok(!/\baxios\b/i.test(source), `${path.basename(file)} should not depend on axios`);
    assert.ok(!/_temp_meta/i.test(source), `${path.basename(file)} should not depend on _temp_meta`);
  }
});

test("planner-visual render writes the shared mermaid browser preview without opening it", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  copyPluginBundle(dir, "planner-visual");
  runKvdf(["plugins", "install", "planner-visual"], { cwd: dir });

  const previousCwd = process.cwd();
  const opened = [];
  process.chdir(dir);
  try {
    const proposal = JSON.parse(runKvdf(["planner", "propose", "--goal", "Render planner visual", "--track", "owner", "--json"], { cwd: dir }).stdout);
    runKvdf(["planner", "approve", proposal.plan_id, "--owner", "local-owner", "--json"], { cwd: dir });
    plannerVisual(
      "render",
      null,
      { fullscreen: true, fromCurrent: true },
      [],
      {
        ensureWorkspace: () => {},
        repoRoot: () => dir,
        openExternalUrl: (url) => opened.push(url)
      }
    );
  } finally {
    process.chdir(previousCwd);
  }

  assert.strictEqual(opened.length, 0);
  const previewFile = path.join(dir, ".kabeeri", "reports", "planner_visual_plugin_preview.html");
  assert.ok(fs.existsSync(previewFile));
  const html = fs.readFileSync(previewFile, "utf8");
  assert.match(html, /Planner Visual Preview/);
  assert.match(html, /Planner visual markdown/);
  assert.match(html, /Diagram Graph/);
  assert.match(html, /KVDF UI assets: fallback/);
  assert.match(html, /data-zoom-in/);
  assert.match(html, /data-zoom-range/);
  assert.match(html, /overflow-y: auto/);
}));

test("planner visual renderers output Mermaid text without depending on a Mermaid package", () => {
  const sample = {
    report_type: "kvdf_planner_visual",
    planner_mode: "owner",
    track: "framework_owner",
    delivery_mode: "direct_main",
    goal: "Add visual planner",
    recommended_evolution: { title: "Add visual planner", area: "planner", reason: "Render the plan" },
    graph: {
      format: "mermaid",
      diagram: "flowchart TD\n  A[Owner Direction] --> B[Planner Proposal]\n  B --> C[Owner Approval]\n  C --> D[Direct-to-main Commit]"
    },
    board: {
      columns: [
        { id: "proposed", title: "Proposed", cards: [{ id: "a", title: "Plan" }] },
        { id: "approved", title: "Approved", cards: [] },
        { id: "in_progress", title: "In Progress", cards: [] },
        { id: "blocked", title: "Blocked", cards: [] },
        { id: "verified", title: "Verified", cards: [] },
        { id: "completed", title: "Completed", cards: [] }
      ]
    },
    scope_map: {
      allowed_files: ["src/cli/commands/planner.js"],
      forbidden_files: ["KVDOS/", ".kabeeri/"],
      runtime_state: [".kabeeri/planner.json"],
      generated_artifacts: ["docs/reports/KVDF_PLANNER_VISUAL.md"],
      docs: ["docs/cli/CLI_COMMAND_REFERENCE.md"],
      tests: ["tests/cli.integration.test.js"]
    },
    validation_commands: ["node bin/kvdf.js validate", "npm test", "npm run check"],
    stop_condition: "Stop when the approved plan is ready."
  };

  const mermaid = plannerVisualRenderer.renderMermaidDiagram(sample);
  const board = plannerVisualRenderer.renderPlanningBoard(sample);
  const scope = plannerVisualRenderer.renderScopeMap(sample);
  const markdown = plannerVisualRenderer.renderMarkdownVisualReport(sample);

  assert.match(mermaid, /```mermaid/);
  assert.match(mermaid, /Owner Direction/);
  assert.match(board, /Planning Board/);
  assert.match(board, /Proposed/);
  assert.match(scope, /Scope Map/);
  assert.match(scope, /Allowed Files/);
  assert.match(markdown, /Validation Commands/);
  assert.match(markdown, /Stop Condition/);

  const runtimeSource = fs.readFileSync(path.join(repoRoot, "plugins", "planner_visual", "runtime", "index.js"), "utf8");
  const mermaidSource = fs.readFileSync(path.join(repoRoot, "plugins", "planner_visual", "runtime", "mermaid_renderer.js"), "utf8");
  assert.ok(!runtimeSource.includes("require(\"mermaid\")"));
  assert.ok(!mermaidSource.includes("require(\"mermaid\")"));
});

test("capability surface maps capabilities to CLI command families and docs references", () => {
  const surface = JSON.parse(runKvdf(["capability", "surface", "--json"]).stdout);
  assert.strictEqual(surface.report_type, "kvdf_capability_cli_surface");
  assert.strictEqual(surface.coverage.total_capabilities, 53);
  assert.strictEqual(surface.coverage.partial_capabilities, 0);
  assert.ok(surface.capabilities.some((item) => item.key === "payments_billing" && item.cli_surface.includes("kvdf release")));
  assert.ok(surface.capabilities.some((item) => item.key === "kabeeri_control_layer" && item.cli_surface.includes("kvdf change report")));
  assert.ok(Array.isArray(surface.capabilities[0].docs_surface));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs", "reports", "KVDF_CAPABILITY_CLI_SURFACE.json")));
});

test("capability documentation matrix links every capability to docs cli runtime tests and reports", () => {
  const matrix = JSON.parse(runKvdf(["capability", "matrix", "--json"]).stdout);
  assert.strictEqual(matrix.report_type, "kvdf_capability_doc_matrix");
  assert.strictEqual(matrix.total_capabilities, 53);
  assert.strictEqual(matrix.coverage.total_capabilities, 53);
  assert.strictEqual(matrix.coverage.complete_capabilities, 53);
  assert.strictEqual(matrix.coverage.partial_capabilities, 0);
  assert.strictEqual(matrix.rows.length, 53);
  assert.ok(matrix.rows.some((item) => item.key === "payments_billing" && item.docs_links.some((link) => link.includes("SYSTEM_CAPABILITIES_REFERENCE.md"))));
  assert.ok(matrix.rows.some((item) => item.key === "kabeeri_control_layer" && item.cli_links.includes("kvdf evolution")));
  assert.ok(matrix.rows.every((item) => item.docs_links.length > 0 && item.cli_links.length > 0 && item.runtime_links.length > 0 && item.test_links.length > 0 && item.report_links.length > 0));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs", "reports", "KVDF_CAPABILITY_DOC_MATRIX.json")));
});

test("capability search indexes track capability command phase and report type facets", () => {
  const search = JSON.parse(runKvdf(["capability", "search", "payments", "--json"]).stdout);
  assert.strictEqual(search.report_type, "kvdf_capability_search_index");
  assert.ok(search.total_entries > search.total_matches);
  assert.ok(search.results.some((item) => item.capability === "payments_billing"));
  assert.ok(search.results.some((item) => item.track === "shared"));
  assert.ok(search.results.some((item) => item.report_type === "kvdf_capability_doc_matrix"));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs", "reports", "KVDF_CAPABILITY_SEARCH_INDEX.json")));

  const ownerSearch = JSON.parse(runKvdf(["capability", "search", "--track", "framework_owner", "--report-type", "kvdf_feature_restructure_roadmap", "--json"]).stdout);
  assert.ok(ownerSearch.results.length > 0);
  assert.ok(ownerSearch.results.every((item) => item.track === "framework_owner"));
  assert.ok(ownerSearch.results.every((item) => item.report_type === "kvdf_feature_restructure_roadmap"));
});

test("evolution execution report persists a resumable report for the next open priority", () => {
  const report = JSON.parse(runKvdf(["evolution", "report", "evo-auto-041-execution-reports", "--json"]).stdout);
  assert.strictEqual(report.report_type, "evolution_execution_report");
  assert.strictEqual(report.target_priority.id, "evo-auto-041-execution-reports");
  assert.strictEqual(report.target_priority.status, "done");
  assert.strictEqual(report.report_path, "docs/reports/EVO_AUTO_041_EXECUTION_REPORT.md");
  assert.ok(Array.isArray(report.resume_steps));
  assert.ok(report.resume_steps.length > 0);
  assert.ok(Array.isArray(report.verification_commands));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs", "reports", "EVO_AUTO_041_EXECUTION_REPORT.md")));
});

test("cleaner cleanup saves an organized audit report", () => {
  withTempDir((dir) => {
    fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
    fs.mkdirSync(path.join(dir, "plugins", "kvdf_dev"), { recursive: true });
    fs.mkdirSync(path.join(dir, "src", "cli"), { recursive: true });
    fs.writeFileSync(path.join(dir, "plugins", "kvdf_dev", "plugin.json"), JSON.stringify({
      plugin_id: "kvdf-dev",
      name: "KVDF Dev System Bundle",
      plugin_version: "1.0.0",
      bundle_type: "removable",
      load_strategy: "manifest_driven",
      removable: true,
      track: "framework_owner",
      enabled_by_default: true,
      required_folders: ["commands", "docs"],
      command_surface: ["kvdf cleaner cleanup", "kvdf cleaner inspect"],
      docs_surface: ["plugins/kvdf_dev/docs/index.md"]
    }, null, 2), "utf8");
    fs.writeFileSync(path.join(dir, "src", "cli", "index.js"), "console.log('cleaner');\n", "utf8");
    const result = runKvdf(["cleaner", "cleanup", "--json"], { cwd: dir });
    const report = JSON.parse(result.stdout);
    assert.strictEqual(report.report_type, "kvdf_system_cleanup_audit");
    assert.ok(Array.isArray(report.cleanup_queue));
    assert.match(report.next_exact_action, /kvdf cleaner approve --confirm/);
    assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "kvdf_cleanup_audit.json")));
    assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_CLEANUP_AUDIT.md")));
    const summary = JSON.parse(runKvdf(["cleaner", "report", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(summary.report_type, "kvdf_system_cleanup_summary");
    assert.strictEqual(summary.cleanup_id, report.cleanup_id);
    assert.match(summary.clean_status_line, /awaiting_approval/);
    assert.ok(Array.isArray(summary.queue_highlights));
    assert.ok(summary.queue_highlights.length > 0);
    const output = runKvdf(["cleaner", "report"], { cwd: dir }).stdout;
    assert.match(output, /Clean status:/);
    assert.match(output, /KVDF Cleaner Summary/);
    assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "kvdf_cleanup_summary.json")));
    assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_CLEANUP_SUMMARY.md")));
    const inspection = JSON.parse(runKvdf(["cleaner", "inspect", "--json"], { cwd: dir }).stdout);
    assert.strictEqual(inspection.report_type, "kvdf_maintenance_inspection_report");
    assert.ok(inspection.inspection);
    assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "reports", "kvdf_maintenance_inspection.json")));
    assert.ok(fs.existsSync(path.join(dir, "docs", "reports", "KVDF_MAINTENANCE_INSPECTION.md")));
  });
});

let failed = 0;
for (const item of tests) {
  try {
    item.fn();
    console.log(`OK ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${item.name}`);
    console.error(error.stack || error.message);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} integration tests passed.`);
}
