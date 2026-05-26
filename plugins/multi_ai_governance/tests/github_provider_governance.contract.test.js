const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const bootstrap = require("../bootstrap");
const githubGovernance = require("../commands/github_provider_governance");
const localGovernance = require("../commands/local_project_governance");

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

function withTempRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-github-provider-"));
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    initGitRepo(dir);
    fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function initGitRepo(dir) {
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "kvdf@example.com"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "KVDF Test"], { cwd: dir, stdio: "ignore" });
  fs.writeFileSync(path.join(dir, ".gitignore"), ".kabeeri/\nnode_modules/\n");
  execFileSync("git", ["add", ".gitignore"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", "init"], { cwd: dir, stdio: "ignore" });
}

function readState(dir, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(dir, relativePath), "utf8"));
}

function appendAudit(entries) {
  return (eventType, entityType, entityId, summary, metadata) => {
    entries.push({ eventType, entityType, entityId, summary, metadata });
  };
}

function registerLocalProject(dir) {
  return localGovernance.registerLocalProject({
    project: "project-001",
    owner: "owner-001",
    repo_root: dir
  }, {}, () => {});
}

function mapGithubRepo() {
  return githubGovernance.mapGithubProviderRepo({
    repo_remote: "https://github.com/example/demo.git",
    github_owner: "example",
    github_repo: "demo",
    project_id: "project-001",
    machine_id: "machine-001",
    owner_id: "owner-001"
  }, () => {});
}

test("bootstrap exposes GitHub provider governance", () => {
  assert.ok(bootstrap.githubProviderGovernance);
  assert.strictEqual(typeof bootstrap.buildMultiAiGithubProviderStatusReport, "function");
  assert.strictEqual(typeof bootstrap.renderMultiAiGithubProviderReport, "function");
});

test("mapping a GitHub repo persists governance state", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  const report = mapGithubRepo();
  assert.strictEqual(report.report_type, "multi_ai_github_provider_repo_mapped");

  const connections = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_connections.json");
  const repoMap = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_repo_map.json");
  const syncState = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_sync_state.json");
  assert.strictEqual(connections.connections.length, 1);
  assert.strictEqual(repoMap.repo_mappings.length, 1);
  assert.strictEqual(syncState.events.length, 1);
}));

test("safe read operations are allowed and write evidence", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  mapGithubRepo();
  const report = githubGovernance.evaluateGithubProviderPolicy({
    operation_type: "read_issue",
    github_owner: "example",
    github_repo: "demo",
    task_id: null,
    issue_number: "12"
  }, {}, appendAudit([]));

  assert.strictEqual(report.decision, "allow");
  assert.ok(report.evidence_id);
  const decisions = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_policy_decisions.json");
  const evidence = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_evidence.json");
  assert.strictEqual(decisions.decisions.length, 1);
  assert.strictEqual(evidence.evidence.length, 1);
}));

test("write operations without task binding are blocked", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  mapGithubRepo();
  const report = githubGovernance.evaluateGithubProviderPolicy({
    operation_type: "create_issue",
    github_owner: "example",
    github_repo: "demo",
    title: "Missing task binding"
  }, {}, () => {});

  assert.strictEqual(report.decision, "block");
  assert.match(report.reason, /task/i);
}));

test("high-risk GitHub provider operations require owner approval", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  mapGithubRepo();
  const report = githubGovernance.evaluateGithubProviderPolicy({
    operation_type: "create_pr",
    github_owner: "example",
    github_repo: "demo",
    task_id: "task-001",
    branch_name: "ai/TASK-001-codex-fix",
    pr_number: "17"
  }, {}, () => {});

  assert.strictEqual(report.decision, "require_owner_approval");
  assert.strictEqual(report.requires_owner_approval, true);
  const approvals = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_approval_requests.json");
  assert.strictEqual(approvals.requests.length, 1);
}));

test("governed GitHub issue sync requests route through the governance layer", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  mapGithubRepo();
  const report = githubGovernance.multiAiGithubProviderGovernance("github-provider", "issue", {
    github_owner: "example",
    github_repo: "demo",
    task_id: "task-001",
    title: "Sync issue",
    body: "Governed issue sync"
  }, ["sync"], { appendAudit: () => {} });

  assert.ok(["multi_ai_github_provider_operation_request", "multi_ai_github_provider_operation_executed"].includes(report.report_type));
  const operations = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_operations.json");
  assert.strictEqual(operations.operations.length >= 1, true);
}));

test("governed GitHub check runs can request owner approval", () => withTempRepo(() => {
  registerLocalProject(process.env.KVDF_REPO_ROOT);
  mapGithubRepo();
  const report = githubGovernance.multiAiGithubProviderGovernance("github-provider", "check", {
    github_owner: "example",
    github_repo: "demo",
    task_id: "task-001",
    check_name: "ci"
  }, ["run"], { appendAudit: () => {} });

  assert.strictEqual(report.governance_decision.decision, "require_owner_approval");
  const audit = readState(process.env.KVDF_REPO_ROOT, ".kabeeri/multi_ai_governance/github_provider_audit_log.json");
  assert.ok(audit.events.length >= 1);
}));

