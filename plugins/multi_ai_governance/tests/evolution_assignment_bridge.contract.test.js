const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const bootstrap = require("../bootstrap");
const multiAiGovernance = require("../commands/multi_ai_governance");
const ideGovernance = require("../commands/ide_window_governance");
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-evolution-"));
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

function silenceConsole(fn) {
  const original = console.log;
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = original;
  }
}

function seedEvolutionPriority(dir, title, summary) {
  const state = {
    development_priorities: [
      {
        id: "evo-auto-044-task-trash-system",
        priority: 1,
        title,
        summary,
        source: "test",
        status: "in_progress",
        track: "framework_owner"
      }
    ],
    temporary_priorities: null
  };
  fs.writeFileSync(path.join(dir, ".kabeeri/evolution.json"), JSON.stringify(state, null, 2));
}

function registerBaseWorkspace(dir) {
  localGovernance.registerLocalProject({
    project: "project-001",
    owner: "owner-001",
    repo_root: dir
  }, {}, () => {});
  multiAiGovernance.multiAiGovernance("agent", "register", {
    ai: "agent-master",
    name: "Master AI",
    provider: "codex",
    model: "gpt-5.4-mini",
    role: "leader",
    leader_eligible: true,
    capabilities: ["planning", "governance"]
  }, {}, { appendAudit: () => {} });
  multiAiGovernance.multiAiGovernance("agent", "register", {
    ai: "agent-worker",
    name: "Worker AI",
    provider: "codex",
    model: "gpt-5.4-mini",
    role: "worker",
    worker_only: true,
    capabilities: ["implementation", "testing"]
  }, {}, { appendAudit: () => {} });
}

test("bootstrap exposes the evolution assignment bridge", () => {
  assert.strictEqual(typeof bootstrap.buildMultiAiEvolutionAssignmentBridgeReport, "function");
  assert.strictEqual(typeof bootstrap.buildMultiAiEvolutionAssignmentBridgeAssignReport, "function");
  assert.strictEqual(typeof bootstrap.renderMultiAiEvolutionAssignmentBridgeReport, "function");
  assert.strictEqual(typeof bootstrap.buildMultiAiEvolutionAssignmentWorkflowReport, "function");
  assert.strictEqual(typeof bootstrap.renderMultiAiEvolutionAssignmentWorkflowReport, "function");
});

test("safe evolution priorities can be assigned to the master/worker bridge", () => withTempRepo((dir) => {
  const audit = [];
  const auditAppend = appendAudit(audit);
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const statusReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "status", {
    json: true
  }, {}, { appendAudit: auditAppend }));
  const assignReport = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "assign", {
    json: true
  }, {}, { appendAudit: auditAppend }));

  assert.strictEqual(statusReport.report_type, "multi_ai_evolution_assignment_bridge");
  assert.ok(["allow", "warn"].includes(statusReport.decision));
  assert.strictEqual(statusReport.assignment_policy.canonical_output_owner, "master_laptop");
  assert.strictEqual(statusReport.assignment_policy.push_authority, "master_laptop");
  assert.ok(statusReport.distribution_plan.worker_ai_ids.includes("agent-worker"));

  assert.strictEqual(assignReport.report_type, "multi_ai_evolution_assignment_bridge");
  assert.ok(assignReport.distribution_plan.should_distribute);
  assert.ok(assignReport.distribution_result);

  const bridgeState = readState(dir, ".kabeeri/multi_ai_governance/evolution_assignments.json");
  assert.ok(bridgeState.current_assignment);
  assert.strictEqual(bridgeState.current_assignment.status, "applied");
  assert.ok(bridgeState.current_assignment.worker_ai_ids.includes("agent-worker"));
  assert.ok(audit.some((entry) => entry.eventType === "multi_ai.evolution_assignment_distributed"));
}));

test("an IDE conflict blocks the evolution bridge from distributing work", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Keep the distribution safe.");

  ideGovernance.registerIdeWindowSession({
    window: "ide-window-master",
    workspace: "workspace-001",
    project: "project-001",
    repo_root: dir,
    owner: "owner-001"
  }, {}, () => {});
  ideGovernance.registerToolPresence({
    tool: "codex",
    agent: "agent-master",
    session: "ide-session-master",
    task: "task-001",
    status: "active"
  }, {}, () => {});
  ideGovernance.registerIdeWindowSession({
    window: "ide-window-worker",
    workspace: "workspace-001",
    project: "project-001",
    repo_root: dir,
    owner: "owner-001"
  }, {}, () => {});
  ideGovernance.registerToolPresence({
    tool: "codex",
    agent: "agent-worker",
    session: "ide-session-worker",
    task: "task-002",
    status: "active"
  }, {}, () => {});
  ideGovernance.createIdeLease({
    type: "file",
    scope: "src/app/page.ts",
    tool: "codex",
    agent: "agent-master",
    task: "task-001",
    window: "ide-window-master",
    workspace: "workspace-001",
    project: "project-001"
  }, {}, () => {});
  ideGovernance.createIdeLease({
    type: "file",
    scope: "src/app/page.ts",
    tool: "cursor_agent",
    agent: "agent-worker",
    task: "task-002",
    window: "ide-window-worker",
    workspace: "workspace-001",
    project: "project-001"
  }, {}, () => {});

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "status", {
    json: true
  }, {}, { appendAudit: () => {} }));

  assert.strictEqual(report.decision, "block");
  assert.ok(report.case_matrix.some((item) => item.case_id === "case_1" && item.blocking));
  assert.strictEqual(report.distribution_plan.should_distribute, false);
}));

test("high-risk evolution priorities require owner approval before worker distribution", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Prepare a release approval handoff.");

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "status", {
    json: true,
    high_risk: true
  }, {}, { appendAudit: () => {} }));

  assert.strictEqual(report.decision, "require_owner_approval");
  assert.strictEqual(report.requires_owner_approval, true);
  assert.strictEqual(report.distribution_plan.should_distribute, false);
}));

test("evolution workflow command renders the master checklist and worker prompt", () => withTempRepo((dir) => {
  registerBaseWorkspace(dir);
  seedEvolutionPriority(dir, "Task Trash System", "Move completed tasks into a recoverable trash bucket.");

  const report = silenceConsole(() => multiAiGovernance.multiAiGovernance("evolution", "workflow", {
    json: true
  }, {}, { appendAudit: () => {} }));

  assert.strictEqual(report.report_type, "multi_ai_evolution_assignment_workflow");
  assert.ok(Array.isArray(report.master_checklist));
  assert.ok(report.master_checklist.some((item) => /push authority/i.test(item)));
  assert.match(report.worker_prompt, /You are the worker laptop/i);
  assert.match(report.worker_prompt, /Do not push to GitHub/i);
  assert.match(report.worker_prompt, /Edit only leased files/i);
  assert.strictEqual(report.master_laptop.push_authority, "master_laptop");
  assert.strictEqual(report.worker_laptop.role, "worker_only");
}));
