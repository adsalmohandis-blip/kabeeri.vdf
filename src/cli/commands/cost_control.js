const fs = require("fs");
const path = require("path");

const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { table } = require("../ui");

function contextPack(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  ensureCostControlState();
  const appendAudit = deps.appendAudit || (() => {});
  const getTaskById = deps.getTaskById || (() => null);
  const calculateUsageCost = deps.calculateUsageCost || (() => ({ cost: 0, source: "unavailable" }));
  const getPricingCurrency = deps.getPricingCurrency || defaultPricingCurrency;
  const file = ".kabeeri/ai_usage/context_packs.json";
  const data = readJsonFile(file);
  data.context_packs = data.context_packs || [];

  if (!action || action === "list") {
    console.log(table(["Context Pack", "Task", "Workstream", "Tokens", "Cost"], data.context_packs.map((item) => [
      item.context_pack_id,
      item.task_id,
      item.workstream || "",
      item.estimated_tokens || 0,
      item.estimated_cost || 0
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing context pack id.");
    const item = data.context_packs.find((entry) => entry.context_pack_id === id);
    if (!item) throw new Error(`Context pack not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "create") {
    const taskId = flags.task || value;
    if (!taskId) throw new Error("Missing --task.");
    const taskItem = getTaskById(taskId);
    if (!taskItem) throw new Error(`Task not found: ${taskId}`);
    const allowedFiles = parseCsv(flags["allowed-files"]);
    const forbiddenFiles = parseCsv(flags["forbidden-files"] || ".env,secrets/,.git/");
    const inputTokens = Number(flags["input-tokens"] || flags.tokens || estimateContextPackTokens(taskItem, allowedFiles));
    const outputTokens = Number(flags["output-tokens"] || 0);
    const cachedTokens = Number(flags["cached-tokens"] || 0);
    const provider = flags.provider || "unknown";
    const model = flags.model || "unknown";
    const cost = calculateUsageCost({ provider, model, inputTokens, outputTokens, cachedTokens });
    const id = flags.id || `ctx-${String(data.context_packs.length + 1).padStart(3, "0")}`;
    if (data.context_packs.some((entry) => entry.context_pack_id === id)) throw new Error(`Context pack already exists: ${id}`);
    const pack = {
      context_pack_id: id,
      task_id: taskId,
      source_reference: taskItem.source || flags.source || "manual",
      workstream: taskItem.workstream || "unassigned",
      goal: flags.goal || taskItem.title,
      allowed_files: allowedFiles,
      forbidden_files: forbiddenFiles,
      required_specs: parseCsv(flags.specs),
      acceptance_criteria: taskItem.acceptance_criteria || [],
      memory_summary: getMemorySummaryText(),
      open_questions: parseCsv(flags.questions || flags["open-questions"]),
      estimated_tokens: inputTokens + outputTokens + cachedTokens,
      estimated_input_tokens: inputTokens,
      estimated_output_tokens: outputTokens,
      estimated_cached_tokens: cachedTokens,
      estimated_cost: flags.cost !== undefined ? Number(flags.cost || 0) : cost.cost,
      cost_source: flags.cost !== undefined ? "manual" : cost.source,
      currency: flags.currency || getPricingCurrency() || "USD",
      created_at: new Date().toISOString()
    };
    data.context_packs.push(pack);
    writeJsonFile(file, data);
    writeTextFile(`.kabeeri/ai_usage/${id}.context.md`, buildContextPackMarkdown(pack));
    appendAudit("context_pack.created", "context_pack", id, `Context pack created for ${taskId}`);
    console.log(JSON.stringify(pack, null, 2));
    return;
  }

  throw new Error(`Unknown context-pack action: ${action}`);
}

function preflight(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  ensureCostControlState();
  const appendAudit = deps.appendAudit || (() => {});
  const getTaskById = deps.getTaskById || (() => null);
  const calculateUsageCost = deps.calculateUsageCost || (() => ({ cost: 0, source: "unavailable" }));
  const getPricingCurrency = deps.getPricingCurrency || defaultPricingCurrency;
  const file = ".kabeeri/ai_usage/cost_preflights.json";
  const data = readJsonFile(file);
  data.preflights = data.preflights || [];

  if (!action || action === "list") {
    console.log(table(["Preflight", "Task", "Risk", "Budget", "Model", "Approval"], data.preflights.map((item) => [
      item.preflight_id,
      item.task_id,
      item.risk_level,
      item.budget_status,
      item.recommended_model_class,
      item.approval_required
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing preflight id.");
    const item = data.preflights.find((entry) => entry.preflight_id === id);
    if (!item) throw new Error(`Preflight not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "estimate") {
    const taskId = flags.task || value;
    if (!taskId) throw new Error("Missing --task.");
    const taskItem = getTaskById(taskId);
    if (!taskItem) throw new Error(`Task not found: ${taskId}`);
    const contextPackId = flags.context || flags["context-pack"] || findLatestContextPackForTask(taskId);
    const pack = contextPackId ? getContextPack(contextPackId) : null;
    const inputTokens = Number(flags["input-tokens"] || (pack ? pack.estimated_input_tokens || pack.estimated_tokens || 0 : estimateContextPackTokens(taskItem, [])));
    const outputTokens = Number(flags["output-tokens"] || 3500);
    const cachedTokens = Number(flags["cached-tokens"] || (pack ? pack.estimated_cached_tokens || 0 : 0));
    const provider = flags.provider || "unknown";
    const model = flags.model || "unknown";
    const cost = calculateUsageCost({ provider, model, inputTokens, outputTokens, cachedTokens });
    const riskLevel = flags.risk || inferTaskRisk(taskItem);
    const taskKind = flags.kind || inferTaskKind(taskItem, riskLevel);
    const route = recommendModelRoute(taskKind, riskLevel);
    const estimatedCost = flags.cost !== undefined ? Number(flags.cost || 0) : cost.cost;
    const budget = getTaskBudget(taskId);
    const budgetStatus = budget.max_cost && estimatedCost > budget.max_cost ? "over_budget" : budget.max_usage_tokens && (inputTokens + outputTokens + cachedTokens) > budget.max_usage_tokens ? "over_budget" : "within_budget";
    const broadContext = Boolean(flags["broad-context"]) || inputTokens > 30000;
    const approvalRequired = budgetStatus === "over_budget" || broadContext || ["high", "critical"].includes(riskLevel) || route.recommended_model_class === "premium";
    const preflightItem = {
      preflight_id: flags.id || `preflight-${String(data.preflights.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      context_pack_id: contextPackId || null,
      requested_action: taskKind,
      risk_level: riskLevel,
      estimated_input_tokens: inputTokens,
      estimated_output_tokens: outputTokens,
      estimated_cached_tokens: cachedTokens,
      estimated_cost: estimatedCost,
      cost_source: flags.cost !== undefined ? "manual" : cost.source,
      currency: flags.currency || getPricingCurrency() || "USD",
      budget_status: budgetStatus,
      recommended_path: broadContext ? "split_context_first" : "context_pack_first",
      recommended_model_class: route.recommended_model_class,
      split_recommended: broadContext || inputTokens + outputTokens > 50000,
      approval_required: approvalRequired,
      reason: route.reason,
      created_at: new Date().toISOString()
    };
    data.preflights.push(preflightItem);
    writeJsonFile(file, data);
    appendAudit("cost_preflight.created", "preflight", preflightItem.preflight_id, `Cost preflight created for ${taskId}`);
    console.log(JSON.stringify(preflightItem, null, 2));
    return;
  }

  throw new Error(`Unknown preflight action: ${action}`);
}

function modelRoute(action, value, flags = {}) {
  ensureWorkspace();
  ensureCostControlState();
  const routes = readJsonFile(".kabeeri/ai_usage/model_routing.json").routes || [];

  if (!action || action === "list") {
    console.log(table(["Task Kind", "Model Class", "Reason"], routes.map((item) => [item.task_kind, item.recommended_model_class, item.reason])));
    return;
  }

  if (action === "recommend") {
    const taskKind = flags.kind || value || "implementation";
    const risk = flags.risk || "medium";
    console.log(JSON.stringify(recommendModelRoute(taskKind, risk), null, 2));
    return;
  }

  throw new Error(`Unknown model-route action: ${action}`);
}

function ensureCostControlState() {
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "ai_usage"), { recursive: true });
  if (!fileExists(".kabeeri/ai_usage/context_packs.json")) writeJsonFile(".kabeeri/ai_usage/context_packs.json", { context_packs: [] });
  if (!fileExists(".kabeeri/ai_usage/cost_preflights.json")) writeJsonFile(".kabeeri/ai_usage/cost_preflights.json", { preflights: [] });
  if (!fileExists(".kabeeri/ai_usage/model_routing.json")) {
    writeJsonFile(".kabeeri/ai_usage/model_routing.json", {
      routes: [
        { task_kind: "intent_classification", recommended_model_class: "cheap", reason: "Short classification can use low-cost models or local rules." },
        { task_kind: "context_pack_generation", recommended_model_class: "cheap", reason: "File lists, summaries, and acceptance extraction should be inexpensive." },
        { task_kind: "standard_docs_spec", recommended_model_class: "balanced", reason: "Documentation synthesis needs quality but usually does not require premium reasoning." },
        { task_kind: "implementation", recommended_model_class: "balanced", reason: "Production code changes usually need stronger reasoning than simple classification." },
        { task_kind: "security_review", recommended_model_class: "premium", reason: "Security review has higher risk and benefits from stronger reasoning." },
        { task_kind: "owner_verify", recommended_model_class: "human_only", reason: "Final verification is Owner-only." }
      ]
    });
  }
}

function estimateContextPackTokens(taskItem, allowedFiles) {
  const base = 1200;
  const acceptance = (taskItem.acceptance_criteria || []).join(" ").length * 0.35;
  const fileCost = (allowedFiles || []).length * 450;
  return Math.ceil(base + acceptance + fileCost);
}

function getMemorySummaryText() {
  if (fileExists(".kabeeri/memory/memory_summary.json")) {
    const summary = readJsonFile(".kabeeri/memory/memory_summary.json");
    return JSON.stringify(summary);
  }
  return "No memory summary generated yet.";
}

function buildContextPackMarkdown(pack) {
  return `# Task Context Pack - ${pack.context_pack_id}

Task: ${pack.task_id}
Workstream: ${pack.workstream}
Goal: ${pack.goal}

## Allowed Files

${pack.allowed_files.length ? pack.allowed_files.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Forbidden Files

${pack.forbidden_files.length ? pack.forbidden_files.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Required Specs

${pack.required_specs.length ? pack.required_specs.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Acceptance Criteria

${pack.acceptance_criteria.length ? pack.acceptance_criteria.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Memory Summary

${pack.memory_summary}

## Open Questions

${pack.open_questions.length ? pack.open_questions.map((item) => `- ${item}`).join("\n") : "- None recorded."}

## Estimate

- Tokens: ${pack.estimated_tokens}
- Cost: ${pack.estimated_cost} ${pack.currency}
- Cost source: ${pack.cost_source}
`;
}

function defaultPricingCurrency() {
  if (!fileExists(".kabeeri/ai_usage/pricing_rules.json")) return "USD";
  return readJsonFile(".kabeeri/ai_usage/pricing_rules.json").currency || "USD";
}

function findLatestContextPackForTask(taskId) {
  const packs = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs").filter((item) => item.task_id === taskId);
  return packs.length ? packs[packs.length - 1].context_pack_id : null;
}

function getContextPack(id) {
  const pack = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs").find((item) => item.context_pack_id === id);
  if (!pack) throw new Error(`Context pack not found: ${id}`);
  return pack;
}

function inferTaskRisk(taskItem) {
  const text = `${taskItem.title || ""} ${taskItem.workstream || ""} ${(taskItem.workstreams || []).join(" ")}`.toLowerCase();
  if (/security|secret|payment|stripe|migration|release|publish|production|privacy/.test(text)) return "high";
  return "medium";
}

function inferTaskKind(taskItem, riskLevel) {
  if (riskLevel === "high") return "security_review";
  const text = `${taskItem.title || ""} ${taskItem.source || ""}`.toLowerCase();
  if (/doc|spec|documentation/.test(text)) return "standard_docs_spec";
  return "implementation";
}

function recommendModelRoute(taskKind, risk) {
  const routes = readJsonFile(".kabeeri/ai_usage/model_routing.json").routes || [];
  const route = routes.find((item) => item.task_kind === taskKind) || routes.find((item) => item.task_kind === "implementation") || {
    task_kind: taskKind,
    recommended_model_class: "balanced",
    reason: "No exact route exists, so balanced is the safe default."
  };
  if (["high", "critical"].includes(risk) && !["human_only", "premium"].includes(route.recommended_model_class)) {
    return { ...route, risk_level: risk, recommended_model_class: "premium", reason: `${route.reason} Risk is ${risk}, so premium review is recommended.` };
  }
  return { ...route, risk_level: risk };
}

function getTaskBudget(taskId) {
  const tokens = readStateArray(".kabeeri/tokens.json", "tokens").filter((item) => item.task_id === taskId && item.status === "active");
  const active = tokens[0] || {};
  return {
    max_usage_tokens: active.max_usage_tokens || null,
    max_cost: active.max_cost || null
  };
}

function readStateArray(file, key) {
  if (!fileExists(file)) return [];
  const data = readJsonFile(file);
  return Array.isArray(data[key]) ? data[key] : [];
}

function parseCsv(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(parseCsv);
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

module.exports = {
  contextPack,
  preflight,
  modelRoute,
  findLatestContextPackForTask,
  getContextPack
};
