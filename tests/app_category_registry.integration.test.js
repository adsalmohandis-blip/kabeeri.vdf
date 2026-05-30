const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const { run } = require("../src/cli");

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

const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-app-category-"));
fs.mkdirSync(path.join(repoRoot, ".kabeeri"), { recursive: true });
fs.writeFileSync(path.join(repoRoot, ".kabeeri", "session_track.json"), JSON.stringify({
  active: true,
  active_track: "framework_owner"
}, null, 2));

try {
  const status = JSON.parse(runKvdf(["app-category", "status", "--json"], repoRoot).stdout.trim());
  assert.strictEqual(status.plugin, "app_category_registry");
  assert.ok(Array.isArray(status.active_default_categories));

  const profile = JSON.parse(runKvdf(["app-category", "profile", "ecommerce_platform", "--json"], repoRoot).stdout.trim());
  assert.ok(profile.profile.selected_category_ids.includes("ecommerce_platform"));
  assert.ok(profile.compatibility.issues.length >= 0);

  const plan = JSON.parse(runKvdf(["app-category", "plan", "ecommerce_platform", "--json"], repoRoot).stdout.trim());
  assert.ok(plan.workspace.folders.includes("docs/requirements"));
  assert.ok(plan.roadmap.order.includes("deployment"));

  const create = JSON.parse(runKvdf(["app-category", "create", "--app=shop-basic", "ecommerce_platform", "--json"], repoRoot).stdout.trim());
  assert.strictEqual(create.app_category_registry, true);
  assert.ok(create.workspace_plan.folders.includes("docs/uiux"));
  const contractPath = path.join(repoRoot, ".kabeeri", "app_pipeline_contract.json");
  assert.ok(fs.existsSync(contractPath));
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  assert.strictEqual(contract.app.app_slug, "shop_basic");
  assert.strictEqual(contract.workspace_category, "web_app");
} finally {
  fs.rmSync(repoRoot, { recursive: true, force: true });
}
