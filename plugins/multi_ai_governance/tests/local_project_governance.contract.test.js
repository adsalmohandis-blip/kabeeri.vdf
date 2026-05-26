const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const bootstrap = require("../bootstrap");
const localGovernance = require("../commands/local_project_governance");
const ideGovernance = require("../commands/ide_window_governance");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-local-"));
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

function writeProjectFile(dir, relativePath) {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, "export const value = true;\n");
}

function commitFile(dir, relativePath, message) {
  execFileSync("git", ["add", relativePath], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", message], { cwd: dir, stdio: "ignore" });
}

function appendAudit(entries) {
  return (eventType, entityType, entityId, summary, metadata) => {
    entries.push({ eventType, entityType, entityId, summary, metadata });
  };
}

test("bootstrap exposes the local governance module", () => {
  assert.ok(bootstrap.localProjectGovernance);
  assert.strictEqual(typeof bootstrap.localProjectGovernance.multiAiLocalGovernance, "function");
});

test("registering a local project, client, session, and heartbeat persists runtime state", () => withTempRepo((dir) => {
  const audit = [];
  const auditAppend = appendAudit(audit);

  const projectReport = localGovernance.registerLocalProject({
    project: "project-001",
    owner: "owner-001",
    repo_root: dir
  }, {}, auditAppend);
  const clientReport = localGovernance.registerLocalClient({
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, auditAppend);
  const sessionReport = localGovernance.registerLocalSession({
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, auditAppend);
  const heartbeatReport = localGovernance.recordLocalHeartbeat({
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, auditAppend);

  assert.strictEqual(projectReport.report_type, "multi_ai_local_project_registered");
  assert.strictEqual(clientReport.report_type, "multi_ai_local_client_registered");
  assert.strictEqual(sessionReport.report_type, "multi_ai_local_session_registered");
  assert.strictEqual(heartbeatReport.report_type, "multi_ai_local_heartbeat");

  const projectState = readState(dir, ".kabeeri/multi_ai_governance/local_project.json");
  const machineState = readState(dir, ".kabeeri/multi_ai_governance/local_machine.json");
  const clientState = readState(dir, ".kabeeri/multi_ai_governance/local_clients.json");
  const sessionState = readState(dir, ".kabeeri/multi_ai_governance/local_sessions.json");
  const heartbeatState = readState(dir, ".kabeeri/multi_ai_governance/local_heartbeats.json");

  assert.strictEqual(projectState.project_id, "project-001");
  assert.strictEqual(machineState.machine_id, projectState.machine_id);
  assert.strictEqual(clientState.clients.length, 1);
  assert.strictEqual(sessionState.sessions.length, 1);
  assert.ok(heartbeatState.heartbeats.length >= 1);
  assert.ok(audit.some((entry) => entry.eventType === "local.project.registered"));
  assert.ok(audit.some((entry) => entry.eventType === "local.client.registered"));
  assert.ok(audit.some((entry) => entry.eventType === "local.session.registered"));
  assert.ok(audit.some((entry) => entry.eventType === "local.heartbeat.recorded"));
}));

test("creating a local file lease detects same-file conflicts across clients", () => withTempRepo((dir) => {
  localGovernance.registerLocalProject({ project: "project-001", owner: "owner-001", repo_root: dir }, {}, () => {});
  localGovernance.registerLocalClient({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalClient({ client: "cursor", tool: "cursor_agent", agent: "agent-cursor-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "cursor", tool: "cursor_agent", agent: "agent-cursor-001", task: "task-001" }, {}, () => {});

  const firstLease = localGovernance.createLocalLease({
    type: "file",
    scope: "src/components/editor.ts",
    allowed_paths: ["src/components/editor.ts"],
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});
  const secondLease = localGovernance.createLocalLease({
    type: "file",
    scope: "src/components/editor.ts",
    allowed_paths: ["src/components/editor.ts"],
    client: "cursor",
    tool: "cursor_agent",
    agent: "agent-cursor-001",
    task: "task-001"
  }, {}, () => {});

  assert.strictEqual(firstLease.conflicts.length, 0);
  assert.ok(secondLease.conflicts.some((item) => item.conflict_type === "same_file"));
  assert.ok(secondLease.conflicts.some((item) => item.conflict_type === "same_task"));

  const conflictState = readState(dir, ".kabeeri/multi_ai_governance/local_conflicts.json");
  assert.ok(conflictState.conflicts.some((item) => item.conflict_type === "same_file"));
}));

test("creating a local branch lease detects branch conflicts across tasks", () => withTempRepo((dir) => {
  localGovernance.registerLocalProject({ project: "project-001", owner: "owner-001", repo_root: dir }, {}, () => {});
  localGovernance.registerLocalClient({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalClient({ client: "terminal", tool: "terminal_agent", agent: "agent-terminal-001", task: "task-002" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "terminal", tool: "terminal_agent", agent: "agent-terminal-001", task: "task-002" }, {}, () => {});

  const firstLease = localGovernance.createLocalLease({
    type: "branch",
    scope: "feature/local-governance",
    branch: "feature/local-governance",
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});
  const secondLease = localGovernance.createLocalLease({
    type: "branch",
    scope: "feature/local-governance",
    branch: "feature/local-governance",
    client: "terminal",
    tool: "terminal_agent",
    agent: "agent-terminal-001",
    task: "task-002"
  }, {}, () => {});

  assert.strictEqual(firstLease.conflicts.length, 0);
  assert.ok(secondLease.conflicts.some((item) => item.conflict_type === "branch_task_conflict"));
}));

test("policy blocks a denied path", () => withTempRepo((dir) => {
  localGovernance.registerLocalProject({ project: "project-001", owner: "owner-001", repo_root: dir }, {}, () => {});
  localGovernance.registerLocalClient({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.createLocalLease({
    type: "folder",
    scope: "src",
    allowed_paths: ["src"],
    denied_paths: ["src/secret.ts"],
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});

  const report = localGovernance.evaluateLocalPolicy("check", {
    path: "src/secret.ts",
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, [], {}, () => {});

  assert.strictEqual(report.decision, "block");
  assert.match(report.reason, /Denied path/i);
}));

test("policy warns on an ungoverned local change", () => withTempRepo((dir) => {
  localGovernance.registerLocalProject({ project: "project-001", owner: "owner-001", repo_root: dir }, {}, () => {});
  localGovernance.registerLocalClient({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  writeProjectFile(dir, "src/ungoverned.ts");

  const report = localGovernance.evaluateLocalPolicy("check", {
    path: "src/ungoverned.ts",
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, [], {}, () => {});

  assert.strictEqual(report.decision, "warn");
  assert.match(report.reason, /Ungoverned/i);

  const ungovernedState = readState(dir, ".kabeeri/multi_ai_governance/local_ungoverned_changes.json");
  assert.strictEqual(ungovernedState.changes.length, 1);
}));

test("policy requires owner approval for a high-risk path", () => withTempRepo((dir) => {
  localGovernance.registerLocalProject({ project: "project-001", owner: "owner-001", repo_root: dir }, {}, () => {});
  localGovernance.registerLocalClient({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});

  const report = localGovernance.evaluateLocalPolicy("check", {
    path: ".kabeeri/owner_auth.json",
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, [], {}, () => {});

  assert.strictEqual(report.decision, "require_owner_approval");
  assert.strictEqual(report.requires_owner_approval, true);

  const approvalState = readState(dir, ".kabeeri/multi_ai_governance/local_approval_requests.json");
  assert.strictEqual(approvalState.requests.length, 1);
  assert.strictEqual(approvalState.requests[0].status, "requested");
}));

test("scan records ungoverned local changes and writes audit records", () => withTempRepo((dir) => {
  localGovernance.registerLocalProject({ project: "project-001", owner: "owner-001", repo_root: dir }, {}, () => {});
  localGovernance.registerLocalClient({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  localGovernance.registerLocalSession({ client: "vscode", tool: "codex", agent: "agent-codex-001", task: "task-001" }, {}, () => {});
  writeProjectFile(dir, "src/scan.ts");
  commitFile(dir, "src/scan.ts", "baseline scan file");
  fs.writeFileSync(path.join(dir, "src", "scan.ts"), "export const value = false;\n");

  const report = localGovernance.scanLocalProject({
    client: "vscode",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});

  assert.strictEqual(report.report_type, "multi_ai_local_scan");
  assert.ok(report.ungoverned_changes.length >= 1);

  const auditState = readState(dir, ".kabeeri/multi_ai_governance/local_audit_log.json");
  assert.ok(auditState.records.some((item) => item.event_type === "local.scan.completed"));
}));

test("Case 1 regression still works alongside Case 2", () => withTempRepo((dir) => {
  const audit = [];
  const auditAppend = appendAudit(audit);

  const windowReport = ideGovernance.registerIdeWindowSession({
    window: "ide-window-001",
    workspace: "workspace-001",
    project: "project-001",
    task: "task-001",
    owner: "owner-001",
    repo_root: dir,
    status: "active"
  }, {}, auditAppend);
  const toolReport = ideGovernance.registerToolPresence({
    tool: "codex",
    agent: "agent-codex-001",
    session: "ide-session-001",
    task: "task-001",
    status: "active"
  }, {}, auditAppend);

  assert.strictEqual(windowReport.report_type, "multi_ai_ide_window_registered");
  assert.strictEqual(toolReport.report_type, "multi_ai_ide_tool_registered");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "multi_ai_governance", "ide_window_sessions.json")));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "multi_ai_governance", "ide_tool_presence.json")));
}));
