const { detectProductType, recommendUiUx } = require("./recommender");
const { generateComponentBlueprint } = require("./components");
const { generateScreenBlueprint } = require("./screens");

function buildUiPatternLibrary(input, options = {}) {
  const recommendation = resolveRecommendation(input, options);
  const productId = recommendation.detected_product_type_details ? recommendation.detected_product_type_details.id : detectProductType(input, options).id;
  const componentBlueprint = options.componentBlueprint && options.componentBlueprint.report_type === "ui_ux_intelligence_component_blueprint"
    ? options.componentBlueprint
    : generateComponentBlueprint(input, { ...options, recommendation });
  const screenBlueprint = options.screenBlueprint && options.screenBlueprint.report_type === "ui_ux_intelligence_screen_blueprint"
    ? options.screenBlueprint
    : generateScreenBlueprint(input, { ...options, recommendation, components: componentBlueprint });
  const patterns = inferRelevantPatterns(input, { ...options, recommendation, productId, componentBlueprint, screenBlueprint });
  return {
    report_type: "ui_ux_intelligence_pattern_library",
    input: String(input || ""),
    patterns,
    recommended_order: patterns.map((pattern) => pattern.pattern_id),
    warnings: uniqueStrings([...(recommendation.warnings || [])]),
    standalone: true,
    external_github_dependency: false,
    next_action: "Use these patterns to guide UI implementation tasks."
  };
}

function inferRelevantPatterns(input, options = {}) {
  const recommendation = options.recommendation || resolveRecommendation(input, options);
  const productId = options.productId || (recommendation.detected_product_type_details ? recommendation.detected_product_type_details.id : "saas");
  const layoutPatterns = Array.isArray(recommendation.recommended_layout_pattern_details)
    ? recommendation.recommended_layout_pattern_details
    : [];
  const componentBlueprint = options.componentBlueprint || generateComponentBlueprint(input, { ...options, recommendation });
  const screenBlueprint = options.screenBlueprint || generateScreenBlueprint(input, { ...options, recommendation, components: componentBlueprint });

  const basePatterns = [
    createPattern("navigation-shell", "Navigation Shell", "navigation", [
      "The app needs a stable frame with predictable navigation and context switching."
    ], [
      "When the app has only a single full-screen action with no broader IA."
    ], ["layout-shell", "navigation-primary"], [
      "default", "focus", "collapsed", "expanded", "loading"
    ]),
    createPattern("landing-hero-cta", "Landing Hero / CTA", "layout", [
      "The first viewport must explain the product and move users into a single primary action."
    ], [
      "When the app is a dense internal tool or a post-login workflow with no landing surface."
    ], ["hero_banner", "primary-cta", "social_proof_strip"], [
      "hero", "intro", "primary_action"
    ]),
    createPattern("dashboard-grid", "Dashboard Grid", "dashboard", [
      "The app summarizes metrics, tasks, or operational data in a compact overview."
    ], [
      "When the app is primarily a content feed or a single-step form."
    ], ["dashboard-widgets", "metrics_cards", "data_table"], [
      "default", "loading", "empty", "error", "success"
    ]),
    createPattern("data-table-list", "Data Table / List", "data_display", [
      "The app presents dense records that need filtering, sorting, or comparison."
    ], [
      "When the app only needs a lightweight card-based browse pattern."
    ], ["data-table", "search-filter", "filters_bar"], [
      "default", "loading", "empty", "error", "selected"
    ]),
    createPattern("form-wizard", "Form / Wizard", "forms", [
      "The app collects structured input in one or more guided steps."
    ], [
      "When the task can be completed with a single simple field group and no progression."
    ], ["form-controls", "state-feedback", "onboarding-stepper"], [
      "default", "loading", "validation", "error", "success", "disabled"
    ]),
    createPattern("search-filter", "Search / Filter", "navigation", [
      "Users need to narrow a catalog, list, or dashboard quickly."
    ], [
      "When the app has no browsable index or list surface."
    ], ["search_bar", "filter_sidebar", "segmented_control"], [
      "idle", "active", "loading", "empty", "error"
    ]),
    createPattern("card-grid", "Card Grid", "layout", [
      "Items can be scanned as a visual set with equal emphasis."
    ], [
      "When the data requires strict row-based comparison."
    ], ["card_grid", "feature_cards", "product_card"], [
      "default", "loading", "empty", "error"
    ])
  ];

  if (productId === "booking") {
    basePatterns.push(
      createPattern("booking-flow", "Booking Flow", "booking", [
        "The product schedules appointments, visits, reservations, or time slots."
      ], [
        "When the app does not expose a date or slot selection path."
      ], ["booking-calendar", "time-slot-picker", "booking-confirmation"], [
        "default", "loading", "empty", "error", "success", "rescheduled"
      ]),
      createPattern("modal-drawer", "Modal / Drawer", "feedback", [
        "A focused side-panel or modal is useful for changing time, confirming choices, or reviewing detail."
      ], [
        "When the task requires multi-page navigation for a short confirmation step."
      ], ["modal-drawer", "state-feedback"], [
        "closed", "open", "loading", "error", "confirm"
      ])
    );
  }
  if (productId === "ecommerce") {
    basePatterns.push(
      createPattern("checkout-flow", "Checkout Flow", "commerce", [
        "The product collects shipping, billing, payment, or order review details."
      ], [
        "When the app is not selling or confirming an order."
      ], ["checkout-form", "cart-summary", "product-gallery"], [
        "cart", "shipping", "payment", "review", "success", "error"
      ]),
      createPattern("modal-drawer", "Modal / Drawer", "feedback", [
        "A cart drawer or quick-view drawer reduces navigation friction."
      ], [
        "When the drawer would hide critical checkout totals or validation."
      ], ["cart_drawer", "modal-drawer", "state-feedback"], [
        "closed", "open", "loading", "error", "confirm"
      ])
    );
  }
  if (productId === "dashboard" || productId === "admin_panel") {
    basePatterns.push(
      createPattern("settings-screen", "Settings Screen", "dashboard", [
        "The app needs preferences, permissions, or operational settings."
      ], [
        "When all interactions belong to the primary dashboard overview."
      ], ["form-controls", "auth-form", "state-feedback"], [
        "default", "loading", "empty", "error", "success"
      ])
    );
  }
  if (productId === "saas") {
    basePatterns.push(
      createPattern("authentication-flow", "Authentication Flow", "auth", [
        "The app needs sign in, sign up, reset, invite, or onboarding entry."
      ], [
        "When the app never asks the user to authenticate inside the product."
      ], ["auth-form", "form-controls", "primary-cta"], [
        "sign_in", "sign_up", "recover", "loading", "error", "success"
      ]),
      createPattern("settings-screen", "Settings Screen", "dashboard", [
        "The app needs preferences, profile, or billing settings."
      ], [
        "When there is no persistent user account or profile state."
      ], ["form-controls", "state-feedback"], [
        "default", "loading", "error", "success"
      ])
    );
  }
  if (productId === "blog" || productId === "content") {
    basePatterns.push(
      createPattern("card-grid", "Card Grid", "content", [
        "Articles or content previews should be easy to scan in a grid or feed."
      ], [
        "When long-form reading is the only interaction."
      ], ["article-card", "search-filter"], [
        "default", "loading", "empty", "error"
      ])
    );
  }

  const patternMap = new Map();
  for (const pattern of basePatterns) patternMap.set(pattern.pattern_id, pattern);

  for (const layoutPattern of layoutPatterns.slice(0, 3)) {
    const mapped = mapLayoutPattern(layoutPattern, recommendation, productId);
    if (mapped) patternMap.set(mapped.pattern_id, mapped);
  }

  if (screenBlueprint && Array.isArray(screenBlueprint.screens)) {
    for (const screen of screenBlueprint.screens.slice(0, 3)) {
      const derived = mapScreenPattern(screen, recommendation, productId);
      if (derived) patternMap.set(derived.pattern_id, derived);
    }
  }

  return Array.from(patternMap.values()).map((pattern) => ({
    ...pattern,
    acceptance_criteria: buildPatternAcceptanceCriteria(pattern, options),
    anti_patterns: buildPatternAntiPatterns(pattern, options),
    implementation_notes: buildPatternImplementationNotes(pattern, options)
  }));
}

function buildPatternAcceptanceCriteria(pattern, options = {}) {
  const criteria = [
    `The ${pattern.name} pattern has a documented purpose and explicit use case.`,
    "It supports mobile and desktop layouts without horizontal overflow.",
    "It preserves visible focus states and keyboard reachability.",
    "It includes at least one state for loading, empty, or error handling when relevant."
  ];
  if (pattern.category === "forms" || pattern.category === "booking" || pattern.category === "commerce") {
    criteria.push("Validation, confirmation, and recovery paths are described.");
  }
  if (pattern.category === "dashboard" || pattern.category === "data_display") {
    criteria.push("Readable data density, table headers, or chart summaries are described.");
  }
  return uniqueStrings(criteria);
}

function buildPatternAntiPatterns(pattern, options = {}) {
  const antiPatterns = [
    "color-only state signaling",
    "hover-only action discovery",
    "missing loading or empty feedback"
  ];
  if (pattern.category === "booking") antiPatterns.push("modal-only booking completion", "unclear cancellation flow");
  if (pattern.category === "commerce") antiPatterns.push("hidden shipping or totals", "checkout without validation");
  if (pattern.category === "dashboard") antiPatterns.push("tables without headers", "dashboard without empty states");
  if (pattern.category === "auth") antiPatterns.push("auth flow without recovery path", "missing password or account states");
  if (pattern.category === "navigation") antiPatterns.push("navigation that changes unpredictably", "primary action hidden below the fold");
  return uniqueStrings(antiPatterns.concat(pattern.anti_patterns || []));
}

function buildPatternImplementationNotes(pattern, options = {}) {
  const notes = [
    pattern.use_when && pattern.use_when.length ? `Use when: ${pattern.use_when.join(" ")}` : null,
    pattern.avoid_when && pattern.avoid_when.length ? `Avoid when: ${pattern.avoid_when.join(" ")}` : null,
    `Components: ${pattern.components.join(", ")}`,
    `States: ${pattern.states.join(", ")}`,
    `Accessibility: ${pattern.accessibility.join(" ")}`,
    `Responsive: ${pattern.responsive_behavior.join(" ")}`
  ].filter(Boolean);
  if (options.stack) {
    notes.push(`Stack note: align the pattern with ${String(options.stack).trim()} primitives without changing the pattern semantics.`);
  }
  return uniqueStrings(notes);
}

function createPattern(patternId, name, category, useWhen, avoidWhen, components, states) {
  return {
    pattern_id: patternId,
    name,
    category,
    use_when: uniqueStrings(useWhen),
    avoid_when: uniqueStrings(avoidWhen),
    components: uniqueStrings(components),
    states: uniqueStrings(states),
    accessibility: [
      "Visible focus states",
      "Keyboard navigation",
      "Semantic structure",
      "Color contrast"
    ],
    responsive_behavior: [
      "Scale from mobile to desktop",
      "Preserve readable spacing",
      "Avoid horizontal overflow"
    ],
    acceptance_criteria: [],
    anti_patterns: [],
    implementation_notes: []
  };
}

function mapLayoutPattern(layoutPattern, recommendation, productId) {
  const label = String(layoutPattern.title || "").toLowerCase();
  if (/hero|landing|showcase/.test(label)) {
    return createPattern("landing-hero-cta", "Landing Hero / CTA", "layout", [
      "The layout pattern is a conversion-led entry surface."
    ], [
      "The app is a dense workflow with no introduction surface."
    ], ["hero_banner", "primary-cta", "feature_cards"], ["hero", "intro", "primary_action"]);
  }
  if (/dashboard|operations|real-time/.test(label)) {
    return createPattern("dashboard-grid", "Dashboard Grid", "dashboard", [
      "The layout pattern summarizes operational or analytic content."
    ], [
      "The app does not need a metric overview."
    ], ["dashboard-widgets", "data-table", "filters_bar"], ["default", "loading", "empty", "error"]);
  }
  if (/comparison|table|pricing/.test(label)) {
    return createPattern("data-table-list", "Data Table / List", "data_display", [
      "The layout pattern helps users compare dense entries."
    ], [
      "The app requires a more visual browse pattern."
    ], ["data-table", "search-filter"], ["default", "loading", "empty", "error"]);
  }
  return null;
}

function mapScreenPattern(screen, recommendation, productId) {
  const label = String(screen.name || "").toLowerCase();
  if (productId === "booking" && /booking|list|confirm/.test(label)) {
    return createPattern("booking-flow", "Booking Flow", "booking", [
      "The screen belongs to a scheduling or appointment path."
    ], [
      "The product does not involve selecting availability or confirming a slot."
    ], ["booking-calendar", "time-slot-picker", "booking-confirmation"], ["default", "loading", "empty", "error", "success"]);
  }
  if (productId === "ecommerce" && /product|cart|checkout/.test(label)) {
    return createPattern("checkout-flow", "Checkout Flow", "commerce", [
      "The screen belongs to cart, checkout, or order review."
    ], [
      "The product does not sell or take payment."
    ], ["cart-summary", "checkout-form", "product-card"], ["cart", "shipping", "payment", "review", "success"]);
  }
  if ((productId === "dashboard" || productId === "admin_panel") && /overview|detail|settings/.test(label)) {
    return createPattern("dashboard-grid", "Dashboard Grid", "dashboard", [
      "The screen belongs to the operational overview or record detail flow."
    ], [
      "The product is not data-dense or operational."
    ], ["dashboard-widgets", "data-table", "form-controls"], ["default", "loading", "empty", "error"]);
  }
  return null;
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildUiPatternLibrary,
  inferRelevantPatterns,
  buildPatternAcceptanceCriteria,
  buildPatternAntiPatterns,
  buildPatternImplementationNotes
};
