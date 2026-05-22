const { recommendUiUx } = require("./recommender");
const { generateDesignSystem } = require("./design_system");
const { generateChecklist } = require("./checklist");

const TARGET_DOCS = [
  "docs/ui-ux/UI_UX_DESIGN.md",
  "docs/ui-ux/UX_PRINCIPLES.md",
  "docs/ui-ux/INFORMATION_ARCHITECTURE.md",
  "docs/ui-ux/USER_FLOWS.md",
  "docs/ui-ux/WIREFRAMES.md",
  "docs/ui-ux/UI_SPECIFICATION.md",
  "docs/ui-ux/ACCESSIBILITY.md",
  "docs/delivery/QA_CHECKLIST.md"
];

function generateDocsSections(input, options = {}) {
  const recommendation = resolveRecommendation(input, options);
  const designSystem = resolveDesignSystem(input, options, recommendation);
  const checklist = generateChecklist(input, { ...options, recommendation });
  const sections = mapSectionsToViberDocs([
    buildUiUxDesignSection(recommendation, designSystem),
    buildUxPrinciplesSection(recommendation, checklist.checklist),
    buildInformationArchitectureSection(recommendation),
    buildUserFlowsSection(recommendation),
    buildWireframesSection(recommendation),
    buildUiSpecificationSection(recommendation, designSystem),
    buildAccessibilitySection(checklist.checklist),
    buildQaChecklistSection(checklist, recommendation)
  ], String(options.app || options.app_slug || ""));

  return {
    report_type: "ui_ux_intelligence_docs_sections",
    input: String(input || ""),
    track: String(options.track || ""),
    app: String(options.app || options.app_slug || ""),
    target_docs: sections.map((section) => section.target_doc),
    sections,
    warnings: uniqueStrings([
      ...(recommendation.warnings || []),
      ...(designSystem.warnings || []),
      ...(checklist.warnings || [])
    ]),
    standalone: true,
    external_github_dependency: false,
    next_action: "Merge these sections into the Viber docs pipeline."
  };
}

function buildUiUxDesignSection(recommendation, designSystem) {
  const product = recommendation.detected_product_type_details || {};
  const style = designSystem.style || recommendation.recommended_style_details || {};
  const colors = designSystem.colors || {};
  const typography = designSystem.typography || {};
  const layoutSystem = designSystem.layout_system || {};
  return {
    target_doc: "docs/ui-ux/UI_UX_DESIGN.md",
    section_title: "UI/UX Design",
    content: [
      "# UI/UX Design",
      "",
      `- Product type: ${product.label || recommendation.detected_product_type || "SaaS"}`,
      `- Style direction: ${style.label || recommendation.recommended_style || "Modern SaaS"}`,
      `- Palette mood: ${colors.palette || recommendation.recommended_palette_mood || "trust"}`,
      `- Typography mood: ${typography.mood || recommendation.recommended_typography_mood || "professional"}`,
      "",
      "## Direction",
      ...bulletLines(recommendation.recommended_layout_patterns, "Use"),
      ...bulletLines(recommendation.recommended_components, "Include"),
      ...bulletLines(designSystem.motion_rules || [], "Motion"),
      "",
      "## Visual System",
      `- Primary color: ${colors.primary || "N/A"}`,
      `- Secondary color: ${colors.secondary || "N/A"}`,
      `- Background: ${colors.background || "N/A"}`,
      `- Surface: ${colors.surface || "N/A"}`,
      `- Text: ${colors.text || "N/A"}`,
      `- Accent: ${colors.accent || "N/A"}`,
      "",
      "## Layout Notes",
      ...bulletLines(layoutSystem.grid_guidance || [], "Grid"),
      ...bulletLines(layoutSystem.sidebar_guidance || [], "Sidebar"),
      ...bulletLines(layoutSystem.responsive_notes || [], "Responsive")
    ].filter(Boolean).join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "ui_ux_design",
    next_action: "Use this section as the visual direction anchor."
  };
}

function buildUxPrinciplesSection(recommendation, checklist = []) {
  const rules = Array.isArray(recommendation.ux_rules) ? recommendation.ux_rules : [];
  const relevantChecks = checklist.filter((item) => ["accessibility", "interaction", "content", "forms", "responsive"].includes(item.category));
  return {
    target_doc: "docs/ui-ux/UX_PRINCIPLES.md",
    section_title: "UX Principles",
    content: [
      "# UX Principles",
      "",
      "## Core Rules",
      ...bulletLines(rules, "Apply"),
      "",
      "## Non-Negotiables",
      ...bulletLines(relevantChecks.map((item) => `${item.title} (${item.severity})`), "Keep"),
      "",
      "## Product Bias",
      ...bulletLines(recommendation.anti_patterns_to_avoid || [], "Avoid")
    ].filter(Boolean).join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "ui_ux_design",
    next_action: "Turn these rules into implementation guardrails."
  };
}

function buildInformationArchitectureSection(recommendation) {
  const product = recommendation.detected_product_type_details || {};
  const layoutPatterns = Array.isArray(recommendation.recommended_layout_pattern_details) ? recommendation.recommended_layout_pattern_details : [];
  return {
    target_doc: "docs/ui-ux/INFORMATION_ARCHITECTURE.md",
    section_title: "Information Architecture",
    content: [
      "# Information Architecture",
      "",
      `- Primary user intent: ${product.label || recommendation.detected_product_type || "Core task completion"}`,
      `- Navigation bias: ${navigationLabel(product.id, recommendation.stack_guidance)}`,
      "",
      "## Information Hierarchy",
      ...bulletLines(layoutPatterns.map((pattern) => `${pattern.title}${pattern.purpose ? ` - ${pattern.purpose}` : ""}`), "Organize"),
      "",
      "## Section Order",
      ...bulletLines(resolveSectionOrder(product.id), "Place"),
      "",
      "## IA Rules",
      ...bulletLines(recommendation.ux_rules || [], "Preserve")
    ].filter(Boolean).join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "ui_ux_design",
    next_action: "Use this section to structure the screen hierarchy."
  };
}

function buildUserFlowsSection(recommendation) {
  const productId = recommendation.detected_product_type || "saas";
  return {
    target_doc: "docs/ui-ux/USER_FLOWS.md",
    section_title: "User Flows",
    content: [
      "# User Flows",
      "",
      "## Primary Flow",
      ...bulletLines(resolvePrimaryFlow(productId), "Step"),
      "",
      "## Recovery Flow",
      ...bulletLines(resolveRecoveryFlow(productId), "If"),
      "",
      "## Success Flow",
      ...bulletLines(resolveSuccessFlow(productId), "After")
    ].filter(Boolean).join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "ui_ux_design",
    next_action: "Validate that each flow has a matching UI state."
  };
}

function buildWireframesSection(recommendation) {
  const product = recommendation.detected_product_type_details || {};
  return {
    target_doc: "docs/ui-ux/WIREFRAMES.md",
    section_title: "Wireframes",
    content: [
      "# Wireframes",
      "",
      `- Start with the ${product.label || recommendation.detected_product_type || "core"} screen shape.`,
      "- Sketch the mobile version first and then widen the layout for tablet and desktop.",
      "- Keep the primary action inside the first viewport.",
      "",
      "## Wireframe Notes",
      ...bulletLines(resolveWireframeNotes(product.id), "Sketch"),
      "",
      "## State Coverage",
      "- Loading state",
      "- Empty state",
      "- Error state",
      "- Success state",
      "- Disabled state"
    ].join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "ui_ux_design",
    next_action: "Use these wireframes to guide the first implementation pass."
  };
}

function buildUiSpecificationSection(recommendation, designSystem) {
  const colors = designSystem.colors || {};
  const typography = designSystem.typography || {};
  const components = designSystem.component_guidance || {};
  return {
    target_doc: "docs/ui-ux/UI_SPECIFICATION.md",
    section_title: "UI Specification",
    content: [
      "# UI Specification",
      "",
      "## Color System",
      `- Primary: ${colors.primary || "N/A"}`,
      `- Secondary: ${colors.secondary || "N/A"}`,
      `- Background: ${colors.background || "N/A"}`,
      `- Surface: ${colors.surface || "N/A"}`,
      `- Text: ${colors.text || "N/A"}`,
      `- Accent: ${colors.accent || "N/A"}`,
      `- Rationale: ${colors.rationale || "Keep the interface readable and predictable."}`,
      "",
      "## Typography System",
      `- Heading font: ${typography.heading_font || "Inter"}`,
      `- Body font: ${typography.body_font || "Inter"}`,
      ...bulletLines(typography.hierarchy_notes || [], "Hierarchy"),
      ...bulletLines(typography.readability_notes || [], "Readability"),
      "",
      "## Component Guidance",
      ...bulletLines(components.common_components || [], "Use"),
      ...bulletLines(components.form_states || [], "Form state"),
      ...bulletLines(components.async_states || [], "Async state"),
      ...bulletLines(components.dashboard_guidance || [], "Dashboard"),
      ...bulletLines(components.error_state_guidance || [], "Error"),
      ...bulletLines(components.empty_state_guidance || [], "Empty")
    ].filter(Boolean).join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "handoff",
    next_action: "Use this section as the implementation contract."
  };
}

function buildAccessibilitySection(checklist = []) {
  const accessibilityChecks = checklist.filter((item) => item.category === "accessibility" || item.category === "motion");
  return {
    target_doc: "docs/ui-ux/ACCESSIBILITY.md",
    section_title: "Accessibility",
    content: [
      "# Accessibility",
      "",
      "## Required Checks",
      ...bulletLines(accessibilityChecks.map((item) => `${item.title} (${item.severity})`), "Verify"),
      "",
      "## Accessibility Rules",
      "- Visible focus states",
      "- Keyboard navigation",
      "- Color contrast",
      "- Semantic structure",
      "- Alt text and icon labels",
      "- Reduced motion support"
    ].join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "validation",
    next_action: "Validate accessibility in the browser and with keyboard navigation."
  };
}

function buildQaChecklistSection(checklistReport, recommendation) {
  return {
    target_doc: "docs/delivery/QA_CHECKLIST.md",
    section_title: "QA Checklist",
    content: [
      "# QA Checklist",
      "",
      `- Product type: ${recommendation.detected_product_type || "saas"}`,
      `- Style direction: ${recommendation.recommended_style || "modern_saas"}`,
      "",
      "## QA Items",
      ...bulletLines(checklistReport.checklist.map((item) => `${item.title} (${item.category}, ${item.severity})`), "Check"),
      "",
      "## Handoff Readiness",
      "- Responsive checks completed",
      "- Accessibility checks completed",
      "- Interaction states documented",
      "- Acceptance criteria linked",
      "- Owner review ready"
    ].join("\n"),
    source: "ui_ux_intelligence",
    applies_to_stage: "handoff",
    next_action: "Run QA against the published UI/UX docs and screens."
  };
}

function mapSectionsToViberDocs(sections, appSlug) {
  const normalizedApp = String(appSlug || "").trim();
  return (sections || []).map((section) => ({
    target_doc: section.target_doc,
    section_title: section.section_title,
    content: section.content,
    source: section.source || "ui_ux_intelligence",
    applies_to_stage: section.applies_to_stage || "ui_ux_design",
    next_action: section.next_action || "Merge this section into the Viber docs pipeline.",
    app_slug: normalizedApp || undefined
  }));
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function resolveDesignSystem(input, options = {}, recommendation) {
  if (options.designSystem && options.designSystem.report_type === "ui_ux_intelligence_design_system") {
    return options.designSystem;
  }
  return generateDesignSystem(input, { ...options, recommendation });
}

function bulletLines(values, prefix) {
  return uniqueStrings(values).map((value) => `- ${prefix} ${String(value).trim().replace(/_/g, " ")}`);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

function navigationLabel(productId, stackGuidance) {
  if ((stackGuidance || []).some((item) => item.family === "mobile")) return "Bottom navigation";
  if (productId === "dashboard" || productId === "admin_panel") return "Sidebar navigation";
  if (productId === "blog") return "Top navigation with content anchors";
  return "Top navigation";
}

function resolveSectionOrder(productId) {
  if (productId === "dashboard" || productId === "admin_panel") {
    return [
      "Overview summary",
      "Primary data surface",
      "Filters and search",
      "Detail and drill-down state",
      "Support and recovery state"
    ];
  }
  if (productId === "booking") {
    return [
      "Context and availability",
      "Slot selection",
      "Confirmation and reminder state",
      "Error recovery and cancellation"
    ];
  }
  if (productId === "ecommerce") {
    return [
      "Discovery and product browsing",
      "Product detail",
      "Cart and checkout",
      "Confirmation and support"
    ];
  }
  return [
    "Intro and value proposition",
    "Primary task surface",
    "Supporting information",
    "Recovery and help"
  ];
}

function resolvePrimaryFlow(productId) {
  if (productId === "booking") {
    return [
      "Enter availability or search for the right slot.",
      "Select a slot and confirm the booking details.",
      "Submit the booking and receive immediate confirmation."
    ];
  }
  if (productId === "ecommerce") {
    return [
      "Browse products and filter the list.",
      "Open the product detail and add it to the cart.",
      "Review totals, shipping, and checkout confirmation."
    ];
  }
  if (productId === "dashboard" || productId === "admin_panel") {
    return [
      "Open the dashboard overview.",
      "Filter or drill into the data surface.",
      "Inspect details or export the result."
    ];
  }
  return [
    "Land on the primary screen.",
    "Identify the main task.",
    "Complete the task and confirm success."
  ];
}

function resolveRecoveryFlow(productId) {
  if (productId === "booking" || productId === "ecommerce") {
    return [
      "If validation fails, preserve the entered input.",
      "If the user backs out, keep the previous state visible.",
      "If a step fails, offer a simple retry path."
    ];
  }
  return [
    "If data is missing, show a clear empty state.",
    "If an operation fails, keep the user in context.",
    "If navigation changes, preserve the working state where possible."
  ];
}

function resolveSuccessFlow(productId) {
  if (productId === "booking") {
    return [
      "Show booking confirmation immediately.",
      "Provide reminder or follow-up details.",
      "Offer an easy path to edit or cancel."
    ];
  }
  if (productId === "ecommerce") {
    return [
      "Show order confirmation and receipt details.",
      "Surface tracking or next-step information.",
      "Offer support, refund, or return help if needed."
    ];
  }
  return [
    "Confirm completion clearly.",
    "Explain what happens next.",
    "Keep the next action visible."
  ];
}

function resolveWireframeNotes(productId) {
  if (productId === "dashboard" || productId === "admin_panel") {
    return [
      "Use a top-level summary row.",
      "Reserve a side rail for filters and secondary actions.",
      "Keep the table or chart region readable before adding polish."
    ];
  }
  if (productId === "booking") {
    return [
      "Treat calendar and slot selection as the core interaction.",
      "Keep confirmation visible after selection.",
      "Show recovery actions near the booking controls."
    ];
  }
  if (productId === "ecommerce") {
    return [
      "Use a product grid on the discovery surface.",
      "Keep the cart summary visible at the right time.",
      "Place checkout and support actions together."
    ];
  }
  return [
    "Keep the wireframe minimal.",
    "Start with the most important task and the supporting state.",
    "Avoid extra chrome until the flow is proven."
  ];
}

module.exports = {
  TARGET_DOCS,
  generateDocsSections,
  buildUiUxDesignSection,
  buildUxPrinciplesSection,
  buildInformationArchitectureSection,
  buildUserFlowsSection,
  buildWireframesSection,
  buildUiSpecificationSection,
  buildAccessibilitySection,
  mapSectionsToViberDocs
};
