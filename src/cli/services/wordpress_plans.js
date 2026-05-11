function inferWordPressSiteType(text) {
  const value = String(text || "").toLowerCase();
  if (/woo|woocommerce|store|shop|ecommerce|checkout|cart|product|متجر/.test(value)) return "woocommerce";
  if (/blog|article|personal|مدونة|مقالات/.test(value)) return "blog";
  if (/news|magazine|أخبار/.test(value)) return "news";
  if (/booking|appointment|clinic|حجز|عيادة/.test(value)) return "booking";
  return "corporate";
}

function inferWordPressBlueprint(text) {
  const type = inferWordPressSiteType(text);
  if (type === "woocommerce") return "ecommerce";
  if (type === "blog") return "blog";
  if (type === "news") return "news_website";
  if (type === "booking") return "booking";
  return "corporate_website";
}

function slugifyWordPressName(value) {
  return String(value || "kabeeri-wordpress").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kabeeri-wordpress";
}

function inferWordPressPluginName(text) {
  const value = String(text || "").trim();
  if (!value) return "Kabeeri WordPress Plugin";
  return value.split(/\s+/).slice(0, 5).join(" ").replace(/^build\s+/i, "").replace(/^create\s+/i, "") || "Kabeeri WordPress Plugin";
}

function inferWordPressPluginType(text) {
  const value = String(text || "").toLowerCase();
  if (/woo|woocommerce|checkout|cart|order|payment|shipping|stock|refund/.test(value)) return "woocommerce";
  if (/booking|appointment|clinic|reservation|حجز|عيادة/.test(value)) return "booking";
  if (/api|webhook|integration|sync|crm|erp|gateway/.test(value)) return "integration";
  if (/cpt|post type|taxonomy|directory|listing|portfolio|content/.test(value)) return "cpt";
  return "business";
}

function buildWordPressAcceptanceChecklist(siteType) {
  const checklist = [
    "WordPress core paths are not modified directly.",
    "Existing sites have staging and backup confirmed before changes.",
    "wp-config.php secrets are not copied into prompts or commits.",
    "Implementation scope chooses custom plugin, custom theme, or child theme explicitly.",
    "CPTs, taxonomies, shortcodes, admin settings, REST routes, and templates are documented when used.",
    "Nonces, capabilities, sanitization, escaping, and validation are reviewed.",
    "Responsive, accessibility, SEO/GEO, sitemap/schema, forms, and error states are reviewed.",
    "Handoff includes changed files, plugin/theme activation notes, rollback notes, and tests."
  ];
  if (siteType === "woocommerce") {
    checklist.push("WooCommerce checkout, payment sandbox, tax, shipping, stock, emails, refunds, and order statuses are reviewed.");
  }
  return checklist;
}

function buildWordPressPhases(mode, siteType, blueprintKey) {
  const base = mode === "existing"
    ? ["Analyze existing site", "Confirm staging backup and rollback", "Map plugins themes content and risks", "Plan controlled changes"]
    : ["Define site purpose and blueprint", "Choose theme/plugin strategy", "Plan content model and pages", "Scaffold safe extension layer"];
  const implementation = [
    "Build custom plugin/theme or child theme in scoped files",
    "Configure SEO accessibility performance and security",
    "Test forms content flows permissions and responsive behavior",
    "Prepare handoff rollback notes and Owner verification"
  ];
  if (siteType === "woocommerce" || blueprintKey === "ecommerce") {
    implementation.splice(1, 0, "Validate WooCommerce catalog checkout payments shipping tax stock and emails");
  }
  return [...base, ...implementation].map((title, index) => ({
    phase_id: `wp-phase-${String(index + 1).padStart(2, "0")}`,
    title,
    status: "planned"
  }));
}

function buildWordPressTaskTemplates(mode, siteType, blueprintKey) {
  const tasks = [
    ["WordPress discovery and scope confirmation", "docs", ["Staging and backup status recorded.", "Forbidden paths listed.", "Implementation route selected."]],
    ["WordPress content model and page map", "public_frontend", ["Pages, CPTs, taxonomies, menus, and forms are documented.", "SEO/GEO requirements are listed."]],
    ["WordPress safe extension scaffold", "backend", ["Custom plugin, theme, or child theme scaffold exists.", "No WordPress core files changed."]],
    ["WordPress UI implementation and responsive review", "public_frontend", ["Desktop/mobile states reviewed.", "Accessibility and semantic HTML considered."]],
    ["WordPress security performance and release review", "security", ["Security scan executed.", "Caching/performance risks reviewed.", "Rollback and handoff notes prepared."]]
  ];
  if (siteType === "woocommerce" || blueprintKey === "ecommerce") {
    tasks.splice(2, 0, ["WooCommerce catalog checkout and order flow", "backend", ["Products, cart, checkout, payment, shipping, tax, stock, and emails are covered.", "No live payment changes without sandbox evidence."]]);
  }
  if (mode === "existing") {
    tasks.unshift(["Existing WordPress site analysis", "docs", ["Plugins and themes detected.", "Risks and next actions recorded.", "Owner approves scope before changes."]]);
  }
  return tasks.map(([title, workstream, acceptance], index) => ({
    template_id: `wp-task-template-${String(index + 1).padStart(2, "0")}`,
    title,
    workstream,
    type: workstream === "security" ? "review" : "implementation",
    acceptance_criteria: acceptance
  }));
}

function buildWordPressPlan(description, flags = {}) {
  const mode = flags.mode || (flags.existing ? "existing" : "new");
  const siteType = flags.type || inferWordPressSiteType(description);
  const blueprintKey = flags.blueprint || inferWordPressBlueprint(siteType || description);
  const isExisting = mode === "existing" || mode === "adoption";
  const isWoo = siteType === "woocommerce" || blueprintKey === "ecommerce";
  const plan = {
    plan_id: flags.id || `wordpress-plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    source: "kvdf wordpress plan",
    description,
    mode,
    site_type: siteType,
    blueprint_key: blueprintKey,
    delivery_mode: flags.delivery || (isExisting || isWoo ? "structured" : "agile"),
    recommended_prompt_pack: "wordpress",
    recommended_commands: [
      isExisting ? "kvdf wordpress analyze --path . --staging --backup" : "kvdf init --profile standard --mode agile",
      `kvdf blueprint recommend "${description}"`,
      `kvdf questionnaire plan "${description}" --framework wordpress --blueprint ${blueprintKey}`,
      `kvdf data-design context ${blueprintKey}`,
      `kvdf design recommend ${blueprintKey}`,
      "kvdf wordpress tasks",
      "kvdf prompt-pack compose wordpress --task <task-id>",
      "kvdf security scan",
      "kvdf handoff package --id wordpress-handoff --audience owner"
    ],
    phases: buildWordPressPhases(mode, siteType, blueprintKey),
    task_templates: buildWordPressTaskTemplates(mode, siteType, blueprintKey),
    acceptance_checklist: buildWordPressAcceptanceChecklist(siteType),
    safety_rules: [
      "Never edit wp-admin or wp-includes.",
      "Never commit wp-config.php secrets.",
      "Use a child theme or custom plugin for changes unless the Owner approves another route.",
      "Use staging and backup for existing sites.",
      "Keep WooCommerce order, payment, tax, and stock changes behind explicit tasks and review."
    ]
  };
  if (flags.analysis) plan.analysis_id = flags.analysis;
  return plan;
}

function buildWordPressPluginPlan(description, flags = {}) {
  const name = flags.name || inferWordPressPluginName(description);
  const slug = slugifyWordPressName(flags.slug || name);
  const pluginType = flags.type || inferWordPressPluginType(description);
  const plan = {
    plugin_plan_id: flags.id || `wordpress-plugin-plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    source: "kvdf wordpress plugin plan",
    name,
    slug,
    description,
    plugin_type: pluginType,
    target_path: `wp-content/plugins/${slug}/`,
    delivery_mode: flags.delivery || "structured",
    recommended_prompt_pack: "wordpress",
    recommended_commands: [
      `kvdf wordpress plugin scaffold --name "${name}"`,
      "kvdf wordpress plugin tasks",
      "kvdf prompt-pack compose wordpress --task <task-id>",
      "kvdf security scan",
      "kvdf validate"
    ],
    architecture: buildWordPressPluginArchitecture(slug, pluginType),
    task_templates: buildWordPressPluginTaskTemplates(pluginType),
    acceptance_checklist: buildWordPressPluginAcceptanceChecklist(pluginType),
    safety_rules: [
      "Plugin code must live under wp-content/plugins/<plugin-slug>/ only.",
      "Use hooks, filters, CPTs, taxonomies, REST routes, shortcodes, blocks, or admin settings instead of editing core.",
      "Protect all state-changing actions with nonces and capability checks.",
      "Never store secrets in source files or prompts."
    ]
  };
  return plan;
}

function buildWordPressPluginArchitecture(slug, pluginType) {
  const architecture = [
    { path: `${slug}.php`, purpose: "Plugin bootstrap, hooks, constants, and loader." },
    { path: "includes/class-plugin.php", purpose: "Core orchestration and boot logic." },
    { path: "admin/class-admin.php", purpose: "Admin settings, capability checks, and settings registration." },
    { path: "public/class-public.php", purpose: "Public-facing shortcodes, blocks, templates, or assets." },
    { path: "uninstall.php", purpose: "Optional cleanup and uninstall policy." }
  ];
  if (pluginType === "booking") {
    architecture.push({ path: "includes/class-booking.php", purpose: "Booking rules, scheduling logic, and admin/user flows." });
  }
  if (pluginType === "woocommerce") {
    architecture.push({ path: "includes/class-woocommerce.php", purpose: "WooCommerce hooks for checkout, products, orders, stock, emails, and refunds." });
  }
  if (pluginType === "integration") {
    architecture.push({ path: "includes/class-integration.php", purpose: "External API client, webhook verification, retries, and integration logs." });
  }
  return architecture;
}

function buildWordPressPluginTaskTemplates(pluginType) {
  const tasks = [
    ["Plugin requirements and boundaries", "docs", ["Plugin purpose, users, permissions, data ownership, and forbidden paths are documented.", "Activation, deactivation, uninstall, and rollback policy is clear."]],
    ["Plugin scaffold and bootstrapping", "backend", ["Plugin scaffold exists under wp-content/plugins only.", "ABSPATH guard, constants, loader, activation, deactivation, and uninstall files exist."]],
    ["Plugin security and permissions", "security", ["Nonces, capabilities, sanitization, escaping, validation, and direct access protection are reviewed.", "No secrets or production credentials are committed."]],
    ["Plugin admin and settings UX", "backend", ["Admin menus/settings use proper capabilities.", "Settings validation and error messages are implemented."]],
    ["Plugin public surface", "public_frontend", ["Shortcodes, blocks, templates, or frontend assets are scoped and accessible.", "Responsive, accessibility, and empty/error states are reviewed."]],
    ["Plugin testing and handoff", "qa", ["Activation/deactivation tested.", "Acceptance checklist completed.", "Handoff includes install, activation, rollback, changed files, and known risks."]]
  ];
  if (pluginType === "cpt" || pluginType === "booking" || pluginType === "business") {
    tasks.splice(3, 0, ["Custom post types and taxonomies", "backend", ["CPT labels, supports, capabilities, rewrite rules, and taxonomies are registered.", "Admin columns and content editing flow are reviewed."]]);
  }
  if (pluginType === "woocommerce") {
    tasks.splice(3, 0, ["WooCommerce extension flow", "backend", ["Checkout, products, orders, payment/shipping/tax/stock touchpoints are explicit.", "Sandbox evidence exists before payment or order lifecycle changes."]]);
  }
  if (pluginType === "integration") {
    tasks.splice(3, 0, ["External integration and webhooks", "backend", ["API credentials are stored safely.", "Webhook signatures, retries, logs, and failure states are handled."]]);
  }
  return tasks.map(([title, workstream, acceptance], index) => ({
    template_id: `wp-plugin-task-template-${String(index + 1).padStart(2, "0")}`,
    title,
    workstream,
    type: workstream === "docs" ? "planning" : workstream === "qa" || workstream === "security" ? "review" : "implementation",
    acceptance_criteria: acceptance
  }));
}

function buildWordPressPluginAcceptanceChecklist(pluginType) {
  const checklist = [
    "Plugin lives under wp-content/plugins/<plugin-slug>/ only.",
    "Plugin header, text domain, version, ABSPATH guard, and bootstrap are present.",
    "Activation and deactivation hooks are defined when needed.",
    "Uninstall behavior is explicit and does not delete customer data unexpectedly.",
    "Admin settings use capability checks and settings validation.",
    "All state-changing requests use nonces.",
    "All user input is sanitized and validated.",
    "All output is escaped for the correct context.",
    "REST routes define permissions callbacks.",
    "Shortcodes/blocks avoid unsafe HTML and handle empty/error states.",
    "Assets are enqueued through WordPress APIs and scoped to plugin screens where possible.",
    "No WordPress core, wp-config.php, uploads, or third-party plugin files are modified.",
    "Install, activation, rollback, and handoff notes are written."
  ];
  if (pluginType === "woocommerce") {
    checklist.push("WooCommerce checkout, order, stock, refund, tax, shipping, and email changes have sandbox evidence.");
  }
  if (pluginType === "integration") {
    checklist.push("External API failures, retries, webhook verification, and logs are covered.");
  }
  return checklist;
}

module.exports = {
  buildWordPressAcceptanceChecklist,
  buildWordPressPhases,
  buildWordPressPlan,
  buildWordPressPluginAcceptanceChecklist,
  buildWordPressPluginArchitecture,
  buildWordPressPluginTaskTemplates,
  buildWordPressPluginPlan,
  buildWordPressTaskTemplates,
  inferWordPressBlueprint,
  inferWordPressPluginName,
  inferWordPressPluginType,
  inferWordPressSiteType,
  slugifyWordPressName
};
