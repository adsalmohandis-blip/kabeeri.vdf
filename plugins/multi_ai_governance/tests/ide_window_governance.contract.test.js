const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-multi-ai-ide-"));
  fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function readState(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(process.env.KVDF_REPO_ROOT, relativePath), "utf8"));
}

function makeAppendAudit(entries) {
  return (eventType, entityType, entityId, summary, metadata) => {
    entries.push({ eventType, entityType, entityId, summary, metadata });
  };
}

function registerWindowAndTool(entries = [], options = {}) {
  const appendAudit = makeAppendAudit(entries);
  const windowReport = ideGovernance.registerIdeWindowSession({
    window: options.window || "ide-window-001",
    workspace: options.workspace || "workspace-001",
    project: options.project || "project-001",
    task: options.task || "task-001",
    owner: options.owner || "owner-001",
    repo_root: process.env.KVDF_REPO_ROOT,
    status: "active"
  }, {}, appendAudit);
  const toolReport = ideGovernance.registerToolPresence({
    tool: options.tool || "codex",
    agent: options.agent || "agent-codex-001",
    session: options.session || "ide-session-001",
    task: options.task || "task-001",
    status: "active"
  }, {}, appendAudit);
  return { windowReport, toolReport, appendAudit };
}

test("registering an IDE window persists window state", () => withTempRepo(() => {
  const auditEntries = [];
  const report = ideGovernance.registerIdeWindowSession({
    window: "ide-window-001",
    workspace: "workspace-001",
    project: "project-001",
    task: "task-001",
    owner: "owner-001",
    repo_root: process.env.KVDF_REPO_ROOT,
    status: "active"
  }, {}, makeAppendAudit(auditEntries));

  assert.strictEqual(report.report_type, "multi_ai_ide_window_registered");
  assert.strictEqual(report.ide_window.ide_window_id, "ide-window-001");
  assert.ok(fs.existsSync(path.join(process.env.KVDF_REPO_ROOT, ".kabeeri", "multi_ai_governance", "ide_window_sessions.json")));

  const state = readState(".kabeeri/multi_ai_governance/ide_window_sessions.json");
  assert.strictEqual(state.sessions.length, 1);
  assert.strictEqual(state.sessions[0].workspace_id, "workspace-001");
  assert.strictEqual(auditEntries.length, 1);
}));

test("registering tool presence also writes an agent session", () => withTempRepo(() => {
  registerWindowAndTool();

  const toolState = readState(".kabeeri/multi_ai_governance/ide_tool_presence.json");
  const agentState = readState(".kabeeri/multi_ai_governance/ide_agent_sessions.json");

  assert.strictEqual(toolState.tools.length, 1);
  assert.strictEqual(agentState.sessions.length, 1);
  assert.strictEqual(toolState.tools[0].tool_id, "codex");
  assert.strictEqual(toolState.tools[0].ide_window_id, "ide-window-001");
  assert.strictEqual(agentState.sessions[0].agent_id, "agent-codex-001");
}));

test("creating a lease detects same-file conflicts", () => withTempRepo(() => {
  registerWindowAndTool([], { tool: "codex", agent: "agent-codex-001", session: "ide-session-001" });
  ideGovernance.registerToolPresence({
    tool: "cursor_agent",
    agent: "agent-cursor-001",
    session: "ide-session-002",
    task: "task-001",
    status: "active"
  }, {}, () => {});

  const firstLease = ideGovernance.createIdeLease({
    lease_type: "file",
    scope: "src/components/editor.ts",
    allowed_paths: ["src/components/editor.ts"],
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});

  const secondLease = ideGovernance.createIdeLease({
    lease_type: "file",
    scope: "src/components/editor.ts",
    allowed_paths: ["src/components/editor.ts"],
    tool: "cursor_agent",
    agent: "agent-cursor-001",
    task: "task-001"
  }, {}, () => {});

  assert.strictEqual(firstLease.conflicts.length, 0);
  assert.strictEqual(secondLease.conflicts.length, 1);
  assert.strictEqual(secondLease.conflicts[0].conflict_type, "same_file");

  const conflictsState = readState(".kabeeri/multi_ai_governance/ide_conflicts.json");
  assert.strictEqual(conflictsState.conflicts.length, 1);

  const audit = readState(".kabeeri/multi_ai_governance/ide_audit_log.json");
  assert.ok(audit.records.some((item) => item.event_type === "ide.conflict.detected"));
}));

test("policy warns on an ungoverned change", () => withTempRepo(() => {
  registerWindowAndTool();
  const report = ideGovernance.evaluateIdePolicy("check", {
    path: "src/app/page.ts",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, [], {}, () => {});

  assert.strictEqual(report.decision, "warn");
  assert.match(report.reason, /Ungoverned change/i);
  assert.strictEqual(report.requires_owner_approval, false);
}));

test("policy blocks a denied path", () => withTempRepo(() => {
  registerWindowAndTool();
  ideGovernance.createIdeLease({
    lease_type: "file",
    scope: "src/app/page.ts",
    denied_paths: ["src/app/page.ts"],
    allowed_paths: ["src/app/page.ts"],
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});

  const report = ideGovernance.evaluateIdePolicy("check", {
    path: "src/app/page.ts",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, [], {}, () => {});

  assert.strictEqual(report.decision, "block");
  assert.match(report.reason, /Denied path/i);
}));

test("policy requires owner approval for a high-risk path", () => withTempRepo(() => {
  registerWindowAndTool();
  const report = ideGovernance.evaluateIdePolicy("check", {
    path: ".kabeeri/owner_auth.json",
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, [], {}, () => {});

  assert.strictEqual(report.decision, "require_owner_approval");
  assert.strictEqual(report.requires_owner_approval, true);
  assert.ok(fs.existsSync(path.join(process.env.KVDF_REPO_ROOT, ".kabeeri", "multi_ai_governance", "ide_approval_requests.json")));

  const approvals = readState(".kabeeri/multi_ai_governance/ide_approval_requests.json");
  assert.strictEqual(approvals.requests.length, 1);

  const audit = readState(".kabeeri/multi_ai_governance/ide_audit_log.json");
  assert.ok(audit.records.some((item) => item.event_type === "ide.approval.requested"));
}));

test("audit records are written for IDE actions", () => withTempRepo(() => {
  registerWindowAndTool();
  ideGovernance.createIdeLease({
    lease_type: "folder",
    scope: "src/app",
    allowed_paths: ["src/app"],
    tool: "codex",
    agent: "agent-codex-001",
    task: "task-001"
  }, {}, () => {});

  const audit = readState(".kabeeri/multi_ai_governance/ide_audit_log.json");
  assert.ok(audit.records.length >= 3);
  assert.ok(audit.records.some((item) => item.event_type === "ide.window.registered"));
  assert.ok(audit.records.some((item) => item.event_type === "ide.tool.registered"));
  assert.ok(audit.records.some((item) => item.event_type === "ide.lease.created"));
}));
