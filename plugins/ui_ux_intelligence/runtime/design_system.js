const { getPalette, getProductType, getStyle, getTypography } = require("./catalog");
const { recommendUiUx } = require("./recommender");

function generateDesignSystem(input, options = {}) {
  const recommendation = recommendUiUx(input, options);
  const product = getProductType(recommendation.detected_product_type);
  const style = getStyle(recommendation.recommended_style);
  const palette = getPalette(recommendation.recommended_palette_mood);
  const typography = getTypography(recommendation.recommended_typography_mood);
  return {
    report_type: "ui_ux_intelligence_design_system",
    input: String(input || ""),
    style: {
      id: style.id,
      label: style.label,
      description: style.description
    },
    colors: {
      mood: palette.mood,
      title: palette.title,
      ...palette.colors,
      semantic: {
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        info: "#2563eb"
      }
    },
    typography: {
      mood: typography.mood,
      title: typography.title,
      families: typography.families,
      scale: typography.scale
    },
    spacing: {
      base: 8,
      scale: [4, 8, 12, 16, 24, 32, 48]
    },
    components: recommendation.recommended_components,
    layout_patterns: recommendation.recommended_layout_patterns,
    motion_rules: buildMotionRules(product.id, style.id),
    accessibility: {
      contrast_target: "WCAG AA",
      focus_states: true,
      keyboard_accessibility: true,
      reduced_motion_support: true,
      labels_required: true
    },
    anti_patterns: recommendation.anti_patterns_to_avoid,
    pre_delivery_checklist: [
      "Palette contrast checked against background and surface states.",
      "Focus rings remain visible on every interactive control.",
      "Empty, loading, and error states are present for primary flows.",
      "Mobile layout is readable and navigable without hover.",
      "Critical actions are not hidden behind destructive patterns."
    ]
  };
}

function buildMotionRules(productId, styleId) {
  const rules = [
    "Use subtle, purposeful transitions for state changes.",
    "Keep motion short and predictable.",
    "Respect reduced-motion preferences."
  ];
  if (productId === "dashboard") rules.unshift("Avoid decorative motion in data-heavy views.");
  if (styleId === "ecommerce_conversion") rules.unshift("Animate cart feedback only when it supports clarity.");
  return rules;
}

module.exports = {
  generateDesignSystem
};
