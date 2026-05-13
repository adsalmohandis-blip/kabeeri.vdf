const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { uniqueList } = require("../services/collections");
const { appendJsonLine, readJsonLines, writeJsonLines } = require("../services/jsonl");
const { readStateArray } = require("../services/state_utils");
const { calculateUsageCost, getPricingCurrency, getTaskSprint, summarizeUsage } = require("./usage_pricing");

const AI_RUNS_FILE = ".kabeeri/ai_runs/prompt_runs.jsonl";
const CAPTURES_FILE = ".kabeeri/interactions/post_work_captures.json";
const USAGE_EVENTS_FILE = ".kabeeri/ai_usage/usage_events.jsonl";
const AUDIT_LOG_FILE = ".kabeeri/audit_log.jsonl";

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
    const captureIds = uniqueList(parseCsv(flags.captures || flags.capture));
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
      capture_ids: captureIds,
      summary: flags.summary || flags.result || "",
      result: flags.result || "recorded",
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cached_tokens: cachedTokens,
      total_tokens: inputTokens + outputTokens + cachedTokens,
      cost: flags.cost !== undefined ? Number(flags.cost || 0) : calculated.cost,
      currency: flags.currency || getPricingCurrency(),
      cost_source: flags.cost !== undefined ? "manual" : calculated.source,
      provenance: buildAiRunProvenance({
        task_id: taskId,
        capture_ids: captureIds,
        related_adrs: relatedAdrs,
        source_reference: flags.source || "manual",
        workstream: flags.workstream || (taskId ? getTaskWorkstreamsById(taskId)[0] || "untracked" : "untracked")
      }),
      status: "recorded",
      started_at: flags.started || new Date().toISOString(),
      ended_at: flags.ended || new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    if (readAiRuns().some((item) => item.run_id === run.run_id)) throw new Error(`AI run already exists: ${run.run_id}`);
    appendJsonLine(AI_RUNS_FILE, run);
    if (relatedAdrs.length) linkAiRunToAdrs(run.run_id, relatedAdrs);
    if (captureIds.length) linkCapturesToAiRun(run.run_id, captureIds);
    if (run.total_tokens > 0 && flags["record-usage"] !== "false" && flags.usage !== "false") {
      appendJsonLine(USAGE_EVENTS_FILE, {
        event_id: `usage-${Date.now()}`,
        timestamp: run.ended_at,
        ai_run_id: run.run_id,
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
        tracked: Boolean(run.task_id),
        capture_ids: captureIds,
        provenance: run.provenance
      });
      writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summarizeUsage());
    }
    appendAudit("ai_run.recorded", "ai_run", run.run_id, `AI run recorded for ${run.task_id || "untracked"}`, {
      task_id: run.task_id || null,
      capture_ids: captureIds,
      related_adrs: relatedAdrs,
      source_reference: run.source_reference
    });
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
    appendAudit(`ai_run.${action}ed`, "ai_run", item.run_id, `AI run ${action}ed`, {
      run_id: item.run_id,
      task_id: item.task_id || null,
      capture_ids: item.capture_ids || [],
      decision: action
    });
    console.log(`AI run ${item.run_id} is now ${item.status}`);
    return;
  }

  if (action === "report" || action === "waste") {
    const report = buildAiRunHistoryReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else return outputLines(buildAiRunReportMarkdown(report), flags.output);
    return;
  }

  if (action === "provenance") {
    const report = buildAiRunProvenanceReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else return outputLines(buildAiRunProvenanceMarkdown(report), flags.output);
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
    AI_RUNS_FILE,
    ".kabeeri/ai_runs/accepted_runs.jsonl",
    ".kabeeri/ai_runs/rejected_runs.jsonl",
    ".kabeeri/memory/decisions.jsonl",
    CAPTURES_FILE,
    USAGE_EVENTS_FILE,
    AUDIT_LOG_FILE
  ]) {
    const fullPath = path.join(repoRoot(), file);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      if (file === CAPTURES_FILE) writeJsonFile(CAPTURES_FILE, { captures: [] });
      else fs.writeFileSync(fullPath, "", "utf8");
    }
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
  return readJsonLines(AI_RUNS_FILE);
}

function writeAiRuns(runs) {
  writeJsonLines(AI_RUNS_FILE, runs);
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

function buildAiRunProvenanceReport() {
  const runs = readAiRuns();
  const captures = readCaptureRecords();
  const usageEvents = readJsonLines(USAGE_EVENTS_FILE);
  const auditEvents = readJsonLines(AUDIT_LOG_FILE);
  const chains = runs.map((run) => buildAiRunProvenanceChain(run, captures, usageEvents, auditEvents));
  const linkedRuns = chains.filter((chain) => chain.capture_ids.length > 0 && chain.audit_event_ids.length > 0);
  const missingEvidence = chains.filter((chain) => chain.capture_ids.length === 0 || chain.audit_event_ids.length === 0);
  return {
    report_type: "ai_run_provenance_report",
    generated_at: new Date().toISOString(),
    summary: {
      runs: runs.length,
      captures: captures.length,
      usage_events: usageEvents.length,
      audit_events: auditEvents.length,
      linked_runs: linkedRuns.length,
      missing_evidence_chains: missingEvidence.length
    },
    chains,
    missing_evidence: missingEvidence.map((item) => ({
      run_id: item.run_id,
      task_id: item.task_id || null,
      missing_capture_link: item.capture_ids.length === 0,
      missing_audit_link: item.audit_event_ids.length === 0,
      next_action: item.capture_ids.length === 0
        ? `Link a capture to ${item.run_id}`
        : `Add audit metadata for ${item.run_id}`
    }))
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

function buildAiRunProvenanceMarkdown(report) {
  return [
    "# Kabeeri AI Run Provenance Report",
    "",
    `Generated at: ${report.generated_at}`,
    `Runs: ${report.summary.runs}`,
    `Captures: ${report.summary.captures}`,
    `Usage events: ${report.summary.usage_events}`,
    `Audit events: ${report.summary.audit_events}`,
    `Linked chains: ${report.summary.linked_runs}`,
    `Missing evidence chains: ${report.summary.missing_evidence_chains}`,
    "",
    "## Provenance Chains",
    "",
    "| Run | Task | Captures | Usage events | Audit events | Status |",
    "| --- | --- | ---: | ---: | ---: | --- |",
    ...(report.chains.length ? report.chains.map((item) => `| ${item.run_id} | ${item.task_id || "untracked"} | ${item.capture_ids.length} | ${item.usage_event_ids.length} | ${item.audit_event_ids.length} | ${item.provenance_status} |`) : ["| none |  | 0 | 0 | 0 | missing |"]),
    "",
    "## Missing Evidence",
    ...(report.missing_evidence.length ? report.missing_evidence.map((item) => `- ${item.run_id}: ${item.next_action}`) : ["- None."])
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

function buildAiRunProvenance(run) {
  return {
    source_reference: run.source_reference || "manual",
    task_id: run.task_id || null,
    capture_ids: Array.isArray(run.capture_ids) ? uniqueList(run.capture_ids) : [],
    related_adrs: Array.isArray(run.related_adrs) ? uniqueList(run.related_adrs) : [],
    workstream: run.workstream || "untracked"
  };
}

function readCaptureRecords() {
  try {
    const data = readJsonFile(CAPTURES_FILE);
    return Array.isArray(data.captures) ? data.captures : [];
  } catch (error) {
    return [];
  }
}

function linkCapturesToAiRun(runId, captureIds) {
  if (!captureIds || captureIds.length === 0) return;
  const data = readJsonFile(CAPTURES_FILE);
  data.captures = data.captures || [];
  let changed = false;
  for (const captureId of captureIds) {
    const capture = data.captures.find((item) => item.capture_id === captureId);
    if (!capture) continue;
    capture.ai_run_id = runId;
    capture.source_ai_run_ids = uniqueList([...(capture.source_ai_run_ids || []), runId]);
    capture.provenance = {
      ...(capture.provenance || {}),
      ai_run_ids: uniqueList([...(capture.provenance && capture.provenance.ai_run_ids ? capture.provenance.ai_run_ids : []), runId]),
      task_id: capture.task_id || null
    };
    capture.updated_at = new Date().toISOString();
    changed = true;
  }
  if (changed) writeJsonFile(CAPTURES_FILE, data);
}

function buildAiRunProvenanceChain(run, captures, usageEvents, auditEvents) {
  const linkedCaptureIds = uniqueList([
    ...(Array.isArray(run.capture_ids) ? run.capture_ids : []),
    ...captures.filter((capture) => capture.ai_run_id === run.run_id || (Array.isArray(capture.source_ai_run_ids) && capture.source_ai_run_ids.includes(run.run_id))).map((capture) => capture.capture_id)
  ]);
  const runUsageEvents = usageEvents.filter((item) => item.ai_run_id === run.run_id || item.run_id === run.run_id);
  const auditEventIds = auditEvents
    .filter((event) => event.entity_id === run.run_id
      || (event.metadata && (
        event.metadata.run_id === run.run_id
        || event.metadata.ai_run_id === run.run_id
        || (Array.isArray(event.metadata.capture_ids) && event.metadata.capture_ids.some((captureId) => linkedCaptureIds.includes(captureId)))
        || (event.metadata.capture_id && linkedCaptureIds.includes(event.metadata.capture_id))
      )))
    .map((event) => event.event_id);
  const provenanceStatus = linkedCaptureIds.length && auditEventIds.length ? "linked" : linkedCaptureIds.length ? "capture_linked" : "missing";
  return {
    run_id: run.run_id,
    task_id: run.task_id || null,
    capture_ids: linkedCaptureIds,
    usage_event_ids: runUsageEvents.map((item) => item.event_id || null).filter(Boolean),
    audit_event_ids: auditEventIds,
    provenance_status: provenanceStatus,
    source_reference: run.source_reference || "manual",
    workstream: run.workstream || "untracked",
    cost: Number(run.cost || 0),
    total_tokens: Number(run.total_tokens || 0)
  };
}

function parseCsv(value) {
  if (Array.isArray(value)) return uniqueList(value.flatMap((item) => parseCsv(item)));
  if (value === undefined || value === null) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  buildAiRunProvenanceReport,
  buildAiRunProvenanceMarkdown,
  buildAiRunProvenance,
  aiRunSummaryRows,
  findAdr,
  normalizeAdrStatus,
  inferAdrImpact,
  markAdrSuperseded,
  assertKnownTasks,
  assertKnownAiRuns,
  assertKnownAdrs,
  linkAdrsToAiRuns,
  linkCapturesToAiRun,
  buildAdrReport
};
