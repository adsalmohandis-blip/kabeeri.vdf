const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

const bootstrap = require("../bootstrap");
const runtime = require("../src/index");
const kcloudCommand = require("../../../src/cli/commands/kcloud");

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-kcloud-data-sharing-"));
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    fs.mkdirSync(path.join(dir, ".kabeeri"), { recursive: true });
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function withCloudRepo(fn) {
  return withTempRepo((dir) => {
    const cloudDir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-kcloud-cloud-"));
    try {
      return fn({
        repoDir: dir,
        cloudDir,
        cloudEndpoint: pathToFileURL(cloudDir).href
      });
    } finally {
      fs.rmSync(cloudDir, { recursive: true, force: true });
    }
  });
}

function readConfig(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "kcloud", "config.json"), "utf8"));
}

function readJsonl(dir, fileName) {
  const file = path.join(dir, ".kabeeri", "kcloud", fileName);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function readCloudJsonl(cloudDir, fileName) {
  const file = path.join(cloudDir, fileName);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function writeConfigPatch(dir, patch) {
  const file = path.join(dir, ".kabeeri", "kcloud", "config.json");
  const current = JSON.parse(fs.readFileSync(file, "utf8"));
  fs.writeFileSync(file, `${JSON.stringify({ ...current, ...patch }, null, 2)}\n`, "utf8");
}

function corruptCloudPayloadHash(cloudDir, eventId) {
  const file = path.join(cloudDir, "events.jsonl");
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  const next = lines.map((line) => {
    const event = JSON.parse(line);
    if (event.event_id !== eventId) return line;
    event.payload_hash = "bad-hash";
    return JSON.stringify(event);
  });
  fs.writeFileSync(file, `${next.join("\n")}\n`, "utf8");
}

function allowGovernance(decision = "allow", reason = "ok", riskLevel = "low", requiresOwnerApproval = false) {
  return () => ({
    decision,
    reason,
    risk_level: riskLevel,
    requires_owner_approval: requiresOwnerApproval,
    timestamp: new Date().toISOString(),
    source: "test"
  });
}

test("bootstrap exposes the kcloud data sharing shell", () => {
  assert.ok(bootstrap.kcloudDataSharing);
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingStatusReport, "function");
  assert.strictEqual(typeof bootstrap.renderKcloudDataSharingReport, "function");
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingQueueOutboxReport, "function");
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingQueueInboxReport, "function");
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingEventInspectionReport, "function");
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingTransmitReport, "function");
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingReceiveReport, "function");
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingAuditReport, "function");
  assert.strictEqual(typeof bootstrap.buildKcloudDataSharingReadinessReport, "function");
});

test("status reports the authority split and runtime path", () => withTempRepo(() => {
  const report = kcloudCommand.kcloudDataSharing("status", null, {}, [], {});
  assert.strictEqual(report.report_type, "kcloud_data_sharing_status");
  assert.strictEqual(report.authority_plugin, "multi_ai_governance");
  assert.strictEqual(report.local_runtime_state_path, ".kabeeri/kcloud");
  assert.strictEqual(report.transmit_status, "disabled");
  assert.strictEqual(report.receive_status, "disabled");
}));

test("init creates the local cloud config contract and storage files", () => withTempRepo((dir) => {
  const report = kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: "file:///tmp/kcloud-shell" }, [], {});
  assert.strictEqual(report.report_type, "kcloud_data_sharing_initialized");
  const config = readConfig(dir);
  assert.strictEqual(config.project_id, "project-001");
  assert.strictEqual(config.cloud_project_id, null);
  assert.strictEqual(config.transmit_enabled, false);
  assert.strictEqual(config.receive_enabled, false);
  assert.strictEqual(config.authority_plugin, "multi_ai_governance");
  assert.strictEqual(config.cloud_endpoint, "file:///tmp/kcloud-shell");
  assert.ok(config.created_at);
  assert.ok(config.updated_at);
  for (const fileName of ["outbox.jsonl", "inbox.jsonl", "ack-log.jsonl", "dead-letter.jsonl", "transmit-log.jsonl", "receive-log.jsonl", "audit-log.jsonl", "sync-cursor.json"]) {
    assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "kcloud", fileName)), `${fileName} should exist`);
  }
}));

test("queue-outbox creates an outbound JSONL event with a stable payload hash", () => withTempRepo((dir) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  const payload = { z: 9, a: { beta: 2, alpha: 1 } };
  const report = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    target: "cloud-runner",
    event_type: "task.sync",
    payload
  }, [], {});
  assert.strictEqual(report.report_type, "kcloud_data_sharing_outbox_queued");
  assert.strictEqual(report.event.direction, "outbound");
  assert.strictEqual(report.event.source_tool_id, "codex");
  assert.strictEqual(report.event.target, "cloud-runner");
  assert.strictEqual(report.event.sequence, 1);
  assert.strictEqual(report.event.payload_hash, runtime.hashPayload(payload));
  const outbox = readJsonl(dir, "outbox.jsonl");
  assert.strictEqual(outbox.length, 1);
  assert.strictEqual(outbox[0].event_id, report.event.event_id);
}));

test("queue-inbox creates an inbound JSONL event and advances the sync cursor", () => withTempRepo((dir) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  const report = kcloudCommand.kcloudDataSharing("queue-inbox", null, {
    project_id: "project-001",
    source_tool_id: "remote-runner",
    target: "local",
    event_type: "packet.received",
    payload: { status: "ok" }
  }, [], {});
  assert.strictEqual(report.report_type, "kcloud_data_sharing_inbox_queued");
  assert.strictEqual(report.event.direction, "inbound");
  assert.strictEqual(report.event.sequence, 1);
  const inbox = readJsonl(dir, "inbox.jsonl");
  assert.strictEqual(inbox.length, 1);
  const cursor = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri", "kcloud", "sync-cursor.json"), "utf8"));
  assert.strictEqual(cursor.inbox_sequence, 1);
}));

test("transmit success writes a cloud event and keeps the local outbox consistent", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "task.sync",
    payload: { hello: "cloud" }
  }, [], {});
  const report = kcloudCommand.kcloudDataSharing("transmit", null, {}, [], {
    governanceAdapter: allowGovernance()
  });
  assert.strictEqual(report.report_type, "kcloud_data_sharing_transmit");
  assert.strictEqual(report.mode, "bulk");
  assert.ok(report.counts.sent >= 1 || report.counts.acknowledged >= 1);
  const cloudEvents = readCloudJsonl(cloudDir, "events.jsonl");
  assert.strictEqual(cloudEvents.length, 1);
  const outbox = readJsonl(repoDir, "outbox.jsonl");
  assert.strictEqual(outbox[0].event_id, queued.event.event_id);
  assert.ok(["sent", "acknowledged"].includes(outbox[0].status));
}));

test("cloud offline keeps the event in retrying state", () => withTempRepo((dir) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "task.sync",
    payload: { hello: "offline" }
  }, [], {});
  const report = kcloudCommand.kcloudDataSharing("transmit-one", queued.event.event_id, {}, [], {
    governanceAdapter: allowGovernance()
  });
  assert.strictEqual(report.final_status, "retrying");
  const outbox = readJsonl(dir, "outbox.jsonl");
  assert.strictEqual(outbox[0].status, "retrying");
}));

test("retry succeeds after the cloud endpoint becomes available", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "task.sync",
    payload: { hello: "retry" }
  }, [], {});
  let report = kcloudCommand.kcloudDataSharing("transmit-one", queued.event.event_id, {}, [], {
    governanceAdapter: allowGovernance()
  });
  assert.strictEqual(report.final_status, "retrying");
  writeConfigPatch(repoDir, { cloud_endpoint: cloudEndpoint });
  report = kcloudCommand.kcloudDataSharing("retry-failed", null, {}, [], {
    governanceAdapter: allowGovernance()
  });
  assert.ok(report.counts.sent >= 1 || report.counts.acknowledged >= 1);
  const cloudEvents = readCloudJsonl(cloudDir, "events.jsonl");
  assert.strictEqual(cloudEvents.length, 1);
}));

test("duplicate transmit does not create duplicate cloud actions", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "task.sync",
    payload: { hello: "duplicate" }
  }, [], {});
  const first = kcloudCommand.kcloudDataSharing("transmit-one", queued.event.event_id, {}, [], {
    governanceAdapter: allowGovernance()
  });
  const second = kcloudCommand.kcloudDataSharing("transmit-one", queued.event.event_id, {}, [], {
    governanceAdapter: allowGovernance()
  });
  const cloudEvents = readCloudJsonl(cloudDir, "events.jsonl");
  assert.strictEqual(cloudEvents.length, 1);
  assert.ok(first.final_status === "sent" || first.final_status === "acknowledged");
  assert.strictEqual(second.duplicate || second.final_status === "acknowledged" || second.final_status === "duplicate", true);
}));

test("dead-letter writes a durable record for final failures", () => withTempRepo((dir) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "restricted.push",
    payload: { hello: "blocked" }
  }, [], {});
  const report = kcloudCommand.kcloudDataSharing("transmit-one", queued.event.event_id, {}, [], {
    governanceAdapter: allowGovernance("block", "blocked by policy", "high", false)
  });
  assert.strictEqual(report.final_status, "dead_letter");
  const deadLetter = readJsonl(dir, "dead-letter.jsonl");
  assert.strictEqual(deadLetter.length, 1);
  assert.strictEqual(deadLetter[0].event_id, queued.event.event_id);
}));

test("receive success stores, validates, and ACKs the inbound event", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const sender = path.join(os.tmpdir(), `kvdf-kcloud-sender-${Date.now()}`);
  fs.mkdirSync(sender, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  try {
    process.env.KVDF_REPO_ROOT = sender;
    fs.mkdirSync(path.join(sender, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
    kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-001",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "receive" }
    }, [], {});
    kcloudCommand.kcloudDataSharing("transmit", null, {}, [], {
      governanceAdapter: allowGovernance()
    });
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(sender, { recursive: true, force: true });
  }

  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  const report = kcloudCommand.kcloudDataSharing("receive", null, {}, [], {
    governanceAdapter: allowGovernance()
  });
  assert.strictEqual(report.report_type, "kcloud_data_sharing_receive");
  assert.ok(report.counts.acknowledged >= 1 || report.counts.processed >= 1 || report.counts.validated >= 1);
  const inbox = readJsonl(repoDir, "inbox.jsonl");
  assert.strictEqual(inbox.length, 1);
  assert.ok(["acknowledged", "processed"].includes(inbox[0].status));
  const cloudAcks = readCloudJsonl(cloudDir, "acks.jsonl");
  assert.strictEqual(cloudAcks.length, 1);
}));

test("duplicate receive protection prevents inbox corruption", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const sender = path.join(os.tmpdir(), `kvdf-kcloud-sender-${Date.now()}-dup`);
  fs.mkdirSync(sender, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  let eventId = null;
  try {
    process.env.KVDF_REPO_ROOT = sender;
    fs.mkdirSync(path.join(sender, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
    const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-001",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "dup-receive" }
    }, [], {});
    eventId = queued.event.event_id;
    kcloudCommand.kcloudDataSharing("transmit", null, {}, [], { governanceAdapter: allowGovernance() });
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(sender, { recursive: true, force: true });
  }

  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance() });
  const second = kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance() });
  const inbox = readJsonl(repoDir, "inbox.jsonl");
  assert.strictEqual(inbox.length, 1);
  assert.ok(second.duplicate || second.final_status === "rejected");
}));

test("invalid payload hash is rejected", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const sender = path.join(os.tmpdir(), `kvdf-kcloud-sender-${Date.now()}-hash`);
  fs.mkdirSync(sender, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  let eventId = null;
  try {
    process.env.KVDF_REPO_ROOT = sender;
    fs.mkdirSync(path.join(sender, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
    const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-001",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "hash" }
    }, [], {});
    eventId = queued.event.event_id;
    kcloudCommand.kcloudDataSharing("transmit", null, {}, [], { governanceAdapter: allowGovernance() });
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(sender, { recursive: true, force: true });
  }

  corruptCloudPayloadHash(cloudDir, eventId);
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  const report = kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance() });
  assert.strictEqual(report.final_status, "rejected");
  const deadLetter = readJsonl(repoDir, "dead-letter.jsonl");
  assert.strictEqual(deadLetter.length >= 1, true);
}));

test("wrong project events are rejected", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const sender = path.join(os.tmpdir(), `kvdf-kcloud-sender-${Date.now()}-project`);
  fs.mkdirSync(sender, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  let eventId = null;
  try {
    process.env.KVDF_REPO_ROOT = sender;
    fs.mkdirSync(path.join(sender, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-a", cloud_endpoint: cloudEndpoint }, [], {});
    const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-a",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "project" }
    }, [], {});
    eventId = queued.event.event_id;
    kcloudCommand.kcloudDataSharing("transmit", null, {}, [], { governanceAdapter: allowGovernance() });
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(sender, { recursive: true, force: true });
  }

  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-b", cloud_endpoint: cloudEndpoint }, [], {});
  const report = kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance() });
  assert.strictEqual(report.final_status, "rejected");
  const inbox = readJsonl(repoDir, "inbox.jsonl");
  assert.strictEqual(inbox.length, 1);
  assert.strictEqual(inbox[0].status, "rejected");
}));

test("sync cursor recovery prevents duplicate corruption after rewind", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const sender = path.join(os.tmpdir(), `kvdf-kcloud-sender-${Date.now()}-cursor`);
  fs.mkdirSync(sender, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  let eventId = null;
  try {
    process.env.KVDF_REPO_ROOT = sender;
    fs.mkdirSync(path.join(sender, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
    const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-001",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "cursor" }
    }, [], {});
    eventId = queued.event.event_id;
    kcloudCommand.kcloudDataSharing("transmit", null, {}, [], { governanceAdapter: allowGovernance() });
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(sender, { recursive: true, force: true });
  }

  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance() });
  writeJsonlPatch(path.join(repoDir, ".kabeeri", "kcloud", "sync-cursor.json"), { cloud_sequence: 0 });
  const report = kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance() });
  assert.strictEqual(report.duplicate || report.final_status === "rejected", true);
  const inbox = readJsonl(repoDir, "inbox.jsonl");
  assert.strictEqual(inbox.length, 1);
}));

test("ACK handling writes local and cloud ACK records", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const sender = path.join(os.tmpdir(), `kvdf-kcloud-sender-${Date.now()}-ack`);
  fs.mkdirSync(sender, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  let eventId = null;
  try {
    process.env.KVDF_REPO_ROOT = sender;
    fs.mkdirSync(path.join(sender, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
    const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-001",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "ack" }
    }, [], {});
    eventId = queued.event.event_id;
    kcloudCommand.kcloudDataSharing("transmit", null, {}, [], { governanceAdapter: allowGovernance() });
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(sender, { recursive: true, force: true });
  }

  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance() });
  const localAcks = readJsonl(repoDir, "ack-log.jsonl");
  const cloudAcks = readCloudJsonl(cloudDir, "acks.jsonl");
  assert.strictEqual(localAcks.length >= 1, true);
  assert.strictEqual(cloudAcks.length >= 1, true);
}));

test("full duplex sync reconciles transmit, receive, and ACKs", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const machineA = path.join(os.tmpdir(), `kvdf-kcloud-machine-a-${Date.now()}`);
  const machineB = path.join(os.tmpdir(), `kvdf-kcloud-machine-b-${Date.now()}`);
  fs.mkdirSync(machineA, { recursive: true });
  fs.mkdirSync(machineB, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  try {
    process.env.KVDF_REPO_ROOT = machineA;
    fs.mkdirSync(path.join(machineA, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
    const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-001",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "duplex" }
    }, [], {});
    kcloudCommand.kcloudDataSharing("sync", null, { once: true }, [], { governanceAdapter: allowGovernance() });

    process.env.KVDF_REPO_ROOT = machineB;
    fs.mkdirSync(path.join(machineB, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
    kcloudCommand.kcloudDataSharing("sync", null, { once: true }, [], { governanceAdapter: allowGovernance() });

    process.env.KVDF_REPO_ROOT = machineA;
    const final = kcloudCommand.kcloudDataSharing("sync", null, { once: true }, [], { governanceAdapter: allowGovernance() });
    assert.strictEqual(final.mode, "once");
    const outboxA = readJsonl(machineA, "outbox.jsonl");
    const inboxB = readJsonl(machineB, "inbox.jsonl");
    assert.ok(outboxA[0].status === "acknowledged" || outboxA[0].status === "sent");
    assert.ok(inboxB[0].status === "acknowledged" || inboxB[0].status === "processed");
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(machineA, { recursive: true, force: true });
    fs.rmSync(machineB, { recursive: true, force: true });
  }
}));

test("partial transmit failure preserves the outbox", () => withTempRepo((dir) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "task.sync",
    payload: { hello: "partial" }
  }, [], {});
  const report = kcloudCommand.kcloudDataSharing("transmit-one", queued.event.event_id, {}, [], {
    governanceAdapter: allowGovernance()
  });
  assert.strictEqual(report.final_status, "retrying");
  const outbox = readJsonl(dir, "outbox.jsonl");
  assert.strictEqual(outbox.length, 1);
  assert.strictEqual(outbox[0].status, "retrying");
}));

test("partial receive failure stores a dead-letter record", () => withCloudRepo(({ repoDir, cloudDir, cloudEndpoint }) => {
  const sender = path.join(os.tmpdir(), `kvdf-kcloud-sender-${Date.now()}-partial`);
  fs.mkdirSync(sender, { recursive: true });
  const previousRoot = process.env.KVDF_REPO_ROOT;
  let eventId = null;
  try {
    process.env.KVDF_REPO_ROOT = sender;
    fs.mkdirSync(path.join(sender, ".kabeeri"), { recursive: true });
    kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-a", cloud_endpoint: cloudEndpoint }, [], {});
    const queued = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
      project_id: "project-a",
      source_tool_id: "codex",
      event_type: "task.sync",
      payload: { hello: "partial-receive" }
    }, [], {});
    eventId = queued.event.event_id;
    kcloudCommand.kcloudDataSharing("transmit", null, {}, [], { governanceAdapter: allowGovernance() });
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(sender, { recursive: true, force: true });
  }

  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-b", cloud_endpoint: cloudEndpoint }, [], {});
  const report = kcloudCommand.kcloudDataSharing("receive-one", eventId, {}, [], { governanceAdapter: allowGovernance("block", "project mismatch", "high", false) });
  assert.strictEqual(report.final_status, "rejected");
  const deadLetter = readJsonl(repoDir, "dead-letter.jsonl");
  assert.strictEqual(deadLetter.length >= 1, true);
}));

test("governance block and approval-required decisions are recorded", () => withTempRepo((dir) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001" }, [], {});
  const blocked = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "direct.push",
    payload: { hello: "blocked" }
  }, [], {});
  const blockedResult = kcloudCommand.kcloudDataSharing("transmit-one", blocked.event.event_id, {}, [], {
    governanceAdapter: allowGovernance("block", "blocked by policy", "high", false)
  });
  assert.strictEqual(blockedResult.final_status, "dead_letter");

  const approval = kcloudCommand.kcloudDataSharing("queue-outbox", null, {
    project_id: "project-001",
    source_tool_id: "codex",
    event_type: "patch proposal",
    payload: { hello: "approval" }
  }, [], {});
  const approvalResult = kcloudCommand.kcloudDataSharing("transmit-one", approval.event.event_id, {}, [], {
    governanceAdapter: allowGovernance("require_owner_approval", "approval required", "high", true)
  });
  assert.strictEqual(approvalResult.final_status, "retrying");
  const audit = kcloudCommand.kcloudDataSharing("audit", null, {}, [], {});
  assert.strictEqual(audit.report_type, "kcloud_data_sharing_audit");
  assert.ok(audit.counts.total >= 1);
}));

test("watch mode runs a safe bounded cycle when iterations are provided", () => withCloudRepo(({ cloudEndpoint }) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  const report = kcloudCommand.kcloudDataSharing("sync", null, { watch: true, iterations: 1, interval: 1 }, [], {
    governanceAdapter: allowGovernance()
  });
  assert.strictEqual(report.mode, "watch");
  assert.strictEqual(report.cycles.length, 1);
}));

test("readiness reports the full transmit/receive matrix", () => withCloudRepo(({ cloudEndpoint }) => {
  kcloudCommand.kcloudDataSharing("init", null, { project_id: "project-001", cloud_endpoint: cloudEndpoint }, [], {});
  const report = kcloudCommand.kcloudDataSharing("readiness", null, {}, [], {});
  assert.strictEqual(report.report_type, "kcloud_data_sharing_readiness");
  assert.strictEqual(report.overall, "PASS");
  assert.strictEqual(report.summary.plugin_installed, "PASS");
  assert.strictEqual(report.summary.transmit_engine_available, "PASS");
  assert.strictEqual(report.summary.receive_engine_available, "PASS");
  assert.strictEqual(report.summary.payload_hash_validation_working, "PASS");
  assert.strictEqual(report.summary.duplicate_detection_working, "PASS");
  assert.strictEqual(report.summary.retry_handling_working, "PASS");
  assert.strictEqual(report.summary.dead_letter_handling_working, "PASS");
}));

function writeJsonlPatch(filePath, patch) {
  const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
  fs.writeFileSync(filePath, `${JSON.stringify({ ...current, ...patch }, null, 2)}\n`, "utf8");
}
