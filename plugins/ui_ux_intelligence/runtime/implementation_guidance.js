const { recommendStackGuidance, recommendUiUx } = require("./recommender");
const { generateComponentBlueprint } = require("./components");
const { generateScreenBlueprint } = require("./screens");
const { generateDesignSystem } = require("./design_system");
const { buildUiPatternLibrary } = require("./pattern_library");

function buildImplementationGuidance(input, options = {}) {
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
  const patternLibrary = options.patternLibrary && options.patternLibrary.report_type === "ui_ux_intelligence_pattern_library"
    ? options.patternLibrary
    : buildUiPatternLibrary(input, { ...options, recommendation, componentBlueprint, screenBlueprint });
  const stack = resolveStackId(input, options, recommendation);
  const stackGuidance = buildStackGuidance(input, stack, {
    ...options,
    recommendation,
    designSystem,
    componentBlueprint,
    screenBlueprint,
    patternLibrary
  });
  const guidance = {
    component_strategy: buildComponentImplementationGuidance(componentBlueprint, { ...options, recommendation, designSystem, patternLibrary, stackGuidance }),
    screen_strategy: buildScreenImplementationGuidance(screenBlueprint, { ...options, recommendation, designSystem, patternLibrary, stackGuidance }),
    state_strategy: buildStateImplementationGuidance({ ...options, recommendation, componentBlueprint, screenBlueprint, patternLibrary }),
    accessibility_strategy: buildAccessibilityImplementationGuidance({ ...options, recommendation, componentBlueprint, screenBlueprint, patternLibrary }),
    responsive_strategy: buildResponsiveStrategy({ ...options, recommendation, componentBlueprint, screenBlueprint, patternLibrary }),
    testing_strategy: buildTestingImplementationGuidance({ ...options, recommendation, componentBlueprint, screenBlueprint, patternLibrary }),
    anti_patterns_to_avoid: buildAntiPatternsToAvoid({ recommendation, patternLibrary, componentBlueprint, screenBlueprint, stackGuidance })
  };
  return {
    report_type: "ui_ux_intelligence_implementation_guidance",
    input: String(input || ""),
    stack,
    guidance,
    task_punch_guidance: buildTaskPunchGuidance({ recommendation, designSystem, componentBlueprint, screenBlueprint, patternLibrary, stackGuidance }),
    warnings: uniqueStrings(stackGuidance.warnings || []),
    standalone: true,
    external_github_dependency: false,
    next_action: "Attach this guidance to the relevant Viber Task Punch."
  };
}

function buildStackGuidance(input, stack, options = {}) {
  const stackId = normalizeStack(stack || options.stack || options.stack_name || inferStackFromInput(input, options.recommendation));
  const stackResult = stackId ? recommendStackGuidance(input, { ...options, stack: stackId }) : { items: [], warnings: ["No stack guidance could be inferred."], inferred_stack: "", confidence: "low" };
  const item = Array.isArray(stackResult.items) && stackResult.items.length ? stackResult.items[0] : null;
  const guidance = [];
  const warnings = Array.isArray(stackResult.warnings) ? [...stackResult.warnings] : [];

  if (item) {
    guidance.push(`Use ${item.label || stackId} primitives and keep the implementation aligned with ${item.family || "the selected"} stack family.`);
    guidance.push(`Preserve ${Array.isArray(item.ui_focus) ? item.ui_focus.join(", ") : "the inferred UI focus"} in the primary surface.`);
    if (item.guidance && Array.isArray(item.guidance)) {
      guidance.push(...item.guidance);
    }
  } else if (stackId && stackId !== "unknown") {
    warnings.push(`No local stack guidance matched "${stackId}".`);
    guidance.push("Use framework-neutral implementation guidance until a stack profile is available.");
  } else {
    guidance.push("Use framework-neutral implementation guidance and keep the UI patterns stack-agnostic.");
  }

  return {
    stack: stackId || "unknown",
    items: guidance,
    warnings,
    confidence: stackResult.confidence || (stackId && stackId !== "unknown" ? "medium" : "low"),
    inferred_stack: stackResult.inferred_stack || stackId || ""
  };
}

function buildComponentImplementationGuidance(componentBlueprint, options = {}) {
  const components = Array.isArray(componentBlueprint && componentBlueprint.components) ? componentBlueprint.components : [];
  const primary = components.slice(0, 6).map((component) => `${component.name}: ${component.purpose}`);
  const guidance = [
    "Build the layout shell and navigation first so the rest of the surface has a stable frame.",
    ...primary.map((line) => `Implement ${line}.`),
    "Give every component explicit loading, empty, error, success, and disabled handling where relevant.",
    "Keep props and inputs narrowly scoped so the component can be reused across the Viber docs pipeline."
  ];
  if (options.stackGuidance && Array.isArray(options.stackGuidance.items) && options.stackGuidance.items.length) {
    guidance.unshift(...options.stackGuidance.items.slice(0, 2));
  }
  return uniqueStrings(guidance);
}

function buildScreenImplementationGuidance(screenBlueprint, options = {}) {
  const screens = Array.isArray(screenBlueprint && screenBlueprint.screens) ? screenBlueprint.screens : [];
  const names = screens.slice(0, 6).map((screen) => `${screen.name} (${screen.route_hint})`);
  const guidance = [
    "Implement screens in the same order as the user flow and information architecture.",
    ...names.map((line) => `Cover ${line}.`),
    "Keep section order, route hints, and screen states aligned with the blueprint.",
    "Do not collapse loading, empty, error, or success states into a single generic screen."
  ];
  return uniqueStrings(guidance);
}

function buildStateImplementationGuidance(options = {}) {
  const recommendation = options.recommendation || null;
  const states = [
    "loading",
    "empty",
    "error",
    "success"
  ];
  const guidance = [
    "Show a specific state for every user-visible transition.",
    `Cover ${states.join(", ")} states in the implementation plan.`,
    "Keep destructive, retry, and recovery flows separate from success confirmation.",
    recommendation && recommendation.detected_product_type_details && recommendation.detected_product_type_details.id === "dashboard"
      ? "Include no-data and filtered-empty states for dashboards."
      : "Preserve a clear recovery path when the UI encounters failure."
  ];
  return uniqueStrings(guidance);
}

function buildAccessibilityImplementationGuidance(options = {}) {
  const guidance = [
    "Use visible focus states on every actionable control.",
    "Preserve keyboard navigation order and semantic structure.",
    "Keep contrast strong enough for text, icons, and state indicators.",
    "Give icons, images, charts, and custom controls accessible names or text alternatives.",
    "Respect reduced-motion preferences and avoid motion that blocks task completion."
  ];
  if (options.patternLibrary && Array.isArray(options.patternLibrary.patterns)) {
    guidance.push("Apply the accessibility rules consistently across the selected patterns.");
  }
  return uniqueStrings(guidance);
}

function buildResponsiveStrategy(options = {}) {
  const guidance = [
    "Start from mobile constraints first, then scale to tablet and desktop.",
    "Keep primary actions reachable without horizontal scrolling.",
    "Reflow dense content into stacks, cards, or drawers on smaller screens.",
    "Keep touch targets large enough for reliable tapping."
  ];
  return uniqueStrings(guidance);
}

function buildTestingImplementationGuidance(options = {}) {
  const guidance = [
    "Cover the main happy path plus loading, empty, error, and success states.",
    "Check keyboard reachability and focus visibility on every control.",
    "Verify responsive behavior on mobile, tablet, and desktop widths.",
    "Verify that validation, recovery, and destructive-action confirmation states are preserved.",
    "Keep implementation tests scoped to the affected task punch."
  ];
  if (options.stack && options.stack !== "unknown") {
    guidance.push(`Run stack-specific checks for ${options.stack}.`);
  }
  return uniqueStrings(guidance);
}

function buildTaskPunchGuidance({ recommendation, designSystem, componentBlueprint, screenBlueprint, patternLibrary, stackGuidance }) {
  const lines = [
    `Detected product type: ${recommendation && recommendation.detected_product_type_details ? recommendation.detected_product_type_details.label : "unknown"}.`,
    recommendation && recommendation.recommended_style ? `Recommended style: ${recommendation.recommended_style}.` : null,
    recommendation && recommendation.recommended_palette ? `Recommended palette: ${recommendation.recommended_palette}.` : null,
    recommendation && recommendation.recommended_typography ? `Recommended typography: ${recommendation.recommended_typography}.` : null,
    patternLibrary && Array.isArray(patternLibrary.recommended_order) && patternLibrary.recommended_order.length ? `Relevant patterns: ${patternLibrary.recommended_order.slice(0, 4).join(", ")}.` : null,
    componentBlueprint && Array.isArray(componentBlueprint.components) && componentBlueprint.components.length ? `Key components: ${componentBlueprint.components.slice(0, 4).map((component) => component.name).join(", ")}.` : null,
    screenBlueprint && Array.isArray(screenBlueprint.screens) && screenBlueprint.screens.length ? `Key screens: ${screenBlueprint.screens.slice(0, 4).map((screen) => screen.name).join(", ")}.` : null,
    stackGuidance && Array.isArray(stackGuidance.items) && stackGuidance.items.length ? `Stack guidance: ${stackGuidance.items.slice(0, 3).join(" ")}` : null,
    "Implement only the UI slice named by the task punch.",
    "Do not rewrite unrelated app areas.",
    "Do not remove loading, empty, error, or accessibility states.",
    "Stop after the targeted UI change passes the validation checklist."
  ];
  return uniqueStrings(lines);
}

function buildAntiPatternsToAvoid({ recommendation, patternLibrary, componentBlueprint, screenBlueprint, stackGuidance }) {
  const items = [];
  if (recommendation && Array.isArray(recommendation.anti_patterns_to_avoid)) items.push(...recommendation.anti_patterns_to_avoid);
  if (patternLibrary && Array.isArray(patternLibrary.patterns)) {
    items.push(...patternLibrary.patterns.flatMap((pattern) => Array.isArray(pattern.anti_patterns) ? pattern.anti_patterns : []));
  }
  if (stackGuidance && Array.isArray(stackGuidance.warnings)) items.push(...stackGuidance.warnings);
  items.push("do not rewrite unrelated app areas");
  items.push("do not skip loading/error/empty states");
  items.push("do not remove accessibility states");
  return uniqueStrings(items);
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function resolveStackId(input, options, recommendation) {
  const explicit = normalizeStack(options.stack || options.stack_name || options.framework || "");
  if (explicit) return explicit;
  return inferStackFromInput(input, recommendation);
}

function inferStackFromInput(input, recommendation) {
  const text = normalizeStack([input, recommendation && recommendation.detected_product_type_details ? recommendation.detected_product_type_details.label : "", recommendation && recommendation.recommended_style ? recommendation.recommended_style : ""].filter(Boolean).join(" "));
  if (/react native|react-native|rn/.test(text)) return "react-native";
  if (/next/.test(text)) return "nextjs";
  if (/nuxt ui/.test(text)) return "nuxt-ui";
  if (/nuxt/.test(text)) return "nuxtjs";
  if (/vue/.test(text)) return "vue";
  if (/svelte/.test(text)) return "svelte";
  if (/angular/.test(text)) return "angular";
  if (/flutter/.test(text)) return "flutter";
  if (/swiftui/.test(text)) return "swiftui";
  if (/jetpack compose/.test(text)) return "jetpack-compose";
  if (/tailwind/.test(text)) return "html-tailwind";
  if (/shadcn/.test(text)) return "shadcn";
  if (/laravel/.test(text)) return "laravel";
  if (/three/.test(text)) return "threejs";
  if (/react/.test(text)) return "react";
  return "unknown";
}

function normalizeStack(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "unknown";
  if (["react", "nextjs", "vue", "nuxtjs", "nuxt-ui", "angular", "svelte", "astro", "flutter", "react-native", "swiftui", "jetpack-compose", "html-tailwind", "shadcn", "laravel", "threejs"].includes(text)) return text;
  if (text === "next") return "nextjs";
  if (text === "nuxt") return "nuxtjs";
  if (text === "react native") return "react-native";
  if (text === "jetpack compose") return "jetpack-compose";
  if (text === "html tailwind") return "html-tailwind";
  return text.replace(/\s+/g, "-");
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildImplementationGuidance,
  buildStackGuidance,
  buildComponentImplementationGuidance,
  buildScreenImplementationGuidance,
  buildStateImplementationGuidance,
  buildAccessibilityImplementationGuidance,
  buildTestingImplementationGuidance
};
