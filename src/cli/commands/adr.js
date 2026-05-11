const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");

function adr(action, value, flags = {}, deps = {}) {
  const {
    ensureDecisionHistoryState,
    findAdr,
    requireAnyRole,
    normalizeAdrStatus,
    parseCsv,
    assertKnownTasks,
    assertKnownAiRuns,
    getEffectiveActor,
    inferAdrImpact,
    markAdrSuperseded,
    linkAdrsToAiRuns,
    appendJsonLine,
    readJsonLines,
    buildMemorySummary,
    appendAudit,
    outputLines,
    buildAdrReport,
    buildAdrAiRunTraceReport,
    readAiRuns,
    buildAdrAiRunTraceMarkdown
  } = deps;
  ensureWorkspace();
  ensureDecisionHistoryState();
  const file = ".kabeeri/adr/records.json";
  const data = readJsonFile(file);
  data.adrs = data.adrs || [];

  if (!action || action === "list") {
    const rows = data.adrs.map((item) => [
      item.adr_id,
      item.status,
      item.title,
      (item.related_tasks || []).join(","),
      item.owner || ""
    ]);
    console.log(table(["ADR", "Status", "Title", "Tasks", "Owner"], rows));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    const item = findAdr(data.adrs, id);
    if (!item) throw new Error(`ADR not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create ADR");
    if (!flags.title) throw new Error("Missing --title.");
    if (!flags.context) throw new Error("Missing --context.");
    if (!flags.decision) throw new Error("Missing --decision.");
    const status = normalizeAdrStatus(flags.status || "proposed");
    const taskIds = parseCsv(flags.tasks || flags.task);
    assertKnownTasks(taskIds);
    const aiRunIds = parseCsv(flags["ai-runs"] || flags["ai-run"]);
    assertKnownAiRuns(aiRunIds);
    const id = flags.id || `adr-${String(data.adrs.length + 1).padStart(3, "0")}`;
    if (data.adrs.some((item) => item.adr_id === id)) throw new Error(`ADR already exists: ${id}`);
    const record = {
      adr_id: id,
      title: flags.title,
      status,
      date: flags.date || new Date().toISOString().slice(0, 10),
      owner: flags.owner || getEffectiveActor(flags) || "local-cli",
      context: flags.context,
      options: parseCsv(flags.options),
      decision: flags.decision,
      why: flags.why || "",
      risks: parseCsv(flags.risks || flags.risk),
      consequences: parseCsv(flags.consequences),
      impact: flags.impact || inferAdrImpact(flags),
      related_tasks: taskIds,
      related_ai_runs: aiRunIds,
      related_policies: parseCsv(flags.policies || flags.policy),
      supersedes: flags.supersedes || null,
      approved_by: status === "approved" ? (flags.approvedBy || flags["approved-by"] || flags.owner || getEffectiveActor(flags) || "local-cli") : null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };
    data.adrs.push(record);
    if (record.supersedes) markAdrSuperseded(data.adrs, record.supersedes, record.adr_id);
    writeJsonFile(file, data);
    if (aiRunIds.length) linkAdrsToAiRuns(record.adr_id, aiRunIds);
    appendJsonLine(".kabeeri/memory/decisions.jsonl", {
      memory_id: `decision-${String(readJsonLines(".kabeeri/memory/decisions.jsonl").length + 1).padStart(3, "0")}`,
      type: "decisions",
      text: `${record.title}: ${record.decision}`,
      source: `adr:${record.adr_id}`,
      status: record.status,
      owner: record.owner,
      links: [record.adr_id, ...record.related_tasks],
      created_at: record.created_at
    });
    writeJsonFile(".kabeeri/memory/memory_summary.json", buildMemorySummary());
    appendAudit("adr.created", "adr", record.adr_id, `ADR created: ${record.title}`);
    console.log(JSON.stringify(record, null, 2));
    return;
  }

  if (["approve", "reject", "supersede"].includes(action)) {
    const id = flags.id || value;
    const item = findAdr(data.adrs, id);
    if (!item) throw new Error(`ADR not found: ${id}`);
    if (action === "approve") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "approve ADR");
      item.status = "approved";
      item.approved_by = flags.owner || getEffectiveActor(flags) || "local-cli";
      item.approved_at = new Date().toISOString();
      if (flags.notes) item.approval_notes = flags.notes;
    } else if (action === "reject") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "reject ADR");
      if (!flags.reason) throw new Error("Missing --reason.");
      item.status = "rejected";
      item.rejection_reason = flags.reason;
      item.rejected_at = new Date().toISOString();
    } else {
      requireAnyRole(flags, ["Owner", "Maintainer"], "supersede ADR");
      if (!flags.by && !flags["superseded-by"]) throw new Error("Missing --by.");
      item.status = "superseded";
      item.superseded_by = flags.by || flags["superseded-by"];
      item.superseded_reason = flags.reason || "";
      item.superseded_at = new Date().toISOString();
    }
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit(`adr.${action}`, "adr", item.adr_id, `ADR ${action}: ${item.title}`);
    console.log(`ADR ${item.adr_id} is now ${item.status}`);
    return;
  }

  if (action === "report") {
    return outputLines(buildAdrReport(data.adrs), flags.output);
  }

  if (action === "trace" || action === "history" || action === "decision-trace") {
    const trace = buildAdrAiRunTraceReport(data.adrs, readAiRuns());
    if (flags.json) console.log(JSON.stringify(trace, null, 2));
    else return outputLines(buildAdrAiRunTraceMarkdown(trace), flags.output || ".kabeeri/reports/adr_ai_run_trace.md");
    return;
  }

  throw new Error(`Unknown ADR action: ${action}`);
}

module.exports = {
  adr
};
