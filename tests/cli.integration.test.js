const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const { run } = require("../src/cli");
const { release } = require("../src/cli/commands/release");
const evolutionService = require("../src/cli/services/evolution");
const wordpressStateService = require("../src/cli/services/wordpress");
const wordpressPlanService = require("../src/cli/services/wordpress_plans");
const { buildMultiAiRelayReport, watchMultiAiRelay } = require("../src/cli/commands/multi_ai_communications");

const repoRoot = path.resolve(__dirname, "..");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function runKvdf(args, options = {}) {
  const cwd = options.cwd || repoRoot;
  const previousCwd = process.cwd();
  const mergedEnv = { ...(options.env || {}) };
  mergedEnv.KVDF_DISABLE_GIT_SPAWN = "1";
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

test("root commands validate repository assets", () => {
  assert.match(runKvdf(["--version"]).stdout, /kvdf 0\.2\.0/);
  assert.match(runKvdf(["--help"]).stdout, /Kabeeri VDF CLI/);
  assert.match(runKvdf(["create", "--help"]).stdout, /kvdf create --profile lite/);
  for (const command of ["resume", "entry", "track", "guard", "conflict", "sync", "sprint", "session", "multi-ai", "acceptance", "developer", "agent", "lock", "pricing", "usage", "release", "design", "policy", "workstream", "vibe", "ask", "capture", "package", "upgrade", "readiness", "governance", "reports", "context-pack", "preflight", "model-route", "handoff", "security", "migration", "adr", "ai-run", "structure", "blueprint", "data-design", "evolution", "wordpress", "docs", "source-package", "capability"]) {
    const help = runKvdf([command, "--help"]).stdout;
    assert.match(help, /Usage:/, `${command} help should include usage`);
    assert.doesNotMatch(help, /No detailed help/, `${command} should have detailed help`);
  }
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
  assert.match(rootResume.next_exact_action, /Resolve pending UI\/UX decisions|Review current diff|Pick the next Evolution Steward priority/);
  assert.ok(rootResume.git_summary);
  const rootEntry = JSON.parse(runKvdf(["entry", "--json"]).stdout);
  assert.strictEqual(rootEntry.entry_route.track_id, "framework_owner");
  assert.strictEqual(rootEntry.entry_route.role_gate, "owner_only");
  assert.strictEqual(rootEntry.entry_route.route_command, "kvdf evolution priorities");
  assert.ok(rootEntry.entry_route.activated_features.includes("evolution temp"));
  assert.ok(rootEntry.entry_route.blocked_features.includes("app creation"));
  assert.strictEqual(JSON.parse(runKvdf(["guard", "--json"]).stdout).mode, "framework_source");
  assert.strictEqual(JSON.parse(runKvdf(["conflict", "scan", "--json"]).stdout).report_type, "framework_conflict_scan");
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
  assert.ok(["blocked", "ready_for_decommission"].includes(sourcePackageCleanup.status));
  const sourcePackageDecommission = JSON.parse(runKvdf(["source-package", "decommission", "--json"]).stdout);
  assert.strictEqual(sourcePackageDecommission.report_type, "kvdf_source_package_decommission_request");
  assert.ok(fs.existsSync(path.join(repoRoot, sourcePackageDecommission.report_path)));
  assert.strictEqual(sourcePackageDecommission.confirmation_required, true);
  assert.ok(["confirmation_required", "pending_manual_removal"].includes(sourcePackageDecommission.status));
  const sourcePackageDecommissionConfirmed = JSON.parse(runKvdf(["source-package", "decommission", "--confirm-remove", "--json"]).stdout);
  assert.strictEqual(sourcePackageDecommissionConfirmed.confirmed, true);
  assert.strictEqual(sourcePackageDecommissionConfirmed.status, "pending_manual_removal");
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
  assert.strictEqual(onboarding.enter_command, "kvdf init --profile standard --goal \"Describe the application\"");
  assert.strictEqual(onboarding.route_command, "kvdf entry");
  assert.strictEqual(onboarding.resume_command, "kvdf resume");
  assert.ok(fs.existsSync(path.join(dir, onboarding.report_path)));
  const saved = JSON.parse(fs.readFileSync(path.join(dir, onboarding.report_path), "utf8"));
  assert.strictEqual(saved.report_type, "session_onboarding");
  assert.strictEqual(saved.report_path, onboarding.report_path);
  assert.ok(saved.guide.first_steps.some((step) => /Enter with kvdf resume --json/.test(step) || /Use kvdf entry/.test(step)));
  const sessionTrack = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "session_track.json"), "utf8"));
  assert.strictEqual(sessionTrack.decision_source, "onboarding");
  assert.strictEqual(sessionTrack.started_from_mode, "unknown_folder");
  assert.strictEqual(sessionTrack.route_command, "kvdf init");
  assert.strictEqual(sessionTrack.active, false);
  const persisted = JSON.parse(runKvdf(["onboarding", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(persisted.report_type, "session_onboarding");
  assert.strictEqual(persisted.report_path, onboarding.report_path);
  assert.ok(persisted.recommended_commands.includes("kvdf entry"));
}));

test("resume persists a durable session track for workspace resumes", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--no-intake"], { cwd: dir });
  const report = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.mode, "kabeeri_user_workspace");
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
    assert.strictEqual(resume.track_context.session_track_surface, "developer");
    assert.strictEqual(resume.track_context.effective_track_surface, "owner");
    assert.strictEqual(resume.track_context.mismatch, true);
    const status = JSON.parse(runKvdf(["track", "status", "--json"]).stdout);
    assert.strictEqual(status.track_context.effective_track_surface, "owner");
    assert.strictEqual(status.track_context.mismatch, false);
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
  assert.ok(fs.existsSync(path.join(dir, "plugins", "owner-track", "docs", "index.md")), "owner docs index should exist");
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /workspace present/);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /runtime schema validation checked/);
  const upgrade = JSON.parse(runKvdf(["upgrade", "check", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(upgrade.report_type, "upgrade_check");
  assert.strictEqual(upgrade.current_cli_version, "0.2.0");
}));

test("init goal creates adaptive questions and docs-first tasks before implementation", () => withTempDir((dir) => {
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
  runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir });
  const lifecycleValidation = JSON.parse(runKvdf(["task", "lifecycle", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lifecycleValidation.current_stage, "validation");
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
  assert.strictEqual(trashLineage.route_count, 1);
  assert.strictEqual(trashLineage.restore_hint.command, "kvdf task trash restore task-001");
  assert.strictEqual(schedulerAfterComplete.trash_recovery.items[0].restore_command, "kvdf task trash restore task-001");
  const statusFromTrash = JSON.parse(runKvdf(["task", "status", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(statusFromTrash.id, "task-001");
  assert.strictEqual(statusFromTrash.trashed_reason, "completed");
  assert.strictEqual(statusFromTrash.lifecycle.current_stage, "archived");
  assert.ok(statusFromTrash.scheduler_history);
  assert.strictEqual(statusFromTrash.scheduler_history.current_location, "trash");
  const lifecycleArchived = JSON.parse(runKvdf(["task", "lifecycle", "task-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(lifecycleArchived.current_stage, "archived");
  assert.ok(lifecycleArchived.trashed_at);
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
  assert.strictEqual(restoredLineage.route_count, 2);
  assert.strictEqual(restoredLineage.restore_hint, null);
  const restoredTasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(restoredTasks.some((task) => task.id === "task-001"));
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
  const sweepState = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/task_trash.json"), "utf8"));
  assert.strictEqual(sweepState.trash.length, 1);
  assert.strictEqual(sweepState.trash[0].id, "task-live");
  assert.ok(sweepState.last_sweep_at);
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

  const state = JSON.parse(runKvdf(["dashboard", "state", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(state.task_tracker.summary.by_status.proposed, 1);
  assert.strictEqual(state.task_tracker.summary.by_status.owner_verified, 1);
  assert.strictEqual(state.task_tracker.summary.open, 1);
  assert.strictEqual(state.task_tracker.board.proposed[0].next_action, "approve or refine task scope");
  assert.strictEqual(state.task_tracker.tasks.find((task) => task.id === "task-state-001").next_action, "approve or refine task scope");
  assert.deepStrictEqual(state.task_tracker.tasks.find((task) => task.id === "task-state-002").blockers, []);
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
  assert.ok(result.change.impacted_areas.includes("dashboard"));
  assert.ok(result.change.impacted_areas.includes("docs"));
  assert.ok(result.change.impacted_areas.includes("capabilities"));
  assert.ok(["none", "review_required"].includes(result.change.duplicate_risk));
  assert.ok(result.tasks.length >= 6);
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
  assert.ok(summary.open_follow_up_tasks > 0);
  assert.ok(summary.next_priority);
  assert.strictEqual(summary.feature_restructure_work_order.total_steps, 7);
  const resume = JSON.parse(runKvdf(["resume", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(resume.evolution, null);
  const dashboard = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(dashboard.records.evolution_summary.changes_total, 1);
  const reports = JSON.parse(runKvdf(["reports", "live", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(reports.reports.evolution.changes_total, 1);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /evolution\.json matches/);
}));

test("evolution roadmap exposes the canonical seven-step restructure order", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
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
  assert.ok(partitionMatrix.buckets.find((bucket) => bucket.bucket_id === "plugins/owner-track").capabilities.some((item) => item.title === "Framework Owner Track / Evolution Steward"));
  assert.ok(partitionMatrix.buckets.find((bucket) => bucket.bucket_id === "workspaces/apps/<app-slug>").capabilities.some((item) => item.title === "Vibe App Developer Track"));
  assert.match(runKvdf(["evolution", "partition"], { cwd: dir }).stdout, /KVDF Capability Partition Matrix/);
  const pluginsStatus = JSON.parse(runKvdf(["plugins", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsStatus.report_type, "plugin_loader_status");
  assert.strictEqual(pluginsStatus.total_plugins, 1);
  assert.strictEqual(pluginsStatus.active_plugins, 1);
  assert.strictEqual(pluginsStatus.plugins[0].plugin_id, "owner-track");
  assert.strictEqual(pluginsStatus.plugins[0].status, "enabled");
  const pluginsShow = JSON.parse(runKvdf(["plugins", "show", "owner-track", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsShow.plugin_id, "owner-track");
  const pluginsDisabled = JSON.parse(runKvdf(["plugins", "disable", "owner-track", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsDisabled.active_plugins, 0);
  assert.strictEqual(pluginsDisabled.plugins[0].status, "disabled");
  const pluginsEnabled = JSON.parse(runKvdf(["plugins", "enable", "owner-track", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginsEnabled.active_plugins, 1);
  assert.strictEqual(pluginsEnabled.plugins[0].status, "enabled");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 1).title, "Task Trash System");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 2).title, "AI Agent Hub and Leader Lease");
  assert.strictEqual(priorities.priorities.find((item) => item.priority === 3).title, "Task Scheduler System");
  assert.strictEqual(priorities.priorities.find((item) => item.id === "evo-auto-018-capability-registry").title, "Capability Registry");
  assert.strictEqual(priorities.priorities.find((item) => item.id === "evo-auto-041-execution-reports").title, "Execution Reports");
  assert.match(runKvdf(["evolution", "priorities"], { cwd: dir }).stdout, /KVDF Feature Restructure Roadmap/);
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
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/questionnaires/adaptive_intake_plan.json"), "utf8"));
  assert.strictEqual(state.current_plan_id, plan.plan_id);
  assert.strictEqual(state.plans.length, 1);
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
  runKvdf(["questionnaire", "generate-tasks"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "tasks.json"), "utf8")).tasks;
  const uiTasks = tasks.filter((task) => task.type === "ui-decision-coverage");
  assert.ok(uiTasks.length >= 2);
  assert.ok(uiTasks.some((task) => /public frontend UI direction/i.test(task.title)));
  assert.ok(uiTasks.some((task) => /admin frontend UI direction/i.test(task.title)));
  assert.ok(uiTasks.every((task) => Array.isArray(task.acceptance_criteria) && task.acceptance_criteria.some((item) => /responsive priority/i.test(item))));
}));

test("questionnaire flow exposes a direct start path and operator notes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const flow = JSON.parse(runKvdf(["questionnaire", "flow", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(flow.start_here, "kvdf questionnaire flow");
  assert.match(flow.next_command, /kvdf questionnaire plan/);
  assert.ok(Array.isArray(flow.operator_notes));
  assert.ok(flow.operator_notes.some((note) => /capability list/i.test(note)));
}));

test("adaptive questionnaire planning follows user language", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const arabicPlan = JSON.parse(runKvdf(["questionnaire", "plan", "أريد بناء متجر إلكتروني بواجهة React وباك اند Laravel", "--json"], { cwd: dir }).stdout);
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

test("vibe-first commands classify suggestions convert tasks and capture work", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const session = JSON.parse(runKvdf(["vibe", "session", "start", "--title", "Ecommerce planning"], { cwd: dir }).stdout);
  assert.strictEqual(session.status, "active");
  const suggestion = JSON.parse(runKvdf(["vibe", "suggest", "Add admin dashboard settings screen where owner can save preferences"], { cwd: dir }).stdout);
  assert.strictEqual(suggestion.status, "suggested");
  assert.strictEqual(suggestion.workstream, "admin_frontend");
  assert.ok(suggestion.acceptance_criteria.length > 0);
  assert.match(runKvdf(["vibe", "list"], { cwd: dir }).stdout, /suggestion-001/);
  assert.match(runKvdf(["ask", "Improve the dashboard"], { cwd: dir }).stdout, /Before creating a governed task/);
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
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /Vibe-first Suggestions/);
  assert.match(html, /Post-work Captures/);
  assert.match(html, /Vibe Sessions and Briefs/);
}));

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
    /without acceptance/
  );
  runKvdf(["acceptance", "create", "--task", "task-001", "--criteria", "Reviewed"], { cwd: dir });
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass"], { cwd: dir });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout, /owner_verified/);
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
  assert.match(dashboard, /Workstream Governance/);
  assert.match(dashboard, /Execution Scopes/);
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
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Developer Mode/);
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
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Agile Backlog and Stories/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /__kvdf\/api\/agile/);
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
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Structured Delivery/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /__kvdf\/api\/structured/);
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
  assert.match(html, /Tracked vs Untracked AI Usage/);
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

test("dashboard export creates static html", () => withTempDir((dir) => {
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
  assert.doesNotMatch(clientHtml, /Kabeeri VDF Dashboard/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/site/customer/apps/acme/index.html")));
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.contracts.dashboard.ok, true);
  assert.strictEqual(state.contracts.task_tracker.ok, true);
  assert.strictEqual(state.records.apps[0].username, "acme");
  assert.strictEqual(state.task_tracker.summary.total, 1);
  assert.strictEqual(state.task_tracker.tasks[0].id, "task-001");
  assert.match(runKvdf(["dashboard", "task-tracker"], { cwd: dir }).stdout, /task_tracker_state/);
  assert.match(runKvdf(["task", "tracker"], { cwd: dir }).stdout, /Task Tracker Live State/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json")));
  const trackerFile = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json"), "utf8"));
  assert.strictEqual(trackerFile.live_api_path, "/__kvdf/api/tasks");
  assert.strictEqual(state.business.app_summaries.length, 2);
  assert.strictEqual(state.business.app_summaries.find((item) => item.username === "acme").ready_features, 1);
  assert.strictEqual(state.business.dashboard_ux_governance.workspace_strategy.current_workspace_apps, 2);
  assert.ok(state.business.dashboard_ux_governance.role_views.some((item) => item.role === "AI Agent"));
  assert.strictEqual(state.workspaces[0].current, true);
  assert.strictEqual(state.workspaces[0].apps_total, 2);
  assert.strictEqual(state.business.customer_apps[0].public_url, "/customer/apps/acme");
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /Kabeeri VDF Dashboard/);
  assert.match(html, /\/__kvdf\/api\/state/);
  assert.match(html, /Applications/);
  assert.match(html, /Task Tracker Live Board/);
  assert.match(html, /\/__kvdf\/api\/tasks/);
  assert.match(html, /Live Reports/);
  assert.match(html, /\/__kvdf\/api\/reports/);
  assert.match(html, /Action Center/);
  assert.match(html, /\.kabeeri is the source of truth/);
  assert.match(html, /table-wrap/);
  assert.match(html, /KVDF Workspaces/);
  assert.match(html, /Dashboard UX Governance/);
  assert.match(html, /Role Visibility/);
  assert.match(html, /Widget Registry/);
  assert.match(html, /role-filter/);
  assert.match(html, /view-preset/);
  assert.match(html, /App Drilldown/);
  assert.match(html, /data-app-summary/);
  assert.match(html, /App Boundary Governance/);
  assert.match(html, /same_product_multi_app/);
  assert.match(html, /app-filter/);
  assert.match(html, /Dashboard task/);
  assert.match(html, /Feature Readiness/);
  assert.match(html, /ready_to_demo/);
  assert.match(html, /User Journeys/);
  assert.match(html, /Signup journey/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /feature records checked/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /journey records checked/);
  const uxAudit = JSON.parse(runKvdf(["dashboard", "ux", "--json"], { cwd: dir }).stdout);
  assert.ok(["pass", "needs_attention"].includes(uxAudit.status));
  assert.ok(uxAudit.checks.some((check) => check.id === "action_center" && check.status));
  assert.ok(uxAudit.checks.some((check) => check.id === "role_visibility" && check.status));
  assert.ok(uxAudit.checks.some((check) => check.id === "dashboard_ux_governance" && check.status));
  assert.ok(uxAudit.checks.some((check) => check.id === "dashboard_controls" && check.status));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/dashboard_ux_report.md")));
  assert.match(runKvdf(["validate", "dashboard"], { cwd: dir }).stdout, /dashboard UX audits checked/);
  const otherDir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-linked-"));
  try {
    runKvdf(["init"], { cwd: otherDir });
    runKvdf(["app", "create", "--username", "linked-app", "--name", "Linked App"], { cwd: otherDir });
    runKvdf(["dashboard", "workspace", "add", "--path", otherDir, "--name", "Linked Workspace"], { cwd: dir });
    assert.match(runKvdf(["dashboard", "workspace", "list"], { cwd: dir }).stdout, /Linked Workspace/);
    const linkedState = JSON.parse(runKvdf(["dashboard", "state", "--workspaces", otherDir], { cwd: dir }).stdout);
    assert.strictEqual(linkedState.workspaces.length, 2);
    assert.ok(linkedState.workspaces.some((item) => item.root === otherDir && item.apps_total === 1));
    const configuredState = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
    assert.ok(configuredState.workspaces.some((item) => item.root === otherDir && item.name === "Kabeeri VDF"));
  } finally {
    fs.rmSync(otherDir, { recursive: true, force: true });
  }
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
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Policy Results/);
}));

test("readiness and governance reports export independent status", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Prepare checkout readiness", "--workstream", "backend"], { cwd: dir });
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Checkout", "--readiness", "needs_review", "--tasks", "task-001"], { cwd: dir });
  const readiness = JSON.parse(runKvdf(["readiness", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(readiness.report_type, "readiness");
  assert.match(readiness.status, /warning|blocked|ready/);
  assert.ok(readiness.summary.open_tasks >= 1);
  const governance = JSON.parse(runKvdf(["governance", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(governance.report_type, "governance");
  assert.ok(governance.summary.workstreams >= 1);
  assert.ok(Array.isArray(governance.coverage.dimensions));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "trust"));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "privacy"));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "compliance"));
  assert.ok(governance.coverage.dimensions.some((item) => item.dimension === "extensibility"));
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
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.context_packs.length, 1);
  assert.strictEqual(state.records.cost_preflights.length, 1);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Cost Preflights/);
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
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.handoff_packages.length, 1);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Handoff Packages/);
}));

test("security governance scans reports and blocks gates", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "config"), { recursive: true });
  fs.writeFileSync(path.join(dir, "config", "safe.txt"), "APP_NAME=Demo\n", "utf8");
  assert.strictEqual(JSON.parse(runKvdf(["security", "scan", "--include", "config/"], { cwd: dir }).stdout).status, "pass");
  const stripePrefix = String.fromCharCode(83, 84, 82, 73, 80, 69, 95, 83, 69, 67, 82, 69, 84, 95, 75, 69, 89);
  const stripeValue = ["sk", "test", "1234567890abcdef1234567890"].join("_");
  fs.writeFileSync(path.join(dir, ".env"), `${stripePrefix}=${stripeValue}\n`, "utf8");
  const blocked = JSON.parse(runKvdf(["security", "scan", "--include", ".env"], { cwd: dir }).stdout);
  assert.strictEqual(blocked.status, "blocked");
  assert.ok(blocked.findings.some((item) => item.severity === "critical"));
  assert.match(
    runKvdf(["security", "gate", "--include", ".env"], { cwd: dir, expectFailure: true }).stderr,
    /Security gate blocked/
  );
  runKvdf(["security", "report", "--id", blocked.scan_id, "--output", "security.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "security.md"), "utf8"), /Security Scan Report/);
  assert.match(runKvdf(["security", "list"], { cwd: dir }).stdout, /blocked/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.ok(state.records.security_scans.length >= 2);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Security Scans/);
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
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.migration_plans.length, 1);
  assert.ok(state.records.migration_checks.length >= 2);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Migration Safety/);
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
  for (const relative of [
    "workspaces/apps/storefront-web/.kabeeri",
    "workspaces/apps/storefront-web/src",
    "workspaces/apps/storefront-web/tests",
    "workspaces/apps/storefront-web/docs",
    "workspaces/apps/storefront-web/.kabeeri/workspace.json",
    "workspaces/apps/storefront-web/.kabeeri/project.json",
    "workspaces/apps/storefront-web/.kabeeri/tasks.json",
    "workspaces/apps/storefront-web/.kabeeri/task_trash.json",
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
  const registry = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/app_workspaces.json"), "utf8"));
  assert.ok(registry.workspaces.some((item) => item.slug === "storefront-web"));
}));

test("owner and developer cli surfaces block the opposite track", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.writeFileSync(path.join(dir, ".kabeeri/session_track.json"), JSON.stringify({
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
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/site/pages/en/task-governance.html")));
  assert.ok(fs.existsSync(path.join(repoRoot, "docs/site/pages/ar/task-governance.html")));
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
  assert.match(runKvdf(["release", "check", "--version", "v4.0.0"]).stdout, /Validation: OK/);
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
  const commandReference = fs.readFileSync(path.join(repoRoot, "cli/CLI_COMMAND_REFERENCE.md"), "utf8");
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
  assert.match(capabilitiesReference, /plugins\/owner-track/);
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
  assert.ok(checklist.items.some(item => /test/i.test(item.question) || /اختبار/.test(item.question)), "Checklist should ask for test steps");
  assert.ok(checklist.items.some(item => /secret/i.test(item.question) || /أسرار/.test(item.question)), "Checklist should ask about secrets/sensitive data");
  assert.ok(checklist.items.some(item => /beginner/i.test(item.question) || /مبتدئ/.test(item.question)), "Checklist should ask if output is understandable by a beginner");
  
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
  fs.writeFileSync(path.join(dir, "cli", "CLI_COMMAND_REFERENCE.md"), "# Command Reference\n\nkvdf init\n");
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

test("capability registry exposes named traceable units with ownership and source mapping", () => {
  const registry = JSON.parse(runKvdf(["capability", "registry", "--json"]).stdout);
  assert.strictEqual(Array.isArray(registry), true);
  assert.strictEqual(registry.length, 53);
  const billing = JSON.parse(runKvdf(["capability", "registry", "payments_billing", "--json"]).stdout);
  assert.strictEqual(billing.key, "payments_billing");
  assert.ok(Array.isArray(billing.source_reference));
  assert.ok(billing.source_reference.some((item) => item.includes("SYSTEM_AREAS_INDEX.md")));
  assert.strictEqual(typeof billing.owner, "string");
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
