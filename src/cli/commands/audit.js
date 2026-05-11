const fs = require("fs");
const path = require("path");
const { ensureWorkspace } = require("../workspace");
const { repoRoot } = require("../fs_utils");
const { table } = require("../ui");

function audit(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  const outputLines = deps.outputLines || ((lines) => console.log(lines.join("\n")));
  const events = readAuditEvents();

  if (!action || action === "list") {
    const limit = flags.limit ? Number(flags.limit) : 20;
    const rows = events.slice(-limit).map((event) => [
      event.event_id || "",
      event.timestamp || "",
      event.event_type || "",
      event.entity_type || "",
      event.entity_id || ""
    ]);
    console.log(table(["Event", "Timestamp", "Type", "Entity", "ID"], rows));
    return;
  }

  if (action === "report") {
    const entityId = flags.task || flags.entity || value || null;
    const filtered = entityId ? events.filter((event) => event.entity_id === entityId || event.metadata && event.metadata.task_id === entityId) : events;
    const lines = buildAuditReport(filtered, entityId);
    return outputLines(lines, flags.output);
  }

  throw new Error(`Unknown audit action: ${action}`);
}

function readAuditEvents() {
  const file = path.join(repoRoot(), ".kabeeri", "audit_log.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function buildAuditReport(events, entityId) {
  const lines = [
    `# Kabeeri Audit Report${entityId ? ` - ${entityId}` : ""}`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Events: ${events.length}`,
    "",
    "## Event Timeline"
  ];
  if (events.length === 0) {
    lines.push("", "No audit events found.");
    return lines;
  }
  for (const event of events) {
    lines.push(
      "",
      `- ${event.timestamp || ""} ${event.event_type || ""}`,
      `  Entity: ${event.entity_type || ""}/${event.entity_id || ""}`,
      `  Actor: ${event.actor_id || ""} (${event.actor_role || ""})`,
      `  Summary: ${event.summary || ""}`
    );
  }
  return lines;
}

module.exports = {
  audit
};
