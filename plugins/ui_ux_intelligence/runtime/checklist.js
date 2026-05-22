const { recommendUiUx } = require("./recommender");
const { generateDesignSystem } = require("./design_system");

const CHECKLIST_CATEGORIES = [
  "accessibility",
  "responsive",
  "interaction",
  "content",
  "layout",
  "forms",
  "dashboard",
  "performance",
  "motion",
  "handoff"
];

function generateChecklist(input, options = {}) {
  const recommendation = resolveRecommendation(input, options);
  const designSystem = generateDesignSystem(input, { ...options, recommendation });
  const checklist = buildChecklistItems(recommendation, designSystem, options);
  const summary = summarizeChecklist(checklist);

  return {
    report_type: "ui_ux_intelligence_checklist",
    input: String(input || ""),
    checklist,
    summary,
    warnings: uniqueStrings([
      ...(recommendation.warnings || []),
      ...(designSystem.warnings || [])
    ]),
    standalone: true,
    external_github_dependency: false,
    next_action: "Apply checklist before UI handoff."
  };
}

function categorizeChecklistItems(items = []) {
  const groups = {};
  for (const category of CHECKLIST_CATEGORIES) {
    groups[category] = [];
  }
  for (const item of items || []) {
    const category = CHECKLIST_CATEGORIES.includes(item.category) ? item.category : "content";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
  }
  return groups;
}

function summarizeChecklist(checklist = []) {
  const items = Array.isArray(checklist) ? checklist : [];
  const categories = categorizeChecklistItems(items);
  const byCategory = {};
  let required = 0;
  let blockers = 0;
  let warnings = 0;

  for (const category of CHECKLIST_CATEGORIES) {
    const categoryItems = categories[category] || [];
    const severityCounts = { info: 0, warning: 0, blocker: 0 };
    for (const item of categoryItems) {
      if (item.required) required += 1;
      if (item.severity === "blocker") blockers += 1;
      if (item.severity === "warning") warnings += 1;
      if (severityCounts[item.severity] !== undefined) severityCounts[item.severity] += 1;
    }
    byCategory[category] = {
      total: categoryItems.length,
      ...severityCounts
    };
  }

  return {
    total: items.length,
    required,
    blockers,
    warnings,
    by_category: byCategory
  };
}

function buildChecklistItems(recommendation, designSystem, options) {
  const items = [
    createChecklistItem("accessibility-focus", "Visible focus states are present on every actionable control.", "accessibility", "blocker", "Keyboard users must always know where focus is located.", "Tab through the page and confirm every interactive element has a clear focus ring.", ["vibe", "owner", "plugin"]),
    createChecklistItem("accessibility-keyboard", "Keyboard navigation can complete the full primary flow.", "accessibility", "blocker", "Core interactions must work without pointer input.", "Navigate the main task with only the keyboard and confirm the tab order is logical.", ["vibe", "owner", "plugin"]),
    createChecklistItem("accessibility-contrast", "Text and key surfaces meet contrast expectations.", "accessibility", "blocker", "Readable contrast is a baseline accessibility requirement.", "Check text on background, controls, and status surfaces against WCAG AA targets.", ["vibe", "owner", "plugin"]),
    createChecklistItem("accessibility-semantic-structure", "Semantic headings, landmarks, and labels describe the actual content.", "accessibility", "warning", "Assistive technology depends on meaningful page structure.", "Review heading levels, landmark regions, and form labels in the implementation.", ["vibe", "owner", "plugin"]),
    createChecklistItem("accessibility-labels", "Icon buttons and non-text controls have meaningful labels or alt text.", "accessibility", "warning", "Non-text controls need a textual equivalent.", "Inspect icon-only controls, avatars, and image-based actions for accessible names.", ["vibe", "owner", "plugin"]),
    createChecklistItem("accessibility-reduced-motion", "Reduced motion preferences are respected.", "motion", "warning", "Motion should never block access or cause discomfort.", "Test with prefers-reduced-motion enabled and confirm the experience remains usable.", ["vibe", "owner", "plugin"]),
    createChecklistItem("responsive-mobile", "Mobile layout keeps the primary action visible and readable.", "responsive", "blocker", "Most Viber handoffs fail when the first viewport is not mobile-safe.", "Inspect the 360px-wide view and confirm the main path does not require horizontal scrolling.", ["vibe", "owner", "plugin"]),
    createChecklistItem("responsive-tablet", "Tablet layout keeps the page readable without crowding.", "responsive", "warning", "Tablet views often expose awkward spacing or broken columns.", "Review 768px to 1024px widths and check how cards, sidebars, and filters reflow.", ["vibe", "owner", "plugin"]),
    createChecklistItem("responsive-desktop", "Desktop layout uses the extra width deliberately.", "responsive", "info", "Desktop should improve clarity, not only scale up mobile.", "Confirm the page uses wider space for hierarchy instead of stretching content endlessly.", ["vibe", "owner", "plugin"]),
    createChecklistItem("responsive-touch-targets", "Touch targets are large enough for comfortable tapping.", "responsive", "warning", "Small touch targets create avoidable errors on touch devices.", "Measure buttons, chips, and icon actions to confirm comfortable hit areas.", ["vibe", "owner", "plugin"]),
    createChecklistItem("responsive-overflow", "Overflow is controlled and nothing important disappears off-screen.", "responsive", "warning", "Horizontal scroll and clipped content are common delivery bugs.", "Look for clipped cards, table overflow, and hidden controls at narrow widths.", ["vibe", "owner", "plugin"]),
    createChecklistItem("interaction-hover", "Hover states reinforce affordances without being required.", "interaction", "info", "Hover should help mouse users, not define the only discoverability path.", "Check buttons, cards, rows, and menus for consistent hover feedback.", ["vibe", "owner", "plugin"]),
    createChecklistItem("interaction-loading", "Loading states are present for async actions and page transitions.", "interaction", "warning", "Users need feedback when the interface is busy.", "Trigger a delayed action and verify the loading treatment is visible and understandable.", ["vibe", "owner", "plugin"]),
    createChecklistItem("interaction-empty", "Empty states explain what is happening and what to do next.", "interaction", "warning", "Blank screens should guide the user instead of stopping them.", "Open the first-run or no-data view and confirm it includes a useful next step.", ["vibe", "owner", "plugin"]),
    createChecklistItem("interaction-error", "Error states explain the problem and point to recovery.", "interaction", "blocker", "Users need an understandable path out of failure.", "Force a validation or network error and confirm the message is clear and actionable.", ["vibe", "owner", "plugin"]),
    createChecklistItem("interaction-success", "Success states confirm completion without being noisy.", "interaction", "info", "Acknowledge progress so the user knows the action completed.", "Submit a happy-path action and confirm the success feedback is visible but not disruptive.", ["vibe", "owner", "plugin"]),
    createChecklistItem("interaction-disabled", "Disabled states are obvious and explain why the control is unavailable.", "interaction", "warning", "A disabled control should not look broken or ambiguous.", "Inspect permissions, validation gates, or async-disabled controls.", ["vibe", "owner", "plugin"]),
    createChecklistItem("content-copy", "Labels, helper text, and call-to-action copy are concise and specific.", "content", "warning", "Clear copy reduces ambiguity and support burden.", "Read the primary surface aloud and confirm the meaning is obvious without extra explanation.", ["vibe", "owner", "plugin"]),
    createChecklistItem("content-hierarchy", "Headings, summaries, and body text follow a clear hierarchy.", "content", "warning", "Hierarchy helps users scan the page quickly.", "Check the top section, section headings, and supporting text for clear order.", ["vibe", "owner", "plugin"]),
    createChecklistItem("content-next-step", "Each major state tells the user what to do next.", "content", "warning", "Next steps keep the flow moving.", "Review each empty, error, and success state for an obvious next action.", ["vibe", "owner", "plugin"]),
    createChecklistItem("layout-primary-flow", "The primary flow is the most visible path on the page.", "layout", "warning", "The user should not have to hunt for the main job-to-be-done.", "Trace the main flow from first view to completion and confirm it remains prominent.", ["vibe", "owner", "plugin"]),
    createChecklistItem("layout-spacing", "Spacing and alignment are consistent across related surfaces.", "layout", "info", "Consistent rhythm makes the interface feel intentional.", "Compare cards, sections, and form rows for even spacing and alignment.", ["vibe", "owner", "plugin"]),
    createChecklistItem("layout-summary-surfaces", "Summary surfaces and supporting panels have a clear order.", "layout", "warning", "Related information should not compete visually.", "Review any sidebars, summary panels, or secondary actions for hierarchy.", ["vibe", "owner", "plugin"]),
    createChecklistItem("forms-validation", "Validation messages appear before or at submission time.", "forms", "blocker", "Users should never guess why a form failed.", "Trigger an invalid submission and verify every error is visible, contextual, and actionable.", ["vibe", "owner", "plugin"]),
    createChecklistItem("forms-required-clarity", "Required fields are clearly marked and explained.", "forms", "warning", "Users need to know what is mandatory before they submit.", "Inspect the form labels, helper text, and required indicators.", ["vibe", "owner", "plugin"]),
    createChecklistItem("forms-destructive-confirmation", "Destructive actions ask for confirmation at the right moment.", "forms", "blocker", "Irreversible actions need a clear safety step.", "Try delete, cancel, or remove actions and verify the confirmation path is explicit.", ["vibe", "owner", "plugin"]),
    createChecklistItem("forms-recovery", "A recovery path exists after an error or failed submission.", "forms", "warning", "Users need a way to retry without losing context.", "Confirm that failed forms preserve input and provide a retry path.", ["vibe", "owner", "plugin"]),
    createChecklistItem("dashboard-empty-data", "Empty dashboard data states explain why no data is available.", "dashboard", "warning", "Dashboards need a non-breaking first-run experience.", "Open a no-data state and confirm the surface is still useful.", ["vibe", "owner", "plugin"]),
    createChecklistItem("dashboard-readability", "Tables, cards, and summary surfaces remain readable at a glance.", "dashboard", "warning", "Dense data should still be scannable.", "Check column widths, row density, card hierarchy, and summary labels.", ["vibe", "owner", "plugin"]),
    createChecklistItem("dashboard-filters", "Filters and search state are visible and understandable.", "dashboard", "warning", "Users must know what subset of data they are seeing.", "Apply a filter and confirm the active state is obvious and removable.", ["vibe", "owner", "plugin"]),
    createChecklistItem("dashboard-kpi", "KPI values are labeled clearly and do not rely on visual guesswork.", "dashboard", "warning", "Metrics need context to be meaningful.", "Check every KPI for a label, unit, and supporting explanation.", ["vibe", "owner", "plugin"]),
    createChecklistItem("performance-budget", "The experience stays within an acceptable performance budget.", "performance", "info", "Performance keeps the interface usable under pressure.", "Check loading cost, expensive renders, and obvious layout thrash points.", ["vibe", "owner", "plugin"]),
    createChecklistItem("performance-media", "Heavy media and charts are only loaded when needed.", "performance", "info", "Deferred loading keeps the first view responsive.", "Confirm expensive assets are lazy-loaded or otherwise staged wisely.", ["vibe", "owner", "plugin"]),
    createChecklistItem("motion-purpose", "Motion supports transitions and does not distract from the task.", "motion", "info", "Motion should clarify state change, not decorate everything.", "Review transitions, page changes, and alerts for purposeful animation.", ["vibe", "owner", "plugin"]),
    createChecklistItem("motion-reduced", "Motion remains safe and useful when reduced motion is requested.", "motion", "warning", "Reduced-motion users should not lose function.", "Confirm the experience degrades cleanly when animations are minimized.", ["vibe", "owner", "plugin"]),
    createChecklistItem("handoff-docs", "UI/UX docs exist for design, principles, IA, flows, specification, accessibility, and QA.", "handoff", "blocker", "Handoff is stronger when the docs set is complete.", "Check that the Viber docs package has the full UI/UX section set.", ["vibe", "owner", "plugin"]),
    createChecklistItem("handoff-criteria", "Acceptance criteria are linked to the UI/UX work.", "handoff", "warning", "Design decisions should trace back to expected behavior.", "Confirm the docs or ticket reference the acceptance criteria clearly.", ["vibe", "owner", "plugin"]),
    createChecklistItem("handoff-qa", "A QA checklist is ready for the handoff review.", "handoff", "warning", "QA should not be improvised during review.", "Make sure a QA checklist exists and matches the documented interaction states.", ["vibe", "owner", "plugin"])
  ];

  const productType = recommendation.detected_product_type_details || {};
  const stackGuidance = Array.isArray(recommendation.stack_guidance) ? recommendation.stack_guidance : [];
  const chartRecommendations = Array.isArray(recommendation.chart_recommendations) ? recommendation.chart_recommendations : [];

  if (productType.id === "booking") {
    items.push(
      createChecklistItem("booking-availability", "Availability, time slots, and calendar state are always understandable.", "dashboard", "warning", "Booking flows depend on clearly visible availability.", "Confirm the calendar, available slots, and blocked periods are obvious.", ["vibe", "owner", "plugin"]),
      createChecklistItem("booking-cancellation", "Cancellation or rescheduling clearly explains consequences.", "forms", "warning", "Booking changes can be sensitive and need reassurance.", "Review cancellation and rescheduling UI for recovery and confirmation details.", ["vibe", "owner", "plugin"])
    );
  }

  if (productType.id === "ecommerce") {
    items.push(
      createChecklistItem("ecommerce-checkout", "Checkout totals, taxes, and shipping are visible before submission.", "forms", "blocker", "Commerce flows must avoid hidden costs.", "Check the cart and checkout summary for final totals and fees.", ["vibe", "owner", "plugin"]),
      createChecklistItem("ecommerce-cart-state", "Cart, wishlist, and product state survive navigation and refresh expectations.", "interaction", "warning", "Commerce users expect persistent state.", "Confirm the product state does not disappear unexpectedly during browsing.", ["vibe", "owner", "plugin"])
    );
  }

  if (productType.id === "dashboard" || productType.id === "admin_panel" || chartRecommendations.length) {
    items.push(
      createChecklistItem("dashboard-charts", "Charts have labels, legends, and a summary that works without color alone.", "dashboard", "warning", "Analytic surfaces need accessible interpretation.", "Verify each chart has a readable caption, legend, and non-visual summary.", ["vibe", "owner", "plugin"])
    );
  }

  if (stackGuidance.some((item) => item.family === "mobile")) {
    items.push(
      createChecklistItem("mobile-navigation", "Bottom navigation or other mobile-friendly navigation remains usable on touch devices.", "responsive", "warning", "Mobile stacks need touch-safe navigation patterns.", "Review the primary navigation pattern on a narrow touch viewport.", ["vibe", "owner", "plugin"])
    );
  }

  if (options.track) {
    items.push(
      createChecklistItem(`track-${normalizeId(options.track)}`, `Checklist is aligned to the ${String(options.track)} delivery track.`, "handoff", "info", "Track context keeps the handoff focused.", "Make sure the checklist matches the current track and audience.", [normalizeId(options.track), "plugin"])
    );
  }

  return uniqueByCheckId(items);
}

function createChecklistItem(checkId, title, category, severity, why, evidenceHint, appliesTo) {
  return {
    check_id: checkId,
    title,
    category: CHECKLIST_CATEGORIES.includes(category) ? category : "content",
    severity: ["info", "warning", "blocker"].includes(severity) ? severity : "warning",
    required: true,
    why,
    evidence_hint: evidenceHint,
    applies_to: uniqueStrings(Array.isArray(appliesTo) ? appliesTo : ["vibe", "owner", "plugin"])
  };
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function uniqueByCheckId(items) {
  const seen = new Set();
  const result = [];
  for (const item of items || []) {
    if (!item || !item.check_id || seen.has(item.check_id)) continue;
    seen.add(item.check_id);
    result.push(item);
  }
  return result;
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

module.exports = {
  CHECKLIST_CATEGORIES,
  generateChecklist,
  categorizeChecklistItems,
  summarizeChecklist
};
