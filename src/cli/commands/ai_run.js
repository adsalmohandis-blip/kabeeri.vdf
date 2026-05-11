const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { calculateUsageCost, getPricingCurrency, getTaskSprint, summarizeUsage } = require("./usage_pricing");

function aiRun(action, value, flags = {}, deps = {}) {
  const {
    appendAudit = () => {},
    getTaskById = () => null,
    getTaskWorkstreamsById = () => [],
    getEffectiveActor = () => "local-cli",
    requireAnyRole = () => {},
    parseCsv = () => [],
    outputLines = defaultOutputLines
  } = deps;
  ensureWorkspace();
  ensureDecisionHistoryState();

  if (!action || action === "list") {
    const runs = readAiRuns();
    const rows = runs.map((item) => [
      item.run_id,
      item.status || "recorded",
      item.task_id || "",
      item.developer_id || item.agent_id || "",
      `${item.provider || ""}/${item.model || ""}`,
      item.total_tokens || 0
    ]);
    console.log(table(["Run", "Status", "Task", "Developer", "Model", "Tokens"], rows));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    const item = readAiRuns().find((run) => run.run_id === id);
    if (!item) throw new Error(`AI run not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "record") {
    const taskId = flags.task || value || null;
    if (taskId && !getTaskById(taskId)) throw new Error(`Task not found: ${taskId}`);
    const developerId = flags.developer || flags.agent || flags.actor || "local-ai";
    const relatedAdrs = parseCsv(flags.adrs || flags.adr);
    assertKnownAdrs(relatedAdrs);
    const inputTokens = Number(flags["input-tokens"] || 0);
    const outputTokens = Number(flags["output-tokens"] || 0);
    const cachedTokens = Number(flags["cached-tokens"] || 0);
    const calculated = calculateUsageCost({
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      inputTokens,
      outputTokens,
      cachedTokens
    });
    const run = {
      run_id: flags.id || `ai-run-${String(readAiRuns().length + 1).padStart(3, "0")}`,
      task_id: taskId,
      sprint_id: flags.sprint || getTaskSprint(taskId),
      developer_id: developerId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      prompt_id: flags.prompt || flags["prompt-id"] || null,
      source_reference: flags.source || "manual",
      workstream: flags.workstream || (taskId ? getTaskWorkstreamsById(taskId)[0] || "untracked" : "untracked"),
      files_changed: parseCsv(flags.files),
      related_adrs: relatedAdrs,
      summary: flags.summary || flags.result || "",
      result: flags.result || "recorded",
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cached_tokens: cachedTokens,
      total_tokens: inputTokens + outputTokens + cachedTokens,
      cost: flags.cost !== undefined ? Number(flags.cost || 0) : calculated.cost,
      currency: flags.currency || getPricingCurrency(),
      cost_source: flags.cost !== undefined ? "manual" : calculated.source,
      status: "recorded",
      started_at: flags.started || new Date().toISOString(),
      ended_at: flags.ended || new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    if (readAiRuns().some((item) => item.run_id === run.run_id)) throw new Error(`AI run already exists: ${run.run_id}`);
    appendJsonLine(".kabeeri/ai_runs/prompt_runs.jsonl", run);
    if (relatedAdrs.length) linkAiRunToAdrs(run.run_id, relatedAdrs);
    if (run.total_tokens > 0 && flags["record-usage"] !== "false" && flags.usage !== "false") {
      appendJsonLine(".kabeeri/ai_usage/usage_events.jsonl", {
        event_id: `usage-${Date.now()}`,
        timestamp: run.ended_at,
        run_id: run.run_id,
        task_id: run.task_id || "untracked",
        sprint_id: run.sprint_id,
        developer_id: run.developer_id,
        workstream: run.workstream,
        provider: run.provider,
        model: run.model,
        input_tokens: run.input_tokens,
        output_tokens: run.output_tokens,
        cached_tokens: run.cached_tokens,
        total_tokens: run.total_tokens,
        cost: run.cost,
        currency: run.currency,
        cost_source: run.cost_source,
        source: "ai_run_history",
        tracked: Boolean(run.task_id)
      });
      writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summarizeUsage());
    }
    appendAudit("ai_run.recorded", "ai_run", run.run_id, `AI run recorded for ${run.task_id || "untracked"}`);
    console.log(JSON.stringify(run, null, 2));
    return;
  }

  if (action === "link") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing AI run id.");
    const adrIds = parseCsv(flags.adrs || flags.adr);
    if (!adrIds.length) throw new Error("Missing --adr.");
    assertKnownAdrs(adrIds);
    const runs = readAiRuns();
    const item = runs.find((run) => run.run_id === id);
    if (!item) throw new Error(`AI run not found: ${id}`);
    item.related_adrs = uniqueList([...(item.related_adrs || []), ...adrIds]);
    item.updated_at = new Date().toISOString();
    writeAiRuns(runs);
    linkAiRunToAdrs(id, adrIds);
    appendAudit("ai_run.linked_to_adr", "ai_run", id, `AI run linked to ADR(s): ${adrIds.join(", ")}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "accept" || action === "reject") {
    const id = flags.id || value;
    const runs = readAiRuns();
    const item = runs.find((run) => run.run_id === id);
    if (!item) throw new Error(`AI run not found: ${id}`);
    if (action === "accept") {
      requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "accept AI run");
      item.status = "accepted";
      item.accepted_by = flags.reviewer || flags.actor || getEffectiveActor(flags) || "local-cli";
      item.acceptance_evidence = parseCsv(flags.evidence);
      item.review_notes = flags.notes || "";
      item.reviewed_at = new Date().toISOString();
      appendJsonLine(".kabeeri/ai_runs/accepted_runs.jsonl", buildAiRunReviewRecord(item, "accepted"));
    } else {
      requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "reject AI run");
      if (!flags.reason) throw new Error("Missing --reason.");
      item.status = "rejected";
      item.rejected_by = flags.reviewer || flags.actor || getEffectiveActor(flags) || "local-cli";
      item.rejection_reason = flags.reason;
      item.partially_reused = flags.reused === true || flags.reused === "true";
      item.reviewed_at = new Date().toISOString();
      appendJsonLine(".kabeeri/ai_runs/rejected_runs.jsonl", buildAiRunReviewRecord(item, "rejected"));
    }
    writeAiRuns(runs);
    appendAudit(`ai_run.${action}ed`, "ai_run", item.run_id, `AI run ${action}ed`);
    console.log(`AI run ${item.run_id} is now ${item.status}`);
    return;
  }

  if (action === "report" || action === "waste") {
    const report = buildAiRunHistoryReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else return outputLines(buildAiRunReportMarkdown(report), flags.output);
    return;
  }

  throw new Error(`Unknown AI run action: ${action}`);
}

function ensureDecisionHistoryState() {
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "adr"), { recursive: true });
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "ai_runs"), { recursive: true });
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "memory"), { recursive: true });
  if (!fileExists(".kabeeri/adr/records.json")) writeJsonFile(".kabeeri/adr/records.json", { adrs: [] });
  for (const file of [
    ".kabeeri/ai_runs/prompt_runs.jsonl",
    ".kabeeri/ai_runs/accepted_runs.jsonl",
    ".kabeeri/ai_runs/rejected_runs.jsonl",
    ".kabeeri/memory/decisions.jsonl"
  ]) {
    const fullPath = path.join(repoRoot(), file);
    if (!fs.existsSync(fullPath)) fs.writeFileSync(fullPath, "", "utf8");
  }
}

function assertKnownAdrs(adrIds) {
  if (!adrIds || adrIds.length === 0) return;
  const records = readStateArray(".kabeeri/adr/records.json", "adrs");
  const known = new Set(records.map((item) => item.adr_id));
  for (const adrId of adrIds) {
    if (!known.has(adrId)) throw new Error(`ADR not found: ${adrId}`);
  }
}

function linkAiRunToAdrs(runId, adrIds) {
  const file = ".kabeeri/adr/records.json";
  const data = readJsonFile(file);
  data.adrs = data.adrs || [];
  let changed = false;
  for (const adrId of adrIds) {
    const item = findAdr(data.adrs, adrId);
    if (!item) throw new Error(`ADR not found: ${adrId}`);
    item.related_ai_runs = uniqueList([...(item.related_ai_runs || []), runId]);
    item.updated_at = new Date().toISOString();
    changed = true;
  }
  if (changed) writeJsonFile(file, data);
}

function findAdr(records, id) {
  if (!id) return null;
  return records.find((item) => item.adr_id === id);
}

function normalizeAdrStatus(value) {
  const status = String(value || "proposed").toLowerCase();
  if (!["proposed", "approved", "superseded", "rejected"].includes(status)) {
    throw new Error("Invalid ADR status. Use proposed, approved, superseded, or rejected.");
  }
  return status;
}

function inferAdrImpact(flags) {
  const text = `${flags.title || ""} ${flags.context || ""} ${flags.decision || ""}`.toLowerCase();
  if (/security|auth|migration|database|release|deploy|architecture|payment/.test(text)) return "high";
  return "medium";
}

function markAdrSuperseded(records, id, byId) {
  const item = findAdr(records, id);
  if (!item) throw new Error(`Superseded ADR not found: ${id}`);
  item.status = "superseded";
  item.superseded_by = byId;
  item.superseded_at = new Date().toISOString();
}

function assertKnownTasks(taskIds, deps = {}) {
  const { getTaskById = () => null } = deps;
  for (const taskId of taskIds || []) {
    if (!getTaskById(taskId)) throw new Error(`Task not found: ${taskId}`);
  }
}

function assertKnownAiRuns(runIds) {
  if (!runIds || runIds.length === 0) return;
  const known = new Set(readAiRuns().map((item) => item.run_id));
  for (const runId of runIds) {
    if (!known.has(runId)) throw new Error(`AI run not found: ${runId}`);
  }
}

function readAiRuns() {
  return readJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl");
}

function writeAiRuns(runs) {
  writeJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl", runs);
}

function buildAiRunReviewRecord(item, decision) {
  return {
    review_id: `${decision}-${item.run_id}-${Date.now()}`,
    run_id: item.run_id,
    task_id: item.task_id || null,
    decision,
    reviewer_id: item.accepted_by || item.rejected_by || "local-cli",
    reason: item.rejection_reason || null,
    evidence: item.acceptance_evidence || [],
    partially_reused: Boolean(item.partially_reused),
    reviewed_at: item.reviewed_at || new Date().toISOString()
  };
}

function buildAiRunHistoryReport() {
  const runs = readAiRuns();
  const accepted = runs.filter((item) => item.status === "accepted");
  const rejected = runs.filter((item) => item.status === "rejected");
  const unreviewed = runs.filter((item) => !["accepted", "rejected"].includes(item.status));
  const missingTask = runs.filter((item) => !item.task_id || item.task_id === "untracked");
  const missingTokenData = runs.filter((item) => Number(item.total_tokens || 0) === 0);
  const rejectedCost = rejected.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const unreviewedCost = unreviewed.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const wasteSignals = [];
  if (unreviewed.length) wasteSignals.push({ severity: "warning", signal: "unreviewed_runs", count: unreviewed.length, next_action: "Accept or reject AI runs after review." });
  if (missingTask.length) wasteSignals.push({ severity: "warning", signal: "missing_task_links", count: missingTask.length, next_action: "Link runs to governed tasks or mark them untracked intentionally." });
  if (missingTokenData.length) wasteSignals.push({ severity: "info", signal: "missing_token_data", count: missingTokenData.length, next_action: "Record token and cost data for pricing and efficiency reports." });
  if (rejectedCost > 0) wasteSignals.push({ severity: "warning", signal: "rejected_output_cost", count: rejected.length, cost: rejectedCost, next_action: "Review rejected outputs and improve prompts or context packs." });
  return {
    generated_at: new Date().toISOString(),
    totals: {
      runs: runs.length,
      accepted: accepted.length,
      rejected: rejected.length,
      unreviewed: unreviewed.length,
      acceptance_rate: runs.length ? Number((accepted.length / runs.length).toFixed(3)) : 0,
      total_tokens: runs.reduce((sum, item) => sum + Number(item.total_tokens || 0), 0),
      total_cost: runs.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      accepted_cost: accepted.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      rejected_cost: rejectedCost,
      unreviewed_cost: unreviewedCost
    },
    by_task: summarizeAiRunsBy(runs, "task_id"),
    by_developer: summarizeAiRunsBy(runs, "developer_id"),
    by_adr: summarizeAiRunsByMultiValue(runs, "related_adrs", "unlinked"),
    waste_signals: wasteSignals,
    unreviewed_run_ids: unreviewed.map((item) => item.run_id)
  };
}

function summarizeAiRunsBy(runs, key) {
  const output = {};
  for (const item of runs) {
    const id = item[key] || "untracked";
    output[id] = output[id] || { runs: 0, accepted: 0, rejected: 0, unreviewed: 0, tokens: 0, cost: 0 };
    output[id].runs += 1;
    output[id].tokens += Number(item.total_tokens || 0);
    output[id].cost += Number(item.cost || 0);
    if (item.status === "accepted") output[id].accepted += 1;
    else if (item.status === "rejected") output[id].rejected += 1;
    else output[id].unreviewed += 1;
  }
  return output;
}

function summarizeAiRunsByMultiValue(runs, key, fallback) {
  const output = {};
  for (const item of runs) {
    const values = (item[key] || []).length ? item[key] : [fallback];
    for (const value of values) {
      output[value] = output[value] || { runs: 0, accepted: 0, rejected: 0, unreviewed: 0, tokens: 0, cost: 0 };
      output[value].runs += 1;
      output[value].tokens += Number(item.total_tokens || 0);
      output[value].cost += Number(item.cost || 0);
      if (item.status === "accepted") output[value].accepted += 1;
      else if (item.status === "rejected") output[value].rejected += 1;
      else output[value].unreviewed += 1;
    }
  }
  return output;
}

function buildAiRunReportMarkdown(report) {
  return [
    "# Kabeeri AI Run History Report",
    "",
    `Generated at: ${report.generated_at}`,
    `Runs: ${report.totals.runs}`,
    `Accepted: ${report.totals.accepted}`,
    `Rejected: ${report.totals.rejected}`,
    `Unreviewed: ${report.totals.unreviewed}`,
    `Acceptance rate: ${report.totals.acceptance_rate}`,
    `Total tokens: ${report.totals.total_tokens}`,
    `Total cost: ${report.totals.total_cost}`,
    "",
    "## Waste Signals",
    "",
    "| Severity | Signal | Count | Next Action |",
    "| --- | --- | ---: | --- |",
    ...(report.waste_signals.length ? report.waste_signals.map((item) => `| ${item.severity} | ${item.signal} | ${item.count || 0} | ${item.next_action} |`) : ["| info | none | 0 | Continue normal review. |"]),
    "",
    "## By Task",
    ...aiRunSummaryRows(report.by_task, "Task"),
    "",
    "## By Developer",
    ...aiRunSummaryRows(report.by_developer, "Developer"),
    "",
    "## By ADR",
    ...aiRunSummaryRows(report.by_adr, "ADR")
  ];
}

function aiRunSummaryRows(buckets, label) {
  const rows = [`| ${label} | Runs | Accepted | Rejected | Unreviewed | Tokens | Cost |`, "| --- | ---: | ---: | ---: | ---: | ---: | ---: |"];
  for (const [key, item] of Object.entries(buckets || {})) {
    rows.push(`| ${key} | ${item.runs || 0} | ${item.accepted || 0} | ${item.rejected || 0} | ${item.unreviewed || 0} | ${item.tokens || 0} | ${item.cost || 0} |`);
  }
  if (rows.length === 2) rows.push(`| none | 0 | 0 | 0 | 0 | 0 | 0 |`);
  return rows;
}

function assertKnownAdrs(adrIds) {
  if (!adrIds || adrIds.length === 0) return;
  const records = readStateArray(".kabeeri/adr/records.json", "adrs");
  const known = new Set(records.map((item) => item.adr_id));
  for (const adrId of adrIds) {
    if (!known.has(adrId)) throw new Error(`ADR not found: ${adrId}`);
  }
}

function linkAdrsToAiRuns(adrId, runIds) {
  if (!runIds || !runIds.length) return;
  const runs = readAiRuns();
  let changed = false;
  for (const runId of runIds) {
    const item = runs.find((run) => run.run_id === runId);
    if (!item) throw new Error(`AI run not found: ${runId}`);
    item.related_adrs = uniqueList([...(item.related_adrs || []), adrId]);
    item.updated_at = new Date().toISOString();
    changed = true;
  }
  if (changed) writeAiRuns(runs);
}

function buildAdrReport(records) {
  const byStatus = summarizeBy(records, "status");
  const highImpactOpen = records.filter((item) => ["critical", "high"].includes(item.impact) && item.status === "proposed");
  return [
    "# Kabeeri ADR Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Total ADRs: ${records.length}`,
    "",
    "## Status",
    ...Object.entries(byStatus).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Open High-impact Decisions",
    ...(highImpactOpen.length ? highImpactOpen.map((item) => `- ${item.adr_id}: ${item.title}`) : ["- none"]),
    "",
    "## ADR Index",
    "",
    "| ADR | Status | Impact | Title | Tasks |",
    "| --- | --- | --- | --- | --- |",
    ...(records.length ? records.map((item) => `| ${item.adr_id} | ${item.status} | ${item.impact || ""} | ${item.title} | ${(item.related_tasks || []).join(",")} |`) : ["| none |  |  |  |  |"])
  ];
}

function summarizeBy(records, key) {
  const output = {};
  for (const item of records || []) {
    const value = item[key] || "untracked";
    output[value] = (output[value] || 0) + 1;
  }
  return output;
}

function readStateArray(file, key) {
  if (!fileExists(file)) return [];
  const data = readJsonFile(file);
  return data[key] || [];
}

function uniqueList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function parseCsv(value) {
  if (Array.isArray(value)) return uniqueList(value.flatMap((item) => parseCsv(item)));
  if (value === undefined || value === null) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function appendJsonLine(file, value) {
  const fullPath = path.join(repoRoot(), file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.appendFileSync(fullPath, `${JSON.stringify(value)}\n`, "utf8");
}

function writeJsonLines(file, rows) {
  const fullPath = path.join(repoRoot(), file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${(rows || []).map((row) => JSON.stringify(row)).join("\n")}${(rows || []).length ? "\n" : ""}`, "utf8");
}

function readJsonLines(file) {
  const fullPath = path.join(repoRoot(), file);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readFileSync(fullPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function defaultOutputLines(lines, outputPath) {
  const content = `${lines.join("\n")}\n`;
  if (outputPath && outputPath !== true) {
    writeTextFile(outputPath, content);
    console.log(`Wrote ${outputPath}`);
    return;
  }
  console.log(content.trimEnd());
}

module.exports = {
  aiRun,
  ensureDecisionHistoryState,
  readAiRuns,
  writeAiRuns,
  buildAiRunReviewRecord,
  buildAiRunHistoryReport,
  buildAiRunReportMarkdown,
  aiRunSummaryRows,
  findAdr,
  normalizeAdrStatus,
  inferAdrImpact,
  markAdrSuperseded,
  assertKnownTasks,
  assertKnownAiRuns,
  assertKnownAdrs,
  linkAdrsToAiRuns,
  buildAdrReport
};
