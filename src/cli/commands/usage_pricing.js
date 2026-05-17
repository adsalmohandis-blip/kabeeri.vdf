const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot } = require("../fs_utils");
const { table } = require("../ui");
const { isExpired } = require("../services/collections");
const { appendJsonLine } = require("../services/jsonl");
const { outputLines } = require("../services/report_output");
const { readStateArray } = require("../services/state_utils");

function getPricingCurrency() {
  if (!fileExists(".kabeeri/ai_usage/pricing_rules.json")) return "USD";
  return readJsonFile(".kabeeri/ai_usage/pricing_rules.json").currency || "USD";
}

function usage(action, value, flags = {}, deps = {}) {
  const { refreshDashboardArtifacts = () => {} } = deps;
  ensureWorkspace();

  if (!action || action === "summary") {
    const summary = summarizeUsage();
    writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summary);
    writeJsonFile(".kabeeri/ai_usage/cost_breakdown.json", {
      by_task: summary.by_task,
      by_developer: summary.by_developer,
      by_workstream: summary.by_workstream,
      by_provider: summary.by_provider,
      by_sprint: summary.by_sprint,
      budget_pressure: summary.budget_pressure
    });
    refreshDashboardArtifacts();
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (action === "efficiency") {
    console.log(JSON.stringify(buildDeveloperEfficiency(), null, 2));
    return;
  }

  if (action === "report") {
    return outputLines(buildUsageReport(), flags.output);
  }

  if (action === "list") {
    const events = readUsageEvents();
    console.log(table(["Event", "Task", "Developer", "Tokens", "Cost"], events.map((event) => [
      event.event_id,
      event.task_id || "",
      event.developer_id || "",
      event.total_tokens || 0,
      event.cost || 0
    ])));
    return;
  }

  if (action === "record") {
    return recordUsageEvent(value, flags, deps);
  }

  if (["admin", "inquiry", "question", "planning", "docs"].includes(action)) {
    return recordUsageEvent(value, {
      ...flags,
      untracked: true,
      operation: flags.operation || action,
      source: flags.source || `ai_${action}_usage`
    }, deps);
  }

  throw new Error(`Unknown usage action: ${action}`);
}

function recordUsageEvent(value, flags = {}, deps = {}) {
  const { refreshDashboardArtifacts = () => {}, appendAudit = () => {} } = deps;
  const isUntracked = Boolean(flags.untracked);
  const operationType = flags.operation || flags.kind || flags.type || (isUntracked ? "untracked" : "task");
  const taskId = flags.task || value || (isUntracked ? `admin:${operationType}` : null);
  const developerId = flags.developer || flags.assignee || flags.actor || (isUntracked ? "untracked" : null);
  if (!taskId) throw new Error("Missing --task.");
  if (!developerId) throw new Error("Missing --developer.");
  const inputTokens = Number(flags["input-tokens"] || 0);
  const outputTokens = Number(flags["output-tokens"] || 0);
  const cachedTokens = Number(flags["cached-tokens"] || 0);
  const totalTokens = inputTokens + outputTokens + cachedTokens;
  const calculated = calculateUsageCost({
    provider: flags.provider || "unknown",
    model: flags.model || "unknown",
    inputTokens,
    outputTokens,
    cachedTokens
  });
  const cost = flags.cost !== undefined ? Number(flags.cost || 0) : calculated.cost;
  const event = {
    event_id: `usage-${Date.now()}`,
    timestamp: new Date().toISOString(),
    task_id: taskId,
    sprint_id: isUntracked ? flags.sprint || null : flags.sprint || getTaskSprint(taskId),
    developer_id: developerId,
    workstream: flags.workstream || (isUntracked ? "admin" : "untracked"),
    provider: flags.provider || "unknown",
    model: flags.model || "unknown",
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cached_tokens: cachedTokens,
    total_tokens: totalTokens,
    cost,
    currency: flags.currency || "USD",
    cost_source: flags.cost !== undefined ? "manual" : calculated.source,
    source: flags.source || (isUntracked ? "untracked_ai_usage" : "manual_entry"),
    operation_type: operationType,
    prompt_kind: flags.prompt || flags["prompt-kind"] || operationType,
    tracked: isUntracked ? false : flags.tracked !== "false"
  };
  if (!isUntracked) enforceBudgetApproval(taskId, totalTokens, cost);
  appendJsonLine(".kabeeri/ai_usage/usage_events.jsonl", event);
  const summary = summarizeUsage();
  writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summary);
  refreshDashboardArtifacts();
  appendAudit("ai_usage.recorded", isUntracked ? "operation" : "task", taskId, `AI usage recorded: ${totalTokens} tokens`);
  const warning = isUntracked ? null : getBudgetWarning(taskId, summary);
  console.log(`Recorded usage event ${event.event_id}`);
  if (warning) console.log(`WARN ${warning}`);
}

function pricing(action, value, flags = {}, deps = {}) {
  const { requireAnyRole, appendAudit = () => {} } = deps;
  ensureWorkspace();
  const file = ".kabeeri/ai_usage/pricing_rules.json";
  const data = readJsonFile(file);
  data.currency = data.currency || "USD";
  data.providers = data.providers || [];

  if (!action || action === "list") {
    const rows = [];
    for (const provider of data.providers) {
      for (const model of provider.models || []) {
        rows.push([
          provider.name,
          model.name,
          data.currency,
          model.unit || "1M",
          model.input_price || 0,
          model.output_price || 0,
          model.cached_price || 0
        ]);
      }
    }
    console.log(table(["Provider", "Model", "Currency", "Unit", "Input", "Output", "Cached"], rows));
    return;
  }

  if (action === "show") {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (action === "set") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "set pricing");
    const providerName = flags.provider || value;
    const modelName = flags.model;
    if (!providerName) throw new Error("Missing --provider.");
    if (!modelName) throw new Error("Missing --model.");
    const provider = upsertProvider(data, providerName);
    const model = upsertModel(provider, modelName);
    model.unit = normalizePricingUnit(flags.unit || model.unit || "1M");
    model.input_price = Number(flags.input || flags["input-price"] || model.input_price || 0);
    model.output_price = Number(flags.output || flags["output-price"] || model.output_price || 0);
    model.cached_price = Number(flags.cached || flags["cached-price"] || model.cached_price || 0);
    data.currency = flags.currency || data.currency || "USD";
    data.last_updated = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("pricing.updated", "pricing", `${providerName}/${modelName}`, "Pricing rule updated");
    console.log(`Saved pricing for ${providerName}/${modelName}.`);
    return;
  }

  throw new Error(`Unknown pricing action: ${action}`);
}

function upsertProvider(data, providerName) {
  let provider = data.providers.find((item) => item.name === providerName);
  if (!provider) {
    provider = { name: providerName, models: [] };
    data.providers.push(provider);
  }
  return provider;
}

function upsertModel(provider, modelName) {
  provider.models = provider.models || [];
  let model = provider.models.find((item) => item.name === modelName);
  if (!model) {
    model = { name: modelName };
    provider.models.push(model);
  }
  return model;
}

function normalizePricingUnit(unit) {
  const normalized = String(unit).toLowerCase();
  if (["token", "1", "per-token"].includes(normalized)) return "token";
  if (["1k", "k", "1000"].includes(normalized)) return "1K";
  if (["1m", "m", "1000000"].includes(normalized)) return "1M";
  throw new Error("Invalid pricing unit. Use token, 1K, or 1M.");
}

function calculateUsageCost({ provider, model, inputTokens, outputTokens, cachedTokens }) {
  const rules = fileExists(".kabeeri/ai_usage/pricing_rules.json") ? readJsonFile(".kabeeri/ai_usage/pricing_rules.json") : { providers: [] };
  const providerRule = (rules.providers || []).find((item) => item.name === provider);
  const modelRule = providerRule ? (providerRule.models || []).find((item) => item.name === model) : null;
  if (!modelRule) return { cost: 0, source: "missing_pricing_rule" };
  const divisor = pricingDivisor(modelRule.unit || "1M");
  const inputCost = (inputTokens / divisor) * Number(modelRule.input_price || 0);
  const outputCost = (outputTokens / divisor) * Number(modelRule.output_price || 0);
  const cachedCost = (cachedTokens / divisor) * Number(modelRule.cached_price || 0);
  return {
    cost: roundMoney(inputCost + outputCost + cachedCost),
    source: "pricing_rules"
  };
}

function pricingDivisor(unit) {
  if (unit === "token") return 1;
  if (unit === "1K") return 1000;
  return 1000000;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 1000000) / 1000000;
}

function readUsageEvents() {
  const file = path.join(repoRoot(), ".kabeeri", "ai_usage", "usage_events.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function summarizeUsage() {
  const events = readUsageEvents();
  const summary = {
    total_events: events.length,
    total_tokens: 0,
    input_tokens: 0,
    output_tokens: 0,
    cached_tokens: 0,
    total_cost: 0,
    currency: events[0] ? events[0].currency : "USD",
    by_task: {},
    by_developer: {},
    by_workstream: {},
    by_provider: {},
    by_sprint: {},
    tracked_vs_untracked: {
      tracked: { events: 0, tokens: 0, cost: 0 },
      untracked: { events: 0, tokens: 0, cost: 0 }
    },
    budget_pressure: null
  };

  for (const event of events) {
    const tokens = Number(event.total_tokens || 0);
    const cost = Number(event.cost || 0);
    summary.total_tokens += tokens;
    summary.input_tokens += Number(event.input_tokens || 0);
    summary.output_tokens += Number(event.output_tokens || 0);
    summary.cached_tokens += Number(event.cached_tokens || 0);
    summary.total_cost += cost;
    addUsageBucket(summary.by_task, event.task_id || "untracked", tokens, cost);
    addUsageBucket(summary.by_developer, event.developer_id || "untracked", tokens, cost);
    addUsageBucket(summary.by_workstream, event.workstream || "untracked", tokens, cost);
    addUsageBucket(summary.by_provider, event.provider || "unknown", tokens, cost);
    addUsageBucket(summary.by_sprint, event.sprint_id || "unassigned", tokens, cost);
    const trackedKey = event.tracked === false ? "untracked" : "tracked";
    summary.tracked_vs_untracked[trackedKey].events += 1;
    summary.tracked_vs_untracked[trackedKey].tokens += tokens;
    summary.tracked_vs_untracked[trackedKey].cost += cost;
  }

  summary.budget_pressure = buildBudgetPressure(summary);
  return summary;
}

function buildUsageReport() {
  const summary = summarizeUsage();
  return [
    "# Kabeeri AI Usage Cost Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Total events: ${summary.total_events}`,
    `Total tokens: ${summary.total_tokens}`,
    `Total cost: ${summary.total_cost} ${summary.currency}`,
    "",
    "## By Task",
    ...usageMarkdownRows(summary.by_task, "Task"),
    "",
    "## By Developer",
    ...usageMarkdownRows(summary.by_developer, "Developer"),
    "",
    "## By Workstream",
    ...usageMarkdownRows(summary.by_workstream, "Workstream"),
    "",
    "## By Sprint",
    ...usageMarkdownRows(summary.by_sprint, "Sprint"),
    "",
    "## Tracked vs Untracked",
    ...usageMarkdownRows(summary.tracked_vs_untracked, "Type"),
    "",
    "## Budget Pressure",
    ...budgetPressureRows(summary.budget_pressure),
    "",
    "## Developer Efficiency",
    ...developerEfficiencyRows(buildDeveloperEfficiency().by_developer)
  ];
}

function usageMarkdownRows(buckets, label) {
  const rows = [`| ${label} | Events | Tokens | Cost |`, "| --- | ---: | ---: | ---: |"];
  for (const [key, item] of Object.entries(buckets || {})) {
    rows.push(`| ${key} | ${item.events || 0} | ${item.tokens || 0} | ${item.cost || 0} |`);
  }
  if (rows.length === 2) rows.push(`| none | 0 | 0 | 0 |`);
  return rows;
}

function developerEfficiencyRows(buckets) {
  const rows = ["| Developer | Events | Tokens | Cost | Accepted | Rejected | Rework | Untracked |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"];
  for (const [key, item] of Object.entries(buckets || {})) {
    rows.push(`| ${key} | ${item.events || 0} | ${item.tokens || 0} | ${item.cost || 0} | ${item.accepted_cost || 0} | ${item.rejected_cost || 0} | ${item.rework_cost || 0} | ${item.untracked_cost || 0} |`);
  }
  if (rows.length === 2) rows.push("| none | 0 | 0 | 0 | 0 | 0 | 0 | 0 |");
  return rows;
}

function getTaskSprint(taskId) {
  if (!fileExists(".kabeeri/tasks.json")) return null;
  const task = (readJsonFile(".kabeeri/tasks.json").tasks || []).find((item) => item.id === taskId);
  return task ? task.sprint_id || null : null;
}

function buildSprintSummary(sprintId) {
  const sprints = readStateArray(".kabeeri/sprints.json", "sprints");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const usageSummary = summarizeUsage();
  const sprint = sprints.find((item) => item.id === sprintId) || { id: sprintId, name: sprintId };
  const sprintTasks = tasks.filter((taskItem) => taskItem.sprint_id === sprintId);
  const usageEvents = readUsageEvents().filter((event) => (event.sprint_id || getTaskSprint(event.task_id)) === sprintId);
  const acceptedTasks = sprintTasks.filter((taskItem) => taskItem.status === "owner_verified");
  const reworkEvents = usageEvents.filter((event) => event.source === "rework");

  return {
    sprint,
    tasks_total: sprintTasks.length,
    tasks_verified: acceptedTasks.length,
    total_tokens: usageEvents.reduce((sum, event) => sum + Number(event.total_tokens || 0), 0),
    total_cost: usageEvents.reduce((sum, event) => sum + Number(event.cost || 0), 0),
    usage: usageSummary.by_sprint[sprintId] || { events: 0, tokens: 0, cost: 0 },
    by_task: Object.fromEntries(sprintTasks.map((taskItem) => [taskItem.id, usageSummary.by_task[taskItem.id] || { events: 0, tokens: 0, cost: 0 }])),
    rework_cost: reworkEvents.reduce((sum, event) => sum + Number(event.cost || 0), 0),
    untracked_cost: usageEvents.filter((event) => event.tracked === false).reduce((sum, event) => sum + Number(event.cost || 0), 0)
  };
}

function buildDeveloperEfficiency() {
  const events = readUsageEvents();
  const tasks = fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json").tasks || [] : [];
  const taskStatus = Object.fromEntries(tasks.map((taskItem) => [taskItem.id, taskItem.status]));
  const byDeveloper = {};
  for (const event of events) {
    const developer = event.developer_id || "untracked";
    byDeveloper[developer] = byDeveloper[developer] || {
      events: 0,
      tokens: 0,
      cost: 0,
      accepted_cost: 0,
      rejected_cost: 0,
      rework_cost: 0,
      untracked_cost: 0
    };
    const bucket = byDeveloper[developer];
    const cost = Number(event.cost || 0);
    bucket.events += 1;
    bucket.tokens += Number(event.total_tokens || 0);
    bucket.cost += cost;
    if (event.tracked === false || !event.task_id || event.task_id === "untracked") bucket.untracked_cost += cost;
    if (event.source === "rework") bucket.rework_cost += cost;
    if (taskStatus[event.task_id] === "owner_verified") bucket.accepted_cost += cost;
    if (taskStatus[event.task_id] === "rejected") bucket.rejected_cost += cost;
  }
  return {
    generated_at: new Date().toISOString(),
    by_developer: byDeveloper
  };
}

function addUsageBucket(target, key, tokens, cost) {
  target[key] = target[key] || { events: 0, tokens: 0, cost: 0 };
  target[key].events += 1;
  target[key].tokens += tokens;
  target[key].cost += cost;
}

function budgetPressureRows(pressure) {
  const rows = ["| Task | Severity | Tokens | Token Limit | Cost | Cost Limit | Approval |", "| --- | --- | ---: | ---: | ---: | ---: | --- |"];
  const tasks = pressure && Array.isArray(pressure.tasks) ? pressure.tasks : [];
  for (const item of tasks) {
    rows.push(`| ${item.task_id} | ${item.severity} | ${item.tokens} | ${item.max_tokens || ""} | ${item.cost} | ${item.max_cost || ""} | ${item.approval_id || item.approval_status || "-"} |`);
  }
  if (rows.length === 2) rows.push("| none | clear | 0 |  | 0 |  | - |");
  return rows;
}

function buildBudgetPressure(summary) {
  const tokens = fileExists(".kabeeri/tokens.json") ? readJsonFile(".kabeeri/tokens.json").tokens || [] : [];
  const approvals = readBudgetApprovals();
  const activeApprovals = approvals.filter((approval) => approval.status === "active" && !isExpired(approval.expires_at));
  const approvalsByTask = Object.fromEntries(activeApprovals.map((approval) => [approval.task_id, approval]));
  const tasks = [];

  for (const token of tokens) {
    if (token.status !== "active") continue;
    const usage = summary.by_task[token.task_id] || { tokens: 0, cost: 0 };
    const tokenPressure = buildPressureMetric(usage.tokens, token.max_usage_tokens);
    const costPressure = buildPressureMetric(usage.cost, token.max_cost);
    const severity = highestPressureSeverity(tokenPressure.ratio, costPressure.ratio);
    if (!severity) continue;
    const approval = approvalsByTask[token.task_id] || null;
    tasks.push({
      task_id: token.task_id,
      token_id: token.token_id,
      severity,
      tokens: usage.tokens,
      max_tokens: token.max_usage_tokens || null,
      token_ratio: tokenPressure.ratio,
      cost: usage.cost,
      max_cost: token.max_cost || null,
      cost_ratio: costPressure.ratio,
      approval_id: approval ? approval.approval_id : null,
      approval_status: approval ? approval.status : null,
      approval_expires_at: approval ? approval.expires_at || null : null,
      approval_covers_token_overrun: approval ? approval.extra_tokens === null || approval.extra_tokens === undefined || (tokenPressure.excess > 0 && tokenPressure.excess <= Number(approval.extra_tokens || 0)) : false,
      approval_covers_cost_overrun: approval ? approval.extra_cost === null || approval.extra_cost === undefined || (costPressure.excess > 0 && costPressure.excess <= Number(approval.extra_cost || 0)) : false
    });
  }

  tasks.sort((a, b) => {
    const severityOrder = { over_budget: 0, needs_attention: 1, watching: 2 };
    const severityDelta = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDelta !== 0) return severityDelta;
    const ratioA = Math.max(a.token_ratio || 0, a.cost_ratio || 0);
    const ratioB = Math.max(b.token_ratio || 0, b.cost_ratio || 0);
    return ratioB - ratioA;
  });

  return {
    generated_at: new Date().toISOString(),
    counts: {
      active_approvals: activeApprovals.length,
      watching: tasks.filter((item) => item.severity === "watching").length,
      needs_attention: tasks.filter((item) => item.severity === "needs_attention").length,
      over_budget: tasks.filter((item) => item.severity === "over_budget").length
    },
    active_approvals: activeApprovals.map((approval) => ({
      approval_id: approval.approval_id,
      task_id: approval.task_id,
      extra_tokens: approval.extra_tokens ?? null,
      extra_cost: approval.extra_cost ?? null,
      expires_at: approval.expires_at || null
    })),
    tasks
  };
}

function readBudgetApprovals() {
  if (!fileExists(".kabeeri/ai_usage/budget_approvals.json")) return [];
  return readJsonFile(".kabeeri/ai_usage/budget_approvals.json").approvals || [];
}

function buildPressureMetric(used, max) {
  const limit = Number(max || 0);
  if (!limit) return { ratio: null, excess: 0 };
  const usage = Number(used || 0);
  return {
    ratio: usage / limit,
    excess: Math.max(0, usage - limit)
  };
}

function highestPressureSeverity(tokenRatio, costRatio) {
  const tokenSeverity = pressureSeverity(tokenRatio);
  const costSeverity = pressureSeverity(costRatio);
  return mostSevere(tokenSeverity, costSeverity);
}

function pressureSeverity(ratio) {
  if (ratio === null || ratio === undefined) return null;
  if (ratio >= 1) return "over_budget";
  if (ratio >= 0.9) return "needs_attention";
  if (ratio >= 0.75) return "watching";
  return null;
}

function mostSevere(first, second) {
  const order = { over_budget: 3, needs_attention: 2, watching: 1 };
  if (!first) return second;
  if (!second) return first;
  return order[first] >= order[second] ? first : second;
}

function getBudgetWarning(taskId, summary) {
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  const active = tokens.find((token) => token.task_id === taskId && token.status === "active");
  if (!active) return null;
  const taskUsage = summary.by_task[taskId] || { tokens: 0, cost: 0 };
  if (active.max_usage_tokens && taskUsage.tokens > active.max_usage_tokens) {
    return `Task ${taskId} exceeded token budget (${taskUsage.tokens}/${active.max_usage_tokens}).`;
  }
  if (active.max_usage_tokens && taskUsage.tokens >= active.max_usage_tokens * 0.9) {
    return `Task ${taskId} is above 90% token budget (${taskUsage.tokens}/${active.max_usage_tokens}).`;
  }
  if (active.max_cost && taskUsage.cost > active.max_cost) {
    return `Task ${taskId} exceeded cost budget (${taskUsage.cost}/${active.max_cost}).`;
  }
  if (active.max_cost && taskUsage.cost >= active.max_cost * 0.9) {
    return `Task ${taskId} is above 90% cost budget (${taskUsage.cost}/${active.max_cost}).`;
  }
  if (active.max_usage_tokens && taskUsage.tokens >= active.max_usage_tokens * 0.75) {
    return `Task ${taskId} is above 75% token budget (${taskUsage.tokens}/${active.max_usage_tokens}).`;
  }
  if (active.max_cost && taskUsage.cost >= active.max_cost * 0.75) {
    return `Task ${taskId} is above 75% cost budget (${taskUsage.cost}/${active.max_cost}).`;
  }
  return null;
}

function enforceBudgetApproval(taskId, newTokens, newCost) {
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  const active = tokens.find((token) => token.task_id === taskId && token.status === "active");
  if (!active || !active.budget_approval_required) return;
  const summary = summarizeUsage();
  const current = summary.by_task[taskId] || { tokens: 0, cost: 0 };
  const projectedTokens = Number(current.tokens || 0) + Number(newTokens || 0);
  const projectedCost = Number(current.cost || 0) + Number(newCost || 0);
  const tokenOverrun = active.max_usage_tokens && projectedTokens > active.max_usage_tokens;
  const costOverrun = active.max_cost && projectedCost > active.max_cost;
  if (!tokenOverrun && !costOverrun) return;
  const approval = findActiveBudgetApproval(taskId, {
    extraTokens: tokenOverrun ? projectedTokens - active.max_usage_tokens : 0,
    extraCost: costOverrun ? projectedCost - active.max_cost : 0
  });
  if (!approval) {
    throw new Error(`Budget approval required for ${taskId}. Run \`kvdf budget approve --task ${taskId}\` before recording over-budget usage.`);
  }
}

function findActiveBudgetApproval(taskId, required) {
  const file = ".kabeeri/ai_usage/budget_approvals.json";
  if (!fileExists(file)) return null;
  const approvals = readJsonFile(file).approvals || [];
  return approvals.find((approval) => {
    if (approval.task_id !== taskId || approval.status !== "active") return false;
    if (isExpired(approval.expires_at)) return false;
    if (approval.extra_tokens !== null && approval.extra_tokens !== undefined && required.extraTokens > Number(approval.extra_tokens)) return false;
    if (approval.extra_cost !== null && approval.extra_cost !== undefined && required.extraCost > Number(approval.extra_cost)) return false;
    return true;
  }) || null;
}

module.exports = {
  usage,
  pricing,
  recordUsageEvent,
  calculateUsageCost,
  getPricingCurrency,
  readUsageEvents,
  summarizeUsage,
  getTaskSprint,
  buildSprintSummary,
  buildDeveloperEfficiency,
  enforceBudgetApproval
};
