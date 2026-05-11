const fs = require("fs");
const path = require("path");
const {
  ensureWordPressState,
  recordWordPressAnalysis,
  recordWordPressPlan,
  recordWordPressPluginPlan,
  recordWordPressScaffold,
  findWordPressPlan,
  findWordPressPluginPlan,
  createTasksFromWordPressPlan,
  createTasksFromWordPressPluginPlan
} = require("../services/wordpress");
const wordpressPlans = require("../services/wordpress_plans");

/**
 * WordPress command module for Kabeeri VDF.
 * Handles WordPress site analysis, planning, scaffolding, and task generation.
 */
function wordpress(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace,
    readJsonFile,
    writeJsonFile,
    repoRoot,
    fileExists,
    assertSafeName,
    table,
    appendAudit
  } = deps;

  ensureWorkspace();
  ensureWordPressState(writeJsonFile, fileExists);

  if (!action || action === "help" || action === "status" || action === "list") {
    const state = readJsonFile(".kabeeri/wordpress.json");
    console.log("WordPress capability");
    console.log(table(["Area", "Value"], [
      ["Analyses", state.analyses.length],
      ["Plans", state.plans.length],
      ["Scaffolds", state.scaffolds.length],
      ["Current plan", state.current_plan_id || "none"]
    ]));
    console.log("");
    console.log(table(["Command", "Purpose"], [
      ["wordpress analyze --path <folder>", "Analyze an existing WordPress site before changes."],
      ["wordpress plan \"site description\"", "Create a WordPress build/adoption plan."],
      ["wordpress tasks --plan <id>", "Create governed tasks from the latest or selected WordPress plan."],
      ["wordpress plugin plan \"plugin description\" --name <Name>", "Create a governed WordPress plugin development plan."],
      ["wordpress plugin tasks --plan <id>", "Create governed tasks from the latest or selected plugin plan."],
      ["wordpress scaffold plugin --name <Name>", "Create a safe starter plugin skeleton."],
      ["wordpress scaffold theme --name <Name>", "Create a safe starter theme skeleton."],
      ["wordpress scaffold child-theme --name <Name> --parent <theme>", "Create a child theme skeleton."]
    ]));
    return;
  }

  if (action === "analyze" || action === "analyse") {
    const targetPath = resolveWordPressTargetPath(flags.path || value || rest[0] || ".", repoRoot);
    const analysis = analyzeWordPressProject(targetPath, flags, repoRoot, fileExists, readJsonFile, writeJsonFile, wordpressPlans.inferWordPressBlueprint, wordpressPlans.inferWordPressSiteType);
    recordWordPressAnalysis(readJsonFile, writeJsonFile, analysis);
    appendAudit("wordpress.analyzed", "wordpress", analysis.analysis_id, `WordPress project analyzed: ${analysis.relative_path}`);
    if (flags.json) console.log(JSON.stringify(analysis, null, 2));
    else renderWordPressAnalysis(analysis, table);
    return;
  }

  if (action === "plan") {
    const description = [value, ...rest].filter(Boolean).join(" ") || flags.description || flags.type || "WordPress website";
    const plan = wordpressPlans.buildWordPressPlan(description, flags);
    recordWordPressPlan(readJsonFile, writeJsonFile, plan);
    appendAudit("wordpress.plan_created", "wordpress_plan", plan.plan_id, `WordPress plan created for ${plan.site_type}`);
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else renderWordPressPlan(plan, table);
    return;
  }

  if (action === "tasks" || action === "create-tasks") {
    const plan = findWordPressPlan(flags.plan || value, readJsonFile);
    const tasks = createTasksFromWordPressPlan(plan, flags, readJsonFile, writeJsonFile);
    appendAudit("wordpress.tasks_created", "wordpress_plan", plan.plan_id, `Created ${tasks.length} WordPress tasks`);
    if (flags.json) console.log(JSON.stringify({ plan_id: plan.plan_id, tasks }, null, 2));
    else console.log(table(["Task", "Title", "Workstream"], tasks.map((item) => [item.id, item.title, item.workstream || ""])));
    return;
  }

  if (action === "plugin" || action === "plugins") {
    const pluginAction = value || "status";
    if (pluginAction === "plan") {
      const description = rest.filter(Boolean).join(" ") || flags.description || flags.name || "WordPress plugin";
      const plan = wordpressPlans.buildWordPressPluginPlan(description, flags);
      recordWordPressPluginPlan(readJsonFile, writeJsonFile, plan);
      appendAudit("wordpress.plugin_plan_created", "wordpress_plugin_plan", plan.plugin_plan_id, `WordPress plugin plan created: ${plan.slug}`);
      if (flags.json) console.log(JSON.stringify(plan, null, 2));
      else renderWordPressPluginPlan(plan, table);
      return;
    }
    if (pluginAction === "tasks" || pluginAction === "create-tasks") {
      const plan = findWordPressPluginPlan(flags.plan || rest[0], readJsonFile);
      const tasks = createTasksFromWordPressPluginPlan(plan, flags, readJsonFile, writeJsonFile);
      appendAudit("wordpress.plugin_tasks_created", "wordpress_plugin_plan", plan.plugin_plan_id, `Created ${tasks.length} WordPress plugin tasks`);
      if (flags.json) console.log(JSON.stringify({ plugin_plan_id: plan.plugin_plan_id, tasks }, null, 2));
      else console.log(table(["Task", "Title", "Workstream"], tasks.map((item) => [item.id, item.title, item.workstream || ""])));
      return;
    }
    if (pluginAction === "scaffold") {
      const result = scaffoldWordPress("plugin", flags, repoRoot, fileExists, assertSafeName, slugifyWordPressName, buildWordPressPluginMain, buildWordPressPluginClass, buildWordPressPluginAdminClass, buildWordPressPluginPublicClass, buildWordPressPluginUninstall, buildWordPressScaffoldReadme);
      recordWordPressScaffold(readJsonFile, writeJsonFile, result);
      appendAudit("wordpress.plugin_scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress plugin scaffold created: ${result.slug}`);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else {
        console.log(`Created WordPress plugin scaffold at ${result.path}`);
        console.log(table(["File", "Status"], result.files.map((file) => [file, "created"])));
      }
      return;
    }
    if (pluginAction === "checklist") {
      const checklist = wordpressPlans.buildWordPressPluginAcceptanceChecklist(flags.type || rest[0] || "general");
      if (flags.json) console.log(JSON.stringify({ checklist }, null, 2));
      else checklist.forEach((item) => console.log(`- ${item}`));
      return;
    }
    throw new Error(`Unknown wordpress plugin action: ${pluginAction}`);
  }

  if (action === "scaffold") {
    const scaffoldType = value || flags.type || rest[0] || "plugin";
    const result = scaffoldWordPress(scaffoldType, flags, repoRoot, fileExists, assertSafeName, wordpressPlans.slugifyWordPressName, buildWordPressPluginMain, buildWordPressPluginClass, buildWordPressPluginAdminClass, buildWordPressPluginPublicClass, buildWordPressPluginUninstall, buildWordPressThemeStyle, buildWordPressThemeFunctions, buildWordPressScaffoldReadme);
    recordWordPressScaffold(readJsonFile, writeJsonFile, result);
    appendAudit("wordpress.scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress ${result.type} scaffold created: ${result.slug}`);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`Created WordPress ${result.type} scaffold at ${result.path}`);
      console.log(table(["File", "Status"], result.files.map((file) => [file, "created"])));
    }
    return;
  }

  if (action === "checklist") {
    const checklist = wordpressPlans.buildWordPressAcceptanceChecklist(flags.type || value || "general");
    if (flags.json) console.log(JSON.stringify({ checklist }, null, 2));
    else checklist.forEach((item) => console.log(`- ${item}`));
    return;
  }

  throw new Error(`Unknown wordpress action: ${action}`);
}

function resolveWordPressTargetPath(input, repoRoot) {
  const targetPath = path.resolve(repoRoot(), input || ".");
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`WordPress path not found or not a directory: ${input}`);
  }
  return targetPath;
}

function analyzeWordPressProject(targetPath, flags, repoRoot, fileExists, readJsonFile, writeJsonFile, inferWordPressBlueprint, inferWordPressSiteType) {
  const rel = path.relative(repoRoot(), targetPath).replace(/\\/g, "/") || ".";
  const files = new Set(fs.readdirSync(targetPath, { withFileTypes: true }).filter((item) => item.isFile()).map((item) => item.name));
  const dirs = new Set(fs.readdirSync(targetPath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name));
  const contentPath = path.join(targetPath, "wp-content");
  const pluginPath = path.join(contentPath, "plugins");
  const themePath = path.join(contentPath, "themes");
  const plugins = fs.existsSync(pluginPath) ? fs.readdirSync(pluginPath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort() : [];
  const themes = fs.existsSync(themePath) ? fs.readdirSync(themePath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort() : [];
  const features = [];
  if (dirs.has("wp-content")) features.push("wp_content");
  if (files.has("wp-config.php")) features.push("wp_config");
  if (dirs.has("wp-admin") || dirs.has("wp-includes")) features.push("wordpress_core_present");
  if (plugins.includes("woocommerce")) features.push("woocommerce");
  if (plugins.includes("advanced-custom-fields") || plugins.includes("advanced-custom-fields-pro")) features.push("acf");
  if (plugins.includes("elementor") || plugins.includes("elementor-pro")) features.push("page_builder");
  if (plugins.includes("wordpress-seo") || plugins.includes("rank-math")) features.push("seo_plugin");
  const riskSignals = [];
  if (!dirs.has("wp-content") && !files.has("wp-config.php")) riskSignals.push("not_wordpress_root_or_missing_wp_content");
  if (files.has("wp-config.php")) riskSignals.push("wp_config_present_review_secrets");
  if (!flags.staging) riskSignals.push("staging_not_confirmed");
  if (!flags.backup) riskSignals.push("backup_not_confirmed");
  if (!plugins.length && dirs.has("wp-content")) riskSignals.push("plugins_not_detected_or_empty");
  const detectedType = features.includes("woocommerce") ? "woocommerce" : features.includes("wp_content") || features.includes("wp_config") ? "wordpress_site" : "unknown";
  const blueprint = features.includes("woocommerce") ? "ecommerce" : inferWordPressBlueprint(flags.type || flags.description || rel);
  return {
    analysis_id: `wordpress-analysis-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source: "kvdf wordpress analyze",
    absolute_path: targetPath,
    relative_path: rel,
    detected_type: detectedType,
    detected_features: features,
    plugins,
    themes,
    recommended_blueprint: blueprint,
    recommended_prompt_pack: "wordpress",
    risk_level: riskSignals.length >= 3 ? "high" : riskSignals.length ? "medium" : "low",
    risk_signals: riskSignals,
    forbidden_paths: ["wp-admin/", "wp-includes/", "wp-config.php", ".env", "uploads/"],
    allowed_change_zones: ["wp-content/plugins/<custom-plugin>/", "wp-content/themes/<child-or-custom-theme>/", "wp-content/mu-plugins/<custom-mu-plugin>/"],
    next_actions: [
      "Confirm staging and backup before editing.",
      `Run \`kvdf wordpress plan --mode existing --type ${detectedType === "woocommerce" ? "woocommerce" : blueprint}\`.`,
      "Use `kvdf prompt-pack compose wordpress --task <task-id>` for implementation tasks.",
      "Do not modify WordPress core files or production secrets.",
      "Create governed tasks with explicit plugin/theme scope before code changes."
    ]
  };
}

function buildWordPressPlan(description, flags, inferWordPressSiteType, inferWordPressBlueprint) {
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

function buildWordPressPluginPlan(description, flags, inferWordPressPluginName, slugifyWordPressName, inferWordPressPluginType, buildWordPressPluginArchitecture, buildWordPressPluginTaskTemplates, buildWordPressPluginAcceptanceChecklist) {
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
      "Use hooks, filters, CPTs, taxonomies, REST routes, shortcodes, blocks, or admin settings instead of editing WordPress core.",
      "Every form or state-changing request needs nonce and capability checks.",
      "Every input must be sanitized and every output escaped.",
      "Activation, deactivation, uninstall, migration, and rollback behavior must be documented before release."
    ]
  };
  return plan;
}

function buildWordPressPluginArchitecture(slug, pluginType) {
  const architecture = [
    { path: `${slug}.php`, purpose: "Plugin header, ABSPATH guard, constants, loader require, activation/deactivation hooks." },
    { path: "includes/class-plugin.php", purpose: "Central boot class that registers hooks and composes admin/public modules." },
    { path: "admin/class-admin.php", purpose: "Admin menus, settings pages, capability checks, settings validation." },
    { path: "public/class-public.php", purpose: "Shortcodes, frontend assets, public rendering, safe form handlers." },
    { path: "uninstall.php", purpose: "Explicit cleanup policy for options, custom tables, scheduled hooks, and plugin-owned data." },
    { path: "assets/css/ and assets/js/", purpose: "Scoped admin/public assets registered with WordPress enqueue APIs." },
    { path: "languages/", purpose: "Translation-ready text domain files." }
  ];
  if (pluginType === "cpt" || pluginType === "booking" || pluginType === "business") {
    architecture.push({ path: "includes/class-content-types.php", purpose: "Custom post types, taxonomies, rewrite labels, and capability mapping." });
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

function scaffoldWordPress(type, flags, repoRoot, fileExists, assertSafeName, slugifyWordPressName, buildWordPressPluginMain, buildWordPressPluginClass, buildWordPressPluginAdminClass, buildWordPressPluginPublicClass, buildWordPressPluginUninstall, buildWordPressThemeStyleOrScaffold, buildWordPressScaffoldReadme) {
  const name = flags.name || flags.slug || `kabeeri-${type}`;
  const slug = slugifyWordPressName(name);
  assertSafeName(slug);
  const root = path.resolve(repoRoot(), flags.path || ".");
  const force = Boolean(flags.force);
  const normalizedType = String(type || "plugin").toLowerCase();
  if (!["plugin", "theme", "child-theme", "child"].includes(normalizedType)) throw new Error(`Unknown WordPress scaffold type: ${type}`);
  const isTheme = normalizedType === "theme" || normalizedType === "child-theme" || normalizedType === "child";
  const base = isTheme ? path.join(root, "wp-content", "themes", slug) : path.join(root, "wp-content", "plugins", slug);
  if (fs.existsSync(base) && fs.readdirSync(base).length && !force) throw new Error(`Scaffold path is not empty: ${path.relative(repoRoot(), base).replace(/\\/g, "/")}. Use --force to write into it.`);
  fs.mkdirSync(base, { recursive: true });
  const files = [];
  const write = (relative, content) => {
    const target = path.join(base, relative);
    if (fs.existsSync(target) && !force) return;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
    files.push(path.relative(repoRoot(), target).replace(/\\/g, "/"));
  };
  if (!isTheme) {
    write(`${slug}.php`, buildWordPressPluginMain(slug, name));
    write("includes/class-plugin.php", buildWordPressPluginClass(slug));
    write("admin/class-admin.php", buildWordPressPluginAdminClass(slug));
    write("public/class-public.php", buildWordPressPluginPublicClass(slug));
    write("uninstall.php", buildWordPressPluginUninstall(slug));
    write("assets/css/admin.css", "");
    write("assets/css/public.css", "");
    write("assets/js/admin.js", "");
    write("assets/js/public.js", "");
    write("languages/.gitkeep", "");
    write("README.md", buildWordPressScaffoldReadme("plugin", slug));
  } else {
    const parent = flags.parent || "twentytwentyfour";
    write("style.css", buildWordPressThemeStyleOrScaffold(slug, name, normalizedType === "child-theme" || normalizedType === "child" ? parent : null));
    write("functions.php", buildWordPressThemeFunctions(slug, Boolean(normalizedType === "child-theme" || normalizedType === "child")));
    write("README.md", buildWordPressScaffoldReadme(normalizedType === "theme" ? "theme" : "child-theme", slug));
  }
  return {
    scaffold_id: `wordpress-scaffold-${Date.now()}`,
    created_at: new Date().toISOString(),
    type: normalizedType === "child" ? "child-theme" : normalizedType,
    slug,
    path: path.relative(repoRoot(), base).replace(/\\/g, "/"),
    files
  };
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

function buildWordPressPluginMain(slug, name) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  const constantPrefix = slug.replace(/-/g, "_").toUpperCase();
  return `<?php
/**
 * Plugin Name: ${name}
 * Description: Kabeeri-scaffolded WordPress plugin. Keep custom behavior here instead of editing WordPress core.
 * Version: 0.1.0
 * Author: Kabeeri VDF
 * Text Domain: ${slug}
 */

if (!defined('ABSPATH')) {
    exit;
}

define('${constantPrefix}_VERSION', '0.1.0');
define('${constantPrefix}_FILE', __FILE__);
define('${constantPrefix}_PATH', plugin_dir_path(__FILE__));
define('${constantPrefix}_URL', plugin_dir_url(__FILE__));

require_once ${constantPrefix}_PATH . 'includes/class-plugin.php';

register_activation_hook(__FILE__, ['${className}_Plugin', 'activate']);
register_deactivation_hook(__FILE__, ['${className}_Plugin', 'deactivate']);

add_action('plugins_loaded', ['${className}_Plugin', 'boot']);
`;
}

function buildWordPressPluginClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  const constantPrefix = slug.replace(/-/g, "_").toUpperCase();
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Plugin {
    public static function boot(): void {
        require_once ${constantPrefix}_PATH . 'admin/class-admin.php';
        require_once ${constantPrefix}_PATH . 'public/class-public.php';

        ${className}_Admin::boot();
        ${className}_Public::boot();
    }

    public static function activate(): void {
        flush_rewrite_rules();
    }

    public static function deactivate(): void {
        flush_rewrite_rules();
    }
}
`;
}

function buildWordPressPluginAdminClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Admin {
    public static function boot(): void {
        add_action('admin_menu', [__CLASS__, 'register_menu']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
    }

    public static function register_menu(): void {
        add_options_page(
            __('${slug}', '${slug}'),
            __('${slug}', '${slug}'),
            'manage_options',
            '${slug}',
            [__CLASS__, 'render_settings_page']
        );
    }

    public static function register_settings(): void {
        register_setting('${slug}', '${slug}_settings', [
            'type' => 'array',
            'sanitize_callback' => [__CLASS__, 'sanitize_settings'],
            'default' => [],
        ]);
    }

    public static function sanitize_settings(array $settings): array {
        return array_map('sanitize_text_field', $settings);
    }

    public static function render_settings_page(): void {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', '${slug}'));
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('${slug}', '${slug}'); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields('${slug}'); ?>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
`;
}

function buildWordPressPluginPublicClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Public {
    public static function boot(): void {
        add_shortcode('${slug}', [__CLASS__, 'render_shortcode']);
    }

    public static function render_shortcode(array $atts = []): string {
        $atts = shortcode_atts([], $atts, '${slug}');
        return '<div class="${slug}">' . esc_html__('${slug} is ready.', '${slug}') . '</div>';
    }
}
`;
}

function buildWordPressPluginUninstall(slug) {
  return `<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Keep customer data by default. Add explicit cleanup here only when the Owner approves data removal.
delete_option('${slug}_settings');
`;
}

function buildWordPressThemeStyle(slug, name, parent) {
  return `/*
Theme Name: ${name}
${parent ? `Template: ${parent}\n` : ""}Theme URI: https://example.com/
Author: Kabeeri VDF
Description: Kabeeri-scaffolded ${parent ? "child" : "custom"} theme. Keep edits scoped and review responsive/accessibility states.
Version: 0.1.0
Text Domain: ${slug}
*/
`;
}

function buildWordPressThemeFunctions(slug, isChild) {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_enqueue_scripts', function (): void {
    ${isChild ? "wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');\n    " : ""}wp_enqueue_style('${slug}-style', get_stylesheet_uri(), [], '0.1.0');
});
`;
}

function buildWordPressScaffoldReadme(type, slug) {
  return `# ${slug}

Type: WordPress ${type}

Generated by Kabeeri VDF.

## Safety

- Do not edit WordPress core files.
- Keep each change attached to a governed Kabeeri task.
- Use \`kvdf prompt-pack compose wordpress --task <task-id>\` before implementation.
- Run security, accessibility, responsive, and handoff checks before delivery.
`;
}

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

function renderWordPressAnalysis(analysis, table) {
  console.log("WordPress analysis written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Path", analysis.relative_path],
    ["Detected type", analysis.detected_type],
    ["Features", analysis.detected_features.join(", ") || "none"],
    ["Plugins", analysis.plugins.slice(0, 8).join(", ") || "none"],
    ["Themes", analysis.themes.slice(0, 8).join(", ") || "none"],
    ["Blueprint", analysis.recommended_blueprint],
    ["Risk", analysis.risk_level]
  ]));
  console.log("");
  console.log("Next actions:");
  analysis.next_actions.forEach((item) => console.log(`- ${item}`));
}

function renderWordPressPlan(plan, table) {
  console.log("WordPress plan written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Plan", plan.plan_id],
    ["Mode", plan.mode],
    ["Site type", plan.site_type],
    ["Blueprint", plan.blueprint_key],
    ["Delivery", plan.delivery_mode],
    ["Prompt pack", plan.recommended_prompt_pack]
  ]));
  console.log("");
  console.log("Phases:");
  plan.phases.forEach((item) => console.log(`- ${item.phase_id}: ${item.title}`));
  console.log("");
  console.log("Recommended commands:");
  plan.recommended_commands.forEach((item) => console.log(`- ${item}`));
}

function renderWordPressPluginPlan(plan, table) {
  console.log("WordPress plugin plan written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Plan", plan.plugin_plan_id],
    ["Name", plan.name],
    ["Slug", plan.slug],
    ["Type", plan.plugin_type],
    ["Path", plan.target_path],
    ["Prompt pack", plan.recommended_prompt_pack]
  ]));
  console.log("");
  console.log("Architecture:");
  plan.architecture.forEach((item) => console.log(`- ${item.path}: ${item.purpose}`));
  console.log("");
  console.log("Recommended commands:");
  plan.recommended_commands.forEach((item) => console.log(`- ${item}`));
}

module.exports = {
  wordpress,
  // Export helper functions for testing and composition
  buildWordPressPlan,
  buildWordPressPluginPlan,
  buildWordPressAcceptanceChecklist,
  buildWordPressPluginAcceptanceChecklist,
  inferWordPressSiteType,
  inferWordPressBlueprint,
  inferWordPressPluginType,
  slugifyWordPressName
};
