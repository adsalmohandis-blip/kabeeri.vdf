const { recommendUiUx } = require("./recommender");
const { generateDesignSystem } = require("./design_system");
const { generateComponentBlueprint } = require("./components");
const { generateScreenBlueprint } = require("./screens");
const { generateUiUxHandoffPack } = require("./handoff_pack");
const { buildUiPatternLibrary } = require("./pattern_library");
const { buildImplementationGuidance } = require("./implementation_guidance");

function buildUiUxPromptPack(input, options = {}) {
  const executor = normalizeExecutor(options.executor || options.role || "codex");
  const recommendation = resolveRecommendation(input, options);
  const designSystem = options.designSystem && options.designSystem.report_type === "ui_ux_intelligence_design_system"
    ? options.designSystem
    : generateDesignSystem(input, { ...options, recommendation });
  const componentBlueprint = options.componentBlueprint && options.componentBlueprint.report_type === "ui_ux_intelligence_component_blueprint"
    ? options.componentBlueprint
    : generateComponentBlueprint(input, { ...options, recommendation, designSystem });
  const screenBlueprint = options.screenBlueprint && options.screenBlueprint.report_type === "ui_ux_intelligence_screen_blueprint"
    ? options.screenBlueprint
    : generateScreenBlueprint(input, { ...options, recommendation, components: componentBlueprint });
  const handoffPack = options.handoffPack && options.handoffPack.report_type === "ui_ux_intelligence_handoff_pack"
    ? options.handoffPack
    : generateUiUxHandoffPack(input, { ...options, recommendation, designSystem, componentBlueprint, screenBlueprint });
  const patternLibrary = options.patternLibrary && options.patternLibrary.report_type === "ui_ux_intelligence_pattern_library"
    ? options.patternLibrary
    : buildUiPatternLibrary(input, { ...options, recommendation, componentBlueprint, screenBlueprint });
  const implementationGuidance = options.implementationGuidance && options.implementationGuidance.report_type === "ui_ux_intelligence_implementation_guidance"
    ? options.implementationGuidance
    : buildImplementationGuidance(input, { ...options, recommendation, designSystem, componentBlueprint, screenBlueprint, patternLibrary });
  const prompts = [
    buildCodexUiImplementationPrompt(input, {
      ...options,
      executor,
      recommendation,
      designSystem,
      componentBlueprint,
      screenBlueprint,
      handoffPack,
      patternLibrary,
      implementationGuidance
    }),
    buildUiReviewPrompt(input, {
      ...options,
      executor,
      recommendation,
      designSystem,
      componentBlueprint,
      screenBlueprint,
      handoffPack,
      patternLibrary,
      implementationGuidance
    }),
    buildUiFixPrompt(input, {
      ...options,
      executor,
      recommendation,
      designSystem,
      componentBlueprint,
      screenBlueprint,
      handoffPack,
      patternLibrary,
      implementationGuidance
    })
  ];
  return {
    report_type: "ui_ux_intelligence_prompt_pack",
    input: String(input || ""),
    executor,
    prompts,
    constraints: buildPromptConstraints({ recommendation, handoffPack, implementationGuidance }),
    validation_commands: buildValidationCommands(options),
    warnings: uniqueStrings([
      ...(recommendation.warnings || []),
      ...(implementationGuidance.warnings || []),
      ...(patternLibrary.warnings || [])
    ]),
    standalone: true,
    external_github_dependency: false,
    next_action: "Use this prompt pack during Viber UI implementation."
  };
}

function buildCodexUiImplementationPrompt(input, options = {}) {
  return buildPrompt({
    prompt_id: "codex-ui-implementation",
    title: "Codex UI Implementation Prompt",
    purpose: "Turn the UI/UX planning artifacts into a scoped implementation task.",
    input,
    options
  });
}

function buildUiReviewPrompt(input, options = {}) {
  return buildPrompt({
    prompt_id: "ui-review",
    title: "UI Review Prompt",
    purpose: "Review the UI spec and make sure the planned UI still matches the design and accessibility contract.",
    input,
    options,
    reviewMode: true
  });
}

function buildUiFixPrompt(input, options = {}) {
  return buildPrompt({
    prompt_id: "ui-fix",
    title: "UI Fix Prompt",
    purpose: "Fix the narrow UI slice without rewriting unrelated app areas.",
    input,
    options,
    fixMode: true
  });
}

function renderPromptPackMarkdown(promptPack, options = {}) {
  const lines = [
    "# UI/UX Prompt Pack",
    "",
    `- Input: ${promptPack.input || ""}`,
    `- Executor: ${promptPack.executor || "codex"}`,
    `- Standalone: ${promptPack.standalone ? "yes" : "no"}`,
    `- External GitHub dependency: ${promptPack.external_github_dependency ? "yes" : "no"}`,
    `- Next action: ${promptPack.next_action || "Use this prompt pack during Viber UI implementation."}`,
    "",
    "## Constraints",
    ...(Array.isArray(promptPack.constraints) && promptPack.constraints.length ? promptPack.constraints.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    ...(Array.isArray(promptPack.warnings) && promptPack.warnings.length ? promptPack.warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Validation Commands",
    ...(Array.isArray(promptPack.validation_commands) && promptPack.validation_commands.length ? promptPack.validation_commands.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Prompts",
    ...(Array.isArray(promptPack.prompts) ? promptPack.prompts.flatMap((prompt) => [
      `### ${prompt.title}`,
      "",
      `Purpose: ${prompt.purpose}`,
      "",
      "```text",
      prompt.prompt,
      "```",
      ""
    ]) : [])
  ];
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function buildPrompt({ prompt_id, title, purpose, input, options = {}, reviewMode = false, fixMode = false }) {
  const recommendation = resolveRecommendation(input, options);
  const designSystem = options.designSystem || generateDesignSystem(input, { ...options, recommendation });
  const componentBlueprint = options.componentBlueprint || generateComponentBlueprint(input, { ...options, recommendation, designSystem });
  const screenBlueprint = options.screenBlueprint || generateScreenBlueprint(input, { ...options, recommendation, components: componentBlueprint });
  const handoffPack = options.handoffPack || generateUiUxHandoffPack(input, { ...options, recommendation, designSystem, componentBlueprint, screenBlueprint });
  const patternLibrary = options.patternLibrary || buildUiPatternLibrary(input, { ...options, recommendation, componentBlueprint, screenBlueprint });
  const implementationGuidance = options.implementationGuidance || buildImplementationGuidance(input, { ...options, recommendation, designSystem, componentBlueprint, screenBlueprint, patternLibrary });
  const stack = String(options.stack || options.stack_name || "unknown").trim() || "unknown";
  const docs = Array.isArray(handoffPack.target_docs) ? handoffPack.target_docs : [];
  const tokens = designSystem.colors || designSystem.color_system || {};
  const tokenSummary = buildTokenSummary(designSystem);
  const componentSummary = buildComponentSummary(componentBlueprint);
  const screenSummary = buildScreenSummary(screenBlueprint);
  const states = uniqueStrings([
    ...collectStates(componentBlueprint),
    ...collectStates(screenBlueprint),
    "loading",
    "empty",
    "error",
    "success"
  ]);
  const accessibility = Array.isArray(implementationGuidance.guidance && implementationGuidance.guidance.accessibility_strategy)
    ? implementationGuidance.guidance.accessibility_strategy
    : [];
  const responsive = Array.isArray(implementationGuidance.guidance && implementationGuidance.guidance.responsive_strategy)
    ? implementationGuidance.guidance.responsive_strategy
    : [];
  const antiPatterns = uniqueStrings([
    ...(recommendation.anti_patterns_to_avoid || []),
    ...(implementationGuidance.guidance && implementationGuidance.guidance.anti_patterns_to_avoid ? implementationGuidance.guidance.anti_patterns_to_avoid : []),
    ...(patternLibrary.patterns || []).flatMap((pattern) => pattern.anti_patterns || [])
  ]);
  const promptLines = [
    `App idea: ${input || "UI implementation task"}`,
    `Target stack: ${stack}`,
    `Target docs: ${docs.join(", ") || "none yet"}`,
    `Design tokens summary: ${tokenSummary}`,
    `Component blueprint summary: ${componentSummary}`,
    `Screen blueprint summary: ${screenSummary}`,
    patternLibrary && Array.isArray(patternLibrary.recommended_order) && patternLibrary.recommended_order.length ? `Relevant patterns: ${patternLibrary.recommended_order.join(", ")}` : null,
    `UI states required: ${states.join(", ")}`,
    `Accessibility requirements: ${accessibility.join(" ")}`,
    `Responsive requirements: ${responsive.join(" ")}`,
    `Anti-patterns to avoid: ${antiPatterns.join("; ")}`,
    "Allowed behavior: keep the change scoped to the requested UI slice.",
    "Forbidden behavior: do not rewrite unrelated app areas, remove accessibility states, skip loading/error/empty states, or add external dependencies unless approved.",
    `Validation and handoff checklist: ${Array.isArray(handoffPack.checklist && handoffPack.checklist.checklist) ? "review the checklist, verify docs, and run validation commands" : "review the handoff pack, verify docs, and run validation commands"}.`,
    "Stop condition: stop once the targeted UI slice matches the blueprint, passes the validation checks, and is ready for the next task punch."
  ];
  if (reviewMode) {
    promptLines.unshift("Review mode: focus on contract drift, missing states, and accessibility regressions.");
  }
  if (fixMode) {
    promptLines.unshift("Fix mode: repair only the failing UI slice and preserve the approved plan.");
  }
  promptLines.push("", `Implementation guidance: ${implementationGuidance.task_punch_guidance.slice(0, 6).join(" ")}`);
  return {
    prompt_id,
    title,
    purpose,
    prompt: promptLines.join("\n")
  };
}

function buildPromptConstraints({ recommendation, handoffPack, implementationGuidance }) {
  const constraints = [
    "Do not generate production code outside the target UI slice.",
    "Do not change app source files unless the task punch explicitly allows it.",
    "Do not remove accessibility, loading, error, or empty states.",
    "Do not add external dependencies unless approved.",
    "Prompt packs are guidance only and do not execute code changes by themselves."
  ];
  if (recommendation && recommendation.standalone) constraints.push("Keep the guidance offline and deterministic.");
  if (handoffPack && handoffPack.target_docs) constraints.push("Keep the output aligned with the Viber docs pipeline.");
  if (implementationGuidance && implementationGuidance.stack && implementationGuidance.stack !== "unknown") constraints.push(`Respect the ${implementationGuidance.stack} implementation contract.`);
  return uniqueStrings(constraints);
}

function buildValidationCommands(options = {}) {
  return uniqueStrings([
    "node bin/kvdf.js validate",
    "npm test",
    "npm run check"
  ]);
}

function buildTokenSummary(designSystem) {
  const colors = designSystem.colors || designSystem.color_system || {};
  const typography = designSystem.typography || designSystem.typography_system || {};
  return [
    colors.primary ? `primary=${colors.primary}` : null,
    colors.background ? `background=${colors.background}` : null,
    typography.heading_font ? `heading=${typography.heading_font}` : null,
    typography.body_font ? `body=${typography.body_font}` : null
  ].filter(Boolean).join(", ") || "neutral tokens";
}

function buildComponentSummary(componentBlueprint) {
  const names = Array.isArray(componentBlueprint && componentBlueprint.components) ? componentBlueprint.components.slice(0, 5).map((component) => component.name).filter(Boolean) : [];
  return names.join(", ") || "layout shell, navigation, primary CTA";
}

function buildScreenSummary(screenBlueprint) {
  const names = Array.isArray(screenBlueprint && screenBlueprint.screens) ? screenBlueprint.screens.slice(0, 5).map((screen) => screen.name).filter(Boolean) : [];
  return names.join(", ") || "overview, detail, and flow screens";
}

function collectStates(blueprint) {
  const states = [];
  if (blueprint && Array.isArray(blueprint.components)) {
    for (const component of blueprint.components) {
      if (Array.isArray(component.states)) states.push(...component.states);
    }
  }
  if (blueprint && Array.isArray(blueprint.screens)) {
    for (const screen of blueprint.screens) {
      if (Array.isArray(screen.states)) states.push(...screen.states);
    }
  }
  return uniqueStrings(states);
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function normalizeExecutor(value) {
  const text = String(value || "codex").trim().toLowerCase();
  if (!text) return "codex";
  if (["codex", "cursor", "copilot", "claude", "manual"].includes(text)) return text;
  return "other";
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildUiUxPromptPack,
  buildCodexUiImplementationPrompt,
  buildUiReviewPrompt,
  buildUiFixPrompt,
  renderPromptPackMarkdown
};
