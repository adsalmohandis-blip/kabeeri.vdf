const fs = require("fs");
const path = require("path");

const { ensureWorkspace, writeJsonFile } = require("../workspace");
const { table } = require("../ui");
const { appendJsonLine, readJsonLines } = require("../services/jsonl");

function memory(action, value, flags = {}, deps = {}) {
  const appendAudit = deps.appendAudit || (() => {});
  const getEffectiveActor = deps.getEffectiveActor || (() => "local-cli");
  ensureWorkspace();
  if (!action || action === "summary") {
    const summary = buildMemorySummary();
    writeJsonFile(".kabeeri/memory/memory_summary.json", summary);
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (action === "list") {
    const type = normalizeMemoryType(flags.type || value || "decision");
    const rows = readJsonLines(memoryFileForType(type)).map((item) => [
      item.memory_id,
      item.type,
      item.status,
      item.text
    ]);
    console.log(table(["ID", "Type", "Status", "Text"], rows));
    return;
  }

  if (action === "add") {
    const type = normalizeMemoryType(flags.type || value || "decision");
    if (!flags.text) throw new Error("Missing --text.");
    const existing = readJsonLines(memoryFileForType(type));
    const record = {
      memory_id: `${type}-${String(existing.length + 1).padStart(3, "0")}`,
      type,
      text: flags.text,
      source: flags.source || "manual",
      status: flags.status || "active",
      owner: getEffectiveActor(flags) || "local-cli",
      review_date: flags.review || null,
      created_at: new Date().toISOString()
    };
    appendJsonLine(memoryFileForType(type), record);
    writeJsonFile(".kabeeri/memory/memory_summary.json", buildMemorySummary());
    appendAudit("memory.added", "memory", record.memory_id, `Memory added: ${type}`);
    console.log(`Added memory ${record.memory_id}`);
    return;
  }

  throw new Error(`Unknown memory action: ${action}`);
}

function normalizeMemoryType(type) {
  const normalized = String(type || "").toLowerCase().replace(/-/g, "_");
  const aliases = {
    decision: "decisions",
    assumption: "assumptions",
    constraint: "constraints",
    risk: "risks",
    deferred: "deferred_features",
    deferred_feature: "deferred_features"
  };
  const value = aliases[normalized] || normalized;
  if (!["decisions", "assumptions", "constraints", "risks", "deferred_features"].includes(value)) {
    throw new Error("Invalid memory type. Use decision, assumption, constraint, risk, or deferred_feature.");
  }
  return value;
}

function memoryFileForType(type) {
  return `.kabeeri/memory/${normalizeMemoryType(type)}.jsonl`;
}

function buildMemorySummary() {
  const types = ["decisions", "assumptions", "constraints", "risks", "deferred_features"];
  const summary = { generated_at: new Date().toISOString(), totals: {}, open_items: [] };
  for (const type of types) {
    const records = readJsonLines(memoryFileForType(type));
    summary.totals[type] = records.length;
    summary.open_items.push(...records.filter((item) => !["closed", "rejected", "resolved"].includes(item.status)).map((item) => ({
      memory_id: item.memory_id,
      type: item.type,
      status: item.status,
      text: item.text
    })));
  }
  return summary;
}

module.exports = {
  memory,
  buildMemorySummary
};
