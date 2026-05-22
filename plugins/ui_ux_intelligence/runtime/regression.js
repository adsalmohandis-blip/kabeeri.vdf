const { generateScreenBlueprint } = require("./screens");
const { generateComponentBlueprint } = require("./components");
const { generateChecklist } = require("./checklist");
const { recommendUiUx } = require("./recommender");

function buildUiUxRegressionChecklist(input, options = {}) {
  const app = normalizeAppSlug(options.app || options.app_slug || options.appSlug || "");
  const recommendation = options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation"
    ? options.recommendation
    : recommendUiUx(input, options);
  const screenBlueprint = options.screenBlueprint && options.screenBlueprint.report_type === "ui_ux_intelligence_screen_blueprint"
    ? options.screenBlueprint
    : generateScreenBlueprint(input, { ...options, recommendation });
  const componentBlueprint = options.componentBlueprint && options.componentBlueprint.report_type === "ui_ux_intelligence_component_blueprint"
    ? options.componentBlueprint
    : generateComponentBlueprint(input, { ...options, recommendation });
  const checklist = options.checklist && options.checklist.report_type === "ui_ux_intelligence_checklist"
    ? options.checklist
    : generateChecklist(input, { ...options, recommendation });
  const items = [
    ...buildRegressionItemsFromScreens(screenBlueprint, options),
    ...buildRegressionItemsFromComponents(componentBlueprint, options),
    ...buildRegressionItemsFromStates({ ...options, recommendation, screenBlueprint, checklist })
  ];
  const summary = summarizeRegressionChecklist({ items }, options);
  return {
    report_type: "ui_ux_intelligence_regression_checklist",
    app: app || null,
    input: String(input || ""),
    items,
    summary,
    standalone: true,
    external_github_dependency: false,
    next_action: "Use the regression checklist to verify the UI slice before handoff."
  };
}

function buildRegressionItemsFromScreens(screens, options = {}) {
  const items = [];
  const screenList = Array.isArray(screens && screens.screens) ? screens.screens : [];
  for (const screen of screenList.slice(0, 10)) {
    items.push(createRegressionItem(`screen-${screen.screen_id || sanitizeToken(screen.name)}`, `Verify ${screen.name || screen.screen_id} renders its default state`, "screen", `Capture the default screen state for ${screen.name || screen.screen_id}.`));
    items.push(createRegressionItem(`screen-${screen.screen_id || sanitizeToken(screen.name)}-responsive`, `Verify ${screen.name || screen.screen_id} adapts responsively`, "responsive", `Capture mobile and desktop evidence for ${screen.name || screen.screen_id}.`));
    if (Array.isArray(screen.states) && screen.states.includes("loading")) {
      items.push(createRegressionItem(`screen-${screen.screen_id || sanitizeToken(screen.name)}-loading`, `Verify ${screen.name || screen.screen_id} loading state`, "state", `Capture loading evidence for ${screen.name || screen.screen_id}.`));
    }
    if (Array.isArray(screen.states) && screen.states.includes("empty")) {
      items.push(createRegressionItem(`screen-${screen.screen_id || sanitizeToken(screen.name)}-empty`, `Verify ${screen.name || screen.screen_id} empty state`, "state", `Capture empty-state evidence for ${screen.name || screen.screen_id}.`));
    }
    if (Array.isArray(screen.states) && screen.states.includes("error")) {
      items.push(createRegressionItem(`screen-${screen.screen_id || sanitizeToken(screen.name)}-error`, `Verify ${screen.name || screen.screen_id} error state`, "state", `Capture error-state evidence for ${screen.name || screen.screen_id}.`));
    }
  }
  return uniqueById(items);
}

function buildRegressionItemsFromComponents(components, options = {}) {
  const items = [];
  const componentList = Array.isArray(components && components.components) ? components.components : [];
  for (const component of componentList.slice(0, 10)) {
    items.push(createRegressionItem(`component-${component.component_id || sanitizeToken(component.name)}`, `Verify ${component.name || component.component_id} states`, "component", `Capture component state evidence for ${component.name || component.component_id}.`));
    if (Array.isArray(component.states) && component.states.includes("validation")) {
      items.push(createRegressionItem(`component-${component.component_id || sanitizeToken(component.name)}-validation`, `Verify ${component.name || component.component_id} validation state`, "form", `Capture validation evidence for ${component.name || component.component_id}.`));
    }
    if (Array.isArray(component.states) && component.states.includes("disabled")) {
      items.push(createRegressionItem(`component-${component.component_id || sanitizeToken(component.name)}-disabled`, `Verify ${component.name || component.component_id} disabled state`, "component", `Capture disabled-state evidence for ${component.name || component.component_id}.`));
    }
  }
  return uniqueById(items);
}

function buildRegressionItemsFromStates(options = {}) {
  const recommendation = options.recommendation || null;
  const productId = recommendation && recommendation.detected_product_type_details ? recommendation.detected_product_type_details.id : "saas";
  const items = [
    createRegressionItem("state-loading", "Verify loading states are preserved", "state", "Capture loading evidence for the primary flow."),
    createRegressionItem("state-empty", "Verify empty states are preserved", "state", "Capture empty-state evidence for the primary flow."),
    createRegressionItem("state-error", "Verify error states are preserved", "state", "Capture error-state evidence for the primary flow."),
    createRegressionItem("accessibility-focus", "Verify focus visibility and keyboard navigation", "accessibility", "Capture keyboard and focus evidence."),
    createRegressionItem("handoff-docs", "Verify handoff checklist remains intact", "handoff", "Record the final handoff evidence.")
  ];
  if (productId === "dashboard" || productId === "admin_panel") {
    items.push(createRegressionItem("dashboard-empty", "Verify dashboard no-data state", "dashboard", "Capture the dashboard no-data state."));
    items.push(createRegressionItem("dashboard-table", "Verify dashboard table readability", "dashboard", "Capture the table/card readability state."));
  }
  if (productId === "booking") {
    items.push(createRegressionItem("booking-confirmation", "Verify booking confirmation state", "state", "Capture the booking confirmation state."));
    items.push(createRegressionItem("booking-calendar", "Verify booking calendar and slot selection", "screen", "Capture the booking calendar interactions."));
  }
  if (productId === "commerce" || productId === "ecommerce") {
    items.push(createRegressionItem("checkout-confirmation", "Verify checkout confirmation state", "state", "Capture the checkout confirmation state."));
    items.push(createRegressionItem("cart-review", "Verify cart review and totals", "screen", "Capture the cart review state."));
  }
  if (options.checklist && Array.isArray(options.checklist.checklist)) {
    const hasForms = options.checklist.checklist.some((item) => item.category === "forms");
    if (hasForms) items.push(createRegressionItem("forms-validation", "Verify form validation and recovery", "form", "Capture validation and recovery evidence."));
  }
  return uniqueById(items);
}

function summarizeRegressionChecklist(checklist, options = {}) {
  const items = Array.isArray(checklist && checklist.items) ? checklist.items : [];
  const required = items.filter((item) => item.required !== false).length;
  return {
    total: items.length,
    required
  };
}

function renderRegressionMarkdown(checklist, options = {}) {
  return [
    "# UI/UX Regression Checklist",
    "",
    `- App: ${checklist.app || "n/a"}`,
    `- Total items: ${checklist.summary ? checklist.summary.total : 0}`,
    `- Required items: ${checklist.summary ? checklist.summary.required : 0}`,
    `- Next action: ${checklist.next_action || "Use the regression checklist to verify the UI slice before handoff."}`,
    "",
    "## Items",
    ...(Array.isArray(checklist.items) && checklist.items.length
      ? checklist.items.map((item) => [
        `### ${item.item_id}`,
        `- Title: ${item.title}`,
        `- Category: ${item.category}`,
        `- Required: ${item.required ? "yes" : "no"}`,
        `- Status: ${item.status}`,
        `- Evidence hint: ${item.evidence_hint}`,
        ""
      ]).flat()
      : ["- None"])
  ].join("\n").trimEnd() + "\n";
}

function createRegressionItem(itemId, title, category, evidenceHint) {
  return {
    item_id: itemId,
    title,
    category,
    required: true,
    status: "pending",
    evidence_hint: evidenceHint
  };
}

function normalizeAppSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_/]+|[-_/]+$/g, "");
}

function sanitizeToken(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9-_/]+/g, "-").replace(/-+/g, "-").replace(/^[-_/]+|[-_/]+$/g, "");
}

function uniqueById(items) {
  const map = new Map();
  for (const item of items) map.set(item.item_id, item);
  return Array.from(map.values());
}

module.exports = {
  buildUiUxRegressionChecklist,
  buildRegressionItemsFromScreens,
  buildRegressionItemsFromComponents,
  buildRegressionItemsFromStates,
  summarizeRegressionChecklist,
  renderRegressionMarkdown
};
