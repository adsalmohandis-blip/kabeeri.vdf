const { getPalette, getProductType, getStyle, getTypography } = require("./catalog");
const { recommendUiUx } = require("./recommender");

const FALLBACK_COLORS = {
  primary: "#1d4ed8",
  secondary: "#0f172a",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  accent: "#2563eb",
  border: "#dbe3ef"
};

function generateDesignSystem(input, options = {}) {
  const recommendation = resolveRecommendation(input, options);
  const productType = recommendation.detected_product_type_details || getProductType(recommendation.detected_product_type, { root: options.root, refresh: Boolean(options.refresh) });
  const style = recommendation.recommended_style_details || getStyle(recommendation.recommended_style, { root: options.root, refresh: Boolean(options.refresh) });
  const colors = buildColorSystem(recommendation);
  const typography = buildTypographySystem(recommendation);
  const layoutSystem = buildLayoutSystem(recommendation);
  const componentGuidance = buildComponentGuidance(recommendation);
  const motionRules = buildMotionRules(recommendation);
  const accessibility = buildAccessibilityGuidance(recommendation);
  const antiPatterns = uniqueStrings(recommendation.anti_patterns_to_avoid || []);
  const preDeliveryChecklist = buildPreDeliveryChecklist(recommendation);

  return {
    report_type: "ui_ux_intelligence_design_system",
    input: String(input || ""),
    product_type: productType,
    style,
    colors,
    typography,
    layout_patterns: [...(recommendation.recommended_layout_patterns || [])],
    layout_system: layoutSystem,
    components: componentGuidance.common_components,
    component_guidance: componentGuidance,
    motion_rules: motionRules,
    accessibility,
    anti_patterns: antiPatterns,
    pre_delivery_checklist: preDeliveryChecklist,
    warnings: uniqueStrings(recommendation.warnings || []),
    standalone: true,
    external_github_dependency: false,
    next_action: "Use this design system as the UI/UX foundation for Viber docs and implementation."
  };
}

function buildColorSystem(recommendation) {
  const palette = recommendation.recommended_palette_details || getPalette(recommendation.recommended_palette_mood || "trust", { root: recommendation.root });
  const colors = palette.colors || FALLBACK_COLORS;
  const product = recommendation.detected_product_type_details || recommendation.product_type || {};
  const rationale = buildColorRationale(product, palette);
  return {
    palette: palette.mood || recommendation.recommended_palette_mood || "trust",
    primary: colors.primary || FALLBACK_COLORS.primary,
    secondary: colors.secondary || FALLBACK_COLORS.secondary,
    background: colors.background || FALLBACK_COLORS.background,
    surface: colors.surface || FALLBACK_COLORS.surface,
    text: colors.text || FALLBACK_COLORS.text,
    accent: colors.accent || colors.primary || FALLBACK_COLORS.accent,
    border: colors.border || FALLBACK_COLORS.border,
    rationale,
    semantic: {
      success: "#16a34a",
      warning: "#f59e0b",
      danger: "#dc2626",
      info: "#2563eb"
    }
  };
}

function buildTypographySystem(recommendation) {
  const typography = recommendation.recommended_typography_details || getTypography(recommendation.recommended_typography_mood || "professional", { root: recommendation.root });
  const families = typography.families || { heading: ["Inter"], body: ["Inter"] };
  const heading = firstValue(families.heading, "Inter");
  const body = firstValue(families.body, "Inter");
  return {
    mood: typography.mood || recommendation.recommended_typography_mood || "professional",
    heading_font: heading,
    body_font: body,
    families,
    scale: typography.scale || defaultScale(),
    hierarchy_notes: [
      "Keep headings short and scannable.",
      "Use a clear visual jump between heading levels.",
      "Limit long paragraphs to preserve scanning speed."
    ],
    readability_notes: [
      "Maintain line lengths that support quick scanning.",
      "Use medium weight body copy with generous line height.",
      "Avoid tiny labels when the product is data or task dense."
    ]
  };
}

function buildLayoutSystem(recommendation) {
  const patterns = Array.isArray(recommendation.recommended_layout_pattern_details) ? recommendation.recommended_layout_pattern_details : [];
  const primaryPattern = patterns[0] || {
    id: recommendation.recommended_layout_patterns && recommendation.recommended_layout_patterns[0] ? recommendation.recommended_layout_patterns[0] : "hero_features_cta",
    title: "Hero + Features + CTA",
    purpose: "Default conversion-friendly landing composition."
  };
  const productType = recommendation.detected_product_type_details || {};
  const navPattern = resolveNavigationPattern(productType, recommendation);
  return {
    primary_pattern: primaryPattern,
    navigation_pattern: navPattern,
    grid_guidance: buildGridGuidance(productType, recommendation),
    sidebar_guidance: buildSidebarGuidance(productType, recommendation),
    responsive_notes: [
      "Start with the mobile layout and expand into denser desktop surfaces.",
      "Keep the first viewport focused on the primary action or overview.",
      "Stack cards vertically before introducing horizontal complexity."
    ]
  };
}

function buildComponentGuidance(recommendation) {
  const productType = recommendation.detected_product_type_details || {};
  const components = uniqueStrings(recommendation.recommended_components || []);
  const dataSurface = needsDataSurfaceGuidance(productType, recommendation);
  return {
    common_components: components,
    form_states: [
      "default",
      "focused",
      "valid",
      "invalid",
      "disabled"
    ],
    async_states: [
      "loading",
      "empty",
      "error",
      "success"
    ],
    empty_state_guidance: [
      "Explain what the user can do next.",
      "Keep empty states visually calm but action-oriented."
    ],
    error_state_guidance: [
      "Describe the problem in plain language.",
      "Provide a recovery action when possible."
    ],
    data_surface_guidance: dataSurface ? [
      "Add charts and summary cards when the product needs quick state awareness.",
      "Keep table headers and filters visible in dense views."
    ] : [
      "Use content surfaces that support direct task completion."
    ],
    dashboard_guidance: dataSurface ? [
      "Use cards, tables, and chart summaries in a clear hierarchy.",
      "Keep filters and date ranges near the title or page header."
    ] : [],
    notes: [
      "Prefer reusable components with explicit states.",
      "Keep primary flows short and observable."
    ]
  };
}

function buildMotionRules(recommendation) {
  const productType = recommendation.detected_product_type_details || {};
  const rules = [
    "Use subtle, purposeful transitions for state changes.",
    "Keep motion short and predictable.",
    "Respect reduced-motion preferences."
  ];
  if (productType.id === "dashboard" || productType.id === "admin_panel") {
    rules.unshift("Avoid decorative motion in data-heavy views.");
  }
  if ((recommendation.stack_guidance || []).some((item) => item.family === "mobile")) {
    rules.push("Keep touch feedback crisp and lightweight.");
  }
  if (productType.id === "ecommerce") {
    rules.push("Animate cart feedback only when it clarifies the interaction.");
  }
  return uniqueStrings(rules);
}

function buildAccessibilityGuidance(recommendation) {
  const productType = recommendation.detected_product_type_details || {};
  const chartSensitive = (recommendation.chart_recommendations || []).length > 0 || productType.id === "dashboard" || productType.id === "admin_panel";
  return {
    contrast: "WCAG AA contrast for text and critical surfaces.",
    focus_states: "Visible focus states on all interactive controls.",
    keyboard_navigation: "Every primary task can be completed with keyboard input.",
    semantic_structure: "Use headings, landmarks, and labels that describe the actual content.",
    mobile_tap_targets: "Keep touch targets at least 44x44px.",
    chart_accessibility: chartSensitive
      ? "Label charts, provide legends, and ensure data summaries are readable without color."
      : "Use accessible labels on all icon-only or compact controls.",
    notes: [
      "Avoid color-only state signaling.",
      "Write errors so the user knows what happened and how to recover.",
      "Keep focus order predictable and visible."
    ]
  };
}

function buildPreDeliveryChecklist(recommendation) {
  const checklist = [
    "Confirm responsive behavior on mobile, tablet, and desktop widths.",
    "Check contrast, focus, and keyboard navigation on all interactive controls.",
    "Verify loading, empty, error, and success states for the main flow.",
    "Confirm that the primary call to action is obvious in the first viewport.",
    "Validate that component states are documented for handoff."
  ];
  if ((recommendation.chart_recommendations || []).length > 0) {
    checklist.push("Verify chart labels, legends, and accessible summaries.");
  }
  if ((recommendation.stack_guidance || []).some((item) => item.family === "mobile")) {
    checklist.push("Validate tap targets, bottom navigation, and mobile-safe spacing.");
  }
  if ((recommendation.recommended_components || []).some((component) => /table|card|chart/.test(component))) {
    checklist.push("Check dense data surfaces for readable headers and clear empty states.");
  }
  return uniqueStrings(checklist);
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function resolveNavigationPattern(productType, recommendation) {
  if ((recommendation.stack_guidance || []).some((item) => item.family === "mobile")) {
    return "bottom_navigation";
  }
  if (productType.id === "dashboard" || productType.id === "admin_panel") {
    return "sidebar_navigation";
  }
  if (productType.id === "blog") {
    return "top_navigation_with_table_of_contents";
  }
  return "top_navigation";
}

function buildGridGuidance(productType, recommendation) {
  const guidance = [];
  if (productType.id === "dashboard" || productType.id === "admin_panel") {
    guidance.push("Use a dense but breathable card and table grid.");
  } else if (productType.id === "ecommerce" || productType.id === "marketplace") {
    guidance.push("Use a product grid that makes browsing and filtering easy.");
  } else {
    guidance.push("Use a simple responsive grid with consistent spacing.");
  }
  if ((recommendation.stack_guidance || []).some((item) => item.family === "mobile")) {
    guidance.push("Collapse into a single-column mobile flow before expanding on desktop.");
  }
  return uniqueStrings(guidance);
}

function buildSidebarGuidance(productType, recommendation) {
  const guidance = [];
  if (productType.id === "dashboard" || productType.id === "admin_panel") {
    guidance.push("Keep filters and navigation close to the data surface.");
  }
  if ((recommendation.recommended_components || []).some((component) => /sidebar|filter/.test(component))) {
    guidance.push("Use a collapsible sidebar only when the content density justifies it.");
  }
  return uniqueStrings(guidance);
}

function needsDataSurfaceGuidance(productType, recommendation) {
  return Boolean(
    productType.id === "dashboard" ||
    productType.id === "admin_panel" ||
    (recommendation.chart_recommendations || []).length > 0 ||
    (recommendation.recommended_components || []).some((component) => /table|chart|metrics/.test(component))
  );
}

function buildColorRationale(product, palette) {
  const parts = [];
  if (product && product.label) parts.push(`Matches the ${product.label} product shape.`);
  if (palette && palette.title) parts.push(`Uses the ${palette.title.toLowerCase()} palette direction.`);
  if (!parts.length) parts.push("Chosen to keep the interface readable and predictable.");
  return parts.join(" ");
}

function defaultScale() {
  return {
    display: "3.5rem",
    h1: "2.5rem",
    h2: "2rem",
    h3: "1.5rem",
    body: "1rem",
    small: "0.875rem"
  };
}

function firstValue(values, fallback) {
  if (Array.isArray(values) && values.length) return values[0];
  if (typeof values === "string" && values.trim()) return values;
  return fallback;
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  generateDesignSystem,
  buildColorSystem,
  buildTypographySystem,
  buildLayoutSystem,
  buildComponentGuidance,
  buildMotionRules,
  buildAccessibilityGuidance,
  buildPreDeliveryChecklist
};
