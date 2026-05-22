const { generateDesignSystem } = require("./design_system");
const { recommendUiUx } = require("./recommender");

function generateComponentBlueprint(input, options = {}) {
  const recommendation = resolveRecommendation(input, options);
  const designSystem = options.designSystem && options.designSystem.report_type === "ui_ux_intelligence_design_system"
    ? options.designSystem
    : generateDesignSystem(input, { ...options, recommendation });
  const components = inferComponentSet(recommendation, designSystem, options).map((component) => ({
    ...component,
    states: buildComponentStates(component, options),
    accessibility: buildComponentAccessibility(component, options),
    acceptance_criteria: buildComponentAcceptanceCriteria(component, options)
  }));
  return {
    report_type: "ui_ux_intelligence_component_blueprint",
    input: String(input || ""),
    components,
    recommended_order: components.map((component) => component.component_id),
    standalone: true,
    external_github_dependency: false,
    next_action: "Use this blueprint in UI_SPECIFICATION.md and Task Punches."
  };
}

function inferComponentSet(recommendation, designSystem, options = {}) {
  const productId = recommendation && recommendation.detected_product_type_details ? recommendation.detected_product_type_details.id : "saas";
  const base = [
    createComponent("layout-shell", "Layout Shell", "Provide the page frame, spacing, and responsive chrome.", "layout"),
    createComponent("navigation-primary", "Primary Navigation", "Move between the key areas of the app.", "navigation"),
    createComponent("primary-cta", "Primary CTA", "Lead the user to the main action.", "system"),
    createComponent("form-controls", "Form Controls", "Capture user input safely and clearly.", "form"),
    createComponent("state-feedback", "State Feedback", "Explain loading, empty, error, and success states.", "feedback")
  ];

  if (productId === "dashboard" || productId === "admin_panel") {
    base.push(
      createComponent("dashboard-widgets", "Dashboard Widgets", "Summarize metrics and trends at a glance.", "dashboard"),
      createComponent("data-table", "Data Table", "Present dense records with sorting and filtering.", "data_display")
    );
  }
  if (productId === "ecommerce") {
    base.push(
      createComponent("product-card", "Product Card", "Show a product in a scannable list or grid.", "commerce"),
      createComponent("cart-summary", "Cart Summary", "Keep order totals, shipping, and taxes visible.", "commerce"),
      createComponent("checkout-form", "Checkout Form", "Collect payment and shipping information.", "form")
    );
  }
  if (productId === "booking") {
    base.push(
      createComponent("booking-calendar", "Booking Calendar", "Show availability and time slots clearly.", "system"),
      createComponent("time-slot-picker", "Time Slot Picker", "Pick an available appointment slot.", "form"),
      createComponent("booking-confirmation", "Booking Confirmation", "Confirm the selected slot and next step.", "feedback")
    );
  }
  if (productId === "saas") {
    base.push(
      createComponent("auth-form", "Auth Form", "Support login, signup, or onboarding entry.", "auth"),
      createComponent("onboarding-stepper", "Onboarding Stepper", "Show progress through setup or activation.", "system")
    );
  }
  if (productId === "blog") {
    base.push(
      createComponent("article-card", "Article Card", "Highlight content previews in lists and feeds.", "content"),
      createComponent("search-filter", "Search and Filter", "Help users find content quickly.", "system")
    );
  }

  if ((recommendation.recommended_components || []).some((item) => /modal|drawer/i.test(String(item)))) {
    base.push(createComponent("modal-drawer", "Modal / Drawer", "Support focused sub-flows without leaving context.", "system"));
  }
  return uniqueById(base);
}

function buildComponentStates(component, options = {}) {
  const category = String(component.category || "").toLowerCase();
  const states = ["default", "hover", "focus", "disabled", "loading", "error", "success"];
  if (category === "data_display" || category === "dashboard" || category === "commerce") {
    states.push("empty");
  }
  return uniqueStrings(states);
}

function buildComponentAccessibility(component, options = {}) {
  const hints = [
    "Expose a clear accessible name.",
    "Keep keyboard focus visible.",
    "Avoid color-only state changes."
  ];
  if (component.category === "form") hints.push("Link labels, helper text, and validation messages.");
  if (component.category === "data_display" || component.category === "dashboard") hints.push("Provide a text summary for dense or chart-like content.");
  if (component.category === "commerce") hints.push("Keep pricing and totals readable without color alone.");
  return uniqueStrings(hints);
}

function buildComponentAcceptanceCriteria(component, options = {}) {
  const criteria = [
    "The component has a documented default state and at least one failure or empty state.",
    "The component works on mobile and desktop without horizontal overflow.",
    "The component can be used with keyboard navigation.",
    "The component can be understood without relying on color alone."
  ];
  if (component.category === "form") criteria.push("Validation messages are visible and actionable.");
  if (component.category === "commerce") criteria.push("Price, cart, or checkout details remain visible and clear.");
  if (component.category === "dashboard") criteria.push("The data summary is readable at a glance.");
  return uniqueStrings(criteria);
}

function createComponent(componentId, name, purpose, category) {
  return {
    component_id: componentId,
    name,
    purpose,
    category: normalizeCategory(category),
    props_or_inputs: [],
    responsive_behavior: [],
    anti_patterns: []
  };
}

function normalizeCategory(category) {
  const value = String(category || "").trim().toLowerCase();
  if (["navigation", "layout", "form", "feedback", "data_display", "commerce", "dashboard", "content", "auth", "system"].includes(value)) {
    return value;
  }
  return "system";
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || !item.component_id || seen.has(item.component_id)) return false;
    seen.add(item.component_id);
    return true;
  });
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  generateComponentBlueprint,
  inferComponentSet,
  buildComponentStates,
  buildComponentAccessibility,
  buildComponentAcceptanceCriteria
};
