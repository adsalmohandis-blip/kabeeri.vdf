const {
  ANTI_PATTERNS,
  LAYOUT_PATTERNS,
  UX_RULES,
  getPalette,
  getProductType,
  getStackProfile,
  getStyle,
  getTypography,
  normalizeText
} = require("./catalog");

function detectProductType(input, options = {}) {
  const explicit = String(options.product_type || options.productType || "").trim().toLowerCase();
  if (explicit) {
    const explicitProduct = getProductType(explicit);
    return explicitProduct ? explicitProduct.id : "saas";
  }
  const text = normalizeText(input);
  if (!text) return "saas";
  for (const product of [
    getProductType("booking"),
    getProductType("ecommerce"),
    getProductType("dashboard"),
    getProductType("marketplace"),
    getProductType("portfolio"),
    getProductType("blog"),
    getProductType("admin_panel"),
    getProductType("mobile_app"),
    getProductType("landing_page"),
    getProductType("saas")
  ]) {
    if (product.keywords.some((keyword) => text.includes(normalizeText(keyword)))) return product.id;
  }
  return "saas";
}

function recommendUiUx(input, options = {}) {
  const text = String(input || "").trim();
  const productType = detectProductType(text, options);
  const product = getProductType(productType);
  const stack = getStackProfile(String(options.stack || options.stack_profile || options.framework || "").trim().toLowerCase()) || null;
  const style = getStyle(resolveStyle(product, stack, options));
  const palette = getPalette(resolvePaletteMood(product, stack, options));
  const typography = getTypography(resolveTypographyMood(product, stack, options));
  const layoutPatterns = resolveLayoutPatterns(product, stack, options);
  const components = resolveComponents(product, stack, options);
  const uxRules = uniqueStrings([
    ...product.ux_rules,
    ...baseUxRulesForStack(stack),
    ...resolveExtraUxRules(product, options)
  ]);
  const antiPatterns = uniqueStrings([
    ...ANTI_PATTERNS,
    ...resolveAntiPatterns(product, options)
  ]);
  const accessibilityNotes = [
    "Use visible focus states for all actionable controls.",
    "Preserve keyboard navigation and clear labels.",
    "Keep contrast targets at least WCAG AA for normal text.",
    "Avoid color-only state signaling."
  ];
  const responsiveNotes = [
    "Start with a narrow viewport and ensure the primary action remains visible.",
    "Reflow grids into readable single-column stacks on mobile.",
    "Keep touch targets large enough for thumbs and avoid cramped controls."
  ];
  const confidence = options.confidence || inferConfidence(text, productType, stack);
  return {
    report_type: "ui_ux_intelligence_recommendation",
    input: text,
    detected_product_type: productType,
    recommended_style: style.id,
    recommended_palette_mood: palette.mood,
    recommended_typography_mood: typography.mood,
    recommended_layout_patterns: layoutPatterns.map((item) => item.id),
    recommended_components: components,
    ux_rules: uxRules,
    anti_patterns_to_avoid: antiPatterns,
    accessibility_notes: accessibilityNotes,
    responsive_notes: responsiveNotes,
    confidence,
    next_action: "Use this output in UI_UX_DESIGN.md and UI_SPECIFICATION.md."
  };
}

function inferConfidence(text, productType, stack) {
  const normalized = normalizeText(text);
  if (!normalized) return "low";
  if (stack) return "high";
  if (productType && productType !== "saas") return "high";
  if (normalized.split(/\s+/).length > 2) return "medium";
  return "low";
}

function resolveStyle(product, stack, options) {
  if (options.style) return options.style;
  if (stack && stack.family === "mobile") return "mobile_first";
  return product.style || "minimal";
}

function resolvePaletteMood(product, stack, options) {
  if (options.palette_mood) return options.palette_mood;
  if (stack && stack.family === "mobile") return "calm";
  return product.palette_mood || "trust";
}

function resolveTypographyMood(product, stack, options) {
  if (options.typography_mood) return options.typography_mood;
  if (stack && stack.family === "mobile") return "friendly";
  return product.typography_mood || "professional";
}

function resolveLayoutPatterns(product, stack, options) {
  const explicit = Array.isArray(options.layout_patterns) ? options.layout_patterns : [];
  const stackFocus = stack && Array.isArray(stack.ui_focus) ? stack.ui_focus : [];
  return uniqueStrings([...explicit, ...(product.layout_patterns || []), ...stackFocus])
    .map((id) => LAYOUT_PATTERNS.find((item) => item.id === id))
    .filter(Boolean);
}

function resolveComponents(product, stack, options) {
  const explicit = Array.isArray(options.components) ? options.components : [];
  const base = product.components || [];
  const stackComponents = stack ? buildStackComponents(stack) : [];
  return uniqueStrings([...explicit, ...base, ...stackComponents]);
}

function baseUxRulesForStack(stack) {
  if (!stack) return [];
  if (stack.family === "mobile") return ["mobile_responsiveness", "keyboard_accessibility"];
  return ["visible_focus_states", "clear_empty_states"];
}

function resolveExtraUxRules(product, options) {
  const text = normalizeText(options.goal || options.idea || options.input || "");
  const rules = [];
  if (text.includes("dashboard")) rules.push("clear_empty_states", "loading_states");
  if (text.includes("form")) rules.push("error_states", "keyboard_accessibility");
  if (text.includes("checkout")) rules.push("no_destructive_action_without_confirmation");
  if (text.includes("landing")) rules.push("no_hidden_primary_action");
  return rules;
}

function resolveAntiPatterns(product, options) {
  const text = normalizeText(options.goal || options.idea || options.input || "");
  const patterns = [];
  if (text.includes("dashboard")) patterns.push("dashboard without empty states");
  if (text.includes("form")) patterns.push("forms without validation messages");
  if (text.includes("checkout") || text.includes("booking")) patterns.push("modals for critical long workflows");
  if (text.includes("landing")) patterns.push("too many CTAs");
  return patterns;
}

function buildStackComponents(stack) {
  const stackComponents = {
    web: ["top_navigation", "breadcrumbs", "data_table"],
    mobile: ["bottom_navigation", "primary_cta", "sheet_panel"]
  };
  return stackComponents[stack.family] || [];
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  detectProductType,
  recommendUiUx
};
