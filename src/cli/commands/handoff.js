const fs = require("fs");
const path = require("path");

const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile, assertSafeName } = require("../fs_utils");
const { table } = require("../ui");

function handoff(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  ensureHandoffState();
  const runPolicyGate = deps.runPolicyGate || (() => {});
  const collectDashboardState = deps.collectDashboardState || (() => ({ business: {}, technical: {}, records: {} }));
  const summarizeUsage = deps.summarizeUsage || (() => ({
    total_events: 0,
    total_tokens: 0,
    total_cost: 0,
    currency: "USD",
    input_tokens: 0,
    output_tokens: 0,
    cached_tokens: 0,
    by_task: {},
    by_developer: {}
  }));
  const appendAudit = deps.appendAudit || (() => {});
  const getEffectiveActor = deps.getEffectiveActor || (() => null);
  const file = ".kabeeri/handoff/packages.json";
  const data = readJsonFile(file);
  data.packages = data.packages || [];

  if (!action || action === "list") {
    console.log(table(["Package", "Audience", "Status", "Output", "Created"], data.packages.map((item) => [
      item.package_id,
      item.audience,
      item.status,
      item.output_dir,
      item.created_at
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing handoff package id.");
    const item = data.packages.find((entry) => entry.package_id === id);
    if (!item) throw new Error(`Handoff package not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "package" || action === "generate") {
    const id = flags.id || value || `handoff-${String(data.packages.length + 1).padStart(3, "0")}`;
    assertSafeName(id);
    if (data.packages.some((entry) => entry.package_id === id)) throw new Error(`Handoff package already exists: ${id}`);
    const outputDir = (flags.output || `.kabeeri/handoff/${id}`).replace(/\\/g, "/").replace(/\/$/, "");
    const audience = normalizeHandoffAudience(flags.audience || "owner");
    runPolicyGate("handoff", { packageId: id, audience }, flags);
    const state = collectDashboardState();
    const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
    const usageSummary = summarizeUsage();
    const packageItem = {
      package_id: id,
      audience,
      status: "generated",
      output_dir: outputDir,
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      files: [
        `${outputDir}/00_INDEX.md`,
        `${outputDir}/01_BUSINESS_SUMMARY.md`,
        `${outputDir}/02_TECHNICAL_SUMMARY.md`,
        `${outputDir}/03_FEATURE_READINESS.md`,
        `${outputDir}/04_PRODUCTION_PUBLISH_STATUS.md`,
        `${outputDir}/05_AI_COST_SUMMARY.md`,
        `${outputDir}/06_NEXT_ROADMAP.md`
      ]
    };
    writeTextFile(packageItem.files[0], buildHandoffIndex(packageItem, project));
    writeTextFile(packageItem.files[1], buildBusinessHandoffSummary(state, project));
    writeTextFile(packageItem.files[2], buildTechnicalHandoffSummary(state, project));
    writeTextFile(packageItem.files[3], buildFeatureReadinessReport(state));
    writeTextFile(packageItem.files[4], buildProductionPublishReport(state));
    writeTextFile(packageItem.files[5], buildAiCostHandoffReport(usageSummary, state));
    writeTextFile(packageItem.files[6], buildNextRoadmapReport(state));
    data.packages.push(packageItem);
    writeJsonFile(file, data);
    appendAudit("handoff.generated", "handoff", id, `Handoff package generated: ${outputDir}`);
    console.log(`Generated handoff package ${id}: ${outputDir}`);
    return;
  }

  throw new Error(`Unknown handoff action: ${action}`);
}

function ensureHandoffState() {
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "handoff"), { recursive: true });
  if (!fileExists(".kabeeri/handoff/packages.json")) writeJsonFile(".kabeeri/handoff/packages.json", { packages: [] });
}

function normalizeHandoffAudience(value) {
  const normalized = String(value || "owner").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["client", "owner", "internal", "team"]);
  if (!allowed.has(normalized)) throw new Error("Invalid handoff audience. Use client, owner, internal, or team.");
  return normalized;
}

function buildHandoffIndex(packageItem, project) {
  return `# Kabeeri Handoff Package - ${packageItem.package_id}

Project: ${project.name || project.framework || "Kabeeri project"}
Audience: ${packageItem.audience}
Generated at: ${packageItem.created_at}

## Files

- [Business Summary](01_BUSINESS_SUMMARY.md)
- [Technical Summary](02_TECHNICAL_SUMMARY.md)
- [Feature Readiness](03_FEATURE_READINESS.md)
- [Production Vs Publish Status](04_PRODUCTION_PUBLISH_STATUS.md)
- [AI Cost Summary](05_AI_COST_SUMMARY.md)
- [Next Roadmap](06_NEXT_ROADMAP.md)

## Owner Note

This package is generated from local .kabeeri governance state. Owner approval is still required before final delivery, release, publish, or scope closure.
`;
}

function buildBusinessHandoffSummary(state, project) {
  const business = state.business || {};
  const readyFeatures = (business.features || []).filter((item) => ["ready_to_demo", "ready_to_publish"].includes(item.readiness));
  const readyJourneys = (business.journeys || []).filter((item) => item.ready_to_show || item.status === "ready_to_show");
  return `# Business Handoff Summary

## Project

- Name: ${project.name || project.framework || "Kabeeri project"}
- Profile: ${project.profile || ""}
- Delivery mode: ${project.delivery_mode || ""}
- Language: ${project.language || ""}
- Version: ${project.version || ""}

## Readiness Snapshot

- Total tasks: ${business.tasks_total || 0}
- Owner verified tasks: ${business.verified_tasks || 0}
- Ready features: ${readyFeatures.length}
- Ready journeys: ${readyJourneys.length}
- AI usage cost: ${business.ai_usage_cost || 0}
- AI usage tokens: ${business.ai_usage_tokens || 0}

## Ready To Show

${readyFeatures.length ? readyFeatures.map((item) => `- ${item.title} (${item.readiness})`).join("\n") : "- No ready features recorded yet."}

## Ready Journeys

${readyJourneys.length ? readyJourneys.map((item) => `- ${item.name} (${item.status})`).join("\n") : "- No ready journeys recorded yet."}
`;
}

function buildTechnicalHandoffSummary(state, project) {
  const technical = state.technical || {};
  return `# Technical Handoff Summary

## Project Metadata

- Framework: ${project.framework || "Not recorded"}
- Profile: ${project.profile || "Not recorded"}
- Delivery mode: ${project.delivery_mode || "Not recorded"}
- Engine version: ${project.version || "Not recorded"}

## Governance State

- Task status: ${JSON.stringify(technical.tasks || {})}
- Active locks: ${(technical.active_locks || []).length}
- Active tokens: ${(technical.active_tokens || []).length}
- Session status: ${JSON.stringify(technical.sessions || {})}
- Policy status: ${JSON.stringify(technical.policies || {})}
- Context packs: ${technical.context_packs || 0}
- Cost preflight status: ${JSON.stringify(technical.cost_preflights || {})}

## Developers

${(technical.developers || []).length ? technical.developers.map((item) => `- ${item.id}: ${item.display_name || item.name || ""} (${item.role || ""})`).join("\n") : "- No human developers recorded."}

## AI Agents

${(technical.agents || []).length ? technical.agents.map((item) => `- ${item.id}: ${item.display_name || item.name || ""} (${item.role || ""})`).join("\n") : "- No AI agents recorded."}
`;
}

function buildFeatureReadinessReport(state) {
  const features = state.records.features || [];
  const tasks = state.records.tasks || [];
  const taskMap = Object.fromEntries(tasks.map((item) => [item.id, item]));
  const rows = features.map((featureItem) => {
    const evidence = (featureItem.task_ids || []).map((taskId) => `${taskId}:${taskMap[taskId] ? taskMap[taskId].status : "missing"}`).join(", ") || "-";
    return `| ${featureItem.id} | ${featureItem.title} | ${featureItem.readiness} | ${evidence} | ${featureItem.audience || ""} |`;
  });
  return `# Feature Readiness Report

| ID | Feature | Readiness | Evidence | Audience |
| --- | --- | --- | --- | --- |
${rows.length ? rows.join("\n") : "| - | No features recorded | - | - | - |"}
`;
}

function buildProductionPublishReport(state) {
  const tasks = state.records.tasks || [];
  const activeLocks = (state.records.locks || []).filter((item) => item.status === "active");
  const activeTokens = (state.records.tokens || []).filter((item) => item.status === "active");
  const blockedPolicies = (state.records.policy_results || []).filter((item) => item.status === "blocked");
  const unverifiedTasks = tasks.filter((item) => item.status !== "owner_verified");
  const publishStatus = blockedPolicies.length || activeLocks.length || activeTokens.length || unverifiedTasks.length ? "not_ready_to_publish" : "ready_to_publish";
  return `# Production Vs Publish Status

Status: ${publishStatus}

## Blocking Signals

- Unverified tasks: ${unverifiedTasks.length}
- Active locks: ${activeLocks.length}
- Active tokens: ${activeTokens.length}
- Blocked policy results: ${blockedPolicies.length}

## Notes

Kabeeri treats publish as an Owner-governed decision. A clean report does not deploy or publish by itself.
`;
}

function buildAiCostHandoffReport(usage, state) {
  const preflights = state.records.cost_preflights || [];
  return `# AI Token Cost Summary

## Totals

- Events: ${usage.total_events}
- Tokens: ${usage.total_tokens}
- Cost: ${usage.total_cost} ${usage.currency}
- Input tokens: ${usage.input_tokens}
- Output tokens: ${usage.output_tokens}
- Cached tokens: ${usage.cached_tokens}

## By Task

${handoffObjectTable(["Task", "Events", "Tokens", "Cost"], usage.by_task)}

## By Developer

${handoffObjectTable(["Developer", "Events", "Tokens", "Cost"], usage.by_developer)}

## Cost Preflights

${preflights.length ? preflights.map((item) => `- ${item.preflight_id}: ${item.task_id}, ${item.budget_status}, approval_required=${item.approval_required}`).join("\n") : "- No cost preflights recorded."}
`;
}

function buildNextRoadmapReport(state) {
  const tasks = state.records.tasks || [];
  const features = state.records.features || [];
  const blockedPolicies = (state.records.policy_results || []).filter((item) => item.status === "blocked");
  const candidates = tasks.filter((item) => !["owner_verified", "rejected"].includes(item.status)).slice(0, 20);
  const futureFeatures = features.filter((item) => ["future", "needs_review"].includes(item.readiness)).slice(0, 20);
  return `# Next Roadmap

## Task Candidates

${candidates.length ? candidates.map((item) => `- ${item.id}: ${item.title} (${item.status})`).join("\n") : "- No open task candidates recorded."}

## Feature Candidates

${futureFeatures.length ? futureFeatures.map((item) => `- ${item.id}: ${item.title} (${item.readiness})`).join("\n") : "- No future or needs-review features recorded."}

## Governance Follow-Ups

${blockedPolicies.length ? blockedPolicies.map((item) => `- Resolve policy blockers for ${item.subject_id}: ${(item.blockers || []).map((blocker) => blocker.check_id).join(", ")}`).join("\n") : "- No blocked policy results recorded."}
`;
}

function handoffObjectTable(headers, data) {
  const entries = Object.entries(data || {});
  if (!entries.length) return "| Name | Events | Tokens | Cost |\n| --- | ---: | ---: | ---: |\n| - | 0 | 0 | 0 |";
  return `| ${headers.join(" | ")} |\n| --- | ---: | ---: | ---: |\n${entries.map(([key, item]) => `| ${key} | ${item.events || 0} | ${item.tokens || 0} | ${item.cost || 0} |`).join("\n")}`;
}

module.exports = {
  handoff
};
