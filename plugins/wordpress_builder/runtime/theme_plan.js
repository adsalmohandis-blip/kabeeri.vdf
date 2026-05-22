const { inferWordPressSiteType } = require("../../../src/cli/services/wordpress_plans");

function buildWordPressThemePlan(input, options = {}) {
  const idea = String(input || options.idea || options.description || "WordPress theme").trim();
  const siteType = inferWordPressSiteType(options.type || options.site_type || idea);
  const isWooCommerce = siteType === "woocommerce";
  const themeType = options.theme_type || (isWooCommerce ? "block-child-theme" : "block-theme");

  return {
    report_type: "wordpress_theme_plan",
    idea,
    site_type: siteType,
    theme_strategy: {
      theme_type: themeType,
      rationale: [
        "Keep the theme focused on presentation and templates.",
        themeType.includes("child") ? "Use a child theme to override only the required templates." : "Use block templates and theme.json for future-friendly editing."
      ],
      customization_boundaries: [
        "Do not edit WordPress core files.",
        "Keep business logic in plugins, not in the theme.",
        "Use scoped template overrides and documented pattern slots only."
      ]
    },
    templates: recommendTemplates(siteType),
    block_patterns: recommendBlockPatterns(siteType),
    customization_boundaries: [
      "Template changes are limited to the selected theme layer.",
      "No direct edits to wp-admin, wp-includes, or production secrets.",
      "Use documented pattern slots and reusable components."
    ],
    next_action: "Use these templates and block patterns in the Viber UI/UX docs and task punches."
  };
}

function recommendTemplates(siteType) {
  const templates = ["front-page.php", "page.php", "single.php", "archive.php", "parts/header.html", "parts/footer.html"];
  if (siteType === "blog" || siteType === "news") templates.push("home.php", "single-post.php", "category.php");
  if (siteType === "booking") templates.push("page-booking.php", "page-confirmation.php", "page-schedule.php");
  if (siteType === "woocommerce") templates.push("woocommerce/archive-product.php", "woocommerce/single-product.php", "woocommerce/cart/cart.php", "woocommerce/checkout/form-checkout.php");
  return templates;
}

function recommendBlockPatterns(siteType) {
  const patterns = ["hero", "cta", "feature-grid", "testimonial-strip", "faq"];
  if (siteType === "blog" || siteType === "news") patterns.push("post-grid", "author-card", "newsletter-signup");
  if (siteType === "booking") patterns.push("availability-grid", "booking-form", "confirmation-state");
  if (siteType === "woocommerce") patterns.push("product-grid", "cart-summary", "checkout-steps", "order-confirmation");
  return patterns;
}

module.exports = {
  buildWordPressThemePlan
};
