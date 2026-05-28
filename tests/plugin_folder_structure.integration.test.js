const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const { run } = require("../src/cli");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
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
  } catch (error) {
    stderr.push(error.stack || error.message);
    throw error;
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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-plugin-folder-"));
  fs.mkdirSync(path.join(root, ".kabeeri"), { recursive: true });
  fs.writeFileSync(path.join(root, ".kabeeri", "session_track.json"), JSON.stringify({
    active: true,
    active_track: "framework_owner"
  }, null, 2));
  return root;
}

test("status reports the new folder policy", () => {
  const repoRoot = makeRepo();
  try {
    const result = runKvdf(["plugin-folder", "status", "--json"], repoRoot);
    const parsed = JSON.parse(result.stdout.trim());
    assert.strictEqual(parsed.plugin_id, "plugin_folder_structure");
    assert.strictEqual(parsed.owner_direct_plugin_creation, true);
    assert.strictEqual(parsed.plugin_dev_workspace_creation, true);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("owner creation builds the direct plugin shell", () => {
  const repoRoot = makeRepo();
  try {
    const result = runKvdf(["plugin-folder", "create", "alpha-plugin", "--track=owner", "--json"], repoRoot);
    const parsed = JSON.parse(result.stdout.trim());
    assert.strictEqual(parsed.track, "owner");
    assert.ok(fs.existsSync(path.join(repoRoot, "plugins", "alpha-plugin", "plugin.json")));
    assert.ok(fs.existsSync(path.join(repoRoot, "plugins", "alpha-plugin", "docs")));
    assert.ok(fs.existsSync(path.join(repoRoot, "plugins", "alpha-plugin", "src", "commands")));
    const validate = runKvdf(["plugin-folder", "validate", "alpha-plugin", "--track=owner", "--json"], repoRoot);
    const validated = JSON.parse(validate.stdout.trim());
    assert.strictEqual(validated.ok, true);
    const readiness = runKvdf(["plugin-folder", "readiness", "alpha-plugin", "--track=owner", "--json"], repoRoot);
    const readinessParsed = JSON.parse(readiness.stdout.trim());
    assert.strictEqual(readinessParsed.readiness, true);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("plugin-dev creation builds the governed workspace shell", () => {
  const repoRoot = makeRepo();
  try {
    const result = runKvdf(["plugin-folder", "create", "beta-plugin", "--track=plugin_dev", "--json"], repoRoot);
    const parsed = JSON.parse(result.stdout.trim());
    assert.strictEqual(parsed.track, "plugin_dev");
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "plugin_workspace_manifest.json")));
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "inputs", "git_libraries")));
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "source", "beta-plugin")));

    const gitAdd = runKvdf(["plugin-folder", "git-library", "add", "beta-plugin", "https://example.com/repo.git", "--name=Example", "--use=reference_only", "--track=plugin_dev", "--json"], repoRoot);
    const gitAdded = JSON.parse(gitAdd.stdout.trim());
    assert.strictEqual(gitAdded.status, "recorded");
    const gitList = runKvdf(["plugin-folder", "git-library", "list", "beta-plugin", "--track=plugin_dev", "--json"], repoRoot);
    const gitListed = JSON.parse(gitList.stdout.trim());
    assert.strictEqual(gitListed.libraries.length, 1);
    const gitValidate = runKvdf(["plugin-folder", "git-library", "validate", "beta-plugin", "--track=plugin_dev", "--json"], repoRoot);
    const gitValidated = JSON.parse(gitValidate.stdout.trim());
    assert.strictEqual(gitValidated.ok, true);

    const integrationAdd = runKvdf(["plugin-folder", "integration", "add", "beta-plugin", "other-plugin", "--mode=consume", "--required=true", "--track=plugin_dev", "--json"], repoRoot);
    const integrationAdded = JSON.parse(integrationAdd.stdout.trim());
    assert.strictEqual(integrationAdded.status, "recorded");
    const integrationValidate = runKvdf(["plugin-folder", "integration", "validate", "beta-plugin", "--track=plugin_dev", "--json"], repoRoot);
    const integrationValidated = JSON.parse(integrationValidate.stdout.trim());
    assert.strictEqual(integrationValidated.ok, true);

    const ownerReview = runKvdf(["plugin-folder", "request-owner-review", "beta-plugin", "--track=plugin_dev", "--json"], repoRoot);
    const ownerReviewParsed = JSON.parse(ownerReview.stdout.trim());
    assert.strictEqual(ownerReviewParsed.status, "pending_owner_review");
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "reviews_approvals", "owner_approval_request.json")));
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "package_release", "promotion_manifest.json")));
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "evidence_audit", "owner_approval_evidence", "request_evidence.md")));

    const marketplaceRequest = runKvdf(["plugin-folder", "request-marketplace-upload", "beta-plugin", "--track=plugin_dev", "--json"], repoRoot);
    const marketplaceParsed = JSON.parse(marketplaceRequest.stdout.trim());
    assert.strictEqual(marketplaceParsed.status, "marketplace_pending_not_available");
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "package_release", "marketplace_upload_request.json")));
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "evidence_audit", "marketplace_request_evidence", "marketplace_upload_request_evidence.md")));

    const initSource = runKvdf(["plugin-folder", "init-source", "beta-plugin", "--track=plugin_dev", "--json"], repoRoot);
    const initSourceParsed = JSON.parse(initSource.stdout.trim());
    assert.strictEqual(initSourceParsed.status, "created");
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "source", "beta-plugin", "plugin.json")));
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "source", "beta-plugin", "src", "index.js")));
    assert.ok(fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "beta-plugin", "source", "beta-plugin", "src", "commands", "status.js")));
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("viber track is blocked safely", () => {
  const repoRoot = makeRepo();
  try {
    assert.throws(() => runKvdf(["plugin-folder", "create", "gamma-plugin", "--track=viber"], repoRoot), /Viber\/App Track cannot create plugins directly/);
    assert.ok(!fs.existsSync(path.join(repoRoot, "plugins", "gamma-plugin")));
    assert.ok(!fs.existsSync(path.join(repoRoot, "workspaces", "plugins", "gamma-plugin")));
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

for (const item of tests) {
  try {
    item.fn();
    console.log(`OK ${item.name}`);
  } catch (error) {
    console.error(`FAIL ${item.name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
