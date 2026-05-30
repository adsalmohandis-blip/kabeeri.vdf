const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const { run } = require("../src/cli");

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

function runKvdf(args, repoRoot) {
  const previousCwd = process.cwd();
  const previousEnv = {};
  const stdout = [];
  const stderr = [];
  const previousLog = console.log;
  const previousError = console.error;
  const previousExitCode = process.exitCode;
  process.chdir(repoRoot);
  process.exitCode = undefined;
  previousEnv.KVDF_REPO_ROOT = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = repoRoot;
  process.env.KVDF_DISABLE_GIT_SPAWN = "1";
  process.env.KVDF_NO_OPEN = "1";
  console.log = (...values) => stdout.push(util.format(...values));
  console.error = (...values) => stderr.push(util.format(...values));
  try {
    run(args);
  } finally {
    console.log = previousLog;
    console.error = previousError;
    process.chdir(previousCwd);
    process.exitCode = previousExitCode;
    if (previousEnv.KVDF_REPO_ROOT === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousEnv.KVDF_REPO_ROOT;
    delete process.env.KVDF_DISABLE_GIT_SPAWN;
    delete process.env.KVDF_NO_OPEN;
  }
  return { stdout: stdout.join("\n"), stderr: stderr.join("\n") };
}

function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-app-folder-"));
  fs.mkdirSync(path.join(root, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(root, ".kabeeri", "session_track.json"), JSON.stringify({
    active: true,
    active_track: "plugin_development_track"
  }, null, 2));
  return root;
}

test("app-folder status reports the canonical app-workspace contract", () => {
  const repoRoot = makeRepo();
  try {
    const result = runKvdf(["app-folder", "status", "--json"], repoRoot);
    const parsed = JSON.parse(result.stdout.trim());
    assert.strictEqual(parsed.plugin_id, "app_folder_structure");
    assert.strictEqual(parsed.standard_plugin_structure, "one");
    assert.strictEqual(parsed.workspace_root, "./workspaces/apps/<app-slug>/");
    assert.strictEqual(parsed.viber_track_plugin_creation, false);
    assert.strictEqual(parsed.owner_approval_required_for_promotion, true);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("app-folder create validate repair and manifest work end to end", () => {
  const repoRoot = makeRepo();
  try {
    const categoryCreate = runKvdf(["app-category", "create", "--app=clinic-basic", "web_application", "--json"], repoRoot);
    const categoryContract = JSON.parse(categoryCreate.stdout.trim());
    assert.strictEqual(categoryContract.app_category_registry, true);
    assert.ok(fs.existsSync(path.join(repoRoot, ".kabeeri", "app_pipeline_contract.json")));

    const create = runKvdf(["app-folder", "create", "--app=clinic-basic", "--category=web_app", "--json"], repoRoot);
    const created = JSON.parse(create.stdout.trim());
    assert.strictEqual(created.status, "created");
    const workspaceRoot = path.join(repoRoot, "workspaces", "apps", "clinic_basic");
    assert.ok(fs.existsSync(path.join(workspaceRoot, "00_viber_inputs")));
    assert.ok(fs.existsSync(path.join(workspaceRoot, "03_full_specifications")));
    assert.ok(fs.existsSync(path.join(workspaceRoot, "08_source", "source_manifest.json")));
    assert.ok(fs.existsSync(path.join(workspaceRoot, ".kabeeri", "app_folder_manifest.json")));

    const validate = runKvdf(["app-folder", "validate", "--app=clinic-basic", "--category=web_app", "--json"], repoRoot);
    const validated = JSON.parse(validate.stdout.trim());
    assert.strictEqual(validated.ok, true);

    fs.writeFileSync(path.join(workspaceRoot, "13_owner_portal", "owner_summary.md"), "sentinel\n", "utf8");
    fs.rmSync(path.join(workspaceRoot, "10_evidence_audit", "structure_evidence", "README.md"));
    const repair = runKvdf(["app-folder", "repair", "--app=clinic-basic", "--category=web_app", "--json"], repoRoot);
    const repaired = JSON.parse(repair.stdout.trim());
    assert.ok(["repaired", "needs_attention"].includes(repaired.status));
    assert.strictEqual(fs.readFileSync(path.join(workspaceRoot, "13_owner_portal", "owner_summary.md"), "utf8"), "sentinel\n");
    assert.ok(fs.existsSync(path.join(workspaceRoot, "10_evidence_audit", "structure_evidence", "README.md")));

    const manifest = runKvdf(["app-folder", "manifest", "--app=clinic-basic", "--category=web_app", "--json"], repoRoot);
    const manifestParsed = JSON.parse(manifest.stdout.trim());
    assert.strictEqual(manifestParsed.app_slug, "clinic_basic");
    assert.strictEqual(manifestParsed.category, "web_app");
    assert.strictEqual(manifestParsed.manifest.plugin_id, "app_folder_structure");

    const print = runKvdf(["app-folder", "print", "--category=embedded_system", "--json"], repoRoot);
    const printed = JSON.parse(print.stdout.trim());
    assert.strictEqual(printed.category, "embedded_system");
    assert.ok(printed.profile.uiux_sections.includes("device_interaction_flow"));
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});
