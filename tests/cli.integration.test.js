const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const bin = path.join(repoRoot, "bin", "kvdf.js");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function runKvdf(args, options = {}) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd: options.cwd || repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8"
  });
  if (options.expectFailure) {
    assert.notStrictEqual(result.status, 0, `Expected failure for kvdf ${args.join(" ")}`);
    return result;
  }
  assert.strictEqual(result.status, 0, `kvdf ${args.join(" ")} failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  return result;
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
  assert.match(runKvdf(["--version"]).stdout, /kvdf 0\.1\.0/);
  assert.match(runKvdf(["--help"]).stdout, /Kabeeri VDF CLI/);
  assert.match(runKvdf(["create", "--help"]).stdout, /kvdf create --profile lite/);
  assert.match(runKvdf(["validate"]).stdout, /plans.*valid|totals valid/s);
  assert.match(runKvdf(["plan", "list"]).stdout, /v4\.0\.0/);
  assert.match(runKvdf(["plan", "list"]).stdout, /v5\.0\.0/);
  assert.match(runKvdf(["prompt-pack", "list"]).stdout, /react/i);
  assert.match(runKvdf(["taks"], { expectFailure: true }).stderr, /Did you mean "task"/);
});

test("init creates workspace state files", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--mode", "structured"], { cwd: dir });
  for (const file of [
    ".kabeeri/project.json",
    ".kabeeri/tasks.json",
    ".kabeeri/customer_apps.json",
    ".kabeeri/questionnaires/answers.json",
    ".kabeeri/questionnaires/coverage_matrix.json",
    ".kabeeri/version_compatibility.json",
    ".kabeeri/migration_state.json",
    ".kabeeri/memory/decisions.jsonl",
    ".kabeeri/tokens.json",
    ".kabeeri/owner_auth.json",
    ".kabeeri/owner_transfer_tokens.json",
    ".kabeeri/ai_usage/usage_events.jsonl"
  ]) {
    assert.ok(fs.existsSync(path.join(dir, file)), `${file} should exist`);
  }
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /workspace present/);
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

test("owner auth blocks verify without active session", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Verify task", "--workstream", "backend", "--acceptance", "Owner verifies"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/auth.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  runKvdf(["task", "review", "task-001", "--reviewer", "reviewer-001"], { cwd: dir });
  runKvdf(["owner", "logout"], { cwd: dir });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true }).stderr, /Owner session required/);
  runKvdf(["owner", "login", "--id", "owner-001"], { cwd: dir, env });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout, /owner_verified/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/task-001.verification.md")));
}));

test("owner verify requires acceptance evidence", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "No criteria task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/no-criteria.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
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
  runKvdf(["token", "reissue", "task-token-001", "--max-usage-tokens", "200", "--reason", "Rework only"], { cwd: dir });
  tokens = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tokens.json"), "utf8")).tokens;
  assert.strictEqual(tokens[1].status, "active");
  assert.strictEqual(tokens[1].reissued_from, "task-token-001");
  assert.strictEqual(tokens[1].max_usage_tokens, 200);
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
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/users.ts", "--task", "task-002", "--owner", "agent-002"], { cwd: dir, expectFailure: true }).stderr,
    /Active lock conflict/
  );
  runKvdf(["lock", "release", "lock-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/users.ts", "--task", "task-002", "--owner", "agent-002"], { cwd: dir });
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

test("untracked AI usage is recorded and shown in dashboard", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["usage", "record", "--untracked", "--input-tokens", "100", "--output-tokens", "25", "--cost", "0.75", "--source", "ad-hoc-prompt"], { cwd: dir });
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.strictEqual(summary.tracked_vs_untracked.untracked.events, 1);
  assert.strictEqual(summary.tracked_vs_untracked.untracked.cost, 0.75);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /Tracked vs Untracked AI Usage/);
  assert.match(html, /untracked/);
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
  runKvdf(["session", "end", "session-001", "--input-tokens", "100000", "--output-tokens", "50000", "--files", "src/api/session.ts", "--summary", "Implemented session task", "--checks", "npm test", "--risks", "Review API"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/session-001.handoff.md")));
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
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
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
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Public signup", "--readiness", "needs_review", "--tasks", "task-001", "--audience", "Visitors"], { cwd: dir });
  runKvdf(["feature", "status", "feature-001", "--readiness", "ready_to_demo"], { cwd: dir });
  runKvdf(["journey", "create", "--id", "journey-001", "--name", "Signup journey", "--audience", "Visitors", "--steps", "Landing,Signup,Welcome"], { cwd: dir });
  runKvdf(["journey", "status", "journey-001", "--status", "ready_to_show", "--ready-to-show"], { cwd: dir });
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const clientHtml = fs.readFileSync(path.join(dir, "client.html"), "utf8");
  assert.match(clientHtml, /Kabeeri Client Portal/);
  assert.match(clientHtml, /\/customer\/apps\/acme/);
  assert.doesNotMatch(clientHtml, /\/customer\/apps\/\d+/);
  assert.doesNotMatch(clientHtml, /Kabeeri VDF Dashboard/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/site/customer/apps/acme/index.html")));
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.apps[0].username, "acme");
  assert.strictEqual(state.business.customer_apps[0].public_url, "/customer/apps/acme");
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /Kabeeri VDF Dashboard/);
  assert.match(html, /\/__kvdf\/api\/state/);
  assert.match(html, /Dashboard task/);
  assert.match(html, /Feature Readiness/);
  assert.match(html, /ready_to_demo/);
  assert.match(html, /User Journeys/);
  assert.match(html, /Signup journey/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /feature records checked/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /journey records checked/);
}));

test("customer app routes use username instead of numeric ids", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["app", "create", "--username", "3", "--name", "Numeric App"], { cwd: dir, expectFailure: true }).stderr,
    /cannot be numeric IDs/
  );
  assert.match(runKvdf(["app", "create", "--username", "customer-one", "--name", "Customer One"], { cwd: dir }).stdout, /\/customer\/apps\/customer-one/);
  const app = JSON.parse(runKvdf(["app", "show", "customer-one"], { cwd: dir }).stdout);
  assert.strictEqual(app.username, "customer-one");
  assert.strictEqual(app.public_url, "/customer/apps/customer-one");
  assert.ok(!Object.prototype.hasOwnProperty.call(app, "slug"));
  assert.match(runKvdf(["validate", "routes"], { cwd: dir }).stdout, /customer app records checked/);
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

test("generator scaffolds project and exports prompt pack", () => withTempDir((dir) => {
  runKvdf(["generate", "--profile", "standard", "--output", "my-project"], { cwd: dir });
  runKvdf(["prompt-pack", "export", "react", "--output", "my-project/07_AI_CODE_PROMPTS/react"], { cwd: dir });
  runKvdf(["prompt-pack", "use", "vue", "--output", "my-project/07_AI_CODE_PROMPTS/vue"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "my-project/kabeeri.generated.json")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/07_AI_CODE_PROMPTS/react/prompt_pack_manifest.json")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/07_AI_CODE_PROMPTS/vue/prompt_pack_manifest.json")));
}));

test("create shortcut accepts profile typo and command aliases", () => withTempDir((dir) => {
  runKvdf(["create", "--profule", "lite", "--output", "lite-project"], { cwd: dir });
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
