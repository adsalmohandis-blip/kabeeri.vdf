const { generateScreenBlueprint } = require("./screens");
const { generateChecklist } = require("./checklist");
const { recommendUiUx } = require("./recommender");

function buildVisualQaContract(input, options = {}) {
  const app = normalizeAppSlug(options.app || options.app_slug || options.appSlug || "");
  const recommendation = options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation"
    ? options.recommendation
    : recommendUiUx(input, options);
  const screenBlueprint = options.screenBlueprint && options.screenBlueprint.report_type === "ui_ux_intelligence_screen_blueprint"
    ? options.screenBlueprint
    : generateScreenBlueprint(input, { ...options, recommendation });
  const checklist = options.checklist && options.checklist.report_type === "ui_ux_intelligence_checklist"
    ? options.checklist
    : generateChecklist(input, { ...options, recommendation });
  const required_screens = buildScreenQaRequirements(screenBlueprint, options);
  const required_states = buildStateQaRequirements({ ...options, recommendation, screenBlueprint });
  const required_breakpoints = buildResponsiveQaRequirements(options);
  const required_accessibility_evidence = buildAccessibilityQaRequirements({ ...options, recommendation, checklist });
  const required_interaction_evidence = buildInteractionQaRequirements({ ...options, recommendation, screenBlueprint });
  const evidenceManifest = options.evidenceManifest || options.evidence_manifest || null;
  const evidence_status = evaluateVisualQaEvidence({
    required_screens,
    required_states,
    required_breakpoints,
    required_accessibility_evidence,
    required_interaction_evidence
  }, evidenceManifest, options);
  return {
    report_type: "ui_ux_intelligence_visual_qa_contract",
    app: app || null,
    input: String(input || ""),
    required_screens,
    required_states,
    required_breakpoints,
    required_accessibility_evidence,
    required_interaction_evidence,
    evidence_status,
    standalone: true,
    external_github_dependency: false,
    next_action: evidence_status.missing.length ? "Capture the missing QA evidence before handoff." : "Attach this QA contract to the acceptance gate."
  };
}

function buildScreenQaRequirements(screenBlueprint, options = {}) {
  const screens = Array.isArray(screenBlueprint && screenBlueprint.screens) ? screenBlueprint.screens : [];
  if (!screens.length) return ["default-screen", "detail-screen"];
  return uniqueStrings(screens.slice(0, 8).map((screen) => screen.screen_id || screen.name || screen.route_hint || "screen"));
}

function buildStateQaRequirements(options = {}) {
  const recommendation = options.recommendation || null;
  const productId = recommendation && recommendation.detected_product_type_details ? recommendation.detected_product_type_details.id : "saas";
  const states = ["default", "loading", "empty", "error"];
  if (productId === "booking" || productId === "commerce" || productId === "ecommerce") states.push("success");
  if (productId === "dashboard" || productId === "admin_panel") states.push("no-data", "filtered-empty");
  return uniqueStrings(states);
}

function buildResponsiveQaRequirements(options = {}) {
  return ["mobile", "tablet", "desktop"];
}

function buildAccessibilityQaRequirements(options = {}) {
  return uniqueStrings([
    "keyboard-navigation",
    "visible-focus-states",
    "semantic-structure",
    "color-contrast",
    "screen-reader-labels",
    "reduced-motion"
  ]);
}

function buildInteractionQaRequirements(options = {}) {
  const recommendation = options.recommendation || null;
  const productId = recommendation && recommendation.detected_product_type_details ? recommendation.detected_product_type_details.id : "saas";
  const evidence = ["loading-state", "empty-state", "error-state"];
  if (productId === "booking") evidence.push("booking-confirmation-state", "calendar-slot-selection");
  if (productId === "commerce" || productId === "ecommerce") evidence.push("checkout-confirmation-state", "cart-review");
  if (productId === "dashboard" || productId === "admin_panel") evidence.push("dashboard-empty-state", "data-table-state");
  if (options.checklist && Array.isArray(options.checklist.checklist)) {
    const hasForms = options.checklist.checklist.some((item) => item.category === "forms");
    if (hasForms) evidence.push("form-validation-state");
  }
  evidence.push("destructive-confirmation");
  return uniqueStrings(evidence);
}

function evaluateVisualQaEvidence(contract, evidenceManifest, options = {}) {
  const manifestItems = Array.isArray(evidenceManifest && evidenceManifest.evidence_items) ? evidenceManifest.evidence_items : [];
  const provided = [];
  const missing = [];

  const evidenceTokens = manifestItems.map((item) => {
    const base = [
      item.evidence_id,
      item.path_or_url,
      item.related_screen,
      item.related_component,
      item.related_state,
      item.type
    ].filter(Boolean).join(" ").toLowerCase();
    return { item, text: base };
  });

  const requirements = [
    ...contract.required_screens.map((screen) => ({ token: `screen:${screen}`, match: (text) => text.includes(screen.toLowerCase()) || text.includes("screen") })),
    ...contract.required_states.map((state) => ({ token: `state:${state}`, match: (text) => text.includes(state.toLowerCase()) })),
    ...contract.required_breakpoints.map((bp) => ({ token: `breakpoint:${bp}`, match: (text) => text.includes(bp.toLowerCase()) })),
    ...contract.required_accessibility_evidence.map((req) => ({ token: `accessibility:${req}`, match: (text) => text.includes(req.toLowerCase().replace(/-/g, " ")) || text.includes(req.toLowerCase()) })),
    ...contract.required_interaction_evidence.map((req) => ({ token: `interaction:${req}`, match: (text) => text.includes(req.toLowerCase().replace(/-/g, " ")) || text.includes(req.toLowerCase()) }))
  ];

  for (const requirement of requirements) {
    const match = evidenceTokens.find((entry) => entry.item.status === "provided" && requirement.match(entry.text));
    if (match) provided.push(requirement.token);
    else missing.push(requirement.token);
  }

  const status = determineEvidenceStatus(missing, options);
  return {
    status,
    missing: uniqueStrings(missing),
    provided: uniqueStrings(provided)
  };
}

function determineEvidenceStatus(missing, options = {}) {
  if (!missing.length) return "pass";
  if (options.strict) return "blocked";
  return missing.length > 3 ? "blocked" : "warning";
}

function renderVisualQaMarkdown(contract, options = {}) {
  return [
    "# UI/UX Visual QA Contract",
    "",
    `- App: ${contract.app || "n/a"}`,
    `- Input: ${contract.input || ""}`,
    `- Status: ${contract.evidence_status ? contract.evidence_status.status : "warning"}`,
    `- Next action: ${contract.next_action || "Capture the missing QA evidence before handoff."}`,
    "",
    "## Required Screens",
    ...(Array.isArray(contract.required_screens) && contract.required_screens.length ? contract.required_screens.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Required States",
    ...(Array.isArray(contract.required_states) && contract.required_states.length ? contract.required_states.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Required Breakpoints",
    ...(Array.isArray(contract.required_breakpoints) && contract.required_breakpoints.length ? contract.required_breakpoints.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Evidence Status",
    `- Provided: ${(contract.evidence_status && contract.evidence_status.provided || []).join(", ") || "none"}`,
    `- Missing: ${(contract.evidence_status && contract.evidence_status.missing || []).join(", ") || "none"}`
  ].join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function normalizeAppSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_/]+|[-_/]+$/g, "");
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildVisualQaContract,
  buildScreenQaRequirements,
  buildStateQaRequirements,
  buildResponsiveQaRequirements,
  buildAccessibilityQaRequirements,
  evaluateVisualQaEvidence,
  renderVisualQaMarkdown
};
