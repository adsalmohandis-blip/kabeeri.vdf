const fs = require("fs");
const path = require("path");
const wordpressStateService = require("../../../src/cli/services/wordpress");
const wordpressPlans = require("../../../src/cli/services/wordpress_plans");

function runLegacyWordPressCommand(action, value, flags = {}, rest = [], deps = {}) {
  const runtimeDeps = normalizeDeps(deps);
  const normalizedAction = normalizeLegacyAction(action);

  runtimeDeps.ensureWorkspace();
  wordpressStateService.ensureWordPressState(runtimeDeps.writeJsonFile, runtimeDeps.fileExists);

  if (!normalizedAction || normalizedAction === "help" || normalizedAction === "status" || normalizedAction === "list") {
    const report = buildLegacyStatusReport(runtimeDeps);
    printReport(report, flags, runtimeDeps.table);
    return report;
  }

  if (normalizedAction === "analyze" || normalizedAction === "analyse") {
    const targetPath = resolveWordPressTargetPath(flags.path || value || rest[0] || ".", runtimeDeps.repoRoot);
    const analysis = analyzeWordPressProject(targetPath, flags, runtimeDeps, wordpressPlans.inferWordPressBlueprint);
    wordpressStateService.recordWordPressAnalysis(runtimeDeps.readJsonFile, runtimeDeps.writeJsonFile, analysis);
    runtimeDeps.appendAudit("wordpress.analyzed", "wordpress", analysis.analysis_id, `WordPress project analyzed: ${analysis.relative_path}`);
    printReport(analysis, flags, runtimeDeps.table);
    return analysis;
  }

  if (normalizedAction === "plan") {
    const description = [value, ...rest].filter(Boolean).join(" ") || flags.description || flags.type || "WordPress website";
    const plan = wordpressPlans.buildWordPressPlan(description, flags);
    wordpressStateService.recordWordPressPlan(runtimeDeps.readJsonFile, runtimeDeps.writeJsonFile, plan);
    runtimeDeps.appendAudit("wordpress.plan_created", "wordpress_plan", plan.plan_id, `WordPress plan created for ${plan.site_type}`);
    printReport(plan, flags, runtimeDeps.table);
    return plan;
  }

  if (normalizedAction === "tasks" || normalizedAction === "create-tasks") {
    const plan = wordpressStateService.findWordPressPlan(flags.plan || value, runtimeDeps.readJsonFile);
    const tasks = wordpressStateService.createTasksFromWordPressPlan(plan, flags, runtimeDeps.readJsonFile, runtimeDeps.writeJsonFile);
    runtimeDeps.appendAudit("wordpress.tasks_created", "wordpress_plan", plan.plan_id, `Created ${tasks.length} WordPress tasks`);
    const report = { plan_id: plan.plan_id, tasks };
    printReport(report, flags, runtimeDeps.table);
    return report;
  }

  if (normalizedAction === "plugin" || normalizedAction === "plugins") {
    const pluginAction = normalizeLegacyAction(value || "status");
    if (pluginAction === "plan") {
      const description = rest.filter(Boolean).join(" ") || flags.description || flags.name || "WordPress plugin";
      const plan = wordpressPlans.buildWordPressPluginPlan(description, flags);
      wordpressStateService.recordWordPressPluginPlan(runtimeDeps.readJsonFile, runtimeDeps.writeJsonFile, plan);
      runtimeDeps.appendAudit("wordpress.plugin_plan_created", "wordpress_plugin_plan", plan.plugin_plan_id, `WordPress plugin plan created: ${plan.slug}`);
      printReport(plan, flags, runtimeDeps.table);
      return plan;
    }
    if (pluginAction === "tasks" || pluginAction === "create-tasks") {
      const plan = wordpressStateService.findWordPressPluginPlan(flags.plan || rest[0], runtimeDeps.readJsonFile);
      const tasks = wordpressStateService.createTasksFromWordPressPluginPlan(plan, flags, runtimeDeps.readJsonFile, runtimeDeps.writeJsonFile);
      runtimeDeps.appendAudit("wordpress.plugin_tasks_created", "wordpress_plugin_plan", plan.plugin_plan_id, `Created ${tasks.length} WordPress plugin tasks`);
      const report = { plugin_plan_id: plan.plugin_plan_id, tasks };
      printReport(report, flags, runtimeDeps.table);
      return report;
    }
    if (pluginAction === "scaffold") {
      const result = scaffoldWordPress("plugin", flags, runtimeDeps.repoRoot, runtimeDeps.fileExists, runtimeDeps.assertSafeName, wordpressPlans.slugifyWordPressName, buildWordPressPluginMain, buildWordPressPluginClass, buildWordPressPluginAdminClass, buildWordPressPluginPublicClass, buildWordPressPluginUninstall, buildWordPressScaffoldReadme);
      wordpressStateService.recordWordPressScaffold(runtimeDeps.readJsonFile, runtimeDeps.writeJsonFile, result);
      runtimeDeps.appendAudit("wordpress.plugin_scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress plugin scaffold created: ${result.slug}`);
      printReport(result, flags, runtimeDeps.table);
      return result;
    }
    if (pluginAction === "checklist") {
      const report = { checklist: wordpressPlans.buildWordPressPluginAcceptanceChecklist(flags.type || rest[0] || "general") };
      printReport(report, flags, runtimeDeps.table);
      return report;
    }
    throw new Error(`Unknown wordpress plugin action: ${pluginAction}`);
  }

  if (normalizedAction === "scaffold") {
    const scaffoldType = value || flags.type || rest[0] || "plugin";
    const result = scaffoldWordPress(scaffoldType, flags, runtimeDeps.repoRoot, runtimeDeps.fileExists, runtimeDeps.assertSafeName, wordpressPlans.slugifyWordPressName, buildWordPressPluginMain, buildWordPressPluginClass, buildWordPressPluginAdminClass, buildWordPressPluginPublicClass, buildWordPressPluginUninstall, buildWordPressThemeStyle, buildWordPressThemeFunctions, buildWordPressScaffoldReadme);
    wordpressStateService.recordWordPressScaffold(runtimeDeps.readJsonFile, runtimeDeps.writeJsonFile, result);
    runtimeDeps.appendAudit("wordpress.scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress ${result.type} scaffold created: ${result.slug}`);
    printReport(result, flags, runtimeDeps.table);
    return result;
  }

  if (normalizedAction === "checklist") {
    const report = { checklist: wordpressPlans.buildWordPressAcceptanceChecklist(flags.type || value || "general") };
    printReport(report, flags, runtimeDeps.table);
    return report;
  }

  throw new Error(`Unknown wordpress action: ${action}`);
}

function buildLegacyStatusReport(deps) {
  const state = deps.readJsonFile(".kabeeri/wordpress.json");
  return {
    report_type: "wordpress_compatibility_status",
    plugin_id: "wordpress_builder",
    status: "available",
    analyses: Array.isArray(state.analyses) ? state.analyses.length : 0,
    plans: Array.isArray(state.plans) ? state.plans.length : 0,
    plugin_plans: Array.isArray(state.plugin_plans) ? state.plugin_plans.length : 0,
    scaffolds: Array.isArray(state.scaffolds) ? state.scaffolds.length : 0,
    current_plan: state.current_plan_id || "none",
    next_action: "Use kvdf wordpress-builder plan --idea \"...\" --json."
  };
}

function normalizeDeps(deps) {
  const fallback = {
    ensureWorkspace: () => {},
    readJsonFile: (file) => {
      const resolved = path.resolve(file);
      if (!fs.existsSync(resolved)) return {};
      return JSON.parse(fs.readFileSync(resolved, "utf8"));
    },
    writeJsonFile: (file, value) => {
      const resolved = path.resolve(file);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    },
    repoRoot: () => process.cwd(),
    fileExists: (file) => fs.existsSync(path.resolve(file)),
    assertSafeName: (value) => {
      if (!String(value || "").trim()) throw new Error("Missing safe name.");
    },
    table: (headers, rows) => {
      const lines = [headers.join(" | ")];
      for (const row of rows) lines.push(row.join(" | "));
      return lines.join("\n");
    },
    appendAudit: () => {}
  };
  return { ...fallback, ...deps };
}

function normalizeLegacyAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (value === "analyse") return "analyze";
  if (value === "plugin" || value === "plugins") return value;
  if (value === "create-tasks") return "tasks";
  return value;
}

function resolveWordPressTargetPath(input, repoRoot) {
  const targetPath = path.resolve(repoRoot(), input || ".");
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`WordPress path not found or not a directory: ${input}`);
  }
  return targetPath;
}

function analyzeWordPressProject(targetPath, flags, deps, inferWordPressBlueprint) {
  const rel = path.relative(deps.repoRoot(), targetPath).replace(/\\/g, "/") || ".";
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

function scaffoldWordPress(type, flags, repoRoot, fileExists, assertSafeName, slugifyWordPressName, buildWordPressPluginMain, buildWordPressPluginClass, buildWordPressPluginAdminClass, buildWordPressPluginPublicClass, buildWordPressPluginUninstall, buildWordPressThemeStyleOrScaffold, buildWordPressThemeFunctions, buildWordPressScaffoldReadme) {
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

function printReport(report, flags, table) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (report && report.report_type === "wordpress_compatibility_status") {
    console.log("WordPress compatibility surface");
    console.log(table(["Area", "Value"], [
      ["Analyses", report.analyses],
      ["Plans", report.plans],
      ["Plugin plans", report.plugin_plans],
      ["Scaffolds", report.scaffolds],
      ["Current plan", report.current_plan]
    ]));
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

module.exports = {
  runLegacyWordPressCommand,
  analyzeWordPressProject,
  scaffoldWordPress,
  buildWordPressPluginMain,
  buildWordPressPluginClass,
  buildWordPressPluginAdminClass,
  buildWordPressPluginPublicClass,
  buildWordPressPluginUninstall,
  buildWordPressThemeStyle,
  buildWordPressThemeFunctions,
  buildWordPressScaffoldReadme
};
