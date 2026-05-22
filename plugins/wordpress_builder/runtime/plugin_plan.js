function buildWordPressPluginPlan(input, options = {}) {
  const idea = String(input || options.idea || options.description || "WordPress plugin").trim();
  const pluginType = inferWordPressPluginType(options.type || options.plugin_type || idea);
  const pluginName = options.name || inferWordPressPluginName(idea);
  const slug = slugifyWordPressName(options.slug || pluginName);

  return {
    report_type: "wordpress_plugin_plan",
    idea,
    plugin_name: pluginName,
    slug,
    plugin_type: pluginType,
    plugin_strategy: {
      recommended_path: `wp-content/plugins/${slug}/`,
      data_ownership: [
        "Keep plugin-owned data separate from the theme.",
        "Document uninstall behavior and data retention clearly."
      ],
      lifecycle: ["activation", "deactivation", "uninstall"],
      extension_surface: recommendExtensionSurface(pluginType)
    },
    recommended_plugin_categories: recommendPluginCategories(pluginType),
    custom_plugin_candidates: recommendCustomPluginCandidates(pluginType, idea),
    risk_notes: recommendRiskNotes(pluginType),
    next_action: "Use the plugin strategy as the governed implementation scope for WordPress-specific behavior."
  };
}

function inferWordPressPluginName(text) {
  const value = String(text || "").trim();
  if (!value) return "Kabeeri WordPress Plugin";
  return value.split(/\s+/).slice(0, 5).join(" ").replace(/^build\s+/i, "").replace(/^create\s+/i, "") || "Kabeeri WordPress Plugin";
}

function inferWordPressPluginType(text) {
  const value = String(text || "").toLowerCase();
  if (/woo|woocommerce|checkout|cart|order|payment|shipping|stock|refund/.test(value)) return "woocommerce";
  if (/booking|appointment|clinic|reservation|Ø­Ø¬Ø²|Ø¹ÙŠØ§Ø¯Ø©/.test(value)) return "booking";
  if (/api|webhook|integration|sync|crm|erp|gateway/.test(value)) return "integration";
  if (/cpt|post type|taxonomy|directory|listing|portfolio|content/.test(value)) return "cpt";
  return "business";
}

function slugifyWordPressName(value) {
  return String(value || "kabeeri-wordpress").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kabeeri-wordpress";
}

function recommendExtensionSurface(pluginType) {
  if (pluginType === "woocommerce") {
    return ["checkout hooks", "product blocks", "order actions", "shipping/payment integrations"];
  }
  if (pluginType === "booking") {
    return ["availability calendar", "booking forms", "notifications", "scheduling workflow"];
  }
  if (pluginType === "integration") {
    return ["REST endpoints", "webhooks", "admin settings", "sync jobs"];
  }
  if (pluginType === "cpt") {
    return ["custom post types", "taxonomies", "admin columns", "template helpers"];
  }
  return ["shortcodes", "blocks", "settings pages", "template helpers"];
}

function recommendPluginCategories(pluginType) {
  const categories = ["security", "seo", "forms", "analytics"];
  if (pluginType === "woocommerce") categories.push("payments", "shipping", "inventory", "customer-account");
  if (pluginType === "booking") categories.push("calendar", "availability", "notifications", "scheduler");
  if (pluginType === "integration") categories.push("api", "webhooks", "sync", "logs");
  if (pluginType === "cpt") categories.push("content-model", "editor-ux", "taxonomy", "search");
  return categories;
}

function recommendCustomPluginCandidates(pluginType, idea) {
  const candidates = [];
  if (pluginType === "woocommerce") {
    candidates.push("checkout enhancer", "product badge manager", "order workflow helper");
  } else if (pluginType === "booking") {
    candidates.push("booking calendar", "availability rules", "reminder automation");
  } else if (pluginType === "integration") {
    candidates.push("external sync connector", "webhook relay", "integration log viewer");
  } else if (pluginType === "cpt") {
    candidates.push("content-type manager", "taxonomy helper", "listing filter");
  } else {
    candidates.push("custom shortcode set", "admin settings helper", "frontend component helper");
  }
  if (/membership|portal|crm/.test(String(idea).toLowerCase())) candidates.push("role-based portal helper");
  return candidates;
}

function recommendRiskNotes(pluginType) {
  const notes = [
    "Keep the plugin scoped to a single responsibility.",
    "Use activation hooks, capability checks, and explicit uninstall policy."
  ];
  if (pluginType === "woocommerce") notes.push("Treat payment and order changes as high-risk and stage them behind sandbox evidence.");
  if (pluginType === "integration") notes.push("Document retry, timeout, and failure-state behavior for every external API call.");
  return notes;
}

module.exports = {
  buildWordPressPluginPlan
};
