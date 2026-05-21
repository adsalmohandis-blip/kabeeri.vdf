const { recommendUiUx } = require("./recommender");

function generateChecklist(input, options = {}) {
  const recommendation = recommendUiUx(input, options);
  const checklist = [
    createCheck("a11y-focus", "Visible focus states exist on every actionable control.", "accessibility", "blocker", true),
    createCheck("a11y-contrast", "Color contrast meets target readability thresholds.", "accessibility", "blocker", true),
    createCheck("responsive-layout", "Layout responds cleanly to mobile widths.", "responsive", "blocker", true),
    createCheck("loading-state", "Loading states are present for async surfaces.", "interaction", "warning", true),
    createCheck("error-state", "Errors are explained with user-friendly messages.", "forms", "warning", true),
    createCheck("empty-state", "Empty states explain what to do next.", "content", "warning", true),
    createCheck("dashboard-state", "Dashboard views include no-data and zero-state treatment.", "dashboard", "warning", true),
    createCheck("perf-budget", "Heavy UI work is gated behind a performance budget check.", "performance", "info", true)
  ];
  if (recommendation.detected_product_type === "booking") {
    checklist.push(createCheck("booking-confirmation", "Booking and cancellation actions require confirmation at the right step.", "interaction", "warning", true));
  }
  if (recommendation.detected_product_type === "ecommerce") {
    checklist.push(createCheck("checkout-validation", "Forms show validation messages before submission.", "forms", "blocker", true));
  }
  return {
    report_type: "ui_ux_intelligence_checklist",
    input: String(input || ""),
    checklist,
    next_action: "Apply checklist before UI handoff."
  };
}

function createCheck(checkId, title, category, severity, required) {
  return {
    check_id: checkId,
    title,
    category,
    severity,
    required: Boolean(required)
  };
}

module.exports = {
  generateChecklist
};
