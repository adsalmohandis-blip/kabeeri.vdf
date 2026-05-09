const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const bin = path.join(repoRoot, "bin", "kvdf.js");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function runKvdf(args, options = {}) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd: options.cwd || repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8"
  });
  if (options.expectFailure) {
    assert.notStrictEqual(result.status, 0, `Expected failure for kvdf ${args.join(" ")}`);
    return result;
  }
  assert.strictEqual(result.status, 0, `kvdf ${args.join(" ")} failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  return result;
}

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-test-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("root commands validate repository assets", () => {
  assert.match(runKvdf(["--version"]).stdout, /kvdf 0\.2\.0/);
  assert.match(runKvdf(["--help"]).stdout, /Kabeeri VDF CLI/);
  assert.match(runKvdf(["create", "--help"]).stdout, /kvdf create --profile lite/);
  for (const command of ["sprint", "session", "acceptance", "developer", "agent", "lock", "pricing", "usage", "release", "design", "policy", "workstream", "vibe", "ask", "capture", "package", "upgrade", "readiness", "governance", "reports", "context-pack", "preflight", "model-route", "handoff", "security", "migration", "adr", "ai-run", "structure", "blueprint", "data-design", "evolution", "wordpress", "docs"]) {
    const help = runKvdf([command, "--help"]).stdout;
    assert.match(help, /Usage:/, `${command} help should include usage`);
    assert.doesNotMatch(help, /No detailed help/, `${command} should have detailed help`);
  }
  assert.match(runKvdf(["validate"]).stdout, /plans.*valid|totals valid/s);
  assert.match(runKvdf(["validate", "runtime-schemas"]).stdout, /runtime schema registry checked/);
  assert.match(runKvdf(["validate", "foldering"]).stdout, /foldering map checked/);
  assert.match(runKvdf(["structure", "map"]).stdout, /Kabeeri Repository Foldering Map/);
  assert.match(runKvdf(["structure", "show", "standard_systems"]).stdout, /knowledge/);
  assert.match(runKvdf(["package", "check"]).stdout, /Kabeeri Product Packaging Check/);
  assert.match(runKvdf(["docs", "path"]).stdout, /docs[\\/]site[\\/]index\.html/);
  assert.match(runKvdf(["plan", "list"]).stdout, /v4\.0\.0/);
  assert.match(runKvdf(["plan", "list"]).stdout, /v5\.0\.0/);
  assert.match(runKvdf(["prompt-pack", "list"]).stdout, /react/i);
  assert.match(runKvdf(["prompt-pack", "show", "react-native-expo"]).stdout, /React Native Expo/);
  assert.match(runKvdf(["taks"], { expectFailure: true }).stderr, /Did you mean "task"/);
});

test("init creates workspace state files", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--mode", "structured"], { cwd: dir });
  for (const file of [
    ".kabeeri/project.json",
    ".kabeeri/tasks.json",
    ".kabeeri/customer_apps.json",
    ".kabeeri/workstreams.json",
    ".kabeeri/questionnaires/answers.json",
    ".kabeeri/questionnaires/adaptive_intake_plan.json",
    ".kabeeri/questionnaires/coverage_matrix.json",
    ".kabeeri/version_compatibility.json",
    ".kabeeri/migration_state.json",
    ".kabeeri/delivery_decisions.json",
    ".kabeeri/product_blueprints.json",
    ".kabeeri/data_design.json",
    ".kabeeri/wordpress.json",
    ".kabeeri/evolution.json",
    ".kabeeri/memory/decisions.jsonl",
    ".kabeeri/adr/records.json",
    ".kabeeri/ai_runs/prompt_runs.jsonl",
    ".kabeeri/ai_runs/accepted_runs.jsonl",
    ".kabeeri/ai_runs/rejected_runs.jsonl",
    ".kabeeri/prompt_layer/compositions.json",
    ".kabeeri/tokens.json",
    ".kabeeri/owner_auth.json",
    ".kabeeri/owner_transfer_tokens.json",
    ".kabeeri/ai_usage/usage_events.jsonl",
    ".kabeeri/ai_usage/context_packs.json",
    ".kabeeri/ai_usage/cost_preflights.json",
    ".kabeeri/ai_usage/model_routing.json",
    ".kabeeri/policies/policy_results.json",
    ".kabeeri/policies/task_verification_policy.json",
    ".kabeeri/policies/release_policy.json",
    ".kabeeri/policies/handoff_policy.json",
    ".kabeeri/policies/security_policy.json",
    ".kabeeri/policies/migration_policy.json",
    ".kabeeri/policies/github_write_policy.json",
    ".kabeeri/reports/live_reports_state.json",
    ".kabeeri/dashboard/task_tracker_state.json",
    ".kabeeri/dashboard/agile_state.json",
    ".kabeeri/dashboard/structured_state.json",
    ".kabeeri/dashboard/ux_audits.json",
    ".kabeeri/interactions/suggested_tasks.json",
    ".kabeeri/interactions/post_work_captures.json",
    ".kabeeri/interactions/vibe_sessions.json",
    ".kabeeri/interactions/context_briefs.json",
    ".kabeeri/interactions/user_intents.jsonl",
    ".kabeeri/agile.json",
    ".kabeeri/structured.json",
    ".kabeeri/handoff/packages.json",
    ".kabeeri/handoff/CLIENT_HANDOFF_PACKAGE_TEMPLATE.md",
    ".kabeeri/security/security_scans.json",
    ".kabeeri/security/security_readiness.json",
    ".kabeeri/migrations/migration_plans.json",
    ".kabeeri/migrations/rollback_plans.json",
    ".kabeeri/migrations/migration_checks.json",
    ".kabeeri/migrations/migration_audit.json",
    ".kabeeri/design_sources/sources.json",
    ".kabeeri/design_sources/text_specs.json",
    ".kabeeri/design_sources/page_specs.json",
    ".kabeeri/design_sources/component_contracts.json",
    ".kabeeri/design_sources/missing_reports.json",
    ".kabeeri/design_sources/visual_reviews.json",
    ".kabeeri/design_sources/audit_reports.json",
    ".kabeeri/design_sources/ui_advisor.json"
  ]) {
    assert.ok(fs.existsSync(path.join(dir, file)), `${file} should exist`);
  }
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /workspace present/);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /runtime schema validation checked/);
  const upgrade = JSON.parse(runKvdf(["upgrade", "check", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(upgrade.report_type, "upgrade_check");
  assert.strictEqual(upgrade.current_cli_version, "0.2.0");
}));

test("init goal creates adaptive questions and docs-first tasks before implementation", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--goal", "Build ecommerce store with Laravel backend and Next.js frontend"], { cwd: dir });
  const plans = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/questionnaires/adaptive_intake_plan.json"), "utf8"));
  assert.strictEqual(plans.plans.length, 1);
  assert.ok(plans.plans[0].generated_questions.length > 0);
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.phase === "docs_first" && task.type === "documentation"));
  runKvdf(["task", "create", "--id", "task-implementation", "--title", "Build checkout API", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "assign", "task-implementation", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-implementation", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--task", "task-implementation", "--type", "folder", "--scope", "src/api/checkout", "--owner", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["task", "start", "task-implementation"], { cwd: dir, expectFailure: true }).stderr,
    /Docs-first gate blocks implementation/
  );
}));

test("v5 adaptive questionnaire creates coverage and provenance tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["capability", "list"], { cwd: dir }).stdout, /Payments \/ Billing/);
  const capabilityMap = JSON.parse(runKvdf(["capability", "map"], { cwd: dir }).stdout);
  assert.strictEqual(capabilityMap.areas.length, 53);
  assert.match(runKvdf(["questionnaire", "flow"], { cwd: dir }).stdout, /progressive_expansion/);
  runKvdf(["questionnaire", "answer", "entry.project_type", "--value", "saas"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_users", "--value", "yes"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_admin", "--value", "yes"], { cwd: dir });
  runKvdf(["questionnaire", "answer", "entry.has_payments", "--value", "unknown"], { cwd: dir });
  const coverage = JSON.parse(runKvdf(["questionnaire", "coverage"], { cwd: dir }).stdout);
  assert.strictEqual(coverage.areas.length, 53);
  assert.ok(coverage.areas.some((area) => area.area_key === "authentication" && area.status === "required"));
  assert.ok(coverage.areas.some((area) => area.area_key === "payments_billing" && area.status === "needs_follow_up"));
  const missing = JSON.parse(runKvdf(["questionnaire", "missing"], { cwd: dir }).stdout);
  assert.ok(missing.follow_up.some((area) => area.area_key === "payments_billing"));
  runKvdf(["questionnaire", "generate-tasks"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.source === "questionnaire_coverage"));
  assert.ok(tasks.some((task) => task.provenance && task.provenance.system_area_key === "payments_billing"));
  runKvdf(["memory", "add", "--type", "decision", "--text", "Use PostgreSQL for primary data"], { cwd: dir });
  assert.match(runKvdf(["memory", "list", "--type", "decision"], { cwd: dir }).stdout, /PostgreSQL/);
  const memorySummary = JSON.parse(runKvdf(["memory", "summary"], { cwd: dir }).stdout);
  assert.strictEqual(memorySummary.totals.decisions, 1);
  assert.match(runKvdf(["validate", "questionnaire"], { cwd: dir }).stdout, /coverage areas checked/);
}));

test("product blueprints map market systems to compact AI context", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["blueprint", "list"], { cwd: dir }).stdout, /eCommerce/);
  const ecommerce = JSON.parse(runKvdf(["blueprint", "show", "ecommerce"], { cwd: dir }).stdout);
  assert.ok(ecommerce.ai_context_summary.backend_modules.includes("checkout"));
  assert.ok(ecommerce.ai_context_summary.frontend_pages.includes("product_details"));
  assert.ok(ecommerce.ai_context_summary.database_entities.includes("orders"));
  const recommendation = JSON.parse(runKvdf(["blueprint", "recommend", "Build ecommerce store with catalog cart checkout payments shipping and customer mobile app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(recommendation.matches[0].blueprint_key, "ecommerce");
  assert.ok(recommendation.ai_context_summary.database_entities.includes("orders"));
  const selection = JSON.parse(runKvdf(["blueprint", "select", "ecommerce", "--delivery", "structured", "--reason", "Large catalog and payment scope"], { cwd: dir }).stdout);
  assert.strictEqual(selection.blueprint_key, "ecommerce");
  assert.strictEqual(selection.delivery_mode, "structured");
  const project = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project.json"), "utf8"));
  assert.strictEqual(project.product_blueprint, "ecommerce");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/product_blueprints.json"), "utf8"));
  assert.strictEqual(state.current_blueprint, "ecommerce");
  assert.strictEqual(state.recommendations.length, 1);
}));

test("data design blueprints create database modeling context from product blueprints", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["data-design", "principles"], { cwd: dir }).stdout, /workflow_first/);
  const commerce = JSON.parse(runKvdf(["data-design", "module", "commerce"], { cwd: dir }).stdout);
  assert.ok(commerce.entities.includes("orders"));
  const context = JSON.parse(runKvdf(["data-design", "context", "ecommerce", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(context.blueprint_key, "ecommerce");
  assert.ok(context.modules.includes("commerce"));
  assert.ok(context.entities.includes("order_items"));
  assert.ok(context.must_have.includes("snapshots_on_order_items"));
  assert.ok(context.risk_flags.includes("payment_idempotency"));
  const review = JSON.parse(runKvdf(["data-design", "review", "orders table with price float and items json"], { cwd: dir }).stdout);
  assert.strictEqual(review.status, "needs_attention");
  assert.ok(review.findings.some((item) => item.includes("float")));
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/data_design.json"), "utf8"));
  assert.strictEqual(state.contexts.length, 1);
  assert.strictEqual(state.reviews.length, 1);
  assert.match(runKvdf(["validate", "data-design"], { cwd: dir }).stdout, /data design catalog checked/);
}));

test("evolution steward creates impact plans and dependent follow-up tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const result = JSON.parse(runKvdf(["evolution", "plan", "Add dashboard live JSON docs update", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(result.change.change_id, "evo-001");
  assert.ok(result.change.impacted_areas.includes("dashboard"));
  assert.ok(result.change.impacted_areas.includes("docs"));
  assert.ok(result.change.impacted_areas.includes("capabilities"));
  assert.ok(result.tasks.length >= 6);
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/evolution.json"), "utf8"));
  assert.strictEqual(state.changes.length, 1);
  assert.strictEqual(state.impact_plans.length, 1);
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.source === "evolution:evo-001" && task.evolution_area === "dashboard"));
  const summary = JSON.parse(runKvdf(["evolution", "status", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(summary.changes_total, 1);
  assert.ok(summary.open_follow_up_tasks > 0);
  const dashboard = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(dashboard.records.evolution_summary.changes_total, 1);
  const reports = JSON.parse(runKvdf(["reports", "live", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(reports.reports.evolution.changes_total, 1);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /evolution\.json matches/);
}));

test("adaptive questionnaire planning uses blueprints frameworks data design and UI", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const plan = JSON.parse(runKvdf(["questionnaire", "plan", "Build ecommerce store with Laravel backend React frontend payments shipping and customer mobile app", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(plan.blueprint.key, "ecommerce");
  assert.ok(["agile", "structured"].includes(plan.delivery_mode_recommendation.recommended_mode));
  assert.ok(plan.framework_context.selected_packs.includes("laravel"));
  assert.ok(plan.framework_context.selected_packs.includes("react"));
  assert.ok(plan.data_design_context.entities.includes("orders"));
  assert.strictEqual(plan.ui_ux_context.experience_pattern, "commerce_storefront");
  assert.ok(plan.generated_questions.some((question) => question.source_systems.includes("data_design_blueprint")));
  assert.ok(plan.generated_questions.some((question) => question.source_systems.includes("ui_ux_advisor")));
  assert.ok(plan.generated_questions.some((question) => question.source_systems.includes("prompt_packs")));
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/questionnaires/adaptive_intake_plan.json"), "utf8"));
  assert.strictEqual(state.current_plan_id, plan.plan_id);
  assert.strictEqual(state.plans.length, 1);
}));

test("adaptive questionnaire planning follows user language", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const arabicPlan = JSON.parse(runKvdf(["questionnaire", "plan", "أريد بناء متجر إلكتروني بواجهة React وباك اند Laravel", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(arabicPlan.input_language, "ar");
  assert.strictEqual(arabicPlan.output_language, "ar");
  const englishPlan = JSON.parse(runKvdf(["questionnaire", "plan", "Build a CRM with sales pipeline and reports", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(englishPlan.input_language, "en");
  assert.strictEqual(englishPlan.output_language, "en");
}));

test("UI design advisor recommends frontend patterns from product blueprints", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const news = JSON.parse(runKvdf(["design", "recommend", "news_website", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(news.blueprint_key, "news_website");
  assert.strictEqual(news.experience_pattern, "seo_content_site");
  assert.ok(news.components.includes("article_card"));
  assert.ok(news.seo_geo.some((item) => /NewsArticle|Article|structured/i.test(item)));
  const erp = JSON.parse(runKvdf(["design", "recommend", "erp", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(erp.experience_pattern, "data_heavy_web_app");
  assert.ok(erp.components.includes("data_table"));
  const review = JSON.parse(runKvdf(["design", "ui-review", "news article page missing states"], { cwd: dir }).stdout);
  assert.strictEqual(review.status, "needs_attention");
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/ui_advisor.json"), "utf8"));
  assert.strictEqual(state.recommendations.length, 2);
  assert.strictEqual(state.reviews.length, 1);
  assert.match(runKvdf(["validate", "ui-design"], { cwd: dir }).stdout, /UI design catalog checked/);
}));

test("ADR and AI run history track decisions accepted output and waste", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build products API", "--workstream", "backend", "--acceptance", "Tests pass"], { cwd: dir });
  const run = JSON.parse(runKvdf(["ai-run", "record", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-4", "--input-tokens", "1000", "--output-tokens", "500", "--summary", "Drafted products API"], { cwd: dir }).stdout);
  assert.strictEqual(run.run_id, "ai-run-001");
  assert.strictEqual(run.total_tokens, 1500);
  assert.match(runKvdf(["ai-run", "list"], { cwd: dir }).stdout, /ai-run-001/);
  runKvdf(["ai-run", "accept", "ai-run-001", "--reviewer", "reviewer-001", "--evidence", "npm-test"], { cwd: dir });
  assert.strictEqual(JSON.parse(runKvdf(["ai-run", "show", "ai-run-001"], { cwd: dir }).stdout).status, "accepted");
  const accepted = fs.readFileSync(path.join(dir, ".kabeeri/ai_runs/accepted_runs.jsonl"), "utf8");
  assert.match(accepted, /ai-run-001/);
  const report = JSON.parse(runKvdf(["ai-run", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(report.totals.accepted, 1);
  assert.strictEqual(report.totals.total_tokens, 1500);
  const adr = JSON.parse(runKvdf(["adr", "create", "--title", "Use PostgreSQL", "--context", "Products need relational consistency", "--decision", "Use PostgreSQL for catalog data", "--task", "task-001", "--ai-run", "ai-run-001", "--status", "approved"], { cwd: dir }).stdout);
  assert.strictEqual(adr.adr_id, "adr-001");
  assert.strictEqual(adr.status, "approved");
  assert.match(runKvdf(["adr", "list"], { cwd: dir }).stdout, /adr-001/);
  assert.match(runKvdf(["adr", "report"], { cwd: dir }).stdout, /Kabeeri ADR Report/);
  assert.match(runKvdf(["validate", "adr"], { cwd: dir }).stdout, /ADR records checked/);
  assert.match(runKvdf(["validate", "ai-run"], { cwd: dir }).stdout, /AI runs checked/);
}));

test("common prompt layer composes stack prompts with task context", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["prompt-pack", "common"], { cwd: dir }).stdout, /Common Prompt Layer/);
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build React settings component", "--workstream", "public_frontend", "--acceptance", "Settings can be saved"], { cwd: dir });
  runKvdf(["context-pack", "create", "--task", "task-001", "--allowed-files", "src/settings/", "--specs", "frontend_specs/settings.md"], { cwd: dir });
  const composition = JSON.parse(runKvdf(["prompt-pack", "compose", "react", "--task", "task-001", "--context", "ctx-001"], { cwd: dir }).stdout);
  assert.strictEqual(composition.composition_id, "prompt-composition-001");
  assert.strictEqual(composition.pack, "react");
  assert.ok(composition.common_files.includes("01_GENERAL_AI_CODING_RULES.md"));
  assert.ok(fs.existsSync(path.join(dir, composition.output_path)));
  const prompt = fs.readFileSync(path.join(dir, composition.output_path), "utf8");
  assert.match(prompt, /Common Prompt Layer/);
  assert.match(prompt, /Stack-specific Prompt/);
  assert.match(runKvdf(["prompt-pack", "compositions"], { cwd: dir }).stdout, /prompt-composition-001/);
  assert.match(runKvdf(["validate", "prompt-layer"], { cwd: dir }).stdout, /common prompt layer checked/);
}));

test("react native expo prompt pack exports and selects mobile prompts", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["prompt-pack", "export", "react-native-expo", "--output", "mobile-prompts"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "mobile-prompts/prompt_pack_manifest.json")));
  runKvdf(["task", "create", "--id", "task-mobile-001", "--title", "Add push notification permission flow", "--workstream", "mobile", "--acceptance", "Denied permission state is handled"], { cwd: dir });
  const composition = JSON.parse(runKvdf(["prompt-pack", "compose", "react-native-expo", "--task", "task-mobile-001"], { cwd: dir }).stdout);
  assert.strictEqual(composition.pack, "react-native-expo");
  assert.strictEqual(composition.selected_prompt, "10_DEVICE_PERMISSIONS_NOTIFICATIONS_PROMPT.md");
  const prompt = fs.readFileSync(path.join(dir, composition.output_path), "utf8");
  assert.match(prompt, /React Native Expo/);
  assert.match(prompt, /Device Permissions and Notifications/);
}));

test("wordpress capability plans analyzes scaffolds and creates tasks", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "wp-content", "plugins", "woocommerce"), { recursive: true });
  fs.mkdirSync(path.join(dir, "wp-content", "themes", "twentytwentyfour"), { recursive: true });
  fs.writeFileSync(path.join(dir, "wp-config.php"), "<?php // test config\n", "utf8");
  const analysis = JSON.parse(runKvdf(["wordpress", "analyze", "--path", ".", "--staging", "--backup", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(analysis.detected_type, "woocommerce");
  assert.strictEqual(analysis.recommended_blueprint, "ecommerce");
  assert.ok(analysis.plugins.includes("woocommerce"));
  const plan = JSON.parse(runKvdf(["wordpress", "plan", "Improve existing WooCommerce checkout", "--type", "woocommerce", "--mode", "existing", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(plan.site_type, "woocommerce");
  assert.strictEqual(plan.blueprint_key, "ecommerce");
  assert.ok(plan.task_templates.some((task) => /WooCommerce/.test(task.title)));
  const created = JSON.parse(runKvdf(["wordpress", "tasks", "--json"], { cwd: dir }).stdout);
  assert.ok(created.tasks.length >= 5);
  const scaffold = JSON.parse(runKvdf(["wordpress", "scaffold", "plugin", "--name", "Store Enhancements", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(scaffold.type, "plugin");
  assert.ok(fs.existsSync(path.join(dir, "wp-content", "plugins", "store-enhancements", "store-enhancements.php")));
  assert.ok(fs.existsSync(path.join(dir, "wp-content", "plugins", "store-enhancements", "includes", "class-plugin.php")));
  assert.ok(fs.existsSync(path.join(dir, "wp-content", "plugins", "store-enhancements", "admin", "class-admin.php")));
  const pluginPlan = JSON.parse(runKvdf(["wordpress", "plugin", "plan", "Build a WooCommerce checkout add-on", "--name", "Checkout Addon", "--type", "woocommerce", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(pluginPlan.slug, "checkout-addon");
  assert.strictEqual(pluginPlan.plugin_type, "woocommerce");
  assert.ok(pluginPlan.architecture.some((item) => item.path === "includes/class-woocommerce.php"));
  const pluginTasks = JSON.parse(runKvdf(["wordpress", "plugin", "tasks", "--json"], { cwd: dir }).stdout);
  assert.ok(pluginTasks.tasks.length >= 6);
  assert.ok(pluginTasks.tasks.every((item) => item.allowed_files.includes("wp-content/plugins/checkout-addon/**")));
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/wordpress.json"), "utf8"));
  assert.strictEqual(state.analyses.length, 1);
  assert.strictEqual(state.plans.length, 1);
  assert.strictEqual(state.plugin_plans.length, 1);
  assert.strictEqual(state.scaffolds.length, 1);
  assert.match(runKvdf(["validate", "runtime-schemas"], { cwd: dir }).stdout, /wordpress\.json matches KVDF WordPress Capability State/);
}));

test("vibe-first commands classify suggestions convert tasks and capture work", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const session = JSON.parse(runKvdf(["vibe", "session", "start", "--title", "Ecommerce planning"], { cwd: dir }).stdout);
  assert.strictEqual(session.status, "active");
  const suggestion = JSON.parse(runKvdf(["vibe", "suggest", "Add admin dashboard settings screen where owner can save preferences"], { cwd: dir }).stdout);
  assert.strictEqual(suggestion.status, "suggested");
  assert.strictEqual(suggestion.workstream, "admin_frontend");
  assert.ok(suggestion.acceptance_criteria.length > 0);
  assert.match(runKvdf(["vibe", "list"], { cwd: dir }).stdout, /suggestion-001/);
  assert.match(runKvdf(["ask", "Improve the dashboard"], { cwd: dir }).stdout, /Before creating a governed task/);
  const plan = JSON.parse(runKvdf(["vibe", "plan", "Build ecommerce store with products cart checkout admin and tests"], { cwd: dir }).stdout);
  assert.ok(plan.suggestions.length >= 4);
  assert.ok(plan.suggestions.some((item) => item.workstream === "backend"));
  assert.ok(plan.suggestions.some((item) => item.workstream === "public_frontend"));
  runKvdf(["vibe", "convert", "suggestion-001"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.strictEqual(tasks[0].source, "vibe:intent-001");
  const scan = JSON.parse(runKvdf(["capture", "scan", "--summary", "Adjusted internal CLI parser plumbing", "--files", "bin/kvdf.js"], { cwd: dir }).stdout);
  assert.strictEqual(scan.classification, "needs_new_task");
  assert.strictEqual(scan.would_create_capture, true);
  runKvdf(["capture", "--summary", "Adjusted internal CLI parser plumbing", "--files", "bin/kvdf.js", "--checks", "npm test"], { cwd: dir });
  let captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[0].classification, "needs_new_task");
  assert.strictEqual(captures[0].status, "captured");
  assert.deepStrictEqual(captures[0].file_details, [{ file: "bin/kvdf.js", status: "manual", raw: "bin/kvdf.js" }]);
  assert.deepStrictEqual(captures[0].missing_evidence, ["acceptance_evidence"]);
  assert.match(runKvdf(["capture", "list"], { cwd: dir }).stdout, /capture-001/);
  assert.strictEqual(JSON.parse(runKvdf(["capture", "show", "capture-001"], { cwd: dir }).stdout).capture_id, "capture-001");
  const updatedCapture = JSON.parse(runKvdf(["capture", "evidence", "capture-001", "--evidence", "manual review"], { cwd: dir }).stdout);
  assert.deepStrictEqual(updatedCapture.missing_evidence, []);
  runKvdf(["capture", "convert", "capture-001", "--task", "task-002"], { cwd: dir });
  captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[0].classification, "converted_to_task");
  const convertedCaptureTasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(convertedCaptureTasks.some((task) => task.id === "task-002" && task.source === "capture:capture-001"));
  runKvdf(["capture", "--summary", "Attached review evidence for admin settings", "--files", "src/cli/index.js", "--task", "task-001", "--checks", "npm test", "--evidence", "manual review"], { cwd: dir });
  captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[1].classification, "matches_existing_task");
  assert.strictEqual(captures[1].status, "linked");
  runKvdf(["capture", "resolve", "capture-002", "--reason", "Evidence reviewed"], { cwd: dir });
  captures = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/post_work_captures.json"), "utf8")).captures;
  assert.strictEqual(captures[1].status, "resolved");
  runKvdf(["capture", "--summary", "Explored a throwaway docs note", "--files", "notes.md", "--classification", "exploration", "--checks", "manual", "--evidence", "not needed"], { cwd: dir });
  const rejectedCapture = JSON.parse(runKvdf(["capture", "reject", "capture-003", "--reason", "Exploration will not continue"], { cwd: dir }).stdout);
  assert.strictEqual(rejectedCapture.status, "rejected");
  assert.match(runKvdf(["validate", "capture"], { cwd: dir }).stdout, /post-work captures checked/);
  assert.match(runKvdf(["vibe", "brief"], { cwd: dir }).stdout, /Vibe brief/);
  assert.match(runKvdf(["vibe", "next"], { cwd: dir }).stdout, /review_suggestion|approve_or_refine_task/);
  const sessions = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/interactions/vibe_sessions.json"), "utf8"));
  assert.strictEqual(sessions.current_session_id, "vibe-session-001");
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /Vibe-first Suggestions/);
  assert.match(html, /Post-work Captures/);
  assert.match(html, /Vibe Sessions and Briefs/);
}));

test("owner auth blocks verify without active session", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Verify task", "--workstream", "backend", "--acceptance", "Owner verifies"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/auth.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  runKvdf(["task", "review", "task-001", "--reviewer", "reviewer-001"], { cwd: dir });
  runKvdf(["owner", "logout"], { cwd: dir });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true }).stderr, /Owner session required/);
  runKvdf(["owner", "login", "--id", "owner-001"], { cwd: dir, env });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout, /owner_verified/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/task-001.verification.md")));
}));

test("owner verify requires acceptance evidence", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "No criteria task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/no-criteria.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  runKvdf(["task", "review", "task-001", "--reviewer", "reviewer-001"], { cwd: dir });
  assert.match(
    runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir, expectFailure: true }).stderr,
    /without acceptance/
  );
  runKvdf(["acceptance", "create", "--task", "task-001", "--criteria", "Reviewed"], { cwd: dir });
  runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass"], { cwd: dir });
  assert.match(runKvdf(["task", "verify", "task-001", "--owner", "owner-001"], { cwd: dir }).stdout, /owner_verified/);
}));

test("role permissions block unsafe actions", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["developer", "add", "--id", "reviewer-001", "--name", "Reviewer", "--role", "Reviewer"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Permission task"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  assert.match(runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--actor", "reviewer-001"], { cwd: dir, expectFailure: true }).stderr, /Permission denied/);
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/permission.ts", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["task", "start", "task-001", "--actor", "agent-001"], { cwd: dir });
  assert.match(runKvdf(["task", "review", "task-001", "--actor", "agent-001"], { cwd: dir, expectFailure: true }).stderr, /Reviewer independence/);
  runKvdf(["task", "review", "task-001", "--actor", "reviewer-001"], { cwd: dir });
}));

test("workstream governance blocks invalid task assignment", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "frontend-agent", "--name", "Frontend Agent", "--role", "AI Developer", "--workstreams", "public_frontend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "backend-agent", "--name", "Backend Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Backend task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  assert.match(
    runKvdf(["task", "assign", "task-001", "--assignee", "frontend-agent"], { cwd: dir, expectFailure: true }).stderr,
    /Workstream assignment denied/
  );
  runKvdf(["task", "assign", "task-001", "--assignee", "backend-agent"], { cwd: dir });
}));

test("workstream governance owns registry and session file boundaries", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(runKvdf(["workstream", "list"], { cwd: dir }).stdout, /backend/);
  assert.match(runKvdf(["workstream", "show", "backend"], { cwd: dir }).stdout, /path_rules/);
  runKvdf(["workstream", "add", "--id", "payments", "--name", "Payments", "--paths", "src/payments,app/Payments", "--review", "security"], { cwd: dir });
  assert.match(runKvdf(["workstream", "validate"], { cwd: dir }).stdout, /valid/);
  assert.match(
    runKvdf(["task", "create", "--id", "task-unknown", "--title", "Unknown stream", "--workstream", "unknown_stream"], { cwd: dir, expectFailure: true }).stderr,
    /Unknown workstream/
  );
  runKvdf(["developer", "solo", "--id", "dev-main", "--name", "Main Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Backend session", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "dev-main"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "dev-main"], { cwd: dir });
  const issuedToken = JSON.parse(runKvdf(["token", "show", "task-token-001"], { cwd: dir }).stdout);
  assert.strictEqual(issuedToken.scope_mode, "auto");
  assert.ok(issuedToken.workstreams.includes("backend"));
  assert.ok(issuedToken.allowed_files.includes("src/api/"));
  assert.match(
    runKvdf(["token", "issue", "--task", "task-001", "--assignee", "dev-main", "--allowed-files", "resources/js/"], { cwd: dir, expectFailure: true }).stderr,
    /broader than task app\/workstream boundaries/
  );
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "dev-main"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "resources/js", "--task", "task-001", "--owner", "dev-main"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "dev-main"], { cwd: dir });
  assert.match(
    runKvdf(["session", "end", "session-001", "--files", "resources/js/App.jsx", "--summary", "Wrong stream"], { cwd: dir, expectFailure: true }).stderr,
    /outside token scope/
  );
  runKvdf(["session", "end", "session-001", "--files", "src/api/users.ts", "--summary", "Backend file"], { cwd: dir });
  assert.match(runKvdf(["validate", "workstream"], { cwd: dir }).stdout, /workstream governance checked/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const dashboard = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(dashboard, /Workstream Governance/);
  assert.match(dashboard, /Execution Scopes/);
}));

test("solo developer mode configures full-stack workstreams", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["developer", "solo", "--id", "dev-main", "--name", "Main Developer"], { cwd: dir });
  const mode = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/developer_mode.json"), "utf8"));
  assert.strictEqual(mode.mode, "solo");
  assert.strictEqual(mode.solo_developer_id, "dev-main");
  assert.match(runKvdf(["developer", "list"], { cwd: dir }).stdout, /dev-main/);
  const developer = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/developers.json"), "utf8"));
  const item = developer.developers.find((entry) => entry.id === "dev-main");
  assert.strictEqual(item.role, "Full-stack Developer");
  assert.ok(item.workstreams.includes("backend"));
  assert.ok(item.workstreams.includes("public_frontend"));
  runKvdf(["task", "create", "--id", "task-001", "--title", "Full stack task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "dev-main"], { cwd: dir });
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /solo developer mode valid/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Developer Mode/);
}));

test("task access tokens require real governed assignment", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "Agent One", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-002", "--name", "Agent Two", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  assert.match(
    runKvdf(["token", "issue", "--task", "missing-task", "--assignee", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /Task not found/
  );
  runKvdf(["task", "create", "--id", "task-001", "--title", "Governed task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  assert.match(
    runKvdf(["session", "start", "--task", "task-001", "--developer", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /not assigned/
  );
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-002"], { cwd: dir, expectFailure: true }).stderr,
    /Token assignee mismatch/
  );
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
}));

test("owner rejection revokes tokens and supports limited reissue", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Rejected task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-usage-tokens", "1000"], { cwd: dir });
  runKvdf(["task", "reject", "task-001", "--reason", "Needs rework"], { cwd: dir });
  let tokens = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tokens.json"), "utf8")).tokens;
  assert.strictEqual(tokens[0].status, "revoked");
  runKvdf(["token", "reissue", "task-token-001", "--max-usage-tokens", "200", "--reason", "Rework only"], { cwd: dir });
  tokens = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tokens.json"), "utf8")).tokens;
  assert.strictEqual(tokens[1].status, "active");
  assert.strictEqual(tokens[1].reissued_from, "task-token-001");
  assert.strictEqual(tokens[1].max_usage_tokens, 200);
}));

test("integration tasks can explicitly span multiple workstreams", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["task", "create", "--id", "task-001", "--title", "Bad cross-stream task", "--workstreams", "backend,public_frontend"], { cwd: dir, expectFailure: true }).stderr,
    /multiple workstreams/
  );
  runKvdf(["task", "create", "--id", "task-002", "--title", "Integration task", "--type", "integration", "--workstreams", "backend,public_frontend"], { cwd: dir });
  assert.match(runKvdf(["validate", "task"], { cwd: dir }).stdout, /task records checked/);
}));

test("locks prevent overlapping file and folder scopes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/users.ts", "--task", "task-002", "--owner", "agent-002"], { cwd: dir, expectFailure: true }).stderr,
    /Active lock conflict/
  );
  runKvdf(["lock", "release", "lock-001"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "file", "--scope", "src/api/users.ts", "--task", "task-002", "--owner", "agent-002"], { cwd: dir });
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /active lock conflicts checked/);
}));

test("owner transfer token moves single Owner authority", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Original Owner", "--passphrase", "old-pass"], { cwd: dir });
  const issued = runKvdf(["owner", "transfer", "issue", "--to", "owner-002", "--name", "New Owner", "--token", "transfer-secret"], { cwd: dir });
  assert.match(issued.stdout, /owner-transfer-001/);
  runKvdf(["owner", "logout"], { cwd: dir });
  assert.match(runKvdf(["owner", "transfer", "accept", "--id", "owner-transfer-001", "--token", "transfer-secret", "--passphrase", "new-pass"], { cwd: dir }).stdout, /Owner transferred to owner-002/);
  const developers = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/developers.json"), "utf8")).developers;
  assert.strictEqual(developers.find((item) => item.id === "owner-001").role, "Maintainer");
  assert.strictEqual(developers.find((item) => item.id === "owner-002").role, "Owner");
  assert.match(runKvdf(["owner", "login", "--id", "owner-001", "--passphrase", "old-pass"], { cwd: dir, expectFailure: true }).stderr, /does not match configured owner/);
  assert.match(runKvdf(["owner", "status"], { cwd: dir }).stdout, /owner-002/);
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /single Owner rule valid/);
}));

test("pricing rules calculate AI usage cost", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["sprint", "create", "--id", "sprint-001", "--name", "Sprint 1"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Pricing task", "--sprint", "sprint-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-cost", "1"], { cwd: dir });
  runKvdf(["pricing", "set", "--provider", "openai", "--model", "gpt-test", "--unit", "1M", "--input", "10", "--output", "20", "--cached", "2"], { cwd: dir });
  const result = runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-test", "--input-tokens", "100000", "--output-tokens", "50000", "--cached-tokens", "10000"], { cwd: dir });
  assert.match(result.stdout, /exceeded cost budget/);
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.strictEqual(summary.total_cost, 2.02);
  assert.strictEqual(summary.by_sprint["sprint-001"].cost, 2.02);
  assert.match(runKvdf(["sprint", "summary", "sprint-001"], { cwd: dir }).stdout, /"total_cost": 2\.02/);
}));

test("agile templates create backlog stories sprint plans and governed tasks", () => withTempDir((dir) => {
  runKvdf(["init", "--mode", "agile"], { cwd: dir });
  runKvdf(["agile", "backlog", "add", "--id", "BL-001", "--title", "Checkout MVP", "--type", "epic", "--priority", "high", "--source", "vision"], { cwd: dir });
  const epic = JSON.parse(runKvdf(["agile", "epic", "create", "--id", "epic-checkout", "--title", "Checkout", "--goal", "Customers can place orders", "--users", "customer", "--source", "vision"], { cwd: dir }).stdout);
  assert.strictEqual(epic.epic_id, "epic-checkout");
  const story = JSON.parse(runKvdf([
    "agile", "story", "create",
    "--id", "story-checkout-001",
    "--epic", "epic-checkout",
    "--title", "Cart checkout",
    "--role", "customer",
    "--want", "pay for cart items",
    "--value", "complete an order",
    "--points", "5",
    "--workstream", "backend",
    "--acceptance", "Order is created,Payment result is stored",
    "--tests", "API and payment-state tests are defined",
    "--reviewer", "owner-001",
    "--source", "vision"
  ], { cwd: dir }).stdout);
  assert.strictEqual(story.ready_status, "ready");
  runKvdf(["agile", "story", "task", "story-checkout-001", "--task", "task-001"], { cwd: dir });
  const impediment = JSON.parse(runKvdf(["agile", "impediment", "add", "--id", "imp-001", "--story", "story-checkout-001", "--severity", "high", "--title", "Payment credentials missing", "--owner", "owner-001"], { cwd: dir }).stdout);
  assert.strictEqual(impediment.status, "open");
  assert.match(runKvdf(["agile", "sprint", "plan", "sprint-blocked", "--stories", "story-checkout-001", "--capacity-points", "10", "--goal", "Blocked sprint"], { cwd: dir, expectFailure: true }).stderr, /open impediments/);
  const resolved = JSON.parse(runKvdf(["agile", "impediment", "resolve", "imp-001", "--resolution", "Credentials configured"], { cwd: dir }).stdout);
  assert.strictEqual(resolved.status, "resolved");
  const planned = JSON.parse(runKvdf(["agile", "sprint", "plan", "sprint-001", "--stories", "story-checkout-001", "--capacity-points", "10", "--goal", "Checkout foundation"], { cwd: dir }).stdout);
  assert.strictEqual(planned.committed_points, 5);
  const review = JSON.parse(runKvdf(["agile", "sprint", "review", "sprint-001", "--accepted", "story-checkout-001", "--goal-met", "yes", "--decision", "accepted"], { cwd: dir }).stdout);
  assert.strictEqual(review.accepted_points, 5);
  const retro = JSON.parse(runKvdf(["agile", "retrospective", "add", "sprint-001", "--good", "Goal was clear", "--improve", "Slice stories smaller", "--actions", "Add QA earlier"], { cwd: dir }).stdout);
  assert.strictEqual(retro.sprint_id, "sprint-001");
  const health = JSON.parse(runKvdf(["agile", "health", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(health.summary.open_impediments, 0);
  assert.strictEqual(health.velocity.latest_accepted_points, 5);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/dashboard/agile_state.json")));
  const agile = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/agile.json"), "utf8"));
  assert.strictEqual(agile.stories[0].task_id, "task-001");
  assert.strictEqual(agile.stories[0].status, "accepted");
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.strictEqual(tasks[0].source_reference, "story:story-checkout-001");
  assert.match(runKvdf(["agile", "summary"], { cwd: dir }).stdout, /ready_stories/);
  assert.match(runKvdf(["validate", "agile"], { cwd: dir }).stdout, /impediments/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Agile Backlog and Stories/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /__kvdf\/api\/agile/);
}));

test("structured delivery manages requirements phases gates and traceability", () => withTempDir((dir) => {
  runKvdf(["init", "--mode", "structured"], { cwd: dir });
  const req = JSON.parse(runKvdf([
    "structured", "requirement", "add",
    "--id", "REQ-001",
    "--title", "Email login",
    "--priority", "high",
    "--source", "questionnaire",
    "--workstream", "backend",
    "--acceptance", "User can login,Invalid password is rejected",
    "--nfr", "Passwords are never stored in plain text",
    "--owner", "owner-001"
  ], { cwd: dir }).stdout);
  assert.strictEqual(req.approval_status, "pending");
  assert.match(runKvdf(["structured", "phase", "plan", "phase-001", "--requirements", "REQ-001", "--goal", "Auth foundation"], { cwd: dir, expectFailure: true }).stderr, /unapproved requirements/);
  const approved = JSON.parse(runKvdf(["structured", "requirement", "approve", "REQ-001", "--reason", "Owner reviewed"], { cwd: dir }).stdout);
  assert.strictEqual(approved.approval_status, "approved");
  const phase = JSON.parse(runKvdf(["structured", "phase", "plan", "phase-001", "--requirements", "REQ-001", "--goal", "Auth foundation", "--exit", "Requirement task created,Deliverable approved"], { cwd: dir }).stdout);
  assert.strictEqual(phase.requirement_ids[0], "REQ-001");
  const task = JSON.parse(runKvdf(["structured", "task", "REQ-001", "--task", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(task.source_reference, "requirement:REQ-001");
  const deliverable = JSON.parse(runKvdf(["structured", "deliverable", "add", "--id", "deliv-001", "--phase", "phase-001", "--title", "Auth specification", "--acceptance", "Owner approved"], { cwd: dir }).stdout);
  assert.strictEqual(deliverable.status, "draft");
  assert.match(runKvdf(["structured", "phase", "complete", "phase-001"], { cwd: dir, expectFailure: true }).stderr, /deliverables_not_approved/);
  runKvdf(["structured", "deliverable", "approve", "deliv-001"], { cwd: dir });
  const risk = JSON.parse(runKvdf(["structured", "risk", "add", "--id", "risk-001", "--phase", "phase-001", "--severity", "high", "--title", "OAuth limit", "--mitigation", "Fallback email login"], { cwd: dir }).stdout);
  assert.strictEqual(risk.status, "open");
  assert.match(runKvdf(["structured", "gate", "check", "phase-001"], { cwd: dir }).stdout, /open_high_risks/);
  runKvdf(["structured", "risk", "mitigate", "risk-001", "--mitigation", "Fallback documented"], { cwd: dir });
  const gate = JSON.parse(runKvdf(["structured", "gate", "check", "phase-001"], { cwd: dir }).stdout);
  assert.notStrictEqual(gate.status, "blocked");
  const completed = JSON.parse(runKvdf(["structured", "phase", "complete", "phase-001"], { cwd: dir }).stdout);
  assert.strictEqual(completed.phase.status, "completed");
  const health = JSON.parse(runKvdf(["structured", "health", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(health.summary.requirements, 1);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/dashboard/structured_state.json")));
  assert.match(runKvdf(["validate", "structured"], { cwd: dir }).stdout, /structured state checked/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Structured Delivery/);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /__kvdf\/api\/structured/);
}));

test("delivery advisor recommends and records agile or structured mode", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const structuredRec = JSON.parse(runKvdf(["delivery", "recommend", "Build hospital management system with patients billing compliance roles and audit", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(structuredRec.recommended_mode, "structured");
  assert.strictEqual(structuredRec.developer_decision_required, true);
  const agileRec = JSON.parse(runKvdf(["delivery", "recommend", "Build startup MVP prototype to validate idea quickly with user feedback", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(agileRec.recommended_mode, "agile");
  const decision = JSON.parse(runKvdf(["delivery", "choose", "agile", "--recommendation", agileRec.recommendation_id, "--reason", "MVP discovery"], { cwd: dir }).stdout);
  assert.strictEqual(decision.chosen_mode, "agile");
  const project = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/project.json"), "utf8"));
  assert.strictEqual(project.delivery_mode, "agile");
  const data = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/delivery_decisions.json"), "utf8"));
  assert.strictEqual(data.current_mode, "agile");
  assert.strictEqual(data.recommendations.length, 2);
  assert.match(runKvdf(["delivery", "history"], { cwd: dir }).stdout, /delivery-recommendation/);
}));

test("budget approval gates enforced token overruns", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Budget gate task"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-usage-tokens", "100", "--budget-approval-required"], { cwd: dir });
  assert.match(
    runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "101"], { cwd: dir, expectFailure: true }).stderr,
    /Budget approval required/
  );
  runKvdf(["budget", "approve", "--task", "task-001", "--tokens", "10", "--reason", "Controlled overrun"], { cwd: dir });
  assert.match(runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "101"], { cwd: dir }).stdout, /Recorded usage event/);
  assert.match(runKvdf(["budget", "list"], { cwd: dir }).stdout, /budget-approval-001/);
}));

test("budget approval gates enforced cost overruns", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Budget cost gate"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--max-cost", "1", "--budget-approval-required"], { cwd: dir });
  assert.match(
    runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "1", "--cost", "1.5"], { cwd: dir, expectFailure: true }).stderr,
    /Budget approval required/
  );
  runKvdf(["budget", "approve", "--task", "task-001", "--cost", "0.5"], { cwd: dir });
  assert.match(runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "1", "--cost", "1.5"], { cwd: dir }).stdout, /Recorded usage event/);
}));

test("untracked AI usage is recorded and shown in dashboard", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["usage", "record", "--untracked", "--input-tokens", "100", "--output-tokens", "25", "--cost", "0.75", "--source", "ad-hoc-prompt"], { cwd: dir });
  runKvdf(["usage", "inquiry", "--input-tokens", "10", "--output-tokens", "5", "--cost", "0.05", "--operation", "owner-question"], { cwd: dir });
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.strictEqual(summary.tracked_vs_untracked.untracked.events, 2);
  assert.strictEqual(summary.tracked_vs_untracked.untracked.cost, 0.8);
  assert.ok(summary.by_task["admin:owner-question"]);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /Tracked vs Untracked AI Usage/);
  assert.match(html, /untracked/);
  assert.match(html, /admin:owner-question/);
}));

test("developer token efficiency separates accepted rejected and rework cost", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Accepted task"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-002", "--title", "Rejected task"], { cwd: dir });
  runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--input-tokens", "10", "--cost", "1"], { cwd: dir });
  runKvdf(["usage", "record", "--task", "task-002", "--developer", "agent-001", "--input-tokens", "10", "--cost", "2", "--source", "rework"], { cwd: dir });
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8"));
  tasks.tasks.find((task) => task.id === "task-001").status = "owner_verified";
  tasks.tasks.find((task) => task.id === "task-002").status = "rejected";
  fs.writeFileSync(path.join(dir, ".kabeeri/tasks.json"), `${JSON.stringify(tasks, null, 2)}\n`);
  const efficiency = JSON.parse(runKvdf(["usage", "efficiency"], { cwd: dir }).stdout);
  assert.strictEqual(efficiency.by_developer["agent-001"].accepted_cost, 1);
  assert.strictEqual(efficiency.by_developer["agent-001"].rejected_cost, 2);
  assert.strictEqual(efficiency.by_developer["agent-001"].rework_cost, 2);
  runKvdf(["usage", "report", "--output", "usage-report.md"], { cwd: dir });
  const report = fs.readFileSync(path.join(dir, "usage-report.md"), "utf8");
  assert.match(report, /Kabeeri AI Usage Cost Report/);
  assert.match(report, /Developer Efficiency/);
  assert.match(report, /agent-001/);
}));

test("AI sessions create usage events and handoff reports", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Session task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["pricing", "set", "--provider", "openai", "--model", "gpt-session", "--unit", "1M", "--input", "10", "--output", "20", "--cached", "2"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-session"], { cwd: dir });
  runKvdf(["session", "end", "session-001", "--input-tokens", "100000", "--output-tokens", "50000", "--files", "src/api/session.ts", "--summary", "Implemented session task", "--checks", "npm test", "--risks", "Review API"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/session-001.handoff.md")));
  const summary = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/ai_usage/usage_summary.json"), "utf8"));
  assert.strictEqual(summary.total_cost, 2);
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /session handoff exists/);
}));

test("governed AI sessions require file lock coverage", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Project Owner"], { cwd: dir, env });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Locked session task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "agent-001"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--allowed-files", "src/api,src/ui", "--allow-broad-scope"], { cwd: dir });
  assert.match(
    runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001"], { cwd: dir, expectFailure: true }).stderr,
    /active lock/
  );
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "agent-001"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001"], { cwd: dir });
  assert.match(
    runKvdf(["session", "end", "session-001", "--files", "src/ui/app.ts", "--summary", "Wrong scope"], { cwd: dir, expectFailure: true }).stderr,
    /not covered by an active task lock/
  );
  runKvdf(["session", "end", "session-001", "--files", "src/api/users.ts", "--summary", "Covered file"], { cwd: dir });
}));

test("token scopes block forbidden AI session files", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "agent-001", "--name", "AI Agent", "--role", "AI Developer"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Scoped session task"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "agent-001", "--allowed-files", "src/api/", "--forbidden-files", ".env,secrets/"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "agent-001"], { cwd: dir });
  assert.match(runKvdf(["session", "end", "session-001", "--files", ".env", "--summary", "Bad file"], { cwd: dir, expectFailure: true }).stderr, /forbidden/);
  assert.match(runKvdf(["session", "end", "session-001", "--files", "src/ui/app.ts", "--summary", "Out of scope"], { cwd: dir, expectFailure: true }).stderr, /outside token scope/);
  runKvdf(["session", "end", "session-001", "--files", "src/api/users.ts", "--summary", "Scoped file"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/session-001.handoff.md")));
}));

test("dashboard export creates static html", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Dashboard task"], { cwd: dir });
  runKvdf(["app", "create", "--username", "acme", "--name", "ACME Portal", "--status", "ready_to_demo"], { cwd: dir });
  runKvdf(["app", "create", "--username", "acme-admin", "--name", "ACME Admin", "--status", "draft"], { cwd: dir });
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Public signup", "--readiness", "needs_review", "--tasks", "task-001", "--audience", "Visitors"], { cwd: dir });
  runKvdf(["app", "status", "acme", "--features", "feature-001"], { cwd: dir });
  runKvdf(["feature", "status", "feature-001", "--readiness", "ready_to_demo"], { cwd: dir });
  runKvdf(["journey", "create", "--id", "journey-001", "--name", "Signup journey", "--audience", "Visitors", "--steps", "Landing,Signup,Welcome"], { cwd: dir });
  runKvdf(["app", "status", "acme", "--journeys", "journey-001"], { cwd: dir });
  runKvdf(["journey", "status", "journey-001", "--status", "ready_to_show", "--ready-to-show"], { cwd: dir });
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const clientHtml = fs.readFileSync(path.join(dir, "client.html"), "utf8");
  assert.match(clientHtml, /Kabeeri Client Portal/);
  assert.match(clientHtml, /\/customer\/apps\/acme/);
  assert.doesNotMatch(clientHtml, /\/customer\/apps\/\d+/);
  assert.doesNotMatch(clientHtml, /Kabeeri VDF Dashboard/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/site/customer/apps/acme/index.html")));
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.apps[0].username, "acme");
  assert.strictEqual(state.task_tracker.summary.total, 1);
  assert.strictEqual(state.task_tracker.tasks[0].id, "task-001");
  assert.match(runKvdf(["dashboard", "task-tracker"], { cwd: dir }).stdout, /task_tracker_state/);
  assert.match(runKvdf(["task", "tracker"], { cwd: dir }).stdout, /Task Tracker Live State/);
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json")));
  const trackerFile = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json"), "utf8"));
  assert.strictEqual(trackerFile.live_api_path, "/__kvdf/api/tasks");
  assert.strictEqual(state.business.app_summaries.length, 2);
  assert.strictEqual(state.business.app_summaries.find((item) => item.username === "acme").ready_features, 1);
  assert.strictEqual(state.workspaces[0].current, true);
  assert.strictEqual(state.workspaces[0].apps_total, 2);
  assert.strictEqual(state.business.customer_apps[0].public_url, "/customer/apps/acme");
  const html = fs.readFileSync(path.join(dir, "dashboard.html"), "utf8");
  assert.match(html, /Kabeeri VDF Dashboard/);
  assert.match(html, /\/__kvdf\/api\/state/);
  assert.match(html, /Applications/);
  assert.match(html, /Task Tracker Live Board/);
  assert.match(html, /\/__kvdf\/api\/tasks/);
  assert.match(html, /Live Reports/);
  assert.match(html, /\/__kvdf\/api\/reports/);
  assert.match(html, /Action Center/);
  assert.match(html, /\.kabeeri is the source of truth/);
  assert.match(html, /table-wrap/);
  assert.match(html, /KVDF Workspaces/);
  assert.match(html, /App Boundary Governance/);
  assert.match(html, /same_product_multi_app/);
  assert.match(html, /app-filter/);
  assert.match(html, /Dashboard task/);
  assert.match(html, /Feature Readiness/);
  assert.match(html, /ready_to_demo/);
  assert.match(html, /User Journeys/);
  assert.match(html, /Signup journey/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /feature records checked/);
  assert.match(runKvdf(["validate", "business"], { cwd: dir }).stdout, /journey records checked/);
  const uxAudit = JSON.parse(runKvdf(["dashboard", "ux", "--json"], { cwd: dir }).stdout);
  assert.ok(["pass", "needs_attention"].includes(uxAudit.status));
  assert.ok(uxAudit.checks.some((check) => check.id === "action_center" && check.status));
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/dashboard_ux_report.md")));
  assert.match(runKvdf(["validate", "dashboard"], { cwd: dir }).stdout, /dashboard UX audits checked/);
  const otherDir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-linked-"));
  try {
    runKvdf(["init"], { cwd: otherDir });
    runKvdf(["app", "create", "--username", "linked-app", "--name", "Linked App"], { cwd: otherDir });
    runKvdf(["dashboard", "workspace", "add", "--path", otherDir, "--name", "Linked Workspace"], { cwd: dir });
    assert.match(runKvdf(["dashboard", "workspace", "list"], { cwd: dir }).stdout, /Linked Workspace/);
    const linkedState = JSON.parse(runKvdf(["dashboard", "state", "--workspaces", otherDir], { cwd: dir }).stdout);
    assert.strictEqual(linkedState.workspaces.length, 2);
    assert.ok(linkedState.workspaces.some((item) => item.root === otherDir && item.apps_total === 1));
    const configuredState = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
    assert.ok(configuredState.workspaces.some((item) => item.root === otherDir && item.name === "Kabeeri VDF"));
  } finally {
    fs.rmSync(otherDir, { recursive: true, force: true });
  }
}));

test("policy engine evaluates task gates and writes reports", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Policy task", "--acceptance", "Owner checks result"], { cwd: dir });
  assert.match(runKvdf(["policy", "list"], { cwd: dir }).stdout, /task_verification_policy/);
  const result = JSON.parse(runKvdf(["policy", "evaluate", "--task", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(result.status, "blocked");
  assert.ok(result.blockers.some((item) => item.check_id === "output_contract_complete"));
  assert.match(runKvdf(["policy", "status"], { cwd: dir }).stdout, /task-001/);
  const status = JSON.parse(runKvdf(["policy", "status", "--json"], { cwd: dir }).stdout);
  assert.ok(status.results.some((item) => item.policy_id === "task_verification_policy" && item.subject_id === "task-001"));
  assert.match(
    runKvdf(["policy", "gate", "--task", "task-001"], { cwd: dir, expectFailure: true }).stderr,
    /Policy gate blocked/
  );
  const stored = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/policies/policy_results.json"), "utf8"));
  assert.ok(stored.results.length >= 2);
  assert.match(runKvdf(["validate", "policy"], { cwd: dir }).stdout, /policy results checked/);
  runKvdf(["policy", "report", "--output", "policy.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "policy.md"), "utf8"), /Kabeeri Policy Report/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Policy Results/);
}));

test("readiness and governance reports export independent status", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Prepare checkout readiness", "--workstream", "backend"], { cwd: dir });
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Checkout", "--readiness", "needs_review", "--tasks", "task-001"], { cwd: dir });
  const readiness = JSON.parse(runKvdf(["readiness", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(readiness.report_type, "readiness");
  assert.match(readiness.status, /warning|blocked|ready/);
  assert.ok(readiness.summary.open_tasks >= 1);
  const governance = JSON.parse(runKvdf(["governance", "report", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(governance.report_type, "governance");
  assert.ok(governance.summary.workstreams >= 1);
  const live = JSON.parse(runKvdf(["reports", "live", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(live.live_json_path, ".kabeeri/reports/live_reports_state.json");
  assert.strictEqual(live.live_api_path, "/__kvdf/api/reports");
  assert.strictEqual(live.reports.readiness.report_type, "readiness");
  assert.strictEqual(live.reports.governance.report_type, "governance");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/reports/live_reports_state.json")));
  assert.match(runKvdf(["reports", "show", "task_tracker"], { cwd: dir }).stdout, /task_tracker_state/);
  runKvdf(["readiness", "report", "--output", "readiness.md"], { cwd: dir });
  runKvdf(["governance", "report", "--output", "governance.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "readiness.md"), "utf8"), /Kabeeri Readiness Report/);
  assert.match(fs.readFileSync(path.join(dir, "governance.md"), "utf8"), /Kabeeri Governance Report/);
}));

test("policy gates cover release handoff security and migration scopes", () => withTempDir((dir) => {
  const env = { KVDF_OWNER_PASSPHRASE: "secret-pass" };
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Owner"], { cwd: dir, env });
  assert.match(runKvdf(["policy", "list"], { cwd: dir }).stdout, /release_policy/);
  runKvdf(["security", "scan", "--include", ".kabeeri/project.json"], { cwd: dir });
  const securityGate = JSON.parse(runKvdf(["policy", "gate", "--scope", "security"], { cwd: dir }).stdout);
  assert.strictEqual(securityGate.policy_id, "security_policy");
  assert.notStrictEqual(securityGate.status, "blocked");
  const releaseGate = JSON.parse(runKvdf(["policy", "gate", "--scope", "release", "--version", "v4.0.0"], { cwd: dir }).stdout);
  assert.strictEqual(releaseGate.policy_id, "release_policy");
  assert.notStrictEqual(releaseGate.status, "blocked");
  const publishGates = JSON.parse(runKvdf(["release", "publish-gate", "--version", "v4.0.0"], { cwd: dir }).stdout);
  assert.strictEqual(publishGates.releaseGate.policy_id, "release_policy");
  assert.strictEqual(publishGates.githubGate.policy_id, "github_write_policy");
  assert.notStrictEqual(publishGates.releaseGate.status, "blocked");
  assert.notStrictEqual(publishGates.githubGate.status, "blocked");
  runKvdf(["migration", "plan", "--id", "migration-001", "--title", "Checkout schema", "--scope", "database/orders", "--reason", "Add order metadata", "--risk", "high", "--backup", "backup-001"], { cwd: dir });
  runKvdf(["migration", "rollback-plan", "--plan", "migration-001", "--backup", "backup-001"], { cwd: dir });
  runKvdf(["migration", "check", "migration-001", "--owner-approved"], { cwd: dir });
  const migrationGate = JSON.parse(runKvdf(["policy", "gate", "--scope", "migration", "--plan", "migration-001"], { cwd: dir }).stdout);
  assert.strictEqual(migrationGate.policy_id, "migration_policy");
  assert.notStrictEqual(migrationGate.status, "blocked");
  fs.writeFileSync(path.join(dir, ".env"), "STRIPE_SECRET_KEY=sk_test_12345678901234567890\n", "utf8");
  runKvdf(["security", "scan", "--include", ".env"], { cwd: dir });
  assert.match(runKvdf(["policy", "gate", "--scope", "security"], { cwd: dir, expectFailure: true }).stderr, /Policy gate blocked/);
  assert.match(runKvdf(["policy", "gate", "--scope", "release", "--version", "v4.0.0"], { cwd: dir, expectFailure: true }).stderr, /latest_security_scan_not_blocked/);
}));

test("cost-aware execution creates context packs and preflights", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["pricing", "set", "--provider", "openai", "--model", "gpt-4", "--unit", "1K", "--input", "0.01", "--output", "0.03", "--cached", "0.001"], { cwd: dir });
  runKvdf(["workstream", "add", "--id", "payments", "--name", "Payments", "--paths", "app/Http/Controllers,tests/Feature,docs/payment.md"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Implement payment checkout", "--workstream", "payments", "--acceptance", "Checkout flow is reviewed"], { cwd: dir });
  const pack = JSON.parse(runKvdf(["context-pack", "create", "--task", "task-001", "--allowed-files", "app/Http/Controllers/,tests/Feature/", "--specs", "docs/payment.md", "--provider", "openai", "--model", "gpt-4", "--input-tokens", "2000", "--output-tokens", "500"], { cwd: dir }).stdout);
  assert.strictEqual(pack.task_id, "task-001");
  assert.strictEqual(pack.context_pack_id, "ctx-001");
  assert.ok(fs.existsSync(path.join(dir, ".kabeeri/ai_usage/ctx-001.context.md")));
  assert.match(runKvdf(["context-pack", "list"], { cwd: dir }).stdout, /ctx-001/);
  const route = JSON.parse(runKvdf(["model-route", "recommend", "--kind", "implementation", "--risk", "high"], { cwd: dir }).stdout);
  assert.strictEqual(route.recommended_model_class, "premium");
  const preflight = JSON.parse(runKvdf(["preflight", "estimate", "--task", "task-001", "--context", "ctx-001", "--provider", "openai", "--model", "gpt-4"], { cwd: dir }).stdout);
  assert.strictEqual(preflight.context_pack_id, "ctx-001");
  assert.strictEqual(preflight.approval_required, true);
  assert.match(runKvdf(["preflight", "list"], { cwd: dir }).stdout, /preflight-001/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.context_packs.length, 1);
  assert.strictEqual(state.records.cost_preflights.length, 1);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Cost Preflights/);
}));

test("handoff package generates client and owner reports", () => withTempDir((dir) => {
  runKvdf(["init", "--profile", "standard", "--mode", "agile"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build public catalog", "--acceptance", "Owner can browse catalog"], { cwd: dir });
  runKvdf(["feature", "create", "--id", "feature-001", "--title", "Public catalog", "--readiness", "ready_to_demo", "--tasks", "task-001", "--audience", "Customers"], { cwd: dir });
  runKvdf(["journey", "create", "--id", "journey-001", "--name", "Catalog browsing", "--steps", "Home,Catalog,Product"], { cwd: dir });
  runKvdf(["journey", "status", "journey-001", "--status", "ready_to_show", "--ready-to-show"], { cwd: dir });
  runKvdf(["usage", "record", "--task", "task-001", "--developer", "agent-001", "--provider", "openai", "--model", "gpt-4", "--input-tokens", "1000", "--output-tokens", "500", "--cost", "0.10"], { cwd: dir });
  assert.match(runKvdf(["handoff", "package", "--id", "handoff-001", "--audience", "client"], { cwd: dir }).stdout, /Generated handoff package handoff-001/);
  for (const file of [
    "00_INDEX.md",
    "01_BUSINESS_SUMMARY.md",
    "02_TECHNICAL_SUMMARY.md",
    "03_FEATURE_READINESS.md",
    "04_PRODUCTION_PUBLISH_STATUS.md",
    "05_AI_COST_SUMMARY.md",
    "06_NEXT_ROADMAP.md"
  ]) {
    assert.ok(fs.existsSync(path.join(dir, ".kabeeri/handoff/handoff-001", file)), `${file} should exist`);
  }
  assert.match(fs.readFileSync(path.join(dir, ".kabeeri/handoff/handoff-001/01_BUSINESS_SUMMARY.md"), "utf8"), /Public catalog/);
  assert.match(runKvdf(["handoff", "list"], { cwd: dir }).stdout, /handoff-001/);
  const shown = JSON.parse(runKvdf(["handoff", "show", "handoff-001"], { cwd: dir }).stdout);
  assert.strictEqual(shown.audience, "client");
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.handoff_packages.length, 1);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Handoff Packages/);
}));

test("security governance scans reports and blocks gates", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "config"), { recursive: true });
  fs.writeFileSync(path.join(dir, "config", "safe.txt"), "APP_NAME=Demo\n", "utf8");
  assert.strictEqual(JSON.parse(runKvdf(["security", "scan", "--include", "config/"], { cwd: dir }).stdout).status, "pass");
  fs.writeFileSync(path.join(dir, ".env"), "STRIPE_SECRET_KEY=sk_test_1234567890abcdef1234567890\n", "utf8");
  const blocked = JSON.parse(runKvdf(["security", "scan", "--include", ".env"], { cwd: dir }).stdout);
  assert.strictEqual(blocked.status, "blocked");
  assert.ok(blocked.findings.some((item) => item.rule_id === "stripe_secret_key"));
  assert.match(
    runKvdf(["security", "gate", "--include", ".env"], { cwd: dir, expectFailure: true }).stderr,
    /Security gate blocked/
  );
  runKvdf(["security", "report", "--id", blocked.scan_id, "--output", "security.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "security.md"), "utf8"), /Security Scan Report/);
  assert.match(runKvdf(["security", "list"], { cwd: dir }).stdout, /blocked/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.ok(state.records.security_scans.length >= 2);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Security Scans/);
}));

test("migration safety creates plans rollback checks and reports", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  const plan = JSON.parse(runKvdf(["migration", "plan", "--id", "migration-001", "--title", "Upgrade checkout schema", "--from", "v1", "--to", "v2", "--scope", "database,migrations", "--risk", "high"], { cwd: dir }).stdout);
  assert.strictEqual(plan.plan_id, "migration-001");
  assert.strictEqual(plan.risk_level, "high");
  assert.match(
    JSON.parse(runKvdf(["migration", "check", "migration-001"], { cwd: dir }).stdout).status,
    /blocked/
  );
  const rollback = JSON.parse(runKvdf(["migration", "rollback-plan", "--plan", "migration-001", "--backup", "backup-001", "--steps", "restore backup,run rollback,verify checkout"], { cwd: dir }).stdout);
  assert.strictEqual(rollback.plan_id, "migration-001");
  const checked = JSON.parse(runKvdf(["migration", "check", "migration-001", "--owner-approved"], { cwd: dir }).stdout);
  assert.notStrictEqual(checked.status, "blocked");
  runKvdf(["migration", "report", "migration-001", "--output", "migration.md"], { cwd: dir });
  assert.match(fs.readFileSync(path.join(dir, "migration.md"), "utf8"), /Migration Safety Report/);
  assert.match(runKvdf(["migration", "list"], { cwd: dir }).stdout, /migration-001/);
  assert.match(runKvdf(["migration", "audit"], { cwd: dir }).stdout, /migration\.check/);
  runKvdf(["dashboard", "export", "--output", "client.html", "--dashboard-output", "dashboard.html"], { cwd: dir });
  const state = JSON.parse(runKvdf(["dashboard", "state"], { cwd: dir }).stdout);
  assert.strictEqual(state.records.migration_plans.length, 1);
  assert.ok(state.records.migration_checks.length >= 2);
  assert.match(fs.readFileSync(path.join(dir, "dashboard.html"), "utf8"), /Migration Safety/);
}));

test("customer app routes use username instead of numeric ids", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["app", "create", "--username", "3", "--name", "Numeric App"], { cwd: dir, expectFailure: true }).stderr,
    /cannot be numeric IDs/
  );
  assert.match(runKvdf(["app", "create", "--username", "customer-one", "--name", "Customer One", "--type", "frontend", "--path", "apps/customer-one"], { cwd: dir }).stdout, /\/customer\/apps\/customer-one/);
  const app = JSON.parse(runKvdf(["app", "show", "customer-one"], { cwd: dir }).stdout);
  assert.strictEqual(app.username, "customer-one");
  assert.strictEqual(app.public_url, "/customer/apps/customer-one");
  assert.strictEqual(app.path, "apps/customer-one");
  assert.strictEqual(app.app_type, "frontend");
  assert.ok(!Object.prototype.hasOwnProperty.call(app, "slug"));
  assert.match(runKvdf(["validate", "routes"], { cwd: dir }).stdout, /customer app records checked/);
}));

test("app boundary governance blocks unrelated apps and out-of-bound files", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["app", "create", "--username", "backend-api", "--name", "Laravel API", "--type", "backend", "--path", "apps/api-laravel", "--product", "Store"], { cwd: dir });
  runKvdf(["app", "create", "--username", "storefront", "--name", "React Storefront", "--type", "frontend", "--path", "apps/storefront-react", "--product", "Store"], { cwd: dir });
  assert.match(
    runKvdf(["app", "create", "--username", "booking", "--name", "Booking App", "--type", "frontend", "--path", "apps/booking", "--product", "Booking"], { cwd: dir, expectFailure: true }).stderr,
    /separate product/
  );
  assert.match(
    runKvdf(["app", "create", "--username", "crm", "--name", "CRM", "--separate-product"], { cwd: dir, expectFailure: true }).stderr,
    /Separate products/
  );
  runKvdf(["agent", "add", "--id", "frontend-agent", "--name", "Frontend Agent", "--role", "AI Developer", "--workstreams", "public_frontend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Build storefront", "--app", "storefront", "--workstream", "public_frontend"], { cwd: dir });
  const task = JSON.parse(runKvdf(["task", "status", "task-001"], { cwd: dir }).stdout);
  assert.strictEqual(task.app_username, "storefront");
  assert.deepStrictEqual(task.app_paths, ["apps/storefront-react"]);
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "frontend-agent"], { cwd: dir });
  runKvdf(["token", "issue", "--task", "task-001", "--assignee", "frontend-agent"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "apps/storefront-react", "--task", "task-001", "--owner", "frontend-agent"], { cwd: dir });
  runKvdf(["session", "start", "--id", "session-001", "--task", "task-001", "--developer", "frontend-agent"], { cwd: dir });
  assert.match(
    runKvdf(["session", "end", "session-001", "--files", "apps/api-laravel/routes/api.php", "--summary", "Wrong app"], { cwd: dir, expectFailure: true }).stderr,
    /outside task app boundary/
  );
  runKvdf(["session", "end", "session-001", "--files", "apps/storefront-react/src/App.jsx", "--summary", "Updated storefront"], { cwd: dir });
  assert.match(runKvdf(["validate", "workspace"], { cwd: dir }).stdout, /app boundary governance checked/);
}));

test("vscode scaffold creates workspace task files", () => withTempDir((dir) => {
  runKvdf(["vscode", "scaffold"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, ".vscode/tasks.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/extensions.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/kvdf.commands.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/kvdf-extension/package.json")));
  assert.ok(fs.existsSync(path.join(dir, ".vscode/kvdf-extension/extension.js")));
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".vscode/tasks.json"), "utf8"));
  assert.ok(tasks.tasks.some((task) => task.label === "KVDF: Validate"));
  const extensionPackage = JSON.parse(fs.readFileSync(path.join(dir, ".vscode/kvdf-extension/package.json"), "utf8"));
  assert.ok(extensionPackage.contributes.commands.some((command) => command.command === "kvdf.openDashboard"));
  assert.match(fs.readFileSync(path.join(dir, ".vscode/kvdf-extension/extension.js"), "utf8"), /createWebviewPanel/);
  assert.match(runKvdf(["vscode", "status"], { cwd: dir }).stdout, /present/);
}));

test("generator scaffolds project and exports prompt pack", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["generate", "--profile", "standard", "--output", "my-project"], { cwd: dir });
  runKvdf(["prompt-pack", "export", "react", "--output", "my-project/07_AI_CODE_PROMPTS/react"], { cwd: dir });
  runKvdf(["prompt-pack", "use", "vue", "--output", "my-project/07_AI_CODE_PROMPTS/vue"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "my-project/kabeeri.generated.json")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/07_AI_CODE_PROMPTS/react/prompt_pack_manifest.json")));
  assert.ok(fs.existsSync(path.join(dir, "my-project/07_AI_CODE_PROMPTS/vue/prompt_pack_manifest.json")));
  const tasks = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/tasks.json"), "utf8")).tasks;
  assert.ok(tasks.some((task) => task.source === "generator" && task.generated_output === "my-project"));
  const tracker = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/dashboard/task_tracker_state.json"), "utf8"));
  assert.ok(tracker.summary.total >= 3);
}));

test("create shortcut accepts profile and command aliases", () => withTempDir((dir) => {
  runKvdf(["create", "--profile", "lite", "--output", "lite-project"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "lite-project/kabeeri.generated.json")));
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--title", "Alias task"], { cwd: dir });
  assert.match(runKvdf(["tasks", "list"], { cwd: dir }).stdout, /Alias task/);
  assert.match(runKvdf(["dash", "generate"], { cwd: dir }).stdout, /dashboard/i);
}));

test("questionnaire export and acceptance review are implemented", () => withTempDir((dir) => {
  runKvdf(["questionnaire", "create", "--group", "core", "--output", "owner-questions"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "owner-questions/core/00_SYSTEM_INDEX/00_FOLDER_OWNER_QUESTIONNAIRE_EN.docx")));
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Acceptance task"], { cwd: dir });
  runKvdf(["acceptance", "create", "--task", "task-001", "--criteria", "Reviewed by Owner"], { cwd: dir });
  assert.match(runKvdf(["acceptance", "review", "acceptance-001", "--reviewer", "reviewer-001", "--result", "pass", "--notes", "Looks good"], { cwd: dir }).stdout, /pass/);
  runKvdf(["acceptance", "create", "--type", "release", "--version", "v4.0.0"], { cwd: dir });
  runKvdf(["acceptance", "create", "--type", "task-completion", "--issue", "7"], { cwd: dir });
  assert.match(runKvdf(["acceptance", "list"], { cwd: dir }).stdout, /v4\.0\.0/);
  assert.match(runKvdf(["acceptance", "list"], { cwd: dir }).stdout, /7/);
  assert.match(runKvdf(["validate", "task"], { cwd: dir }).stdout, /task records checked/);
  assert.match(runKvdf(["validate", "acceptance"], { cwd: dir }).stdout, /acceptance records checked/);
}));

test("design source governance blocks raw sources until approved text spec exists", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf([
    "design", "add",
    "--id", "design-source-001",
    "--type", "figma",
    "--location", "https://figma.example/file/checkout",
    "--owner", "Client",
    "--use", "Checkout page",
    "--mode", "assisted",
    "--missing", "responsive,empty-state"
  ], { cwd: dir });
  let audit = JSON.parse(runKvdf(["design", "audit", "design-source-001"], { cwd: dir }).stdout);
  assert.strictEqual(audit.status, "blocked");
  assert.ok(audit.blockers.some((blocker) => blocker.includes("snapshot is missing")));
  assert.ok(audit.blockers.some((blocker) => blocker.includes("approved text spec is missing")));
  runKvdf(["design", "snapshot", "design-source-001", "--reference", "checkout-export-v1", "--captured-by", "designer-001"], { cwd: dir });
  runKvdf(["design", "missing-report", "--source", "design-source-001", "--items", "responsive,empty-state", "--risk", "high"], { cwd: dir });
  runKvdf(["design", "spec-create", "--source", "design-source-001", "--title", "Checkout page", "--output", "frontend_specs/checkout.page.md", "--questions", "confirm mobile layout"], { cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "frontend_specs/checkout.page.md")));
  assert.match(runKvdf(["design", "spec-list"], { cwd: dir }).stdout, /text-spec-001/);
  runKvdf(["design", "spec-approve", "text-spec-001", "--tokens", "design_system/tokens.json"], { cwd: dir });
  runKvdf(["design", "page-create", "--spec", "text-spec-001", "--name", "Checkout page", "--output", "frontend_specs/checkout.page.md", "--states", "loading,empty,error,success"], { cwd: dir });
  assert.match(runKvdf(["design", "page-list"], { cwd: dir }).stdout, /page-spec-001/);
  runKvdf(["design", "page-approve", "page-spec-001"], { cwd: dir });
  runKvdf(["design", "component-create", "--page", "page-spec-001", "--name", "CheckoutSummary", "--variants", "default,compact"], { cwd: dir });
  assert.match(runKvdf(["design", "component-list"], { cwd: dir }).stdout, /component-contract-001/);
  runKvdf(["design", "component-approve", "component-contract-001"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Implement checkout UI", "--workstream", "public_frontend"], { cwd: dir });
  let gate = JSON.parse(runKvdf(["design", "gate", "--task", "task-001", "--page", "page-spec-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(gate.status, "blocked");
  assert.ok(gate.blockers.some((blocker) => blocker.includes("passing visual review")));
  const visualReview = JSON.parse(runKvdf(["design", "visual-review", "--page", "page-spec-001", "--task", "task-001", "--screenshots", "desktop.png,mobile.png", "--checks", "responsive,states,accessibility", "--decision", "pass", "--reviewer", "designer-001"], { cwd: dir }).stdout);
  assert.strictEqual(visualReview.decision, "pass");
  assert.match(runKvdf(["design", "visual-review-list"], { cwd: dir }).stdout, /visual-review-001/);
  gate = JSON.parse(runKvdf(["design", "gate", "--task", "task-001", "--page", "page-spec-001", "--json"], { cwd: dir }).stdout);
  assert.strictEqual(gate.status, "pass");
  audit = JSON.parse(runKvdf(["design", "audit", "design-source-001"], { cwd: dir }).stdout);
  assert.strictEqual(audit.status, "pass");
  assert.match(runKvdf(["design", "list"], { cwd: dir }).stdout, /design-source-001/);
  const state = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/sources.json"), "utf8"));
  assert.strictEqual(state.sources[0].approval_status, "approved");
  const reports = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/missing_reports.json"), "utf8"));
  assert.strictEqual(reports.reports[0].risk, "high");
  const pages = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/page_specs.json"), "utf8"));
  assert.strictEqual(pages.pages[0].status, "approved");
  const components = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/component_contracts.json"), "utf8"));
  assert.strictEqual(components.components[0].status, "approved");
  const visualReviews = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/design_sources/visual_reviews.json"), "utf8"));
  assert.strictEqual(visualReviews.reviews[0].review_id, "visual-review-001");
  assert.match(runKvdf(["validate", "design"], { cwd: dir }).stdout, /design visual reviews checked/);
}));

test("audit list and report expose workspace events", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Audited task"], { cwd: dir });
  assert.match(runKvdf(["audit", "list"], { cwd: dir }).stdout, /task.created/);
  runKvdf(["audit", "report", "--output", "audit.md"], { cwd: dir });
  const report = fs.readFileSync(path.join(dir, "audit.md"), "utf8");
  assert.match(report, /Kabeeri Audit Report/);
  assert.match(report, /Audited task/);
}));

test("github and release commands are dry-run without confirm", () => {
  assert.match(runKvdf(["github", "issue", "sync", "--version", "v4.0.0", "--dry-run"]).stdout, /No remote GitHub changes were made/);
  assert.match(runKvdf(["release", "check", "--version", "v4.0.0"]).stdout, /Validation: OK/);
  assert.match(runKvdf(["release", "publish", "--version", "v4.0.0"]).stdout, /No remote GitHub changes were made/);
});

test("confirmed github writes are blocked by policy gate before gh writes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["github", "issue", "sync", "--version", "v4.0.0", "--confirm"], { cwd: dir, expectFailure: true }).stderr,
    /Policy gate blocked/
  );
  const stored = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/policies/policy_results.json"), "utf8"));
  assert.ok(stored.results.some((item) => item.policy_id === "github_write_policy" && item.subject_id === "github issue sync"));
  assert.match(runKvdf(["policy", "status"], { cwd: dir }).stdout, /github_write_policy/);
  assert.match(runKvdf(["validate", "policy"], { cwd: dir }).stdout, /policy definitions checked/);
}));

test("confirmed github release publish is blocked by release gate before gh writes", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  assert.match(
    runKvdf(["github", "release", "publish", "--version", "v4.0.0", "--confirm"], { cwd: dir, expectFailure: true }).stderr,
    /Policy gate blocked/
  );
  const stored = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/policies/policy_results.json"), "utf8"));
  assert.ok(stored.results.some((item) => item.policy_id === "release_policy" && item.subject_id === "v4.0.0"));
  assert.ok(!stored.results.some((item) => item.policy_id === "github_write_policy" && item.subject_id === "github release publish"));
}));

test("release scenario review inspects multi-ai workspace", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["owner", "init", "--id", "owner-001", "--name", "Owner", "--passphrase", "secret"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "backend-agent", "--name", "Backend Agent", "--role", "AI Developer", "--workstreams", "backend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "frontend-agent", "--name", "Frontend Agent", "--role", "AI Developer", "--workstreams", "public_frontend"], { cwd: dir });
  runKvdf(["agent", "add", "--id", "admin-agent", "--name", "Admin Agent", "--role", "AI Developer", "--workstreams", "admin_frontend"], { cwd: dir });
  runKvdf(["task", "create", "--id", "task-001", "--title", "Backend scenario task", "--workstream", "backend"], { cwd: dir });
  runKvdf(["task", "approve", "task-001"], { cwd: dir });
  runKvdf(["task", "assign", "task-001", "--assignee", "backend-agent"], { cwd: dir });
  runKvdf(["lock", "create", "--type", "folder", "--scope", "src/api", "--task", "task-001", "--owner", "backend-agent"], { cwd: dir });
  const report = runKvdf(["release", "scenario", "--version", "v4.0.0"], { cwd: dir }).stdout;
  assert.match(report, /Multi-AI Collaboration Scenario Review/);
  assert.match(report, /backend: 1 tasks, 1 agents/);
  assert.match(report, /No scenario risks detected/);
}));

test("github sync config is locally manageable", () => withTempDir((dir) => {
  runKvdf(["init"], { cwd: dir });
  runKvdf(["github", "config", "set", "--repo", "owner/repo", "--branch", "main", "--default-version", "v4.0.0"], { cwd: dir });
  const output = runKvdf(["github", "config", "show"], { cwd: dir }).stdout;
  assert.match(output, /owner\/repo/);
  assert.match(output, /v4\.0\.0/);
  const config = JSON.parse(fs.readFileSync(path.join(dir, ".kabeeri/github/sync_config.json"), "utf8"));
  assert.strictEqual(config.write_requires_confirmation, true);
}));

let failed = 0;
for (const item of tests) {
  try {
    item.fn();
    console.log(`OK ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${item.name}`);
    console.error(error.stack || error.message);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} integration tests passed.`);
}
