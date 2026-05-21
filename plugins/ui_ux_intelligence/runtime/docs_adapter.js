const { recommendUiUx } = require("./recommender");
const { generateDesignSystem } = require("./design_system");

function generateDocsSections(input, options = {}) {
  const recommendation = recommendUiUx(input, options);
  const designSystem = generateDesignSystem(input, options);
  return {
    report_type: "ui_ux_intelligence_docs_sections",
    app: String(options.app || options.app_slug || ""),
    track: String(options.track || ""),
    target_docs: [
      "ui-ux/UI_UX_DESIGN.md",
      "ui-ux/UX_PRINCIPLES.md",
      "ui-ux/INFORMATION_ARCHITECTURE.md",
      "ui-ux/USER_FLOWS.md",
      "ui-ux/WIREFRAMES.md",
      "ui-ux/UI_SPECIFICATION.md",
      "ui-ux/ACCESSIBILITY.md"
    ],
    sections: [
      {
        doc_id: "ui_ux_design",
        title: "UI/UX Design",
        bullets: [
          `Product type: ${recommendation.detected_product_type}`,
          `Style direction: ${recommendation.recommended_style}`,
          `Palette mood: ${recommendation.recommended_palette_mood}`,
          `Typography mood: ${recommendation.recommended_typography_mood}`
        ]
      },
      {
        doc_id: "ux_principles",
        title: "UX Principles",
        bullets: recommendation.ux_rules.map((rule) => `Apply ${rule.replace(/_/g, " ")}.`)
      },
      {
        doc_id: "information_architecture",
        title: "Information Architecture",
        bullets: designSystem.layout_patterns.map((pattern) => `Use ${pattern.replace(/_/g, " ")} where it reduces friction.`)
      },
      {
        doc_id: "user_flows",
        title: "User Flows",
        bullets: recommendation.recommended_components.slice(0, 5).map((component) => `Support ${component.replace(/_/g, " ")} in the primary flow.`)
      },
      {
        doc_id: "wireframes",
        title: "Wireframes",
        bullets: [
          "Sketch the smallest responsive version first.",
          "Keep the primary action visible in the first viewport."
        ]
      },
      {
        doc_id: "ui_specification",
        title: "UI Specification",
        bullets: [
          `Match the ${designSystem.style.label.toLowerCase()} style system.`,
          "Define spacing, states, and component behaviors explicitly."
        ]
      },
      {
        doc_id: "accessibility",
        title: "Accessibility",
        bullets: recommendation.accessibility_notes
      }
    ],
    next_action: "Merge these sections into the Viber docs pipeline."
  };
}

module.exports = {
  generateDocsSections
};
