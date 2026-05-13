const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, resolveAsset, assertSafeName, readTextFile } = require("../fs_utils");
const { findLatestContextPackForTask, getContextPack } = require("../commands/cost_control");
const { taskWorkstreams } = require("../commands/dashboard_state");
const { uniqueList } = require("./collections");

function composePromptPack(packName, flags = {}) {
  ensureWorkspace();
  ensurePromptLayerState();
  assertSafeName(packName);
  const manifestPath = `prompt_packs/${packName}/prompt_pack_manifest.json`;
  if (!fileExists(manifestPath)) throw new Error(`Prompt pack not found: ${packName}`);
  const commonManifest = readJsonFile("prompt_packs/common/prompt_pack_manifest.json");
  const packManifest = readJsonFile(manifestPath);
  const taskId = flags.task || null;
  const taskItem = taskId ? getTaskById(taskId) : null;
  if (taskId && !taskItem) throw new Error(`Task not found: ${taskId}`);
  const contextPackId = flags.context || flags["context-pack"] || (taskId ? findLatestContextPackForTask(taskId) : null);
  const context = contextPackId ? getContextPack(contextPackId) : null;
  const selectedPrompt = flags.prompt || selectPromptFileForTask(packManifest, taskItem);
  const promptPath = `prompt_packs/${packName}/${selectedPrompt}`;
  if (!fileExists(promptPath)) throw new Error(`Prompt file not found in ${packName}: ${selectedPrompt}`);
  const commonFiles = (commonManifest.files || []).filter((file) => file.endsWith(".md") && file !== "README.md" && file !== "00_COMMON_PROMPT_LAYER_INDEX.md");
  const commonSections = commonFiles.map((file) => ({
    file,
    content: readTextFile(`prompt_packs/common/${file}`).trim()
  }));
  const stackPrompt = fs.readFileSync(resolveAsset(promptPath), "utf8").trim();
  const compactGuidance = buildPromptPackCompactGuidance({
    packName,
    packManifest,
    taskItem,
    selectedPrompt,
    context
  });
  const idData = readJsonFile(".kabeeri/prompt_layer/compositions.json");
  idData.compositions = idData.compositions || [];
  const id = flags.id || `prompt-composition-${String(idData.compositions.length + 1).padStart(3, "0")}`;
  if (idData.compositions.some((item) => item.composition_id === id)) throw new Error(`Prompt composition already exists: ${id}`);
  const outputPath = flags.output || `.kabeeri/prompt_layer/${id}.md`;
  const composition = {
    composition_id: id,
    pack: packName,
    display_name: packManifest.display_name || packName,
    task_id: taskId,
    context_pack_id: contextPackId || null,
    selected_prompt: selectedPrompt,
    common_layer_version: commonManifest.version || "",
    common_files: commonSections.map((item) => item.file),
    common_policy_gates: commonManifest.policy_gates || [],
    traceability_outputs: commonManifest.traceability_outputs || [],
    compact_guidance: compactGuidance,
    output_path: outputPath,
    allowed_files: context ? context.allowed_files || [] : parseCsv(flags["allowed-files"]),
    forbidden_files: context ? context.forbidden_files || [] : parseCsv(flags["forbidden-files"] || ".env,secrets/,.git/"),
    acceptance_criteria: taskItem ? taskItem.acceptance_criteria || [] : [],
    estimated_tokens: estimatePromptCompositionTokens(commonSections, stackPrompt, context, taskItem),
    created_at: new Date().toISOString()
  };
  const outputFile = path.resolve(repoRoot(), outputPath);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, buildComposedPromptMarkdown(composition, commonSections, stackPrompt, taskItem, context), "utf8");
  idData.compositions.push(composition);
  writeJsonFile(".kabeeri/prompt_layer/compositions.json", idData);
  console.log(JSON.stringify(composition, null, 2));
  return composition;
}

function ensurePromptLayerState() {
  if (fileExists(".kabeeri")) {
    fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "prompt_layer"), { recursive: true });
    if (!fileExists(".kabeeri/prompt_layer/compositions.json")) writeJsonFile(".kabeeri/prompt_layer/compositions.json", { compositions: [] });
  }
}

function getTaskById(taskId) {
  if (!taskId || !fileExists(".kabeeri/tasks.json")) return null;
  const data = readJsonFile(".kabeeri/tasks.json");
  return (data.tasks || []).find((task) => task.id === taskId) || null;
}

function selectPromptFileForTask(manifest, taskItem) {
  const files = manifest.files || [];
  const title = buildPromptSelectionText(taskItem);
  let bestRule = null;
  for (const rule of manifest.prompt_selection_keywords || []) {
    const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
    if (!rule.file || !files.includes(rule.file)) continue;
    const score = keywords.reduce((sum, keyword) => sum + (promptKeywordMatches(title, keyword) ? 1 : 0), 0);
    if (score > 0 && (!bestRule || score > bestRule.score)) bestRule = { file: rule.file, score };
  }
  if (bestRule) return bestRule.file;
  const candidates = [
    [["test", "qa", "review", "verify"], /test|review/i],
    [["permission", "notification", "camera", "location", "media", "device", "push"], /permission|notification|device/i],
    [["offline", "cache", "storage", "local"], /offline|storage|cache/i],
    [["auth", "user", "login", "permission", "role"], /auth|user|role|permission/i],
    [["form", "validation"], /form|validation/i],
    [["env", "config", "secret", "api url", "base url"], /env|config|api/i],
    [["route", "routing", "layout", "page"], /routing|layout|page/i],
    [["component", "design", "ui", "frontend"], /component|design|ui/i],
    [["api", "data", "fetch", "http", "controller"], /api|data|http|controller|route/i],
    [["release", "handoff"], /release|handoff/i]
  ];
  for (const [keywords, filePattern] of candidates) {
    if (keywords.some((keyword) => promptKeywordMatches(title, keyword))) {
      const found = files.find((file) => filePattern.test(file) && file.endsWith(".md"));
      if (found) return found;
    }
  }
  return files.find((file) => /^01_.*\.md$/.test(file)) || files.find((file) => file.endsWith(".md") && !file.includes("README")) || "README.md";
}

function buildPromptSelectionText(taskItem) {
  if (!taskItem) return "";
  return [
    taskItem.title,
    taskItem.type,
    taskItem.workstream,
    ...(Array.isArray(taskItem.workstreams) ? taskItem.workstreams : []),
    taskItem.description,
    taskItem.notes,
    ...(Array.isArray(taskItem.acceptance_criteria) ? taskItem.acceptance_criteria : [])
  ].filter(Boolean).join(" ").toLowerCase().replace(/\s+/g, " ").trim();
}

function promptKeywordMatches(text, keyword) {
  const value = String(keyword || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!value) return false;
  const escaped = value.split(" ").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function estimatePromptCompositionTokens(commonSections, stackPrompt, context, taskItem) {
  const chars = commonSections.reduce((sum, item) => sum + item.content.length, 0)
    + stackPrompt.length
    + JSON.stringify(context || {}).length
    + JSON.stringify(taskItem || {}).length;
  return Math.ceil(chars / 4);
}

function buildComposedPromptMarkdown(composition, commonSections, stackPrompt, taskItem, context) {
  return `# Composed Kabeeri Prompt - ${composition.composition_id}

Pack: ${composition.display_name}
Task: ${composition.task_id || "manual"}
Context pack: ${composition.context_pack_id || "none"}
Selected stack prompt: ${composition.selected_prompt}

## Execution Contract

- Work only on the task described below.
- Use the allowed files and forbidden files as hard scope boundaries.
- Follow the common prompt layer before the stack-specific prompt.
- Treat common policy gates as blockers when the task touches those areas.
- Preserve traceability through task evidence, AI run history, ADRs, captures, and handoff notes when relevant.
- Record AI run history after execution with \`kvdf ai-run record\`.
- If the output is useful, review it with \`kvdf ai-run accept\`; otherwise use \`kvdf ai-run reject\`.

## Task

${taskItem ? `Title: ${taskItem.title}
Status: ${taskItem.status}
Workstreams: ${taskWorkstreams(taskItem).join(", ")}
Source: ${taskItem.source || ""}
Acceptance:
${(taskItem.acceptance_criteria || []).length ? taskItem.acceptance_criteria.map((item) => `- ${item}`).join("\n") : "- None listed."}` : "No task was attached. Use this only for planning or a manually reviewed action."}

## Scope

Allowed files:
${composition.allowed_files.length ? composition.allowed_files.map((item) => `- ${item}`).join("\n") : "- None listed. Ask before editing broad areas."}

Forbidden files:
${composition.forbidden_files.length ? composition.forbidden_files.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Common Governance Checklist

Policy gates:
${composition.common_policy_gates.length ? composition.common_policy_gates.map((item) => `- ${item}`).join("\n") : "- None declared by common layer."}

Traceability outputs:
${composition.traceability_outputs.length ? composition.traceability_outputs.map((item) => `- ${item}`).join("\n") : "- None declared by common layer."}

## Compact Guidance

${renderCompactPromptGuidance(composition.compact_guidance)}

## Context Pack

${context ? `Goal: ${context.goal || ""}
Required specs:
${(context.required_specs || []).length ? context.required_specs.map((item) => `- ${item}`).join("\n") : "- None listed."}

Open questions:
${(context.open_questions || []).length ? context.open_questions.map((item) => `- ${item}`).join("\n") : "- None recorded."}

Memory summary:
${context.memory_summary || "No memory summary."}

Compact Guidance:
${renderCompactGuidance(context.compact_guidance)}` : "No context pack attached."}

## Common Prompt Layer

${commonSections.map((section) => `### ${section.file}\n\n${section.content}`).join("\n\n")}

## Stack-specific Prompt

${stackPrompt}
`;
}

function renderCompactGuidance(compactGuidance) {
  if (!compactGuidance) return "- None recorded.";
  const lines = [
    `- Task kind: ${compactGuidance.task_kind || "unknown"}`,
    `- Execution mode: ${compactGuidance.execution_mode || "guided_first"}`,
    `- Recommended model class: ${compactGuidance.recommended_model_class || "balanced"}`,
    `- Routing reason: ${compactGuidance.routing_reason || "No routing reason recorded."}`,
    `- Token-saving hint: ${compactGuidance.token_saving_hint || ""}`
  ];
  if ((compactGuidance.key_acceptance_summary || []).length) {
    lines.push("- Key acceptance summary:");
    lines.push(...compactGuidance.key_acceptance_summary.map((item) => `  - ${item}`));
  }
  if ((compactGuidance.open_questions || []).length) {
    lines.push("- Open questions:");
    lines.push(...compactGuidance.open_questions.map((item) => `  - ${item}`));
  }
  if (compactGuidance.ui_decisions && compactGuidance.ui_decisions.pending_count) {
    lines.push(`- Pending UI decisions: ${compactGuidance.ui_decisions.pending_count}`);
    lines.push(...compactGuidance.ui_decisions.pending_titles.map((item) => `  - ${item}`));
  }
  if ((compactGuidance.next_actions || []).length) {
    lines.push("- Next actions:");
    lines.push(...compactGuidance.next_actions.map((item) => `  - ${item}`));
  }
  return lines.join("\n");
}

function buildPromptPackCompactGuidance({ packName, packManifest = {}, taskItem = null, selectedPrompt = "", context = null } = {}) {
  const contextCompact = context && context.compact_guidance ? context.compact_guidance : null;
  const taskKind = contextCompact && contextCompact.task_kind ? contextCompact.task_kind : inferPromptPackTaskKind(taskItem, packName, selectedPrompt);
  const executionMode = contextCompact && contextCompact.execution_mode
    ? contextCompact.execution_mode
    : inferPromptPackExecutionMode(taskItem, context);
  const recommendedModelClass = contextCompact && contextCompact.recommended_model_class ? contextCompact.recommended_model_class : inferPromptPackModelClass(taskKind, taskItem, context);
  const routingReason = contextCompact && contextCompact.routing_reason
    ? contextCompact.routing_reason
    : `Use the ${packManifest.display_name || packName} pack with only the selected prompt and the accepted task scope.`;
  const tokenSavingHint = contextCompact && contextCompact.token_saving_hint
    ? contextCompact.token_saving_hint
    : "Keep the prompt short by using one stack prompt, the common layer, and the task acceptance only.";
  const nextActions = uniqueList([
    `Compose the ${packName} pack with the selected prompt only.`,
    taskItem ? `Keep the response aligned to task ${taskItem.id}.` : null,
    context && context.context_pack_id ? `Prefer context pack ${context.context_pack_id} instead of rereading the repo.` : null,
    "Run the smallest relevant checks after the change."
  ]);
  return {
    task_kind: taskKind,
    pack_name: packName,
    selected_prompt: selectedPrompt || null,
    execution_mode: executionMode,
    recommended_model_class: recommendedModelClass,
    routing_reason: routingReason,
    token_saving_hint: tokenSavingHint,
    prompt_focus: taskItem ? taskItem.title || taskItem.id : packManifest.display_name || packName,
    next_actions: nextActions
  };
}

function renderCompactPromptGuidance(compactGuidance) {
  if (!compactGuidance) return "- None recorded.";
  const lines = [
    `- Pack: ${compactGuidance.pack_name || "unknown"}`,
    `- Task kind: ${compactGuidance.task_kind || "unknown"}`,
    `- Selected prompt: ${compactGuidance.selected_prompt || "manual"}`,
    `- Execution mode: ${compactGuidance.execution_mode || "guided_first"}`,
    `- Recommended model class: ${compactGuidance.recommended_model_class || "balanced"}`,
    `- Routing reason: ${compactGuidance.routing_reason || "No routing reason recorded."}`,
    `- Token-saving hint: ${compactGuidance.token_saving_hint || ""}`
  ];
  if (compactGuidance.prompt_focus) {
    lines.push(`- Prompt focus: ${compactGuidance.prompt_focus}`);
  }
  if ((compactGuidance.next_actions || []).length) {
    lines.push("- Next actions:");
    lines.push(...compactGuidance.next_actions.map((item) => `  - ${item}`));
  }
  return lines.join("\n");
}

function inferPromptPackTaskKind(taskItem, packName, selectedPrompt) {
  const text = [
    taskItem && taskItem.title,
    taskItem && taskItem.source,
    packName,
    selectedPrompt
  ].filter(Boolean).join(" ").toLowerCase();
  if (/(questionnaire|intake|onboarding|brief|start mode|project start|prompt pack)/.test(text)) return "project_start";
  if (/doc|spec|documentation/.test(text)) return "standard_docs_spec";
  if (/security|migration|release|publish/.test(text)) return "security_review";
  return "implementation";
}

function inferPromptPackExecutionMode(taskItem, context) {
  const allowedCount = context && Array.isArray(context.allowed_files) ? context.allowed_files.length : 0;
  return taskItem && allowedCount <= 4 ? "compact_first" : "guided_first";
}

function inferPromptPackModelClass(taskKind, taskItem, context) {
  if (context && context.compact_guidance && context.compact_guidance.recommended_model_class) {
    return context.compact_guidance.recommended_model_class;
  }
  if (taskKind === "project_start") return "cheap";
  if (taskKind === "security_review") return "premium";
  if (taskItem && Array.isArray(taskItem.acceptance_criteria) && taskItem.acceptance_criteria.length <= 2) return "cheap";
  return "balanced";
}

function parseCsv(value) {
  if (Array.isArray(value)) return value.flatMap(parseCsv);
  if (value === undefined || value === null) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

module.exports = {
  composePromptPack,
  ensurePromptLayerState,
  selectPromptFileForTask,
  buildPromptSelectionText,
  promptKeywordMatches,
  estimatePromptCompositionTokens,
  buildComposedPromptMarkdown
};
