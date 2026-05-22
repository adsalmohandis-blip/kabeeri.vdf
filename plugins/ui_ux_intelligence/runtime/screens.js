const { generateComponentBlueprint } = require("./components");
const { recommendUiUx } = require("./recommender");

function generateScreenBlueprint(input, options = {}) {
  const recommendation = resolveRecommendation(input, options);
  const components = options.components && Array.isArray(options.components.components)
    ? options.components.components
    : generateComponentBlueprint(input, { ...options, recommendation });
  const screens = inferScreens(input, recommendation, { ...options, components });
  return {
    report_type: "ui_ux_intelligence_screen_blueprint",
    input: String(input || ""),
    screens,
    information_architecture: buildInformationArchitectureSummary(recommendation, screens),
    user_flow_summary: buildUserFlowSummary(recommendation, screens),
    standalone: true,
    external_github_dependency: false,
    next_action: "Use this output in INFORMATION_ARCHITECTURE.md, USER_FLOWS.md, WIREFRAMES.md, and UI_SPECIFICATION.md."
  };
}

function inferScreens(input, recommendation, options = {}) {
  const productId = recommendation && recommendation.detected_product_type_details ? recommendation.detected_product_type_details.id : "saas";
  const componentIds = Array.isArray(options.components && options.components.components)
    ? options.components.components.map((component) => component.component_id)
    : [];
  const screens = [
    createScreen("screen-home", "Home / Overview", "Introduce the product and move into the primary flow.", "/", ["hero", "summary", "primary_actions"], pickComponents(componentIds, ["layout-shell", "navigation-primary", "primary-cta"]), ["default", "loading", "empty", "error", "success"], ["Keep the first viewport clear and scannable."], ["Expose a focusable first action."], buildScreenAcceptanceCriteria("home"))
  ];

  if (productId === "booking") {
    screens.push(
      createScreen("screen-booking-list", "Booking List", "Show available clinics, services, or time slots.", "/book", ["filters", "listing", "calendar"], pickComponents(componentIds, ["booking-calendar", "time-slot-picker"]), ["default", "loading", "empty", "error"], ["Keep availability visible without scrolling."], ["Keyboard users can move through available times."], buildScreenAcceptanceCriteria("booking-list")),
      createScreen("screen-booking-confirmation", "Booking Confirmation", "Confirm the selected appointment and next step.", "/book/confirm", ["summary", "confirmation", "next-step"], pickComponents(componentIds, ["booking-confirmation", "state-feedback"]), ["default", "loading", "error", "success"], ["Show the selected slot and any follow-up instructions."], ["Announce confirmation changes to assistive tech."], buildScreenAcceptanceCriteria("booking-confirmation"))
    );
  }
  if (productId === "ecommerce") {
    screens.push(
      createScreen("screen-product-list", "Product Listing", "Browse and filter products.", "/products", ["search", "filters", "grid"], pickComponents(componentIds, ["product-card", "search-filter"]), ["default", "loading", "empty", "error"], ["Keep filters visible and easy to reset."], ["Announce active filters and sort state."], buildScreenAcceptanceCriteria("product-list")),
      createScreen("screen-product-detail", "Product Detail", "Inspect a product and decide to add it to cart.", "/products/:id", ["gallery", "details", "reviews", "cta"], pickComponents(componentIds, ["product-card", "primary-cta"]), ["default", "loading", "error", "success"], ["Keep price, availability, and CTA clear."], ["Provide meaningful alt text for product images."], buildScreenAcceptanceCriteria("product-detail")),
      createScreen("screen-cart", "Cart", "Review items and totals before checkout.", "/cart", ["items", "totals", "checkout"], pickComponents(componentIds, ["cart-summary", "checkout-form"]), ["default", "loading", "empty", "error"], ["Keep totals and next step visible."], ["Ensure removal or quantity changes are announced."], buildScreenAcceptanceCriteria("cart")),
      createScreen("screen-checkout", "Checkout", "Collect shipping and payment details.", "/checkout", ["shipping", "payment", "review"], pickComponents(componentIds, ["checkout-form"]), ["default", "loading", "error", "success"], ["Break checkout into understandable steps."], ["Keep validation and recovery paths visible."], buildScreenAcceptanceCriteria("checkout"))
    );
  }
  if (productId === "dashboard" || productId === "admin_panel") {
    screens.push(
      createScreen("screen-dashboard-overview", "Dashboard Overview", "Summarize the important metrics and tasks.", "/dashboard", ["kpis", "charts", "recent_activity"], pickComponents(componentIds, ["dashboard-widgets", "data-table"]), ["default", "loading", "empty", "error"], ["Use a clear hierarchy for cards and charts."], ["Provide a text summary for charts and KPIs."], buildScreenAcceptanceCriteria("dashboard-overview")),
      createScreen("screen-dashboard-detail", "Detail View", "Inspect the underlying record or metric.", "/dashboard/:id", ["detail_header", "history", "actions"], pickComponents(componentIds, ["data-table", "state-feedback"]), ["default", "loading", "error", "success"], ["Keep the most important fields visible at the top."], ["Expose row/field labels and keyboard navigation."], buildScreenAcceptanceCriteria("dashboard-detail")),
      createScreen("screen-dashboard-settings", "Settings", "Adjust preferences and permissions.", "/settings", ["profile", "preferences", "security"], pickComponents(componentIds, ["form-controls", "auth-form"]), ["default", "loading", "error", "success"], ["Keep destructive actions separated from safe ones."], ["Explain permission changes before submission."], buildScreenAcceptanceCriteria("dashboard-settings"))
    );
  }
  if (productId === "saas") {
    screens.push(
      createScreen("screen-auth", "Authentication", "Sign in, sign up, or recover access.", "/auth", ["login", "signup", "recover"], pickComponents(componentIds, ["auth-form", "form-controls"]), ["default", "loading", "error", "success"], ["Keep password and recovery states obvious."], ["Support keyboard-first completion."], buildScreenAcceptanceCriteria("auth")),
      createScreen("screen-onboarding", "Onboarding", "Guide the user through setup.", "/onboarding", ["steps", "progress", "setup"], pickComponents(componentIds, ["onboarding-stepper", "primary-cta"]), ["default", "loading", "empty", "error", "success"], ["Keep one action per step.", "Make progress visible."], ["Announce step changes to assistive tech."], buildScreenAcceptanceCriteria("onboarding"))
    );
  }
  if (productId === "blog" || productId === "content") {
    screens.push(
      createScreen("screen-listing", "Content Listing", "Browse articles or content pieces.", "/content", ["search", "filter", "cards"], pickComponents(componentIds, ["article-card", "search-filter"]), ["default", "loading", "empty", "error"], ["Keep titles and summaries readable."], ["Use semantic lists and headings."], buildScreenAcceptanceCriteria("listing")),
      createScreen("screen-article", "Article Detail", "Read a single article or content item.", "/content/:slug", ["title", "body", "related"], pickComponents(componentIds, ["layout-shell"]), ["default", "loading", "error", "success"], ["Preserve reading hierarchy."], ["Maintain heading order and readable line lengths."], buildScreenAcceptanceCriteria("article"))
    );
  }
  return uniqueById(screens);
}

function buildScreenSections(screen, options = {}) {
  return uniqueStrings([
    ...(screen.sections || []),
    "primary content",
    "supporting content",
    "state feedback"
  ]);
}

function buildScreenStates(screen, options = {}) {
  return uniqueStrings(screen.states || ["default", "loading", "empty", "error", "success"]);
}

function buildScreenAcceptanceCriteria(screen, options = {}) {
  return uniqueStrings([
    "The screen is usable on mobile and desktop.",
    "The screen has clear empty, loading, and error states.",
    "The screen is navigable with keyboard input.",
    "The screen provides enough context to complete the task."
  ]);
}

function buildInformationArchitectureSummary(recommendation, screens) {
  return uniqueStrings([
    `Primary product type: ${recommendation && recommendation.detected_product_type ? recommendation.detected_product_type : "saas"}.`,
    `Screens: ${screens.map((screen) => screen.name).join(", ")}`
  ]);
}

function buildUserFlowSummary(recommendation, screens) {
  return uniqueStrings([
    "Open the app.",
    "Find the main action or overview.",
    "Complete the task with visible feedback.",
    `Align the flow with ${recommendation && recommendation.recommended_style ? recommendation.recommended_style : "the selected UI direction"}.`
  ]);
}

function createScreen(screenId, name, purpose, routeHint, sections, components, states, responsiveNotes, accessibilityNotes, acceptanceCriteria) {
  return {
    screen_id: screenId,
    name,
    purpose,
    route_hint: routeHint,
    sections: uniqueStrings(sections),
    components: uniqueStrings(components),
    states: uniqueStrings(states),
    responsive_notes: uniqueStrings(responsiveNotes),
    accessibility_notes: uniqueStrings(accessibilityNotes),
    acceptance_criteria: uniqueStrings(acceptanceCriteria)
  };
}

function pickComponents(componentIds, wanted) {
  const found = (wanted || []).filter((item) => componentIds.includes(item));
  return found.length ? found : wanted;
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
    if (!item || !item.screen_id || seen.has(item.screen_id)) return false;
    seen.add(item.screen_id);
    return true;
  });
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  generateScreenBlueprint,
  inferScreens,
  buildScreenSections,
  buildScreenStates,
  buildScreenAcceptanceCriteria
};
