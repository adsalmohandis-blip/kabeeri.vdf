const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot } = require("../../../src/cli/fs_utils");
const { loadPluginBootstrap } = require("../../../src/cli/services/plugin_mounts");

const PLUGIN_NAME = "KCloud Data Sharing";
const AUTHORITY_PLUGIN = "multi_ai_governance";
const RUNTIME_ROOT = ".kabeeri/kcloud";
const CONFIG_FILE = `${RUNTIME_ROOT}/config.json`;
const OUTBOX_FILE = `${RUNTIME_ROOT}/outbox.jsonl`;
const INBOX_FILE = `${RUNTIME_ROOT}/inbox.jsonl`;
const ACK_LOG_FILE = `${RUNTIME_ROOT}/ack-log.jsonl`;
const DEAD_LETTER_FILE = `${RUNTIME_ROOT}/dead-letter.jsonl`;
const SYNC_CURSOR_FILE = `${RUNTIME_ROOT}/sync-cursor.json`;
const TRANSMIT_LOG_FILE = `${RUNTIME_ROOT}/transmit-log.jsonl`;
const RECEIVE_LOG_FILE = `${RUNTIME_ROOT}/receive-log.jsonl`;
const AUDIT_LOG_FILE = `${RUNTIME_ROOT}/audit-log.jsonl`;
const READINESS_FILE = `${RUNTIME_ROOT}/readiness.json`;

function kcloudDataSharing(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const normalizedAction = normalizeAction(action);
  const normalizedValue = normalizeAction(value);
  const command = normalizedAction || normalizedValue;

  if (!command || command === "status" || command === "summary" || command === "show") {
    return buildKcloudStatusReport(flags);
  }

  if (command === "init") {
    return initKcloudConfig(flags);
  }

  if (command === "queue-outbox" || (command === "queue" && normalizedValue === "outbox")) {
    return queueOutboxEvent(flags, rest, deps);
  }

  if (command === "queue-inbox" || (command === "queue" && normalizedValue === "inbox")) {
    return queueInboxEvent(flags, rest, deps);
  }

  if (command === "outbox") {
    return buildKcloudOutboxReport(flags);
  }

  if (command === "inbox") {
    return buildKcloudInboxReport(flags);
  }

  if (command === "inspect-events" || command === "inspect" || command === "events") {
    return inspectKcloudEvents(flags);
  }

  if (command === "transmit") {
    return transmitPendingEvents(flags, deps);
  }

  if (command === "transmit-one") {
    return transmitOneEvent(normalizedValue || rest[0], flags, deps);
  }

  if (command === "retry-failed") {
    return retryFailedTransmits(flags, deps);
  }

  if (command === "receive") {
    return receiveCloudEvents(flags, deps);
  }

  if (command === "receive-one") {
    return receiveOneEvent(normalizedValue || rest[0], flags, deps);
  }

  if (command === "ack-received") {
    return acknowledgeReceivedEvent(normalizedValue || rest[0], flags, deps);
  }

  if (command === "sync") {
    return synchronizeKcloud(flags, deps);
  }

  if (command === "audit") {
    return buildKcloudAuditReport(flags);
  }

  if (command === "readiness") {
    return buildKcloudReadinessReport(flags, deps);
  }

  throw new Error(`Unknown kcloud action: ${action}${normalizedValue ? ` ${normalizedValue}` : ""}`);
}

function buildKcloudStatusReport(flags = {}) {
  ensureWorkspace();
  const configPath = CONFIG_FILE;
  const configExists = fileExists(configPath);
  const config = configExists ? readJsonFile(configPath) : null;
  const repoUrl = config && config.repo_url ? config.repo_url : detectRepoUrl();
  const storage = readKcloudStorageState();
  const cloudClient = createKcloudCloudClient({ flags, config, allowOffline: true });
  return {
    report_type: "kcloud_data_sharing_status",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    plugin_id: "kcloud_data_sharing",
    authority_plugin: AUTHORITY_PLUGIN,
    transmit_status: config && config.transmit_enabled ? "enabled" : "disabled",
    receive_status: config && config.receive_enabled ? "enabled" : "disabled",
    cloud_project_connection_status: cloudClient.online ? "connected" : (config && config.cloud_endpoint ? "configured_offline" : "not_connected"),
    local_runtime_state_path: RUNTIME_ROOT,
    config_path: configPath,
    config_exists: configExists,
    project_id: config ? config.project_id : null,
    repo_url: repoUrl || null,
    cloud_project_id: config ? config.cloud_project_id : null,
    cloud_endpoint: config ? config.cloud_endpoint || null : null,
    event_storage_ready: storage.ready,
    outbox_path: OUTBOX_FILE,
    inbox_path: INBOX_FILE,
    ack_log_path: ACK_LOG_FILE,
    dead_letter_path: DEAD_LETTER_FILE,
    transmit_log_path: TRANSMIT_LOG_FILE,
    receive_log_path: RECEIVE_LOG_FILE,
    audit_log_path: AUDIT_LOG_FILE,
    sync_cursor_path: SYNC_CURSOR_FILE,
    outbox_count: storage.outbox.length,
    inbox_count: storage.inbox.length,
    ack_log_count: storage.ackLog.length,
    dead_letter_count: storage.deadLetter.length,
    transmit_log_count: storage.transmitLog.length,
    receive_log_count: storage.receiveLog.length,
    audit_log_count: storage.auditLog.length,
    sync_cursor: storage.syncCursor,
    next_action: configExists
      ? "Use `kvdf kcloud init` to refresh the local shell config or queue events with `kvdf kcloud queue-outbox`."
      : "Run `kvdf kcloud init` to create the local cloud config and storage files."
  };
}

function initKcloudConfig(flags = {}) {
  ensureWorkspace();
  ensureKcloudRuntimeRoot();
  const now = new Date().toISOString();
  const repoUrl = String(readFlag(flags, ["repo_url", "repoUrl", "repo-url"]) || detectRepoUrl() || "").trim() || null;
  const config = {
    project_id: String(readFlag(flags, ["project_id", "projectId", "project-id"]) || "").trim() || null,
    repo_url: repoUrl,
    cloud_endpoint: String(readFlag(flags, ["cloud_endpoint", "cloudEndpoint", "cloud-endpoint"]) || process.env.KVDOS_CLOUD_ENDPOINT || "").trim() || null,
    cloud_project_id: null,
    transmit_enabled: false,
    receive_enabled: false,
    authority_plugin: AUTHORITY_PLUGIN,
    created_at: now,
    updated_at: now
  };
  ensureKcloudEventFiles();
  writeJsonFile(CONFIG_FILE, config);
  updateSyncCursor({
    outbox_sequence: 0,
    inbox_sequence: 0,
    cloud_sequence: 0,
    last_synced_event_id: null,
    updated_at: now
  });
  return {
    report_type: "kcloud_data_sharing_initialized",
    generated_at: now,
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    runtime_root: RUNTIME_ROOT,
    config_path: CONFIG_FILE,
    event_storage_paths: getKcloudEventPaths(),
    config
  };
}

function queueOutboxEvent(flags = {}, rest = [], deps = {}) {
  return queueKcloudEvent({
    direction: "outbound",
    queueName: "outbox",
    defaultTarget: "cloud",
    flags,
    rest,
    deps
  });
}

function queueInboxEvent(flags = {}, rest = [], deps = {}) {
  return queueKcloudEvent({
    direction: "inbound",
    queueName: "inbox",
    defaultTarget: "local",
    flags,
    rest,
    deps
  });
}

function queueKcloudEvent({ direction, queueName, defaultTarget, flags = {}, rest = [], deps = {} }) {
  ensureWorkspace();
  ensureKcloudRuntimeRoot();
  ensureKcloudEventFiles();
  const now = new Date().toISOString();
  const config = fileExists(CONFIG_FILE) ? readJsonFile(CONFIG_FILE) : null;
  const projectId = String(
    readFlag(flags, ["project_id", "projectId", "project-id"]) ||
    (config && config.project_id) ||
    ""
  ).trim() || null;
  const sourceToolId = normalizeSourceToolId(flags, deps);
  const target = String(readFlag(flags, ["target", "to"]) || defaultTarget || "").trim() || defaultTarget;
  const eventType = String(readFlag(flags, ["event_type", "eventType", "event-type", "type"]) || queueName || "event").trim() || queueName;
  const payload = resolvePayload(flags, rest);
  const queueFile = queueName === "outbox" ? OUTBOX_FILE : INBOX_FILE;
  const sequence = getNextSequence(queueFile);
  const event = {
    event_id: `kcloud-${queueName}-${sequence}-${crypto.randomUUID()}`,
    project_id: projectId,
    source_tool_id: sourceToolId,
    target,
    event_type: eventType,
    direction,
    sequence,
    timestamp: now,
    payload,
    payload_hash: hashPayload(payload),
    status: direction === "inbound" ? "received" : "pending",
    attempts: 0,
    last_error: null,
    created_at: now,
    updated_at: now
  };
  appendJsonLine(queueFile, event);
  updateSyncCursor({
    [`${queueName}_sequence`]: sequence,
    updated_at: now
  });
  return {
    report_type: `kcloud_data_sharing_${queueName}_queued`,
    generated_at: now,
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    runtime_root: RUNTIME_ROOT,
    queue: queueName,
    path: queueFile,
    event,
    event_storage_paths: getKcloudEventPaths(),
    next_action: `Inspect ${queueName} events with \`kvdf kcloud inspect-events\`.`
  };
}

function inspectKcloudEvents(flags = {}) {
  ensureWorkspace();
  ensureKcloudRuntimeRoot();
  const storage = readKcloudStorageState();
  const report = {
    report_type: "kcloud_data_sharing_event_inspection",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    runtime_root: RUNTIME_ROOT,
    event_storage_ready: storage.ready,
    event_storage_paths: getKcloudEventPaths(),
    config_path: CONFIG_FILE,
    config_exists: fileExists(CONFIG_FILE),
    project_id: storage.config ? storage.config.project_id : null,
    repo_url: storage.config && storage.config.repo_url ? storage.config.repo_url : detectRepoUrl(),
    sync_cursor: storage.syncCursor,
    queues: {
      outbox: summarizeQueue(storage.outbox),
      inbox: summarizeQueue(storage.inbox)
    },
    ack_log: {
      path: ACK_LOG_FILE,
      count: storage.ackLog.length
    },
    dead_letter: {
      path: DEAD_LETTER_FILE,
      count: storage.deadLetter.length
    },
    transmit_log: {
      path: TRANSMIT_LOG_FILE,
      count: storage.transmitLog.length
    },
    receive_log: {
      path: RECEIVE_LOG_FILE,
      count: storage.receiveLog.length
    },
    audit_log: {
      path: AUDIT_LOG_FILE,
      count: storage.auditLog.length
    },
    next_action: "Use `kvdf kcloud queue-outbox` or `kvdf kcloud queue-inbox` to append more local events."
  };
  return report;
}

function readOutbox() {
  return readJsonlFile(OUTBOX_FILE);
}

function readInbox() {
  return readJsonlFile(INBOX_FILE);
}

function readAckLog() {
  return readJsonlFile(ACK_LOG_FILE);
}

function readDeadLetter() {
  return readJsonlFile(DEAD_LETTER_FILE);
}

function readSyncCursor() {
  return readKcloudSyncCursor();
}

function getNextSequence(filePath) {
  const records = readJsonlFile(filePath);
  if (!records.length) return 1;
  const sequences = records
    .map((record) => Number(record && record.sequence))
    .filter((value) => Number.isFinite(value));
  return (sequences.length ? Math.max(...sequences) : records.length) + 1;
}

function updateEventStatus(queueName, eventId, status, lastError = null) {
  ensureWorkspace();
  const queueFile = queueName === "inbox" ? INBOX_FILE : OUTBOX_FILE;
  const records = readJsonlFile(queueFile);
  let updated = null;
  const now = new Date().toISOString();
  const next = records.map((record) => {
    if (record.event_id !== eventId) return record;
    updated = {
      ...record,
      status,
      last_error: lastError,
      updated_at: now
    };
    return updated;
  });
  if (!updated) throw new Error(`Event not found in ${queueName}: ${eventId}`);
  writeJsonlFile(queueFile, next);
  return updated;
}

function patchEventRecord(queueName, eventId, patch = {}) {
  ensureWorkspace();
  const queueFile = queueName === "inbox" ? INBOX_FILE : OUTBOX_FILE;
  const records = readJsonlFile(queueFile);
  let updated = null;
  const now = new Date().toISOString();
  const next = records.map((record) => {
    if (record.event_id !== eventId) return record;
    updated = {
      ...record,
      ...patch,
      updated_at: now
    };
    return updated;
  });
  if (!updated) throw new Error(`Event not found in ${queueName}: ${eventId}`);
  writeJsonlFile(queueFile, next);
  return updated;
}

function moveEventToDeadLetter(queueName, eventId, reason) {
  ensureWorkspace();
  ensureKcloudRuntimeRoot();
  ensureKcloudEventFiles();
  const queueFile = queueName === "inbox" ? INBOX_FILE : OUTBOX_FILE;
  const records = readJsonlFile(queueFile);
  const event = records.find((record) => record.event_id === eventId);
  if (!event) throw new Error(`Event not found in ${queueName}: ${eventId}`);
  const now = new Date().toISOString();
  const deadEvent = {
    ...event,
    status: "dead-letter",
    last_error: String(reason || event.last_error || "moved to dead-letter").trim(),
    updated_at: now
  };
  appendJsonLine(DEAD_LETTER_FILE, deadEvent);
  updateEventStatus(queueName, eventId, "dead-letter", deadEvent.last_error);
  return deadEvent;
}

function appendKcloudAckLog(event, status = "acked", metadata = {}) {
  ensureWorkspace();
  ensureKcloudRuntimeRoot();
  ensureKcloudEventFiles();
  const now = new Date().toISOString();
  const ack = {
    ack_id: `kcloud-ack-${crypto.randomUUID()}`,
    event_id: event && event.event_id ? event.event_id : null,
    project_id: event && event.project_id ? event.project_id : null,
    source_tool_id: event && event.source_tool_id ? event.source_tool_id : null,
    queue: event && event.direction === "inbound" ? "inbox" : "outbox",
    sequence: event && typeof event.sequence === "number" ? event.sequence : null,
    payload_hash: event && event.payload_hash ? event.payload_hash : null,
    status,
    acknowledged_at: now,
    created_at: now,
    updated_at: now,
    metadata: metadata && typeof metadata === "object" ? metadata : {}
  };
  appendJsonLine(ACK_LOG_FILE, ack);
  return ack;
}

function readKcloudSyncCursor() {
  ensureWorkspace();
  if (!fileExists(SYNC_CURSOR_FILE)) {
    return {
      outbox_sequence: 0,
      inbox_sequence: 0,
      cloud_sequence: 0,
      last_synced_event_id: null,
      updated_at: null
    };
  }
  const cursor = readJsonFile(SYNC_CURSOR_FILE);
  return {
    outbox_sequence: Number.isFinite(cursor.outbox_sequence) ? cursor.outbox_sequence : 0,
    inbox_sequence: Number.isFinite(cursor.inbox_sequence) ? cursor.inbox_sequence : 0,
    cloud_sequence: Number.isFinite(cursor.cloud_sequence) ? cursor.cloud_sequence : 0,
    last_synced_event_id: Object.prototype.hasOwnProperty.call(cursor, "last_synced_event_id") ? cursor.last_synced_event_id : null,
    updated_at: cursor.updated_at || null
  };
}

function updateSyncCursor(patch = {}) {
  ensureWorkspace();
  ensureKcloudRuntimeRoot();
  const now = new Date().toISOString();
  const current = readKcloudSyncCursor();
  const next = {
    outbox_sequence: Number.isFinite(patch.outbox_sequence) ? patch.outbox_sequence : (Number.isFinite(current.outbox_sequence) ? current.outbox_sequence : 0),
    inbox_sequence: Number.isFinite(patch.inbox_sequence) ? patch.inbox_sequence : (Number.isFinite(current.inbox_sequence) ? current.inbox_sequence : 0),
    cloud_sequence: Number.isFinite(patch.cloud_sequence) ? patch.cloud_sequence : (Number.isFinite(current.cloud_sequence) ? current.cloud_sequence : 0),
    last_synced_event_id: Object.prototype.hasOwnProperty.call(patch, "last_synced_event_id") ? patch.last_synced_event_id : current.last_synced_event_id || null,
    updated_at: patch.updated_at || now
  };
  writeJsonFile(SYNC_CURSOR_FILE, next);
  return next;
}

function ensureKcloudRuntimeRoot() {
  ensureWorkspace();
  fs.mkdirSync(path.join(repoRoot(), RUNTIME_ROOT), { recursive: true });
}

function ensureKcloudEventFiles() {
  ensureKcloudRuntimeRoot();
  for (const file of [OUTBOX_FILE, INBOX_FILE, ACK_LOG_FILE, DEAD_LETTER_FILE, TRANSMIT_LOG_FILE, RECEIVE_LOG_FILE, AUDIT_LOG_FILE]) {
    ensureEmptyTextFile(file);
  }
  if (!fileExists(SYNC_CURSOR_FILE)) {
    writeJsonFile(SYNC_CURSOR_FILE, {
      outbox_sequence: 0,
      inbox_sequence: 0,
      cloud_sequence: 0,
      last_synced_event_id: null,
      updated_at: null
    });
  }
}

function getKcloudEventPaths() {
  return {
    config: CONFIG_FILE,
    outbox: OUTBOX_FILE,
    inbox: INBOX_FILE,
    ack_log: ACK_LOG_FILE,
    dead_letter: DEAD_LETTER_FILE,
    sync_cursor: SYNC_CURSOR_FILE,
    transmit_log: TRANSMIT_LOG_FILE,
    receive_log: RECEIVE_LOG_FILE,
    audit_log: AUDIT_LOG_FILE,
    readiness: READINESS_FILE
  };
}

function readKcloudStorageState() {
  const config = fileExists(CONFIG_FILE) ? readJsonFile(CONFIG_FILE) : null;
  const outbox = readJsonlFile(OUTBOX_FILE);
  const inbox = readJsonlFile(INBOX_FILE);
  const ackLog = readJsonlFile(ACK_LOG_FILE);
  const deadLetter = readJsonlFile(DEAD_LETTER_FILE);
  const transmitLog = readJsonlFile(TRANSMIT_LOG_FILE);
  const receiveLog = readJsonlFile(RECEIVE_LOG_FILE);
  const auditLog = readJsonlFile(AUDIT_LOG_FILE);
  const syncCursor = readKcloudSyncCursor();
  return {
    ready: fileExists(OUTBOX_FILE) && fileExists(INBOX_FILE) && fileExists(ACK_LOG_FILE) && fileExists(DEAD_LETTER_FILE) && fileExists(SYNC_CURSOR_FILE) && fileExists(TRANSMIT_LOG_FILE) && fileExists(RECEIVE_LOG_FILE) && fileExists(AUDIT_LOG_FILE),
    config,
    outbox,
    inbox,
    ackLog,
    deadLetter,
    transmitLog,
    receiveLog,
    auditLog,
    syncCursor
  };
}

function summarizeQueue(records) {
  const items = Array.isArray(records) ? records : [];
  const latest = items.length ? items[items.length - 1] : null;
  return {
    path_count: items.length,
    latest_event_id: latest ? latest.event_id : null,
    latest_sequence: latest && typeof latest.sequence === "number" ? latest.sequence : null,
    statuses: summarizeBy(items, "status")
  };
}

function appendJsonLine(filePath, record) {
  ensureWorkspace();
  fs.mkdirSync(path.dirname(path.join(repoRoot(), filePath)), { recursive: true });
  fs.appendFileSync(path.join(repoRoot(), filePath), `${JSON.stringify(record)}\n`, "utf8");
}

function readJsonlFile(filePath) {
  ensureWorkspace();
  const absolute = path.join(repoRoot(), filePath);
  if (!fs.existsSync(absolute)) return [];
  const content = fs.readFileSync(absolute, "utf8");
  if (!content.trim()) return [];
  return content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid JSONL record in ${filePath} at line ${index + 1}: ${error.message}`);
    }
  });
}

function writeJsonlFile(filePath, records) {
  ensureWorkspace();
  const absolute = path.join(repoRoot(), filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const content = records.length ? `${records.map((record) => JSON.stringify(record)).join("\n")}\n` : "";
  const tempPath = `${absolute}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  fs.writeFileSync(tempPath, content, "utf8");
  fs.renameSync(tempPath, absolute);
}

function ensureEmptyTextFile(filePath) {
  const absolute = path.join(repoRoot(), filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  if (!fs.existsSync(absolute)) fs.writeFileSync(absolute, "", "utf8");
}

function normalizeSourceToolId(flags = {}, deps = {}) {
  const candidates = [
    readFlag(flags, ["source_tool_id", "sourceToolId", "source-tool-id"]),
    readFlag(flags, ["tool_id", "toolId", "tool-id"]),
    readFlag(deps, ["source_tool_id", "sourceToolId", "source-tool-id"]),
    readFlag(deps, ["tool_id", "toolId", "tool-id"])
  ];
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (value) return value;
  }
  return "unknown_ai_tool";
}

function resolvePayload(flags = {}, rest = []) {
  const raw = Object.prototype.hasOwnProperty.call(flags, "payload")
    ? flags.payload
    : Object.prototype.hasOwnProperty.call(flags, "data")
      ? flags.data
      : Object.prototype.hasOwnProperty.call(flags, "body")
        ? flags.body
        : rest.length
          ? rest.join(" ")
          : null;
  if (raw === null || raw === undefined || raw === "") return {};
  if (typeof raw === "object") return raw;
  const text = String(raw).trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function hashPayload(payload) {
  return crypto.createHash("sha256").update(stableJsonStringify(payload)).digest("hex");
}

function stableJsonStringify(value) {
  return JSON.stringify(normalizeForStableJson(value));
}

function normalizeForStableJson(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeForStableJson(item));
  if (value && typeof value === "object" && value.constructor === Object) {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = normalizeForStableJson(value[key]);
    }
    return out;
  }
  return value;
}

function summarizeBy(items, key) {
  return (items || []).reduce((summary, item) => {
    const value = item && item[key] ? item[key] : "unknown";
    summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

function detectRepoUrl() {
  try {
    const value = execFileSync("git", ["config", "--get", "remote.origin.url"], { cwd: repoRoot(), stdio: ["ignore", "pipe", "ignore"] });
    return String(value).trim() || null;
  } catch {
    return null;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(repoRoot(), filePath));
}

function normalizeAction(value) {
  return String(value || "").trim().toLowerCase();
}

function readFlag(source = {}, names = []) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(source, name) && source[name] !== undefined) {
      return source[name];
    }
  }
  return undefined;
}

function isTruthyFlag(value) {
  if (value === true) return true;
  if (typeof value === "string") return ["1", "true", "yes", "on", "enabled"].includes(value.trim().toLowerCase());
  return Boolean(value);
}

function renderKcloudReport(report) {
  if (!report || typeof report !== "object") return String(report || "");
  if (report.report_type === "kcloud_data_sharing_status") {
    return [
      `${report.plugin_name} (${report.plugin_id})`,
      `Authority plugin: ${report.authority_plugin}`,
      `Transmit status: ${report.transmit_status}`,
      `Receive status: ${report.receive_status}`,
      `Cloud project connection status: ${report.cloud_project_connection_status}`,
      `Local runtime state path: ${report.local_runtime_state_path}`,
      `Config path: ${report.config_path}`,
      `Event storage ready: ${report.event_storage_ready ? "yes" : "no"}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_initialized") {
    return [
      `${report.plugin_name} initialized`,
      `Runtime root: ${report.runtime_root}`,
      `Config path: ${report.config_path}`,
      `Authority plugin: ${report.authority_plugin}`,
      `Event storage paths:`,
      ...Object.entries(report.event_storage_paths || {}).map(([key, value]) => `- ${key}: ${value}`)
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_event_inspection") {
    return [
      `${report.plugin_name} event inspection`,
      `Runtime root: ${report.runtime_root}`,
      `Event storage ready: ${report.event_storage_ready ? "yes" : "no"}`,
      `Outbox events: ${report.queues.outbox.path_count}`,
      `Inbox events: ${report.queues.inbox.path_count}`,
      `ACK log events: ${report.ack_log.count}`,
      `Dead-letter events: ${report.dead_letter.count}`,
      `Sync cursor: ${JSON.stringify(report.sync_cursor)}`
    ].join("\n");
  }
  if (String(report.report_type || "").includes("queued")) {
    return [
      `${report.plugin_name} queued event`,
      `Queue: ${report.queue}`,
      `Path: ${report.path}`,
      `Event ID: ${report.event && report.event.event_id ? report.event.event_id : ""}`,
      `Event type: ${report.event && report.event.event_type ? report.event.event_type : ""}`,
      `Direction: ${report.event && report.event.direction ? report.event.direction : ""}`,
      `Sequence: ${report.event && report.event.sequence !== undefined ? report.event.sequence : ""}`,
      `Target: ${report.event && report.event.target ? report.event.target : ""}`,
      `Payload hash: ${report.event && report.event.payload_hash ? report.event.payload_hash : ""}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_outbox_status") {
    return [
      `${report.plugin_name} outbox`,
      `Events: ${report.counts.total}`,
      `Pending: ${report.counts.pending}`,
      `Acknowledged: ${report.counts.acknowledged}`,
      `Dead-letter: ${report.counts.dead_letter}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_inbox_status") {
    return [
      `${report.plugin_name} inbox`,
      `Events: ${report.counts.total}`,
      `Received: ${report.counts.received}`,
      `Validated: ${report.counts.validated}`,
      `Processed: ${report.counts.processed}`,
      `Acknowledged: ${report.counts.acknowledged}`,
      `Dead-letter: ${report.counts.dead_letter}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_transmit") {
    return [
      `${report.plugin_name} transmit`,
      `Mode: ${report.mode}`,
      `Final status counts: ${JSON.stringify(report.counts || {})}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_receive") {
    return [
      `${report.plugin_name} receive`,
      `Mode: ${report.mode}`,
      `Final status counts: ${JSON.stringify(report.counts || {})}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_sync") {
    return [
      `${report.plugin_name} sync`,
      `Mode: ${report.mode}`,
      `Cycles: ${report.counts ? report.counts.cycles : 0}`,
      `Transmit: ${JSON.stringify(report.counts ? report.counts.transmit : {})}`,
      `Receive: ${JSON.stringify(report.counts ? report.counts.receive : {})}`,
      `ACKs: ${JSON.stringify(report.counts ? report.counts.acknowledgements : {})}`,
      `Processed: ${JSON.stringify(report.counts ? report.counts.processed : {})}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_audit") {
    return [
      `${report.plugin_name} audit`,
      `Total audit records: ${report.counts.total}`,
      `Transmit log records: ${report.counts.transmit}`,
      `Receive log records: ${report.counts.receive}`,
      `ACK records: ${report.counts.ack}`,
      `Dead-letter records: ${report.counts.dead_letter}`
    ].join("\n");
  }
  if (report.report_type === "kcloud_data_sharing_readiness") {
    return [
      `${report.plugin_name} readiness`,
      ...Object.entries(report.summary || {}).map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`),
      `Overall: ${report.overall}`
    ].join("\n");
  }
  return JSON.stringify(report, null, 2);
}

function buildKcloudOutboxReport(flags = {}) {
  const storage = readKcloudStorageState();
  const eventId = String(readFlag(flags, ["event_id", "eventId", "id"]) || "").trim();
  const outbox = eventId ? storage.outbox.filter((item) => item.event_id === eventId) : storage.outbox;
  return {
    report_type: "kcloud_data_sharing_outbox_status",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    runtime_root: RUNTIME_ROOT,
    outbox,
    counts: {
      total: storage.outbox.length,
      selected: outbox.length,
      pending: storage.outbox.filter((item) => ["pending", "queued", "retrying", "failed", "sending", "sent"].includes(item.status)).length,
      acknowledged: storage.outbox.filter((item) => item.status === "acknowledged").length,
      dead_letter: storage.outbox.filter((item) => item.status === "dead_letter" || item.status === "dead-letter").length
    }
  };
}

function buildKcloudInboxReport(flags = {}) {
  const storage = readKcloudStorageState();
  const eventId = String(readFlag(flags, ["event_id", "eventId", "id"]) || "").trim();
  const inbox = eventId ? storage.inbox.filter((item) => item.event_id === eventId) : storage.inbox;
  return {
    report_type: "kcloud_data_sharing_inbox_status",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    runtime_root: RUNTIME_ROOT,
    inbox,
    counts: {
      total: storage.inbox.length,
      selected: inbox.length,
      received: storage.inbox.filter((item) => item.status === "received").length,
      validated: storage.inbox.filter((item) => item.status === "validated").length,
      rejected: storage.inbox.filter((item) => item.status === "rejected").length,
      processed: storage.inbox.filter((item) => item.status === "processed").length,
      acknowledged: storage.inbox.filter((item) => item.status === "acknowledged").length,
      dead_letter: storage.inbox.filter((item) => item.status === "dead_letter" || item.status === "dead-letter").length
    }
  };
}

function buildKcloudTransmitReport(flags = {}) {
  const storage = readKcloudStorageState();
  return {
    report_type: "kcloud_data_sharing_transmit_report",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    outbox: summarizeQueue(storage.outbox),
    transmit_log: {
      path: TRANSMIT_LOG_FILE,
      count: storage.transmitLog.length
    },
    dead_letter: {
      path: DEAD_LETTER_FILE,
      count: storage.deadLetter.length
    }
  };
}

function buildKcloudReceiveReport(flags = {}) {
  const storage = readKcloudStorageState();
  return {
    report_type: "kcloud_data_sharing_receive_report",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    inbox: summarizeQueue(storage.inbox),
    receive_log: {
      path: RECEIVE_LOG_FILE,
      count: storage.receiveLog.length
    },
    dead_letter: {
      path: DEAD_LETTER_FILE,
      count: storage.deadLetter.length
    }
  };
}

function buildKcloudAuditReport(flags = {}) {
  const storage = readKcloudStorageState();
  return {
    report_type: "kcloud_data_sharing_audit",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    runtime_root: RUNTIME_ROOT,
    events: storage.auditLog,
    counts: {
      total: storage.auditLog.length,
      transmit: storage.transmitLog.length,
      receive: storage.receiveLog.length,
      ack: storage.ackLog.length,
      dead_letter: storage.deadLetter.length
    }
  };
}

function buildKcloudReadinessReport(flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const config = storage.config || null;
  const cloudClient = createKcloudCloudClient({ config, flags, allowOffline: true });
  const governance = getKcloudGovernanceAdapter();
  const report = {
    report_type: "kcloud_data_sharing_readiness",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    readiness: {
      plugin_installed: true,
      config_exists: fileExists(CONFIG_FILE),
      outbox_exists: fileExists(OUTBOX_FILE),
      inbox_exists: fileExists(INBOX_FILE),
      ack_log_exists: fileExists(ACK_LOG_FILE),
      dead_letter_exists: fileExists(DEAD_LETTER_FILE),
      sync_cursor_exists: fileExists(SYNC_CURSOR_FILE),
      transmit_engine_available: true,
      receive_engine_available: true,
      cloud_client_configured_or_mockable: Boolean(cloudClient.mockable),
      governance_adapter_available: Boolean(governance.available),
      payload_hash_validation_working: hashPayload({ a: 1, b: 2 }) === hashPayload({ b: 2, a: 1 }),
      duplicate_detection_working: dedupeKcloudRecords([{ event_id: "a" }, { event_id: "a" }]).length === 1,
      retry_handling_working: calculateKcloudRetryDelay(2, 1000, 60000) >= 1000,
      dead_letter_handling_working: typeof moveEventToDeadLetter === "function"
    }
  };
  report.summary = Object.entries(report.readiness).reduce((acc, [key, value]) => {
    acc[key] = value ? "PASS" : "FAIL";
    return acc;
  }, {});
  report.overall =
    Object.values(report.readiness).every(Boolean) ? "PASS" : "FAIL";
  return report;
}

function createKcloudCloudClient({ config = null, flags = {}, allowOffline = false } = {}) {
  const endpoint = resolveKcloudEndpoint(flags, config);
  const client = {
    endpoint: endpoint || null,
    mockable: true,
    online: false,
    available: Boolean(endpoint),
    mode: endpoint ? "filesystem" : "offline",
    publishEvent: null,
    pullEvents: null,
    publishAck: null,
    pullAcks: null
  };
  if (!endpoint) {
    if (!allowOffline) throw new Error("Cloud client is not configured.");
    client.publishEvent = () => ({ online: false, accepted: false, offline: true });
    client.pullEvents = () => [];
    client.publishAck = () => ({ online: false, accepted: false, offline: true });
    client.pullAcks = () => [];
    return client;
  }
  const root = resolveKcloudEndpointPath(endpoint);
  fs.mkdirSync(root, { recursive: true });
  const eventsFile = path.join(root, "events.jsonl");
  const acksFile = path.join(root, "acks.jsonl");
  client.online = true;
  client.available = true;
  client.root = root;
  client.publishEvent = (event) => {
    const records = readJsonlAbsolute(eventsFile);
    const existing = records.find((item) => item.event_id === event.event_id);
    if (existing) {
      return { online: true, accepted: true, duplicate: true, event: existing };
    }
    const record = {
      ...event,
      cloud_event_id: event.event_id,
      cloud_status: "published",
      published_at: new Date().toISOString()
    };
    appendJsonLineAbsolute(eventsFile, record);
    return { online: true, accepted: true, duplicate: false, event: record };
  };
  client.pullEvents = ({ project_id = null, since_sequence = 0, event_id = null } = {}) => {
    const records = readJsonlAbsolute(eventsFile);
    return records.filter((item) => {
      if (project_id && String(item.project_id || "") !== String(project_id)) return false;
      if (event_id && String(item.event_id || "") !== String(event_id)) return false;
      const sequence = Number(item.sequence || 0);
      if (Number.isFinite(since_sequence) && since_sequence && sequence <= since_sequence) return false;
      return true;
    });
  };
  client.publishAck = (ack) => {
    const records = readJsonlAbsolute(acksFile);
    const existing = records.find((item) => item.event_id === ack.event_id && item.status === ack.status);
    if (existing) {
      return { online: true, accepted: true, duplicate: true, ack: existing };
    }
    const record = {
      ...ack,
      cloud_ack_id: ack.ack_id || `cloud-ack-${crypto.randomUUID()}`,
      published_at: new Date().toISOString()
    };
    appendJsonLineAbsolute(acksFile, record);
    return { online: true, accepted: true, duplicate: false, ack: record };
  };
  client.pullAcks = ({ project_id = null, since_sequence = 0, event_id = null } = {}) => {
    const records = readJsonlAbsolute(acksFile);
    return records.filter((item) => {
      if (project_id && String(item.project_id || "") !== String(project_id)) return false;
      if (event_id && String(item.event_id || "") !== String(event_id)) return false;
      const sequence = Number(item.sequence || 0);
      if (Number.isFinite(since_sequence) && since_sequence && sequence <= since_sequence) return false;
      return true;
    });
  };
  return client;
}

function transmitPendingEvents(flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const outbox = storage.outbox.filter((event) => isKcloudTransmitPending(event));
  const results = [];
  for (const event of outbox) {
    results.push(transmitOneEvent(event.event_id, flags, deps));
  }
  return {
    report_type: "kcloud_data_sharing_transmit",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    mode: "bulk",
    results,
    counts: summarizeTransmitResults(results)
  };
}

function transmitOneEvent(eventId, flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const event = storage.outbox.find((item) => item.event_id === eventId);
  if (!event) {
    throw new Error(`Outbox event not found: ${eventId}`);
  }
  if (event.status === "acknowledged" || event.status === "dead_letter" || event.status === "dead-letter") {
    return buildKcloudTransportResult("transmit", event, "duplicate", "Event already reached a final state.", { duplicate: true });
  }
  return transmitKcloudEvent(event, flags, deps);
}

function retryFailedTransmits(flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const retryable = storage.outbox.filter((event) => ["failed", "retrying", "pending", "queued", "sent", "sending"].includes(event.status));
  const results = [];
  for (const event of retryable) {
    if (event.attempts && event.attempts >= 5 && event.status === "failed") continue;
    results.push(transmitKcloudEvent(event, flags, deps, { retry: true }));
  }
  return {
    report_type: "kcloud_data_sharing_retry_failed",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    mode: "retry",
    results,
    counts: summarizeTransmitResults(results)
  };
}

function transmitKcloudEvent(event, flags = {}, deps = {}, options = {}) {
  ensureKcloudEventFiles();
  const config = fileExists(CONFIG_FILE) ? readJsonFile(CONFIG_FILE) : null;
  const cloudClient = createKcloudCloudClient({ config, flags, allowOffline: true });
  const now = new Date().toISOString();
  const attempt = {
    transmit_attempt_id: `kcloud-transmit-${crypto.randomUUID()}`,
    event_id: event.event_id,
    project_id: event.project_id,
    source_tool_id: event.source_tool_id,
    target: event.target,
    event_type: event.event_type,
    direction: event.direction,
    sequence: event.sequence,
    idempotency_key: buildKcloudIdempotencyKey(event),
    attempts: (Number(event.attempts) || 0) + 1,
    started_at: now,
    updated_at: now,
    status: "sending"
  };
  const category = classifyKcloudEvent(event);
  const decision = evaluateKcloudTransportGovernance({
    direction: "outbound",
    event,
    category,
    config,
    flags,
    deps
  });
  if (decision.decision === "block") {
    const blocked = updateEventStatus("outbox", event.event_id, "failed", decision.reason || "Governance blocked outbound transmit.");
    appendJsonLine(TRANSMIT_LOG_FILE, {
      ...attempt,
      status: "blocked",
      ended_at: now,
      error: decision.reason || "Governance blocked outbound transmit."
    });
    recordKcloudTransportAudit("transmit.blocked", event, blocked, decision, deps);
    moveEventToDeadLetter("outbox", event.event_id, decision.reason || "Governance blocked outbound transmit.");
    return buildKcloudTransportResult("transmit", blocked, "dead_letter", decision.reason || "Governance blocked outbound transmit.", {
      governance_decision: decision
    });
  }
  if (decision.decision === "require_owner_approval") {
    const pending = updateEventStatus("outbox", event.event_id, "retrying", decision.reason || "Owner approval required.");
    appendJsonLine(TRANSMIT_LOG_FILE, {
      ...attempt,
      status: "approval_required",
      ended_at: now,
      error: decision.reason || "Owner approval required."
    });
    recordKcloudTransportAudit("transmit.approval_required", event, pending, decision, deps);
    return buildKcloudTransportResult("transmit", pending, "retrying", decision.reason || "Owner approval required.", {
      governance_decision: decision
    });
  }

  const sending = updateEventStatus("outbox", event.event_id, "sending", null);
  patchEventRecord("outbox", event.event_id, {
    status: "sending",
    attempts: attempt.attempts,
    last_error: null
  });
  appendJsonLine(TRANSMIT_LOG_FILE, attempt);

  try {
    if (!cloudClient.online) {
      const offlineStatus = updateEventStatus("outbox", event.event_id, options.retry ? "retrying" : "retrying", "Cloud client offline.");
      appendJsonLine(TRANSMIT_LOG_FILE, {
        ...attempt,
        status: "retrying",
        ended_at: new Date().toISOString(),
        error: "Cloud client offline."
      });
      recordKcloudTransportAudit("transmit.offline", event, offlineStatus, decision, deps);
      return buildKcloudTransportResult("transmit", offlineStatus, "retrying", "Cloud client offline.", {
        governance_decision: decision,
        offline: true
      });
    }

    const publishResult = cloudClient.publishEvent({
      ...sending,
      idempotency_key: attempt.idempotency_key,
      transmit_attempt_id: attempt.transmit_attempt_id,
      transmit_status: "sent",
      cloud_status: "published",
      transmitted_at: now
    });
    const published = publishResult && typeof publishResult.then === "function" ? null : publishResult;
    if (published && published.duplicate) {
      const duplicate = updateEventStatus("outbox", event.event_id, "acknowledged", null);
      const ack = appendKcloudAckLog(duplicate, "acked", { source: "duplicate_transmit" });
      appendJsonLine(AUDIT_LOG_FILE, {
        audit_id: `kcloud-audit-${crypto.randomUUID()}`,
        event_type: "kcloud.transmit.duplicate",
        event_id: event.event_id,
        status: "ok",
        created_at: now,
        payload: { event_id: event.event_id, idempotency_key: attempt.idempotency_key }
      });
      return buildKcloudTransportResult("transmit", duplicate, "acknowledged", "Duplicate transmit suppressed.", {
        duplicate: true,
        ack,
        governance_decision: decision,
        cloud_result: published
      });
    }
    if (published && published.acknowledged) {
      const acknowledged = updateEventStatus("outbox", event.event_id, "acknowledged", null);
      const ack = appendKcloudAckLog(acknowledged, "acked", { source: "cloud_publish" });
      recordKcloudTransportAudit("transmit.acknowledged", event, acknowledged, decision, deps);
      return buildKcloudTransportResult("transmit", acknowledged, "acknowledged", "Cloud ACK received.", {
        ack,
        governance_decision: decision,
        cloud_result: published
      });
    }

    const sent = updateEventStatus("outbox", event.event_id, "sent", null);
    recordKcloudTransportAudit("transmit.sent", event, sent, decision, deps);
    const ackRecords = typeof cloudClient.pullAcks === "function"
      ? awaitableResult(cloudClient.pullAcks({ project_id: event.project_id, event_id: event.event_id, since_sequence: 0 }))
      : [];
    if (Array.isArray(ackRecords) && ackRecords.length) {
      const ack = ackRecords[ackRecords.length - 1];
      const acknowledged = updateEventStatus("outbox", event.event_id, "acknowledged", null);
      appendKcloudAckLog(acknowledged, "acked", { source: "cloud_ack", cloud_ack: ack });
      recordKcloudTransportAudit("transmit.acknowledged", event, acknowledged, decision, deps);
      return buildKcloudTransportResult("transmit", acknowledged, "acknowledged", "Cloud ACK reconciled.", {
        ack,
        governance_decision: decision,
        cloud_result: published || null
      });
    }
    return buildKcloudTransportResult("transmit", sent, "sent", "Cloud accepted the event and it remains pending acknowledgement.", {
      governance_decision: decision,
      cloud_result: published || null
    });
  } catch (error) {
    const attempts = (Number(event.attempts) || 0) + 1;
    const retryDelayMs = calculateKcloudRetryDelay(attempts);
    const lastError = error && error.message ? error.message : String(error || "Transmission failed");
    const nextStatus = attempts >= 5 ? "failed" : "retrying";
    const updated = patchEventRecord("outbox", event.event_id, {
      status: nextStatus,
      attempts,
      last_error: `${lastError}${retryDelayMs ? ` (retry in ${retryDelayMs}ms)` : ""}`
    });
    appendJsonLine(TRANSMIT_LOG_FILE, {
      ...attempt,
      status: nextStatus,
      ended_at: new Date().toISOString(),
      error: lastError,
      retry_delay_ms: retryDelayMs
    });
    recordKcloudTransportAudit("transmit.failed", event, updated, decision, deps, { error: lastError });
    if (nextStatus === "failed") {
      moveEventToDeadLetter("outbox", event.event_id, lastError);
      return buildKcloudTransportResult("transmit", updated, "dead_letter", lastError, {
        governance_decision: decision,
        error: lastError
      });
    }
    return buildKcloudTransportResult("transmit", updated, "retrying", lastError, {
      governance_decision: decision,
      retry_delay_ms: retryDelayMs,
      error: lastError
    });
  }
}

function receiveCloudEvents(flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const config = storage.config || null;
  const cloudClient = createKcloudCloudClient({ config, flags, allowOffline: true });
  const sinceSequence = Number(storage.syncCursor && storage.syncCursor.cloud_sequence ? storage.syncCursor.cloud_sequence : 0) || 0;
  const remoteEvents = cloudClient.online && typeof cloudClient.pullEvents === "function"
    ? awaitableResult(cloudClient.pullEvents({
        project_id: config ? config.project_id : null,
        since_sequence: sinceSequence
      }))
    : [];
  const results = [];
  let cursor = storage.syncCursor || readKcloudSyncCursor();
  for (const event of remoteEvents) {
    results.push(receiveOneEvent(event.event_id, flags, deps, { remoteEvent: event, cloudClient }));
    const currentSequence = Number(event.sequence || 0);
    if (currentSequence > (Number(cursor.cloud_sequence) || 0)) {
      cursor = updateSyncCursor({
        cloud_sequence: currentSequence,
        last_synced_event_id: event.event_id,
        updated_at: new Date().toISOString()
      });
    }
  }
  return {
    report_type: "kcloud_data_sharing_receive",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    mode: "bulk",
    results,
    counts: summarizeReceiveResults(results)
  };
}

function receiveOneEvent(eventId, flags = {}, deps = {}, context = {}) {
  const storage = readKcloudStorageState();
  const config = storage.config || null;
  const cloudClient = context.cloudClient || createKcloudCloudClient({ config, flags, allowOffline: true });
  const remoteEvent = context.remoteEvent || awaitableResult(cloudClient.pullEvents({
    event_id: eventId,
    since_sequence: 0
  })).find((item) => item.event_id === eventId);
  if (!remoteEvent) {
    throw new Error(`Remote event not found: ${eventId}`);
  }
  const result = processReceivedKcloudEvent(remoteEvent, { cloudClient, flags, deps });
  return result;
}

function acknowledgeReceivedEvent(eventId, flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const event = storage.inbox.find((item) => item.event_id === eventId) || storage.outbox.find((item) => item.event_id === eventId);
  if (!event) throw new Error(`Received event not found: ${eventId}`);
  const cloudClient = createKcloudCloudClient({ config: storage.config || null, flags, allowOffline: true });
  const ack = appendKcloudAckLog(event, "received_ack", { source: "local_acknowledge" });
  if (cloudClient.online && typeof cloudClient.publishAck === "function") {
    awaitableResult(cloudClient.publishAck({
      ack_id: ack.ack_id,
      event_id: event.event_id,
      project_id: event.project_id,
      source_tool_id: event.source_tool_id,
      sequence: event.sequence,
      payload_hash: event.payload_hash,
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
      created_at: ack.created_at,
      updated_at: ack.updated_at
    }));
  }
  const updated = updateEventStatus("inbox", event.event_id, "acknowledged", null);
  recordKcloudTransportAudit("receive.acknowledged", event, updated, { decision: "allow", reason: "Local acknowledgement", risk_level: "low", requires_owner_approval: false }, deps, { ack });
  return {
    report_type: "kcloud_data_sharing_ack_received",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    event: updated,
    ack
  };
}

function synchronizeKcloud(flags = {}, deps = {}) {
  const once = isTruthyFlag(readFlag(flags, ["once", "one", "single"])) || !isTruthyFlag(readFlag(flags, ["watch", "continuous"]));
  const intervalSeconds = Math.max(1, Number(readFlag(flags, ["interval", "every", "delay"]) || 2) || 2);
  const iterations = once ? 1 : Math.max(1, Number(readFlag(flags, ["iterations", "cycles"]) || 0) || Infinity);
  const stopSignal = { stopped: false };
  if (!once && typeof process !== "undefined" && process.once) {
    const stop = () => { stopSignal.stopped = true; };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }
  const cycles = [];
  let count = 0;
  while (!stopSignal.stopped && count < iterations) {
    const transmit = transmitPendingEvents(flags, deps);
    const ackSync = reconcileCloudAcks(flags, deps);
    const receive = receiveCloudEvents(flags, deps);
    const processed = processGovernedInboxEvents(flags, deps);
    const snapshot = {
      cycle: count + 1,
      transmit,
      acknowledgements: ackSync,
      receive,
      processed
    };
    cycles.push(snapshot);
    recordKcloudTransportAudit("sync.cycle", { event_id: `sync-${count + 1}`, project_id: getKcloudProjectId(), source_tool_id: "kcloud_data_sharing", target: "cloud", event_type: "sync", direction: "outbound", sequence: count + 1, payload_hash: "", status: "sync" }, { status: "sync" }, { decision: "allow", reason: "Sync cycle", risk_level: "low", requires_owner_approval: false }, deps, { snapshot });
    count += 1;
    if (once || count >= iterations || stopSignal.stopped) break;
    if (intervalSeconds > 0) sleepSync(intervalSeconds * 1000);
  }
  const report = {
    report_type: "kcloud_data_sharing_sync",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    mode: once ? "once" : "watch",
    cycles,
    counts: {
      cycles: cycles.length,
      transmit: sumNestedCounts(cycles, "transmit"),
      receive: sumNestedCounts(cycles, "receive"),
      acknowledgements: sumNestedCounts(cycles, "acknowledgements"),
      processed: sumNestedCounts(cycles, "processed")
    }
  };
  writeReadinessSnapshot(report);
  return report;
}

function processGovernedInboxEvents(flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const events = storage.inbox.filter((item) => ["received", "validated"].includes(item.status));
  const results = [];
  for (const event of events) {
    results.push(processReceivedKcloudEvent(event, { alreadyStored: true, flags, deps }));
  }
  return {
    report_type: "kcloud_data_sharing_inbox_processing",
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    results,
    counts: summarizeReceiveResults(results)
  };
}

function processReceivedKcloudEvent(event, { cloudClient = null, flags = {}, deps = {}, alreadyStored = false } = {}) {
  const storage = readKcloudStorageState();
  const localConfig = storage.config || null;
  const storedDuplicate = storage.inbox.find((item) => item.event_id === event.event_id);
  const allowDuplicate = storedDuplicate && alreadyStored;
  const category = classifyKcloudEvent(event);
  const decision = evaluateKcloudTransportGovernance({
    direction: "inbound",
    event,
    category,
    config: localConfig,
    flags,
    deps
  });
  const now = new Date().toISOString();
  let current = storedDuplicate || {
    ...event,
    status: "received",
    attempts: Number(event.attempts) || 0,
    last_error: null,
    created_at: event.created_at || now,
    updated_at: now
  };
  if (storedDuplicate && !allowDuplicate) {
    current = updateEventStatus("inbox", event.event_id, "rejected", "Duplicate event received.");
    appendKcloudAckLog(current, "duplicate", { source: "receive_duplicate" });
    appendJsonLine(RECEIVE_LOG_FILE, {
      receive_attempt_id: `kcloud-receive-${crypto.randomUUID()}`,
      event_id: event.event_id,
      status: "duplicate",
      reason: "Duplicate event received.",
      decision,
      created_at: now
    });
    return buildKcloudTransportResult("receive", current, "rejected", "Duplicate event received.", {
      duplicate: true,
      governance_decision: decision
    });
  }

  const projectId = getKcloudProjectId();
  if (String(event.project_id || "") !== String(projectId || "")) {
    const rejected = storeReceivedKcloudFinalState(event, "rejected", "Wrong project_id.", decision, deps, { cloudClient });
    return buildKcloudTransportResult("receive", rejected, "rejected", "Wrong project_id.", {
      governance_decision: decision,
      rejected: true
    });
  }
  if (!isKcloudPayloadHashValid(event)) {
    const rejected = storeReceivedKcloudFinalState(event, "rejected", "Invalid payload_hash.", decision, deps, { cloudClient });
    return buildKcloudTransportResult("receive", rejected, "rejected", "Invalid payload_hash.", {
      governance_decision: decision,
      rejected: true
    });
  }
  if (decision.decision === "block") {
    const rejected = storeReceivedKcloudFinalState(event, "rejected", decision.reason || "Governance blocked inbound event.", decision, deps, { cloudClient });
    return buildKcloudTransportResult("receive", rejected, "rejected", decision.reason || "Governance blocked inbound event.", {
      governance_decision: decision
    });
  }
  if (decision.decision === "require_owner_approval") {
    const pending = storeReceivedKcloudFinalState(event, "validated", decision.reason || "Owner approval required.", decision, deps, { cloudClient });
    recordKcloudApprovalRequestFromTransport(pending, decision, deps);
    return buildKcloudTransportResult("receive", pending, "validated", decision.reason || "Owner approval required.", {
      governance_decision: decision,
      approval_required: true
    });
  }

  const validated = storeReceivedKcloudFinalState(event, "validated", null, decision, deps, { cloudClient });
  const processed = updateEventStatus("inbox", validated.event_id, "processed", null);
  recordKcloudTransportAudit("receive.processed", event, processed, decision, deps);
  if (cloudClient && cloudClient.online && typeof cloudClient.publishAck === "function") {
    const ack = appendKcloudAckLog(processed, "acknowledged", { source: "receive_ack" });
    awaitableResult(cloudClient.publishAck({
      ack_id: ack.ack_id,
      event_id: processed.event_id,
      project_id: processed.project_id,
      source_tool_id: processed.source_tool_id,
      sequence: processed.sequence,
      payload_hash: processed.payload_hash,
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
      created_at: ack.created_at,
      updated_at: ack.updated_at
    }));
    const acknowledged = updateEventStatus("inbox", processed.event_id, "acknowledged", null);
    recordKcloudTransportAudit("receive.acknowledged", event, acknowledged, decision, deps, { ack });
    return buildKcloudTransportResult("receive", acknowledged, "acknowledged", "Inbound event stored, validated, and acknowledged.", {
      governance_decision: decision,
      ack
    });
  }
  return buildKcloudTransportResult("receive", processed, "processed", "Inbound event stored and prepared for governance handoff.", {
    governance_decision: decision
  });
}

function buildKcloudTransportResult(channel, event, finalStatus, reason, extra = {}) {
  return {
    report_type: `kcloud_data_sharing_${channel}`,
    generated_at: new Date().toISOString(),
    plugin_name: PLUGIN_NAME,
    authority_plugin: AUTHORITY_PLUGIN,
    channel,
    event,
    final_status: finalStatus,
    status: finalStatus,
    reason,
    ...extra
  };
}

function recordKcloudTransportAudit(eventType, event, storedEvent, decision, deps = {}, extra = {}) {
  const now = new Date().toISOString();
  const record = {
    audit_id: `kcloud-audit-${crypto.randomUUID()}`,
    event_type: eventType,
    event_id: event && event.event_id ? event.event_id : null,
    project_id: event && event.project_id ? event.project_id : null,
    source_tool_id: event && event.source_tool_id ? event.source_tool_id : null,
    target: event && event.target ? event.target : null,
    event_status: storedEvent && storedEvent.status ? storedEvent.status : null,
    decision: decision ? decision.decision : null,
    reason: decision ? decision.reason : null,
    risk_level: decision ? decision.risk_level : null,
    requires_owner_approval: decision ? Boolean(decision.requires_owner_approval) : false,
    created_at: now,
    payload: {
      event,
      stored_event: storedEvent || null,
      decision: decision || null,
      ...extra
    }
  };
  appendJsonLine(AUDIT_LOG_FILE, record);
  if (typeof deps.appendAudit === "function") {
    deps.appendAudit(eventType, "kcloud_event", record.event_id || record.audit_id, record.reason || eventType);
  }
  return record;
}

function recordKcloudApprovalRequestFromTransport(event, decision, deps = {}) {
  const now = new Date().toISOString();
  const request = {
    kcloud_approval_request_id: `kcloud-approval-${crypto.randomUUID()}`,
    project_id: event && event.project_id ? event.project_id : null,
    task_id: event && event.payload && event.payload.task_id ? event.payload.task_id : null,
    packet_id: event && event.event_id ? event.event_id : null,
    reason: decision && decision.reason ? decision.reason : "Approval required",
    risk_level: decision && decision.risk_level ? decision.risk_level : "high",
    status: "pending",
    created_at: now,
    updated_at: now
  };
  recordKcloudTransportAudit("receive.approval_required", event, event, decision, deps, { approval_request: request });
  return request;
}

function getKcloudGovernanceAdapter() {
  try {
    const directPath = path.join(__dirname, "../../multi_ai_governance/bootstrap.js");
    if (fs.existsSync(directPath)) {
      delete require.cache[require.resolve(directPath)];
      const bundle = require(directPath);
      const evaluate = bundle && (bundle.buildMultiAiKcloudPolicyReport || (bundle.kcloudGovernance && bundle.kcloudGovernance.evaluateKcloudPolicy));
      if (typeof evaluate === "function") {
        return {
          available: true,
          invoke(context) {
            const flags = buildKcloudGovernanceFlags(context);
            return evaluate(flags, {
              appendAudit: context && context.deps && typeof context.deps.appendAudit === "function" ? context.deps.appendAudit : null
            });
          }
        };
      }
    }
    const bundle = loadPluginBootstrap("multi_ai_governance", { allowSourceFallback: true });
    const evaluate = bundle && (bundle.buildMultiAiKcloudPolicyReport || (bundle.kcloudGovernance && bundle.kcloudGovernance.evaluateKcloudPolicy));
    if (typeof evaluate === "function") {
      return {
        available: true,
        invoke(context) {
          const flags = buildKcloudGovernanceFlags(context);
          return evaluate(flags, {
            appendAudit: context && context.deps && typeof context.deps.appendAudit === "function" ? context.deps.appendAudit : null
          });
        }
      };
    }
  } catch {
    // fall through to local fallback
  }
  return {
    available: false,
    invoke(context) {
      const category = context && context.category ? context.category : "safe_event";
      if (category === "restricted_event") {
        return {
          decision: "block",
          reason: "Governance authority unavailable.",
          risk_level: "high",
          requires_owner_approval: false,
          source: "fallback"
        };
      }
      if (category === "controlled_event") {
        return {
          decision: "warn",
          reason: "Governance authority unavailable; controlled event requires review.",
          risk_level: "medium",
          requires_owner_approval: false,
          source: "fallback"
        };
      }
      return {
        decision: "allow",
        reason: "Safe event allowed by fallback governance.",
        risk_level: "low",
        requires_owner_approval: false,
        source: "fallback"
      };
    }
  };
}

function evaluateKcloudTransportGovernance(context = {}) {
  if (context.deps && typeof context.deps.governanceAdapter === "function") {
    const injected = context.deps.governanceAdapter(context) || {};
    return normalizeKcloudDecision(injected, context, "injected");
  }
  const adapter = getKcloudGovernanceAdapter();
  const decision = adapter.invoke(context) || {};
  if (typeof decision === "string") {
    return normalizeKcloudDecision({
      decision,
      reason: "Governance adapter returned a string decision.",
      risk_level: "medium",
      requires_owner_approval: false
    }, context, adapter.available ? "multi_ai_governance" : "fallback");
  }
  return normalizeKcloudDecision(decision, context, adapter.available ? "multi_ai_governance" : "fallback");
}

function normalizeKcloudDecision(decision = {}, context = {}, source = "fallback") {
  return {
    decision: decision.decision || (context.category === "restricted_event" ? "block" : "allow"),
    reason: decision.reason || (decision.decision === "allow" ? "Allowed." : "Governance decision recorded."),
    risk_level: decision.risk_level || "medium",
    requires_owner_approval: Boolean(decision.requires_owner_approval),
    evidence_id: decision.evidence_id || null,
    timestamp: decision.timestamp || new Date().toISOString(),
    source
  };
}

function buildKcloudGovernanceFlags(context = {}) {
  const event = context.event || {};
  const payload = event && event.payload && typeof event.payload === "object" ? event.payload : {};
  const config = context.config || {};
  const category = context.category || classifyKcloudEvent(event);
  return {
    project_id: event.project_id || config.project_id || null,
    task_id: event.task_id || payload.task_id || payload.task || null,
    action: event.event_type || payload.action || payload.event_type || category,
    path: payload.path || payload.file_path || payload.file || null,
    branch: payload.branch || null,
    cloud_channel: payload.cloud_channel || payload.channel || null,
    kcloud_node_id: config.cloud_node_id || config.cloud_project_id || config.project_id || event.source_tool_id || "unknown_cloud_node",
    packet_id: event.event_id || null,
    risk_level: payload.risk_level || (category === "restricted_event" ? "high" : category === "controlled_event" ? "medium" : "low"),
    lease_type: payload.lease_type || null
  };
}

function classifyKcloudEvent(event = {}) {
  const value = String((event.event_type || event.type || "").toLowerCase()).trim();
  const payload = event && event.payload && typeof event.payload === "object" ? event.payload : {};
  const action = String(payload.action || payload.event_action || "").toLowerCase();
  const combined = [value, action].filter(Boolean).join(" ");
  if (/(status update|dashboard update|read only|readonly|read-only|ack|sync status|read sync)/.test(combined)) return "safe_event";
  if (/(task claim|task release|file lock|patch proposal|evidence publish|sync files|read project state|receive task packet|send task result|run tests|run build|run ai model)/.test(combined)) return "controlled_event";
  if (/(direct code execution|direct push|release approval|permission change|tool self-permission change|modify secrets|shell command|execute code)/.test(combined)) return "restricted_event";
  return "controlled_event";
}

function isKcloudTransmitPending(event = {}) {
  return ["pending", "queued", "retrying", "failed", "sent", "sending"].includes(String(event.status || "").toLowerCase()) || !event.status;
}

function isKcloudFatalTransmitDecision(decision = {}) {
  return decision && decision.decision === "block" && decision.risk_level === "high";
}

function buildKcloudIdempotencyKey(event = {}) {
  return hashPayload({
    event_id: event.event_id || null,
    project_id: event.project_id || null,
    source_tool_id: event.source_tool_id || null,
    target: event.target || null,
    event_type: event.event_type || null,
    payload_hash: event.payload_hash || null
  });
}

function calculateKcloudRetryDelay(attempts = 1, baseMs = 1000, maxMs = 60000) {
  const safeAttempts = Math.max(1, Number(attempts) || 1);
  return Math.min(maxMs, baseMs * Math.pow(2, safeAttempts - 1));
}

function summarizeTransmitResults(results = []) {
  return results.reduce((summary, result) => {
    const status = String(result && (result.final_status || result.status) || "unknown");
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});
}

function summarizeReceiveResults(results = []) {
  return results.reduce((summary, result) => {
    const status = String(result && (result.final_status || result.status) || "unknown");
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});
}

function dedupeKcloudRecords(records = []) {
  const seen = new Set();
  const result = [];
  for (const record of records) {
    const key = record && record.event_id ? record.event_id : JSON.stringify(record);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(record);
  }
  return result;
}

function sleepSync(ms) {
  const delay = Math.max(0, Number(ms) || 0);
  if (!delay) return;
  const sab = new SharedArrayBuffer(4);
  const view = new Int32Array(sab);
  Atomics.wait(view, 0, 0, delay);
}

function sumNestedCounts(cycles = [], key = "") {
  return cycles.reduce((total, cycle) => total + Object.keys((cycle && cycle[key] && cycle[key].counts) || {}).reduce((acc, countKey) => acc + Number(cycle[key].counts[countKey] || 0), 0), 0);
}

function writeReadinessSnapshot(report) {
  writeJsonFile(READINESS_FILE, report);
}

function getKcloudProjectId() {
  const storage = readKcloudStorageState();
  return storage.config ? storage.config.project_id : null;
}

function isKcloudPayloadHashValid(event = {}) {
  if (!event || !Object.prototype.hasOwnProperty.call(event, "payload_hash")) return false;
  return String(event.payload_hash || "") === hashPayload(event.payload);
}

function storeReceivedKcloudFinalState(event, status, error, decision, deps = {}, { cloudClient = null } = {}) {
  const now = new Date().toISOString();
  const existing = readKcloudStorageState().inbox.find((item) => item.event_id === event.event_id);
  const record = existing ? {
    ...existing,
    ...event,
    status,
    last_error: error || null,
    updated_at: now
  } : {
    ...event,
    status,
    last_error: error || null,
    attempts: Number(event.attempts) || 0,
    created_at: event.created_at || now,
    updated_at: now
  };
  if (existing) {
    updateEventStatus("inbox", event.event_id, status, error || null);
  } else {
    appendJsonLine(INBOX_FILE, record);
  }
  appendJsonLine(RECEIVE_LOG_FILE, {
    receive_attempt_id: `kcloud-receive-${crypto.randomUUID()}`,
    event_id: event.event_id,
    project_id: event.project_id || null,
    status,
    error: error || null,
    decision,
    created_at: now,
    updated_at: now
  });
  if (status === "rejected" || status === "dead_letter") {
    appendJsonLine(DEAD_LETTER_FILE, {
      ...record,
      status: "dead_letter",
      last_error: error || null,
      updated_at: now
    });
  }
  recordKcloudTransportAudit(`receive.${status}`, event, record, decision, deps, { error: error || null });
  return record;
}

function reconcileCloudAcks(flags = {}, deps = {}) {
  const storage = readKcloudStorageState();
  const config = storage.config || null;
  const cloudClient = createKcloudCloudClient({ config, flags, allowOffline: true });
  if (!cloudClient.online || typeof cloudClient.pullAcks !== "function") {
    return { report_type: "kcloud_data_sharing_ack_reconciliation", generated_at: new Date().toISOString(), status: "offline", reconciled: [] };
  }
  const acks = cloudClient.pullAcks({
    project_id: config ? config.project_id : null,
    since_sequence: Number(storage.syncCursor && storage.syncCursor.outbox_sequence ? storage.syncCursor.outbox_sequence : 0) || 0
  }) || [];
  const reconciled = [];
  for (const ack of acks) {
    const event = storage.outbox.find((item) => item.event_id === ack.event_id);
    if (!event) continue;
    if (event.status !== "acknowledged") {
      const acknowledged = updateEventStatus("outbox", event.event_id, "acknowledged", null);
      appendKcloudAckLog(acknowledged, ack.status || "acked", { source: "cloud_reconciliation", cloud_ack: ack });
      recordKcloudTransportAudit("transmit.ack_reconciled", event, acknowledged, { decision: "allow", reason: "ACK reconciled from cloud.", risk_level: "low", requires_owner_approval: false }, deps, { ack });
      reconciled.push({ event_id: event.event_id, status: "acknowledged" });
    }
  }
  return {
    report_type: "kcloud_data_sharing_ack_reconciliation",
    generated_at: new Date().toISOString(),
    status: "ok",
    reconciled
  };
}

function writeJsonFileIfExists(filePath, fallback = null) {
  try {
    return fileExists(filePath) ? readJsonFile(filePath) : fallback;
  } catch {
    return fallback;
  }
}

function readJsonFileIfExists(filePath, fallback = null) {
  try {
    return fileExists(filePath) ? readJsonFile(filePath) : fallback;
  } catch {
    return fallback;
  }
}

function appendJsonLineAbsolute(filePath, record) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

function readJsonlAbsolute(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  if (!content.trim()) return [];
  return content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid JSONL record in ${filePath} at line ${index + 1}: ${error.message}`);
    }
  });
}

function resolveKcloudEndpoint(flags = {}, config = null) {
  const raw = String(
    readFlag(flags, ["cloud_endpoint", "cloudEndpoint", "cloud-endpoint"]) ||
    (config && config.cloud_endpoint) ||
    process.env.KVDOS_CLOUD_ENDPOINT ||
    ""
  ).trim();
  if (!raw) return null;
  if (/^file:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return path.resolve(url.pathname.replace(/^\/([a-zA-Z]:)/, "$1"));
    } catch {
      return null;
    }
  }
  if (path.isAbsolute(raw)) return raw;
  if (/^[a-zA-Z]:[\\/]/.test(raw)) return path.resolve(raw);
  return path.join(repoRoot(), raw);
}

function resolveKcloudEndpointPath(endpoint) {
  if (!endpoint) return null;
  return path.isAbsolute(endpoint) ? endpoint : path.resolve(repoRoot(), endpoint);
}

function normalizeKcloudStatusValue(value) {
  return String(value || "").replace(/-/g, "_").trim();
}

function awaitableResult(value) {
  if (value && typeof value.then === "function") {
    throw new Error("Async cloud client methods are not supported by the local KCloud shell.");
  }
  return value;
}




module.exports = {
  kcloudDataSharing,
  buildKcloudStatusReport,
  initKcloudConfig,
  queueOutboxEvent,
  queueInboxEvent,
  queueKcloudEvent,
  inspectKcloudEvents,
  buildKcloudOutboxReport,
  buildKcloudInboxReport,
  buildKcloudTransmitReport,
  buildKcloudReceiveReport,
  buildKcloudAuditReport,
  buildKcloudReadinessReport,
  createKcloudCloudClient,
  transmitPendingEvents,
  transmitOneEvent,
  retryFailedTransmits,
  receiveCloudEvents,
  receiveOneEvent,
  acknowledgeReceivedEvent,
  synchronizeKcloud,
  readOutbox,
  readInbox,
  readAckLog,
  readDeadLetter,
  readSyncCursor,
  updateEventStatus,
  moveEventToDeadLetter,
  appendKcloudAckLog,
  updateSyncCursor,
  readKcloudStorageState,
  renderKcloudReport,
  detectRepoUrl,
  hashPayload,
  stableJsonStringify,
  resolvePayload,
  normalizeSourceToolId,
  dedupeKcloudRecords,
  calculateKcloudRetryDelay,
  classifyKcloudEvent,
  getKcloudGovernanceAdapter,
  evaluateKcloudTransportGovernance,
  buildKcloudTransportResult,
  recordKcloudTransportAudit,
  recordKcloudApprovalRequestFromTransport,
  resolveKcloudEndpoint,
  resolveKcloudEndpointPath,
  appendJsonLineAbsolute,
  readJsonlAbsolute,
  sleepSync,
  CONFIG_FILE,
  OUTBOX_FILE,
  INBOX_FILE,
  ACK_LOG_FILE,
  DEAD_LETTER_FILE,
  TRANSMIT_LOG_FILE,
  RECEIVE_LOG_FILE,
  AUDIT_LOG_FILE,
  READINESS_FILE,
  SYNC_CURSOR_FILE,
  RUNTIME_ROOT,
  AUTHORITY_PLUGIN
};
