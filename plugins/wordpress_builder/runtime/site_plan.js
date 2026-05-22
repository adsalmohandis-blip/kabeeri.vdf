const { inferWordPressSiteType, inferWordPressBlueprint, buildWordPressAcceptanceChecklist } = require("../../../src/cli/services/wordpress_plans");

function buildWordPressSitePlan(input, options = {}) {
  const idea = String(input || options.idea || options.description || "WordPress site").trim();
  const siteType = inferWordPressSiteType(options.type || options.site_type || idea);
  const blueprintKey = options.blueprint || inferWordPressBlueprint(idea);
  const isWooCommerce = siteType === "woocommerce" || blueprintKey === "ecommerce";
  const themeType = options.theme_type || (isWooCommerce ? "custom-child-theme" : "block-theme");

  const contentModel = {
    pages: recommendPages(siteType, idea),
    custom_post_types: recommendCustomPostTypes(siteType, idea),
    taxonomies: recommendTaxonomies(siteType, idea),
    menus: recommendMenus(siteType),
    forms: recommendForms(siteType),
    roles: recommendRoles(siteType)
  };

  const themeStrategy = {
    theme_type: themeType,
    rationale: [
      "Keep WordPress core unchanged.",
      themeType === "block-theme" ? "Prefer block templates and theme.json where possible." : "Use a child theme or scoped custom theme for controlled overrides."
    ],
    templates: recommendThemeTemplates(siteType),
    block_patterns: recommendBlockPatterns(siteType),
    customization_boundaries: [
      "Do not edit wp-admin, wp-includes, or WordPress core files.",
      "Scope visual changes to a child theme or custom theme layer.",
      "Keep plugin-driven business logic outside the theme."
    ]
  };

  const pluginStrategy = {
    recommended_path: "custom-plugin",
    rationale: [
      "Business logic belongs in a plugin when it is not purely presentational.",
      "Use plugins for forms, integrations, CPTs, roles, admin UX, or workflow behavior."
    ],
    candidate_features: recommendPluginCandidates(siteType, idea),
    boundaries: [
      "Avoid putting business logic in theme templates.",
      "Use hooks, filters, CPTs, shortcodes, blocks, or settings pages for extension points."
    ]
  };

  const securityStrategy = {
    review_focus: [
      "Staging and backup confirmation before changes.",
      "Nonce, capability, sanitization, validation, and escaping discipline.",
      "Rollback and uninstall policy for any custom code."
    ],
    gate_recommendations: buildWordPressAcceptanceChecklist(siteType).slice(0, 6)
  };

  return {
    report_type: "wordpress_builder_plan",
    idea,
    site_type: siteType,
    blueprint_key: blueprintKey,
    content_model: contentModel,
    theme_strategy: themeStrategy,
    plugin_strategy: pluginStrategy,
    security_strategy: securityStrategy,
    docs_targets: [
      "docs/wordpress/SITE_PLAN.md",
      "docs/wordpress/THEME_PLAN.md",
      "docs/wordpress/PLUGIN_PLAN.md",
      "docs/wordpress/SECURITY_REVIEW.md",
      "docs/delivery/QA_CHECKLIST.md"
    ],
    planner_pipeline_hint: {
      workstreams: ["public_frontend", "backend", "security"],
      suggested_builder: "wordpress_builder",
      next_docs_step: "Use the theme-plan, plugin-plan, and security-cleanup-plan outputs before implementation."
    },
    acceptance_checklist: buildWordPressAcceptanceChecklist(siteType),
    next_action: "Use kvdf wordpress-builder theme-plan, plugin-plan, and security-cleanup-plan before implementation."
  };
}

function recommendPages(siteType, idea) {
  const pages = ["Home", "About", "Contact", "Privacy Policy"];
  if (siteType === "blog") pages.splice(1, 0, "Blog", "Article");
  if (siteType === "news") pages.splice(1, 0, "News", "Article");
  if (siteType === "booking") pages.splice(1, 0, "Services", "Booking", "Confirmation");
  if (siteType === "woocommerce") pages.splice(1, 0, "Shop", "Product", "Cart", "Checkout", "Account");
  if (/portfolio|agency|services|corporate/.test(String(idea).toLowerCase())) pages.splice(1, 0, "Services", "Case Studies");
  return Array.from(new Set(pages));
}

function recommendCustomPostTypes(siteType, idea) {
  const cpts = [];
  if (siteType === "blog" || siteType === "news") cpts.push("article", "author_profile");
  if (siteType === "booking") cpts.push("appointment", "service", "location");
  if (siteType === "woocommerce") cpts.push("product_extension", "order_note");
  if (/directory|listing/.test(String(idea).toLowerCase())) cpts.push("listing", "vendor");
  return cpts;
}

function recommendTaxonomies(siteType, idea) {
  const taxonomies = [];
  if (siteType === "blog" || siteType === "news") taxonomies.push("category", "topic", "tag");
  if (siteType === "booking") taxonomies.push("service_type", "location", "availability");
  if (siteType === "woocommerce") taxonomies.push("product_cat", "product_tag", "brand");
  if (/portfolio|services|corporate/.test(String(idea).toLowerCase())) taxonomies.push("service_area", "industry");
  return taxonomies;
}

function recommendMenus(siteType) {
  const menus = ["Primary", "Footer"];
  if (siteType === "woocommerce") menus.push("Account");
  if (siteType === "booking") menus.push("Booking");
  return menus;
}

function recommendForms(siteType) {
  const forms = ["Contact"];
  if (siteType === "booking") forms.push("Booking", "Availability Request");
  if (siteType === "woocommerce") forms.push("Checkout", "Account", "Newsletter");
  return forms;
}

function recommendRoles(siteType) {
  const roles = ["Admin", "Editor"];
  if (siteType === "booking") roles.push("Scheduler", "Front Desk");
  if (siteType === "woocommerce") roles.push("Store Manager", "Fulfillment");
  return roles;
}

function recommendThemeTemplates(siteType) {
  const templates = ["front-page.php", "page.php", "single.php", "archive.php"];
  if (siteType === "blog" || siteType === "news") templates.push("home.php", "single-post.php");
  if (siteType === "booking") templates.push("page-booking.php", "page-confirmation.php");
  if (siteType === "woocommerce") templates.push("woocommerce/archive-product.php", "woocommerce/single-product.php", "woocommerce/cart/cart.php", "woocommerce/checkout/form-checkout.php");
  return templates;
}

function recommendBlockPatterns(siteType) {
  const patterns = ["hero", "cta", "featured-content", "testimonials"];
  if (siteType === "blog" || siteType === "news") patterns.push("post-grid", "latest-posts");
  if (siteType === "booking") patterns.push("availability-grid", "booking-summary", "confirmation-banner");
  if (siteType === "woocommerce") patterns.push("product-grid", "cart-summary", "checkout-steps");
  return patterns;
}

function recommendPluginCandidates(siteType, idea) {
  const candidates = ["forms", "seo", "analytics", "security-hardening"];
  if (siteType === "booking") candidates.push("calendar", "notifications", "availability");
  if (siteType === "woocommerce") candidates.push("payments", "shipping", "tax", "inventory");
  if (/membership|portal|crm/.test(String(idea).toLowerCase())) candidates.push("memberships", "automation", "portal");
  return candidates;
}

module.exports = {
  buildWordPressSitePlan
};
