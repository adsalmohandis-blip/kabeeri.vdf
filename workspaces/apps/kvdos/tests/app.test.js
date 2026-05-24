const assert = require("assert");
const { pathToFileURL } = require("url");
const os = require("os");

const { createKvdosAppManifest, loadAppSpec } = require("../src/index");
const { createCloudPlaceholder } = require("../src/cloud");
const { createLocalBackendPlaceholder } = require("../apps/studio/local_backend");
const { validateAppSpec } = require("../src/validation");
const { buildKvdosStatusReport } = require("../src/status");
const fs = require("fs");
const path = require("path");

const tests = [];
const workspaceRoot = path.resolve(__dirname, "..");

function test(name, fn) {
  tests.push({ name, fn });
}

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdos-app-test-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeWorkspaceStateFixture(dir) {
  const stateDir = path.join(dir, ".kabeeri");
  fs.mkdirSync(stateDir, { recursive: true });

  const project = {
    framework: "Kabeeri VDF",
    workspace_kind: "developer_app",
    app_slug: "kvdos",
    app_name: "KVDOS",
    app_type: "application",
    surface_scopes: ["shared"],
    linked_workspace_roots: [],
    profile: "enterprise",
    delivery_mode: "structured",
    prompt_packs: ["common", "nextjs", "nestjs", "expressjs", "go-gin"],
    intake_groups: ["core", "production", "extension"],
    product_name: "KVDOS",
    forbid_unrelated_apps: true,
    root: "workspaces/apps/kvdos",
    version: "0.1.0",
    profile_route_id: "kvdos-enterprise-profile-001",
    created_at: "2026-05-17T00:00:00.000Z",
    updated_at: "2026-05-17T00:10:00.000Z"
  };

  const profile = {
    version: "v1",
    current_profile: "enterprise",
    current_delivery_mode: "structured",
    intake_groups: ["core", "production", "extension"],
    updated_at: "2026-05-17T00:10:00.000Z"
  };

  const projectPath = path.join(stateDir, "project.json");
  const profilePath = path.join(stateDir, "project_profile.json");
  fs.writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}\n`, "utf8");
  fs.writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");

  return { profilePath, projectPath };
}

test("kvdos manifest points at the workspace spec", () => {
  const manifest = createKvdosAppManifest();
  assert.strictEqual(manifest.appId, "kvdos");
  assert.strictEqual(manifest.workspaceRoot, "workspaces/apps/kvdos");
  assert.strictEqual(manifest.specPath, "app.kvdos.yaml");
  assert.deepStrictEqual(manifest.surfaces, ["studio", "cloud", "runner", "core_task_system", "vdf_bridge"]);
});

test("kvdos app spec exists and mentions the local studio", () => {
  const spec = loadAppSpec();
  assert.match(spec, /kind:\s+local_studio/);
  assert.match(spec, /profile:\s+enterprise/);
  assert.match(spec, /core_task_system/);
  assert.match(spec, /vdf_bridge/);
});

test("kvdos example spec and schema are present", () => {
  const example = fs.readFileSync(path.join(workspaceRoot, "examples", "app.kvdos.example.yaml"), "utf8");
  const schema = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "schemas", "app.kvdos.schema.json"), "utf8"));

  assert.match(example, /core_task_system/);
  assert.match(example, /vdf_bridge/);
  assert.strictEqual(schema.title, "KVDOS App Spec");
  assert.ok(Array.isArray(schema.properties.surfaces.items.enum));
  assert.ok(schema.properties.surfaces.items.enum.includes("studio"));
  assert.ok(schema.properties.surfaces.items.enum.includes("vdf_bridge"));
});

test("kvdos runtime spec doc exists", () => {
  const doc = fs.readFileSync(path.join(workspaceRoot, "docs", "runtime", "APP_KVDOS_SPEC.md"), "utf8");
  assert.match(doc, /app_id/);
  assert.match(doc, /workspace/);
  assert.match(doc, /surfaces/);
});

test("kvdos v1.0 planning docs exist", () => {
  const hardening = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_0_HARDENING_PLAN.md"), "utf8");
  const checklist = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_0_RELEASE_CHECKLIST.md"), "utf8");
  const notes = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_0_RELEASE_NOTES_DRAFT.md"), "utf8");
  const roadmap = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "ROADMAP.md"), "utf8");
  const commandSurface = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_0_COMMAND_SURFACE.md"), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "package.json"), "utf8"));

  assert.match(hardening, /## Proposed KVDOS v1\.0 Definition/);
  assert.match(hardening, /KVDOS v1\.0 is a local-first task governance and Studio foundation/);
  assert.match(hardening, /v1\.0 Evolution Map/);
  assert.match(hardening, /release readiness documentation/);
  assert.match(checklist, /npm run studio:dependencies/);
  assert.match(notes, /local-first task governance and Studio foundation/);
  assert.match(roadmap, /v1\.5 Live CLI Snapshot Integration/);
  assert.match(roadmap, /v1\.0 Hardening Plan/);
  assert.match(commandSurface, /## Stable Commands/);
  assert.match(commandSurface, /## Internal \/ Helper Commands/);
  assert.match(commandSurface, /## Future Commands/);
  assert.match(commandSurface, /No-Execution Warning/);
  assert.deepStrictEqual(Object.keys(packageJson.scripts), [
    "start",
    "validate",
    "status",
    "impl:baseline",
    "studio:shell",
    "workspace:model",
    "workspace:open",
    "workspace:recent",
    "workspace:context",
    "studio:landing",
    "studio:empty-state",
    "studio:command-palette",
    "runtime:state",
    "workspace:persistence",
    "kvdos:surface",
    "app:state",
    "workspace:explorer",
    "discovery:questionnaires",
    "spec:blueprint",
    "tasking:surface",
    "approval:surface",
    "task-approval:persistence",
    "reports:dashboard",
    "terminal:panel",
    "preview:browser",
    "ai:workbench",
    "ai:tool-session",
    "problems:panel",
    "context:error-capture",
    "error-to-task:conversion",
    "logs:trace:audit",
    "patch:diff:review",
    "health:dashboard",
    "qa:ide-journey",
    "desktop:dev",
    "desktop:build",
    "desktop:tauri:dev",
    "desktop:tauri:build",
    "desktop:snapshot",
    "studio:tasks",
    "task",
    "task:create",
    "task:list",
    "task:show",
    "task:update",
    "task:import",
    "task:export",
    "studio:dependencies",
    "queue:status",
    "check",
    "test"
  ]);
  assert.match(fs.readFileSync(path.join(workspaceRoot, "README.md"), "utf8"), /Stable Commands For v1\.0/);
  assert.match(fs.readFileSync(path.join(workspaceRoot, "README.md"), "utf8"), /npm run task:create/);
  assert.match(fs.readFileSync(path.join(workspaceRoot, "README.md"), "utf8"), /do not execute tasks yet/i);
  assert.match(fs.readFileSync(path.join(workspaceRoot, "README.md"), "utf8"), /desktop:snapshot/);
});

test("kvdos final release docs exist and describe the release honestly", () => {
  const notes = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_0_RELEASE_NOTES.md"), "utf8");
  const checklist = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_0_FINAL_CHECKLIST.md"), "utf8");
  const verification = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_0_FINAL_VERIFICATION.md"), "utf8");
  const roadmap = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "ROADMAP.md"), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "package.json"), "utf8"));

  assert.match(notes, /v1\.0\.0/);
  assert.match(notes, /Does Not Include/);
  assert.match(notes, /task execution/);
  assert.match(checklist, /version check: `1\.0\.0`/);
  assert.match(checklist, /no final tag created yet/);
  assert.match(verification, /Ready for final `v1\.0\.0` tag after Owner approval/i);
  assert.match(verification, /package.json` version: `1\.0\.0`/);
  assert.match(roadmap, /v1\.0\.0/);
  assert.strictEqual(packageJson.version, "1.0.0");
});

test("kvdos v1.2 through v1.12 desktop docs exist and match the packaging roadmap status map", () => {
  const decision = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_2_DESKTOP_ARCHITECTURE_DECISION.md"), "utf8");
  const skeleton = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_3_DESKTOP_STUDIO_SKELETON.md"), "utf8");
  const roadmap = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "ROADMAP.md"), "utf8");
  const ladder = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "KVDOS_RELEASE_LADDER.md"), "utf8");
  const v1x = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_X_EVOLUTIONS.md"), "utf8");
  const packagingArchitecture = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "DESKTOP_PACKAGING_ARCHITECTURE.md"), "utf8");
  const tauriChecklist = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "TAURI_READINESS_CHECKLIST.md"), "utf8");
  const tauriVerification = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "TAURI_TOOLCHAIN_VERIFICATION.md"), "utf8");
  const tauriSetupGuide = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "TAURI_TOOLCHAIN_SETUP_GUIDE.md"), "utf8");
  const tauriCommandChecklist = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "TAURI_TOOLCHAIN_COMMAND_CHECKLIST.md"), "utf8");
  const packagingRoadmap = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "DESKTOP_PACKAGING_ROADMAP.md"), "utf8");
  const portableStrategy = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "PORTABLE_PREVIEW_PACKAGING_STRATEGY.md"), "utf8");
  const portableChecklist = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "PORTABLE_PREVIEW_CHECKLIST.md"), "utf8");
  const ciWindowsResult = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "CI_WINDOWS_TAURI_VERIFICATION_RESULT.md"), "utf8");
  const installerDecision = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "INSTALLER_PORTABLE_DISTRIBUTION_DECISION.md"), "utf8");
  const portableDistributionChecklist = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "PORTABLE_DISTRIBUTION_CHECKLIST.md"), "utf8");
  const artifactNaming = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "DESKTOP_ARTIFACT_NAMING.md"), "utf8");
  const windowsPreviewReport = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "WINDOWS_EXE_PREVIEW_REPORT.md"), "utf8");
  const windowsLaunchReport = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "WINDOWS_EXE_LAUNCH_VALIDATION.md"), "utf8");
  const windowsDiagnosisReport = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "WINDOWS_EXE_ARCHITECTURE_DIAGNOSIS.md"), "utf8");
  const windowsPathFixReport = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "WINDOWS_EXE_ARTIFACT_PATH_FIX.md"), "utf8");
  const rustBinaryDiagnosis = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "TAURI_RUST_BINARY_OUTPUT_DIAGNOSIS.md"), "utf8");
  const appBinaryTargetFix = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "TAURI_APP_BINARY_TARGET_FIX.md"), "utf8");

  assert.match(decision, /Desktop Architecture Decision/);
  assert.match(decision, /desktop implementation/);
  assert.match(skeleton, /Desktop Studio Skeleton/);
  assert.match(skeleton, /mock[- ]data only/);
  assert.match(roadmap, /v1\.5 Live CLI Snapshot Integration/);
  assert.match(roadmap, /v1\.6 Desktop Live Snapshot UX Validation/);
  assert.match(roadmap, /v1\.7 Packaging Architecture \+ Tauri Readiness/);
  assert.match(roadmap, /v1\.10 Portable Preview Packaging Strategy/);
  assert.match(roadmap, /v1\.12 Code Signing and Update Strategy Planning/);
  assert.match(ladder, /v1\.2/);
  assert.match(ladder, /Live CLI snapshot integration/);
  assert.match(ladder, /Desktop architecture decision/);
  assert.match(ladder, /packaging architecture \+ Tauri readiness/i);
  assert.match(v1x, /v1\.2/);
  assert.match(v1x, /Desktop Architecture Decision/);
  assert.match(v1x, /Desktop Studio Skeleton/);
  assert.match(v1x, /v1\.5.*Live CLI Snapshot Integration/);
  assert.match(v1x, /v1\.6.*Desktop Live Snapshot UX Validation/);
  assert.match(v1x, /v1\.4 to v1\.12 Desktop Packaging Track/);
  assert.match(v1x, /Portable Preview Packaging Strategy/);
  assert.match(v1x, /Packaging Architecture \+ Tauri Readiness/);
  assert.match(v1x, /Code Signing and Update Strategy Planning/);
  assert.match(packagingArchitecture, /prefer .*Tauri.* over Electron/i);
  assert.match(packagingArchitecture, /minimal shell scaffold/i);
  assert.match(tauriChecklist, /Owner approval is required before any Windows bundling or signing/);
  assert.match(tauriVerification, /Cargo PATH Status/);
  assert.match(tauriVerification, /Ready for `v1\.9` Windows `\.exe` preview\./);
  assert.match(tauriVerification, /The shell PATH fix is understood/);
  assert.match(tauriSetupGuide, /Tauri Toolchain Setup Guide/);
  assert.match(tauriSetupGuide, /Current Blocker From v1\.8\.1/);
  assert.match(tauriSetupGuide, /When To Proceed To v1\.9/);
  assert.match(tauriCommandChecklist, /rustc --version/);
  assert.match(tauriCommandChecklist, /npm run desktop:tauri:build/);
  assert.match(portableStrategy, /KVDOS Portable Preview Packaging Strategy/);
  assert.match(portableStrategy, /GitHub Actions `windows-latest`/);
  assert.match(portableChecklist, /MZ: True/);
  assert.match(portableChecklist, /No task execution/);
  assert.match(ciWindowsResult, /GitHub Actions `windows-latest`/);
  assert.match(ciWindowsResult, /MZ`: `True`/);
  assert.match(ciWindowsResult, /local machine/);
  assert.match(installerDecision, /KVDOS Installer \/ Portable Distribution Decision/);
  assert.match(installerDecision, /GitHub Actions temporary artifact for internal \/ Owner preview/);
  assert.match(installerDecision, /no installer yet/);
  assert.match(portableDistributionChecklist, /CI build passed/);
  assert.match(portableDistributionChecklist, /no public release/);
  assert.match(artifactNaming, /KVDOS-Desktop-preview-windows-x64\.exe/);
  assert.match(artifactNaming, /KVDOS-Desktop-vX\.Y\.Z-windows-x64\.exe/);
  assert.match(packagingRoadmap, /v1\.7 Packaging Architecture \+ Tauri Readiness/);
  assert.match(packagingRoadmap, /v1\.10 Portable Preview Packaging Strategy/);
  assert.match(packagingRoadmap, /v1\.9 First Windows `\.exe` Preview/);
  assert.match(packagingRoadmap, /v1\.9\.1 Windows `\.exe` Launch Validation/);
  assert.match(packagingRoadmap, /v1\.9\.2 Windows `\.exe` Architecture \/ Target Diagnosis/);
  assert.match(packagingRoadmap, /v1\.9\.3 Windows `\.exe` Artifact Path Fix/);
  assert.match(packagingRoadmap, /v1\.11 Installer \/ Portable Distribution Decision/);
  assert.match(packagingRoadmap, /blocked/i);
  assert.match(packagingRoadmap, /v1\.12 Code Signing and Update Strategy Planning/);
  assert.match(windowsPreviewReport, /KVDOS Windows `\.exe` Preview Report/);
  assert.match(windowsPreviewReport, /KVDOS Desktop\.exe/);
  assert.match(windowsPreviewReport, /Launch validation was not completed/i);
  assert.match(windowsPreviewReport, /local only/i);
  assert.match(windowsLaunchReport, /KVDOS Windows `\.exe` Launch Validation/);
  assert.match(windowsLaunchReport, /The specified executable is not a valid application for this OS platform\./);
  assert.match(windowsLaunchReport, /Blocked\./);
  assert.match(windowsDiagnosisReport, /KVDOS Windows `\.exe` Architecture \/ Target Diagnosis/);
  assert.match(windowsDiagnosisReport, /Windows 11 Pro/);
  assert.match(windowsDiagnosisReport, /x86_64-pc-windows-msvc/);
  assert.match(windowsDiagnosisReport, /does/i);
  assert.match(windowsDiagnosisReport, /not/i);
  assert.match(windowsDiagnosisReport, /MZ.*signature/i);
  assert.match(windowsDiagnosisReport, /corrupt or invalid preview executable artifact/i);
  assert.match(windowsDiagnosisReport, /Blocked\./);
  assert.match(windowsPathFixReport, /KVDOS Windows `\.exe` Artifact Path Fix/);
  assert.match(windowsPathFixReport, /78 `\.exe` files/);
  assert.match(windowsPathFixReport, /KVDOS Desktop\.exe/);
  assert.match(windowsPathFixReport, /deps\/kvdos_desktop\.exe/);
  assert.match(windowsPathFixReport, /contained no .*\.msi.*\.msix.*\.appx/i);
  assert.match(windowsPathFixReport, /does.*not.*begin.*MZ/i);
  assert.match(windowsPathFixReport, /Blocked\./);
  assert.match(rustBinaryDiagnosis, /KVDOS Tauri Rust Binary Output Diagnosis/);
  assert.match(rustBinaryDiagnosis, /direct Cargo release build completed successfully/);
  assert.match(rustBinaryDiagnosis, /Tauri build completed successfully/);
  assert.match(rustBinaryDiagnosis, /both build paths generate the same/i);
  assert.match(rustBinaryDiagnosis, /not `MZ`/);
  assert.match(rustBinaryDiagnosis, /Investigate the Tauri v1 scaffold \/ packaging target/i);
  assert.match(appBinaryTargetFix, /KVDOS Tauri App Binary Target Fix/);
  assert.match(appBinaryTargetFix, /produced the same invalid/i);
  assert.match(appBinaryTargetFix, /launch still fails with/i);
  assert.match(appBinaryTargetFix, /Blocked\./);
  assert.match(fs.readFileSync(path.join(workspaceRoot, ".github", "workflows", "tauri-windows-verification.yml"), "utf8"), /ReadAllBytes/);
  assert.match(fs.readFileSync(path.join(workspaceRoot, ".github", "workflows", "tauri-windows-verification.yml"), "utf8"), /tauri-windows-verification-artifacts/);
  assert.match(fs.readFileSync(path.join(workspaceRoot, ".github", "workflows", "tauri-windows-verification.yml"), "utf8"), /actions\/upload-artifact@v4/);
  assert.match(fs.readFileSync(path.join(workspaceRoot, "README.md"), "utf8"), /Portable Preview Packaging Strategy/);
});

test("kvdos desktop studio skeleton docs and scaffold exist", () => {
  const desktopReadme = fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "README.md"), "utf8");
  const desktopPackage = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "package.json"), "utf8"));
  const desktopIndex = fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "index.html"), "utf8");
  const desktopApp = fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "App.jsx"), "utf8");
  const desktopMain = fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "main.jsx"), "utf8");
  const desktopStyles = fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "styles.css"), "utf8");
  const desktopRoadmap = fs.readFileSync(path.join(workspaceRoot, "docs", "roadmap", "V1_3_DESKTOP_STUDIO_SKELETON.md"), "utf8");
  const desktopImplementation = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "DESKTOP_IMPLEMENTATION_ROADMAP.md"), "utf8");
  const desktopUx = fs.readFileSync(path.join(workspaceRoot, "docs", "desktop", "DESKTOP_STUDIO_UX_OUTLINE.md"), "utf8");
  const gitignore = fs.readFileSync(path.join(workspaceRoot, ".gitignore"), "utf8");

  assert.match(desktopReadme, /KVDOS Desktop Studio Preview/);
  assert.match(desktopReadme, /generated snapshot or demo snapshot \/ fixture data/);
  assert.match(desktopReadme, /read-only preview data bridge/);
  assert.match(desktopReadme, /packaging readiness labels and notes/);
  assert.match(desktopReadme, /v1\.7 Packaging Architecture \+ Tauri Readiness/);
  assert.match(desktopReadme, /v1\.8 Tauri shell scaffold is in place/i);
  assert.match(desktopReadme, /Tauri Toolchain Verification/);
  assert.match(desktopReadme, /Tauri Toolchain Setup Guide/);
  assert.match(desktopReadme, /temporary placeholder assets/i);
  assert.strictEqual(desktopPackage.scripts.dev, "vite");
  assert.strictEqual(desktopPackage.scripts.build, "vite build");
  assert.match(desktopIndex, /KVDOS Desktop Studio Preview/);
  assert.match(desktopApp, /KVDOS Studio Roadmap/);
  assert.match(desktopApp, /KVDOS Studio Roadmap/);
  assert.match(desktopMain, /ReactDOM\.createRoot/);
  assert.match(desktopStyles, /desktop-shell/);
  assert.match(desktopRoadmap, /Desktop Studio Skeleton/);
  assert.match(desktopRoadmap, /done/);
  assert.match(desktopImplementation, /v1\.3 Desktop Studio Skeleton is now in place/);
  assert.match(desktopImplementation, /v1\.8 Add Tauri Shell/);
  assert.match(desktopUx, /Read-only Desktop Preview/);
  assert.match(desktopReadme, /read-only preview data bridge/);
  assert.match(desktopReadme, /npm run desktop:snapshot/);
  assert.match(desktopReadme, /v1\.10 Portable Preview Packaging Strategy/);
  assert.match(desktopReadme, /v1\.12 Code Signing and Update Strategy Planning/);
  assert.match(gitignore, /apps\/desktop\/node_modules\//);
  assert.match(gitignore, /apps\/desktop\/dist\//);
  assert.match(gitignore, /dist\//);
  assert.ok(fs.existsSync(path.join(workspaceRoot, "apps", "desktop", "src-tauri", "icons", "icon.ico")));
  assert.ok(fs.existsSync(path.join(workspaceRoot, "apps", "desktop", "src-tauri", "icons", "icon.png")));
});

test("kvdos desktop read-only bridge loads generated or demo status tasks and dependencies", async () => {
  const bridgePath = pathToFileURL(
    path.join(workspaceRoot, "apps", "desktop", "src", "data", "kvdosDataBridge.js")
  ).href;
  const bridgeModule = await import(bridgePath);
  const bridge = bridgeModule.loadKvdosDesktopPreviewData();
  const desktopSources = [
    fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "App.jsx"), "utf8"),
    fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "data", "kvdosDataBridge.js"), "utf8"),
    fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "data", "loadStatus.js"), "utf8"),
    fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "data", "loadTasks.js"), "utf8"),
    fs.readFileSync(path.join(workspaceRoot, "apps", "desktop", "src", "data", "loadDependencies.js"), "utf8")
  ];

  assert.strictEqual(bridge.sourceLabel, "generated snapshot");
  assert.strictEqual(bridge.sourceNote, "Read-only Desktop Snapshot");
  assert.strictEqual(bridge.tasks.length, 5);
  assert.strictEqual(bridge.readySlice.length, 1);
  assert.strictEqual(bridge.packageVersion, "1.0.0");
  assert.ok(typeof bridge.generatedAt === "string" && bridge.generatedAt.length > 0);
  assert.ok(bridge.validationChecks.length >= 4);
  assert.ok(bridge.reportItems.length >= 3);
  assert.match(bridge.projectInfo.warning, /No task execution from Desktop UI\./);
  assert.match(desktopSources[0], /KvdosLogo/);
  assert.match(desktopSources[0], /KVDOS Studio/);
  for (const source of desktopSources) {
    assert.doesNotMatch(source, /\bchild_process\b|\bexecFileSync\b|\bexecSync\b|\bspawnSync\b|\bspawn\(/);
  }
});

test("kvdos desktop generated snapshot is safe and preferred", async () => {
  const generatedPath = pathToFileURL(
    path.join(workspaceRoot, "apps", "desktop", "src", "data", "generated", "kvdosSnapshot.generated.js")
  ).href;
  const generatedModule = await import(generatedPath);
  const snapshot = generatedModule.kvdosSnapshotGenerated || generatedModule.default;

  assert.strictEqual(snapshot.report_type, "kvdos_desktop_snapshot");
  assert.strictEqual(snapshot.sourceLabel, "generated snapshot");
  assert.strictEqual(snapshot.sourceNote, "Read-only Desktop Snapshot");
  assert.strictEqual(snapshot.packageVersion, "1.0.0");
  assert.strictEqual(snapshot.validationStatus, "PASS");
  assert.ok(snapshot.generatedAt);
  assert.ok(Array.isArray(snapshot.tasks));
  assert.ok(Array.isArray(snapshot.readySlice));
  assert.ok(Array.isArray(snapshot.statusCards));
  assert.ok(Array.isArray(snapshot.validationChecks));
  const serialized = JSON.stringify(snapshot);
  assert.strictEqual(serialized.includes("runtime/state/"), false);
  assert.strictEqual(serialized.includes("runtime/local/"), false);
  assert.strictEqual(serialized.includes(".kabeeri/"), false);
  assert.strictEqual(serialized.includes(".kvdos/"), false);
  assert.strictEqual(serialized.includes(".env"), false);
});

test("kvdos generated docs package is present as draft source material", () => {
  const generatedReadme = fs.readFileSync(path.join(workspaceRoot, "docs", "generated", "kvdf-discovery", "README.md"), "utf8");
  const sourceIndex = fs.readFileSync(path.join(workspaceRoot, "docs", "generated", "kvdf-discovery", "SOURCE_DOCS_INDEX.md"), "utf8");
  const manifest = fs.readFileSync(path.join(workspaceRoot, "docs", "generated", "kvdf-discovery", "MANIFEST.md"), "utf8");

  assert.match(generatedReadme, /Draft source material/);
  assert.match(generatedReadme, /docs\/generated\/kvdf-discovery\/source\//);
  assert.match(sourceIndex, /Draft source material/);
  assert.match(sourceIndex, /pending review/);
  assert.match(manifest, /draft source docs, not canonical product docs/i);
  assert.match(manifest, /docs\/generated\/kvdf-discovery\/source\//);
});

test("kvdos workspace ignores runtime and metadata state", () => {
  const gitignore = fs.readFileSync(path.join(workspaceRoot, ".gitignore"), "utf8");
  assert.match(gitignore, /\.kabeeri\//);
  assert.match(gitignore, /\.kvdos\//);
  assert.match(gitignore, /runtime\/state\//);
  assert.match(gitignore, /runtime\/local\//);
  assert.match(gitignore, /node_modules\//);
  assert.match(gitignore, /apps\/desktop\/node_modules\//);
  assert.match(gitignore, /apps\/desktop\/dist\//);
  assert.match(gitignore, /dist\//);
  assert.match(gitignore, /\.env/);
});

test("kvdos cloud placeholder exists", () => {
  const cloud = createCloudPlaceholder();
  assert.strictEqual(cloud.surface, "cloud");
  assert.match(cloud.purpose, /cloud/);
});

test("kvdos local backend placeholder is under studio", () => {
  const backend = createLocalBackendPlaceholder();
  assert.strictEqual(backend.surface, "studio/local_backend");
  assert.match(backend.purpose, /Studio/);
});

test("kvdos enterprise profile is initialized in isolated workspace state", () => {
  withTempDir((dir) => {
    const { profilePath, projectPath } = writeWorkspaceStateFixture(dir);
    const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
    const project = JSON.parse(fs.readFileSync(projectPath, "utf8"));

    assert.strictEqual(profile.current_profile, "enterprise");
    assert.strictEqual(profile.current_delivery_mode, "structured");
    assert.strictEqual(project.profile, "enterprise");
    assert.strictEqual(project.delivery_mode, "structured");
    assert.ok(Array.isArray(profile.intake_groups));
    assert.ok(profile.intake_groups.includes("extension"));
  });
});

test("kvdos validation passes for the shipped spec", () => {
  const report = validateAppSpec();
  assert.strictEqual(report.ok, true);
  assert.strictEqual(report.name, "KVDOS");
  assert.deepStrictEqual(report.errors, []);
});

test("kvdos package version reflects the final release prep", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "package.json"), "utf8"));
  assert.strictEqual(packageJson.version, "1.0.0");
});

(async () => {
  let failed = 0;
  for (const item of tests) {
    try {
      await item.fn();
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
    console.log(`All ${tests.length} KVDOS workspace tests passed.`);
  }
})();
